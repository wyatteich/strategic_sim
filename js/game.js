// Game flow: scenarios, briefing, options, win/loss

import { gameState, saveGame, clearSave } from './state.js';
import { updateDisplay } from './ui.js';
import { addIntel } from './intel.js';
import { initializeMapForScenario, updateMapForDecision } from './map.js';
import { submitPlayerCommand, approveOrders, modifyOrders, cancelOrders, showSuggestedOptions } from './commands.js';

export function startScenario(scenario) {
    gameState.scenario = scenario;
    gameState.turn++;

    if (scenario.briefing && scenario.briefing.slides) {
        showBriefing(scenario);
    } else {
        displayScenario(scenario);
    }
}

function showBriefing(scenario) {
    const overlay = document.getElementById('briefing-overlay');
    const content = document.getElementById('briefing-content');
    const title = document.getElementById('briefing-title');

    title.textContent = scenario.title;

    gameState.briefing.slides = scenario.briefing.slides;
    gameState.briefing.totalSlides = scenario.briefing.slides.length;
    gameState.briefing.currentSlide = 0;

    content.innerHTML = scenario.briefing.slides.map((slide, index) => `
        <div class="briefing-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <div class="slide-title">${slide.title}</div>
            ${slide.content}
        </div>
    `).join('');

    document.getElementById('current-slide').textContent = '1';
    document.getElementById('total-slides').textContent = gameState.briefing.totalSlides;
    document.getElementById('prev-slide').disabled = true;
    document.getElementById('next-slide').disabled = false;
    document.getElementById('begin-scenario').style.display = 'none';

    overlay.classList.add('show');

    document.getElementById('prev-slide').onclick = () => navigateBriefing(-1);
    document.getElementById('next-slide').onclick = () => navigateBriefing(1);
    document.getElementById('begin-scenario').onclick = () => closeBriefing(scenario);
}

function navigateBriefing(direction) {
    const newSlide = gameState.briefing.currentSlide + direction;

    if (newSlide < 0 || newSlide >= gameState.briefing.totalSlides) return;

    document.querySelectorAll('.briefing-slide').forEach(slide => {
        slide.classList.remove('active');
    });

    document.querySelector(`[data-slide="${newSlide}"]`).classList.add('active');
    gameState.briefing.currentSlide = newSlide;

    document.getElementById('current-slide').textContent = newSlide + 1;
    document.getElementById('prev-slide').disabled = newSlide === 0;

    if (newSlide === gameState.briefing.totalSlides - 1) {
        document.getElementById('next-slide').style.display = 'none';
        document.getElementById('begin-scenario').style.display = 'inline-block';
    } else {
        document.getElementById('next-slide').style.display = 'inline-block';
        document.getElementById('begin-scenario').style.display = 'none';
    }
}

function closeBriefing(scenario) {
    document.getElementById('briefing-overlay').classList.remove('show');
    displayScenario(scenario);
    addIntel('Briefing complete. Crisis response authorized. Standing by for your decision.', 'critical');
    saveGame();
}

export function displayScenario(scenario) {
    document.getElementById('situation-text').innerHTML = `
        <div style="font-weight: bold; color: #ffff00; margin-bottom: 10px;">${scenario.title}</div>
        <div>${scenario.description}</div>
    `;

    if (gameState.commandMode) {
        document.getElementById('command-interface').style.display = 'block';
        document.getElementById('options-container').style.display = 'none';

        document.getElementById('submit-command').onclick = submitPlayerCommand;
        document.getElementById('show-suggested-options').onclick = showSuggestedOptions;
        document.getElementById('approve-orders').onclick = approveOrders;
        document.getElementById('modify-orders').onclick = modifyOrders;
        document.getElementById('cancel-orders').onclick = cancelOrders;
    } else {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.style.display = 'block';
        document.getElementById('command-interface').style.display = 'none';
        optionsContainer.innerHTML = '<div class="panel-title">RESPONSE OPTIONS</div>';

        scenario.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = `[${index + 1}] ${option.text}`;
            btn.onclick = () => executeOption(option);
            optionsContainer.appendChild(btn);
        });
    }

    addIntel(`New crisis detected: ${scenario.title}`, 'critical');
    initializeMapForScenario(scenario);
}

function executeOption(option) {
    Object.keys(option.effects).forEach(key => {
        if (gameState[key] !== undefined) {
            gameState[key] = Math.max(0, Math.min(100, gameState[key] + option.effects[key]));
        }
    });

    if (gameState.stability < 30) gameState.defcon = 2;
    else if (gameState.stability < 50) gameState.defcon = 3;
    else if (gameState.stability < 70) gameState.defcon = 4;
    else gameState.defcon = 5;

    updateDisplay();
    addIntel(option.intel, gameState.stability < 40 ? 'critical' : 'warning');
    updateMapForDecision(option);
    saveGame();

    setTimeout(() => checkGameState(option.nextPhase), 1500);
}

