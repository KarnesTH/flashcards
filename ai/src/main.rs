use ai::prelude::*;
use clap::Parser;

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.commands {
        Commands::Generate { prompt, generation_type, language, raw, benchmark } => {
            let assistant = OllamaAssistant::default();
            
            if let Some(iterations) = benchmark {
                println!("🚀 Running benchmark with {} iterations...", iterations);
                println!("Prompt: '{}'", prompt);
                println!("Type: {:?}", generation_type);
                println!("Language: {}", language);
                println!();
                
                let mut total_time = std::time::Duration::ZERO;
                let mut results = Vec::new();
                
                for i in 0..iterations {
                    let start = std::time::Instant::now();
                    
                    let response = assistant.generate(
                        &prompt, 
                        &language,
                        generation_type.into()
                    ).await;
                    
                    let duration = start.elapsed();
                    total_time += duration;
                    
                    match response {
                        Ok(_) => {
                            results.push(duration);
                            println!("Iteration {}: {:?}", i + 1, duration);
                        }
                        Err(e) => {
                            println!("Iteration {}: ERROR - {}", i + 1, e);
                        }
                    }
                }
                
                let avg_time = total_time / iterations as u32;
                let success_count = results.len();
                
                println!();
                println!("📊 Benchmark Results:");
                println!("  Total iterations: {}", iterations);
                println!("  Successful: {}", success_count);
                println!("  Failed: {}", iterations - success_count);
                println!("  Average time: {:?}", avg_time);
                println!("  Total time: {:?}", total_time);
                if success_count > 0 {
                    println!("  Throughput: {:.2} requests/second", 
                        success_count as f64 / total_time.as_secs_f64());
                }
            } else {
                println!("Generating content...");
                println!("Type: {:?}", generation_type);
                println!("Language: {}", language);
                println!("Prompt: '{}'", prompt);
                println!();
                
                let response = assistant.generate(
                    &prompt, 
                    &language,
                    generation_type.into()
                ).await;
                
                match response {
                    Ok(response) => {
                        if raw {
                            println!("Raw response:");
                            println!("{}", response.response);
                        } else {
                            match serde_json::from_str::<serde_json::Value>(&response.response) {
                                Ok(parsed) => {
                                    println!("Parsed JSON response:");
                                    println!("{}", serde_json::to_string_pretty(&parsed).unwrap());
                                }
                                Err(_) => {
                                    println!("Raw response (JSON parsing failed):");
                                    println!("{}", response.response);
                                }
                            }
                        }
                    }
                    Err(e) => {
                        println!("Error: {}", e);
                    }
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
            match assistant.list_models().await {
                Ok(models) => {
                    println!("Available models:");
                    for model in models.models {
                        println!("- {} ({} MB)", model.name, model.size / 1024 / 1024);
                    }
                }
                Err(e) => {
                    println!("Error listing models: {}", e);
                }
            }
        }
        Commands::IsModelAvailable { model } => {
            let assistant = OllamaAssistant::default();
            match assistant.is_model_available(&model).await {
                Ok(is_available) => {
                    println!("Model '{}' available: {}", model, is_available);
                }
                Err(e) => {
                    println!("Error checking model availability: {}", e);
                }
            }
        }
        Commands::Health { verbose } => {
            let assistant = OllamaAssistant::default();
            
            println!("🏥 AI Service Health Check");
            println!("==========================");
            
            match assistant.is_ollama_running().await {
                Ok(is_running) => {
                    if is_running {
                        println!("✅ Ollama server is running");
                        
                        if verbose {
                            match assistant.list_models().await {
                                Ok(models) => {
                                    println!("📋 Available models: {}", models.models.len());
                                    for model in models.models {
                                        println!("   - {}", model.name);
                                    }
                                }
                                Err(e) => {
                                    println!("❌ Error listing models: {}", e);
                                }
                            }
                        }
                    } else {
                        println!("❌ Ollama server is not running");
                    }
                }
                Err(e) => {
                    println!("❌ Error connecting to Ollama: {}", e);
                }
            }
            
            if verbose {
                println!();
                println!("🔧 Service Details:");
                println!("   Host: {}", assistant.host);
                println!("   Default model: mistral");
            }
        }
        Commands::TestAll { prompt, language } => {
            let test_prompt = prompt.unwrap_or_else(|| "Was ist die Hauptstadt von Deutschland?".to_string());
            let test_language = language.unwrap_or_else(|| "de".to_string());
            let assistant = OllamaAssistant::default();
            
            println!("🧪 Testing all generation types");
            println!("===============================");
            println!("Prompt: '{}'", test_prompt);
            println!("Language: {}", test_language);
            println!();
            
            let generation_types = [
                (GenerationType::Flashcards, "Flashcards"),
                (GenerationType::CardsOnly, "Cards Only"),
                (GenerationType::TextAnalysis, "Text Analysis"),
                (GenerationType::Explanation, "Explanation"),
            ];
            
            for (gen_type, name) in generation_types {
                println!("Testing {}...", name);
                let start = std::time::Instant::now();
                
                match assistant.generate(&test_prompt, &test_language, gen_type).await {
                    Ok(response) => {
                        let duration = start.elapsed();
                        println!("✅ {} completed in {:?}", name, duration);
                        
                        match serde_json::from_str::<serde_json::Value>(&response.response) {
                            Ok(_) => println!("   JSON parsing: ✅ Valid"),
                            Err(_) => println!("   JSON parsing: ⚠️  Invalid or raw text"),
                        }
                    }
                    Err(e) => {
                        let duration = start.elapsed();
                        println!("❌ {} failed after {:?}: {}", name, duration, e);
                    }
                }
                println!();
            }
        }
    }
}