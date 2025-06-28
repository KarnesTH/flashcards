use std::collections::HashMap;

use axum::{
    http::StatusCode, routing::{get, post}, Json, Router
};
use chrono::{DateTime, Utc};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

use crate::prelude::{NlpAssistant, OllamaAssistant};

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
            .route("/models", get(list_models));

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
    let response = assistant.generate_flashcards(&payload["prompt"], "de").await
        .map_err(|e| {
            println!("Error generating flashcards: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
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
    let models = assistant.list_models().await.unwrap();
    Ok(Json(serde_json::json!({
        "models": models.models.iter().map(|model| model.name.clone()).collect::<Vec<String>>()
    })))
}