function checkGameState(nextPhase) {
    if (gameState.stability < 20 || gameState.support < 20) {
        endGame(false, 'Domestic instability has forced your resignation.');
        return;
    }

    if (gameState.allies < 20) {
        endGame(false, 'Alliance structure has collapsed.');
        return;
    }

    if (gameState.stability > 80 && gameState.allies > 70 && gameState.turn >= 3) {
        endGame(true, 'Through careful maneuvering, the crisis has been defused.');
        return;
    }

    generateConsequence(nextPhase);
}

function generateConsequence(phase) {
    const consequences = {
        escalation: [
            'Enemy forces respond with their own deployments. Regional tension increases significantly.',
            'Allied partners express concern about escalation trajectory. Intelligence indicates mobilization.',
            'International media reports crisis as "brink of conflict." Markets volatile.'
        ],
        negotiation: [
            'Backchannels produce preliminary framework. Details remain contentious.',
            'Hardliners on both sides criticize negotiation approach as weakness.',
            'Intelligence suggests enemy buying time to consolidate position.'
        ],
        coalition: [
            'Partners agree to coordinate but disagree on specific actions. Unity fragile.',
            'Joint statement released. Impact on adversary unclear.',
            'Smaller allies request security guarantees before full commitment.'
        ],
        economic_war: [
            'Sanctions begin to bite but also impact allied economies. Public pressure mounting.',
            'Counter-sanctions announced. Global supply chains disrupted.',
            'Economic warfare opens new fronts. Financial markets react negatively.'
        ]
    };

    const options = consequences[phase] || consequences.escalation;
    const consequence = options[Math.floor(Math.random() * options.length)];

    addIntel(consequence, 'warning');

    setTimeout(() => {
        if (gameState.turn < 5 && !gameState.gameOver) {
            generateFollowUp(phase);
        }
    }, 2000);
}

function generateFollowUp(phase) {
    const followUps = {
        escalation: {
            description: 'Enemy forces continue buildup. Your military commanders request authorization for pre-emptive positioning. Allies watching closely.',
            options: [
                {
                    text: 'Authorize military positioning while pursuing de-escalation',
                    effects: {stability: -5, military: 10, diplomacy: 5, allies: 5},
                    intel: 'Forces positioned. Diplomatic channels remain open. Tense equilibrium.',
                    nextPhase: 'standoff'
                },
                {
                    text: 'Pull back and propose crisis resolution mechanism',
                    effects: {stability: 10, military: -15, diplomacy: 15, support: -10},
                    intel: 'Withdrawal announced. Enemy claims victory. Resolution talks scheduled.',
                    nextPhase: 'negotiation'
                }
            ]
        },
        negotiation: {
            description: 'Negotiations stall on key issues. Hardliners gaining influence. Opportunity for breakthrough or collapse.',
            options: [
                {
                    text: 'Offer significant concessions to break deadlock',
                    effects: {stability: 15, diplomacy: 10, support: -15, allies: -10},
                    intel: 'Concessions accepted. Agreement in sight. Domestic backlash building.',
                    nextPhase: 'resolution'
                },
                {
                    text: 'Hold firm on core demands',
                    effects: {stability: -10, support: 10, diplomacy: -10, military: 5},
                    intel: 'Negotiations suspended. Enemy issues ultimatum. Countdown initiated.',
                    nextPhase: 'ultimatum'
                }
            ]
        }
    };

    const followUp = followUps[phase] || followUps.escalation;

    document.getElementById('situation-text').innerHTML = `
        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 10px;">SITUATION DEVELOPMENT</div>
        <div>${followUp.description}</div>
    `;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '<div class="panel-title">RESPONSE OPTIONS</div>';

    followUp.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = `[${index + 1}] ${option.text}`;
        btn.onclick = () => executeOption(option);
        optionsContainer.appendChild(btn);
    });
}

export function endGame(victory, message) {
    gameState.gameOver = true;
    clearSave();

    const gameOver = document.getElementById('game-over');
    document.getElementById('game-over-title').textContent =
        victory ? 'CRISIS RESOLVED' : 'SCENARIO FAILURE';
    document.getElementById('game-over-text').textContent = message;
    gameOver.classList.add('show');

    addIntel(message, victory ? '' : 'critical');
}
