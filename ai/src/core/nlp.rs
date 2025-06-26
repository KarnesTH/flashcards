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