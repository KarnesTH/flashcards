import json
import logging
import paramiko
from typing import Dict, Optional, List
from django.conf import settings

logger = logging.getLogger(__name__)


class AIService:
    """
    Service for communication with the AI module
    """
    
    def __init__(self):
        self.ssh_host = getattr(settings, 'AI_SSH_HOST', 'localhost')
        self.ssh_port = getattr(settings, 'AI_SSH_PORT', 2222)
        self.ssh_username = getattr(settings, 'AI_SSH_USERNAME', 'flashcard_user')
        self.ssh_password = getattr(settings, 'AI_SSH_PASSWORD', 'flashcard_secure_password_2024')
        self.ssh_key_path = getattr(settings, 'AI_SSH_KEY_PATH', None)
    
    def _create_ssh_connection(self):
        """
        Creates a SSH connection to the AI module

        Returns:
            SSHClient with active connection
        """
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            if self.ssh_key_path:
                ssh.connect(
                    self.ssh_host,
                    port=self.ssh_port,
                    username=self.ssh_username,
                    key_filename=self.ssh_key_path
                )
            else:
                ssh.connect(
                    self.ssh_host,
                    port=self.ssh_port,
                    username=self.ssh_username,
                    password=self.ssh_password
                )
            
            return ssh
        except Exception as e:
            logger.error(f"SSH-Verbindung fehlgeschlagen: {e}")
            raise
    
    def _send_ssh_command(self, command: Dict) -> Dict:
        """
        Sends a command over SSH and receives the response
        
        Args:
            command: The command to send as a Dict
            
        Returns:
            The response from the AI module as a Dict
        """
        ssh = None
        try:
            ssh = self._create_ssh_connection()
            channel = ssh.invoke_shell()
            
            import time
            time.sleep(1)
            
            command_json = json.dumps(command) + '\n'
            channel.send(command_json)
            
            response = ""
            while True:
                if channel.recv_ready():
                    data = channel.recv(1024).decode('utf-8')
                    response += data
                    if '\n' in data:
                        break
                time.sleep(0.1)
            
            try:
                lines = response.strip().split('\n')
                for line in lines:
                    if line.strip().startswith('{'):
                        return json.loads(line)
                
                return json.loads(response.strip())
            except json.JSONDecodeError as e:
                logger.error(f"JSON-Parsing fehlgeschlagen: {e}, Response: {response}")
                raise
                
        except Exception as e:
            logger.error(f"SSH-Kommando fehlgeschlagen: {e}")
            raise
        finally:
            if ssh:
                ssh.close()
    
    def generate_flashcards(self, prompt: str, language: str = 'de', difficulty: str = 'medium', count: int = 5) -> Optional[Dict]:
        """
        Generates Flashcards based on a prompt over SSH
        
        Args:
            prompt: The user prompt for the flashcard generation
            language: The language (de/en)
            difficulty: Difficulty (easy/medium/hard)
            count: Number of flashcards to generate
            
        Returns:
            Dict with deck and card information or None on error
        """
        try:
            command = {
                "command": "mcp_execute",
                "tool": "generate_flashcards",
                "parameters": {
                    "prompt": prompt,
                    "language": language,
                    "difficulty": difficulty,
                    "count": count
                }
            }
            
            logger.info(f"Generiere Flashcards für Prompt: {prompt[:100]}...")
            
            response = self._send_ssh_command(command)
            
            if response.get('status') == 'completed' and response.get('state') == 'complete':
                result_data = response.get('data', {}).get('result', {})
                logger.info("Flashcard-Generierung erfolgreich")
                return result_data
            else:
                error_msg = response.get('error', 'Unbekannter Fehler')
                logger.error(f"AI-Service Fehler: {error_msg}")
                return None
                
        except Exception as e:
            logger.error(f"Unerwarteter Fehler im AI-Service: {e}")
            return None
    
    def check_answer_correctness(self, answer: str, user_answer: str) -> Optional[float]:
        """
        Checks the correctness of a user answer over SSH
        
        Args:
            answer: The correct answer
            user_answer: The user answer
            
        Returns:
            Similarity value between 0.0 and 1.0 or None on error
        """
        try:
            command = {
                "command": "mcp_execute",
                "tool": "check_answer",
                "parameters": {
                    "correct_answer": answer,
                    "user_answer": user_answer
                }
            }
            
            logger.info("Überprüfe Antwort-Korrektheit...")
            
            response = self._send_ssh_command(command)
            
            if response.get('status') == 'completed' and response.get('state') == 'complete':
                result_data = response.get('data', {}).get('result', {})
                similarity = result_data.get('similarity', 0.0)
                logger.info(f"Antwort-Korrektheit überprüft: {similarity}")
                return similarity
            else:
                error_msg = response.get('error', 'Unbekannter Fehler')
                logger.error(f"AI-Service Fehler: {error_msg}")
                return None
                
        except Exception as e:
            logger.error(f"Unerwarteter Fehler im AI-Service: {e}")
            return None
    
    def get_available_tools(self) -> Optional[List[str]]:
        """
        Gets available tools from the AI module
        
        Returns:
            List of available tool names or None on error
        """
        try:
            command = {
                "command": "mcp_tools"
            }
            
            response = self._send_ssh_command(command)
            
            if response.get('status') == 'completed' and response.get('state') == 'complete':
                tools_data = response.get('data', {}).get('tools', [])
                tool_names = [tool.get('name', '') for tool in tools_data if tool.get('name')]
                return tool_names
            else:
                error_msg = response.get('error', 'Unbekannter Fehler')
                logger.error(f"AI-Service Fehler beim Abrufen der Tools: {error_msg}")
                return None
                
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der verfügbaren Tools: {e}")
            return None
    
    def explain_concept(self, question: str, context: str = "", language: str = 'de') -> Optional[str]:
        """
        Explains a concept over SSH
        
        Args:
            question: The question or concept to explain
            context: Optional context (e.g. user's wrong answer)
            language: Language for the explanation
            
        Returns:
            The explanation as a String or None on error
        """
        try:
            command = {
                "command": "mcp_execute",
                "tool": "explain",
                "parameters": {
                    "question": question,
                    "context": context,
                    "language": language
                }
            }
            
            logger.info(f"Erkläre Konzept: {question[:50]}...")
            
            response = self._send_ssh_command(command)
            
            if response.get('status') == 'completed' and response.get('state') == 'complete':
                result_data = response.get('data', {}).get('result', {})
                if 'content' in result_data:
                    for content in result_data['content']:
                        if content.get('type') == 'text':
                            return content.get('text', '')
                return str(result_data)
            else:
                error_msg = response.get('error', 'Unbekannter Fehler')
                logger.error(f"AI-Service Fehler: {error_msg}")
                return None
                
        except Exception as e:
            logger.error(f"Unerwarteter Fehler im AI-Service: {e}")
            return None
    
    def is_service_available(self) -> bool:
        """
        Checks if the AI service is available over SSH
        
        Returns:
            True if the service is available, False otherwise
        """
        try:
            ssh = self._create_ssh_connection()
            ssh.close()
            return True
        except Exception as e:
            logger.error(f"AI-Service nicht verfügbar: {e}")
            return False 