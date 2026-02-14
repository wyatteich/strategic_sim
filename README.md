# Strategic Crisis Simulation

A sophisticated geopolitical crisis management game featuring AI-powered advisors, intelligence briefings with interactive maps, and complex decision trees with cascading consequences.

## Features

### 🎮 Core Gameplay
- **Three immersive scenarios**: Taiwan Strait Crisis, Arctic Territorial Dispute, Critical Infrastructure Cyberattack
- **Scenario selection screen**: Choose your crisis or continue saved games
- **Six strategic metrics**: Balance stability, diplomacy, military readiness, public support, allied confidence, and intelligence
- **Dynamic DEFCON system**: Watch threat levels rise and fall based on your decisions
- **Branching consequences**: Every choice shapes the next phase of the crisis
- **Auto-save system**: Game state persists across sessions via localStorage

### 📊 Intelligence System
- **5-slide briefings** before each crisis with:
  - Satellite imagery (ASCII art)
  - Tactical situation maps
  - SIGINT analysis
  - Strategic implications
  - Decision frameworks
- **Real-time intel feed** tracking crisis developments
- **Interactive Leaflet.js map** showing global threats and force movements

### 🤖 AI-Powered Advisors
Consult four specialized advisors powered by Claude AI:
- **Rachel Chen (National Security Advisor)**: Strategic synthesis and policy coordination
- **General Marcus Webb (Secretary of Defense)**: Military options and operational planning
- **Ambassador Sarah Okonkwo (Secretary of State)**: Diplomatic solutions and alliance management
- **Director James Park (Director of National Intelligence)**: Intelligence analysis and threat assessment

Each advisor has a unique personality, background, and expertise defined in JSON profiles. They provide contextual, in-character responses and can generate classified intelligence reports.

