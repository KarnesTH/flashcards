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
    /// A Result containing the NlpAssistant instance or a RustBertError if the model creation fails.
    pub fn new() -> Result<Self, RustBertError> {
        let model = SentenceEmbeddingsBuilder::remote(SentenceEmbeddingsModelType::AllMiniLmL6V2)
            .create_model()?;
        Ok(Self { model })
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

    /// Get embeddings for two strings.
    ///
    /// # Arguments
    ///
    /// * `answer` - A string containing the correct answer.
    /// * `user_answer` - A string containing the user's answer.
    ///
    /// # Returns
    ///
    /// A Result containing the embeddings as Array1<f32> or a RustBertError.
    fn get_embeddings(&self, answer: &str, user_answer: &str) -> Result<(Array1<f32>, Array1<f32>), RustBertError> {
        let embeddings = self.model.encode(&[answer, user_answer])?;
        let answer_embedding = Array1::from_vec(embeddings[0].clone());
        let user_answer_embedding = Array1::from_vec(embeddings[1].clone());
        Ok((answer_embedding, user_answer_embedding))
    }

    /// Check the correctness of a user's answer by combining cosine similarity with distance penalty.
    ///
    /// # Arguments
    ///
    /// * `answer` - A string containing the correct answer.
    /// * `user_answer` - A string containing the user's answer to check.
    /// 
    /// # Returns
    /// 
    /// A Result containing a f32 correctness score between 0.0 and 1.0, or a RustBertError if the model fails.
    pub fn check_answer_correctness(&self, answer: &str, user_answer: &str) -> Result<f32, RustBertError> {
        if answer.is_empty() && user_answer.is_empty() {
            return Ok(1.0);
        }
        if answer.is_empty() || user_answer.is_empty() {
            return Ok(0.0);
        }

        let (answer_embedding, user_answer_embedding) = self.get_embeddings(answer, user_answer)?;
        let similarity = Self::cosine_similarity(&answer_embedding, &user_answer_embedding);

        let diff = answer_embedding - user_answer_embedding;
        let distance = diff.dot(&diff).sqrt();
        let penalty = distance.min(1.0);
        let adjusted_similarity = similarity - penalty * 0.8;
        let adjusted_similarity = adjusted_similarity.max(0.0);

        Ok(adjusted_similarity)
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
    fn test_check_answer_correctness_identical() {
        let assistant = NlpAssistant::new().unwrap();
        let correctness = assistant.check_answer_correctness(
            "The capital of France is Paris.",
            "The capital of France is Paris."
        ).unwrap();
        assert!(correctness > 0.8);
    }

    #[test]
    fn test_check_answer_correctness_similar_meaning() {
        let assistant = NlpAssistant::new().unwrap();
        let correctness = assistant.check_answer_correctness(
            "The capital of France is Paris.",
            "Paris is the capital of France."
        ).unwrap();
        assert!(correctness > 0.5);
    }

    #[test]
    fn test_check_answer_correctness_different_answer() {
        let assistant = NlpAssistant::new().unwrap();
        let correctness = assistant.check_answer_correctness(
            "The capital of France is Paris.",
            "The capital of France is London."
        ).unwrap();
        assert!(correctness > 0.3 && correctness < 0.8);
    }

    #[test]
    fn test_check_answer_correctness_completely_different() {
        let assistant = NlpAssistant::new().unwrap();
        let correctness = assistant.check_answer_correctness(
            "The capital of France is Paris.",
            "A variable stores data in programming."
        ).unwrap();
        assert!(correctness < 0.1);
    }

    #[test]
    fn test_check_answer_correctness_empty_strings() {
        let assistant = NlpAssistant::new().unwrap();
        let correctness = assistant.check_answer_correctness("", "").unwrap();
        assert_eq!(correctness, 1.0);
    }

    #[test]
    fn test_check_answer_correctness_one_empty_string() {
        let assistant = NlpAssistant::new().unwrap();
        let correctness = assistant.check_answer_correctness("The capital of France is Paris.", "").unwrap();
        assert_eq!(correctness, 0.0);
    }
}