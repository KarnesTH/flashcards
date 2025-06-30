use serde::{Deserialize, Serialize};
use reqwest::Client;
use dotenv::dotenv;
use std::env;
use std::time::Duration;

use crate::utils::rules::{load_card_only_rules, load_explanation_rules, load_generation_rules, load_text_analysis_rules};

#[derive(Debug, Clone)]
pub enum GenerationType {
    Flashcards,
    CardsOnly,
    TextAnalysis,
    Explanation,
}

impl GenerationType {
    fn get_rules(&self) -> Result<String, Box<dyn std::error::Error>> {
        match self {
            GenerationType::Flashcards => load_generation_rules(),
            GenerationType::CardsOnly => load_card_only_rules(),
            GenerationType::TextAnalysis => load_text_analysis_rules(),
            GenerationType::Explanation => load_explanation_rules(),
        }
    }
    
    fn get_instruction(&self) -> &'static str {
        match self {
            GenerationType::Flashcards => "Generate flashcards according to the rules above. Return only the JSON response.",
            GenerationType::CardsOnly => "Generate cards only. Return only the JSON response.",
            GenerationType::TextAnalysis => "Analyze the text and extract key concepts. Return only the JSON response.",
            GenerationType::Explanation => "Provide a clear explanation. Return only the JSON response.",
        }
    }
    
    fn get_prompt_section(&self) -> &'static str {
        match self {
            GenerationType::Flashcards => "## User Request",
            GenerationType::CardsOnly => "## Request",
            GenerationType::TextAnalysis => "## Text to Analyze",
            GenerationType::Explanation => "## Question",
        }
    }
}

#[derive(Debug)]
pub struct OllamaAssistant {
    pub client: Client,
    pub host: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GenerateRequest {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
    pub format: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GenerateResponse {
    pub model: String,
    pub created_at: String,
    pub done: bool,
    pub response: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OllamaModels {
    pub models: Vec<OllamaModel>
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OllamaModel {
    pub name: String,
    pub model: String,
    pub modified_at: String,
    pub size: u64,
    pub digest: String,
    pub details: OllamaModelDetails,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OllamaModelDetails {
    pub parent_model: String,
    pub format: String,
    pub family: String,
    pub families: Vec<String>,
    pub parameter_size: String,
    pub quantization_level: String,
}

impl Default for OllamaAssistant {
    fn default() -> Self {
        Self::new()
    }
}

impl OllamaAssistant {
    /// Create a new OllamaAssistant with the default model "mistral"
    pub fn new() -> Self {
        dotenv().ok();
        
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .connect_timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");
        
        Self {
            client,
            host: env::var("HOST").unwrap_or_else(|_| "localhost".to_string()),
        }
    }

    /// Central generation function that handles all generation types
    /// 
    /// # Arguments
    ///
    /// * `prompt` - The prompt for generation
    /// * `language` - The language of the prompt ("de" or "en")
    /// * `generation_type` - The type of generation to perform
    ///
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the Ollama-Server
    pub async fn generate(&self, prompt: &str, language: &str, generation_type: GenerationType) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        let rules = generation_type.get_rules()?;
        let language_instruction = if language == "de" {
            "RESPOND IN GERMAN ONLY. Generate all content in German language."
        } else {
            "RESPOND IN ENGLISH ONLY. Generate all content in English language."
        };
        
        let full_prompt = format!(
            "{}\n\n## CRITICAL INSTRUCTIONS\n{}\n\n{} {}\n\n{}",
            rules,
            language_instruction,
            generation_type.get_prompt_section(),
            prompt,
            generation_type.get_instruction()
        );

        let request = GenerateRequest {
            model: "mistral".to_string(),
            prompt: full_prompt,
            stream: false,
            format: Some("json".to_string()),
        };

        self.send_request(&request).await
    }

    /// Generates flashcards based on the prompt and the language
    /// 
    /// # Arguments
    ///
    /// * `prompt` - The prompt for the flashcard generation
    /// * `language` - The language of the prompt ("de" or "en")
    ///
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the Ollama-Server
    pub async fn generate_flashcards(&self, prompt: &str, language: &str) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        self.generate(prompt, language, GenerationType::Flashcards).await
    }

    /// Generates cards only
    /// 
    /// # Arguments
    /// 
    /// * `prompt` - The prompt for the flashcard generation
    /// * `language` - The language of the prompt ("de" or "en")
    /// 
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the Ollama-Server
    pub async fn generate_cards_only(&self, prompt: &str, language: &str) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        self.generate(prompt, language, GenerationType::CardsOnly).await
    }

    /// Analyzes text and extracts key concepts
    /// 
    /// # Arguments
    /// 
    /// * `text` - The text to analyze
    /// * `language` - The language of the text ("de" or "en")
    /// 
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the Ollama-Server
    pub async fn analyze_text(&self, text: &str, language: &str) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        self.generate(text, language, GenerationType::TextAnalysis).await
    }

    /// Explains a concept or answers a question
    /// 
    /// # Arguments
    /// 
    /// * `question` - The question to explain
    /// * `language` - The language of the question ("de" or "en")
    /// 
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the Ollama-Server
    pub async fn explain_concept(&self, question: &str, language: &str) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        self.generate(question, language, GenerationType::Explanation).await
    }

