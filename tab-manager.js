// tab-manager.js - Tab management functionality

class TabManager {
    constructor() {
        this.state = { tabs: [], active: null };
        this.tabBar = null;
        this.sheets = null;
    }

    init(tabBarElement, sheetsElement) {
        this.tabBar = tabBarElement;
        this.sheets = sheetsElement;
    }

    activateTab(id) {
        this.state.active = id;
        [...this.tabBar.children].forEach(el=> el.classList.toggle('active', el.dataset.id===id));
        [...this.sheets.children].forEach(el=> el.classList.toggle('active', el.dataset.id===id));
    }

    addTab(title, type='digimon', data=null) {
        const id = uid();

        const tab = el(`<div class="tab active" data-id="${id}" data-type="${type}">
        <img src="${type === 'digimon' ? 'digimon-icon.png' : 'tamer-icon.png'}"
        alt="${type}" class="tab-icon">
        <span>${title}</span>
        <span class="close" title="Close">✕</span>
        </div>`);

        tab.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeTab(id);
        });

        tab.addEventListener('click', () => this.activateTab(id));

        [...this.tabBar.children].forEach(el=> el.classList.remove('active'));
        this.tabBar.appendChild(tab);

        const sheet = document.createElement('div');
        sheet.className = 'sheet active';
        sheet.dataset.id = id;

        if(type === 'digimon') {
            sheet.appendChild(window.DigimonSheet.render(id, data));
        } else if (type === 'tamer') {
            sheet.appendChild(window.TamerSheet.render(id, data));
        } else {
            const coming = el(`<div class="panel">
            <h2 class="section-title">Unknown Sheet Type</h2>
            <div class="help">Cannot render this sheet type.</div>
            </div>`);
            sheet.appendChild(coming);
        }

        [...this.sheets.children].forEach(el=> el.classList.remove('active'));
        this.sheets.appendChild(sheet);

        this.state.tabs.push({id, title, type});
        this.activateTab(id);
        return id;
    }

    removeTab(id) {
        const sheet = document.querySelector(`.sheet[data-id="${id}"]`);
        const tab = this.tabBar.querySelector(`.tab[data-id="${id}"]`);
        sheet?.remove();
        tab?.remove();

        const idx = this.state.tabs.findIndex(t => t.id === id);
        if(idx > -1) this.state.tabs.splice(idx, 1);

        if(this.state.active === id) {
            const fallback = this.tabBar.querySelector('.tab');
            if(fallback) this.activateTab(fallback.dataset.id);
        }
    }

    getActiveSheet() {
        if(!this.state.active) return null;
        return document.querySelector(`.sheet[data-id="${this.state.active}"]`);
    }

    getActiveTab() {
        return this.state.tabs.find(t => t.id === this.state.active);
    }

    updateTabTitle(id, newTitle) {
        const tab = this.state.tabs.find(t => t.id === id);
        if(tab) {
            tab.title = newTitle;
            const tabEl = this.tabBar.querySelector(`.tab[data-id="${id}"]`);
            if(tabEl) {
                const textSpan = tabEl.querySelector('span:not(.close)');
                if (textSpan) {
                    textSpan.textContent = newTitle;
                }
            }
        }
    }
}

// Create global instance
window.TabManager = new TabManager();
