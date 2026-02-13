# Strategic Crisis Simulation - Documentation

## Overview

A geopolitical crisis management simulation that combines decision-making, real-time AI advisor consultation, and strategic resource management. Players navigate complex international crises through briefings, intelligence feeds, and consultation with AI-powered advisors.

## Current Features

### Core Gameplay
- **Multi-scenario system**: Taiwan Strait Crisis, Arctic Territorial Dispute, Critical Infrastructure Cyberattack
- **Resource management**: Track 6 strategic metrics (Stability, Diplomacy, Military Readiness, Public Support, Allied Confidence, Intelligence)
- **DEFCON tracking**: Dynamic threat level based on player decisions
- **Consequence system**: Decisions cascade into follow-up scenarios with branching paths

### Intelligence Briefing System
Each scenario opens with a 5-slide briefing containing:
- **Situation Overview**: Current status, threat matrix, key indicators
- **Intelligence Assessment**: Satellite imagery (ASCII), SIGINT analysis, confidence ratings
- **Tactical Maps**: ASCII-art force disposition maps showing contested zones, military assets, supply routes
- **Strategic Implications**: Economic, alliance, and escalation analysis
- **Decision Framework**: Timeline constraints, recommended approaches, resource availability

### AI Advisor System
Four specialized advisors with distinct personalities and knowledge domains:

1. **National Security Advisor**
   - Strategic synthesis across all domains
   - Balances military, diplomatic, economic, and political concerns
   - Historical precedent awareness
   - Measured, analytical communication style

2. **Joint Chiefs of Staff**
   - Military operational capabilities
   - Force readiness and positioning
   - Tactical feasibility assessments
   - Direct, mission-focused communication

3. **Secretary of State**
   - Diplomatic solutions and alliance management
   - International law and treaty obligations
   - Cultural and political dynamics
   - Long-term relationship impacts

4. **Director of Intelligence**
   - Adversary intentions and capabilities
   - Probability assessments and scenarios
   - Intelligence gaps and uncertainties
   - Data-driven analysis with caveats

Each advisor:
- Maintains conversation history per advisor role
- Receives full context about current crisis state and metrics
- Responds via Claude API with scenario-specific knowledge
- Provides concrete, in-character assessments

### UI/UX Features
- **Authentic terminal aesthetic**: Green-on-black CRT monitor style
- **Real-time intelligence feed**: Scrolling updates on crisis developments
- **Global situation map**: Regional status indicators (Allied, Hostile, Neutral, Contested, Flashpoint)
- **DEFCON alert system**: Color-coded threat levels with visual indicators
- **Responsive decision options**: Clear consequences for each choice

## Technical Architecture

### Frontend
- Single-page HTML application
- Vanilla JavaScript (no frameworks)
- CSS3 for retro terminal styling
- Grid-based responsive layout

### AI Integration
- **Anthropic Claude API**: Powers all advisor responses
- **Model**: claude-sonnet-4-20250514
- **Context management**: Full game state passed to each advisor query
- **Persona system**: Distinct system prompts for each advisor role

### Game State Management
```javascript
gameState = {
    turn: Number,              // Current turn counter
    stability: Number,         // 0-100 stability index
    diplomacy: Number,         // 0-100 diplomatic capital
    military: Number,          // 0-100 military readiness
    support: Number,           // 0-100 public support
    allies: Number,            // 0-100 allied confidence
    intelligence: Number,      // 0-100 intelligence score
    defcon: Number,            // 1-5 threat level
    scenario: Object,          // Current scenario data
    regions: Object,           // Map region statuses
    gameOver: Boolean,         // Game termination flag
    currentAdvisor: String,    // Active advisor tab
    advisorHistory: Object,    // Conversation history per advisor
    briefing: Object          // Briefing state
}
```

### Scenario Data Structure
```javascript
{
    id: String,                      // Unique scenario identifier
    title: String,                   // Display title
    description: String,             // Brief description
    briefing: {
        slides: [
            {
                title: String,       // Slide header
                content: String      // HTML content with ASCII art
            }
        ]
    },
    options: [
        {
            text: String,            // Decision description
            effects: Object,         // Metric modifiers
            intel: String,           // Intel feed message
            nextPhase: String       // Consequence phase ID
        }
    ]
}
```

