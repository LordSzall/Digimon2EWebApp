// main.js - Main application initialization and event handling

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const tabBar = document.getElementById('tabBar');
    const sheets = document.getElementById('sheets');
    const newBtn = document.getElementById('newBtn');
    const saveBtn = document.getElementById('saveBtn');
    const openBtn = document.getElementById('openBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const newModal = document.getElementById('newModal');
    const openModal = document.getElementById('openModal');
    const importModal = document.getElementById('importModal');
    const closeNew = document.getElementById('closeNew');
    const closeOpen = document.getElementById('closeOpen');
    const closeImport = document.getElementById('closeImport');
    const openList = document.getElementById('openList');

    // Initialize TabManager
    window.TabManager.init(tabBar, sheets);

    // Event listeners for main UI
    newBtn.addEventListener('click', () => newModal.classList.remove('hidden'));
    closeNew.addEventListener('click', () => newModal.classList.add('hidden'));
    closeOpen.addEventListener('click', () => openModal.classList.add('hidden'));
    closeImport.addEventListener('click', () => importModal.classList.add('hidden'));

    // Save and Load functionality
    saveBtn.addEventListener('click', () => window.SaveLoad.save());
    openBtn.addEventListener('click', () => window.SaveLoad.open(openList, openModal));

    // Export functionality
    exportBtn.addEventListener('click', () => {
        try {
            window.SaveLoad.exportSheet();
        } catch (error) {
            console.error('Export button error:', error);
            alert('Export failed: ' + error.message);
        }
    });

    // Import functionality
    importBtn.addEventListener('click', () => {
        try {
            window.SaveLoad.importSheet();
        } catch (error) {
            console.error('Import button error:', error);
            alert('Import failed: ' + error.message);
        }
    });

    // New sheet type selection
    document.querySelectorAll('[data-newtype]').forEach(b => {
        b.addEventListener('click', () => {
            const type = b.getAttribute('data-newtype');
            if(type === 'digimon') {
                window.TabManager.addTab('New Digimon','digimon');
            } else if(type === 'tamer') {
                window.TabManager.addTab('New Tamer','tamer');
            }
            newModal.classList.add('hidden');
        });
    });

    // Keyboard shortcuts for power users
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S for save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            window.SaveLoad.save();
        }
        // Ctrl/Cmd + O for open
        else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            window.SaveLoad.open(openList, openModal);
        }
        // Ctrl/Cmd + E for export
        else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            window.SaveLoad.exportSheet();
        }
        // Ctrl/Cmd + I for import
        else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            window.SaveLoad.importSheet();
        }
        // Ctrl/Cmd + N for new
        else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            newModal.classList.remove('hidden');
        }
    });

    // Close modals on background click
    [newModal, openModal, importModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Start with a fresh Digimon sheet
    window.TabManager.addTab('New Digimon','digimon');
});
