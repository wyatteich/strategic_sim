// Advisor system: AI-powered situation room with modular advisor profiles

import { gameState, saveGame } from './state.js';
import { callAdvisor } from './api.js';
import { escapeHTML } from './ui.js';
import { addIntel } from './intel.js';

// --- Advisor profile loader ---

let advisorProfiles = [];

async function loadAdvisorManifest() {
    const res = await fetch('advisors/manifest.json');
    if (!res.ok) throw new Error(`Failed to load advisor manifest: ${res.status}`);
    return res.json();
}

async function loadAdvisorProfile(filename) {
    const res = await fetch(`advisors/${filename}`);
    if (!res.ok) throw new Error(`Failed to load advisor ${filename}: ${res.status}`);
    return res.json();
}

async function loadAllAdvisors() {
    const manifest = await loadAdvisorManifest();
    const profiles = await Promise.all(manifest.map(entry => loadAdvisorProfile(entry.file)));
    return profiles;
}

function getAdvisorProfile(name) {
    if (!name) return null;
    const lower = name.toLowerCase();
    return advisorProfiles.find(a =>
        a.name.toLowerCase() === lower ||
        a.shortName.toLowerCase() === lower
    ) || null;
}

// --- Document rendering helpers ---

function classificationToCSS(classification) {
    if (!classification) return 'secret';
    const upper = classification.toUpperCase();
    if (upper.includes('TOP SECRET')) return 'top-secret';
    if (upper.includes('SECRET')) return 'secret';
    if (upper.includes('CONFIDENTIAL')) return 'confidential';
    return 'unclassified';
}

function generateDTG() {
    const now = new Date();
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hour = String(now.getUTCHours()).padStart(2, '0');
    const min = String(now.getUTCMinutes()).padStart(2, '0');
    const months = ['JAN','FEB','MAR','APR','MAY','JUN',
                    'JUL','AUG','SEP','OCT','NOV','DEC'];
    return `${day}${hour}${min}Z${months[now.getUTCMonth()]}${now.getUTCFullYear()}`;
}

function parseStructuredContent(content) {
    if (typeof content === 'object' && content !== null && content.docType) {
        return content;
    }
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            if (parsed && parsed.docType) return parsed;
        } catch (e) { /* plain text */ }
    }
    return null;
}

function renderStructuredDocument(doc, author) {
    const classLevel = classificationToCSS(doc.classification);
    const profile = getAdvisorProfile(author);
    const docLabel = (profile && profile.docLabel) || doc.docType || 'CLASSIFIED DOCUMENT';
    const fullTitle = (profile && profile.fullTitle) || author;
    const dtg = doc.dtg || generateDTG();

    const findingsHTML = (doc.keyFindings && doc.keyFindings.length > 0)
        ? `<div class="doc-section-title">KEY FINDINGS</div>
           <ul class="doc-key-findings">
             ${doc.keyFindings.map(f => `<li>${escapeHTML(f)}</li>`).join('')}
           </ul>`
        : '';

    const assessmentHTML = doc.assessment
        ? `<div class="doc-assessment">
             <div class="doc-assessment-label">ASSESSMENT</div>
             <div class="doc-assessment-text">${escapeHTML(doc.assessment)}</div>
           </div>`
        : '';

    return `
        <div class="doc-viewer-container" data-doc-type="${escapeHTML(doc.docType)}">
            <div class="doc-classification-banner ${classLevel}">
                ${escapeHTML(doc.classification || 'CLASSIFIED')}
            </div>
            <div class="doc-toolbar">
                <button class="doc-close-btn">CLOSE</button>
            </div>
            <div class="doc-header-block">
                <div class="doc-letterhead">
                    <div class="doc-letterhead-title">${escapeHTML(docLabel)}</div>
                    <div class="doc-letterhead-subtitle">UNITED STATES GOVERNMENT</div>
                </div>
                <div class="doc-meta-row">
                    <span class="doc-meta-label">DTG:</span>
                    <span class="doc-meta-value">${escapeHTML(dtg)}</span>
                </div>
                <div class="doc-meta-row">
                    <span class="doc-meta-label">FROM:</span>
                    <span class="doc-meta-value">${escapeHTML(fullTitle)}</span>
                </div>
                <div class="doc-meta-row">
                    <span class="doc-meta-label">TO:</span>
                    <span class="doc-meta-value">THE PRESIDENT</span>
                </div>
                <div class="doc-meta-row">
                    <span class="doc-meta-label">SUBJECT:</span>
                    <span class="doc-meta-value">${escapeHTML(doc.subject || 'N/A')}</span>
                </div>
                <div class="doc-ref-number">REF: ${escapeHTML(doc.refNumber || 'N/A')}</div>
            </div>
            <div class="doc-body">
                ${escapeHTML(doc.body || '')}
                ${findingsHTML}
                ${assessmentHTML}
            </div>
            <div class="doc-footer">
                DISTRIBUTION LIMITED — AUTHORIZED RECIPIENTS ONLY
            </div>
            <div class="doc-classification-banner ${classLevel}">
                ${escapeHTML(doc.classification || 'CLASSIFIED')}
            </div>
        </div>
    `;
}

