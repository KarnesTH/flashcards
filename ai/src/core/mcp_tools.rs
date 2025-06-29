use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpTool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpToolCall {
    pub name: String,
    pub arguments: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpToolResult {
    pub content: Vec<McpContent>,
    pub is_error: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum McpContent {
    #[serde(rename = "text")]
    Text {
        text: String,
    },
    #[serde(rename = "flashcards")]
    Flashcards {
        cards: Vec<Flashcard>,
    },
    #[serde(rename = "evaluation")]
    Evaluation {
        score: f32,
        feedback: String,
        suggestions: Vec<String>,
    },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Flashcard {
    pub question: String,
    pub answer: String,
    pub difficulty: String,
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub explanation: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServerCapabilities {
    pub tools: Vec<McpTool>,
    pub resources: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpClientCapabilities {
    pub sampling: bool,
    pub roots: bool,
    pub elicitation: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpMessage {
    pub jsonrpc: String,
    pub id: Option<String>,
    pub method: Option<String>,
    pub params: Option<serde_json::Value>,
    pub result: Option<serde_json::Value>,
    pub error: Option<McpError>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

pub struct McpToolRegistry {
    tools: HashMap<String, McpTool>,
}

impl McpToolRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            tools: HashMap::new(),
        };
        
        registry.register_flashcard_tools();
        
        registry
    }

    /// Register the standard tools for the flashcards project
    ///
    /// # Arguments
    ///
    /// * `self` - The McpToolRegistry instance
    ///
    /// # Returns
    ///
    /// A McpToolRegistry instance with the standard tools registered
    fn register_flashcard_tools(&mut self) {
        let generate_tool = McpTool {
            name: "generate_flashcards".to_string(),
            description: "Generates flashcards from a given topic or text content".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The topic or content to generate flashcards from"
                    },
                    "language": {
                        "type": "string",
                        "enum": ["de", "en"],
                        "description": "Language for the flashcards"
                    },
                    "difficulty": {
                        "type": "string",
                        "enum": ["easy", "medium", "hard"],
                        "description": "Difficulty level of the flashcards"
                    },
                    "count": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 20,
                        "description": "Number of flashcards to generate"
                    }
                },
                "required": ["prompt", "language"]
            }),
        };

        let evaluate_tool = McpTool {
            name: "evaluate_answer".to_string(),
            description: "Evaluates a user's answer against the correct answer".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "correct_answer": {
                        "type": "string",
                        "description": "The correct answer"
                    },
                    "user_answer": {
                        "type": "string",
                        "description": "The user's answer to evaluate"
                    },
                    "question": {
                        "type": "string",
                        "description": "The question that was asked"
                    }
                },
                "required": ["correct_answer", "user_answer"]
            }),
        };

        let weakness_tool = McpTool {
            name: "detect_weaknesses".to_string(),
            description: "Analyzes learning patterns to detect weaknesses and suggest practice materials".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "learning_session": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "question": {"type": "string"},
                                "user_answer": {"type": "string"},
                                "correct_answer": {"type": "string"},
                                "was_correct": {"type": "boolean"}
                            }
                        },
                        "description": "Array of learning session results"
                    }
                },
                "required": ["learning_session"]
            }),
        };

        self.tools.insert(generate_tool.name.clone(), generate_tool);
        self.tools.insert(evaluate_tool.name.clone(), evaluate_tool);
        self.tools.insert(weakness_tool.name.clone(), weakness_tool);
    }

    /// Register a new tool
    /// 
    /// # Arguments
    /// 
    /// * `tool` - The tool to register
    /// 
    /// # Returns
    /// 
    /// A McpToolRegistry instance with the new tool registered
    pub fn register_tool(&mut self, tool: McpTool) {
        self.tools.insert(tool.name.clone(), tool);
    }

    /// Get a tool by name
    /// 
    /// # Arguments
    /// 
    /// * `name` - The name of the tool to get
    /// 
    /// # Returns
    /// 
    /// An Option containing the tool if it exists
    pub fn get_tool(&self, name: &str) -> Option<&McpTool> {
        self.tools.get(name)
    }

    /// List all available tools
    /// 
    /// # Returns
    /// 
    /// A Vec containing all available tools
    pub fn list_tools(&self) -> Vec<&McpTool> {
        self.tools.values().collect()
    }

    /// Execute a tool call
    /// 
    /// # Arguments
    /// 
    /// * `call` - The tool call to execute
    /// 
    /// # Returns
    /// 
    /// A Result containing the tool result or an error
    pub async fn execute_tool(&self, call: &McpToolCall) -> Result<McpToolResult, Box<dyn std::error::Error>> {
        match call.name.as_str() {
            "generate_flashcards" => self.execute_generate_flashcards(call).await,
            "evaluate_answer" => self.execute_evaluate_answer(call).await,
            "detect_weaknesses" => self.execute_detect_weaknesses(call).await,
            _ => Err(format!("Unknown tool: {}", call.name).into()),
        }
    }

    /// Implementation for flashcard generation
    /// 
    /// # Arguments
    /// 
    /// * `call` - The tool call to execute
    /// 
    /// # Returns
    /// 
    /// A Result containing the tool result or an error
    async fn execute_generate_flashcards(&self, call: &McpToolCall) -> Result<McpToolResult, Box<dyn std::error::Error>> {
        let _prompt = call.arguments.get("prompt")
            .and_then(|v| v.as_str())
            .ok_or("Missing prompt argument")?;
        
        let _language = call.arguments.get("language")
            .and_then(|v| v.as_str())
            .unwrap_or("de");

        // TODO: Integration with OllamaAssistant
        
        // Placeholder response
        let cards = vec![
            Flashcard {
                question: "Sample question".to_string(),
                answer: "Sample answer".to_string(),
                difficulty: "medium".to_string(),
                tags: vec!["sample".to_string()],
                explanation: None,
            }
        ];

        Ok(McpToolResult {
            content: vec![McpContent::Flashcards { cards }],
            is_error: false,
        })
    }

    /// Implementation for answer evaluation
    /// 
    /// # Arguments
    /// 
    /// * `call` - The tool call to execute
    /// 
    /// # Returns
    /// 
    /// A Result containing the tool result or an error
    async fn execute_evaluate_answer(&self, call: &McpToolCall) -> Result<McpToolResult, Box<dyn std::error::Error>> {
        let _correct_answer = call.arguments.get("correct_answer")
            .and_then(|v| v.as_str())
            .ok_or("Missing correct_answer argument")?;
        
        let _user_answer = call.arguments.get("user_answer")
            .and_then(|v| v.as_str())
            .ok_or("Missing user_answer argument")?;

        // TODO: Integration mit NlpAssistant
        
        // Placeholder response
        let similarity = 0.8;
        
        Ok(McpToolResult {
            content: vec![McpContent::Evaluation {
                score: similarity,
                feedback: "Good answer!".to_string(),
                suggestions: vec!["Consider adding more detail".to_string()],
            }],
            is_error: false,
        })
    }

    /// Implementation for weakness detection
    /// 
    /// # Arguments
    /// 
    /// * `call` - The tool call to execute
    /// 
    /// # Returns
    /// 
    /// A Result containing the tool result or an error
    async fn execute_detect_weaknesses(&self, _call: &McpToolCall) -> Result<McpToolResult, Box<dyn std::error::Error>> {
        
        Ok(McpToolResult {
            content: vec![McpContent::Text {
                text: "Weakness detection not yet implemented".to_string(),
            }],
            is_error: false,
        })
    }
}

