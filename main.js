// main.js - Main Web App initialization and event handling

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const tabBar = document.getElementById('tabBar');
    const sheets = document.getElementById('sheets');
    const newBtn = document.getElementById('newBtn');
    const saveBtn = document.getElementById('saveBtn');
    const openBtn = document.getElementById('openBtn');
    const newModal = document.getElementById('newModal');
    const openModal = document.getElementById('openModal');
    const closeNew = document.getElementById('closeNew');
    const closeOpen = document.getElementById('closeOpen');
    const openList = document.getElementById('openList');

    // Initialize TabManager
    window.TabManager.init(tabBar, sheets);

    // Event listeners for main UI
    newBtn.addEventListener('click', () => newModal.classList.remove('hidden'));
    closeNew.addEventListener('click', () => newModal.classList.add('hidden'));
    closeOpen.addEventListener('click', () => openModal.classList.add('hidden'));

    saveBtn.addEventListener('click', () => window.SaveLoad.save());
    openBtn.addEventListener('click', () => window.SaveLoad.open(openList, openModal));

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

    // Start with a fresh Digimon sheet
    window.TabManager.addTab('New Digimon','digimon');
});
