# Quick Start Guide

## Prerequisites Check

Before running, ensure you have:
- ✅ Node.js installed (check with `node --version`)
- ✅ MongoDB installed and running (check with `mongosh`)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
copy .env.example .env

# Edit .env and set:
# - MONGODB_URI (default: mongodb://localhost:27017/refugeeconnect)
# - SESSION_SECRET (any random string)
# - OPENAI_API_KEY (your OpenAI API key - required for AI features)
# - PORT (default: 5000)
```

### 3. Start MongoDB
Make sure MongoDB is running:
- **Windows**: Usually runs as a service automatically
- **macOS/Linux**: Run `mongod` or `sudo systemctl start mongod`

### 4. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 5. Access the Application
Open your browser and go to: **http://localhost:5000**

## First Steps

1. **Register a new account** at http://localhost:5000/auth/register
2. **Login** at http://localhost:5000/auth/login
3. **Explore the dashboard** at http://localhost:5000/dashboard
4. **Try the AI Assistant** at http://localhost:5000/ai-assistant

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongosh` should connect
- Check `MONGODB_URI` in `.env` is correct

### "OpenAI API Error"
- Verify your `OPENAI_API_KEY` in `.env` is valid
- Check your OpenAI account has credits

### "Port already in use"
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Need Help?

See the full [README.md](README.md) for detailed documentation.
