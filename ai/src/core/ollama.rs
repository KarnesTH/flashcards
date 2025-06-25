use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::fs;
use std::path::Path;

#[derive(Debug)]
pub struct OllamaAssistant {
    client: Client,
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
        Self {
            client: Client::new(),
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
    /// # Arguments
    ///
    /// * `prompt` - The prompt describing what flashcards to generate
    ///
    /// # Returns
    /// 
    /// * `GenerateResponse` - The response from the OllamaAssistant
    pub async fn generate_flashcards(&self, prompt: &str) -> Result<GenerateResponse, Box<dyn std::error::Error>> {
        let rules = Self::load_generation_rules()?;
        
        let full_prompt = format!(
            "{}\n\n## User Request\n{}\n\nGenerate flashcards according to the rules above. Return only the JSON response.",
            rules,
            prompt
        );

        let request = GenerateRequest {
            model: "mistral".to_string(),
            prompt: full_prompt,
        };

        let url = "http://localhost:11434/api/generate".to_string();

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
            final_resp.response = full_response;
            Ok(final_resp)
        } else {
            Err("No complete response received".into())
        }
    }
}
