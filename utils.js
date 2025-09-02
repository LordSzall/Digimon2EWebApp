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
    if(v==='' || v==null) return '';
    const n=Number(v);
    return Number.isNaN(n)? v : n;
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
    return `<label>${label}<input type="number" step="${step}"${min} data-bind="${path}" /></label>`;
}

function selectField(label, path, options){
    return `<label>${label}<select data-bind="${path}">${options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>`;
}
