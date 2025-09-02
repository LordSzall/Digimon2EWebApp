// save-load.js - Save and load functionality

window.SaveLoad = {
    save() {
        const sheet = window.TabManager.getActiveSheet();
        if(!sheet) {
            alert('No active sheet to save.');
            return;
        }

        const tab = window.TabManager.getActiveTab();
        const currentName = tab?.title || 'Untitled';
        const name = prompt('Save name:', currentName);
        if(!name) return;

        const payload = {
            id: tab.id,
            type: tab.type,
            title: name,
            data: sheet.firstElementChild.__getData?.()
        };

        const key = `digi2e:${name}`;

        // Clean up any existing entries with the same name but different keys
        const allKeys = Object.keys(localStorage).filter(k => k.startsWith('digi2e:'));
        allKeys.forEach(existingKey => {
            try {
                const existingData = JSON.parse(localStorage.getItem(existingKey));
                if (existingData && existingData.title === name && existingKey !== key) {
                    localStorage.removeItem(existingKey);
                }
            } catch (e) {
                console.warn('Error parsing localStorage item:', existingKey, e);
            }
        });

        // Save the new data
        localStorage.setItem(key, JSON.stringify(payload));

        // Update tab title
        window.TabManager.updateTabTitle(tab.id, name);

        alert('Saved!');
    },

    open(openListElement, openModalElement) {
        openListElement.innerHTML = '';
        const saves = Object.keys(localStorage)
        .filter(k => k.startsWith('digi2e:'))
        .sort();

        if(saves.length === 0) {
            openListElement.appendChild(el('<div class="panel"><div class="help">No saved sheets found.</div></div>'));
            openModalElement.classList.remove('hidden');
            return;
        }

        saves.forEach(key => {
            try {
                const payload = JSON.parse(localStorage.getItem(key)||'null');
                if(!payload) return;

                const card = el(`<div class="panel">
                <div class="row" style="justify-content:space-between; align-items:center">
                <div>
                <div style="font-family:Orbitron; font-weight:700">${payload.title||'(no title)'}</div>
                <div class="tiny">Type: ${payload.type || 'unknown'}</div>
                <div class="tiny">${key}</div>
                </div>
                <div class="row">
                <button class="btn" data-act="open">Open</button>
                <button class="btn danger" data-act="delete">Delete</button>
                </div>
                </div>
                </div>`);

                card.querySelector('[data-act="open"]').addEventListener('click', () => {
                    const id = window.TabManager.addTab(payload.title||'New Sheet', payload.type||'digimon', payload.data||{});
                    openModalElement.classList.add('hidden');
                    window.TabManager.activateTab(id);
                });

                card.querySelector('[data-act="delete"]').addEventListener('click', () => {
                    if(confirm(`Delete saved sheet "${payload.title||key}"?`)) {
                        localStorage.removeItem(key);
                        card.remove();
                        // If this was the last save, show the "no saves" message
                        if(openListElement.children.length === 0) {
                            openListElement.appendChild(el('<div class="panel"><div class="help">No saved sheets found.</div></div>'));
                        }
                    }
                });

                openListElement.appendChild(card);
            } catch(e) {
                console.error('Error loading save:', e);
            }
        });

        openModalElement.classList.remove('hidden');
    }
};
