# Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
Create a `.env` file in the project root:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
PORT=3000
```

Get your API key from: https://console.anthropic.com/

### 3. Start the Server
```bash
npm start
```

### 4. Open Your Browser
Navigate to `http://localhost:3000`

## Project Structure

```
strategic-sim/
├── index.html              # Main HTML shell
├── server.js               # Express server & API proxy
├── package.json            # Dependencies
├── .env                    # API keys (you create this)
│
├── css/
│   └── main.css           # All styles
│
├── js/                    # ES6 modules
│   ├── main.js            # Entry point & boot sequence
│   ├── advisors.js        # AI advisor system
│   ├── api.js             # API layer (calls server endpoints)
│   ├── commands.js        # Natural language command processing
│   ├── game.js            # Game flow & scenario management
│   ├── intel.js           # Intel feed system
│   ├── map.js             # Leaflet.js map integration
│   ├── scenarios.js       # Scenario loader
│   ├── state.js           # Game state & localStorage persistence
│   └── ui.js              # UI utilities
│
├── scenarios/             # Scenario data files
│   ├── manifest.json      # Scenario registry
│   ├── taiwan_strait.json
│   ├── arctic_resources.json
│   └── cyber_attack.json
│
└── advisors/              # Advisor profile files
    ├── manifest.json      # Advisor registry
    ├── rachel_chen.json   # National Security Advisor
    ├── marcus_webb.json   # Secretary of Defense
    ├── sarah_okonkwo.json # Secretary of State
    └── james_park.json    # Director of National Intelligence
```

## How to Play

### Starting a Game
1. **Select a scenario** from the loading screen (or click "Continue Saved Game")
2. **Read the intelligence briefing** (5 slides with maps, analysis, and options)
3. **Click "BEGIN CRISIS MANAGEMENT"** to start

### Making Decisions
- **Option buttons**: Click suggested options in the Situation tab
- **Natural language commands**: Type freeform orders in the Command tab
- **Consult advisors**: Ask questions in the Advisors tab

### Monitoring Status
- **Metrics ribbon**: Watch 6 strategic metrics at the top
- **Intel feed**: Real-time crisis developments
- **Map view**: Interactive global situation map
- **DEFCON level**: Threat indicator

### Victory & Loss
**Win Conditions:**
- Stability > 80
- Allied Confidence > 70
- Survive 3+ turns

**Loss Conditions:**
- Stability < 20
- Public Support < 20
- Allied Confidence < 20

## Customization Guide

### Adding a New Scenario

1. **Create scenario JSON file** in `scenarios/`:

```json
{
    "id": "my_crisis",
    "title": "MY CRISIS TITLE",
    "description": "Brief description of the crisis situation",
    "briefing": [
        {
            "title": "SITUATION OVERVIEW",
            "content": "<div class=\"slide-section\"><h3>Initial Intelligence</h3><p>Crisis details...</p></div>"
        },
        {
            "title": "TACTICAL ANALYSIS",
            "content": "<div class=\"slide-section\"><pre>ASCII map here...</pre></div>"
        }
    ],
    "options": [
        {
            "text": "Deploy naval assets to the region",
            "effects": {
                "stability": -5,
                "diplomacy": -10,
                "military": 15,
                "support": 5,
                "allies": -5,
                "intelligence": 0
            },
            "intel": "PACOM reports carrier group USS Reagan deploying.",
            "defcon": 3,
            "nextPhase": "military_escalation"
        }
    ]
}
```

2. **Register in manifest** (`scenarios/manifest.json`):

```json
{
    "id": "my_crisis",
    "title": "MY CRISIS TITLE",
    "file": "my_crisis.json",
    "description": "One-line summary for loading screen",
    "region": "REGION NAME",
    "difficulty": "MEDIUM"
}
```

3. **Restart server** and reload browser

### Adding a New Advisor

1. **Create advisor JSON file** in `advisors/`:

