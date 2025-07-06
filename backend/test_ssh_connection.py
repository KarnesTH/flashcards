"""
Test script for SSH connection to the AI module
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from cards.ai_service import AIService

def test_ssh_connection():
    """Test the SSH connection to the AI module"""
    print("🔍 Teste SSH-Verbindung zum AI-Modul...")
    
    ai_service = AIService()
    
    print(f"📡 SSH-Host: {ai_service.ssh_host}:{ai_service.ssh_port}")
    print(f"👤 SSH-Username: {ai_service.ssh_username}")
    
    try:
        is_available = ai_service.is_service_available()
        print(f"✅ Service verfügbar: {is_available}")
        
        if is_available:
            print("\n🔧 Verfügbare Tools:")
            tools = ai_service.get_available_tools()
            if tools:
                for tool in tools:
                    print(f"  - {tool}")
            else:
                print("  Keine Tools verfügbar")
            
            print("\n🎴 Teste Flashcard-Generierung...")
            result = ai_service.generate_flashcards(
                prompt="Was ist Python?",
                language="de",
                difficulty="easy",
                count=2
            )
            
            if result:
                print("✅ Flashcard-Generierung erfolgreich!")
                if 'content' in result:
                    for content in result['content']:
                        if content.get('type') == 'flashcards':
                            cards = content.get('cards', [])
                            print(f"  Generierte {len(cards)} Karten:")
                            for i, card in enumerate(cards, 1):
                                print(f"    {i}. Q: {card.get('question', '')[:50]}...")
                                print(f"       A: {card.get('answer', '')[:50]}...")
            else:
                print("❌ Flashcard-Generierung fehlgeschlagen")
        
    except Exception as e:
        print(f"❌ Fehler beim Testen: {e}")
        return False
    
    return True

def test_explanation():
    """Test the concept explanation"""
    print("\n📚 Teste Konzept-Erklärung...")
    
    ai_service = AIService()
    
    try:
        explanation = ai_service.explain_concept(
            question="Was ist Machine Learning?",
            context="Für einen Anfänger",
            language="de"
        )
        
        if explanation:
            print("✅ Konzept-Erklärung erfolgreich!")
            print(f"📝 Erklärung: {explanation[:200]}...")
        else:
            print("❌ Konzept-Erklärung fehlgeschlagen")
            
    except Exception as e:
        print(f"❌ Fehler bei der Konzept-Erklärung: {e}")

if __name__ == "__main__":
    print("🚀 Starte SSH-Verbindungstest...\n")
    
    success = test_ssh_connection()
    
    if success:
        test_explanation()
    
    print("\n✨ Test abgeschlossen!") 