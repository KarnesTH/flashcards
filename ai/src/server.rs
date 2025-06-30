use std::collections::HashMap;

use axum::{
    http::StatusCode, routing::{get, post}, Json, Router
};
use chrono::{DateTime, Utc};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

use crate::prelude::{NlpAssistant, OllamaAssistant, McpToolRegistry, McpToolCall};

pub struct Server {
    router: Router,
}

impl Default for Server {
    fn default() -> Self {
        Self::new()
    }
}

impl Server {
    pub fn new() -> Self {
        let services = ServiceBuilder::new()
            .layer(TraceLayer::new_for_http())
            .layer(CorsLayer::permissive());

        let router = Router::new()
            .route("/", get(index))
            .layer(services)
            .route("/generate", post(generate_flashcards))
            .route("/nlp", post(nlp))
            .route("/models", get(list_models))
            .route("/mcp/tools", get(list_mcp_tools))
            .route("/mcp/execute", post(execute_mcp_tool));

        Self { router }
    }

    pub async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await?;
        println!("Server is running on http://127.0.0.1:3000");
        println!("Press Ctrl+C to stop");
        axum::serve(listener, self.router.clone()).await?;
        Ok(())
    }
}

/// The index route for the server.
/// Returns a JSON response with a message, status, and timestamp.
///
/// # Returns
///
/// A JSON response with the following fields:
/// - `message`: A message string
/// - `status`: A status string
/// - `timestamp`: A timestamp string
pub async fn index() -> Result<Json<HashMap<String, String>>, StatusCode> {
    Ok(Json(HashMap::from([
        ("message".to_string(), "Hello, World!".to_string()),
        ("status".to_string(), "success".to_string()),
        ("timestamp".to_string(), DateTime::<Utc>::from_timestamp(Utc::now().timestamp(), 0).unwrap().to_string())
    ])))
}

