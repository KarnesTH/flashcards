use rust_bert::{pipelines::sentence_embeddings::{SentenceEmbeddingsBuilder, SentenceEmbeddingsModel, SentenceEmbeddingsModelType}, RustBertError};
use ndarray::Array1;

pub struct NlpAssistant {
    pub model: SentenceEmbeddingsModel,
}

impl NlpAssistant {
    /// Create a new NlpAssistant instance.
    ///
    /// # Returns
    ///
    /// A Result containing the NplAssistant instance or a RustBertError if the model creation fails.
    pub fn new() -> Result<Self, RustBertError> {
        let model = SentenceEmbeddingsBuilder::remote(SentenceEmbeddingsModelType::AllMiniLmL6V2)
            .create_model()?;
        Ok(Self { model })
    }

    /// Get the similarity score between a correct answer and user answer.
    ///
    /// # Arguments
    ///
    /// * `answer` - A string containing the correct answer.
    /// * `user_answer` - A string containing the user's answer to check.
    /// 
    /// # Returns
    /// 
    /// A Result containing a f32 similarity score between 0.0 and 1.0, or a RustBertError if the model fails.
    pub fn get_answer_similarity(&self, answer: &str, user_answer: &str) -> Result<f32, RustBertError> {        
        let embeddings = self.model.encode(&[answer, user_answer])?;
        let answer_embedding = Array1::from_vec(embeddings[0].clone());
        let user_answer_embedding = Array1::from_vec(embeddings[1].clone());

        let similarity = Self::cosine_similarity(&answer_embedding, &user_answer_embedding);

        Ok(similarity)
    }

    /// Calculate the cosine similarity between two vectors.
    ///
    /// # Arguments
    ///
    /// * `a` - A reference to the first vector.
    /// * `b` - A reference to the second vector.
    ///
    /// # Returns
    ///
    /// A f32 value representing the cosine similarity between the two vectors.
    fn cosine_similarity(a: &Array1<f32>, b: &Array1<f32>) -> f32 {
        let dot = a.dot(b);
        let norm_a = a.dot(a).sqrt();
        let norm_b = b.dot(b).sqrt();
        dot / (norm_a * norm_b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_similarity() {
        let a = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let b = Array1::from_vec(vec![4.0, 5.0, 6.0]);
        let similarity = NlpAssistant::cosine_similarity(&a, &b);
        assert_eq!(similarity, 0.9746318);
    }

    #[test]
    fn test_cosine_similarity_identical_vectors() {
        let a = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let b = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let similarity = NlpAssistant::cosine_similarity(&a, &b);
        assert!(similarity > 0.99);
    }

    #[test]
    fn test_cosine_similarity_orthogonal_vectors() {
        let a = Array1::from_vec(vec![1.0, 0.0, 0.0]);
        let b = Array1::from_vec(vec![0.0, 1.0, 0.0]);
        let similarity = NlpAssistant::cosine_similarity(&a, &b);
        assert_eq!(similarity, 0.0);
    }

    #[test]
    fn test_get_answer_similarity_identical() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity("The capital of France is Paris.", "The capital of France is Paris.").unwrap();
        assert_eq!(similarity, 1.0);
    }

    #[test]
    fn test_get_answer_similarity_similar_meaning() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity("The capital of France is Paris.", "Paris is the capital of France.").unwrap();
        assert!(similarity > 0.8);
    }

    #[test]
    fn test_get_answer_similarity_different_answer() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity("The capital of France is Paris.", "The capital of France is London.").unwrap();
        assert!(similarity > 0.8);
    }

    #[test]
    fn test_get_answer_similarity_completely_different() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity("The capital of France is Paris.", "A variable stores data in programming.").unwrap();
        assert!(similarity < 0.3);
    }

    #[test]
    fn test_get_answer_similarity_german_variables() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity(
            "Variablen werden verwendet, um Werte zu speichern.",
            "Eine Variable wird zum Speichern von Werten verwendet."
        ).unwrap();
        assert!(similarity > 0.7);
    }

    #[test]
    fn test_get_answer_similarity_german_different_concept() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity(
            "Variablen werden verwendet, um Werte zu speichern.",
            "Funktionen sind Code-Blöcke, die Aufgaben ausführen."
        ).unwrap();
        assert!(similarity < 0.4);
    }

    #[test]
    fn test_get_answer_similarity_partial_correct() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity(
            "Variables store data and can be reassigned.",
            "Variables store data."
        ).unwrap();
        assert!(similarity > 0.5 && similarity < 0.9);
    }

    #[test]
    fn test_get_answer_similarity_empty_strings() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity("", "").unwrap();
        assert_eq!(similarity, 1.0);
    }

    #[test]
    fn test_get_answer_similarity_one_empty_string() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity("A variable stores data.", "").unwrap();
        assert!(similarity < 0.1);
    }

    #[test]
    fn test_get_answer_similarity_very_long_texts() {
        let assistant = NlpAssistant::new().unwrap();
        let long_answer = "Variables are fundamental building blocks in programming that allow us to store and manipulate data. They provide a way to reference and modify values throughout the execution of a program. Variables can hold different types of data including numbers, text, and complex objects.";
        let user_answer = "Variables store data in programming and can hold different types of information.";
        let similarity = assistant.get_answer_similarity(long_answer, user_answer).unwrap();
        assert!(similarity > 0.6);
    }

    #[test]
    fn test_get_answer_similarity_code_examples() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity(
            "let x = 5; creates a variable named x with value 5",
            "let x = 5; assigns the value 5 to variable x"
        ).unwrap();
        assert!(similarity > 0.7);
    }

    #[test]
    fn test_get_answer_similarity_case_sensitivity() {
        let assistant = NlpAssistant::new().unwrap();
        let similarity = assistant.get_answer_similarity(
            "Variables store data",
            "VARIABLES STORE DATA"
        ).unwrap();
        assert!(similarity > 0.8);
    }
}