function renderLegacyDocument(content, author) {
    return `
        <div class="doc-viewer-container" data-doc-type="LEGACY">
            <div class="doc-classification-banner secret">CLASSIFIED</div>
            <div class="doc-toolbar">
                <button class="doc-close-btn">CLOSE</button>
            </div>
            <div class="doc-header-block">
                <div class="doc-letterhead">
                    <div class="doc-letterhead-title">CLASSIFIED DOCUMENT</div>
                    <div class="doc-letterhead-subtitle">UNITED STATES GOVERNMENT</div>
                </div>
                <div class="doc-meta-row">
                    <span class="doc-meta-label">FROM:</span>
                    <span class="doc-meta-value">${escapeHTML(author)}</span>
                </div>
                <div class="doc-meta-row">
                    <span class="doc-meta-label">DTG:</span>
                    <span class="doc-meta-value">${generateDTG()}</span>
                </div>
            </div>
            <div class="doc-body">${escapeHTML(typeof content === 'string' ? content : JSON.stringify(content))}</div>
            <div class="doc-footer">
                DISTRIBUTION LIMITED — AUTHORIZED RECIPIENTS ONLY
            </div>
            <div class="doc-classification-banner secret">CLASSIFIED</div>
        </div>
    `;
}

// --- Attachment preview helper ---

function getAttachmentPreview(attachment) {
    const structured = parseStructuredContent(attachment);
    if (structured) {
        const typeLabel = structured.docType || 'DOCUMENT';
        const subject = structured.subject || '';
        return `[${typeLabel}] ${subject}`;
    }
    return String(attachment).substring(0, 100);
}

// --- Public API ---

