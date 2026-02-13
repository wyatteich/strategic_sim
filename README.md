# Strategic Crisis Simulation

A sophisticated geopolitical crisis management game featuring AI-powered advisors, intelligence briefings with ASCII tactical maps, and complex decision trees with cascading consequences.

## Features

### 🎮 Core Gameplay
- **Three immersive scenarios**: Taiwan Strait Crisis, Arctic Territorial Dispute, Critical Infrastructure Cyberattack
- **Six strategic metrics**: Balance stability, diplomacy, military readiness, public support, allied confidence, and intelligence
- **Dynamic DEFCON system**: Watch threat levels rise and fall based on your decisions
- **Branching consequences**: Every choice shapes the next phase of the crisis

### 📊 Intelligence System
- **5-slide briefings** before each crisis with:
  - Satellite imagery (ASCII art)
  - Tactical situation maps
  - SIGINT analysis
  - Strategic implications
  - Decision frameworks
- **Real-time intel feed** tracking crisis developments
- **Global situation map** showing regional statuses

### 🤖 AI-Powered Advisors
Consult four specialized advisors powered by Claude AI:
- **National Security Advisor**: Strategic synthesis across all domains
- **Joint Chiefs of Staff**: Military capabilities and operational planning
- **Secretary of State**: Diplomatic solutions and alliance management  
- **Director of Intelligence**: Enemy intentions and probability assessments

Each advisor maintains conversation history and provides contextual, in-character responses to your queries.

### 🎨 Retro Aesthetic
- Authentic 1980s terminal interface inspired by WarGames
- Green-on-black CRT monitor styling
- ASCII art tactical maps and intelligence imagery
- Real-time clock and classification banners

## Quick Start

1. Open `crisis_simulation.html` in any modern browser
2. No installation or dependencies required
3. Read the intelligence briefing
4. Make decisions and consult advisors
5. Navigate the crisis to victory or defeat

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
- Vanilla JavaScript
- CSS3 for retro styling
- Anthropic Claude API for advisors
- Single HTML file deployment

**Future (Roadmap):**
- React frontend
- Node.js + Express backend
- PostgreSQL database
- Socket.io for real-time multiplayer
- Web Audio API for sound design

## Development

### Adding Scenarios
Scenarios are defined in JavaScript objects with:
- Metadata (id, title, description)
- Briefing slides (5 slides with HTML content)
- Decision options (text, effects, intel messages)
- Consequence phases (follow-up scenarios)

See QUICKSTART.md for detailed instructions.

### Extending Advisors
Advisor personalities are defined in system prompts:
```javascript
advisorPersonas = {
    natsec: `You are the National Security Advisor...`,
    // Add custom advisors here
}
```

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

**Current Version**: 1.0 (Proof of Concept)  
**Status**: Playable, seeking feedback  
**Next Milestone**: Persistence layer and scenario system refactor

---

*"The only winning move is... to make the right decision at the right time with incomplete information and enormous consequences."*

*Not quite as catchy, but more accurate.*
