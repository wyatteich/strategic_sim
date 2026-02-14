// Entry point: boots the game, wires modules, handles save/restore

import { gameState, resetState, loadGame, clearSave, restoreFromSave, saveGame } from './state.js';
import { initTabs, updateTime, updateDisplay } from './ui.js';
import { addIntel } from './intel.js';
import { waitForLeaflet, initLeafletMap, setLeafletView } from './map.js';
import { initAdvisorSystem } from './advisors.js';
import { loadAllScenarios, loadScenarioById, loadScenarioManifest } from './scenarios.js';
import { startScenario, displayScenario } from './game.js';

// Expose addIntel globally so map.js can use it without circular imports
window._gameModules = { addIntel };

function hideLoadingScreen() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
    setTimeout(() => { overlay.style.display = 'none'; }, 600);
}

function showLoadingScreen(manifest, scenarios, saved) {
    const overlay = document.getElementById('loading-overlay');
    const cardsContainer = document.getElementById('scenario-cards');

    // Show continue button if save exists
    if (saved && !saved.gameOver && saved.scenarioId) {
        const continueSection = document.getElementById('continue-section');
        const continueDetail = document.getElementById('continue-detail');
        const entry = manifest.find(m => m.id === saved.scenarioId);
        const title = entry ? entry.title : saved.scenarioId;
        continueDetail.textContent = `${title} — Turn ${saved.turn || 1} — DEFCON ${saved.defcon || 5}`;
        continueSection.style.display = 'block';

        document.getElementById('continue-btn').addEventListener('click', () => {
            const scenario = scenarios.find(s => s.id === saved.scenarioId);
            if (scenario) {
                restoreFromSave(saved);
                gameState.scenario = scenario;
                updateDisplay();
                displayScenario(scenario);
                addIntel(`Game restored. Turn ${gameState.turn}, DEFCON ${gameState.defcon}.`, 'warning');
                if (saved.map && saved.map.view) {
                    setTimeout(() => setLeafletView(saved.map.view), 1000);
                }
                hideLoadingScreen();
            }
        });
    }

    // Render scenario cards from manifest
    cardsContainer.innerHTML = '';
    manifest.forEach(entry => {
        const diffClass = entry.difficulty === 'HIGH' ? 'difficulty-high'
            : entry.difficulty === 'MEDIUM' ? 'difficulty-medium' : '';

        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.innerHTML = `
            <div class="card-tags">
                <span class="card-tag">${entry.region}</span>
                <span class="card-tag ${diffClass}">${entry.difficulty}</span>
            </div>
            <div class="card-title">${entry.title}</div>
            <div class="card-description">${entry.description}</div>
        `;
        card.addEventListener('click', () => {
            const scenario = scenarios.find(s => s.id === entry.id);
            if (scenario) {
                // Clear any existing save when starting a new scenario
                clearSave();
                resetState();
                updateDisplay();
                startScenario(scenario);
                hideLoadingScreen();
            }
        });
        cardsContainer.appendChild(card);
    });

    overlay.style.display = 'flex';
}

async function boot() {
    // Initialize UI
    initTabs();
    updateTime();
    setInterval(updateTime, 1000);

    // Load manifest first (for card display), then full scenarios
    let manifest, scenarios;
    try {
        manifest = await loadScenarioManifest();
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

    // Show loading screen with scenario selection
    showLoadingScreen(manifest, scenarios, saved);
}

// Wire up restart button
document.getElementById('restart-btn').addEventListener('click', () => {
    clearSave();
    location.reload();
});

// Boot
boot();