```json
{
    "id": "new_advisor",
    "name": "Dr. Elena Rodriguez",
    "shortName": "Dr. Rodriguez",
    "title": "National Cyber Director",
    "agency": "ONCD",
    "role": "Cybersecurity strategy, critical infrastructure defense, digital threats",
    "personality": "Technically precise, urgency-driven, advocates proactive cyber defense",
    "background": "Former NSA cyber operations, MIT PhD in computer science, led major incident responses",
    "docType": "CYBER_THREAT_BRIEF",
    "docLabel": "CYBER THREAT BRIEFING",
    "defaultClassification": "TOP SECRET//SI",
    "fullTitle": "NATIONAL CYBER DIRECTOR"
}
```

2. **Register in manifest** (`advisors/manifest.json`):

```json
{ "id": "new_advisor", "file": "new_advisor.json" }
```

3. **Restart server** — advisor loads automatically

### Modifying Document Types

Edit advisor profiles to change document styling:
- `docType`: Internal identifier (e.g., `INTEL_REPORT`, `MILITARY_ASSESSMENT`)
- `docLabel`: Display name shown in document header
- `defaultClassification`: Default classification level for documents
- `fullTitle`: Formal title shown in FROM field

Classification levels:
- `TOP SECRET//SCI` → Red banner
- `SECRET//NOFORN` → Orange banner
- `SECRET` → Orange banner
- `CONFIDENTIAL` → Blue banner

### Changing Initial Metrics

Edit `js/state.js`, `DEFAULT_STATE` object:

```javascript
const DEFAULT_STATE = {
    turn: 0,
    stability: 85,      // 0-100
    diplomacy: 75,      // 0-100
    military: 70,       // 0-100
    support: 80,        // 0-100
    allies: 75,         // 0-100
    intelligence: 65,   // 0-100
    defcon: 5,          // 1-5
    // ...
};
```

## Troubleshooting

### Server won't start
- Check `.env` file exists with valid API key
- Verify port 3000 is not in use: `lsof -i :3000`
- Run `npm install` to ensure dependencies are installed

### Advisors return errors
- Verify `ANTHROPIC_API_KEY` is set correctly in `.env`
- Check API key has credits: https://console.anthropic.com/
- Check browser console for network errors

### Scenarios don't load
- Check JSON syntax with a validator
- Verify file is in `scenarios/` directory
- Confirm entry exists in `scenarios/manifest.json`
- Check browser console for parse errors

### Map doesn't display
- Leaflet.js loads from CDN — check internet connection
- Open browser console for JavaScript errors
- Verify `js/map.js` is loading correctly

### Game state not saving
- Check browser localStorage is enabled
- Clear browser cache if state is corrupted
- Use "Restart" button to clear save and start fresh

## Development Workflow

### Making Changes
1. Edit files in `js/`, `css/`, `scenarios/`, or `advisors/`
2. Refresh browser (no build step needed)
3. Check browser console for errors

### Testing
1. Start a scenario
2. Test all decision paths
3. Verify metrics change correctly
4. Test advisor responses
5. Check document generation
6. Verify save/load works

### Debugging
- Use browser DevTools console
- Server logs show API calls
- Check `Network` tab for failed requests
- Use `console.log()` in JS modules

## Advanced Tips

### ASCII Art for Briefings
Use box-drawing characters:
```
┌─────────────┐
│  UNIT: CVN  │
│  POS: 24°N  │
└─────────────┘
```

Characters: `─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║ ╔ ╗ ╚ ╝`

### Map Markers
Add threats or forces programmatically in scenario options or via `js/map.js` functions.

### Custom CSS
Edit `css/main.css` for visual customization. Color palette:
- Primary: `#4a9eff` (cyan blue)
- Accent: `#ffb000` (amber)
- Alert: `#ff4444` (red)
- Background: `#0a0e17` (dark blue)

### Natural Language Commands
Players can type freeform orders like:
- "Deploy the 7th Fleet to the South China Sea"
- "Open backchannel negotiations with Beijing"
- "Raise DEFCON to 3"

The AI interprets intent and generates consequences.

## Next Steps

- Explore the full [DOCUMENTATION.md](DOCUMENTATION.md)
- Review the [ROADMAP.md](ROADMAP.md) for future plans
- Create your own scenarios
- Customize advisor personalities
- Share your modifications

## Getting Help

- Check browser console for error messages
- Review server logs (`npm start` output)
- Validate JSON files with online validators
- Read the comprehensive [DOCUMENTATION.md](DOCUMENTATION.md)
