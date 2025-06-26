use clap::Parser;

#[derive(Parser)]
#[clap(
    author = "KarnesTH",
    version = env!("CARGO_PKG_VERSION"),
    about = "A CLI for testing AI functions"
)]
pub struct Cli {
    #[clap(subcommand)]
    pub commands: Commands,
}

#[derive(Parser)]
pub enum Commands {
    #[clap(about = "Test the generation functionality of the AI API.")]
    Generate {
        #[clap(short, long, help = "The prompt to generate flashcards for.")]
        prompt: String,
        #[clap(short, long, help = "The model to use for generation.")]
        model: Option<String>,
        #[clap(short, long, help = "The language to generate flashcards for.")]
        language: Option<String>,
    },
    #[clap(about = "Serve a HTTP server for the AI API.")]
    Serve,
}