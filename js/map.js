// Leaflet map system

import { gameState } from './state.js';

const L = window.L;

let leafletMap;
let mapMarkers = [];
let mapLayers = {};

// Wait for Leaflet library to load from CDN
export function waitForLeaflet() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max

        const checkLeaflet = () => {
            if (typeof window.L !== 'undefined') {
                console.log('Leaflet loaded successfully');
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Leaflet failed to load after 5 seconds'));
            } else {
                attempts++;
                setTimeout(checkLeaflet, 100);
            }
        };

        checkLeaflet();
    });
}

export function initLeafletMap() {
    const L = window.L;

    if (typeof L === 'undefined') {
        console.error('Leaflet failed to load.');
        document.getElementById('wireframe-map').innerHTML =
            '<div style="color: #ff0000; padding: 20px; text-align: center;">MAP ERROR: Leaflet library failed to load.</div>';
        return;
    }

    try {
        const loadingDiv = document.getElementById('map-loading');
        if (loadingDiv) loadingDiv.remove();

        leafletMap = L.map('wireframe-map', {
            center: [30, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 6,
            zoomControl: true,
            attributionControl: false
        });

        // Expose for tab switching resize
        window._leafletMap = leafletMap;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(leafletMap);

        setTimeout(() => leafletMap.invalidateSize(), 100);

        // Initialize layer groups
        mapLayers = {
            threats: L.layerGroup().addTo(leafletMap),
            forces: L.layerGroup().addTo(leafletMap),
            movements: L.layerGroup().addTo(leafletMap)
        };

        addWireframeOverlay();
        addStrategicLocations();

        // Map view controls
        document.getElementById('map-world').addEventListener('click', () => setLeafletView('world'));
        document.getElementById('map-pacific').addEventListener('click', () => setLeafletView('pacific'));
        document.getElementById('map-arctic').addEventListener('click', () => setLeafletView('arctic'));
        document.getElementById('map-europe').addEventListener('click', () => setLeafletView('europe'));

        // Add CSS for pulsing animation
        if (!document.getElementById('map-animations')) {
            const style = document.createElement('style');
            style.id = 'map-animations';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 0.3; }
                }
                .threat-circle {
                    animation: pulse 2s infinite;
                }
            `;
            document.head.appendChild(style);
        }

        console.log('Leaflet map initialized successfully');
    } catch (error) {
        console.error('Error initializing Leaflet map:', error);
        document.getElementById('wireframe-map').innerHTML =
            '<div style="color: #ff0000; padding: 20px; text-align: center;">MAP ERROR: ' + error.message + '</div>';
    }
}

function addWireframeOverlay() {
    const L = window.L;
    const gridLayer = L.layerGroup();

    for (let lat = -80; lat <= 80; lat += 20) {
        L.polyline([[lat, -180], [lat, 180]], {
            color: '#4a9eff', weight: 0.5, opacity: 0.2, interactive: false
        }).addTo(gridLayer);
    }

    for (let lng = -180; lng <= 180; lng += 20) {
        L.polyline([[-80, lng], [80, lng]], {
            color: '#4a9eff', weight: 0.5, opacity: 0.2, interactive: false
        }).addTo(gridLayer);
    }

    gridLayer.addTo(leafletMap);
}

function addStrategicLocations() {
    const L = window.L;
    const locations = [
        { name: 'Washington DC', lat: 38.9, lng: -77.0, type: 'capital', faction: 'allied' },
        { name: 'Pearl Harbor', lat: 21.3, lng: -157.8, type: 'naval_base', faction: 'allied' },
        { name: 'Guam', lat: 13.4, lng: 144.7, type: 'naval_base', faction: 'allied' },
        { name: 'Tokyo', lat: 35.6, lng: 139.7, type: 'capital', faction: 'allied' },
        { name: 'Seoul', lat: 37.5, lng: 127.0, type: 'capital', faction: 'allied' },
        { name: 'London', lat: 51.5, lng: -0.1, type: 'capital', faction: 'allied' },
        { name: 'Brussels', lat: 50.8, lng: 4.3, type: 'capital', faction: 'allied' },
        { name: 'Beijing', lat: 39.9, lng: 116.4, type: 'capital', faction: 'hostile' },
        { name: 'Moscow', lat: 55.7, lng: 37.6, type: 'capital', faction: 'hostile' },
        { name: 'Tehran', lat: 35.6, lng: 51.4, type: 'capital', faction: 'hostile' },
        { name: 'Taiwan', lat: 25.0, lng: 121.5, type: 'flashpoint', faction: 'contested' },
        { name: 'Ukraine', lat: 50.4, lng: 30.5, type: 'flashpoint', faction: 'contested' },
        { name: 'South China Sea', lat: 12.0, lng: 114.0, type: 'flashpoint', faction: 'contested' },
        { name: 'Arctic', lat: 75.0, lng: 0.0, type: 'flashpoint', faction: 'contested' },
        { name: 'Strait of Hormuz', lat: 26.5, lng: 56.2, type: 'flashpoint', faction: 'contested' }
    ];

    locations.forEach(loc => {
        let color;
        if (loc.faction === 'allied') color = '#4a9eff';
        else if (loc.faction === 'hostile') color = '#ff6600';
        else if (loc.faction === 'contested') color = '#ffb000';
        else color = '#888888';

        let iconHtml, iconSize;
        if (loc.type === 'capital') {
            iconHtml = `<div style="width: 8px; height: 8px; background: ${color}; border: 2px solid ${color};"></div>`;
            iconSize = [12, 12];
        } else if (loc.type === 'naval_base') {
            iconHtml = `<div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 10px solid ${color};"></div>`;
            iconSize = [12, 10];
        } else if (loc.type === 'flashpoint') {
            iconHtml = `<div class="threat-circle" style="width: 12px; height: 12px; background: ${color}; border-radius: 50%; border: 2px solid #ff0000; box-shadow: 0 0 10px #ff0000;"></div>`;
            iconSize = [16, 16];
        } else {
            iconHtml = `<div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></div>`;
            iconSize = [8, 8];
        }

        const icon = L.divIcon({ className: 'custom-marker', html: iconHtml, iconSize });

        const marker = L.marker([loc.lat, loc.lng], { icon })
            .bindPopup(`
                <strong style="color: ${color};">${loc.name}</strong><br>
                Type: ${loc.type.replace('_', ' ').toUpperCase()}<br>
                Status: ${loc.faction.toUpperCase()}
            `)
            .addTo(mapLayers.forces);

        if (loc.type === 'capital' || loc.type === 'flashpoint') {
            L.marker([loc.lat, loc.lng], {
                icon: L.divIcon({
                    className: 'location-label',
                    html: `<div style="color: ${color}; font-size: 9px; white-space: nowrap; margin-left: 10px;">${loc.name}</div>`,
                    iconSize: [100, 20]
                }),
                interactive: false
            }).addTo(mapLayers.forces);
        }

        mapMarkers.push({ marker, data: loc });
    });
}

