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
    #[clap(about = "Test the NLP functionality of the AI API.")]
    Nlp {
        #[clap(short, long, help = "The answer to check.")]
        answer: String,
        #[clap(short, long, help = "The user's answer to check.")]
        user_answer: String,
        #[clap(short, long, help = "Run performance benchmark with multiple iterations.")]
        benchmark: Option<usize>,
        #[clap(short, long, help = "Show detailed timing information.")]
        verbose: bool,
    },
    #[clap(about = "List all available models on the Ollama server.")]
    ListModels,
    #[clap(about = "Check if a model is available on the Ollama server.")]
    IsModelAvailable {
        #[clap(short, long, help = "The name of the model to check.")]
        model: String,
    },
}