// Natural language command processing

import { gameState, saveGame } from './state.js';
import { callCommand, callGameMaster } from './api.js';
import { updateDisplay } from './ui.js';
import { addIntel } from './intel.js';
import { visualizeOrders, addForceMovement, addThreat } from './map.js';

let isProcessingCommand = false;

export async function submitPlayerCommand() {
    if (isProcessingCommand) return;

    const commandInput = document.getElementById('player-command');
    const command = commandInput.value.trim();

    if (!command) {
        addIntel('ERROR: No command entered.', 'critical');
        return;
    }

    isProcessingCommand = true;
    document.getElementById('processing-indicator').style.display = 'block';
    document.getElementById('submit-command').disabled = true;

    addIntel(`Processing command: "${command.substring(0, 60)}${command.length > 60 ? '...' : ''}"`, 'warning');

    try {
        const orders = await interpretCommand(command);

        document.getElementById('processing-indicator').style.display = 'none';
        document.getElementById('submit-command').disabled = false;
        isProcessingCommand = false;

        if (orders.clarifications_needed && orders.clarifications_needed.length > 0) {
            addIntel(`CLARIFICATION REQUIRED: ${orders.clarifications_needed.join(' ')}`, 'warning');
            return;
        }

        if (!orders.feasibility.possible) {
            addIntel(`ORDER REJECTED: ${orders.feasibility.issues.join(' ')}`, 'critical');
            return;
        }

        gameState.currentOrders = orders;
        displayOrderReview(orders);

    } catch (error) {
        console.error('Error processing command:', error);
        addIntel(`ERROR: ${error.message || 'Failed to process command.'}`, 'critical');
        document.getElementById('processing-indicator').style.display = 'none';
        document.getElementById('submit-command').disabled = false;
        isProcessingCommand = false;
    }
}

async function interpretCommand(command) {
    const data = await callCommand([{
        role: 'user',
        content: `You are the game master for a geopolitical crisis simulation. Parse the player's command into executable orders.

CURRENT GAME STATE:
- Scenario: ${gameState.scenario.title}
- Turn: ${gameState.turn}
- Stability: ${gameState.stability}/100
- Diplomacy: ${gameState.diplomacy}/100
- Military Readiness: ${gameState.military}/100
- Public Support: ${gameState.support}/100
- Allied Confidence: ${gameState.allies}/100
- Intelligence: ${gameState.intelligence}/100
- DEFCON: ${gameState.defcon}

SCENARIO CONTEXT:
${gameState.scenario.description}

PLAYER COMMAND:
"${command}"

Parse this into structured orders. Respond with VALID JSON only (no markdown, no code blocks, no +/- signs on numbers):
{
    "orders": [
        {
            "type": "military|diplomatic|economic|intelligence|public_statement",
            "action": "specific action description",
            "target": "who/what/where",
            "timeline": "immediate|hours|days|weeks",
            "intensity": "low|medium|high"
        }
    ],
    "predicted_effects": {
        "stability": -20,
        "diplomacy": 10,
        "military": 5,
        "support": -5,
        "allies": 15,
        "intelligence": 0
    },
    "risks": ["specific risk 1", "specific risk 2"],
    "opportunities": ["potential positive outcome 1"],
    "feasibility": {
        "possible": true,
        "issues": []
    },
    "clarifications_needed": []
}

CRITICAL: Use plain numbers without + or - prefixes. Example: "stability": 10 NOT "stability": +10

IMPORTANT RULES:
1. Be realistic - predict actual consequences
2. Allow catastrophic decisions (nukes, full mobilization) but show severe consequences
3. Flag unclear/vague commands in clarifications_needed
4. If command is gibberish or impossible, set feasibility.possible to false
5. Larger actions have larger effects (both positive and negative)
6. Consider current metrics - low military readiness limits military options`
    }]);

    let text = data.content[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    text = text.replace(/:\s*\+(\d+)/g, ': $1');

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Failed to parse AI response. Please try a different command.');
    }
}

