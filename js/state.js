// Central game state and persistence

const DEFAULT_STATE = {
    turn: 0,
    stability: 85,
    diplomacy: 75,
    military: 70,
    support: 80,
    allies: 75,
    intelligence: 65,
    defcon: 5,
    scenario: null,
    regions: {},
    gameOver: false,
    currentAdvisor: 'natsec',
    advisorHistory: {
        natsec: [],
        military: [],
        state: [],
        intel: []
    },
    briefing: {
        currentSlide: 0,
        totalSlides: 0,
        slides: []
    },
    map: {
        view: 'world',
        zoom: 1,
        centerX: 0,
        centerY: 0,
        threats: [],
        forces: [],
        movements: []
    },
    commandMode: true,
    currentOrders: null,
    documents: []
};

export let gameState = structuredClone(DEFAULT_STATE);

export function resetState() {
    Object.assign(gameState, structuredClone(DEFAULT_STATE));
}

// --- Persistence ---

const SAVE_KEY = 'crisis_sim_save';

export function saveGame() {
    try {
        const saveable = {
            turn: gameState.turn,
            stability: gameState.stability,
            diplomacy: gameState.diplomacy,
            military: gameState.military,
            support: gameState.support,
            allies: gameState.allies,
            intelligence: gameState.intelligence,
            defcon: gameState.defcon,
            scenarioId: gameState.scenario ? gameState.scenario.id : null,
            gameOver: gameState.gameOver,
            commandMode: gameState.commandMode,
            documents: gameState.documents || [],
            map: {
                view: gameState.map.view
            }
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveable));
    } catch (e) {
        console.error('Failed to save game:', e);
    }
}

export function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load save:', e);
        return null;
    }
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}

export function restoreFromSave(saved) {
    gameState.turn = saved.turn;
    gameState.stability = saved.stability;
    gameState.diplomacy = saved.diplomacy;
    gameState.military = saved.military;
    gameState.support = saved.support;
    gameState.allies = saved.allies;
    gameState.intelligence = saved.intelligence;
    gameState.defcon = saved.defcon;
    gameState.gameOver = saved.gameOver;
    gameState.commandMode = saved.commandMode;
    gameState.documents = saved.documents || [];
    if (saved.map) {
        gameState.map.view = saved.map.view || 'world';
    }
}