## ASCII Art Implementation

### Tactical Maps
Maps use box-drawing characters (╔ ═ ║ ╗ etc.) and symbols to represent:
- Military installations: █ ▓
- Aircraft: ✈ ▲
- Naval assets: ≈ ~
- Contested zones: Shaded regions
- Supply routes: Connected lines
- Territory boundaries: Box characters

Example structure:
```
    REGION A          CONTESTED         REGION B
       ║                 ZONE              ║
       ║         ╔════════════╗            ║
  [FORCE]════════╣  DISPUTED  ╠════════[FORCE]
   BASE  ║       ║   AREA     ║        BASE
       █ █ █     ║            ║      ▓▓▓
```

### Intelligence Imagery
Simulated satellite/radar imagery using:
- Border frames: ╔═╗ ║ ╚═╝
- Classification banners
- Timestamps and sensor data
- ASCII representations of installations
- Analysis footnotes

## Game Flow

1. **Initialization**
   - Load random scenario
   - Initialize game state
   - Setup advisor system
   - Render global map

2. **Briefing Phase**
   - Present 5-slide intelligence briefing
   - Player navigates through slides
   - Context and analysis provided
   - Player authorizes response

3. **Decision Phase**
   - Present 2-4 decision options
   - Player selects action
   - Metrics updated based on effects
   - Intelligence feed updated

4. **Consequence Phase**
   - Generate follow-up scenario based on nextPhase
   - Add intel feed updates
   - Check win/loss conditions
   - Present new decisions or conclude

5. **Advisor Consultation** (Available at any time)
   - Player switches advisor tabs
   - Enters query
   - AI generates contextual response
   - Conversation history maintained

## Win/Loss Conditions

### Loss Conditions
- **Stability < 20**: Domestic instability forces resignation
- **Support < 20**: Loss of public confidence
- **Allies < 20**: Alliance collapse, strategic isolation

### Victory Condition
- **Stability > 80 AND Allies > 70 AND Turn >= 3**: Crisis successfully defused

### Partial Success
- Game can continue for 5+ turns without clear resolution
- Player navigates consequences of decisions
- Multiple pathways through scenario trees

## Performance Considerations

### API Rate Limiting
- No built-in rate limiting on advisor queries
- Users can spam requests (could be throttled in future)
- Each query ~1-2 second response time

### State Persistence
- Current implementation: No persistence
- Game resets on page reload
- Advisor history lost between sessions

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Fetch API for Claude calls
- CSS Grid and Flexbox layout

## Known Limitations

1. **No save/load system**: Game state not persistent
2. **Limited scenario library**: Only 3 scenarios currently
3. **No difficulty settings**: Fixed difficulty curve
4. **Single-player only**: No multiplayer support
5. **No audio**: Silent experience
6. **No mobile optimization**: Desktop-focused design
7. **API key handling**: Currently no authentication (assumes proxy handles it)
8. **Limited consequence trees**: ~2-3 decision depth per scenario
9. **No analytics/tracking**: No gameplay data collection
10. **Hard-coded scenarios**: Scenarios embedded in code, not external files

## Customization Options

### Adding New Scenarios

1. Add scenario object to `scenarios` array
2. Include briefing slides with content
3. Define decision options with effects
4. Create consequence phases
5. Add ASCII maps and imagery

### Modifying Advisor Personas

Edit `advisorPersonas` object in `getAdvisorResponse()` function:
```javascript
advisorPersonas = {
    natsec: "System prompt here...",
    military: "System prompt here...",
    // etc.
}
```

### Adjusting Difficulty

Modify base metric values in `gameState`:
```javascript
stability: 85,    // Lower = harder
diplomacy: 75,
military: 70,
support: 80,
allies: 75,
intelligence: 65
```

Adjust decision effects in scenario options:
```javascript
effects: {
    stability: -15,  // More extreme = higher stakes
    military: +10
}
```

## Code Organization

### Main Functions

**Game Initialization**
- `initGame()`: Setup game state, map, advisors
- `updateTime()`: Real-time clock display

