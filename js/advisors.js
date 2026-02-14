// Advisor system: AI-powered situation room

import { gameState, saveGame } from './state.js';
import { callAdvisor } from './api.js';
import { escapeHTML } from './ui.js';
import { addIntel } from './intel.js';

export function initAdvisorSystem() {
    if (!gameState.documents) gameState.documents = [];

    document.getElementById('advisor-send-btn').addEventListener('click', sendAdvisorQuery);
    document.getElementById('view-documents-btn').addEventListener('click', showDocumentLibrary);
    document.getElementById('advisor-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendAdvisorQuery();
        }
    });
}

async function sendAdvisorQuery() {
    const input = document.getElementById('advisor-input');
    const query = input.value.trim();

    if (!query || gameState.gameOver) return;

    addAdvisorMessage('user', 'YOU', query);
    input.value = '';

    document.getElementById('typing-indicator').classList.add('active');
    document.getElementById('advisor-send-btn').disabled = true;

    const responses = await getSituationRoomResponse(query);

    responses.forEach(response => {
        addAdvisorMessage('advisor', response.advisor, response.message, response.attachment);
    });

    document.getElementById('typing-indicator').classList.remove('active');
    document.getElementById('advisor-send-btn').disabled = false;
}

async function getSituationRoomResponse(query) {
    const situationContext = `
CURRENT CRISIS: ${gameState.scenario ? gameState.scenario.title : 'Standby'}
TURN: ${gameState.turn}
STRATEGIC METRICS:
- Stability: ${gameState.stability}/100
- Diplomatic Capital: ${gameState.diplomacy}/100
- Military Readiness: ${gameState.military}/100
- Public Support: ${gameState.support}/100
- Allied Confidence: ${gameState.allies}/100
- Intelligence Score: ${gameState.intelligence}/100
- DEFCON: ${gameState.defcon}

${gameState.scenario ? 'SITUATION: ' + gameState.scenario.description : ''}
    `.trim();

    try {
        const data = await callAdvisor([{
            role: 'user',
            content: `You are running a National Security Council situation room. Advisors present:

- Rachel Chen (NSA - National Security Advisor): Strategic synthesis, balances all factors
- General Marcus Webb (SECDEF - Secretary of Defense): Military options, force readiness
- Ambassador Sarah Okonkwo (State - Secretary of State): Diplomacy, alliances, international law
- Director James Park (DNI - Director of National Intelligence): Intelligence analysis, enemy intentions

${situationContext}

QUESTION FROM PRESIDENT: "${query}"

Determine which advisor(s) should respond based on their expertise. Output VALID JSON ARRAY (no markdown, no code blocks):
[
    {
        "advisor": "Rachel Chen|General Webb|Ambassador Okonkwo|Director Park",
        "message": "Brief spoken response (2-3 sentences max, first person)",
        "attachment": "OPTIONAL: If question requests analysis/report, provide structured data here (intel report, force assessment, etc). Otherwise null. Keep under 150 words."
    }
]

RULES:
- Multiple advisors respond if question touches multiple domains
- Keep spoken message BRIEF (2-3 sentences)
- Only include attachment if question explicitly asks for analysis/report/assessment OR if complex data would help
- Advisors can disagree with each other
- Use first person ("I recommend..." not "NSA recommends...")
- If simple question, one advisor responds
- Return valid JSON array only`
        }]);

        let text = data.content[0].text;
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse advisor response:', e);
            return [{
                advisor: 'Rachel Chen',
                message: 'Technical difficulty in situation room. Please rephrase your question.',
                attachment: null
            }];
        }

    } catch (error) {
        console.error('Situation room error:', error);
        return [{
            advisor: 'Rachel Chen',
            message: 'Cannot reach server. Make sure the server is running (npm start).',
            attachment: null
        }];
    }
}

