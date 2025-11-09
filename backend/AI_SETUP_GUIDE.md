# AI Chatbot Setup Guide

## Current Issue
Your OpenAI API key has exceeded its quota. You need to either add billing/credits to OpenAI or use Groq (recommended - it's FREE).

## ✅ Recommended: Use Groq API (FREE & FAST)

### Step 1: Get Groq API Key
1. Go to https://console.groq.com/
2. Sign up with your email (it's FREE)
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

### Step 2: Add to .env file
```env
GROQ_API_KEY=gsk_your_actual_key_here
OPENAI_API_KEY=
```

### Step 3: Restart Backend
```bash
cd backend
npm start
```

## Alternative: Fix OpenAI API

### Option A: Add Credits
1. Go to https://platform.openai.com/account/billing
2. Add payment method
3. Add credits ($5 minimum)

### Option B: Check Usage
1. Go to https://platform.openai.com/usage
2. Check if you have credits remaining
3. Your current key may be expired or invalid

## Testing Chatbot

After adding Groq API key, test with:
```bash
node test-chatbot.js
```

You should see real AI responses instead of mock responses.

## Current Behavior

✅ **Chatbot is working** - It falls back to helpful mock responses when API fails
❌ **OpenAI quota exceeded** - Need to add billing or switch to Groq
✅ **Groq integration ready** - Just add the API key

## Why Groq?

- ✅ **FREE** - No billing required
- ✅ **FAST** - Faster than OpenAI
- ✅ **RELIABLE** - High rate limits
- ✅ **EASY** - Same API format as OpenAI

## Support

If you need help:
- Groq Discord: https://groq.com/discord
- OpenAI Support: https://help.openai.com/
