// main.js - Enhanced main application initialization with robust error handling and Quality Formatting

document.addEventListener("DOMContentLoaded", () => {
    try {
        // Add this debounce function at the top of main.js
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Get DOM elements with safety checks
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

        // Check for missing critical elements
        if (!tabBar || !sheets) {
            console.error('Critical DOM elements missing - cannot initialize app');
            return;
        }

        // Quality modal elements
        const qualityModal = document.getElementById('qualityModal');
        const qualityDetailModal = document.getElementById('qualityDetailModal');
        const qualityModalTitle = document.getElementById('qualityModalTitle');
        const confirmQuality = document.getElementById('confirmQuality');
        const cancelQuality = document.getElementById('cancelQuality');
        const closeQualityDetail = document.getElementById('closeQualityDetail');
        const exportQuality = document.getElementById('exportQuality');

        // Quality import modal elements
        const qualityImportModal = document.getElementById('qualityImportModal');
        const closeQualityImport = document.getElementById('closeQualityImport');
        const qualitySearchInput = document.getElementById('qualitySearchInput');
        const qualityFilterType = document.getElementById('qualityFilterType');
        const qualityFilterStage = document.getElementById('qualityFilterStage'); // Fix: Added this missing element
        const qualityLibraryGrid = document.getElementById('qualityLibraryGrid');
        const qualityImportStatus = document.getElementById('qualityImportStatus');

        // NOW set up debounce AFTER elements are defined
        const debouncedRender = debounce(renderQualityLibrary, 300);

        // Initialize TabManager
        if (window.TabManager && typeof window.TabManager.init === 'function') {
            window.TabManager.init(tabBar, sheets);
        } else {
            console.error('TabManager not available');
            return;
        }

        // Safe event listener helper
        function safeAddEventListener(element, event, handler) {
            if (element && typeof handler === 'function') {
                element.addEventListener(event, handler);
            } else {
                console.warn('Cannot add event listener - element or handler invalid');
            }
        }

        // Event listeners for main UI
        safeAddEventListener(newBtn, 'click', () => newModal && newModal.classList.remove('hidden'));
        safeAddEventListener(closeNew, 'click', () => newModal && newModal.classList.add('hidden'));
        safeAddEventListener(closeOpen, 'click', () => openModal && openModal.classList.add('hidden'));
        safeAddEventListener(closeImport, 'click', () => importModal && importModal.classList.add('hidden'));

        // Quality modal event listeners
        safeAddEventListener(cancelQuality, 'click', () => {
            if (qualityModal) {
                qualityModal.classList.add('hidden');
                qualityModal._editingQuality = null;
                // Clear preview when canceling
                clearQualityPreview();
            }
        });

        // FIXED: Single confirmQuality event listener (removed duplicate)
        safeAddEventListener(confirmQuality, 'click', () => {
            try {
                const nameInput = document.getElementById('qualityName');
                const dpInput = document.getElementById('qualityDP');
                const typeSelect = document.getElementById('qualityType');
                const descInput = document.getElementById('qualityDescription');

                if (!nameInput || !dpInput || !typeSelect || !descInput) {
                    alert('Quality form elements not found.');
                    return;
                }

                // Validate inputs
                const name = nameInput.value.trim();
                const dpCost = Number(dpInput.value) || 0;
                const type = typeSelect.value;
                const description = descInput.value; // Don't trim to preserve formatting

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

                // Get the active sheet
                const activeSheet = window.TabManager && window.TabManager.getActiveSheet ?
                window.TabManager.getActiveSheet() : null;

                if (!activeSheet || !activeSheet.firstElementChild || !activeSheet.firstElementChild._qualityFunctions) {
                    alert('No active sheet found or quality system not available.');
                    return;
                }

                const qualityData = {
                    name: name,
                    dpCost: dpCost,
                    type: type,
                    description: description // Store raw text with formatting
                };

                // Check if we're editing an existing quality
                const editingQualityIndex = qualityModal._editingQuality;
                if (editingQualityIndex !== undefined && editingQualityIndex !== null) {
                    // Edit mode
                    activeSheet.firstElementChild._qualityFunctions.editQuality(editingQualityIndex, qualityData);
                    qualityModal._editingQuality = null;
                } else {
                    // Add mode
                    activeSheet.firstElementChild._qualityFunctions.addQuality(qualityData);
                }

                // Clear form and preview
                nameInput.value = '';
                dpInput.value = '1';
                typeSelect.value = 'Static';
                descInput.value = '';
                clearQualityPreview();

                qualityModal.classList.add('hidden');
                qualityModal._editingQuality = null;

            } catch (error) {
                console.error('Error adding/editing quality:', error);
                alert('Error processing quality: ' + error.message);
            }
        });

        safeAddEventListener(closeQualityDetail, 'click', () => {
            qualityDetailModal && qualityDetailModal.classList.add('hidden');
        });

        // Export Quality functionality
        safeAddEventListener(exportQuality, 'click', () => {
            try {
                const qualityIndex = parseInt(qualityDetailModal.dataset.qualityIndex);
                const activeSheet = window.TabManager && window.TabManager.getActiveSheet ?
                window.TabManager.getActiveSheet() : null;

                if (!activeSheet || !activeSheet.firstElementChild || !activeSheet.firstElementChild.__getData) {
                    alert('No active sheet found.');
                    return;
                }

                const sheetData = activeSheet.firstElementChild.__getData();
                if (!sheetData.qualities || !sheetData.qualities.list || !sheetData.qualities.list[qualityIndex]) {
                    alert('Quality not found.');
                    return;
                }

                const quality = sheetData.qualities.list[qualityIndex];

                // Create export payload
                const exportPayload = {
                    version: "1.0",
                    application: "DDA2E Quality",
                    exportDate: new Date().toISOString(),
                             type: "quality",
                             data: {
                                 name: quality.name,
                                 dpCost: quality.dpCost,
                                 type: quality.type,
                                 description: quality.description
                             }
                };

                // Generate filename
                const sanitizedName = quality.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `${sanitizedName}_quality.json`;

                // Create and download file
                const jsonString = JSON.stringify(exportPayload, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                alert(`Quality "${quality.name}" exported successfully!`);
                qualityDetailModal.classList.add('hidden');

            } catch (error) {
                console.error('Export quality error:', error);
                alert('Error exporting quality: ' + error.message);
            }
        });

        // Quality import modal functionality
        safeAddEventListener(closeQualityImport, 'click', () => {
            qualityImportModal && qualityImportModal.classList.add('hidden');
        });

        // FIXED: Moved initializeQualityLibrary function before it's used
        function initializeQualityLibrary() {
            if (!window.QualityLibrary) {
                console.error('QualityLibrary not available');
                if (qualityImportStatus) {
                    qualityImportStatus.textContent = 'Quality library system not available';
                }
                return;
            }

            window.QualityLibrary.loadManifest()
            .then(() => {
                renderQualityLibrary();
                const qualitiesCount = window.QualityLibrary.getQualities().length;
                if (qualityImportStatus) {
                    qualityImportStatus.textContent = `${qualitiesCount} qualities available`;
                }
            })
            .catch(error => {
                console.error('Error loading quality library:', error);
                if (qualityImportStatus) {
                    qualityImportStatus.textContent = 'Error loading quality library: ' + error.message;
                }
            });
        }

        function renderQualityLibrary() {
            if (!qualityLibraryGrid || !window.QualityLibrary) {
                return;
            }

            const searchTerm = qualitySearchInput ? qualitySearchInput.value.toLowerCase() : '';
            const typeFilter = qualityFilterType ? qualityFilterType.value : '';
            const stageFilter = qualityFilterStage ? qualityFilterStage.value : '';

            let qualities = window.QualityLibrary.getQualities();

            // Apply filters
            if (searchTerm) {
                qualities = qualities.filter(quality =>
                (quality.name && quality.name.toLowerCase().includes(searchTerm)) ||
                (quality.description && quality.description.toLowerCase().includes(searchTerm))
                );
            }

            if (typeFilter) {
                qualities = qualities.filter(quality => quality.type === typeFilter);
            }

            if (stageFilter) {
                qualities = qualities.filter(quality =>
                !quality.stage || quality.stage === stageFilter
                );
            }

            qualityLibraryGrid.innerHTML = '';

            if (qualities.length === 0) {
                qualityLibraryGrid.innerHTML = '<div class="quality-library-empty">No qualities found matching your search.</div>';
                return;
            }

            qualities.forEach(quality => {
                try {
                    const item = document.createElement('div');
                    item.className = `quality-library-item ${(quality.type || 'static').toLowerCase()}`;

                    // Format description for display
                    const formattedDescription = window.QualityFormatter ?
                    window.QualityFormatter.formatDescription(quality.description || 'No description') :
                    (quality.description || 'No description');

                    item.innerHTML = `
                    <div class="quality-library-name">${quality.name || 'Unnamed Quality'}</div>
                    <div class="quality-library-meta">
                    <div class="quality-library-stage">${quality.stage || 'Any'}</div>
                    <div class="quality-library-type ${(quality.type || 'static').toLowerCase()}">${quality.type || 'Static'}</div>
                    <div class="quality-library-dp">${quality.dpCost || 0} DP</div>
                    </div>
                    <div class="quality-library-description">${formattedDescription}</div>
                    `;

                    item.addEventListener('click', () => {
                        try {
                            const activeSheet = window.TabManager && window.TabManager.getActiveSheet ?
                            window.TabManager.getActiveSheet() : null;

                            if (!activeSheet || !activeSheet.firstElementChild || !activeSheet.firstElementChild._qualityFunctions) {
                                alert('No active sheet found.');
                                return;
                            }

                            activeSheet.firstElementChild._qualityFunctions.addQuality({
                                name: quality.name,
                                dpCost: quality.dpCost,
                                type: quality.type,
                                description: quality.description
                            });

                            alert(`Quality "${quality.name}" imported successfully!`);
                            qualityImportModal.classList.add('hidden');

                        } catch (error) {
                            console.error('Error importing quality:', error);
                            alert('Error importing quality: ' + error.message);
                        }
                    });

                    qualityLibraryGrid.appendChild(item);

                } catch (error) {
                    console.error('Error rendering quality item:', error);
                }
            });
        }

        // Search and filter event listeners
        safeAddEventListener(qualitySearchInput, 'input', renderQualityLibrary);
        safeAddEventListener(qualityFilterType, 'change', renderQualityLibrary);
        safeAddEventListener(qualityFilterStage, 'change', renderQualityLibrary); // Fix: Added missing event listener

        // Then later, set up the event listeners with debounce:
        safeAddEventListener(qualitySearchInput, 'input', debouncedRender);
        safeAddEventListener(qualityFilterType, 'change', debouncedRender);
        safeAddEventListener(qualityFilterStage, 'change', debouncedRender);

        // Open quality import modal function
        window.openQualityImportModal = () => {
            try {
                if (!qualityImportModal) {
                    alert('Quality import modal not available');
                    return;
                }

                qualityImportModal.classList.remove('hidden');

                // Clear form fields with safety checks
                if (qualitySearchInput) qualitySearchInput.value = '';
                if (qualityFilterStage) {
                    qualityFilterStage.value = '';
                }
                if (qualityFilterType) qualityFilterType.value = '';

                initializeQualityLibrary();

            } catch (error) {
                console.error('Error opening quality import modal:', error);
                alert('Error opening quality import: ' + error.message);
            }
        };

        // Edit quality button
        const editQualityBtn = document.getElementById('editQuality');
        safeAddEventListener(editQualityBtn, 'click', () => {
            try {
                const qualityIndex = parseInt(qualityDetailModal.dataset.qualityIndex);

                if (!isNaN(qualityIndex)) {
                    const activeSheet = window.TabManager && window.TabManager.getActiveSheet ?
                    window.TabManager.getActiveSheet() : null;

                    if (activeSheet && activeSheet.firstElementChild && activeSheet.firstElementChild._qualityFunctions) {
                        qualityDetailModal.classList.add('hidden');
                        activeSheet.firstElementChild._qualityFunctions.openEditModal(qualityIndex);
                    }
                }
            } catch (error) {
                console.error('Error editing quality:', error);
                alert('Error editing quality: ' + error.message);
            }
        });

        // Quality preview functionality
        function clearQualityPreview() {
            const preview = document.getElementById('qualityDescriptionPreview');
            if (preview) {
                preview.innerHTML = 'Type in the description above to see a preview...';
                preview.style.opacity = '0.6';
            }
        }

        function updateQualityPreview() {
            const descInput = document.getElementById('qualityDescription');
            const preview = document.getElementById('qualityDescriptionPreview');

            if (descInput && preview) {
                const text = descInput.value;
                if (!text.trim()) {
                    preview.innerHTML = 'Type in the description above to see a preview...';
                    preview.style.opacity = '0.6';
                } else {
                    preview.innerHTML = window.QualityFormatter ?
                    window.QualityFormatter.formatDescription(text) :
                    text.replace(/\n/g, '<br>');
                    preview.style.opacity = '1';
                }
            }
        }

        // Set up quality preview after DOM is ready
        setTimeout(() => {
            const descInput = document.getElementById('qualityDescription');
            if (descInput) {
                safeAddEventListener(descInput, 'input', updateQualityPreview);
            }
        }, 100);

        // Save and Load functionality
        safeAddEventListener(saveBtn, 'click', () => {
            try {
                if (window.SaveLoad && typeof window.SaveLoad.save === 'function') {
                    window.SaveLoad.save();
                } else {
                    alert('Save functionality not available');
                }
            } catch (error) {
                console.error('Save error:', error);
                alert('Save failed: ' + error.message);
            }
        });

        safeAddEventListener(openBtn, 'click', () => {
            try {
                if (window.SaveLoad && typeof window.SaveLoad.open === 'function') {
                    window.SaveLoad.open(openList, openModal);
                } else {
                    alert('Open functionality not available');
                }
            } catch (error) {
                console.error('Open error:', error);
                alert('Open failed: ' + error.message);
            }
        });

        // Export functionality
        safeAddEventListener(exportBtn, 'click', () => {
            try {
                if (window.SaveLoad && typeof window.SaveLoad.exportSheet === 'function') {
                    window.SaveLoad.exportSheet();
                } else {
                    alert('Export functionality not available');
                }
            } catch (error) {
                console.error('Export button error:', error);
                alert('Export failed: ' + error.message);
            }
        });

        // Import functionality
        safeAddEventListener(importBtn, 'click', () => {
            try {
                if (window.SaveLoad && typeof window.SaveLoad.importSheet === 'function') {
                    window.SaveLoad.importSheet();
                } else {
                    alert('Import functionality not available');
                }
            } catch (error) {
                console.error('Import button error:', error);
                alert('Import failed: ' + error.message);
            }
        });

        // New sheet type selection
        document.querySelectorAll('[data-newtype]').forEach(b => {
            safeAddEventListener(b, 'click', () => {
                try {
                    const type = b.getAttribute('data-newtype');
                    if (window.TabManager && typeof window.TabManager.addTab === 'function') {
                        if (type === 'digimon') {
                            window.TabManager.addTab('New Digimon','digimon');
                        } else if (type === 'tamer') {
                            window.TabManager.addTab('New Tamer','tamer');
                        }
                        newModal && newModal.classList.add('hidden');
                    } else {
                        alert('Tab manager not available');
                    }
                } catch (error) {
                    console.error('Error creating new sheet:', error);
                    alert('Error creating new sheet: ' + error.message);
                }
            });
        });

        // Modal management
        const allModals = [newModal, openModal, importModal, qualityModal, qualityDetailModal, qualityImportModal].filter(Boolean);

        // ESC key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                allModals.forEach(modal => {
                    if (modal) modal.classList.add('hidden');
                });
                    if (qualityModal) {
                        qualityModal._editingQuality = null;
                        clearQualityPreview();
                    }
            }
        });

        // Background click to close modals
        allModals.forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.add('hidden');
                        if (modal === qualityModal) {
                            qualityModal._editingQuality = null;
                            clearQualityPreview();
                        }
                    }
                });
            }
        });

        // Start with a fresh Digimon sheet
        try {
            if (window.TabManager && typeof window.TabManager.addTab === 'function') {
                window.TabManager.addTab('New Digimon','digimon');
            }
        } catch (error) {
            console.error('Error creating initial sheet:', error);
        }

    } catch (error) {
        console.error('Critical error during app initialization:', error);
        alert('Application failed to initialize. Please refresh the page and check the console for errors.');
    }
});