export function addAdvisorMessage(type, name, content, attachment = null) {
    const consoleEl = document.getElementById('advisor-console');

    const msgDiv = document.createElement('div');
    msgDiv.className = `advisor-message ${type}`;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'advisor-name';
    nameDiv.textContent = `[${name}]`;

    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;

    msgDiv.appendChild(nameDiv);
    msgDiv.appendChild(contentDiv);

    if (attachment) {
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const attachDiv = document.createElement('div');
        attachDiv.style.cssText = 'margin-top: 8px; padding: 8px; background: rgba(74, 158, 255, 0.1); border-left: 2px solid #4a9eff; font-size: 10px; cursor: pointer;';
        attachDiv.innerHTML = `
            <div style="color: #4a9eff; font-weight: bold; margin-bottom: 4px;">📎 ATTACHMENT (click to view)</div>
            <div style="color: #6bb3ff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(attachment.substring(0, 100))}...</div>
        `;

        attachDiv.onclick = () => openDocument(docId, name, attachment);
        msgDiv.appendChild(attachDiv);

        if (!gameState.documents) gameState.documents = [];
        gameState.documents.push({
            id: docId,
            author: name,
            content: attachment,
            timestamp: new Date().toISOString()
        });

        updateDocumentCount();
        saveGame();
    }

    consoleEl.appendChild(msgDiv);
    consoleEl.scrollTop = consoleEl.scrollHeight;

    while (consoleEl.children.length > 20) {
        consoleEl.removeChild(consoleEl.firstChild);
    }
}

export function openDocument(docId, author, content) {
    const existing = document.getElementById('document-viewer');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'document-viewer';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.9); z-index: 3000;
        display: flex; align-items: center; justify-content: center; padding: 20px;
    `;

    modal.innerHTML = `
        <div style="
            background: #001a33; border: 2px solid #4a9eff; padding: 20px;
            max-width: 700px; max-height: 80vh; overflow-y: auto;
            color: #ffb000; font-family: 'Courier New', monospace; font-size: 12px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #4a9eff;">
                <div>
                    <div style="color: #4a9eff; font-weight: bold;">CLASSIFIED DOCUMENT</div>
                    <div style="font-size: 10px; color: #6bb3ff; margin-top: 5px;">Author: ${escapeHTML(author)}</div>
                </div>
                <button id="close-document-viewer" style="
                    background: #1a2633; border: 1px solid #4a9eff; color: #ffb000;
                    padding: 5px 15px; cursor: pointer; font-family: 'Courier New', monospace;
                ">CLOSE</button>
            </div>
            <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHTML(content)}</div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#close-document-viewer').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// Expose for document library onclick
window.openDocument = openDocument;

function showDocumentLibrary() {
    const docs = gameState.documents || [];

    const modal = document.createElement('div');
    modal.id = 'document-library';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.9); z-index: 3000;
        display: flex; align-items: center; justify-content: center; padding: 20px;
    `;

    const docList = docs.length > 0
        ? docs.map(doc => {
            const preview = escapeHTML(doc.content.substring(0, 80));
            return `
                <div class="doc-library-item" data-doc-id="${doc.id}" style="
                    padding: 10px; border-left: 3px solid #4a9eff;
                    background: #001a33; margin-bottom: 10px; cursor: pointer;
                ">
                    <div style="color: #4a9eff; font-weight: bold; font-size: 11px;">${escapeHTML(doc.author)}</div>
                    <div style="color: #6bb3ff; font-size: 10px; margin-top: 3px;">${new Date(doc.timestamp).toLocaleString()}</div>
                    <div style="color: #ffb000; font-size: 11px; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${preview}...</div>
                </div>
            `;
        }).join('')
        : '<div style="color: #6bb3ff; text-align: center; padding: 20px;">No documents generated yet.</div>';

    modal.innerHTML = `
        <div style="
            background: #001a33; border: 2px solid #4a9eff; padding: 20px;
            max-width: 800px; width: 100%; max-height: 80vh; overflow-y: auto;
            color: #ffb000; font-family: 'Courier New', monospace; font-size: 12px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #4a9eff;">
                <div>
                    <div style="color: #4a9eff; font-weight: bold; font-size: 14px;">DOCUMENT LIBRARY</div>
                    <div style="font-size: 10px; color: #6bb3ff; margin-top: 5px;">${docs.length} document(s)</div>
                </div>
                <button id="close-doc-library" style="
                    background: #1a2633; border: 1px solid #4a9eff; color: #ffb000;
                    padding: 5px 15px; cursor: pointer; font-family: 'Courier New', monospace;
                ">CLOSE</button>
            </div>
            <div>${docList}</div>
        </div>
    `;

    document.body.appendChild(modal);

    // Wire up click handlers
    modal.querySelector('#close-doc-library').onclick = () => modal.remove();
    modal.querySelectorAll('.doc-library-item').forEach(item => {
        item.onclick = () => {
            const doc = docs.find(d => d.id === item.dataset.docId);
            if (doc) openDocument(doc.id, doc.author, doc.content);
        };
    });
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function updateDocumentCount() {
    const count = gameState.documents ? gameState.documents.length : 0;
    const counter = document.getElementById('doc-count');
    if (counter) counter.textContent = count;
}
