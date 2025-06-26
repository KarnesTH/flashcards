use ai::prelude::*;
use clap::Parser;

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.commands {
        Commands::Generate { prompt, model, language } => {
            if let Some(model) = model {
                println!("Generating flashcards with prompt: {}", prompt);
                println!("Using model: {:?}", model);
            } else {
                println!("Generating flashcards...");
            }

            let assistant = OllamaAssistant::default();
            let response = assistant.generate_flashcards(&prompt, &language.unwrap_or("de".to_string())).await;
            match response {
                Ok(response) => {
                    println!("Generated flashcards:");
                    println!("{}", response.response);
                }
                Err(e) => {
                    println!("Error: {}", e);
                }
            }
        }
        Commands::Serve => {
            println!("Starting server...");
            let server = Server::new();
            server.run().await.unwrap();
        }
        Commands::Nlp { answer, user_answer } => {
            let answer_clone = answer.clone();
            let user_answer_clone = user_answer.clone();
            
            let similarity = tokio::task::spawn_blocking(move || {
                let assistant = NlpAssistant::new().unwrap();
                assistant.get_answer_similarity(&answer_clone, &user_answer_clone).unwrap()
            }).await.unwrap();
            
            println!("Similarity: {}", similarity);
        }
    }
}
