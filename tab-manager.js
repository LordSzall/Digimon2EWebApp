// tab-manager.js - Hybrid tab management with best of both versions

class TabManager {
    constructor() {
        this.state = {
            tabs: [],
            active: null
        };
        this.tabBar = null;
        this.sheets = null;
    }

    init(tabBarElement, sheetsElement) {
        this.tabBar = tabBarElement;
        this.sheets = sheetsElement;
    }

    activateTab(id) {
        this.state.active = id;

        // Update tab appearances - using Version 1's elegant approach
        [...this.tabBar.children].forEach(el =>
        el.classList.toggle('active', el.dataset.id === id)
        );
        [...this.sheets.children].forEach(el =>
        el.classList.toggle('active', el.dataset.id === id)
        );
    }

    addTab(title, type = 'digimon', data = null) {
        const id = uid();

        // Create tab element with Version 1's approach but cleaner close icon
        const tab = el(`<div class="tab active" data-id="${id}" data-type="${type}">
        <img src="${type === 'digimon' ? 'digimon-icon.png' : 'tamer-icon.png'}"
        alt="${type}" class="tab-icon">
        <span>${title}</span>
        <span class="close" title="Close">×</span>
        </div>`);

        // Event listeners
        tab.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeTab(id);
        });

        tab.addEventListener('click', () => this.activateTab(id));

        // Deactivate other tabs
        [...this.tabBar.children].forEach(el => el.classList.remove('active'));
        this.tabBar.appendChild(tab);

        // Create sheet
        const sheet = document.createElement('div');
        sheet.className = 'sheet active';
        sheet.dataset.id = id;

        // Render sheet content
        try {
            if (type === 'digimon') {
                sheet.appendChild(window.DigimonSheet.render(id, data));
            } else if (type === 'tamer') {
                sheet.appendChild(window.TamerSheet.render(id, data));
            } else {
                throw new Error(`Unknown sheet type: ${type}`);
            }
        } catch (error) {
            console.error('Sheet rendering error:', error);
            const errorPanel = el(`<div class="panel">
            <h2 class="section-title">Error Loading Sheet</h2>
            <div class="help">Cannot render ${type} sheet: ${error.message}</div>
            </div>`);
            sheet.appendChild(errorPanel);
        }

        // Deactivate other sheets and add new one
        [...this.sheets.children].forEach(el => el.classList.remove('active'));
        this.sheets.appendChild(sheet);

        // Update state
        this.state.tabs.push({ id, title, type, data });
        this.activateTab(id);

        return id;
    }

    removeTab(id) {
        // Optional: Check for unsaved changes
        if (this.hasUnsavedChanges(id)) {
            if (!confirm('Close this tab? Any unsaved changes will be lost.')) {
                return false;
            }
        }
        const sheet = this.sheets.querySelector(`.sheet[data-id="${id}"]`);
        if (sheet && sheet.cleanup) {
            sheet.cleanup(); // Call custom cleanup method if exists
        }
        const tab = this.tabBar.querySelector(`.tab[data-id="${id}"]`);

        sheet?.remove();
        tab?.remove();

        // Update state
        const idx = this.state.tabs.findIndex(t => t.id === id);
        if (idx > -1) this.state.tabs.splice(idx, 1);

        // Handle active tab fallback - MODIFIED to allow 0 tabs
        if (this.state.active === id) {
            // Try to find another tab to activate
            const fallback = this.tabBar.querySelector('.tab');
            if (fallback) {
                this.activateTab(fallback.dataset.id);
            } else {
                // No tabs left - set active to null and trigger empty state
                this.state.active = null;
                this.handleEmptyState();
            }
        }

        return true;
    }

    // NEW METHOD: Handle when no tabs are open
    handleEmptyState() {
        // Clear any active states that might still be lingering
        [...this.tabBar.children].forEach(el => el.classList.remove('active'));
        [...this.sheets.children].forEach(el => el.classList.remove('active'));

        // Optional: Show empty state message or placeholder
        this.showEmptyState();
    }

    // NEW METHOD: Show empty state UI (optional)
    showEmptyState() {
        // Remove any existing empty state
        const existingEmpty = this.sheets.querySelector('.empty-state');
        if (existingEmpty) {
            existingEmpty.remove();
        }

        // Create empty state element
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state active';
        emptyState.innerHTML = `
        <div class="empty-content">
        <div class="empty-actions">
        <button class="empty-button" onclick="window.TabManager.addTab('New Digimon', 'digimon')">New Digimon Sheet</button>
        <button class="empty-button" onclick="window.TabManager.addTab('New Tamer', 'tamer')">New Tamer Sheet</button>
        </div>
        </div>
        `;

        this.sheets.appendChild(emptyState);
    }

    // MODIFIED: Clear empty state when adding tabs
    addTab(title, type = 'digimon', data = null) {
        // Remove empty state if it exists
        const emptyState = this.sheets.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const id = uid();

        // Create tab element with Version 1's approach but cleaner close icon
        const tab = el(`<div class="tab active" data-id="${id}" data-type="${type}">
        <img src="${type === 'digimon' ? 'digimon-icon.png' : 'tamer-icon.png'}"
        alt="${type}" class="tab-icon">
        <span>${title}</span>
        <span class="close" title="Close">×</span>
        </div>`);

        // Event listeners
        tab.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeTab(id);
        });

        tab.addEventListener('click', () => this.activateTab(id));

        // Deactivate other tabs
        [...this.tabBar.children].forEach(el => el.classList.remove('active'));
        this.tabBar.appendChild(tab);

        // Create sheet
        const sheet = document.createElement('div');
        sheet.className = 'sheet active';
        sheet.dataset.id = id;

        // Render sheet content
        try {
            if (type === 'digimon') {
                sheet.appendChild(window.DigimonSheet.render(id, data));
            } else if (type === 'tamer') {
                sheet.appendChild(window.TamerSheet.render(id, data));
            } else {
                throw new Error(`Unknown sheet type: ${type}`);
            }
        } catch (error) {
            console.error('Sheet rendering error:', error);
            const errorPanel = el(`<div class="panel">
            <h2 class="section-title">Error Loading Sheet</h2>
            <div class="help">Cannot render ${type} sheet: ${error.message}</div>
            </div>`);
            sheet.appendChild(errorPanel);
        }

        // Deactivate other sheets and add new one
        [...this.sheets.children].forEach(el => el.classList.remove('active'));
        this.sheets.appendChild(sheet);

        // Update state
        this.state.tabs.push({ id, title, type, data });
        this.activateTab(id);

        return id;
    }

    getActiveSheet() {
        if (!this.state.active) return null;
        return this.sheets.querySelector(`.sheet[data-id="${this.state.active}"]`);
    }

    getActiveTab() {
        return this.state.tabs.find(t => t.id === this.state.active);
    }

    getSheetById(id) {
        return this.sheets.querySelector(`.sheet[data-id="${id}"]`);
    }

    getTabById(id) {
        return this.state.tabs.find(t => t.id === id);
    }

    updateTabTitle(id, newTitle) {
        // Update state
        const tab = this.state.tabs.find(t => t.id === id);
        if (tab) {
            tab.title = newTitle;

            // Update DOM
            const tabEl = this.tabBar.querySelector(`.tab[data-id="${id}"]`);
            if (tabEl) {
                const textSpan = tabEl.querySelector('span:not(.close)');
                if (textSpan) {
                    textSpan.textContent = newTitle;
                }
            }
        }
    }

    getAllTabs() {
        // Return a copy to prevent external modification
        return [...this.state.tabs];
    }

    hasUnsavedChanges(id) {
        // Enhanced logic - check if sheet has a method to detect changes
        const sheet = this.getSheetById(id);
        const sheetInstance = sheet?.firstElementChild;

        // If sheet has a hasChanges method, use it
        if (sheetInstance && typeof sheetInstance.hasChanges === 'function') {
            return sheetInstance.hasChanges();
        }

        // Default conservative approach
        return true;
    }

    exportTab(id) {
        try {
            const tab = this.getTabById(id);
            const sheet = this.getSheetById(id);

            if (!tab || !sheet) {
                throw new Error('Tab or sheet not found');
            }

            const sheetInstance = sheet.firstElementChild;
            const data = sheetInstance?.__getData?.() || sheetInstance?.getData?.() || null;

            if (!data) {
                throw new Error('No data available for export');
            }

            const exportPayload = {
                version: "1.0",
                application: "Digimon Digital Adventures 2E",
                exportDate: new Date().toISOString(),
                type: "single-sheet",
                sheet: {
                    ...tab,
                    data: data
                }
            };

            const jsonString = JSON.stringify(exportPayload, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `DDA2E_${tab.title}_${new Date().toISOString().slice(0,10)}.dda2e`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`${tab.title} exported successfully!`);
            return true;

        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting tab: ' + error.message);
            return false;
        }
    }

    exportAllTabs() {
        try {
            const allSheets = this.state.tabs.map(tab => {
                const sheet = this.getSheetById(tab.id);
                const sheetInstance = sheet?.firstElementChild;
                const data = sheetInstance?.__getData?.() || sheetInstance?.getData?.() || null;

                return data ? { ...tab, data } : null;
            }).filter(sheet => sheet !== null);

            if (allSheets.length === 0) {
                alert('No sheets to export.');
                return false;
            }

            const exportPayload = {
                version: "1.0",
                application: "Digimon Digital Adventures 2E",
                exportDate: new Date().toISOString(),
                type: "multi-sheet",
                sheets: allSheets
            };

            const jsonString = JSON.stringify(exportPayload, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `DDA2E_All_Sheets_${new Date().toISOString().slice(0,10)}.dda2e`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`All ${allSheets.length} sheets exported successfully!`);
            return true;

        } catch (error) {
            console.error('Export all error:', error);
            alert('Error exporting all sheets: ' + error.message);
            return false;
        }
    }

    importSheets(fileInput) {
        return new Promise((resolve, reject) => {
            const file = fileInput.files[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);

                    // Validate import data
                    if (!importData.version || !importData.application) {
                        throw new Error('Invalid file format');
                    }

                    let importedCount = 0;

                    if (importData.type === 'single-sheet' && importData.sheet) {
                        const sheet = importData.sheet;
                        const newId = this.addTab(sheet.title, sheet.type, sheet.data);
                        if (newId) importedCount = 1;

                    } else if (importData.type === 'multi-sheet' && importData.sheets) {
                        importData.sheets.forEach(sheet => {
                            const newId = this.addTab(sheet.title, sheet.type, sheet.data);
                            if (newId) importedCount++;
                        });
                    }

                    if (importedCount > 0) {
                        alert(`Successfully imported ${importedCount} sheet(s)!`);
                        resolve(importedCount);
                    } else {
                        throw new Error('No sheets were imported');
                    }

                } catch (error) {
                    console.error('Import error:', error);
                    alert('Error importing file: ' + error.message);
                    reject(error);
                }
            };

            reader.onerror = () => {
                const error = new Error('Failed to read file');
                console.error('File read error:', error);
                reject(error);
            };

            reader.readAsText(file);
        });
    }

    // Utility methods for external access
    getTabCount() {
        return this.state.tabs.length;
    }

    isActiveTab(id) {
        return this.state.active === id;
    }

    // NEW METHOD: Check if there are no tabs open
    isEmpty() {
        return this.state.tabs.length === 0;
    }

    // NEW METHOD: Close all tabs
    closeAllTabs() {
        const tabIds = [...this.state.tabs.map(tab => tab.id)];
        tabIds.forEach(id => this.removeTab(id));
    }

    // Method to close all tabs except one (useful for reset)
    closeAllTabsExcept(keepId) {
        const tabsToClose = this.state.tabs
        .filter(tab => tab.id !== keepId)
        .map(tab => tab.id);

        tabsToClose.forEach(id => this.removeTab(id));
    }
}

// Create global instance with backward compatibility
window.TabManager = new TabManager();

// Legacy compatibility - expose some methods at root level if needed
window.TabManager.addTab = window.TabManager.addTab.bind(window.TabManager);
window.TabManager.removeTab = window.TabManager.removeTab.bind(window.TabManager);
window.TabManager.activateTab = window.TabManager.activateTab.bind(window.TabManager);
