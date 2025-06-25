use ai::prelude::*;
use clap::Parser;

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.commands {
        Commands::Generate { prompt, mode } => {
            if let Some(mode) = mode {
                println!("Generating flashcards with prompt: {} and mode: {:?}", prompt, mode);
            } else {
                println!("Generating flashcards...");
            }

            let assistant = OllamaAssistant::default();
            let response = assistant.generate_flashcards(&prompt, "de").await;
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
