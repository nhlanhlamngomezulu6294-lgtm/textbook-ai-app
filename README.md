# PrepPal - Your AI-Powered Study Assistant

PrepPal is an intelligent study application designed to help students and lifelong learners master their textbook content. By leveraging the power of Google's Gemini API, users can upload a PDF textbook and transform it into an interactive learning experience.


## ✨ Key Features

- **Interactive Q&A**: Ask natural language questions about the textbook content and receive answers backed by direct quotes and page number citations.
- **Practice Questions**: Automatically generate a variety of practice questions (Multiple Choice, Short Answer, Essay) based on specific chapters, page ranges, or your recent Q&A history.
- **Dynamic Glossary**: Instantly create a comprehensive glossary of key terms and concepts found within the document, complete with definitions and page references.
- **Flashcard Decks**: Generate digital flashcards for focused study sessions, targeting the topics that matter most to you.
- **Mind Maps (Coming Soon!)**: Visualize connections between concepts with automatically generated mind maps.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI/LLM**: Google Gemini API (`gemini-2.5-flash`)
- **PDF Processing**: Mozilla's PDF.js
- **Deployment**: Vercel

## 🚀 Getting Started

This project is configured to be deployed easily on Vercel.

### Deployment with Vercel

1.  **Fork this repository** to your own GitHub account.
2.  Go to [Vercel](https://vercel.com/) and sign up with your GitHub account.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your forked repository from the list.
5.  In the **"Environment Variables"** section, add a new variable:
    - **Name**: `API_KEY`
    - **Value**: Your Google Gemini API key.
6.  Click **"Deploy"**. Vercel will handle the rest!

