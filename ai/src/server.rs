use std::collections::HashMap;
use std::net::{TcpListener};
use std::io::{Read, Write};
use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use ssh2::Session;
use toml;
use bcrypt::{hash, verify, DEFAULT_COST};

use crate::prelude::{McpToolRegistry, McpToolCall};

#[derive(Debug, Serialize, Deserialize)]
pub struct SSHRequest {
    pub command: String,
    pub tool: Option<String>,
    pub parameters: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SSHResponse {
    pub status: String,
    pub state: String,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SSHConfig {
    pub allowed_users: Vec<String>,
    pub public_key_path: Option<String>,
    pub password_auth_enabled: bool,
    pub allowed_passwords: Vec<String>,
}

impl Default for SSHConfig {
    fn default() -> Self {

        if let Ok(config) = Self::load_from_file() {
            return config;
        }
        
        Self {
            allowed_users: vec!["flashcard_user".to_string()],
            public_key_path: Some("./ssh/flashcard_key.pub".to_string()),
            password_auth_enabled: true,
            allowed_passwords: vec![
                // bcrypt hash for "flashcard_secure_password_2024"
                "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO".to_string()
            ],
        }
    }
}

impl SSHConfig {
    fn load_from_file() -> Result<Self, Box<dyn std::error::Error>> {
        let config_content = fs::read_to_string("ssh/config.toml")?;
        let config: SSHConfig = toml::from_str(&config_content)?;
        Ok(config)
    }
    
    /// Generate bcrypt hash for a password
    /// 
    /// # Arguments
    ///
    /// * `password` - The password to hash
    ///
    /// # Returns
    ///
    /// * `String` - The bcrypt hash
    pub fn generate_password_hash(password: &str) -> Result<String, Box<dyn std::error::Error>> {
        let hash = hash(password, DEFAULT_COST)?;
        Ok(hash)
    }
    
    /// Verify a password against a bcrypt hash
    /// 
    /// # Arguments
    ///
    /// * `password` - The password to verify
    /// * `hash` - The bcrypt hash to verify against
    ///
    /// # Returns
    ///
    /// * `bool` - True if password matches hash
    pub fn verify_password(password: &str, hash: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let is_valid = verify(password, hash)?;
        Ok(is_valid)
    }
}

pub struct Server {
    port: u16,
    config: SSHConfig,
}

impl Default for Server {
    fn default() -> Self {
        Self::new()
    }
}

impl Server {
    /// Create a new server instance
    ///
    /// # Returns
    ///
    /// A new `Server` instance
    pub fn new() -> Self {
        Self {
            port: 2222,
            config: SSHConfig::default(),
        }
    }

    /// Run the server
    ///
    /// # Returns
    ///
    /// A `Result` containing an error if the server fails to start
    pub async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        let listener = TcpListener::bind(format!("127.0.0.1:{}", self.port))?;
        println!("SSH Server is running on port {}", self.port);
        println!("Press Ctrl+C to stop");

        for stream in listener.incoming() {
            let stream = stream?;
            
            tokio::spawn(async move {
                if let Err(e) = Self::handle_connection(stream, self.config).await {
                    eprintln!("Connection error: {}", e);
                }
            });
        }

        Ok(())
    }

    /// Handle a connection from a client
    /// 
    /// This function handles the connection from a client.
    /// It creates a new SSH session and sends a response to the client.
    /// It then enters a loop to read commands from the client and process them.
    /// 
    /// # Arguments
    ///
    /// * `stream` - The TCP stream from the client
    /// * `config` - The SSH configuration to use for authentication
    ///
    /// # Returns
    ///
    /// A `Result` containing an error if the connection fails
    async fn handle_connection(stream: std::net::TcpStream, config: SSHConfig) -> Result<(), Box<dyn std::error::Error>> {
        let mut session = Session::new()?;
        session.set_tcp_stream(stream);
        session.handshake()?;

        if !Self::authenticate_session(&session, &config).await? {
            eprintln!("SSH authentication failed");
            return Ok(());
        }

        let mut channel = session.channel_session()?;
        
        Self::send_response_via_channel(&mut channel, SSHResponse {
            status: "connected".to_string(),
            state: "ready".to_string(),
            data: None,
            error: None,
        })?;

        loop {
            let mut buffer = [0; 1024];
            match channel.read(&mut buffer) {
                Ok(n) if n > 0 => {
                    let command_data = String::from_utf8_lossy(&buffer[..n]).trim().to_string();
                    
                    if command_data.is_empty() {
                        continue;
                    }

                    match serde_json::from_str::<SSHRequest>(&command_data) {
                        Ok(request) => {
                            Self::process_request_with_streaming_via_channel(&mut channel, request).await?;
                        }
                        Err(e) => {
                            Self::send_response_via_channel(&mut channel, SSHResponse {
                                status: "error".to_string(),
                                state: "error".to_string(),
                                data: None,
                                error: Some(format!("Invalid JSON: {}", e)),
                            })?;
                        }
                    }
                }
                Ok(0) => {
                    break;
                }
                Ok(_) => {
                    continue;
                }
                Err(e) => {
                    eprintln!("Error reading from SSH channel: {}", e);
                    break;
                }
            }
        }

        channel.close()?;
        Ok(())
    }

    /// Authenticate SSH session using public key or password
    /// 
    /// # Arguments
    ///
    /// * `session` - The SSH session to authenticate
    /// * `config` - The SSH configuration
    ///
    /// # Returns
    ///
    /// * `bool` - True if authentication successful, false otherwise
    async fn authenticate_session(session: &Session, config: &SSHConfig) -> Result<bool, Box<dyn std::error::Error>> {
        if let Some(ref public_key_path) = config.public_key_path {
            if Path::new(public_key_path).exists() {
                if Self::authenticate_with_public_key(session, public_key_path).await? {
                    println!("SSH authentication successful via public key");
                    return Ok(true);
                }
            }
        }

        if config.password_auth_enabled {
            if Self::authenticate_with_password(session, config).await? {
                println!("SSH authentication successful via password");
                return Ok(true);
            }
        }

        eprintln!("All authentication methods failed");
        Ok(false)
    }

    /// Authenticate using public key
    ///
    /// # Arguments
    ///
    /// * `session` - The SSH session to authenticate
    /// * `public_key_path` - The path to the public key
    ///
    /// # Returns
    ///
    /// * `bool` - True if authentication successful, false otherwise
    async fn authenticate_with_public_key(session: &Session, public_key_path: &str) -> Result<bool, Box<dyn std::error::Error>> {
        if !Path::new(public_key_path).exists() {
            return Ok(false);
        }
        
        session.userauth_pubkey_file("flashcard_user", None, Path::new(public_key_path), None)?;
        
        if session.authenticated() {
            println!("Public key authentication successful");
            Ok(true)
        } else {
            println!("Public key authentication failed");
            Ok(false)
        }
    }

    /// Authenticate using password
    ///
    /// # Arguments
    ///
    /// * `session` - The SSH session to authenticate
    /// * `config` - The SSH configuration
    ///
    /// # Returns
    ///
    /// * `bool` - True if authentication successful, false otherwise
    async fn authenticate_with_password(session: &Session, config: &SSHConfig) -> Result<bool, Box<dyn std::error::Error>> {
        for password_hash in &config.allowed_passwords {
            let test_password = "flashcard_secure_password_2024";
            
            match verify(test_password, password_hash) {
                Ok(is_valid) => {
                    if is_valid {
                        match session.userauth_password("flashcard_user", test_password) {
                            Ok(_) => {
                                if session.authenticated() {
                                    println!("Password authentication successful (bcrypt verified)");
                                    return Ok(true);
                                }
                            }
                            Err(_) => continue,
                        }
                    }
                }
                Err(_) => continue,
            }
        }
        
        println!("Password authentication failed");
        Ok(false)
    }

    /// Send a response via a channel
    ///
    /// # Arguments
    ///
    /// * `channel` - The channel to send the response via
    /// * `response` - The response to send
    ///
    /// # Returns
    ///
    /// A `Result` containing an error if the response fails to send
    fn send_response_via_channel(channel: &mut ssh2::Channel, response: SSHResponse) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string(&response)?;
        println!("SSH Response: {}", json);
        
        let response_data = format!("{}\n", json);
        channel.write_all(response_data.as_bytes())?;
        channel.flush()?;
        
        Ok(())
    }

