# Text Analysis Rules

These rules define how the AI should analyze text, create a summary internally, and generate flashcards from the content.

## Input
- **Text Content**: The text content to analyze (transcript, article, book excerpt, etc.)
- **Language**: The text language determines the response language

## Output
The AI returns **exclusively a JSON object** with flashcards, no additional explanations.

## Process
1. **Analyze the provided text** to understand the main concepts
2. **Create an internal summary** that captures the essence
3. **Generate flashcards** based on the summary and key learning points

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
            "answer": "Short, precise answer in plain text (max 100 characters)"
        }
    ]
}
```

## Rules

### Content Analysis
- **Analyze the provided text** to understand the main concepts
- **Create an internal summary** that captures the essence
- **Extract key learning points** that can be converted to questions
- **Identify important definitions** and concepts
- **Find practical examples** and use cases
- **Determine appropriate difficulty** based on content complexity

### Internal Summary Process
- **Summarize the main content** internally to understand the core
- **Extract key points** that are essential for understanding
- **Identify the core topic** and main themes
- **Assess the difficulty level** based on complexity
- **Use this summary** to generate appropriate flashcards

### Flashcard Generation
- **Create 3-10 cards** based on content complexity
- **Focus on essential concepts** that are central to understanding
- **Include both basic definitions** and practical applications
- **Use clear, concise language** appropriate for the audience
- **Ensure questions are specific** and answers are precise

### Difficulty Guidelines
- **Easy content**: 3-5 cards, basic concepts and definitions
- **Medium content**: 5-8 cards, detailed concepts and examples
- **Hard content**: 8-10 cards, complex relationships and advanced topics

### Quality Standards
- **Questions should be clear** and test understanding
- **Answers should be concise** but complete
- **Focus on actionable knowledge** over theoretical concepts
- **Maintain consistency** in terminology and difficulty
- **Ensure relevance** to the source material

## Important Notes
- **Language matching**: ALWAYS use the same language as the input text
- **JSON only**: No additional explanations or comments
- **Focus on learning value**: Create cards that help understanding
- **Be specific**: Avoid generic or obvious questions
- **Maintain context**: Ensure cards relate to the source material 