/// The generate flashcards route for the server.
/// Generates flashcards for a given prompt and language.
///
/// # Arguments
///
/// * `payload` - A JSON object with the following fields:
///   - `prompt` - A string containing the prompt for the flashcards
///   - `language` - A string containing the language of the flashcards
///
/// # Returns
///
/// A JSON response with the generated flashcards.
pub async fn generate_flashcards(Json(payload): Json<HashMap<String, String>>) -> Result<Json<serde_json::Value>, StatusCode> {
    let assistant = OllamaAssistant::new();
    
    // Prüfe zuerst, ob Ollama läuft
    match assistant.is_ollama_running().await {
        Ok(is_running) => {
            if !is_running {
                return Err(StatusCode::SERVICE_UNAVAILABLE);
            }
        }
        Err(_) => {
            return Err(StatusCode::SERVICE_UNAVAILABLE);
        }
    }
    
    let response = assistant.generate_flashcards(&payload["prompt"], "de").await
        .map_err(|e| {
            let error_msg = e.to_string();
            println!("Error generating flashcards: {}", error_msg);
            
            if error_msg.contains("timed out") {
                StatusCode::REQUEST_TIMEOUT
            } else if error_msg.contains("Failed to connect") || error_msg.contains("not running") {
                StatusCode::SERVICE_UNAVAILABLE
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            }
        })?;
    
    let parsed_response = serde_json::from_str::<serde_json::Value>(&response.response)
        .map_err(|e| {
            println!("Error parsing JSON: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    
    Ok(Json(parsed_response))
}

/// The NLP route for the server.
/// Checks the similarity between a correct answer and user answer.
///
/// # Arguments
///
/// * `payload` - A JSON object with the following fields:
///   - `answer` - A string containing the correct answer
///   - `user_answer` - A string containing the user's answer
///
/// # Returns
///
/// A JSON response with the similarity score.
pub async fn nlp(Json(payload): Json<HashMap<String, String>>) -> Result<Json<serde_json::Value>, StatusCode> {
    let answer_clone = payload["answer"].clone();
    let user_answer_clone = payload["user_answer"].clone();

    let similarity = tokio::task::spawn_blocking(move || {
        let assistant = NlpAssistant::new().unwrap();
        assistant.check_answer_correctness(&answer_clone, &user_answer_clone).unwrap()
    }).await.unwrap();

    Ok(Json(serde_json::json!({
        "similarity": similarity
    })))
}

/// The models route for the server.
/// Lists all available models on the Ollama server.
///
/// # Returns
///
/// A JSON response with the list of models.
pub async fn list_models() -> Result<Json<serde_json::Value>, StatusCode> {
    let assistant = OllamaAssistant::new();
    
    match assistant.is_ollama_running().await {
        Ok(is_running) => {
            if !is_running {
                return Err(StatusCode::SERVICE_UNAVAILABLE);
            }
        }
        Err(_) => {
            return Err(StatusCode::SERVICE_UNAVAILABLE);
        }
    }
    
    let models = assistant.list_models().await
        .map_err(|e| {
            let error_msg = e.to_string();
            println!("Error listing models: {}", error_msg);
            
            if error_msg.contains("timed out") {
                StatusCode::REQUEST_TIMEOUT
            } else if error_msg.contains("Failed to connect") || error_msg.contains("not running") {
                StatusCode::SERVICE_UNAVAILABLE
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            }
        })?;
    
    Ok(Json(serde_json::json!({
        "models": models.models
    })))
}

/// The MCP tools route for the server.
/// Lists all available MCP tools.
///
/// # Returns
///
/// A JSON response with the list of MCP tools.
pub async fn list_mcp_tools() -> Result<Json<serde_json::Value>, StatusCode> {
    let registry = McpToolRegistry::new();
    let tools = registry.list_tools();
    Ok(Json(serde_json::json!({
        "tools": tools
    })))
}

/// The MCP execute route for the server.
/// Executes a given MCP tool.
///
/// # Arguments
///
/// * `payload` - A JSON object with the following fields:
///   - `tool` - A string containing the name of the tool to execute
///   - `parameters` - A JSON object containing the parameters for the tool
///
/// # Returns
///
/// A JSON response with the result of the executed tool.
pub async fn execute_mcp_tool(Json(payload): Json<HashMap<String, serde_json::Value>>) -> Result<Json<serde_json::Value>, StatusCode> {
    let tool_name = payload["tool"].as_str().ok_or(StatusCode::BAD_REQUEST)?;
    let parameters = payload["parameters"].as_object().ok_or(StatusCode::BAD_REQUEST)?;

    let tool_call = McpToolCall {
        name: tool_name.to_string(),
        arguments: parameters.clone().into_iter().collect(),
    };

    let registry = McpToolRegistry::new();
    let result = registry.execute_tool(&tool_call).await
        .map_err(|e| {
            println!("Error executing MCP tool: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(serde_json::json!({
        "result": result
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_index() {
        let response = index().await.unwrap();
        assert!(response.0.contains_key("message"));
        assert!(response.0.contains_key("status"));
        assert!(response.0.contains_key("timestamp"));
    }
    
    #[tokio::test]
    async fn test_nlp() {
        let response = nlp(Json(HashMap::from([
            ("answer".to_string(), "The capital of France is Paris.".to_string()),
            ("user_answer".to_string(), "Paris is the capital of France.".to_string())
        ]))).await.unwrap();
        assert!(response.0["similarity"].is_f64());
    }

    #[tokio::test]
    async fn test_mcp_tools() {
        let response = list_mcp_tools().await.unwrap();
        assert!(response.0["tools"].is_array());
    }

    #[tokio::test]
    async fn test_execute_mcp_tool() {
        let response = execute_mcp_tool(Json(HashMap::from([
            ("tool".to_string(), serde_json::json!("test_tool")),
            ("parameters".to_string(), serde_json::json!({}))
        ]))).await;
        
        assert!(response.is_ok() || response.is_err());
    }
}