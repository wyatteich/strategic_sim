// Intel feed management

export function addIntel(message, level = '') {
    const feed = document.getElementById('intel-feed');
    if (!feed) return;

    const item = document.createElement('div');
    item.className = `intel-item ${level}`;

    const timestamp = new Date().toISOString().substr(11, 8);
    item.innerHTML = `
        <div class="intel-timestamp">[${timestamp}Z]</div>
        <div>${message}</div>
    `;

    feed.insertBefore(item, feed.firstChild);

    // Keep feed manageable
    while (feed.children.length > 15) {
        feed.removeChild(feed.lastChild);
    }
}