    /// Sends a request to the Ollama-Server
    /// 
    /// # Arguments
    /// 
    /// * `request` - The request to send
    /// 
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the Ollama-Server
    async fn send_request(&self, request: &GenerateRequest) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        let url = format!("http://{}:11434/api/generate", self.host);
        
        if !self.is_ollama_running().await? {
            return Err("Ollama server is not running or not accessible".into());
        }
        
        let res = self.client.post(&url).json(request).send().await
            .map_err(|e| {
                if e.is_timeout() {
                    "Request to Ollama timed out after 30 seconds".to_string()
                } else if e.is_connect() {
                    "Failed to connect to Ollama server".to_string()
                } else {
                    format!("HTTP request failed: {}", e).to_string()
                }
            })?;
        
        let data = res.text().await
            .map_err(|e| format!("Failed to read response: {}", e))?;
        
        let mut full_response = String::new();
        let mut final_response = None;
        
        for line in data.lines() {
            if let Ok(stream_data) = serde_json::from_str::<GenerateResponse>(line) {
                full_response.push_str(&stream_data.response);
                
                if stream_data.done {
                    final_response = Some(stream_data);
                }
            }
        }
        
        if let Some(mut final_resp) = final_response {
            let cleaned_response = full_response.trim().to_string();
            final_resp.response = cleaned_response;
            Ok(final_resp)
        } else {
            Err("No complete response received from Ollama".into())
        }
    }

    /// Lists all available models on the Ollama-Server
    /// 
    /// # Returns
    /// 
    /// * `OllamaModels` - The list of available models
    pub async fn list_models(&self) -> Result<OllamaModels, Box<dyn std::error::Error>> {
        let url = format!("http://{}:11434/api/tags", self.host);
        
        if !self.is_ollama_running().await? {
            return Err("Ollama server is not running or not accessible".into());
        }
        
        let res = self.client.get(&url).send().await
            .map_err(|e| {
                if e.is_timeout() {
                    "Request to Ollama timed out after 30 seconds".to_string()
                } else if e.is_connect() {
                    "Failed to connect to Ollama server".to_string()
                } else {
                    format!("HTTP request failed: {}", e).to_string()
                }
            })?;
        
        let data = res.text().await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        let data_json: OllamaModels = serde_json::from_str(&data)
            .map_err(|e| format!("Failed to parse JSON response: {}", e))?;
        Ok(data_json)
    }

    /// Checks if a model is available on the Ollama-Server
    /// 
    /// # Arguments
    /// 
    /// * `model` - The name of the model to check
    /// 
    /// # Returns
    /// 
    /// * `bool` - True if the model is available, false otherwise
    pub async fn is_model_available(&self, model: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let models = self.list_models().await?;
        let is_available = models.models.iter().any(|m| m.name.contains(model));
        Ok(is_available)
    }

    /// Checks if the Ollama-Server is running
    /// 
    /// # Returns
    /// 
    /// * `bool` - True if the Ollama-Server is running, false otherwise
    pub async fn is_ollama_running(&self) -> Result<bool, Box<dyn std::error::Error>> {
        let url = format!("http://{}:11434/", self.host);
        match self.client.get(&url).send().await {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}