export async function initAdvisorSystem() {
    if (!gameState.documents) gameState.documents = [];

    // Load advisor profiles
    try {
        advisorProfiles = await loadAllAdvisors();
        console.log(`Loaded ${advisorProfiles.length} advisor profiles`);
    } catch (error) {
        console.error('Failed to load advisor profiles:', error);
        addIntel('WARNING: Advisor profiles failed to load. Using defaults.', 'warning');
    }

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

    // Build advisor list from loaded profiles (or fallback to defaults)
    let advisorListText;
    if (advisorProfiles.length > 0) {
        advisorListText = advisorProfiles.map(a =>
            `- ${a.name} (${a.agency} - ${a.title}): ${a.role}\n  Personality: ${a.personality}\n  Background: ${a.background}`
        ).join('\n\n');
    } else {
        advisorListText = `- Rachel Chen (NSC - National Security Advisor): Strategic synthesis, balances all factors
- General Marcus Webb (DOD - Secretary of Defense): Military options, force readiness
- Ambassador Sarah Okonkwo (STATE - Secretary of State): Diplomacy, alliances, international law
- Director James Park (DNI - Director of National Intelligence): Intelligence analysis, enemy intentions`;
    }

    // Build valid advisor names for the response format
    const advisorNames = advisorProfiles.length > 0
        ? advisorProfiles.map(a => a.shortName).join('|')
        : 'Rachel Chen|General Webb|Ambassador Okonkwo|Director Park';

    try {
        const data = await callAdvisor([{
            role: 'user',
            content: `You are running a National Security Council situation room. Advisors present:

${advisorListText}

${situationContext}

QUESTION FROM PRESIDENT: "${query}"

Determine which advisor(s) should respond based on their expertise. Output VALID JSON ARRAY (no markdown, no code blocks):
[
    {
        "advisor": "${advisorNames}",
        "message": "Brief spoken response (2-3 sentences max, first person)",
        "attachment": "OPTIONAL. If question requests analysis/report/assessment OR complex data would help, return a JSON object (NOT a string):
{
  \\"docType\\": \\"INTEL_REPORT|MILITARY_ASSESSMENT|DIPLOMATIC_CABLE|NSC_MEMO\\",
  \\"classification\\": \\"TOP SECRET//SCI|SECRET//NOFORN|SECRET|CONFIDENTIAL\\",
  \\"refNumber\\": \\"e.g. IIR-2025-00347\\",
  \\"subject\\": \\"Brief subject line\\",
  \\"body\\": \\"Main analysis text (under 120 words)\\",
  \\"keyFindings\\": [\\"finding 1\\", \\"finding 2\\", \\"finding 3\\"],
  \\"assessment\\": \\"Bottom-line assessment or recommendation\\"
}
Otherwise null. Each advisor should use their appropriate docType."
    }
]

RULES:
- Multiple advisors respond if question touches multiple domains
- Keep spoken message BRIEF (2-3 sentences)
- Only include attachment if question explicitly asks for analysis/report/assessment OR if complex data would help
- Advisors can disagree with each other
- Use first person ("I recommend..." not "NSA recommends...")
- Stay in character with each advisor's personality and background
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

        const previewText = getAttachmentPreview(attachment);

        const attachDiv = document.createElement('div');
        attachDiv.className = 'advisor-attachment';
        attachDiv.innerHTML = `
            <div class="advisor-attachment-label">\u{1F4CE} ATTACHMENT (click to view)</div>
            <div class="advisor-attachment-preview">${escapeHTML(previewText)}</div>
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

    const structured = parseStructuredContent(content);

    const modal = document.createElement('div');
    modal.id = 'document-viewer';
    modal.className = 'doc-viewer-overlay';

    if (structured) {
        modal.innerHTML = renderStructuredDocument(structured, author);
    } else {
        modal.innerHTML = renderLegacyDocument(content, author);
    }

    document.body.appendChild(modal);
    modal.querySelector('.doc-close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// Expose for document library onclick
window.openDocument = openDocument;

function showDocumentLibrary() {
    const docs = gameState.documents || [];

    const modal = document.createElement('div');
    modal.id = 'document-library';
    modal.className = 'doc-viewer-overlay';

    const docList = docs.length > 0
        ? docs.map(doc => {
            const structured = parseStructuredContent(doc.content);
            const typeLabel = structured ? structured.docType : 'DOCUMENT';
            const preview = structured
                ? escapeHTML(structured.subject || structured.body?.substring(0, 60) || '')
                : escapeHTML(String(doc.content).substring(0, 80));

            return `
                <div class="doc-library-item" data-doc-id="${doc.id}">
                    <div class="doc-library-item-header">
                        <span class="doc-library-item-author">${escapeHTML(doc.author)}</span>
                        <span class="doc-library-item-type">${escapeHTML(typeLabel)}</span>
                    </div>
                    <div class="doc-library-item-date">${new Date(doc.timestamp).toLocaleString()}</div>
                    <div class="doc-library-item-preview">${preview}</div>
                </div>
            `;
        }).join('')
        : '<div class="doc-library-empty">NO DOCUMENTS IN ARCHIVE</div>';

    modal.innerHTML = `
        <div class="doc-library-container">
            <div class="doc-library-header">
                <div>
                    <div class="doc-library-title">DOCUMENT ARCHIVE</div>
                    <div class="doc-library-count">${docs.length} document(s) on file</div>
                </div>
                <button class="doc-close-btn">CLOSE</button>
            </div>
            <div>${docList}</div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.doc-close-btn').onclick = () => modal.remove();
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