impl Default for McpToolRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Helper functions for MCP integration
pub mod helpers {
    use super::*;

    /// Create a successful MCP response
    /// 
    /// # Arguments
    /// 
    /// * `id` - The ID of the message
    /// * `result` - The result of the tool call
    /// 
    /// # Returns
    /// 
    /// A McpMessage containing the success response
    pub fn create_success_response(id: Option<String>, result: serde_json::Value) -> McpMessage {
        McpMessage {
            jsonrpc: "2.0".to_string(),
            id,
            method: None,
            params: None,
            result: Some(result),
            error: None,
        }
    }

    /// Create an error MCP response
    /// 
    /// # Arguments
    /// 
    /// * `id` - The ID of the message
    /// * `code` - The error code
    /// * `message` - The error message
    /// 
    /// # Returns
    /// 
    /// A McpMessage containing the error response
    pub fn create_error_response(id: Option<String>, code: i32, message: String) -> McpMessage {
        McpMessage {
            jsonrpc: "2.0".to_string(),
            id,
            method: None,
            params: None,
            result: None,
            error: Some(McpError {
                code,
                message,
                data: None,
            }),
        }
    }

    /// Validate a tool call against the schema
    /// 
    /// # Arguments
    /// 
    /// * `tool` - The tool to validate
    /// * `call` - The tool call to validate
    /// 
    /// # Returns
    /// 
    /// A Result containing an error message if the tool call is invalid
    pub fn validate_tool_call(_tool: &McpTool, _call: &McpToolCall) -> Result<(), String> {
        // TODO: Implement schema validation
        // Here a JSON schema validation would take place
        Ok(())
    }
} 