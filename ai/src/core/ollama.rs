use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::fs;
use std::path::Path;
use dotenv::dotenv;
use std::env;

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

    /// Load the generation rules from the rules file
    fn load_generation_rules() -> Result<String, Box<dyn std::error::Error>> {
        let rules_path = Path::new("rules/generate_rule.md");
        if rules_path.exists() {
            let rules = fs::read_to_string(rules_path)?;
            Ok(rules)
        } else {
            Err("Rules file not found".into())
        }
    }

    /// Generate flashcards based on the provided prompt using the generation rules
    /// 
    /// This function will generate flashcards based on the provided prompt and language.
    /// The prompt is the user's request for the flashcards.
    /// The language is the language of the prompt.
    /// 
    /// The function will return a GenerateResponse object.
    /// 
    /// The GenerateResponse object will contain the flashcards in a JSON format.
    ///
    /// # Arguments
    ///
    /// * `prompt` - The prompt describing what flashcards to generate
    /// * `language` - The language of the prompt
    ///
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the OllamaAssistant
    pub async fn generate_flashcards(&self, prompt: &str, language: &str) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        // Prüfe zuerst ob Ollama läuft
        if !self.is_ollama_running().await? {
            return Err("Ollama server is not running".into());
        }

        // Prüfe ob das gewünschte Model verfügbar ist
        if !self.is_model_available("mistral").await? {
            return Err("Model 'mistral' is not available. Please install it with: ollama pull mistral".into());
        }

        let rules = Self::load_generation_rules()?;
        
        let is_german = language == "de";
        
        let language_instruction = if is_german {
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

        let url = format!("http://{}:11434/api/generate", self.host);

        let res = self.client.post(url).json(&request).send().await?;

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
            let cleaned_response = full_response
                .trim()
                .to_string();
            
            final_resp.response = cleaned_response;
            Ok(final_resp)
        } else {
            Err("No complete response received".into())
        }
    }

    /// List all available models on the Ollama server
    ///
    /// # Returns
    ///
    /// * `OllamaModels` - A vector of model names
    pub async fn list_models(&self) -> Result<OllamaModels, Box<dyn std::error::Error>> {
        let url = format!("http://{}:11434/api/tags", self.host);
        let res = self.client.get(url).send().await?;
        let data = res.text().await?;

        let data_json: OllamaModels = serde_json::from_str(&data)?;
        
        Ok(data_json)
    }

    /// Check if a model is available on the Ollama server
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

    /// Check if the Ollama server is running
    ///
    /// # Returns
    /// 
    /// * `bool` - True if the Ollama server is running, false otherwise
    pub async fn is_ollama_running(&self) -> Result<bool, Box<dyn std::error::Error>> {
        let url = format!("http://{}:11434/", self.host);
        let res = self.client.get(url).send().await;
        
        Ok(res.is_ok())
    }
}
