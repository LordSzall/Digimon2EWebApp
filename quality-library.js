// quality-library.js - Quality Library Management System with Error Handling

window.QualityLibrary = {
    qualities: [],
    manifest: null,
    initialized: false,

    // Default manifest structure
    defaultManifest: {
        version: "1.0",
        lastUpdated: "2025-01-07",
        basePath: "qualities/",
        qualities: [
            {
                filename: "core_qualities.json",
                name: "Core Qualities",
                description: "All Starting Core Qualities",
                count: 26,
                types: ["Static", "Attack", "Trigger"],
                tags: ["core", "child", "data-opt"]
            }
        ]
    },

    async loadManifest() {
        try {
            // Set flag to prevent multiple simultaneous loads
            if (this.initialized) {
                return;
            }
            this.initialized = true;

            console.log('Loading quality library manifest...');

            // First try to load manifest from file
            try {
                const response = await fetch('qualities/manifest.json');
                if (response.ok) {
                    this.manifest = await response.json();
                    console.log('Loaded manifest from file');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (fetchError) {
                // Fallback to default manifest
                console.warn('Could not load manifest.json, using default manifest:', fetchError.message);
                this.manifest = JSON.parse(JSON.stringify(this.defaultManifest));
            }

            // Load all quality files listed in manifest
            await this.loadQualityFiles();

            console.log(`Successfully loaded ${this.qualities.length} qualities from library`);

        } catch (error) {
            console.error('Critical error loading quality manifest:', error);
            // Use default manifest as fallback
            this.manifest = JSON.parse(JSON.stringify(this.defaultManifest));
            this.qualities = []; // Reset to empty array
        }
    },

    async loadQualityFiles() {
        this.qualities = [];

        if (!this.manifest || !this.manifest.qualities) {
            console.warn('No manifest or qualities list found');
            return;
        }

        const loadPromises = this.manifest.qualities.map(async (qualityFile) => {
            try {
                await this.loadQualityFile(qualityFile.filename);
            } catch (error) {
                console.warn(`Failed to load quality file: ${qualityFile.filename}`, error);
            }
        });

        // Wait for all files to attempt loading
        await Promise.allSettled(loadPromises);
    },

    async loadQualityFile(filename) {
        try {
            const basePath = this.manifest.basePath || 'qualities/';
            const fullUrl = basePath + filename;

            console.log(`Loading quality file: ${fullUrl}`);

            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different file formats
            if (data.type === 'quality-collection' && Array.isArray(data.qualities)) {
                // Collection of multiple qualities
                let addedCount = 0;
                data.qualities.forEach(quality => {
                    if (this.validateQuality(quality)) {
                        this.qualities.push({
                            ...quality,
                            source: filename
                        });
                        addedCount++;
                    } else {
                        console.warn(`Invalid quality in ${filename}:`, quality);
                    }
                });
                console.log(`Added ${addedCount} qualities from ${filename}`);

            } else if (data.type === 'quality' && data.data) {
                // Single quality file
                if (this.validateQuality(data.data)) {
                    this.qualities.push({
                        ...data.data,
                        source: filename
                    });
                    console.log(`Added quality from ${filename}: ${data.data.name}`);
                } else {
                    console.warn(`Invalid quality data in ${filename}:`, data.data);
                }
            } else {
                // Legacy format - assume it's a direct quality object or array
                if (Array.isArray(data)) {
                    let addedCount = 0;
                    data.forEach(quality => {
                        if (this.validateQuality(quality)) {
                            this.qualities.push({
                                ...quality,
                                source: filename
                            });
                            addedCount++;
                        }
                    });
                    console.log(`Added ${addedCount} legacy qualities from ${filename}`);
                } else if (this.validateQuality(data)) {
                    this.qualities.push({
                        ...data,
                        source: filename
                    });
                    console.log(`Added legacy quality from ${filename}: ${data.name}`);
                } else {
                    console.warn(`Unrecognized file format in ${filename}`);
                }
            }

        } catch (error) {
            console.error(`Error loading quality file ${filename}:`, error);
            throw error;
        }
    },

    validateQuality(quality) {
        try {
            if (!quality || typeof quality !== 'object') {
                return false;
            }

            // Required fields
            if (!quality.name || typeof quality.name !== 'string' || quality.name.trim() === '') {
                return false;
            }

            if (typeof quality.dpCost !== 'number' || quality.dpCost < 0) {
                return false;
            }

            if (!quality.type || !['Attack', 'Static', 'Trigger'].includes(quality.type)) {
                return false;
            }

            if (!quality.description || typeof quality.description !== 'string') {
                return false;
            }

            return true;

        } catch (error) {
            console.error('Error validating quality:', error);
            return false;
        }
    },

    getQualities() {
        return this.qualities || [];
    },

    getQualitiesByType(type) {
        return this.getQualities().filter(quality => quality.type === type);
    },

    searchQualities(searchTerm, typeFilter = '', stageFilter = '') {
        if (!searchTerm && !typeFilter && !stageFilter) return this.getQualities();

        const term = searchTerm ? searchTerm.toLowerCase() : '';
        return this.getQualities().filter(quality => {
            // Search term filter
            const matchesSearch = !term ||
            quality.name.toLowerCase().includes(term) ||
            quality.description.toLowerCase().includes(term) ||
            (quality.tags && Array.isArray(quality.tags) && quality.tags.some(tag =>
            typeof tag === 'string' && tag.toLowerCase().includes(term)
            ));

            // Type filter
            const matchesType = !typeFilter || quality.type === typeFilter;

            // Stage filter
            const matchesStage = !stageFilter ||
            !quality.stage ||
            quality.stage === 'Any' ||
            quality.stage === stageFilter;

            return matchesSearch && matchesType && matchesStage;
        });
    },

    // Export quality to file
    exportQuality(quality, filename = null) {
        if (!this.validateQuality(quality)) {
            throw new Error('Invalid quality data');
        }

        const exportData = {
            version: "1.0",
            application: "DDA2E Quality Library",
            exportDate: new Date().toISOString(),
            type: "quality",
            data: {
                name: quality.name,
                dpCost: quality.dpCost,
                stage: quality.stage || 'Any',
                type: quality.type,
                description: quality.description,
                ...(quality.tags && Array.isArray(quality.tags) && { tags: quality.tags }),
                ...(quality.source && { originalSource: quality.source })
            }
        };

        return exportData;
    },

    // Import quality from file data
    importQuality(fileData) {
        if (!fileData || typeof fileData !== 'object') {
            throw new Error('Invalid file data');
        }

        let qualityData;

        if (fileData.type === 'quality' && fileData.data) {
            qualityData = fileData.data;
        } else {
            // Assume direct quality object
            qualityData = fileData;
        }

        if (!this.validateQuality(qualityData)) {
            throw new Error('Invalid quality data format');
        }

        return {
            name: qualityData.name,
            dpCost: qualityData.dpCost,
            stage: qualityData.stage || 'Any',
            type: qualityData.type,
            description: qualityData.description
        };
    },

    // Get library statistics
    getStats() {
        const qualities = this.getQualities();
        const stats = {
            total: qualities.length,
            byType: {
                Attack: qualities.filter(q => q.type === 'Attack').length,
                Static: qualities.filter(q => q.type === 'Static').length,
                Trigger: qualities.filter(q => q.type === 'Trigger').length
            },
            byStage: {
                Child: qualities.filter(q => q.stage === 'Child').length,
                Adult: qualities.filter(q => q.stage === 'Adult').length,
                Perfect: qualities.filter(q => q.stage === 'Perfect').length,
                Ultimate: qualities.filter(q => q.stage === 'Ultimate').length,
                Any: qualities.filter(q => !q.stage || q.stage === 'Any').length
            },
            files: this.manifest ? this.manifest.qualities.length : 0,
            initialized: this.initialized
        };

        return stats;
    },

    // Reset library (for debugging)
    reset() {
        this.qualities = [];
        this.manifest = null;
        this.initialized = false;
        console.log('Quality library reset');
    }
};
