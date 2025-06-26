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

#[derive(Serialize, Deserialize, Debug)]
pub struct GenerateRequest {
    pub model: String,
    pub prompt: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GenerateResponse {
    pub model: String,
    pub created_at: String,
    pub done: bool,
    pub response: String,
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
            host: env::var("HOST").unwrap_or_else(|_| "http://localhost:11434".to_string()),
        }
    }

    /// Load the generation rules from the rules file
    ///
    /// # Returns
    ///
    /// * `String` - The rules from the file
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
                .trim_start_matches("```json")
                .trim_start_matches("```")
                .trim_end_matches("```")
                .trim()
                .to_string();
            
            final_resp.response = cleaned_response;
            Ok(final_resp)
        } else {
            Err("No complete response received".into())
        }
    }
}