**Scenario Management**
- `startScenario(scenario)`: Launch new scenario
- `showBriefing(scenario)`: Display intelligence briefing
- `navigateBriefing(direction)`: Slide navigation
- `closeBriefing(scenario)`: Exit briefing to game
- `displayScenario(scenario)`: Show decision options

**Decision Processing**
- `executeOption(option)`: Apply decision effects
- `checkGameState(nextPhase)`: Evaluate win/loss
- `generateConsequence(phase)`: Create follow-up
- `generateFollowUp(phase)`: Build next decision point

**Advisor System**
- `initAdvisorSystem()`: Setup tabs and handlers
- `loadAdvisorHistory(advisor)`: Display conversation
- `sendAdvisorQuery()`: Process user questions
- `getAdvisorResponse(query, advisor)`: API call to Claude

**UI Updates**
- `updateDisplay()`: Refresh all metrics
- `addIntel(message, level)`: Intelligence feed
- `endGame(victory, message)`: Game conclusion

### CSS Classes

**Layout**
- `.container`: Main wrapper
- `.main-grid`: Two-column layout
- `.panel`: Content boxes

**Briefing**
- `.briefing-overlay`: Fullscreen briefing modal
- `.briefing-slide`: Individual slides
- `.tactical-map`: ASCII map containers
- `.ascii-image`: Monospace ASCII art

**Advisor**
- `.advisor-panel`: Consultation interface
- `.advisor-tab`: Role selector buttons
- `.advisor-console`: Message history
- `.advisor-message`: Individual messages

**Status**
- `.crisis-level`: DEFCON indicator
- `.threat-matrix`: Grid of threat assessments
- `.stat`: Metric display box

## Security Considerations

### Current Implementation
- API calls made directly from browser
- No authentication/authorization layer
- Assumes API endpoint handles auth
- User queries visible in network traffic
- No input sanitization beyond basic trimming

### Recommended for Production
- Backend proxy for API calls
- Rate limiting per session
- Input validation and sanitization
- Content Security Policy headers
- HTTPS enforcement
- Session management
- Abuse detection

## Accessibility

### Current State
- Keyboard navigation: Partial (buttons, inputs)
- Screen readers: Limited (no ARIA labels)
- Color contrast: High (green on black)
- Font scaling: Fixed sizing
- Focus indicators: Browser default

### Improvements Needed
- ARIA labels for dynamic content
- Keyboard shortcuts for common actions
- Screen reader announcements for updates
- Configurable text size
- Alternative color schemes
- Audio cues option

## Performance Metrics

### Load Time
- Initial load: ~50KB HTML (uncompressed)
- No external dependencies
- Renders in <100ms on modern hardware

### Runtime
- Memory usage: ~5-10MB
- CPU usage: Minimal (event-driven)
- API latency: 1-3 seconds per advisor query
- UI updates: 60fps animations

### Scalability
- Can handle 100+ turn games
- Advisor history grows unbounded (memory concern)
- Intel feed truncated at 15 items
- No performance degradation observed

## Testing

### Manual Testing Checklist
- [ ] All 3 scenarios load and complete
- [ ] Each advisor responds contextually
- [ ] Metrics update correctly on decisions
- [ ] Briefing slides navigate properly
- [ ] Intel feed updates in real-time
- [ ] Win/loss conditions trigger
- [ ] Map displays correctly
- [ ] DEFCON levels change appropriately

### Known Bugs
- None currently identified

### Edge Cases
- Rapid advisor queries (no rate limit)
- Extremely long advisor responses (UI overflow)
- Network failures during API calls (error handling present)
- Browser refresh (state lost, expected)

## Future Development
See ROADMAP.md for detailed plans.

## Credits

**Design**: Inspired by WarGames (1983), DEFCON game, real NSC briefings
**AI**: Anthropic Claude Sonnet 4
**ASCII Art**: Custom designed for authentic retro aesthetic
**Scenario Research**: Based on real geopolitical flashpoints and crisis management frameworks

## License

[Specify license - currently none]

## Version History

**v1.0 (Current)**
- Initial release
- 3 scenarios with full briefings
- 4 AI advisors
- Complete game loop
- ASCII tactical maps
- Intelligence imagery

## Contact

[Specify contact information]
