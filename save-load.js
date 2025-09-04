// save-load.js - Enhanced save, load, export and import functionality with Quality support
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
            const sheetData = sheet.firstElementChild.__getData?.();

            // Validate data structure
            if(!sheetData || typeof sheetData !== 'object') {
                throw new Error('Invalid sheet data - unable to retrieve data from sheet');
            }

            // Ensure quality structure exists for backward compatibility
            if (!sheetData.qualities) {
                sheetData.qualities = { list: [], notes: '' };
            }

            const payload = {
                id: tab.id,
                type: tab.type,
                title: trimmedName,
                data: sheetData,
                savedDate: new Date().toISOString(),
                version: "2.0" // Updated version for quality system
            };

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
            const sheetData = sheet.firstElementChild.__getData?.();

            // Validate data structure
            if(!sheetData || typeof sheetData !== 'object') {
                throw new Error('Invalid sheet data - unable to export');
            }

            // Ensure quality structure exists for export
            if (!sheetData.qualities) {
                sheetData.qualities = { list: [], notes: '' };
            }

            const payload = {
                version: "2.0",
                application: "Digimon Digital Adventures 2E - Enhanced",
                exportDate: new Date().toISOString(),
                id: tab.id,
                type: tab.type,
                title: tab.title || 'Untitled',
                data: sheetData
            };

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

                        // Handle legacy data migration
                        if (importData.version === "1.0" || !importData.version) {
                            this.migrateLegacyData(importData.data);
                        }

                        // Ensure quality structure exists
                        if (!importData.data.qualities) {
                            importData.data.qualities = { list: [], notes: '' };
                        }

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

    // Migration function for legacy saves that used dp.quality
    migrateLegacyData(data) {
        try {
            // If old dp.quality exists, create a generic quality entry
            if (data.dp && typeof data.dp.quality === 'number' && data.dp.quality > 0) {
                if (!data.qualities) {
                    data.qualities = { list: [], notes: '' };
                }

                // If qualities is just a string (legacy), move it to notes
                if (typeof data.qualities === 'string') {
                    const oldQualities = data.qualities;
                    data.qualities = {
                        list: [{
                            name: 'Legacy Qualities',
                            type: 'Static',
                            dpCost: data.dp.quality,
                            description: oldQualities
                        }],
                        notes: ''
                    };
                } else {
                    // Add a legacy quality entry for the DP allocation
                    data.qualities.list.push({
                        name: 'Legacy Quality Points',
                        type: 'Static',
                        dpCost: data.dp.quality,
                        description: 'Converted from legacy quality DP allocation. Edit or remove as needed.'
                    });
                }

                // Remove old dp.quality
                delete data.dp.quality;
            }

            // If qualities is still a string, convert it
            if (typeof data.qualities === 'string') {
                const oldQualities = data.qualities;
                data.qualities = { list: [], notes: oldQualities };
            }

            // Ensure proper structure
            if (!data.qualities) {
                data.qualities = { list: [], notes: '' };
            }
            if (!Array.isArray(data.qualities.list)) {
                data.qualities.list = [];
            }
            if (typeof data.qualities.notes !== 'string') {
                data.qualities.notes = '';
            }

        } catch (error) {
            console.warn('Error migrating legacy data:', error);
            // Ensure minimal structure even if migration fails
            if (!data.qualities) {
                data.qualities = { list: [], notes: '' };
            }
        }
    },

    open(openListElement, openModalElement) {
        try {
            openListElement.innerHTML = '';
            // Add scrollbar styling to the container
            openListElement.style.maxHeight = '60vh';
            openListElement.style.overflowY = 'auto';
            openListElement.style.paddingRight = '8px';

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

                    // Create enhanced card with version info
                    const versionBadge = payload.version ? `<div class="tiny">Version: ${payload.version}</div>` : '';
                    const qualityCount = payload.data?.qualities?.list?.length || 0;
                    const qualityInfo = qualityCount > 0 ? `<div class="tiny">Qualities: ${qualityCount}</div>` : '';

                    const card = el(`<div class="panel">
                    <div class="row" style="justify-content:space-between; align-items:center">
                    <div>
                    <div style="font-family:Orbitron; font-weight:700; color:var(--accent);">${payload.title || '(no title)'}</div>
                    <div class="tiny">Type: ${payload.type || 'unknown'}</div>
                    ${payload.savedDate ? `<div class="tiny">Saved: ${new Date(payload.savedDate).toLocaleDateString()}</div>` : ''}
                    ${versionBadge}
                    ${qualityInfo}
                    </div>
                    <div class="row">
                    <button class="btn" data-act="open">Open</button>
                    <button class="btn danger" data-act="delete">Delete</button>
                    </div>
                    </div>
                    </div>`);

                    // Open button with enhanced error handling and migration
                    card.querySelector('[data-act="open"]').addEventListener('click', () => {
                        try {
                            // Handle legacy data migration
                            if (payload.version === "1.0" || !payload.version) {
                                this.migrateLegacyData(payload.data);
                            }

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
