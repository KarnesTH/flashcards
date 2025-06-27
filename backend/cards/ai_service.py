import requests
import json
from typing import Dict, Optional
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class AIService:
    """
    Service for communication with the AI module
    """
    
    def __init__(self):
        self.ai_base_url = getattr(settings, 'AI_SERVICE_URL', 'http://localhost:3000')
    
    def generate_flashcards(self, prompt: str, language: str = 'de') -> Optional[Dict]:
        """
        Generates flashcards based on a prompt
        
        Args:
            prompt: The user prompt for flashcard generation
            language: The language (de/en)
            
        Returns:
            Dict with deck and card information or None on error
        """
        try:
            url = f"{self.ai_base_url}/generate"
            payload = {
                "prompt": prompt,
                "language": language
            }
            
            logger.info(f"Generating flashcards for prompt: {prompt[:100]}...")
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info("Flashcard generation successful")
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"AI service request failed: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in AI service: {e}")
            return None
    
    def check_answer_correctness(self, answer: str, user_answer: str) -> Optional[float]:
        """
        Checks the correctness of a user answer
        
        Args:
            answer: The correct answer
            user_answer: The user answer
            
        Returns:
            Similarity score between 0.0 and 1.0 or None on error
        """
        try:
            url = f"{self.ai_base_url}/nlp"
            payload = {
                "answer": answer,
                "user_answer": user_answer
            }
            
            logger.info(f"Checking answer correctness...")
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            similarity = result.get('similarity', 0.0)
            
            logger.info(f"Answer correctness check completed: {similarity}")
            
            return similarity
            
        except requests.exceptions.RequestException as e:
            logger.error(f"AI service request failed: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in AI service: {e}")
            return None
    
    def is_service_available(self) -> bool:
        """
        Checks if the AI service is available
        
        Returns:
            True if the service is available, False otherwise
        """
        try:
            response = requests.get(f"{self.ai_base_url}/", timeout=5)
            return response.status_code == 200
        except:
            return False 