function displayOrderReview(orders) {
    const reviewPanel = document.getElementById('order-review');
    const detailsDiv = document.getElementById('order-details');

    let html = '';

    html += '<div class="order-section"><h4>Parsed Orders</h4>';
    orders.orders.forEach((order, i) => {
        html += `<div class="order-item">
            <strong>${i + 1}. ${order.type.toUpperCase()}:</strong> ${order.action}<br>
            <span style="font-size: 10px; color: #6bb3ff;">
                Target: ${order.target} | Timeline: ${order.timeline} | Intensity: ${order.intensity}
            </span>
        </div>`;
    });
    html += '</div>';

    html += '<div class="order-section"><h4>Predicted Effects</h4>';
    Object.keys(orders.predicted_effects).forEach(metric => {
        const value = orders.predicted_effects[metric];
        const color = value > 0 ? 'effect-positive' : value < 0 ? 'effect-negative' : 'effect-neutral';
        const sign = value > 0 ? '+' : '';
        html += `<div class="order-item ${color}">${metric.toUpperCase()}: ${sign}${value}</div>`;
    });
    html += '</div>';

    if (orders.risks && orders.risks.length > 0) {
        html += '<div class="order-section"><h4>Risks</h4>';
        orders.risks.forEach(risk => {
            const severity = risk.toLowerCase().includes('catastrophic') ||
                           risk.toLowerCase().includes('war') ||
                           risk.toLowerCase().includes('nuclear') ? 'critical-warning' : 'risk-warning';
            html += `<div class="${severity}">⚠ ${risk}</div>`;
        });
        html += '</div>';
    }

    if (orders.opportunities && orders.opportunities.length > 0) {
        html += '<div class="order-section"><h4>Opportunities</h4>';
        orders.opportunities.forEach(opp => {
            html += `<div class="order-item effect-positive">✓ ${opp}</div>`;
        });
        html += '</div>';
    }

    detailsDiv.innerHTML = html;
    reviewPanel.style.display = 'block';
    document.getElementById('command-interface').style.display = 'none';

    addIntel('Orders parsed and ready for review.', 'warning');
}

export async function approveOrders() {
    const orders = gameState.currentOrders;
    if (!orders) return;

    addIntel('ORDERS APPROVED. Executing...', 'critical');
    document.getElementById('order-review').style.display = 'none';

    await executeOrders(orders);
}

export function modifyOrders() {
    document.getElementById('order-review').style.display = 'none';
    document.getElementById('command-interface').style.display = 'block';
    gameState.currentOrders = null;
    addIntel('Modify your orders and resubmit.', 'warning');
}

export function cancelOrders() {
    document.getElementById('order-review').style.display = 'none';
    document.getElementById('command-interface').style.display = 'block';
    document.getElementById('player-command').value = '';
    gameState.currentOrders = null;
    addIntel('Orders cancelled.', 'warning');
}

export async function showSuggestedOptions() {
    addIntel('Generating suggested response options...', 'warning');

    try {
        const data = await callGameMaster([{
            role: 'user',
            content: `Suggest 3-4 response options for this crisis situation:

SCENARIO: ${gameState.scenario.title}
DESCRIPTION: ${gameState.scenario.description}
CURRENT STATE: Stability ${gameState.stability}, DEFCON ${gameState.defcon}

Provide 3-4 brief command suggestions (one line each) ranging from cautious to aggressive. Output as plain text list.`
        }]);

        const suggestions = data.content[0].text;
        addIntel(`SUGGESTED OPTIONS:\n${suggestions}`, 'warning');
    } catch (error) {
        console.error('Error getting suggestions:', error);
        addIntel('Failed to generate suggestions.', 'critical');
    }
}