export function setLeafletView(view) {
    document.querySelectorAll('.map-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`map-${view}`).classList.add('active');

    gameState.map.view = view;

    const views = {
        world: [[30, 0], 2],
        pacific: [[25, 135], 4],
        arctic: [[75, 0], 3],
        europe: [[50, 20], 4]
    };

    const [center, zoom] = views[view] || views.world;
    if (leafletMap) leafletMap.setView(center, zoom);
}

export function addThreat(lat, lng, label) {
    const L = window.L;

    const circle = L.circle([lat, lng], {
        color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.2,
        radius: 200000, className: 'threat-circle'
    }).bindPopup(`<strong style="color: #ff0000;">THREAT: ${label}</strong>`)
      .addTo(mapLayers.threats);

    const marker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'threat-marker',
            html: `<div style="width: 8px; height: 8px; background: #ff0000; border-radius: 50%; box-shadow: 0 0 15px #ff0000;"></div>`,
            iconSize: [8, 8]
        })
    }).addTo(mapLayers.threats);

    const labelMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'threat-label',
            html: `<div style="color: #ff0000; font-size: 10px; font-weight: bold; white-space: nowrap; margin-left: 15px; text-shadow: 0 0 5px #000;">${label}</div>`,
            iconSize: [150, 20]
        }),
        interactive: false
    }).addTo(mapLayers.threats);

    gameState.map.threats.push({ circle, marker, labelMarker, label });
}

export function addForceMovement(fromLat, fromLng, toLat, toLng, label, color) {
    const L = window.L;
    color = color || '#ffb000';

    const line = L.polyline(
        [[fromLat, fromLng], [toLat, toLng]],
        { color, weight: 3, opacity: 0.8, dashArray: '10, 10' }
    ).addTo(mapLayers.movements);

    const movingMarker = L.marker([fromLat, fromLng], {
        icon: L.divIcon({
            className: 'moving-force',
            html: `<div style="width: 10px; height: 10px; background: ${color}; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>`,
            iconSize: [10, 10]
        })
    }).bindPopup(`<strong style="color: ${color};">${label}</strong><br>En route...`)
      .addTo(mapLayers.movements);

    animateMarkerAlongPath(movingMarker, fromLat, fromLng, toLat, toLng, 3000);

    gameState.map.movements.push({ line, marker: movingMarker, label });
}

