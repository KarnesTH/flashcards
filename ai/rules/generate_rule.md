# Generating Rules for creating Decks and Cards

These rules define how the AI should generate flashcards for a learning application. The AI analyzes a topic or text and creates a structured deck with learning cards.

## Input
- **Topic/Text**: The user provides a topic or text for which flashcards should be generated
- **Number of Cards**: The user can specify the desired number of cards (default: generate an appropriate amount based on the topic complexity)

## Output
The AI returns **exclusively a JSON object**, no additional explanations or text.

## Process
1. **Analyze the user's prompt** to understand the topic, language, and requirements
2. **Use the same language** as the user's prompt (German prompt = German response, English prompt = English response)
3. **Generate appropriate number** of cards based on the topic complexity
4. **Return only the JSON** response

## JSON Structure

```json
{
    "deck": {
        "title": "Short, concise title (max 255 characters)",
        "description": "Detailed description of the learning content (max 500 characters)"
    },
    "cards": [
        {
            "question": "Markdown-formatted question with code syntax highlighting",
            "answer": "Short, precise answer in plain text (max 200 characters)"
        }
    ]
}
```

## Generation Rules

### Deck Rules
- **Title**: Short and concise, describes the main topic (use same language as user prompt)
- **Description**: Explains the learning content and target audience (use same language as user prompt)
- **Length**: Title max 255 characters, description max 500 characters

### Card Rules
- **Number**: Generate an appropriate number based on topic complexity and user request
- **Questions**: 
  - Use Markdown formatting for better readability
  - For code examples: Use syntax highlighting (```python, ```rust, etc.)
  - Various question types: definitions, code outputs, concepts, practical applications
  - Formulate clearly and precisely
- **Answers**:
  - **Very short and precise** (max 200 characters)
  - **Plain text only** (no Markdown formatting)
  - For code: Brief, executable examples
  - For definitions: Clear, concise explanations
  - **Avoid long explanations** - keep it simple and direct

### Question Types (use variety)
1. **Definitions**: "What is...?"
2. **Code Outputs**: "What does this code output?"
3. **Concepts**: "How does... work?"
4. **Comparisons**: "What's the difference between...?"
5. **Practical Applications**: "When would you use...?"

## Important Notes
- **Language matching**: ALWAYS use the same language as the user's prompt (German prompt = German response, English prompt = English response)
- **JSON only**: No additional explanations or comments
- **Markdown for questions**: For better formatting in the UI
- **Plain text for answers**: No Markdown formatting in answers
- **Keep answers short**: Maximum 200 characters per answer
- **Code syntax highlighting**: Specify the correct language for code examples
- **Learning-focused**: Cards should contribute to actual learning
- **Varied difficulty levels**: From basics to advanced concepts