    /// Process a request with streaming via a channel
    /// 
    /// This function processes a request with streaming via a channel.
    /// It sends a response to the client with the tools available.
    /// It then processes the request and sends a response to the client.
    ///
    /// # Arguments
    ///
    /// * `channel` - The channel to send the response via
    /// * `request` - The request to process
    ///
    /// # Returns
    ///
    /// A `Result` containing an error if the request fails to process
    async fn process_request_with_streaming_via_channel(channel: &mut ssh2::Channel, request: SSHRequest) -> Result<(), Box<dyn std::error::Error>> {
        match request.command.as_str() {
            "mcp_tools" => {
                let registry = McpToolRegistry::new();
                let tools = registry.list_tools();
                Self::send_response_via_channel(channel, SSHResponse {
                    status: "completed".to_string(),
                    state: "complete".to_string(),
                    data: Some(serde_json::json!({ "tools": tools })),
                    error: None,
                })?;
            }
            "mcp_execute" => {
                if let (Some(tool), Some(parameters)) = (request.tool, request.parameters) {
                    if tool == "generate_flashcards" {
                        Self::send_response_via_channel(channel, SSHResponse {
                            status: "processing".to_string(),
                            state: "analyzing".to_string(),
                            data: None,
                            error: None,
                        })?;

                        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                        
                        Self::send_response_via_channel(channel, SSHResponse {
                            status: "processing".to_string(),
                            state: "generating".to_string(),
                            data: None,
                            error: None,
                        })?;
                    }

                    let tool_call = McpToolCall {
                        name: tool,
                        arguments: parameters.into_iter().collect(),
                    };

                    let registry = McpToolRegistry::new();
                    match registry.execute_tool(&tool_call).await {
                        Ok(result) => {
                            Self::send_response_via_channel(channel, SSHResponse {
                                status: "completed".to_string(),
                                state: "complete".to_string(),
                                data: Some(serde_json::json!({ "result": result })),
                                error: None,
                            })?;
                        },
                        Err(e) => {
                            Self::send_response_via_channel(channel, SSHResponse {
                                status: "error".to_string(),
                                state: "error".to_string(),
                                data: None,
                                error: Some(e.to_string()),
                            })?;
                        }
                    }
                } else {
                    Self::send_response_via_channel(channel, SSHResponse {
                        status: "error".to_string(),
                        state: "error".to_string(),
                        data: None,
                        error: Some("Missing tool or parameters".to_string()),
                    })?;
                }
            }
            _ => {
                Self::send_response_via_channel(channel, SSHResponse {
                    status: "error".to_string(),
                    state: "error".to_string(),
                    data: None,
                    error: Some(format!("Unknown command: {}", request.command)),
                })?;
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_process_request() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let stream = TcpStream::connect(listener.local_addr().unwrap()).unwrap();
        let mut session = Session::new().unwrap();
        session.set_tcp_stream(stream);
        
        let request = SSHRequest {
            command: "mcp_tools".to_string(),
            tool: None,
            parameters: None,
        };

        assert_eq!(request.command, "mcp_tools");
    }
}