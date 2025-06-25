use std::collections::HashMap;

use axum::{
    routing::{get}, Json, Router
};

pub struct Server {
    router: Router,
}

impl Server {
    pub fn new() -> Self {
        let router = Router::new()
            .route("/", get(index));

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

pub async fn index() -> Json<HashMap<String, String>> {
    Json(HashMap::from([
        ("message".to_string(), "Hello, World!".to_string())
    ]))
}