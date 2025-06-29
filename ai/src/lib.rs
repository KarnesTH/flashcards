mod cli;
mod server;
mod core;

pub mod prelude {
    pub use crate::cli::*;
    pub use crate::server::Server;
    pub use crate::core::ollama::OllamaAssistant;
    pub use crate::core::nlp::NlpAssistant;
    pub use crate::core::mcp_tools::*;
}