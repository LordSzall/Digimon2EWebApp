// utils.js - Core utility functions and constants

// Constants
const STAGE_MAP = { 'Child':2, 'Adult':3, 'Perfect':4, 'Ultimate':5 };

const SIZE_BONUS = (size) => {
    if(!size) return {BIT:0,RAM:0,DOS:0,CPU:0};
    const s = String(size).toLowerCase();
    if(s==='small' || s==='medium') return {BIT:1,RAM:1,DOS:0,CPU:0};
    if(s==='large') return {BIT:1,RAM:0,DOS:0,CPU:1};
    return {BIT:0,RAM:0,DOS:1,CPU:1};
};

// Utility functions
const uid = () => 'id_'+Math.random().toString(36).slice(2,10);

const el = (html) => {
    const t=document.createElement('template');
    t.innerHTML=html.trim();
    return t.content.firstElementChild;
};

const coerce = (v) => {
    if(v === '' || v === null || v === undefined) return '';
    if(typeof v === 'string' && v.trim() === '') return '';

    // Handle boolean-like strings
    if(typeof v === 'string') {
        const lower = v.toLowerCase();
        if(lower === 'true') return true;
        if(lower === 'false') return false;
    }

    const n = Number(v);
    return Number.isNaN(n) ? v : n;
};

const getByPath = (obj, path) => path.split('.').reduce((o,k)=> (o? o[k] : undefined), obj);

const setByPath = (obj, path, val) => {
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
    const max = (typeof opts.max!=='undefined') ? ` max="${opts.max}"` : '';
    return `<label>${label}<input type="number" step="${step}"${min}${max} data-bind="${path}" /></label>`;
}

function selectField(label, path, options){
    return `<label>${label}<select data-bind="${path}">${options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>`;
}

// File handling utilities for export/import
const exportUtils = {
    generateFilename(title, type) {
        const sanitized = title.replace(/[^a-z0-9]/gi, '_');
        const timestamp = new Date().toISOString().slice(0,10);
        return `${sanitized}_${type}_${timestamp}.dda2e`;
    },

    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid file format');
        }

        if (!data.type || !['digimon', 'tamer'].includes(data.type)) {
            throw new Error(`Unsupported sheet type: ${data.type || 'unknown'}`);
        }

        if (!data.data || typeof data.data !== 'object') {
            throw new Error('Missing or invalid sheet data');
        }

        return true;
    },

    createExportPayload(tab, sheetData) {
        return {
            version: "1.0",
            application: "Digimon Digital Adventures 2E",
            exportDate: new Date().toISOString(),
            id: tab.id,
            type: tab.type,
            title: tab.title || 'Untitled',
            data: sheetData
        };
    }
};

// Validation helpers
const validate = {
    isNumber(value) {
        return typeof value === 'number' && !Number.isNaN(value);
    },

    isPositiveNumber(value) {
        return this.isNumber(value) && value >= 0;
    },

    isInRange(value, min, max) {
        return this.isNumber(value) && value >= min && value <= max;
    },

    isString(value) {
        return typeof value === 'string';
    },

    isNonEmptyString(value) {
        return this.isString(value) && value.trim() !== '';
    }
};

// Export utilities globally
window.Validation = validate;
window.ExportUtils = exportUtils;
