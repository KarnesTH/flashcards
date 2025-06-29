use std::fs;
use std::path::Path;

/// Loads the generation rules for flashcards
/// 
/// # Returns
/// 
/// * `Result<String, Box<dyn std::error::Error>>` - The rules as a string
pub fn load_generation_rules() -> Result<String, Box<dyn std::error::Error>> {
    load_rule_file("rules/generate_rule.md")
}

/// Loads rules for cards without a deck
/// 
/// # Returns
/// 
/// * `Result<String, Box<dyn std::error::Error>>` - The rules as a string
pub fn load_card_only_rules() -> Result<String, Box<dyn std::error::Error>> {
    load_rule_file("rules/card_only_rule.md")
}

/// Loads rules for text analysis
/// 
/// # Returns
/// 
/// * `Result<String, Box<dyn std::error::Error>>` - The rules as a string
pub fn load_text_analysis_rules() -> Result<String, Box<dyn std::error::Error>> {
    load_rule_file("rules/text_analysis_rule.md")
}

/// Loads rules for image analysis
/// 
/// # Returns
/// 
/// * `Result<String, Box<dyn std::error::Error>>` - The rules as a string
pub fn load_image_analysis_rules() -> Result<String, Box<dyn std::error::Error>> {
    load_rule_file("rules/image_analysis_rule.md")
}

/// Loads rules for explanations
/// 
/// # Returns
/// 
/// * `Result<String, Box<dyn std::error::Error>>` - The rules as a string
pub fn load_explanation_rules() -> Result<String, Box<dyn std::error::Error>> {
    load_rule_file("rules/explanation_rule.md")
}

/// Generic function to load rule files
/// 
/// # Arguments
/// 
/// * `rule_path` - The path to the rule file
/// 
/// # Returns
/// 
/// * `Result<String, Box<dyn std::error::Error>>` - The rules as a string
fn load_rule_file(rule_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let path = Path::new(rule_path);
    if path.exists() {
        let rules = fs::read_to_string(path)?;
        Ok(rules)
    } else {
        Err(format!("Rules file not found: {}", rule_path).into())
    }
}

#[derive(Debug, Clone)]
pub enum RuleType {
    Generate,
    CardOnly,
    TextAnalysis,
    ImageAnalysis,
    Explanation,
}

impl RuleType {
    /// Loads the corresponding rules based on the type
    /// 
    /// # Arguments
    /// 
    /// * `self` - The RuleType enum
    /// 
    /// # Returns
    /// 
    /// * `Result<String, Box<dyn std::error::Error>>` - The rules as a string
    pub fn load_rules(&self) -> Result<String, Box<dyn std::error::Error>> {
        match self {
            RuleType::Generate => load_generation_rules(),
            RuleType::CardOnly => load_card_only_rules(),
            RuleType::TextAnalysis => load_text_analysis_rules(),
            RuleType::ImageAnalysis => load_image_analysis_rules(),
            RuleType::Explanation => load_explanation_rules(),
        }
    }
} 