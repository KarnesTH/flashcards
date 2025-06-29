use serde::{Deserialize, Serialize};
use reqwest::Client;
use dotenv::dotenv;
use std::env;

use crate::utils::rules::{load_card_only_rules, load_explanation_rules, load_generation_rules, load_text_analysis_rules};

#[derive(Debug)]
pub struct OllamaAssistant {
    client: Client,
    host: String,
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
        
        Self {
            client: Client::new(),
            host: env::var("HOST").unwrap_or_else(|_| "localhost".to_string()),
        }
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
        let rules = load_generation_rules()?;
        let language_instruction = if language == "de" {
            "RESPOND IN GERMAN ONLY. Generate all content in German language."
        } else {
            "RESPOND IN ENGLISH ONLY. Generate all content in English language."
        };
        
        let full_prompt = format!(
            "{}\n\n## CRITICAL INSTRUCTIONS\n{}\n\n## User Request\n{}\n\nGenerate flashcards according to the rules above. Return only the JSON response.",
            rules,
            language_instruction,
            prompt
        );

        let request = GenerateRequest {
            model: "mistral".to_string(),
            prompt: full_prompt,
            stream: false,
            format: Some("json".to_string()),
        };

        self.send_request(&request).await
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
        let rules = load_card_only_rules()?;
        let language_instruction = if language == "de" {
            "RESPOND IN GERMAN ONLY."
        } else {
            "RESPOND IN ENGLISH ONLY."
        };
        
        let full_prompt = format!(
            "{}\n\n## INSTRUCTIONS\n{}\n\n## Request\n{}\n\nGenerate cards only. Return only the JSON response.",
            rules,
            language_instruction,
            prompt
        );

        let request = GenerateRequest {
            model: "mistral".to_string(),
            prompt: full_prompt,
            stream: false,
            format: Some("json".to_string()),
        };

        self.send_request(&request).await
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
        let rules = load_text_analysis_rules()?;
        let language_instruction = if language == "de" {
            "RESPOND IN GERMAN ONLY."
        } else {
            "RESPOND IN ENGLISH ONLY."
        };
        
        let full_prompt = format!(
            "{}\n\n## INSTRUCTIONS\n{}\n\n## Text to Analyze\n{}\n\nAnalyze the text and extract key concepts. Return only the JSON response.",
            rules,
            language_instruction,
            text
        );

        let request = GenerateRequest {
            model: "mistral".to_string(),
            prompt: full_prompt,
            stream: false,
            format: Some("json".to_string()),
        };

        self.send_request(&request).await
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
        let rules = load_explanation_rules()?;
        let language_instruction = if language == "de" {
            "RESPOND IN GERMAN ONLY."
        } else {
            "RESPOND IN ENGLISH ONLY."
        };
        
        let full_prompt = format!(
            "{}\n\n## INSTRUCTIONS\n{}\n\n## Question\n{}\n\nProvide a clear explanation. Return only the JSON response.",
            rules,
            language_instruction,
            question
        );

        let request = GenerateRequest {
            model: "mistral".to_string(),
            prompt: full_prompt,
            stream: false,
            format: Some("json".to_string()),
        };

        self.send_request(&request).await
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
        let res = self.client.post(url).json(request).send().await?;
        let data = res.text().await?;
        
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
            Err("No complete response received".into())
        }
    }

    /// Lists all available models on the Ollama-Server
    /// 
    /// # Returns
    /// 
    /// * `OllamaModels` - The list of available models
    pub async fn list_models(&self) -> Result<OllamaModels, Box<dyn std::error::Error>> {
        let url = format!("http://{}:11434/api/tags", self.host);
        let res = self.client.get(url).send().await?;
        let data = res.text().await?;

        let data_json: OllamaModels = serde_json::from_str(&data)?;
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
        let res = self.client.get(url).send().await;
        Ok(res.is_ok())
    }
}