function animateMarkerAlongPath(marker, fromLat, fromLng, toLat, toLng, duration) {
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        marker.setLatLng([
            fromLat + (toLat - fromLat) * progress,
            fromLng + (toLng - fromLng) * progress
        ]);
        if (progress < 1) requestAnimationFrame(animate);
    }

    animate();
}

export function clearMapThreats() {
    if (mapLayers.threats) mapLayers.threats.clearLayers();
    gameState.map.threats = [];
}

export function clearMapMovements() {
    if (mapLayers.movements) mapLayers.movements.clearLayers();
    gameState.map.movements = [];
}

export function initializeMapForScenario(scenario) {
    clearMapThreats();
    clearMapMovements();

    if (scenario.id === 'taiwan_strait') {
        setTimeout(() => setLeafletView('pacific'), 500);
    } else if (scenario.id === 'arctic_resources') {
        setTimeout(() => setLeafletView('arctic'), 500);
    } else if (scenario.id === 'cyber_attack') {
        setTimeout(() => setLeafletView('world'), 500);
    }
}

export function visualizeOrders(orders) {
    orders.orders.forEach(order => {
        if (order.type === 'military') {
            if (order.action.toLowerCase().includes('carrier') &&
                order.action.toLowerCase().includes('taiwan')) {
                addForceMovement(21.3, -157.8, 25.0, 121.5, 'Carrier Group', '#4a9eff');
            }
            if (order.action.toLowerCase().includes('bomber') &&
                order.action.toLowerCase().includes('guam')) {
                addForceMovement(38.9, -77.0, 13.4, 144.7, 'Bomber Squadron', '#4a9eff');
            }
            if (order.intensity === 'high') {
                if (gameState.scenario && gameState.scenario.id === 'taiwan_strait') {
                    addThreat(25.0, 121.5, 'Military Action');
                }
            }
        }
    });
}

export function updateMapForDecision(option) {
    const scenario = gameState.scenario;
    if (!scenario) return;

    if (scenario.id === 'taiwan_strait') {
        if (option.text.includes('carrier group')) {
            addForceMovement(21.3, -157.8, 25.0, 121.5, 'USS Reagan CSG', '#4a9eff');
            addIntelFromMap('SIGINT: Carrier Strike Group Reagan departing Pearl Harbor. ETA 36 hours.');
        } else if (option.text.includes('sanctions')) {
            addThreat(39.9, 116.4, 'Economic Pressure');
        } else if (option.text.includes('multilateral')) {
            addForceMovement(35.6, 139.7, 25.0, 121.5, 'JSDF Alert', '#4a9eff');
            addForceMovement(37.5, 127.0, 25.0, 121.5, 'ROK Support', '#4a9eff');
        }
        if (gameState.turn === 1) {
            addThreat(25.0, 121.5, 'PLA Exercise');
        }
    }

    if (scenario.id === 'arctic_resources') {
        if (option.text.includes('forward operating bases')) {
            addForceMovement(51.5, -0.1, 75.0, 0.0, 'NATO Arctic Deploy', '#4a9eff');
            addIntelFromMap('NATO forces deploying to Arctic installations.');
        } else if (option.text.includes('intelligence operations')) {
            addThreat(75.0, 0.0, 'ISR Active');
        }
        if (gameState.turn === 1) {
            addThreat(75.0, 0.0, 'Russian Installation');
        }
    }

    if (scenario.id === 'cyber_attack') {
        if (option.text.includes('counter-cyber')) {
            addThreat(55.7, 37.6, 'Cyber Ops');
            addIntelFromMap('Cyber Command executing response operations.');
        } else if (option.text.includes('Article 5')) {
            addForceMovement(51.5, -0.1, 38.9, -77.0, 'NATO Alert', '#4a9eff');
        }
        if (gameState.turn === 1) {
            addThreat(55.7, 37.6, 'Attack Source');
        }
    }
}

// Internal helper to avoid circular dependency with intel.js
function addIntelFromMap(message) {
    const { addIntel } = window._gameModules || {};
    if (addIntel) addIntel(message, 'warning');
}
