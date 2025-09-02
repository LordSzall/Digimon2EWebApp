// digimon-sheet.js - Digimon character sheet functionality with integrated health bar

window.DigimonSheet = {
    getDefaultData() {
        return {
            meta:{ name:'', digimon:'', type:'', attribute:'Vaccine', stage:'Child', size:'Medium' },
            combat:{ woundBoxes:0, tempWounds:0, batteryManual:0, currentWounds:0 },
            stats:{ ACC:{dp:0, bonus:0}, DOD:{dp:0, bonus:0}, DAM:{dp:0, bonus:0}, ARM:{dp:0, bonus:0}, HP:{dp:0, bonus:0} },
            derived:{ BIT:{bonus:0}, RAM:{bonus:0}, DOS:{bonus:0}, CPU:{bonus:0} },
            misc: {
                Movement: { bonus: 0 },
                Range: { bonus: 0 },
                MaxRange: { bonus: 0 },
                Initiative: { bonus: 0 },
                Clash: { bonus: 0 },
                Resist: { bonus: 0 }
            },
            attacks:[ {name:'', range:'Melee', type:'Damage', acc:0, dmg:0, tags:['','','']} ],
            dp:{ quality:0, bonus:0 },
            qualities: ''
        };
    },

    render(id, data) {
        data = data || this.getDefaultData();
        const root = document.createElement('div');

        // Basic Info
        root.appendChild(el(`
        <section class="panel">
        <h2 class="section-title">Basic Info</h2>
        <div class="grid g-3">
        ${textField('Name','meta.name')}
        ${textField('Digimon','meta.digimon')}
        ${textField('Type','meta.type')}
        ${selectField('Attribute','meta.attribute',['Vaccine','Data','Virus'])}
        ${selectField('Stage','meta.stage',['Child','Adult','Perfect','Ultimate'])}
        ${selectField('Size','meta.size',['Small','Medium','Large','Huge','Gigantic','Colossal'])}
        </div>
        <div class="note mt-8">Stage value: Child=2, Adult=3, Perfect=4, Ultimate=5</div>
        </section>
        `));

        // Combat with integrated health bar
        const combatPanel = el(`
        <section class="panel">
        <h2 class="section-title">Combat</h2>
        <div class="health-wrapper">
        <div class="health-bar-container">
        <div class="health-bar" id="health-bar-${id}"></div>
        <span class="health-text" id="health-text-${id}">0 / 0</span>
        </div>
        </div>
        <div class="grid g-3">
        <div>
        <label>Wound Boxes:
        <input type="number" id="current-wounds-${id}" data-bind="combat.currentWounds" value="0" min="0" />
        </label>
        <div class="kpi mt-6"><div class="muted">Total</div><div class="value" data-out="woundTotal">0</div></div>
        <div class="tiny">Formula: (Stage Value - 1) + (HP × 2) + HP Bonus</div>
        </div>
        <div>
        <label>Temp. Wound Boxes:
        <input type="number" step="1" min="0" data-bind="combat.tempWounds" />
        </label>
        </div>
        <div>
        <label>Battery:
        <input type="number" step="1" min="0" data-bind="combat.batteryManual" />
        </label>
        <div class="kpi mt-6"><div class="muted">Total</div><div class="value" data-out="batteryTotal">0</div></div>
        <div class="tiny">Formula: Stage Value + 1</div>
        </div>
        </div>
        </section>
        `);
        root.appendChild(combatPanel);

        // Stats
        const statsPanel = el(`<section class="panel">
        <h2 class="section-title">Stats</h2>
        <div class="grid g-4" id="statsGrid-${id}"></div>
        </section>`);
        root.appendChild(statsPanel);

        const statOrder = ['ACC','DOD','DAM','ARM','HP'];
        const statsGrid = statsPanel.querySelector(`#statsGrid-${id}`);
        statOrder.forEach(k => {
            const card = el(`<div class="stat-card" data-stat="${k}">
            <div class="stat-total" data-out="stat:${k}">0</div>
            <div class="stat-name">${k}</div>
            <label>DP:<input type="number" step="1" min="0" data-bind="stats.${k}.dp" /></label>
            <label>Bonus:<input type="number" step="1" data-bind="stats.${k}.bonus" /></label>
            <div class="tiny">Total = Stage + DP + Bonus</div>
            </div>`);
            statsGrid.appendChild(card);
        });

        // Derived Stats
        const derivedPanel = el(`<section class="panel">
        <h2 class="section-title">Derived Stats</h2>
        <div class="grid g-4" id="derivedGrid-${id}"></div>
        <div class="note mt-6">Total = ⌊Associated Stat ÷ 3⌋ + Bonus, plus Size bonus.</div>
        </section>`);
        root.appendChild(derivedPanel);

        // Misc Stats
        const miscPanel = el(`<section class="panel">
        <h2 class="section-title">Misc Stats</h2>
        <div class="grid g-4" id="miscGrid-${id}"></div>
        <div class="note mt-6">Formulas auto-calculate totals. Adjust Bonus to tweak values.</div>
        </section>`);
        root.appendChild(miscPanel);

        const miscGrid = miscPanel.querySelector(`#miscGrid-${id}`);
        const miscOrder = ['Movement','Range','MaxRange','Initiative','Clash','Resist'];
        miscOrder.forEach(k => {
            const card = el(`<div class="stat-card" data-misc="${k}">
            <div class="stat-total" data-out="misc:${k}">0</div>
            <div class="stat-name">${k}</div>
            <label>Bonus:<input type="number" step="1" data-bind="misc.${k}.bonus" /></label>
            </div>`);
            miscGrid.appendChild(card);
        });

        // Initialize misc data if not present
        data.misc = data.misc || {};
        miscOrder.forEach(k => {
            data.misc[k] = data.misc[k] || { bonus:0 };
        });

        const derivedOrder = ['BIT','RAM','DOS','CPU'];
        const derivedGrid = derivedPanel.querySelector(`#derivedGrid-${id}`);
        const derivedBase = { BIT:'ACC', RAM:'DOD', DOS:'DAM', CPU:'ARM' };

        derivedOrder.forEach(k => {
            const base = derivedBase[k];
            const card = el(`<div class="stat-card" data-derived="${k}">
            <div class="stat-total" data-out="derived:${k}">0</div>
            <div class="stat-name">${k} <span class="tiny">(from ${base})</span></div>
            <label>Bonus:<input type="number" step="1" data-bind="derived.${k}.bonus" /></label>
            </div>`);
            derivedGrid.appendChild(card);
        });

        // Attacks
        const attacksPanel = el(`<section class="panel">
        <h2 class="section-title">Attacks</h2>
        <div class="badge">SIGNATURE MOVE</div>
        <div id="attacks-${id}"></div>
        <div class="row mt-12">
        <button class="btn" id="addAttack-${id}">➕ Add Attack</button>
        </div>
        </section>`);
        root.appendChild(attacksPanel);

        const attacksBox = attacksPanel.querySelector(`#attacks-${id}`);

        function renderAttackRow(idx) {
            const a = data.attacks[idx];
            const row = el(`<div class="attack-row" data-idx="${idx}">
            <label>Name<input type="text" data-attack="name"></label>
            <label>Range<select data-attack="range"><option>Melee</option><option>Ranged</option></select></label>
            <label>Kind<select data-attack="type"><option>Damage</option><option>Support</option></select></label>
            <label>Acc.<input type="number" step="1" data-attack="acc"></label>
            <label class="dmg">Dmg<input type="number" step="1" data-attack="dmg"></label>
            <label class="taglabel">Tag 1<input type="text" data-attack="tag0"></label>
            <label class="taglabel">Tag 2<input type="text" data-attack="tag1"></label>
            <label class="taglabel">Tag 3<input type="text" data-attack="tag2"></label>
            <button class="btn danger x" title="Delete">✕</button>
            </div>`);

            row.querySelector('[data-attack="name"]').value = a.name||'';
            row.querySelector('[data-attack="range"]').value = a.range||'Melee';
            row.querySelector('[data-attack="type"]').value = a.type||'Damage';
            row.querySelector('[data-attack="acc"]').value = a.acc||0;
            row.querySelector('[data-attack="dmg"]').value = a.dmg||0;
            row.querySelector('[data-attack="tag0"]').value = a.tags?.[0]||'';
            row.querySelector('[data-attack="tag1"]').value = a.tags?.[1]||'';
            row.querySelector('[data-attack="tag2"]').value = a.tags?.[2]||'';

            const dmgLabel = row.querySelector('.dmg');
            function toggleDmg() {
                dmgLabel.style.display = (row.querySelector('[data-attack="type"]').value==='Support') ? 'none' : 'block';
            }
            toggleDmg();

            row.addEventListener('input', (e) => {
                const t = e.target.getAttribute('data-attack');
                if(!t) return;
                if(t.startsWith('tag')) {
                    const i = Number(t.slice(3));
                    a.tags = a.tags || ['','',''];
                    a.tags[i] = e.target.value;
                } else if(['name','range','type'].includes(t)) {
                    a[t] = e.target.value;
                    if(t==='type') toggleDmg();
                } else if(['acc','dmg'].includes(t)) {
                    a[t] = Number(e.target.value)||0;
                }
            });

            row.querySelector('.x').addEventListener('click', () => {
                if(idx===0) {
                    alert('Signature Move row cannot be removed.');
                    return;
                }
                data.attacks.splice(idx,1);
                refreshAttacks();
            });

            return row;
        }

        function refreshAttacks() {
            attacksBox.innerHTML = '';
            data.attacks.forEach((_,i) => attacksBox.appendChild(renderAttackRow(i)));
        }
        refreshAttacks();

        attacksPanel.querySelector(`#addAttack-${id}`).addEventListener('click', () => {
            data.attacks.push({name:'', range:'Melee', type:'Damage', acc:0, dmg:0, tags:['','','']});
            refreshAttacks();
        });

        // DP Allocation
        const dpPanel = el(`<section class="panel">
        <h2 class="section-title">DP Allocation</h2>
        <div class="grid g-3">
        <div><label>Quality DP:<input type="number" step="1" min="0" data-bind="dp.quality" /></label></div>
        <div><div class="muted">Stat DP:</div><div class="kpi"><div class="value" data-out="statDP">0</div></div></div>
        <div><label>Bonus DP:<input type="number" step="1" data-bind="dp.bonus" /></label></div>
        </div>
        <div class="row mt-10 align-center">
        <div class="muted">Total DP:</div>
        <div class="kpi"><div class="value"><span class="fraction"><span class="num" data-out="spentDP">0</span><span data-out="totalDP">0</span></span></div></div>
        </div>
        </section>`);
        root.appendChild(dpPanel);

        // Qualities
        root.appendChild(el(`
        <section class="panel">
        <h2 class="section-title">Qualities</h2>
        <label>
        <textarea rows="16" data-bind="qualities" placeholder="Write qualities and descriptions here..."></textarea>
        </label>
        </section>
        `));

        // Data binding
        root.addEventListener('input', (e) => {
            const path = e.target.getAttribute('data-bind');
            if(path) {
                setByPath(data, path, coerce(e.target.value));
                this.compute(data, root);
            }

            // Handle current wounds input for health bar
            if(e.target.id === `current-wounds-${id}`) {
                data.combat.currentWounds = Number(e.target.value) || 0;
                this.updateHealthBar(id, data);
            }
        });

        root.querySelectorAll('[data-bind]').forEach(input => {
            const path = input.getAttribute('data-bind');
            const v = getByPath(data, path);
            if(typeof v !== 'undefined' && v !== null) input.value = v;
        });

            root.querySelectorAll('select[data-bind]').forEach(sel => {
                sel.addEventListener('change', () => this.compute(data, root));
            });

            root.__getData = () => JSON.parse(JSON.stringify(data));
            root.__setData = (payload) => {
                data = Object.assign(data, payload||{});
                root.querySelectorAll('[data-bind]').forEach(input => {
                    const path = input.getAttribute('data-bind');
                    const v = getByPath(data, path);
                    if(typeof v !== 'undefined' && v !== null) input.value = v;
                });
                    refreshAttacks();
                    this.compute(data, root);
            };

            this.compute(data, root);
            return root;
    },

    stageValue(data) {
        return STAGE_MAP[String(data.meta.stage)]||1;
    },

    statTotal(data, k) {
        return this.stageValue(data) + (Number(data.stats[k].dp)||0) + (Number(data.stats[k].bonus)||0);
    },

    derivedTotal(data, k) {
        const derivedBase = { BIT:'ACC', RAM:'DOD', DOS:'DAM', CPU:'ARM' };
        const baseKey = derivedBase[k];
        const baseWithoutBonus = this.stageValue(data) + (Number(data.stats[baseKey].dp)||0) + 3;
        let total = Math.floor(baseWithoutBonus/3) + (Number(data.derived[k].bonus)||0);
        const sizeB = SIZE_BONUS(data.meta.size);
        total += sizeB[k]||0;
        return total;
    },

    woundTotal(data) {
        return (this.stageValue(data) - 1) + (this.statTotal(data, 'HP')*2) - (Number(data.stats.HP.bonus)||0);
    },

    batteryTotal(data) {
        return this.stageValue(data);
    },

    statDPSum(data) {
        return ['ACC','DOD','DAM','ARM','HP'].reduce((s,k) => s + (Number(data.stats[k].dp)||0), 0);
    },

    spentDP(data) {
        return (Number(data.dp.quality)||0) + this.statDPSum(data);
    },

    totalAllocDP(data) {
        return ((this.stageValue(data)-1)*10) + (Number(data.dp.bonus)||0);
    },

    miscTotal(data, k) {
        const b = Number(data.misc[k].bonus)||0;
        switch(k) {
            case 'Movement': return this.stageValue(data) + 1 + b;
            case 'Range': return this.derivedTotal(data, 'BIT') + 3 + b;
            case 'MaxRange': return (this.derivedTotal(data, 'BIT') + 3) + (this.stageValue(data)-1) + b;
            case 'Initiative': return this.derivedTotal(data, 'RAM') + b;
            case 'Clash': return this.derivedTotal(data, 'RAM') + this.derivedTotal(data, 'CPU') + b;
            case 'Resist': return Math.floor(this.derivedTotal(data, 'DOS')/2) + b;
            default: return b;
        }
    },

    // New method: Update health bar visualization
    updateHealthBar(id, data) {
        const bar = document.getElementById(`health-bar-${id}`);
        const text = document.getElementById(`health-text-${id}`);

        if (!bar || !text) return;

        const current = Number(data.combat.currentWounds) || 0;
        const max = this.woundTotal(data);

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

    compute(data, root) {
        const statOrder = ['ACC','DOD','DAM','ARM','HP'];
        const derivedOrder = ['BIT','RAM','DOS','CPU'];
        const miscOrder = ['Movement','Range','MaxRange','Initiative','Clash','Resist'];

        statOrder.forEach(k => {
            const out = root.querySelector(`[data-out="stat:${k}"]`);
            if(out) out.textContent = this.statTotal(data, k);
        });

            derivedOrder.forEach(k => {
                const out = root.querySelector(`[data-out="derived:${k}"]`);
                if(out) out.textContent = this.derivedTotal(data, k);
            });

                miscOrder.forEach(k => {
                    const elOut = root.querySelector(`[data-out="misc:${k}"]`);
                    if(elOut) elOut.textContent = this.miscTotal(data, k);
                });

                    this.setOut(root, 'woundTotal', this.woundTotal(data));
                    this.setOut(root, 'batteryTotal', this.batteryTotal(data));
                    this.setOut(root, 'statDP', this.statDPSum(data));
                    this.setOut(root, 'spentDP', this.spentDP(data));
                    this.setOut(root, 'totalDP', this.totalAllocDP(data));

                    // Update health bar whenever stats are recomputed
                    const idMatch = root.querySelector('[id*="current-wounds-"]');
                    if (idMatch) {
                        const extractedId = idMatch.id.replace('current-wounds-', '');
                        this.updateHealthBar(extractedId, data);
                    }
    },

    setOut(root, attr, value) {
        const el = root.querySelector(`[data-out="${attr}"]`);
        if(el) el.textContent = value;
    }
};
