mod cli;
mod server;
mod core;
mod utils;

pub mod prelude {
    pub use crate::cli::*;
    pub use crate::server::Server;
    pub use crate::core::ollama::{OllamaAssistant, GenerationType};
    pub use crate::core::nlp::NlpAssistant;
    pub use crate::core::mcp_tools::*;
    pub use crate::utils::rules::*;
}