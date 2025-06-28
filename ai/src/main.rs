use ai::prelude::*;
use clap::Parser;

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.commands {
        Commands::Generate { prompt, model, language } => {
            if let Some(model) = model {
                println!("Generating flashcards with prompt: {}", prompt);
                println!("Using model: {:?}", model);
            } else {
                println!("Generating flashcards...");
            }

            let assistant = OllamaAssistant::default();
            let response = assistant.generate_flashcards(
                &prompt, 
                &language.unwrap_or("de".to_string())
            ).await;
            match response {
                Ok(response) => {
                    println!("Generated flashcards:");
                    println!("{}", response.response);
                }
                Err(e) => {
                    println!("Error: {}", e);
                }
            }
        }
        Commands::Serve => {
            println!("Starting server...");
            let server = Server::new();
            server.run().await.unwrap();
        }
        Commands::Nlp { answer, user_answer, benchmark, verbose } => {
            let answer_clone = answer.clone();
            let user_answer_clone = user_answer.clone();
            
            if let Some(iterations) = benchmark {
                println!("🚀 Running NLP benchmark with {} iterations...", iterations);
                println!("Answer: '{}'", answer);
                println!("User Answer: '{}'", user_answer);
                println!();
                
                let mut total_time = std::time::Duration::ZERO;
                let mut results = Vec::new();
                
                for i in 0..iterations {
                    let start = std::time::Instant::now();
                    let answer_clone = answer.clone();
                    let user_answer_clone = user_answer.clone();
                    
                    let similarity = tokio::task::spawn_blocking(move || {
                        let assistant = NlpAssistant::new().unwrap();
                        assistant.check_answer_correctness(&answer_clone, &user_answer_clone).unwrap()
                    }).await.unwrap();
                    
                    let duration = start.elapsed();
                    total_time += duration;
                    results.push(similarity);
                    
                    if verbose {
                        println!("Iteration {}: {:.6} (took {:?})", i + 1, similarity, duration);
                    }
                }
                
                let avg_time = total_time / iterations as u32;
                let avg_similarity = results.iter().sum::<f32>() / results.len() as f32;
                let min_similarity = results.iter().fold(f32::INFINITY, |a, &b| a.min(b));
                let max_similarity = results.iter().fold(f32::NEG_INFINITY, |a, &b| a.max(b));
                
                println!();
                println!("📊 Benchmark Results:");
                println!("  Total iterations: {}", iterations);
                println!("  Average time: {:?}", avg_time);
                println!("  Total time: {:?}", total_time);
                println!("  Average similarity: {:.6}", avg_similarity);
                println!("  Min similarity: {:.6}", min_similarity);
                println!("  Max similarity: {:.6}", max_similarity);
                println!("  Throughput: {:.2} requests/second", 
                    iterations as f64 / total_time.as_secs_f64());
            } else {
                let start = std::time::Instant::now();
                
                let similarity = tokio::task::spawn_blocking(move || {
                    let assistant = NlpAssistant::new().unwrap();
                    assistant.check_answer_correctness(&answer_clone, &user_answer_clone).unwrap()
                }).await.unwrap();
                
                let duration = start.elapsed();
                
                if verbose {
                    println!("⏱️  Processing time: {:?}", duration);
                }
                
                println!("Similarity: {:.6}", similarity);
            }
        }
        Commands::ListModels => {
            let assistant = OllamaAssistant::default();
            let models = assistant.list_models().await.unwrap();
            println!("Available models:");
            for model in models.models {
                println!("- {}", model.name);
            }
        }
        Commands::IsModelAvailable { model } => {
            let assistant = OllamaAssistant::default();
            let is_available = assistant.is_model_available(&model).await.unwrap();
            println!("Is model {}, available: {}", model, is_available);
        }
    }
}
