# Quick Start Guide

## Running the Game

### Current Version (Single File)
1. Open `crisis_simulation.html` in any modern browser
2. No build process or dependencies required
3. Game runs entirely client-side

### Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (for AI advisor API calls)

## File Structure

```
project/
├── crisis_simulation.html    # Complete game (single file)
├── DOCUMENTATION.md          # Comprehensive documentation
├── ROADMAP.md               # Development roadmap
└── QUICKSTART.md            # This file
```

## Making Your First Modification

### Adding a New Scenario

1. **Locate the scenarios array** (~line 500 in the HTML)

2. **Copy an existing scenario object** as template

3. **Customize the scenario:**

```javascript
{
    id: 'your_scenario_id',
    title: 'YOUR CRISIS TITLE',
    description: 'Brief crisis description...',
    briefing: {
        slides: [
            {
                title: 'SLIDE TITLE',
                content: `
                    <div class="slide-section">
                        <h3>Section Header</h3>
                        <div class="slide-text">
                            Your content here...
                        </div>
                    </div>
                `
            }
            // Add 4-5 slides
        ]
    },
    options: [
        {
            text: 'Decision option text',
            effects: {
                stability: -10,
                diplomacy: +5,
                // etc.
            },
            intel: 'Intelligence feed message',
            nextPhase: 'consequence_phase_id'
        }
        // Add 2-4 options
    ]
}
```

4. **Save and refresh browser**

### Modifying Advisor Personalities

Find `advisorPersonas` object in `getAdvisorResponse()` function:

```javascript
const advisorPersonas = {
    natsec: `Your custom NSA persona here...`,
    military: `Your custom military advisor...`,
    // etc.
}
```

### Changing Initial Metrics

Modify `gameState` initialization:

```javascript
let gameState = {
    stability: 85,    // Change starting values
    diplomacy: 75,
    military: 70,
    support: 80,
    allies: 75,
    intelligence: 65,
    // etc.
}
```

## Creating ASCII Art

### Box Drawing Characters

```
╔═══╗  ┌───┐  ┏━━━┓
║   ║  │   │  ┃   ┃
╚═══╝  └───┘  ┗━━━┛

═ ─ ━  Horizontal
║ │ ┃  Vertical
╔ ┌ ┏  Top-left
╗ ┐ ┓  Top-right
╚ └ ┗  Bottom-left
╝ ┘ ┛  Bottom-right
```

### Common Symbols

```
█ ▓ ▒ ░  Shading
✓ ✗      Check/cross
▲ ▼ ◄ ►  Arrows
★ ✦ ✧    Stars
≈ ~ ≋    Water/waves
```

### Tactical Map Template

```javascript
content: `
    <div class="tactical-map">
        <div class="ascii-image">
            YOUR REGION    CONTESTED     THEIR REGION
                ║             ZONE            ║
                ║      ╔════════════╗         ║
           [US]═╬══════╣  DISPUTED  ╠═════════╬[THEM]
           BASE ║      ║   AREA     ║         ║ BASE
              █ █ █    ║            ║       ▓▓▓
        </div>
    </div>
`
```

## Testing Your Changes

### Manual Testing Checklist
- [ ] Scenario loads without errors
- [ ] All briefing slides display correctly
- [ ] Decision options appear
- [ ] Metrics update when decision made
- [ ] Intel feed updates
- [ ] Advisor queries work
- [ ] Game doesn't crash

### Browser Console
- Press F12 to open developer tools
- Check console for errors
- Test with console open

## Common Issues

### API Errors
**Problem:** "Advisor consultation unavailable"
**Solution:** Check internet connection, Claude API endpoint working

### Display Issues
**Problem:** ASCII art looks broken
**Solution:** Ensure using `<div class="ascii-image">` with proper spacing

### Metric Issues
**Problem:** Metrics going negative or >100
**Solution:** Add bounds checking: `Math.max(0, Math.min(100, value))`

### Briefing Navigation
**Problem:** Slides not advancing
**Solution:** Check `briefing.slides` array length matches `totalSlides`

## Development Workflow

### Recommended Process
1. Make small changes
2. Test in browser immediately
3. Use browser devtools to debug
4. Save working versions frequently
5. Document your changes

### Version Control
If using Git:
```bash
git init
git add crisis_simulation.html
git commit -m "Initial version"

# After changes
git add .
git commit -m "Added new scenario: X"
```

## Extending the Game

### Adding New Advisor Roles

1. Add tab in HTML:
```html
<button class="advisor-tab" data-advisor="economist">ECONOMIST</button>
```

2. Add history object:
```javascript
advisorHistory: {
    // existing advisors...
    economist: []
}
```

3. Add persona:
```javascript
advisorPersonas = {
    // existing personas...
    economist: `You are the Chair of the Council of Economic Advisors...`
}
```

### Adding New Metrics

1. Add to game state:
```javascript
gameState = {
    // existing metrics...
    economy: 75,
    technology: 60
}
```

2. Add display:
```html
<div class="stat">
    <div class="stat-label">ECONOMY</div>
    <div class="stat-value" id="economy">75</div>
</div>
```

3. Update display function:
```javascript
function updateDisplay() {
    // existing updates...
    document.getElementById('economy').textContent = gameState.economy;
}
```

## Performance Tips

### Keep It Fast
- Limit advisor history to last 20 messages
- Truncate intel feed at 15 items
- Don't store huge data structures
- Cache frequently used calculations

### Memory Management
- Clear old game states
- Reset on new game
- Avoid memory leaks in event listeners

## Getting Help

### Resources
- DOCUMENTATION.md - Full technical documentation
- ROADMAP.md - Future development plans
- Browser DevTools - Inspect and debug
- Console logs - Check for errors

### Debug Mode
Add this temporarily for debugging:
```javascript
console.log('Game state:', gameState);
console.log('Current scenario:', gameState.scenario);
```

## Next Steps

1. **Familiarize yourself** - Play through all scenarios
2. **Read DOCUMENTATION.md** - Understand architecture
3. **Make small changes** - Add a simple scenario
4. **Experiment** - Try new features
5. **Read ROADMAP.md** - See future possibilities

## Quick Reference

### Key Functions
- `startScenario(scenario)` - Initialize new scenario
- `executeOption(option)` - Process player decision
- `sendAdvisorQuery()` - Query AI advisor
- `updateDisplay()` - Refresh UI
- `addIntel(message, level)` - Add to intel feed

### Key Variables
- `gameState` - Current game state
- `scenarios` - All scenario data
- `regions` - Map region data
- `advisorPersonas` - AI advisor personalities

### CSS Classes
- `.panel` - Content boxes
- `.briefing-slide` - Briefing slides
- `.ascii-image` - ASCII art containers
- `.option-btn` - Decision buttons
- `.advisor-message` - Chat messages

## Have Fun!

This is a proof-of-concept with enormous potential. The multiplayer ideas in the roadmap are particularly exciting. Don't be afraid to experiment and break things - that's how the best features emerge.

The code is intentionally straightforward to encourage modification. As you implement features from the roadmap, you'll naturally refactor toward better architecture.

Most importantly: **Make it your own.** This framework supports countless variations - historical crises, sci-fi scenarios, corporate strategy, whatever interests you.

Good luck building the future of crisis management simulation!
