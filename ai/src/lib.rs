mod cli;
mod server;

pub mod prelude {
    pub use crate::cli::*;
    pub use crate::server::Server;
}