### 📄 Intelligence Documents
Advisors generate authentic-looking intelligence reports with:
- **Classification banners** (TOP SECRET//SCI, SECRET//NOFORN, CONFIDENTIAL)
- **Military date-time groups** (DTG format)
- **Document metadata** (FROM/TO/SUBJECT/REF headers)
- **Key findings** sections with structured analysis
- **Assessment boxes** with bottom-line recommendations
- **Document archive** for reviewing all generated reports

### 🎨 Retro Aesthetic
- Authentic 1980s terminal interface inspired by WarGames
- Green-on-black CRT monitor styling
- ASCII art tactical maps and intelligence imagery
- Real-time clock and classification banners

## Quick Start

### Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your API key**:
   - Create a `.env` file in the project root
   - Add your Anthropic API key:
     ```
     ANTHROPIC_API_KEY=sk-ant-api03-...
     PORT=3000
     ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - Select a scenario from the loading screen
   - Read the intelligence briefing
   - Make decisions and consult advisors

### Project Structure

```
strategic-sim/
├── index.html              # Main HTML shell
├── server.js               # Express server & API proxy
├── package.json            # Dependencies
├── .env                    # API keys (create this)
├── css/
│   └── main.css           # All styles
├── js/
│   ├── main.js            # Entry point & boot
│   ├── advisors.js        # AI advisor system
│   ├── api.js             # API layer
│   ├── commands.js        # Command processing
│   ├── game.js            # Game flow
│   ├── intel.js           # Intel feed
│   ├── map.js             # Leaflet map
│   ├── scenarios.js       # Scenario loader
│   ├── state.js           # Game state & persistence
│   └── ui.js              # UI utilities
├── scenarios/
│   ├── manifest.json      # Scenario registry
│   ├── taiwan_strait.json
│   ├── arctic_resources.json
│   └── cyber_attack.json
└── advisors/
    ├── manifest.json      # Advisor registry
    ├── rachel_chen.json   # NSA profile
    ├── marcus_webb.json   # SECDEF profile
    ├── sarah_okonkwo.json # State profile
    └── james_park.json    # DNI profile
```

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running quickly
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Comprehensive technical documentation
- **[ROADMAP.md](ROADMAP.md)** - Future development plans and multiplayer vision

## Game Mechanics

### Victory Conditions
- Stability > 80
- Allied Confidence > 70  
- Survive 3+ turns

### Loss Conditions
- Stability < 20 (government collapse)
- Public Support < 20 (loss of mandate)
- Allied Confidence < 20 (strategic isolation)

### Strategic Metrics
Each decision affects multiple metrics:
- **Stability Index**: Overall crisis control
- **Diplomatic Capital**: International cooperation ability
- **Military Readiness**: Force projection capability
- **Public Support**: Domestic political backing
- **Allied Confidence**: Coalition strength
- **Intelligence Score**: Information advantage

## Example Scenario: Taiwan Strait Crisis

A large-scale PLA exercise near Taiwan. 87 naval vessels, 240+ aircraft. Exercise area 90km from Taiwan's coast. Markets volatile. Allies requesting guidance. Is this intimidation or invasion preparation?

**Intelligence briefing reveals:**
- Satellite imagery of naval concentrations
- Force disposition analysis  
- Three probability scenarios
- 48-72 hour diplomatic window
- Economic implications ($2.1T quarterly risk)

**Your options:**
- Deploy carrier group as deterrent
- Initiate backchannel negotiations
- Coordinate multilateral response
- Impose immediate sanctions

**Advisor input:**
- NSA recommends multi-track engagement
- SECDEF wants show of force
- State advocates quiet diplomacy
- Intel flags intelligence gaps

## Multiplayer Vision (Roadmap)

### Cooperative Mode
2-6 players with divided roles and asymmetric information:
- President (final authority)
- National Security Advisor
- Secretary of Defense
- Secretary of State  
- Director of Intelligence
- Chief of Staff

Each role sees different information, must coordinate through in-game communication.

### Asymmetric Mode
2-4 players on opposing sides:
- US/Allied Coalition
- Adversary Nation(s)
- Neutral States

Hidden information, fog of war, bluffing, and strategic competition.

### Crisis Committee Mode
4-8 players simulating Model UN:
- Multiple nation representatives
- UN mediator
- NGO observers
- Real-time negotiation and alliance formation

## Technical Stack

**Current:**
- **Frontend**: ES6 modules, vanilla JavaScript (no build tools)
- **Backend**: Node.js + Express (API proxy)
- **AI**: Anthropic Claude API (Sonnet 4)
- **Mapping**: Leaflet.js for interactive maps
- **Persistence**: localStorage for game state
- **Architecture**: Modular design with external JSON for scenarios/advisors

**Future (Roadmap):**
- React frontend for richer UI
- PostgreSQL database for multiplayer
- Socket.io for real-time gameplay
- Web Audio API for sound design
- Authentication & user accounts

## Development

### Adding Scenarios
Scenarios are JSON files in `scenarios/`:
1. Create a new JSON file (e.g., `my_scenario.json`)
2. Add entry to `scenarios/manifest.json`
3. Define structure:
   ```json
   {
     "id": "my_scenario",
     "title": "SCENARIO TITLE",
     "description": "Brief description...",
     "briefing": [
       { "title": "Slide 1", "content": "HTML content..." }
     ],
     "options": [
       {
         "text": "Decision option...",
         "effects": { "stability": -5, "diplomacy": 10 },
         "intel": "Intel message...",
         "defcon": 4
       }
     ]
   }
   ```

### Adding/Customizing Advisors
Advisors are JSON profiles in `advisors/`:
1. Create a new JSON file (e.g., `new_advisor.json`)
2. Add entry to `advisors/manifest.json`
3. Define profile:
   ```json
   {
     "id": "advisor_id",
     "name": "Full Name",
     "shortName": "Short Name",
     "title": "Position Title",
     "agency": "AGENCY",
     "role": "Expertise description",
     "personality": "Character traits...",
     "background": "Biography...",
     "docType": "INTEL_REPORT",
     "docLabel": "DOCUMENT TYPE LABEL",
     "defaultClassification": "SECRET",
     "fullTitle": "FORMAL TITLE FOR DOCUMENTS"
   }
   ```

No code changes needed — the system loads advisors dynamically.

### Creating ASCII Art
Use box-drawing characters for tactical maps:
```
╔═══╗ ┌───┐ ║ │ █ ▓ ✓ ✗ ▲ ★
```

See QUICKSTART.md for templates and examples.

## Roadmap Highlights

### Phase 1: Foundation (Weeks 1-4)
- Persistent save/load system
- External scenario JSON format
- Enhanced analytics
- Audio system

### Phase 2: Multiplayer (Weeks 5-8)
- Cooperative crisis management
- Asymmetric conflict mode
- Backend infrastructure
- Lobby and matchmaking

### Phase 3: Advanced Features (Weeks 9-16)
- Dynamic random events
- Advanced AI with memory
- After Action Review system
- Visual scenario editor

### Phase 4: Polish & Launch (Weeks 17-20)
- Mobile optimization
- Achievements and progression
- Accessibility overhaul
- Localization

### Phase 5: Community (Weeks 21+)
- User accounts and social features
- Scenario sharing marketplace
- Tournament system
- Monetization (freemium model)

## Potential Applications

### Entertainment
- Strategic gameplay for geopolitics enthusiasts
- Replayable scenarios with multiple paths
- Competitive multiplayer esports

### Education  
- International Relations courses
- Political Science programs
- Game theory demonstrations
- Decision-making training

### Training
- Diplomatic corps training
- Military officer education
- Crisis management simulation
- Policy analysis tool

### Research
- Decision science studies
- Behavioral economics research
- Game theory validation
- Cognitive load analysis

## Why This Matters

Most strategy games focus on military conquest. This game explores the harder problem: **crisis management without escalation to war**.

The AI advisor system represents a novel approach - not just dialogue trees, but genuine consultation with advisors who reason about your specific situation.

The multiplayer modes create information asymmetry rarely seen in games, forcing players to communicate, deduce, and sometimes bluff - mirroring real diplomatic dynamics.

Combined with the procedural generation roadmap, this could become a platform for exploring countless crisis scenarios, from historical to speculative fiction.

## Inspiration

- **WarGames (1983)**: Terminal aesthetic, Cold War tension
- **DEFCON game**: Abstract nuclear strategy
- **Model UN**: Crisis committee dynamics
- **Real NSC briefings**: Intelligence presentation format
- **Papers, Please**: Moral complexity in constrained systems

## Credits

**Concept & Development**: Created in collaboration with Claude (Anthropic)  
**AI Technology**: Claude Sonnet 4  
**Design Philosophy**: Authentic crisis simulation meets accessible gameplay

## License

[Specify license when determined]

## Contributing

This is currently a proof-of-concept. Contributions welcome as the project evolves:
- New scenarios
- Bug fixes  
- Feature implementations from roadmap
- Documentation improvements
- Multiplayer architecture
- Testing and QA

## Feedback

Love it? Hate it? Have ideas? The game is designed to be modified and extended. Fork it, break it, improve it, share your scenarios.

The multiplayer vision is ambitious but achievable. The foundation is solid. The potential is enormous.

Let's build the definitive crisis management simulation together.

---

**Current Version**: 2.0
**Status**: Fully playable with modular architecture
**Recent Updates**:
- ✅ Modular scenario system (external JSON files)
- ✅ Modular advisor profiles (personality, background, document types)
- ✅ Styled intelligence documents (classification banners, metadata, key findings)
- ✅ Loading screen with scenario selection
- ✅ Auto-save/load system with localStorage
- ✅ Interactive Leaflet.js map
- ✅ XSS vulnerability patched
- ✅ Removed legacy dead code

**Next Milestone**: Multiplayer infrastructure

---

*"The only winning move is... to make the right decision at the right time with incomplete information and enormous consequences."*

*Not quite as catchy, but more accurate.*
