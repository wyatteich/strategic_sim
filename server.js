const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

// Load .env file manually (avoids dotenv dependency)
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length) {
            process.env[key.trim()] = vals.join('=').trim();
        }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Validate API key on startup
if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-api-key-here') {
    console.error('\n  ERROR: Set your Anthropic API key in .env');
    console.error('  Get one at https://console.anthropic.com\n');
    process.exit(1);
}

const client = new Anthropic();

app.use(express.json());

// Serve static files (crisis_simulation.html, etc.)
app.use(express.static(__dirname));

// Advisor endpoint
app.post('/api/advisor', async (req, res) => {
    try {
        const { messages, model, max_tokens } = req.body;

        const response = await client.messages.create({
            model: model || 'claude-sonnet-4-20250514',
            max_tokens: max_tokens || 1500,
            messages: messages
        });

        res.json(response);
    } catch (error) {
        console.error('Advisor API error:', error.message);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to get advisor response'
        });
    }
});

// Command interpretation endpoint
app.post('/api/command', async (req, res) => {
    try {
        const { messages, model, max_tokens } = req.body;

        const response = await client.messages.create({
            model: model || 'claude-sonnet-4-20250514',
            max_tokens: max_tokens || 2000,
            messages: messages
        });

        res.json(response);
    } catch (error) {
        console.error('Command API error:', error.message);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to interpret command'
        });
    }
});

// Game master endpoint (suggestions, adversary response, new situations)
app.post('/api/gamemaster', async (req, res) => {
    try {
        const { messages, model, max_tokens } = req.body;

        const response = await client.messages.create({
            model: model || 'claude-sonnet-4-20250514',
            max_tokens: max_tokens || 500,
            messages: messages
        });

        res.json(response);
    } catch (error) {
        console.error('Game master API error:', error.message);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to get game master response'
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n  Strategic Crisis Simulation`);
    console.log(`  ──────────────────────────`);
    console.log(`  Server running at http://localhost:${PORT}`);
    console.log(`  Open http://localhost:${PORT}/index.html to play\n`);
});
