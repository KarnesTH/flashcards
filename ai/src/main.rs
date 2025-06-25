use ai::prelude::*;
use clap::Parser;

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.commands {
        Commands::Generate { prompt, mode } => {
            println!("Generating with prompt: {} and mode: {}", prompt, mode);
        }
        Commands::Serve => {
            println!("Starting server...");
            let server = Server::new();
            server.run().await.unwrap();
        }
    }
}
