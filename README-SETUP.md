# Full OS Simulator Setup Guide

## Prerequisites

1. **OpenRouter API Key**: Get your free API key from [https://openrouter.ai/](https://openrouter.ai/)

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

### 2. Add Your API Key

Edit `.env.local` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here

# Main Model - For deep thinking and complex tasks
NEXT_PUBLIC_OPENROUTER_MODEL=minimax/minimax-m2:free

# Secondary Model - For quick, simple tasks
NEXT_PUBLIC_OPENROUTER_MODEL_2=moonshotai/kimi-dev-72b:free

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Models Explained

#### Main Model: MiniMax M2 (minimax/minimax-m2:free)
- **Purpose**: Task decomposition and complex reasoning
- **Used for**: 
  - Analyzing user requests
  - Breaking down tasks into subtasks
  - Complex algorithm design
  - Deep logical reasoning
- **Classification**: "Long" tasks

#### Secondary Model: Kimi Dev 72B (moonshotai/kimi-dev-72b:free)
- **Purpose**: Quick execution of simple operations
- **Used for**:
  - Simple file operations
  - Basic process management
  - Straightforward memory allocation
  - Direct command execution
- **Classification**: "Short" tasks

### 4. Run the Application

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and navigate to the **AI-Powered Full OS Simulator** card.

## How It Works

1. **User Input**: You describe an OS task in natural language
2. **Analysis**: MiniMax M2 analyzes and decomposes the task
3. **Classification**: Each subtask is marked as "long" or "short"
4. **Execution**: 
   - Long tasks → MiniMax M2 (deep thinking)
   - Short tasks → Kimi Dev 72B (quick execution)
5. **Results**: Real-time updates in the OS terminal

## Example Tasks

Try these example prompts:

```
"Create a file and write some content to it"
"Simulate a process that forks into child processes"
"Allocate memory and manage it with malloc/free"
"Set up a pipe for inter-process communication"
"Create multiple processes and demonstrate context switching"
```

## Troubleshooting

### API Key Issues
- Make sure your `.env.local` file is in the root directory (not in `app/`)
- Restart the dev server after adding environment variables
- Check that your API key starts with `sk-or-v1-`

### Model Not Responding
- Verify your OpenRouter account has credits/access
- Check browser console for error messages
- Both models are free tier - ensure they're available in your region

### Rate Limiting
- Free models may have rate limits
- Wait a few seconds between requests if hitting limits
- Consider upgrading to paid models for production use

## Alternative Models

You can change the models in `.env.local`:

### Premium Alternatives:
- Main: `anthropic/claude-3-opus` (best reasoning)
- Main: `openai/gpt-4-turbo` (fast and capable)
- Secondary: `openai/gpt-3.5-turbo` (quick and reliable)

### Other Free Options:
- Main: `google/gemini-pro-1.5` (free with good reasoning)
- Secondary: `meta-llama/llama-3.1-8b-instruct:free` (fast and free)

## Support

For issues with OpenRouter API:
- Visit: https://openrouter.ai/docs
- Discord: https://discord.gg/openrouter

For issues with the OS Simulator:
- Check the browser console for errors
- Verify environment variables are set correctly
- Ensure all dependencies are installed

