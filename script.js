document.addEventListener("DOMContentLoaded", () => {
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

  const STAGE_MAP = { 'Child':2, 'Adult':3, 'Perfect':4, 'Ultimate':5 };
  const SIZE_BONUS = (size)=>{
    if(!size) return {BIT:0,RAM:0,DOS:0,CPU:0};
    const s = String(size).toLowerCase();
    if(s==='small' || s==='medium') return {BIT:1,RAM:1,DOS:0,CPU:0};
    if(s==='large') return {BIT:1,RAM:0,DOS:0,CPU:1};
    return {BIT:0,RAM:0,DOS:1,CPU:1};
  };

  const uid = ()=> 'id_'+Math.random().toString(36).slice(2,10);

  const state = { tabs:[], active:null };

  // -----------------------------
  // Utility DOM helpers
  // -----------------------------
  const el = (html)=> {
    const t=document.createElement('template');
    t.innerHTML=html.trim();
    return t.content.firstElementChild;
  };
  const coerce = (v)=> {
    if(v==='' || v==null) return '';
    const n=Number(v);
    return Number.isNaN(n)? v : n;
  };
  const getByPath = (obj, path)=> path.split('.').reduce((o,k)=> (o? o[k] : undefined), obj);
  const setByPath = (obj, path, val)=> {
    const parts=path.split('.');
    let o=obj;
    parts.forEach((k,i)=>{
      if(i===parts.length-1) o[k]=val;
      else { o[k]=o[k]||{}; o=o[k]; }
    });
  };

  // Form field helpers
  function textField(label, path, placeholder=''){
    return `<label>${label}<input type="text" data-bind="${path}" placeholder="${placeholder}" /></label>`;
  }
  function numberField(label, path, opts={}){
    const step = opts.step ?? 1;
    const min = (typeof opts.min!=='undefined') ? ` min="${opts.min}"` : '';
    return `<label>${label}<input type="number" step="${step}"${min} data-bind="${path}" /></label>`;
  }
  function selectField(label, path, options){
    return `<label>${label}<select data-bind="${path}">${options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>`;
  }

  // -----------------------------
  // Tab management
  // -----------------------------
  function activateTab(id){
    state.active = id;
    [...tabBar.children].forEach(el=> el.classList.toggle('active', el.dataset.id===id));
    [...sheets.children].forEach(el=> el.classList.toggle('active', el.dataset.id===id));
  }

  function addTab(title, type='digimon', data=null){
    const id = uid();

    // const tab = el(`<div class="tab active" data-id="${id}">
    // <span>📄 ${title}</span><span class="close" title="Close">✕</span>
    // </div>`);
    const tab = el(`<div class="tab active" data-id="${id}" data-type="${type}">
    <img src="${type === 'digimon' ? 'digimon-icon.png' : 'tamer-icon.png'}"
    alt="${type}" class="tab-icon">
    <span>${title}</span>
    <span class="close" title="Close">✕</span>
    </div>`);
    tab.querySelector('.close').addEventListener('click', (e)=>{
      e.stopPropagation();
      removeTab(id);
    });
    tab.addEventListener('click', ()=> activateTab(id));

    [...tabBar.children].forEach(el=> el.classList.remove('active'));
    tabBar.appendChild(tab);

    const sheet = document.createElement('div');
    sheet.className = 'sheet active';
    sheet.dataset.id = id;

    if(type==='digimon'){
      sheet.appendChild(renderDigimonSheet(id, data));
    } else if (type==='tamer') {
      sheet.appendChild(renderTamerSheet(id, data));
    } else {
      const coming = el(`<div class="panel">
      <h2 class="section-title">Unknown Sheet Type</h2>
      <div class="help">Cannot render this sheet type.</div>
      </div>`);
      sheet.appendChild(coming);
    }

    [...sheets.children].forEach(el=> el.classList.remove('active'));
    sheets.appendChild(sheet);

    state.tabs.push({id, title, type});
    activateTab(id);
    return id;
  }

  function removeTab(id){
    const sheet = document.querySelector(`.sheet[data-id="${id}"]`);
    const tab = tabBar.querySelector(`.tab[data-id="${id}"]`);
    sheet?.remove();
    tab?.remove();
    const idx = state.tabs.findIndex(t=>t.id===id);
    if(idx>-1) state.tabs.splice(idx,1);

    if(state.active===id){
      const fallback = tabBar.querySelector('.tab');
      if(fallback) activateTab(fallback.dataset.id);
    }
  }

  function activeSheet(){
    if(!state.active) return null;
    return document.querySelector(`.sheet[data-id="${state.active}"]`);
  }

  // ===== Tamer Sheet =====
  const defaultTamer = {
    meta: { name:'', size:'Medium', age:0 },
    combat: { wounds:0, inspiration:0, milestones:0, speed:'Agility' },
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
    }
  };

  function renderTamerSheet(id, data){
    data = data || JSON.parse(JSON.stringify(defaultTamer));
    const root = document.createElement('div');

    // Basic Info
    root.appendChild(el(`<section class="panel">
    <h2 class="section-title">Tamer Info</h2>
    <div class="grid g-3">
    ${textField('Name','meta.name')}
    ${selectField('Size','meta.size',['Small','Medium'])}
    ${numberField('Age','meta.age',{min:0})}
    </div>
    </section>`));

    // Combat
    const combatPanel = el(`<section class="panel">
    <h2 class="section-title">Combat</h2>
    <div class="grid g-3">
    <div>
    <label>Wound Boxes:<input type="number" data-bind="combat.wounds"/></label>
    <div class="kpi mt-6"><div class="muted">Total</div><div class="value" data-out="combat:woundTotal">0</div></div>
    </div>
    <div>
    <label>Inspiration:<input type="number" data-bind="combat.inspiration"/></label>
    <div class="kpi mt-6"><div class="muted">Total</div><div class="value" data-out="combat:inspireTotal">0</div></div>
    </div>
    <div>
    ${selectField('Speed','combat.speed',['Agility','Athletics'])}
    <label>Milestones:<input type="number" data-bind="combat.milestones"/></label>
    </div>
    </div>
    </section>`);
    root.appendChild(combatPanel);

    // Milestone Tracker
    const milestonePanel = el(`<section class="panel">
    <h2 class="section-title">Milestone Tracker</h2>
    <div class="milestone-tracker" id="milestoneTracker"></div>
    </section>`);
    root.appendChild(milestonePanel);

    const milestoneTracker = milestonePanel.querySelector('#milestoneTracker');

    // Initialize or update the milestone tracker
    function updateMilestoneTracker() {
      milestoneTracker.innerHTML = '';

      const milestoneTypes = ['Qualities', 'ACC', 'DOD', 'DAM', 'ARM', 'HP'];

      milestoneTypes.forEach(type => {
        // Ensure we have a numeric value
        if (typeof data.milestones[type] !== 'number') {
          data.milestones[type] = 0;
        }

        const item = el(`<div class="milestone-item">
        <div class="milestone-name">${type}</div>
        <div class="milestone-input">
        <input type="number" min="0" max="5" step="1" data-bind="milestones.${type}" value="${data.milestones[type]}" />
        </div>
        </div>`);

        milestoneTracker.appendChild(item);
      });
    }
    updateMilestoneTracker();

    // Attributes
    const attrPanel = el(`<section class="panel">
    <h2 class="section-title">Attributes</h2>
    <div class="grid g-5" id="attrGrid"></div>
    </section>`);
    root.appendChild(attrPanel);
    const attrGrid = attrPanel.querySelector('#attrGrid');
    Object.keys(data.attributes).forEach(k=>{
      const card = el(`<div class="stat-card">
      <div class="stat-total" data-out="attr:${k}">0</div>
      <div class="stat-name">${k}</div>
      <label>DP:<input type="number" data-bind="attributes.${k}.dp"/></label>
      </div>`);
      attrGrid.appendChild(card);
    });

    // ===== Skills Section =====
    const skillsByAttr = {
      AGI: ["Evade (WIL)", "Precision (INT)", "Stealth (BOD)"],
                          BOD: ["Athletics (AGI)", "Endurance (WIL)", "Feats of Strength (CHA)"],
                          CHA: ["Manipulate (BOD)", "Perform (AGI)", "Persuasion (INT)"],
                          INT: ["Decipher Intent (CHA)", "Survival (WIL)", "Knowledge"],
                          WIL: ["Bravery (BOD)", "Fortitude (INT)", "Awareness (AGI)"]
    };

    const skillsPanel = el(`<section class="panel"><h2 class="section-title">Skills</h2></section>`);
    const tabs = el(`<div class="skill-tabs"></div>`);
    const skillsContainer = el(`<div id="skillsContainer"></div>`);

    // Create all skill sections upfront but hide them
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
      btn.addEventListener("click", () => showSkills(attr));
      tabs.appendChild(btn);
    });

    skillsPanel.appendChild(tabs);
    skillsPanel.appendChild(skillsContainer);
    root.appendChild(skillsPanel);

    function showSkills(attr) {
      // Hide all skill sections
      skillsContainer.querySelectorAll('.skill-section').forEach(section => {
        section.style.display = 'none';
      });

      // Show the selected one
      const targetSection = skillsContainer.querySelector(`[data-attr="${attr}"]`);
      if (targetSection) {
        targetSection.style.display = 'block';
      }

      // highlight active tab
      [...tabs.children].forEach(b => b.classList.remove("active"));
      tabs.querySelector(`[data-skilltab="${attr}"]`).classList.add("active");
    }

    // Open default tab
    showSkills("AGI");

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
    <div class="torment-track" id="tormentTrack"></div>
    <label>Description:<textarea rows="8" data-bind="torments.desc" placeholder="Describe torments and their effects..."></textarea></label>
    </section>`);
    root.appendChild(tormentPanel);
    const tormentTrack = tormentPanel.querySelector('#tormentTrack');

    // Initialize or update the torment track
    function updateTormentTrack() {
      tormentTrack.innerHTML = '';

      // Ensure we have exactly 10 torment boxes
      if (!data.torments.marks || data.torments.marks.length !== 10) {
        data.torments.marks = Array(10).fill(0);
      }

      data.torments.marks.forEach((mark, i)=>{
        const box = el(`<div class="torment-box" data-index="${i}">${i+1}</div>`);
        box.classList.add(`state-${mark}`);
        box.addEventListener('click', ()=>{
          // Cycle through states: 0 → 1 → 2 → 0
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

    // Data binding
    root.addEventListener('input', (e)=>{
      const path = e.target.getAttribute('data-bind');
      if(path){
        setByPath(data, path, coerce(e.target.value));
        computeTamer();
      }
    });

    root.querySelectorAll('[data-bind]').forEach(input=>{
      const path = input.getAttribute('data-bind');
      const v = getByPath(data, path);
      if(typeof v !== 'undefined' && v !== null) input.value = v;
    });

      function computeTamer(){
        // Calculate attribute totals
        Object.keys(data.attributes).forEach(k=>{
          const total = 1 + (Number(data.attributes[k].dp)||0);
          const out = root.querySelector(`[data-out="attr:${k}"]`);
          if(out) out.textContent = total;
        });
          // Calculate derived stats
          const bod = 1 + (Number(data.attributes.BOD.dp)||0);
          const wil = 1 + (Number(data.attributes.WIL.dp)||0);
          setTamerOut('combat:woundTotal', bod);
          setTamerOut('combat:inspireTotal', wil + 2);
      }

      function setTamerOut(key,val){
        const out = root.querySelector(`[data-out="${key}"]`);
        if(out) out.textContent = val;
      }

      computeTamer();

      root.__getData = ()=> JSON.parse(JSON.stringify(data));
      root.__setData = (payload)=>{
        const newData = JSON.parse(JSON.stringify(payload || {}));
        Object.keys(newData).forEach(key => {
          data[key] = newData[key];
        });

        root.querySelectorAll('[data-bind]').forEach(input=>{
          const path = input.getAttribute('data-bind');
          const v = getByPath(data, path);
          if(typeof v !== 'undefined' && v !== null) input.value = v;
        });

          updateTormentTrack();
          updateMilestoneTracker(); // Update the milestone tracker
          computeTamer();
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

      return root;
  }

  // -----------------------------
  // Render Digimon Sheet
  // -----------------------------
  function renderDigimonSheet(id, data){
    // defaults
    data = data || {
      meta:{ name:'', digimon:'', type:'', attribute:'Vaccine', stage:'Child', size:'Medium' },
      combat:{ woundBoxes:0, tempWounds:0, batteryManual:0 },
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

    const stageValue = ()=> STAGE_MAP[String(data.meta.stage)]||1;
    const statTotal = (k)=> stageValue() + (Number(data.stats[k].dp)||0) + (Number(data.stats[k].bonus)||0);
    const derivedBase = { BIT:'ACC', RAM:'DOD', DOS:'DAM', CPU:'ARM' };
    const derivedTotal = (k)=> {
      const baseKey = derivedBase[k];
      const baseWithoutBonus = stageValue() + (Number(data.stats[baseKey].dp)||0) + 3;
      let total = Math.floor(baseWithoutBonus/3) + (Number(data.derived[k].bonus)||0);
      const sizeB = SIZE_BONUS(data.meta.size);
      total += sizeB[k]||0;
      return total;
    };
    const woundTotal = ()=> (stageValue() - 1) + (statTotal('HP')*2) - (Number(data.stats.HP.bonus)||0);
    const batteryTotal = ()=> stageValue() + 1;
    const statDPSum = ()=> ['ACC','DOD','DAM','ARM','HP'].reduce((s,k)=> s + (Number(data.stats[k].dp)||0), 0);
    const spentDP = ()=> (Number(data.dp.quality)||0) + statDPSum();
    const totalAllocDP = ()=> ((stageValue()-1)*10) + (Number(data.dp.bonus)||0);

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

    // Combat
    const combatPanel = el(`
    <section class="panel">
    <h2 class="section-title">Combat</h2>
    <div class="grid g-3">
    <div>
    <label>Wound Boxes:
    <input type="number" step="1" min="0" data-bind="combat.woundBoxes" />
    </label>
    <div class="kpi mt-6"><div class="muted">Total</div><div class="value" data-out="woundTotal">0</div></div>
    <div class="tiny">Formula: (HP × 2) − HP Bonus</div>
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
    <div class="tiny">Formula: Stage + 1</div>
    </div>
    </div>
    </section>
    `);
    root.appendChild(combatPanel);

    // Stats
    const statsPanel = el(`<section class="panel">
    <h2 class="section-title">Stats</h2>
    <div class="grid g-5" id="statsGrid"></div>
    </section>`);
    root.appendChild(statsPanel);

    const statOrder = ['ACC','DOD','DAM','ARM','HP'];
    const statsGrid = statsPanel.querySelector('#statsGrid');
    statOrder.forEach(k=>{
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
    <div class="grid g-4" id="derivedGrid"></div>
    <div class="note mt-6">Total = ⌊Associated Stat ÷ 3⌋ + Bonus, plus Size bonus.</div>
    </section>`);
    root.appendChild(derivedPanel);

    // Misc Stats
    const miscPanel = el(`<section class="panel">
    <h2 class="section-title">Misc Stats</h2>
    <div class="grid g-6" id="miscGrid"></div>
    <div class="note mt-6">Formulas auto-calculate totals. Adjust Bonus to tweak values.</div>
    </section>`);
    root.appendChild(miscPanel);

    const miscGrid = miscPanel.querySelector('#miscGrid');
    const miscOrder = ['Movement','Range','MaxRange','Initiative','Clash','Resist'];
    miscOrder.forEach(k=>{
      const card = el(`<div class="stat-card" data-misc="${k}">
      <div class="stat-total" data-out="misc:${k}">0</div>
      <div class="stat-name">${k}</div>
      <label>Bonus:<input type="number" step="1" data-bind="misc.${k}.bonus" /></label>
      </div>`);
      miscGrid.appendChild(card);
    });

    // defaults if not present
    data.misc = data.misc || {};
    miscOrder.forEach(k=>{
      data.misc[k] = data.misc[k] || { bonus:0 };
    });

    const derivedOrder = ['BIT','RAM','DOS','CPU'];
    const derivedGrid = derivedPanel.querySelector('#derivedGrid');
    derivedOrder.forEach(k=>{
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
    <div id="attacks"></div>
    <div class="row mt-12">
    <button class="btn" id="addAttack">➕ Add Attack</button>
    </div>
    </section>`);
    root.appendChild(attacksPanel);

    const attacksBox = attacksPanel.querySelector('#attacks');

    function renderAttackRow(idx){
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
      function toggleDmg(){ dmgLabel.style.display = (row.querySelector('[data-attack="type"]').value==='Support') ? 'none' : 'block'; }
      toggleDmg();

      row.addEventListener('input', (e)=>{
        const t = e.target.getAttribute('data-attack');
        if(!t) return;
        if(t.startsWith('tag')){
          const i = Number(t.slice(3));
          a.tags = a.tags || ['','',''];
          a.tags[i] = e.target.value;
        } else if(['name','range','type'].includes(t)){
          a[t] = e.target.value;
          if(t==='type') toggleDmg();
        } else if(['acc','dmg'].includes(t)){
          a[t] = Number(e.target.value)||0;
        }
      });

      row.querySelector('.x').addEventListener('click', ()=>{
        if(idx===0){ alert('Signature Move row cannot be removed.'); return; }
        data.attacks.splice(idx,1);
        refreshAttacks();
      });

      return row;
    }

    function refreshAttacks(){
      attacksBox.innerHTML = '';
      data.attacks.forEach((_,i)=> attacksBox.appendChild(renderAttackRow(i)));
    }
    refreshAttacks();

    attacksPanel.querySelector('#addAttack').addEventListener('click', ()=>{
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
    root.addEventListener('input', (e)=>{
      const path = e.target.getAttribute('data-bind');
      if(path){
        setByPath(data, path, coerce(e.target.value));
        compute();
      }
    });

    root.querySelectorAll('[data-bind]').forEach(input=>{
      const path = input.getAttribute('data-bind');
      const v = getByPath(data, path);
      if(typeof v !== 'undefined' && v !== null) input.value = v;
    });

      root.querySelectorAll('select[data-bind]').forEach(sel=>{
        sel.addEventListener('change', ()=> compute());
      });

      function miscTotal(k){
        const b = Number(data.misc[k].bonus)||0;
        switch(k){
          case 'Movement': return stageValue() + 1 + b;
          case 'Range': return derivedTotal('BIT') + 3 + b;
          case 'MaxRange': return (derivedTotal('BIT') + 3) + (stageValue()-1) + b;
          case 'Initiative': return derivedTotal('RAM') + b;
          case 'Clash': return derivedTotal('RAM') + derivedTotal('CPU') + b;
          case 'Resist': return Math.floor(derivedTotal('DOS')/2) + b;
          default: return b;
        }
      }

      function compute(){
        statOrder.forEach(k=>{
          const out = root.querySelector(`[data-out="stat:${k}"]`);
          if(out) out.textContent = statTotal(k);
        });
          derivedOrder.forEach(k=>{
            const out = root.querySelector(`[data-out="derived:${k}"]`);
            if(out) out.textContent = derivedTotal(k);
          });
            miscOrder.forEach(k=>{
              const elOut = root.querySelector(`[data-out="misc:${k}"]`);
              if(elOut) elOut.textContent = miscTotal(k);
            });
              setOut('woundTotal', woundTotal());
              setOut('batteryTotal', batteryTotal());
              setOut('statDP', statDPSum());
              setOut('spentDP', spentDP());
              setOut('totalDP', totalAllocDP());
      }

      function setOut(attr, value){
        const el = root.querySelector(`[data-out="${attr}"]`);
        if(el) el.textContent = value;
      }

      compute();

      root.__getData = ()=> JSON.parse(JSON.stringify(data));
      root.__setData = (payload)=>{
        data = Object.assign(data, payload||{});
        root.querySelectorAll('[data-bind]').forEach(input=>{
          const path = input.getAttribute('data-bind');
          const v = getByPath(data, path);
          if(typeof v !== 'undefined' && v !== null) input.value = v;
        });
          refreshAttacks();
          compute();
      };

      return root;
  }

  // -----------------------------
  // Save / Open
  // -----------------------------
  function saveActive(){
    const sheet = activeSheet();
    if(!sheet){ alert('No active sheet to save.'); return; }
    const tab = state.tabs.find(t=>t.id===state.active);
    
    const currentName = tab?.title || 'Untitled';
    const name = prompt('Save name:', currentName);
    if(!name) return;
    
    const payload = {
      id: tab.id,
      type: tab.type,
      title: name,
      data: sheet.firstElementChild.__getData?.()
    };
    
    const key = `digi2e:${name}`;
    
    // Clean up any existing entries with the same name but different keys
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('digi2e:'));
    allKeys.forEach(existingKey => {
      try {
        const existingData = JSON.parse(localStorage.getItem(existingKey));
        if (existingData && existingData.title === name && existingKey !== key) {
          localStorage.removeItem(existingKey);
        }
      } catch (e) {
        console.warn('Error parsing localStorage item:', existingKey, e);
      }
    });
    
    // Save the new data
    localStorage.setItem(key, JSON.stringify(payload));
    
    // Update tab title (correctly with your icon structure)
    const tabEl = tabBar.querySelector(`.tab[data-id="${tab.id}"]`);
    if(tabEl) {
      // Find the text span (it should be the second child after the img)
      const textSpan = tabEl.querySelector('span:not(.close)');
      if (textSpan) {
        textSpan.textContent = name;
      }
    }
    tab.title = name;
    
    alert('Saved!');
  }

  function openSaved(){
    openList.innerHTML = '';
    const saves = Object.keys(localStorage)
    .filter(k=>k.startsWith('digi2e:'))
    .sort();

    if(saves.length === 0) {
      openList.appendChild(el('<div class="panel"><div class="help">No saved sheets found.</div></div>'));
      openModal.classList.remove('hidden');
      return;
    }

    saves.forEach(key=>{
      try{
        const payload = JSON.parse(localStorage.getItem(key)||'null');
        if(!payload) return;
        const card = el(`<div class="panel">
        <div class="row" style="justify-content:space-between; align-items:center">
        <div>
        <div style="font-family:Orbitron; font-weight:700">${payload.title||'(no title)'}</div>
        <div class="tiny">Type: ${payload.type || 'unknown'}</div>
        <div class="tiny">${key}</div>
        </div>
        <div class="row">
        <button class="btn" data-act="open">Open</button>
        <button class="btn danger" data-act="delete">Delete</button>
        </div>
        </div>
        </div>`);

        card.querySelector('[data-act="open"]').addEventListener('click', ()=>{
          const id = addTab(payload.title||'New Sheet', payload.type||'digimon', payload.data||{});
          openModal.classList.add('hidden');
          activateTab(id);
        });

        card.querySelector('[data-act="delete"]').addEventListener('click', ()=>{
          if(confirm(`Delete saved sheet "${payload.title||key}"?`)){
            localStorage.removeItem(key);
            card.remove();
            // If this was the last save, show the "no saves" message
            if(openList.children.length === 0) {
              openList.appendChild(el('<div class="panel"><div class="help">No saved sheets found.</div></div>'));
            }
          }
        });

        openList.appendChild(card);
      } catch(e){
        console.error('Error loading save:', e);
      }
    });
    openModal.classList.remove('hidden');
  }

  // -----------------------------
  // UI Events
  // -----------------------------
  newBtn.addEventListener('click', ()=> newModal.classList.remove('hidden'));
  closeNew.addEventListener('click', ()=> newModal.classList.add('hidden'));
  closeOpen.addEventListener('click', ()=> openModal.classList.add('hidden'));
  saveBtn.addEventListener('click', saveActive);
  openBtn.addEventListener('click', openSaved);

  document.querySelectorAll('[data-newtype]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const type = b.getAttribute('data-newtype');
      if(type==='digimon') addTab('New Digimon','digimon');
      else if(type==='tamer') addTab('New Tamer','tamer');
      newModal.classList.add('hidden');
    });
  });

  // -----------------------------
  // Start with a fresh Digimon sheet
  // -----------------------------
  addTab('New Digimon','digimon');
});
