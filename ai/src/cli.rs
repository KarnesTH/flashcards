use clap::Parser;
use crate::core::ollama::GenerationType;

#[derive(Parser)]
#[clap(
    author = "KarnesTH",
    version = env!("CARGO_PKG_VERSION"),
    about = "A CLI for testing AI functions and development"
)]
pub struct Cli {
    #[clap(subcommand)]
    pub commands: Commands,
}

#[derive(Parser)]
pub enum Commands {
    #[clap(about = "Generate content using AI with different types")]
    Generate {
        #[clap(short, long, help = "The prompt to generate content for.")]
        prompt: String,
        #[clap(short, long, value_enum, default_value = "flashcards", help = "Type of generation")]
        generation_type: GenerationTypeCli,
        #[clap(short, long, default_value = "de", help = "Language (de/en)")]
        language: String,
        #[clap(short, long, help = "Show raw response instead of parsed JSON")]
        raw: bool,
        #[clap(short, long, help = "Run performance benchmark with multiple iterations")]
        benchmark: Option<usize>,
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
    #[clap(about = "Test AI service health and connectivity")]
    Health {
        #[clap(short, long, help = "Show detailed health information")]
        verbose: bool,
    },
    #[clap(about = "Test all generation types with a sample prompt")]
    TestAll {
        #[clap(short, long, help = "Custom test prompt")]
        prompt: Option<String>,
        #[clap(short, long, help = "Language for testing")]
        language: Option<String>,
    },
}

#[derive(Clone, Copy, Debug, clap::ValueEnum)]
pub enum GenerationTypeCli {
    Flashcards,
    CardsOnly,
    TextAnalysis,
    Explanation,
}

impl From<GenerationTypeCli> for GenerationType {
    fn from(cli_type: GenerationTypeCli) -> Self {
        match cli_type {
            GenerationTypeCli::Flashcards => GenerationType::Flashcards,
            GenerationTypeCli::CardsOnly => GenerationType::CardsOnly,
            GenerationTypeCli::TextAnalysis => GenerationType::TextAnalysis,
            GenerationTypeCli::Explanation => GenerationType::Explanation,
        }
    }
}