use std::collections::HashMap;

use axum::{
    http::StatusCode, routing::{get, post}, Json, Router
};
use chrono::{DateTime, Utc};

use crate::prelude::OllamaAssistant;

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
        let router = Router::new()
            .route("/", get(index))
            .route("/generate", post(generate_flashcards));

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

pub async fn index() -> Result<Json<HashMap<String, String>>, StatusCode> {
    Ok(Json(HashMap::from([
        ("message".to_string(), "Hello, World!".to_string()),
        ("status".to_string(), "success".to_string()),
        ("timestamp".to_string(), DateTime::<Utc>::from_timestamp(Utc::now().timestamp(), 0).unwrap().to_string())
    ])))
}

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