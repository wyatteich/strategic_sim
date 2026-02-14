// UI utilities: escapeHTML, tabs, display updates, time

import { gameState } from './state.js';

export function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Tab system
export function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
}

export function switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`).classList.add('active');

    // If switching to map, refresh size
    if (tabId === 'map' && window._leafletMap) {
        setTimeout(() => window._leafletMap.invalidateSize(), 100);
    }
}

// Display updates
export function updateDisplay() {
    document.getElementById('stability').textContent = gameState.stability;
    document.getElementById('diplomacy').textContent = gameState.diplomacy;
    document.getElementById('military').textContent = gameState.military;
    document.getElementById('support').textContent = gameState.support;
    document.getElementById('allies').textContent = gameState.allies;
    document.getElementById('intelligence').textContent = gameState.intelligence;

    document.getElementById('stability-bar').style.width = gameState.stability + '%';
    document.getElementById('diplomacy-bar').style.width = gameState.diplomacy + '%';
    document.getElementById('military-bar').style.width = gameState.military + '%';
    document.getElementById('support-bar').style.width = gameState.support + '%';
    document.getElementById('allies-bar').style.width = gameState.allies + '%';
    document.getElementById('intelligence-bar').style.width = gameState.intelligence + '%';

    const defconEl = document.getElementById('crisis-level');
    defconEl.textContent = `DEFCON ${gameState.defcon}`;
    defconEl.className = `crisis-level level-${6 - gameState.defcon}`;
}

export function updateTime() {
    const now = new Date();
    const el = document.getElementById('current-time');
    if (el) {
        el.textContent = `SIMULATION TIME: ${now.toISOString().replace('T', ' ').substr(0, 19)} ZULU`;
    }
}