async function executeOrders(orders) {
    // Apply metric changes
    Object.keys(orders.predicted_effects).forEach(metric => {
        if (gameState[metric] !== undefined) {
            gameState[metric] = Math.max(0, Math.min(100,
                gameState[metric] + orders.predicted_effects[metric]));
        }
    });

    // Update DEFCON
    if (gameState.stability < 30) gameState.defcon = 2;
    else if (gameState.stability < 50) gameState.defcon = 3;
    else if (gameState.stability < 70) gameState.defcon = 4;
    else gameState.defcon = 5;

    updateDisplay();
    saveGame();

    visualizeOrders(orders);

    const adversaryResponse = await generateAdversaryResponse(orders);
    addIntel(`ADVERSARY RESPONSE: ${adversaryResponse}`, 'critical');

    setTimeout(() => checkGameStateNL(orders), 2000);
}

async function generateAdversaryResponse(orders) {
    try {
        const data = await callGameMaster([{
            role: 'user',
            content: `You are simulating the adversary nation's response in a crisis.

SCENARIO: ${gameState.scenario.title}
PLAYER ORDERS: ${JSON.stringify(orders.orders)}
CURRENT DEFCON: ${gameState.defcon}
STABILITY: ${gameState.stability}

Generate a realistic adversary response (2-4 sentences). Consider:
- Proportional response doctrine
- Face-saving requirements
- Domestic pressures
- Strategic calculations
- Escalation ladder

Be realistic. If player did something catastrophic (nukes, full invasion), respond accordingly.
Output plain text only, no JSON.`
        }]);

        return data.content[0].text;
    } catch (error) {
        console.error('Adversary response error:', error);
        return 'Adversary response unclear. Intelligence gathering in progress.';
    }
}

async function checkGameStateNL(orders) {
    // Import endGame dynamically to avoid circular dependency
    const { endGame } = await import('./game.js');

    if (gameState.stability < 20 || gameState.support < 20) {
        endGame(false, 'Domestic instability has forced your resignation. The crisis continues without coherent leadership.');
        return;
    }

    if (gameState.allies < 20) {
        endGame(false, 'Alliance structure has collapsed. Isolated and vulnerable, strategic options have evaporated.');
        return;
    }

    const hasCatastrophicOrder = orders.orders.some(o =>
        o.action.toLowerCase().includes('nuclear') ||
        o.action.toLowerCase().includes('nuke') ||
        (o.intensity === 'high' && o.type === 'military' && gameState.stability < 30)
    );

    if (hasCatastrophicOrder) {
        endGame(false, 'Your orders triggered a catastrophic escalation spiral.');
        return;
    }

    if (gameState.stability > 80 && gameState.allies > 70 && gameState.turn >= 3) {
        endGame(true, 'Through careful maneuvering, the crisis has been defused.');
        return;
    }

    gameState.turn++;
    await generateNewSituation(orders);
}

async function generateNewSituation(orders) {
    addIntel('Generating next phase of crisis...', 'warning');

    try {
        const data = await callGameMaster([{
            role: 'user',
            content: `Generate the next phase of this crisis based on player actions.

SCENARIO: ${gameState.scenario.title}
PREVIOUS ORDERS: ${JSON.stringify(orders.orders)}
CURRENT STATE: Stability ${gameState.stability}, DEFCON ${gameState.defcon}, Turn ${gameState.turn}

Describe the new situation (2-3 sentences). What has developed? What new decisions does the player face?
Output plain text only.`
        }], 300);

        const newSituation = data.content[0].text;

        document.getElementById('situation-text').innerHTML = `
            <div style="font-weight: bold; color: #ffff00; margin-bottom: 10px;">TURN ${gameState.turn}: ${gameState.scenario.title}</div>
            <div>${newSituation}</div>
        `;

        document.getElementById('player-command').value = '';
        document.getElementById('command-interface').style.display = 'block';
        document.getElementById('order-review').style.display = 'none';
        gameState.currentOrders = null;

        addIntel(newSituation, 'warning');
        saveGame();

    } catch (error) {
        console.error('Error generating new situation:', error);
        addIntel('Failed to generate next phase. Crisis continues...', 'critical');
    }
}
