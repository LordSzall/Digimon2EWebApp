// tamer-sheet.js - Tamer character sheet functionality with integrated health bar and Special Orders

window.TamerSheet = {
    getDefaultData() {
        return {
            meta: { name:'', size:'Medium', age:0 },
            combat: { wounds:0, currentWounds:0, inspiration:0, milestones:0, speed:'Agility' },
            attributes: { AGI:{dp:0}, BOD:{dp:0}, CHA:{dp:0}, INT:{dp:0}, WIL:{dp:0} },
            skills: {
                AGI: { "Evade_WIL":0, "Precision_INT":0, "Stealth_BOD":0 },
                BOD: { "Athletics_AGI":0, "Endurance_WIL":0, "Feats_of_Strength_CHA":0 },
                CHA: { "Manipulate_BOD":0, "Perform_AGI":0, "Persuasion_INT":0 },
                INT: { "Decipher_Intent_CHA":0, "Survival_WIL":0, "Knowledge":0 },
                WIL: { "Bravery_BOD":0, "Fortitude_INT":0, "Awareness_AGI":0 }
            },
            aspects: { major:{ name:'', desc:'' }, minor:{ name:'', desc:'' } },
            torments: { marks:Array(10).fill(0), desc:'' },
            talents: '',
            milestones: {
                Qualities: 0,
                ACC: 0,
                DOD: 0,
                DAM: 0,
                ARM: 0,
                HP: 0
            },
            specialOrders: {
                available: []
            }
        };
    },

    render(id, data) {
        data = data || this.getDefaultData();
        const root = document.createElement('div');

        // Ensure special orders structure exists
        if (!data.specialOrders) {
            data.specialOrders = { available: [] };
        }

        // Basic Info
        root.appendChild(el(`<section class="panel">
        <h2 class="section-title">Tamer Info</h2>
        <div class="grid g-3">
        ${textField('Name','meta.name')}
        ${selectField('Size','meta.size',['Small','Medium'])}
        ${numberField('Age','meta.age',{min:0})}
        </div>
        </section>`));

        // Combat with integrated health bar
        const combatPanel = el(`<section class="panel">
        <h2 class="section-title">Combat</h2>
        <div class="health-wrapper">
        <div class="health-bar-container">
        <div class="health-bar" id="health-bar-${id}"></div>
        <span class="health-text" id="health-text-${id}">0 / 0</span>
        </div>
        </div>
        <div class="grid g-3">
        <div>
        <label>Current Wounds:
        <input type="number" id="current-wounds-${id}" data-bind="combat.currentWounds" value="0" min="0" />
        </label>
        <div class="kpi mt-6"><div class="muted">Total</div><div class="value" data-out="combat:woundTotal">0</div></div>
        <div class="tiny">Formula: BOD attribute value</div>
        </div>
        <div>
        <label>Inspiration:<input type="number" data-bind="combat.inspiration"/></label>
        <div class="kpi mt-6"><div class="muted">Total</div><div class="value" data-out="combat:inspireTotal">0</div></div>
        <div class="tiny">Formula: WIL + 2</div>
        </div>
        <div>
        ${selectField('Speed','combat.speed',['Agility','Athletics'])}
        <label>Milestones:<input type="number" data-bind="combat.milestones"/></label>
        </div>
        </div>
        </section>`);
        root.appendChild(combatPanel);

        // Special Orders Section
        const specialOrdersPanel = el(`<section class="panel">
        <h2 class="section-title">Special Orders</h2>
        <div class="special-orders-grid" id="specialOrdersGrid-${id}"></div>
        </section>`);
        root.appendChild(specialOrdersPanel);

        // Milestone Tracker
        const milestonePanel = el(`<section class="panel">
        <h2 class="section-title">Milestone Tracker</h2>
        <div class="milestone-tracker" id="milestoneTracker-${id}"></div>
        </section>`);
        root.appendChild(milestonePanel);

        const milestoneTracker = milestonePanel.querySelector(`#milestoneTracker-${id}`);

        function updateMilestoneTracker() {
            milestoneTracker.innerHTML = '';
            const milestoneTypes = ['Qualities', 'ACC', 'DOD', 'DAM', 'ARM', 'HP'];

            milestoneTypes.forEach(type => {
                if (typeof data.milestones[type] !== 'number') {
                    data.milestones[type] = 0;
                }

                const item = el(`<div class="milestone-item">
                <div class="milestone-name">${type}</div>
                <div class="milestone-input">
                <input type="number" min="0" max="99" step="1" data-bind="milestones.${type}" value="${data.milestones[type]}" />
                </div>
                </div>`);

                milestoneTracker.appendChild(item);
            });
        }
        updateMilestoneTracker();

        // Attributes
        const attrPanel = el(`<section class="panel">
        <h2 class="section-title">Attributes</h2>
        <div class="grid g-5" id="attrGrid-${id}"></div>
        </section>`);
        root.appendChild(attrPanel);

        const attrGrid = attrPanel.querySelector(`#attrGrid-${id}`);
        Object.keys(data.attributes).forEach(k=>{
            const card = el(`<div class="stat-card">
            <div class="stat-total" data-out="attr:${k}">0</div>
            <div class="stat-name">${k}</div>
            <label>DP:<input type="number" data-bind="attributes.${k}.dp"/></label>
            </div>`);
            attrGrid.appendChild(card);
        });

        // Skills Section
        const skillsByAttr = {
            AGI: ["Evade (WIL)", "Precision (INT)", "Stealth (BOD)"],
            BOD: ["Athletics (AGI)", "Endurance (WIL)", "Feats of Strength (CHA)"],
            CHA: ["Manipulate (BOD)", "Perform (AGI)", "Persuasion (INT)"],
            INT: ["Decipher Intent (CHA)", "Survival (WIL)", "Knowledge"],
            WIL: ["Bravery (BOD)", "Fortitude (INT)", "Awareness (AGI)"]
        };

        const skillsPanel = el(`<section class="panel"><h2 class="section-title">Skills</h2></section>`);
        const tabs = el(`<div class="skill-tabs" id="skillTabs-${id}"></div>`);
        const skillsContainer = el(`<div id="skillsContainer-${id}"></div>`);

        Object.keys(skillsByAttr).forEach(attr => {
            const skillSection = document.createElement('div');
            skillSection.className = 'skill-section';
            skillSection.dataset.attr = attr;
            skillSection.style.display = 'none';

            skillsByAttr[attr].forEach(skill => {
                const safeSkillName = skill.replace(/[\(\)]/g, '').replace(/\s+/g, '_');
                const val = data.skills[attr][safeSkillName] || 0;

                const entry = el(`<div class="skill-entry">
                <label>${skill}</label>
                <input type="number" value="${val}" data-bind="skills.${attr}.${safeSkillName}" />
                </div>`);

                skillSection.appendChild(entry);
            });

            skillsContainer.appendChild(skillSection);
        });

        Object.keys(skillsByAttr).forEach(attr => {
            const btn = el(`<button data-skilltab="${attr}">${attr}</button>`);
            btn.addEventListener("click", () => this.showSkills(attr, skillsContainer, tabs));
            tabs.appendChild(btn);
        });

        skillsPanel.appendChild(tabs);
        skillsPanel.appendChild(skillsContainer);
        root.appendChild(skillsPanel);

        // Open default tab
        this.showSkills("AGI", skillsContainer, tabs);

        // Aspects
        const aspectPanel = el(`<section class="panel">
        <h2 class="section-title">Aspects</h2>
        <div class="grid g-2">
        <div>
        <h3>Major Aspect</h3>
        ${textField('Name','aspects.major.name')}
        <label>Description:<textarea data-bind="aspects.major.desc"></textarea></label>
        </div>
        <div>
        <h3>Minor Aspect</h3>
        ${textField('Name','aspects.minor.name')}
        <label>Description:<textarea data-bind="aspects.minor.desc"></textarea></label>
        </div>
        </div>
        </section>`);
        root.appendChild(aspectPanel);

        // Torments
        const tormentPanel = el(`<section class="panel">
        <h2 class="section-title">Torments</h2>
        <div class="torment-track" id="tormentTrack-${id}"></div>
        <label>Description:<textarea rows="8" data-bind="torments.desc" placeholder="Describe torments and their effects..."></textarea></label>
        </section>`);
        root.appendChild(tormentPanel);

        const tormentTrack = tormentPanel.querySelector(`#tormentTrack-${id}`);

        function updateTormentTrack() {
            tormentTrack.innerHTML = '';

            if (!data.torments.marks || data.torments.marks.length !== 10) {
                data.torments.marks = Array(10).fill(0);
            }

            data.torments.marks.forEach((mark, i) => {
                const box = el(`<div class="torment-box" data-index="${i}">${i+1}</div>`);
                box.classList.add(`state-${mark}`);
                box.addEventListener('click', () => {
                    data.torments.marks[i] = (data.torments.marks[i] + 1) % 3;
                    updateTormentTrack();
                });
                tormentTrack.appendChild(box);
            });
        }
        updateTormentTrack();

        // Talents
        root.appendChild(el(`<section class="panel">
        <h2 class="section-title">Talents</h2>
        <label><textarea rows="16" data-bind="talents" placeholder="Describe your talents..."></textarea></label>
        </section>`));

        // Special Orders Management Functions
        function updateSpecialOrdersDisplay() {
            const grid = specialOrdersPanel.querySelector(`#specialOrdersGrid-${id}`);
            grid.innerHTML = '';

            // Check if SpecialOrders is available
            if (typeof window.SpecialOrders === 'undefined') {
                grid.appendChild(el(`<div class="note">Special Orders system not loaded. Please include special-orders.js script.</div>`));
                return;
            }

            // Calculate available special orders based on current attribute levels
            const currentOrders = getAvailableSpecialOrders(data);

            if (currentOrders.length === 0) {
                grid.appendChild(el(`<div class="note">No Special Orders Unlocked.</div>`));
                return;
            }

            currentOrders.forEach(order => {
                const color = window.SpecialOrders.getAttributeColor(order.attribute);
                const orderBtn = el(`
                <div class="special-order-btn" style="border-color: ${color}; box-shadow: 0 0 8px ${color}33;" data-order="${order.attribute}-${order.level}">
                <div class="special-order-name">${order.name}</div>
                <div class="special-order-type">${order.type}</div>
                <div class="special-order-attr">${order.attribute} ${order.level}</div>
                </div>
                `);

                // Click to view special order details
                orderBtn.addEventListener('click', () => {
                    showSpecialOrderDetail(order);
                });

                grid.appendChild(orderBtn);
            });
        }

        function showSpecialOrderDetail(order) {
            const modal = document.getElementById('specialOrderDetailModal') || createSpecialOrderDetailModal();
            const title = modal.querySelector('#specialOrderDetailTitle');
            const attribute = modal.querySelector('#specialOrderDetailAttribute');
            const type = modal.querySelector('#specialOrderDetailType');
            const level = modal.querySelector('#specialOrderDetailLevel');
            const description = modal.querySelector('#specialOrderDetailDescription');

            title.textContent = order.name;
            attribute.textContent = order.attribute;
            attribute.style.color = window.SpecialOrders.getAttributeColor(order.attribute);
            type.textContent = order.type;
            level.textContent = `Level ${order.level}`;
            description.textContent = order.description;

            modal.classList.remove('hidden');
        }

        function createSpecialOrderDetailModal() {
            // Create modal if it doesn't exist
            const modal = el(`
            <div class="modal hidden" id="specialOrderDetailModal">
            <div class="box">
            <h3 id="specialOrderDetailTitle">Special Order</h3>
            <div class="special-order-meta">
            <span class="special-order-badge" id="specialOrderDetailAttribute">AGI</span>
            <span class="special-order-badge" id="specialOrderDetailType">1/Round</span>
            <span class="special-order-badge" id="specialOrderDetailLevel">Level 5</span>
            </div>
            <div class="hr"></div>
            <div class="special-order-description-container">
            <div id="specialOrderDetailDescription">Special Order description will appear here...</div>
            </div>
            <div class="row modal-footer">
            <button class="btn" id="closeSpecialOrderDetail">Close</button>
            </div>
            </div>
            </div>
            `);

            document.body.appendChild(modal);

            // Add close event
            modal.querySelector('#closeSpecialOrderDetail').addEventListener('click', () => {
                modal.classList.add('hidden');
            });

            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });

            return modal;
        }

        // Get available special orders based on current attribute levels
        function getAvailableSpecialOrders(data) {
            const orders = [];
            const attributes = ['AGI', 'BOD', 'CHA', 'INT', 'WIL'];

            if (typeof window.SpecialOrders === 'undefined') {
                return orders;
            }

            attributes.forEach(attr => {
                const attrTotal = getAttributeTotal(data, attr);
                for (let level = 5; level <= Math.min(attrTotal, 7); level++) {
                    const order = window.SpecialOrders.getSpecialOrder(attr, level);
                    if (order) {
                        orders.push(order);
                    }
                }
            });

            return orders;
        }

        // Get attribute total (base 1 + DP)
        function getAttributeTotal(data, attr) {
            return 1 + (Number(data.attributes[attr].dp) || 0);
        }

        // Initial special orders display
        updateSpecialOrdersDisplay();

        // Data binding
        root.addEventListener('input', (e) => {
            const path = e.target.getAttribute('data-bind');
            if(path) {
                try {
                    const value = coerce(e.target.value);

                    // Additional validation based on field type
                    if(e.target.type === 'number') {
                        const min = e.target.min ? Number(e.target.min) : -Infinity;
                        const max = e.target.max ? Number(e.target.max) : Infinity;
                        const validatedValue = Math.max(min, Math.min(max, value));
                        setByPath(data, path, validatedValue);

                        // Update the input field with validated value
                        if(value !== validatedValue) {
                            e.target.value = validatedValue;
                        }
                    } else {
                        setByPath(data, path, value);
                    }

                    // Recompute everything including health bar
                    this.computeTamer(data, root, id);

                    // Update special orders if attributes changed
                    if(path.startsWith('attributes.')) {
                        updateSpecialOrdersDisplay();
                    }
                } catch (error) {
                    console.error('Error processing input:', error);
                    // Optional: Show user feedback
                    e.target.style.borderColor = 'var(--danger)';
                    setTimeout(() => e.target.style.borderColor = '', 1000);
                }
            }

            // Handle current wounds input for health bar
            if(e.target.id === `current-wounds-${id}`) {
                const wounds = Math.max(0, Number(e.target.value) || 0);
                data.combat.currentWounds = wounds;
                e.target.value = wounds; // Ensure valid value
                // Health bar will be updated by computeTamer call above
            }
        });

        root.querySelectorAll('[data-bind]').forEach(input => {
            const path = input.getAttribute('data-bind');
            const v = getByPath(data, path);
            if(typeof v !== 'undefined' && v !== null) input.value = v;
        });

            root.__getData = () => JSON.parse(JSON.stringify(data));
            root.__setData = (payload) => {
                try {
                    // Deep merge instead of Object.assign to preserve structure
                    const mergeDeep = (target, source) => {
                        for (const key in source) {
                            if (source[key] instanceof Object && key in target) {
                                mergeDeep(target[key], source[key]);
                            } else {
                                target[key] = source[key];
                            }
                        }
                        return target;
                    };

                    mergeDeep(data, payload || {});

                    // Ensure required structures exist
                    data.skills = data.skills || this.getDefaultData().skills;
                    data.torments = data.torments || { marks: Array(10).fill(0), desc: '' };
                    data.specialOrders = data.specialOrders || { available: [] };

                    root.querySelectorAll('[data-bind]').forEach(input => {
                        const path = input.getAttribute('data-bind');
                        const v = getByPath(data, path);
                        if(typeof v !== 'undefined' && v !== null) input.value = v;
                    });

                        updateTormentTrack();
                        updateMilestoneTracker();
                        updateSpecialOrdersDisplay();
                        this.computeTamer(data, root, id); // Pass id for health bar updates

                } catch (error) {
                    console.error('Error setting data:', error);
                    alert('Error loading data. The sheet may be corrupted.');
                }
            };

            // Special handling for skill inputs with parentheses
            setTimeout(() => {
                root.querySelectorAll('input[data-bind^="skills."]').forEach(input => {
                    const path = input.getAttribute('data-bind');
                    const v = getByPath(data, path);
                    if (typeof v !== 'undefined' && v !== null) {
                        input.value = v;
                    }
                });
            }, 100);

            // Initial computation and health bar update
            // Use setTimeout to ensure DOM is fully rendered
            setTimeout(() => {
                this.computeTamer(data, root, id);
                updateSpecialOrdersDisplay();
            }, 50);

            return root;
    },

    showSkills(attr, skillsContainer, tabs) {
        skillsContainer.querySelectorAll('.skill-section').forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = skillsContainer.querySelector(`[data-attr="${attr}"]`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        [...tabs.children].forEach(b => b.classList.remove("active"));
        tabs.querySelector(`[data-skilltab="${attr}"]`).classList.add("active");
    },

    // Update health bar visualization
    updateHealthBar(id, data) {
        const bar = document.getElementById(`health-bar-${id}`);
        const text = document.getElementById(`health-text-${id}`);

        if (!bar || !text) return;

        const current = Number(data.combat.currentWounds) || 0;
        const max = 3 + (Number(data.skills.BOD.Endurance_WIL)||0); // BOD-based wound total

        const percentage = max > 0 ? Math.min(100, (current / max) * 100) : 0;
        bar.style.width = percentage + "%";
        text.textContent = `${current} / ${max}`;

        // Color coding for health status
        if (percentage <= 25) {
            bar.className = 'health-bar health-good';
        } else if (percentage <= 75) {
            bar.className = 'health-bar health-warning';
        } else {
            bar.className = 'health-bar health-danger';
        }
    },

    computeTamer(data, root, id) {
        // Calculate attribute totals
        Object.keys(data.attributes).forEach(k => {
            const total = 1 + (Number(data.attributes[k].dp)||0);
            const out = root.querySelector(`[data-out="attr:${k}"]`);
            if(out) out.textContent = total;
        });

            // Calculate derived stats
            const wil = 1 + (Number(data.attributes.WIL.dp)||0);
            const enduranceSkill = Number(data.skills.BOD.Endurance_WIL) || 0;
            const woundTotal = 3 + enduranceSkill;

            this.setTamerOut(root, 'combat:woundTotal', woundTotal);
            this.setTamerOut(root, 'combat:inspireTotal', wil + 2);

            // Update health bar whenever stats are recomputed
            if (id) {
                this.updateHealthBar(id, data);
            } else {
                // Fallback: try to extract ID from DOM
                const idMatch = root.querySelector('[id*="current-wounds-"]');
                if (idMatch) {
                    const extractedId = idMatch.id.replace('current-wounds-', '');
                    this.updateHealthBar(extractedId, data);
                }
            }
    },

    setTamerOut(root, key, val) {
        const out = root.querySelector(`[data-out="${key}"]`);
        if(out) out.textContent = val;
    }
};
