// Centralized API layer — all calls go through the local server

async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `API error: ${res.status}`);
    }
    return data;
}

export async function callAdvisor(messages, maxTokens = 1500) {
    const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            messages
        })
    });
    return handleResponse(res);
}

export async function callCommand(messages, maxTokens = 2000) {
    const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            messages
        })
    });
    return handleResponse(res);
}

export async function callGameMaster(messages, maxTokens = 500) {
    const res = await fetch('/api/gamemaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            messages
        })
    });
    return handleResponse(res);
}
