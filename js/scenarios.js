// Scenario loader — loads scenario data from JSON files

const MANIFEST_URL = '/scenarios/manifest.json';

export async function loadScenarioManifest() {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error('Failed to load scenario manifest');
    return res.json();
}

export async function loadScenario(filename) {
    const res = await fetch(`/scenarios/${filename}`);
    if (!res.ok) throw new Error(`Failed to load scenario: ${filename}`);
    return res.json();
}

export async function loadAllScenarios() {
    const manifest = await loadScenarioManifest();
    return Promise.all(manifest.map(entry => loadScenario(entry.file)));
}

export async function loadScenarioById(id) {
    const manifest = await loadScenarioManifest();
    const entry = manifest.find(e => e.id === id);
    if (!entry) throw new Error(`Scenario not found: ${id}`);
    return loadScenario(entry.file);
}
