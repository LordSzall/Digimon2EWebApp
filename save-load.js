// save-load.js - Enhanced save, load, export and import functionality
window.SaveLoad = {
    save() {
        try {
            const sheet = window.TabManager.getActiveSheet();
            if(!sheet) {
                alert('No active sheet to save.');
                return;
            }

            const tab = window.TabManager.getActiveTab();
            const currentName = tab?.title || 'Untitled';
            const name = prompt('Save name:', currentName);
            if(!name || !name.trim()) {
                if(name === '') alert('Please enter a valid name.');
                return;
            }

            const trimmedName = name.trim();
            const payload = {
                id: tab.id,
                type: tab.type,
                title: trimmedName,
                data: sheet.firstElementChild.__getData?.(),
                savedDate: new Date().toISOString()
            };

            // Validate data structure
            if(!payload.data || typeof payload.data !== 'object') {
                throw new Error('Invalid sheet data - unable to retrieve data from sheet');
            }

            const key = `digi2e:${trimmedName}`;

            // Clean up any existing entries with the same name but different keys
            const allKeys = Object.keys(localStorage).filter(k => k.startsWith('digi2e:'));
            allKeys.forEach(existingKey => {
                try {
                    const existingData = JSON.parse(localStorage.getItem(existingKey));
                    if (existingData && existingData.title === trimmedName && existingKey !== key) {
                        localStorage.removeItem(existingKey);
                    }
                } catch (e) {
                    console.warn('Error parsing localStorage item:', existingKey, e);
                    localStorage.removeItem(existingKey); // Remove corrupted entries
                }
            });

            // Save the new data with error handling
            localStorage.setItem(key, JSON.stringify(payload));

            // Update tab title
            window.TabManager.updateTabTitle(tab.id, trimmedName);

            alert('Saved successfully!');

        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving sheet: ' + error.message);
        }
    },

    exportSheet() {
        try {
            const sheet = window.TabManager.getActiveSheet();
            if(!sheet) {
                alert('No active sheet to export.');
                return;
            }

            const tab = window.TabManager.getActiveTab();
            const payload = {
                version: "1.0",
                exportDate: new Date().toISOString(),
                id: tab.id,
                type: tab.type,
                title: tab.title || 'Untitled',
                data: sheet.firstElementChild.__getData?.()
            };

            // Validate data structure
            if(!payload.data || typeof payload.data !== 'object') {
                throw new Error('Invalid sheet data - unable to export');
            }

            // Create and download file
            const jsonString = JSON.stringify(payload, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${payload.title.replace(/[^a-z0-9]/gi, '_')}_${payload.type}.dda2e`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`Sheet "${payload.title}" exported successfully!`);

        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting sheet: ' + error.message);
        }
    },

    importSheet() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.dda2e,.json';

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importData = JSON.parse(e.target.result);

                        // Validate import data
                        if (!importData.type || !importData.data) {
                            throw new Error('Invalid file format. Missing required fields.');
                        }

                        if (!['digimon', 'tamer'].includes(importData.type)) {
                            throw new Error(`Unsupported sheet type: ${importData.type}`);
                        }

                        const importTitle = importData.title || 'Imported Sheet';

                        // Create new tab with imported data
                        const tabId = window.TabManager.addTab(importTitle, importData.type);

                        // Wait a moment for tab to be created, then set data
                        setTimeout(() => {
                            const sheet = window.TabManager.getSheetById(tabId);
                            if (sheet && sheet.firstElementChild.__setData) {
                                sheet.firstElementChild.__setData(importData.data);
                                window.TabManager.activateTab(tabId);
                                alert(`Sheet "${importTitle}" imported successfully!`);
                            } else {
                                throw new Error('Failed to initialize imported sheet');
                            }
                        }, 100);

                    } catch (error) {
                        console.error('Import parsing error:', error);
                        alert('Error importing file: ' + error.message);
                    }
                };

                reader.onerror = () => {
                    alert('Error reading file');
                };

                reader.readAsText(file);
            };

            input.click();

        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing sheet: ' + error.message);
        }
    },

    open(openListElement, openModalElement) {
        try {
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
                    const item = localStorage.getItem(key);
                    if(!item) {
                        localStorage.removeItem(key); // Clean up null entries
                        return;
                    }

                    const payload = JSON.parse(item);
                    if(!payload || !payload.type) {
                        throw new Error('Invalid save data format');
                    }

                    // Create enhanced card with better styling from version 1 but improved structure from version 2
                    const card = el(`<div class="panel">
                    <div class="row" style="justify-content:space-between; align-items:center">
                    <div>
                    <div style="font-family:Orbitron; font-weight:700; color:var(--accent);">${payload.title || '(no title)'}</div>
                    <div class="tiny">Type: ${payload.type || 'unknown'}</div>
                    ${payload.savedDate ? `<div class="tiny">Saved: ${new Date(payload.savedDate).toLocaleDateString()}</div>` : ''}
                    </div>
                    <div class="row">
                    <button class="btn" data-act="open">Open</button>
                    <button class="btn danger" data-act="delete">Delete</button>
                    </div>
                    </div>
                    </div>`);

                    // Open button with enhanced error handling
                    card.querySelector('[data-act="open"]').addEventListener('click', () => {
                        try {
                            const id = window.TabManager.addTab(payload.title || 'New Sheet', payload.type || 'digimon', payload.data || {});
                            openModalElement.classList.add('hidden');
                            window.TabManager.activateTab(id);
                        } catch(err) {
                            console.error('Error loading sheet:', err);
                            alert('Error loading sheet: ' + err.message);
                        }
                    });

                    // Delete button with confirmation
                    card.querySelector('[data-act="delete"]').addEventListener('click', () => {
                        if(confirm(`Delete saved sheet "${payload.title || key}"?`)) {
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
                    console.error('Error loading save:', key, e);
                    // Remove corrupted saves
                    localStorage.removeItem(key);
                }
            });

            openModalElement.classList.remove('hidden');

        } catch (error) {
            console.error('Open error:', error);
            alert('Error loading saved sheets: ' + error.message);
        }
    }
};
