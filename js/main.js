// Entry point: boots the game, wires modules, handles save/restore

import { gameState, resetState, loadGame, clearSave, restoreFromSave, saveGame } from './state.js';
import { initTabs, updateTime, updateDisplay } from './ui.js';
import { addIntel } from './intel.js';
import { waitForLeaflet, initLeafletMap, setLeafletView } from './map.js';
import { initAdvisorSystem } from './advisors.js';
import { loadAllScenarios, loadScenarioById } from './scenarios.js';
import { startScenario, displayScenario } from './game.js';

// Expose addIntel globally so map.js can use it without circular imports
window._gameModules = { addIntel };

async function boot() {
    // Initialize UI
    initTabs();
    updateTime();
    setInterval(updateTime, 1000);

    // Load scenarios from JSON
    let scenarios;
    try {
        scenarios = await loadAllScenarios();
        console.log(`Loaded ${scenarios.length} scenarios`);
    } catch (error) {
        console.error('Failed to load scenarios:', error);
        addIntel('ERROR: Failed to load scenario data.', 'critical');
        return;
    }

    // Initialize map (async, non-blocking)
    waitForLeaflet().then(() => {
        initLeafletMap();
    }).catch((error) => {
        console.error('Failed to load Leaflet:', error);
        document.getElementById('wireframe-map').innerHTML =
            '<div style="color: #ff0000; padding: 20px; text-align: center;">MAP UNAVAILABLE: External map library failed to load.</div>';
    });

    // Initialize advisor system
    initAdvisorSystem();

    // Check for saved game
    const saved = loadGame();
    if (saved && !saved.gameOver && saved.scenarioId) {
        try {
            const scenario = scenarios.find(s => s.id === saved.scenarioId);
            if (scenario) {
                restoreFromSave(saved);
                gameState.scenario = scenario;
                updateDisplay();
                displayScenario(scenario);
                addIntel(`Game restored. Turn ${gameState.turn}, DEFCON ${gameState.defcon}.`, 'warning');

                // Restore map view
                if (saved.map && saved.map.view) {
                    setTimeout(() => setLeafletView(saved.map.view), 1000);
                }
                return;
            }
        } catch (e) {
            console.error('Failed to restore save:', e);
            clearSave();
        }
    }

    // Fresh start: pick random scenario
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    startScenario(scenario);
}

// Wire up restart button
document.getElementById('restart-btn').addEventListener('click', () => {
    clearSave();
    location.reload();
});

// Boot
boot();
