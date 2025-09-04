// main.js - Enhanced main application initialization and event handling

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

    // Quality modal elements
    const qualityModal = document.getElementById('qualityModal');
    const qualityDetailModal = document.getElementById('qualityDetailModal');
    const cancelQuality = document.getElementById('cancelQuality');
    const confirmQuality = document.getElementById('confirmQuality');
    const closeQualityDetail = document.getElementById('closeQualityDetail');

    // Initialize TabManager
    window.TabManager.init(tabBar, sheets);

    // Event listeners for main UI
    newBtn.addEventListener('click', () => newModal.classList.remove('hidden'));
    closeNew.addEventListener('click', () => newModal.classList.add('hidden'));
    closeOpen.addEventListener('click', () => openModal.classList.add('hidden'));
    closeImport.addEventListener('click', () => importModal.classList.add('hidden'));

    // Quality modal event listeners
    cancelQuality.addEventListener('click', () => {
        qualityModal.classList.add('hidden');
    });

    confirmQuality.addEventListener('click', () => {
        const nameInput = document.getElementById('qualityName');
        const dpInput = document.getElementById('qualityDP');
        const typeSelect = document.getElementById('qualityType');
        const descInput = document.getElementById('qualityDescription');

        // Validate inputs
        const name = nameInput.value.trim();
        const dpCost = Number(dpInput.value) || 0;
        const type = typeSelect.value;
        const description = descInput.value.trim();

        if (!name) {
            alert('Please enter a quality name.');
            nameInput.focus();
            return;
        }

        if (dpCost < 0) {
            alert('DP cost cannot be negative.');
            dpInput.focus();
            return;
        }

        // Get the active sheet and add the quality
        const activeSheet = window.TabManager.getActiveSheet();
        if (activeSheet && activeSheet.firstElementChild._qualityFunctions) {
            const qualityData = {
                name: name,
                dpCost: dpCost,
                type: type,
                description: description
            };

            activeSheet.firstElementChild._qualityFunctions.addQuality(qualityData);
            qualityModal.classList.add('hidden');
        } else {
            alert('No active sheet found or quality system not available.');
        }
    });

    closeQualityDetail.addEventListener('click', () => {
        qualityDetailModal.classList.add('hidden');
    });

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
        // Don't trigger shortcuts if user is typing in an input/textarea or if modal is open
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        // Check if any modal is open
        const modalOpen = !qualityModal.classList.contains('hidden') ||
        !qualityDetailModal.classList.contains('hidden') ||
        !newModal.classList.contains('hidden') ||
        !openModal.classList.contains('hidden') ||
        !importModal.classList.contains('hidden');

        if (modalOpen) return;

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
        // ESC to close any open modal
        else if (e.key === 'Escape') {
            e.preventDefault();
            [newModal, openModal, importModal, qualityModal, qualityDetailModal].forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });

    // Enhanced modal management - close on background click
    [newModal, openModal, importModal, qualityModal, qualityDetailModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Quality modal form handling - Enter to confirm, Escape to cancel
    qualityModal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            confirmQuality.click();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            qualityModal.classList.add('hidden');
        }
    });

    // Start with a fresh Digimon sheet
    window.TabManager.addTab('New Digimon','digimon');
 });
