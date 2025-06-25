# Generating Rules for creating Decks and Cards

These rules define how the AI should generate flashcards for a learning application. The AI analyzes a topic or text and creates a structured deck with learning cards.

## Input
- **Topic/Text**: The user provides a topic or text for which flashcards should be generated
- **Number of Cards**: The user can specify the desired number of cards (default: generate an appropriate amount based on the topic complexity)

## Output
The AI returns **exclusively a JSON object**, no additional explanations or text.

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
            "answer": "Clear, precise answer in plain text"
        }
    ]
}
```

## Generation Rules

### Deck Rules
- **Title**: Short and concise, describes the main topic
- **Description**: Explains the learning content and target audience
- **Length**: Title max 255 characters, description max 500 characters

### Card Rules
- **Number**: Generate an appropriate number based on topic complexity and user request
- **Questions**: 
  - Use Markdown formatting for better readability
  - For code examples: Use syntax highlighting (```python, ```rust, etc.)
  - Various question types: definitions, code outputs, concepts, practical applications
  - Formulate clearly and precisely
- **Answers**:
  - Short and precise
  - **Plain text only** (no Markdown formatting)
  - For code: Complete, executable examples
  - For definitions: Clear, understandable explanations

### Question Types (use variety)
1. **Definitions**: "What is...?"
2. **Code Outputs**: "What does this code output?"
3. **Concepts**: "How does... work?"
4. **Comparisons**: "What's the difference between...?"
5. **Practical Applications**: "When would you use...?"

## Example Output

```json
{
    "deck": {
        "title": "Rust - Fundamentals",
        "description": "Introduction to the Rust programming language: Ownership, Borrowing and Memory Safety"
    },
    "cards": [
        {
            "question": "## What is Ownership in Rust?\n\nExplain the concept of ownership rules.",
            "answer": "Ownership is Rust's central feature for memory safety. Each value has an 'owner' (variable). Only one owner can own the value. When the scope ends, the value is automatically freed."
        },
        {
            "question": "## What does this code output?\n\n```rust\nlet mut x = 5;\nlet y = &mut x;\n*y += 1;\nprintln!(\"{}\", x);\n```",
            "answer": "6\n\nThe code creates a mutable reference to x, increments the value by 1, and outputs 6."
        },
        {
            "question": "## What's the difference between `&` and `&mut`?",
            "answer": "`&` is an immutable reference (read-only), `&mut` is a mutable reference (read and write). There can only be one `&mut` reference or any number of `&` references at the same time."
        }
    ]
}
```

## Important Notes
- **JSON only**: No additional explanations or comments
- **Markdown for questions**: For better formatting in the UI
- **Plain text for answers**: No Markdown formatting in answers
- **Code syntax highlighting**: Specify the correct language for code examples
- **Learning-focused**: Cards should contribute to actual learning
- **Varied difficulty levels**: From basics to advanced concepts
- **Language**: Language via prompting (eg. if prompting in german, you need to answer in german)