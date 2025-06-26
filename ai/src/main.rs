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
    }
}
