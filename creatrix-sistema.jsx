import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
//  CREATRIX — DISEÑO & PUBLICIDAD
//  Sistema de Control de Ventas
// ═══════════════════════════════════════════════════════════════

const USUARIOS = [
  { user: "admin",  pass: "1234",   nombre: "Administrador", rol: "admin"    },
  { user: "ventas", pass: "ventas", nombre: "Vendedor",      rol: "vendedor" },
];

const IGV = 0.18;

const CATALOGO = [
  { id:1,  nombre:"Banner",            unidad:"m²",    precio:25,   medidas:true,  icon:"🖼️", cat:"Gran Formato",  mats:["Lona estándar 13oz","Lona premium 18oz","Lona backlight"],              acabados:["Sin acabado","Con ojales","Con dobladillo","Ojales y dobladillo"] },
  { id:2,  nombre:"Vinil Adhesivo",    unidad:"m²",    precio:30,   medidas:true,  icon:"📋", cat:"Gran Formato",  mats:["Vinil blanco brillante","Vinil transparente","Vinil espejo","Vinil mate"], acabados:["Sin laminado","Laminado mate","Laminado brillante"] },
  { id:3,  nombre:"UV DTF",            unidad:"cm²",   precio:0.05, medidas:true,  icon:"✨", cat:"Especial",      mats:["Film estándar","Film premium"],                                          acabados:["Acabado brillante","Acabado mate"] },
  { id:4,  nombre:"Vinil de Corte",    unidad:"m²",    precio:20,   medidas:true,  icon:"✂️", cat:"Gran Formato",  mats:["Vinil normal","Vinil reflectivo","Vinil cromado","Vinil fluorescente"],  acabados:[] },
  { id:5,  nombre:"Caballete",         unidad:"unidad",precio:150,  medidas:false, icon:"🪧", cat:"Estructuras",   mats:["Caballete simple","Caballete doble cara"],                               acabados:[] },
  { id:6,  nombre:"Parante / Roll Up", unidad:"unidad",precio:120,  medidas:false, icon:"🗂️", cat:"Estructuras",   mats:["Roll Up 80×200cm","Roll Up 100×200cm","Roll Up 120×200cm"],             acabados:[] },
  { id:7,  nombre:"Impresión Offset",  unidad:"millar",precio:80,   medidas:false, icon:"🖨️", cat:"Offset",        mats:["Bond 75g","Couché brillante 115g","Couché mate 115g","Cartulina 200g","Cartulina 300g"], acabados:["Sin acabado","Laminado brillante","Laminado mate","Barniz UV","Troquelado"] },
  { id:8,  nombre:"Imantado",          unidad:"unidad",precio:15,   medidas:false, icon:"🧲", cat:"Especial",      mats:["10×15cm","15×20cm","20×30cm","Personalizado"],                          acabados:[] },
  { id:9,  nombre:"Letrero Luminoso",  unidad:"m²",    precio:350,  medidas:true,  icon:"💡", cat:"Letreros",      mats:["Acrílico LED frontal","Caja de luz","Canal letra aluminio","Neón LED"],  acabados:[] },
  { id:10, nombre:"Cartas / Menús",    unidad:"unidad",precio:8,    medidas:false, icon:"📄", cat:"Offset",        mats:["Couché 150g laminado","Couché 300g plastificado","PVC rígido","Espiral"],acabados:[] },
  { id:11, nombre:"Merchandising",     unidad:"unidad",precio:12,   medidas:false, icon:"🎁", cat:"Merchandising", mats:["Taza cerámica 11oz","Lapicero impreso","Gorra bordada","Polo sublimado","Llavero acrílico","Bolsa de tela","Agenda personalizada"], acabados:[] },
];

const uid  = () => Date.now() + Math.random().toString(36).slice(2,6);
const fM   = (n) => `S/ ${Number(n||0).toFixed(2)}`;
const fD   = (i) => i ? new Date(i).toLocaleDateString("es-PE",{day:"2-digit",month:"2-digit",year:"numeric"}) : "-";
const fH   = (i) => i ? new Date(i).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}) : "";
const genC = () => { const d=new Date(); return `CTX-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}-${Math.floor(1000+Math.random()*9000)}`; };

// ── PALETA CREATRIX ──────────────────────────────────────────
// Morado profundo + Cyan/Verde neón + Magenta accent
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  /* Fondos oscuros con tinte púrpura */
  --bg:      #080610;
  --bg1:     #0d0b1a;
  --bg2:     #110f20;
  --bg3:     #161328;
  --card:    #0f0d1e;
  --card2:   #141130;
  --border:  #1e1a3a;
  --border2: #2a2550;

  /* Colores marca Creatrix */
  --cyan:    #00e5cc;
  --cyan2:   #00bfaa;
  --cyan-d:  rgba(0,229,204,.12);
  --cyan-d2: rgba(0,229,204,.06);
  --mag:     #cc00ff;
  --mag2:    #aa00dd;
  --mag-d:   rgba(204,0,255,.12);
  --pur:     #7c3aed;
  --pur2:    #6d28d9;
  --pur-d:   rgba(124,58,237,.15);

  /* Semáforo */
  --gr:  #22d3a0;
  --gr-d:rgba(34,211,160,.12);
  --re:  #ff4d6d;
  --re-d:rgba(255,77,109,.12);
  --ye:  #fbbf24;
  --ye-d:rgba(251,191,36,.12);
  --bl:  #38bdf8;
  --bl-d:rgba(56,189,248,.1);

  /* Tipografía */
  --t:  #e8e4ff;
  --t2: #9b93c9;
  --t3: #534d7a;

  --f: 'Outfit', sans-serif;
  --m: 'Space Mono', monospace;
  --r: 14px;
  --rs: 9px;
  --sh: 0 8px 40px rgba(0,0,0,.6);
}

html { scroll-behavior: smooth }
body { background:var(--bg); color:var(--t); font-family:var(--f); min-height:100vh; -webkit-font-smoothing:antialiased }
input,select,textarea,button { font-family:var(--f) }
button { cursor:pointer; border:none; background:none }
::-webkit-scrollbar { width:4px; height:4px }
::-webkit-scrollbar-track { background:var(--bg1) }
::-webkit-scrollbar-thumb { background:var(--border2); border-radius:99px }

/* ── LAYOUT ── */
.root { display:flex; height:100vh; overflow:hidden }
.sb   { width:220px; background:var(--bg1); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; overflow-y:auto }
.main { flex:1; overflow-y:auto; background:var(--bg) }

/* ── SIDEBAR ── */
.sb-logo { padding:22px 18px 16px; border-bottom:1px solid var(--border) }
.sb-brandmark {
  display:flex; align-items:center; gap:10px; margin-bottom:6px;
}
.sb-hex {
  width:38px; height:38px; position:relative; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.sb-hex::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg, var(--cyan), var(--mag));
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  opacity:.18;
}
.sb-hex-inner {
  font-size:1.1rem; position:relative; z-index:1;
  filter: drop-shadow(0 0 6px var(--cyan));
}
.sb-brand-text {}
.sb-name {
  font-size:1.1rem; font-weight:900; letter-spacing:-.02em;
  background:linear-gradient(90deg, var(--cyan), #a78bfa);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  line-height:1;
}
.sb-tagline { font-size:.6rem; color:var(--t3); text-transform:uppercase; letter-spacing:.12em; margin-top:2px }

.sb-sec  { padding:12px 16px 3px; font-size:.59rem; font-weight:700; color:var(--t3); letter-spacing:.1em; text-transform:uppercase }
.sb-nav  { padding:4px 8px }
.sb-item { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:10px; font-size:.8rem; font-weight:500; color:var(--t2); cursor:pointer; transition:.15s; margin-bottom:2px; position:relative; overflow:hidden }
.sb-item:hover { color:var(--t); background:var(--bg3) }
.sb-item.on {
  color:var(--cyan); font-weight:600;
  background:linear-gradient(90deg, var(--cyan-d), transparent);
  box-shadow: inset 3px 0 0 var(--cyan);
}
.sb-item.on::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
  background:linear-gradient(to bottom, var(--cyan), var(--mag));
  border-radius:0 3px 3px 0;
}
.sb-ico { width:18px; text-align:center; font-size:.95rem; flex-shrink:0 }
.sb-bx  { margin-left:auto; background:var(--re-d); color:var(--re); font-size:.62rem; font-weight:700; padding:2px 7px; border-radius:99px; border:1px solid rgba(255,77,109,.2) }

.sb-ft   { padding:14px 16px; border-top:1px solid var(--border); margin-top:auto }
.sb-user { display:flex; align-items:center; gap:9px; margin-bottom:9px }
.sb-av   {
  width:34px; height:34px; border-radius:10px;
  background:linear-gradient(135deg,var(--mag-d),var(--cyan-d));
  border:1.5px solid var(--cyan);
  display:flex; align-items:center; justify-content:center;
  font-size:.85rem; font-weight:800; color:var(--cyan); flex-shrink:0;
  box-shadow:0 0 10px rgba(0,229,204,.2);
}
.sb-un { font-size:.78rem; font-weight:600; color:var(--t) }
.sb-ur { font-size:.63rem; color:var(--t3) }

/* ── PAGE ── */
.pg   { padding:24px 28px; max-width:1200px }
.pg-hd { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:12px }
.pg-hd h2 { font-size:1.3rem; font-weight:800; letter-spacing:-.02em }
.pg-hd p  { font-size:.76rem; color:var(--t2); margin-top:2px }

/* ── CARDS ── */
.card  { background:var(--card); border:1px solid var(--border); border-radius:var(--r) }
.cb    { padding:16px 20px }
.ctit  { font-size:.67rem; font-weight:700; color:var(--t3); text-transform:uppercase; letter-spacing:.09em; margin-bottom:12px }

/* ── STAT CARDS ── */
.sts  { display:grid; gap:14px; margin-bottom:20px }
.sts4 { grid-template-columns:repeat(4,1fr) }
.sts3 { grid-template-columns:repeat(3,1fr) }
.sc   { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:18px 20px; position:relative; overflow:hidden; transition:.2s }
.sc:hover { border-color:var(--border2); transform:translateY(-1px) }
.sg   { position:absolute; width:90px; height:90px; border-radius:50%; top:-20px; right:-20px; filter:blur(35px); opacity:.25 }
.si   { font-size:1.25rem; margin-bottom:10px }
.sv   { font-size:1.45rem; font-weight:800; font-family:var(--m); letter-spacing:-.03em }
.sl   { font-size:.7rem; color:var(--t2); margin-top:4px }
.sd   { font-size:.67rem; margin-top:5px; color:var(--t3) }

/* ── GLOW LINE decorativa ── */
.glow-line {
  height:1px;
  background:linear-gradient(90deg, transparent, var(--cyan), var(--mag), transparent);
  margin:0 0 22px;
  opacity:.35;
}

/* ── BUTTONS ── */
.btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; font-size:.79rem; font-weight:600; transition:.15s; white-space:nowrap; line-height:1 }

.bp {
  background:linear-gradient(135deg, var(--cyan), var(--pur));
  color:#fff;
  box-shadow:0 4px 16px rgba(0,229,204,.2);
}
.bp:hover { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,229,204,.3) }

.bm {
  background:linear-gradient(135deg, var(--mag), var(--pur));
  color:#fff;
  box-shadow:0 4px 16px rgba(204,0,255,.2);
}
.bm:hover { filter:brightness(1.1); transform:translateY(-1px) }

.bg  { background:var(--bg3); color:var(--t2); border:1px solid var(--border) }
.bg:hover { color:var(--t); border-color:var(--border2) }
.bd  { background:var(--re-d); color:var(--re); border:1px solid rgba(255,77,109,.2) }
.bd:hover { background:rgba(255,77,109,.2) }
.bs  { background:var(--gr-d); color:var(--gr); border:1px solid rgba(34,211,160,.2) }
.bs:hover { background:rgba(34,211,160,.2) }
.bb  { background:var(--bl-d); color:var(--bl); border:1px solid rgba(56,189,248,.2) }
.by  { background:var(--ye-d); color:var(--ye); border:1px solid rgba(251,191,36,.2) }
.bpu { background:var(--pur-d); color:#a78bfa; border:1px solid rgba(124,58,237,.2) }
.bcyan { background:var(--cyan-d); color:var(--cyan); border:1px solid rgba(0,229,204,.2) }

.bsm { padding:4px 11px; font-size:.72rem }
.blg { padding:10px 22px; font-size:.85rem }
.blk { width:100%; justify-content:center }
.bic { padding:7px; border-radius:8px }

/* ── FORMS ── */
.fg  { margin-bottom:12px }
.fg:last-child { margin-bottom:0 }
.lb  { display:block; font-size:.68rem; font-weight:700; color:var(--t3); text-transform:uppercase; letter-spacing:.08em; margin-bottom:5px }
.inp { width:100%; background:var(--bg2); border:1.5px solid var(--border); border-radius:var(--rs); padding:9px 13px; color:var(--t); font-size:.82rem; outline:none; transition:.15s }
.inp:focus { border-color:var(--cyan); box-shadow:0 0 0 3px rgba(0,229,204,.1) }
.inp::placeholder { color:var(--t3) }
select.inp { cursor:pointer }
.inpsm { padding:6px 11px; font-size:.77rem }
.fr { display:grid; gap:12px }
.fr2 { grid-template-columns:1fr 1fr }
.fr3 { grid-template-columns:1fr 1fr 1fr }
.fr4 { grid-template-columns:1fr 1fr 1fr 1fr }

/* ── TABLE ── */
.tw { overflow-x:auto; border-radius:var(--r); border:1px solid var(--border) }
table { width:100%; border-collapse:collapse }
thead th { background:var(--bg2); padding:9px 13px; text-align:left; font-size:.67rem; font-weight:700; color:var(--t3); text-transform:uppercase; letter-spacing:.08em; white-space:nowrap; border-bottom:1px solid var(--border) }
tbody td { padding:11px 13px; font-size:.8rem; border-bottom:1px solid var(--border); vertical-align:middle }
tbody tr:last-child td { border-bottom:none }
tbody tr:hover td { background:rgba(0,229,204,.02) }
.ta { display:flex; gap:6px; align-items:center }

/* ── BADGES ── */
.bge { display:inline-flex; align-items:center; gap:3px; padding:3px 9px; border-radius:99px; font-size:.69rem; font-weight:700; line-height:1.4 }
.bgp { background:var(--re-d); color:var(--re) }
.bgd { background:var(--gr-d); color:var(--gr) }
.bgb { background:var(--bl-d); color:var(--bl) }
.bgg { background:var(--bg3); color:var(--t2) }
.bgc { background:var(--cyan-d); color:var(--cyan) }

/* ── MODAL ── */
.ov   { position:fixed; inset:0; background:rgba(4,2,15,.85); z-index:300; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px) }
.md   { background:var(--card); border:1px solid var(--border); border-radius:18px; width:100%; box-shadow:var(--sh); display:flex; flex-direction:column; max-height:92vh }
.mdsm { max-width:420px }
.mdmd { max-width:620px }
.mdlg { max-width:820px }
.mh   { padding:18px 22px 14px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0 }
.mh h3 { font-size:.96rem; font-weight:700 }
.mb   { padding:20px 22px; overflow-y:auto; flex:1 }
.mf   { padding:13px 22px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:9px; flex-shrink:0 }
.cx   { width:28px; height:28px; border-radius:7px; background:var(--bg3); border:1px solid var(--border); color:var(--t2); display:flex; align-items:center; justify-content:center; font-size:.85rem; cursor:pointer; transition:.15s }
.cx:hover { color:var(--re); border-color:var(--re-d) }

/* ── LOGIN ── */
.lw  { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); position:relative; overflow:hidden }
.l-bg {
  position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,229,204,.07) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 20%, rgba(204,0,255,.07) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 60% 80%, rgba(124,58,237,.06) 0%, transparent 60%);
}
.l-grid {
  position:absolute; inset:0; pointer-events:none;
  background-image: linear-gradient(rgba(0,229,204,.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,229,204,.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}
.lc  { background:var(--card); border:1px solid var(--border); border-radius:22px; padding:38px; width:380px; position:relative; z-index:1; box-shadow:0 0 80px rgba(0,229,204,.08), var(--sh) }
.l-glow-top {
  position:absolute; top:-1px; left:10%; right:10%; height:1px;
  background:linear-gradient(90deg, transparent, var(--cyan), var(--mag), transparent);
  border-radius:99px;
}
.lh  { text-align:center; margin-bottom:28px }
.l-logo { display:inline-flex; align-items:center; gap:12px; margin-bottom:12px }
.l-hex {
  width:50px; height:50px; position:relative;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.l-hex::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg, var(--cyan), var(--mag));
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  opacity:.25;
}
.l-hex-icon { font-size:1.5rem; position:relative; z-index:1; filter:drop-shadow(0 0 8px var(--cyan)) }
.l-brand {
  font-size:1.8rem; font-weight:900; letter-spacing:-.03em;
  background:linear-gradient(90deg, var(--cyan) 30%, #a78bfa 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  line-height:1;
}
.lt  { font-size:.68rem; color:var(--t3); text-transform:uppercase; letter-spacing:.15em; margin-top:4px }
.lhi { text-align:center; font-size:.71rem; color:var(--t3); margin-top:14px; background:var(--bg2); border:1px solid var(--border); border-radius:9px; padding:10px }
.lhi b { color:var(--t2) }
.l-err { color:var(--re); font-size:.77rem; margin-bottom:12px; background:var(--re-d); padding:9px 13px; border-radius:9px; border:1px solid rgba(255,77,109,.2) }

/* ── IGV SWITCH ── */
.igvsw { display:inline-flex; background:var(--bg2); border:1.5px solid var(--border); border-radius:9px; padding:3px; gap:2px }
.igvb  { padding:5px 14px; border-radius:7px; font-size:.73rem; font-weight:600; color:var(--t2); cursor:pointer; transition:.15s; border:none; background:none }
.igvb.on { background:linear-gradient(135deg, var(--cyan), var(--pur)); color:#fff; box-shadow:0 2px 10px rgba(0,229,204,.25) }

/* ── CATALOG GRID ── */
.cc  { display:grid; grid-template-columns:repeat(auto-fill,minmax(135px,1fr)); gap:10px }
.cpc {
  background:var(--bg2); border:1.5px solid var(--border);
  border-radius:12px; padding:14px 11px; cursor:pointer;
  transition:all .18s; text-align:center; position:relative; overflow:hidden;
}
.cpc::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg, var(--cyan-d2), transparent);
  opacity:0; transition:.2s;
}
.cpc:hover { border-color:var(--cyan); transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,229,204,.12) }
.cpc:hover::before { opacity:1 }
.cpc-i { font-size:1.7rem; margin-bottom:7px; display:block; position:relative; filter:drop-shadow(0 0 4px rgba(0,229,204,.3)) }
.cpc-n { font-size:.76rem; font-weight:600; color:var(--t); margin-bottom:2px; position:relative }
.cpc-p { font-size:.68rem; color:var(--cyan); font-family:var(--m); position:relative }
.cpc-bx { position:absolute; top:5px; right:5px; font-size:.57rem; padding:1px 5px; background:var(--cyan-d); color:var(--cyan); border-radius:3px; font-weight:700; border:1px solid rgba(0,229,204,.2) }

/* ── COTIZ ITEMS ── */
.ci    { background:var(--bg2); border:1.5px solid var(--border); border-radius:12px; padding:14px 16px; transition:.15s }
.ci:hover { border-color:var(--border2) }
.ci-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:11px }
.ci-n  { font-weight:600; font-size:.85rem; display:flex; align-items:center; gap:7px }
.ci-sp {
  font-family:var(--m); font-size:.88rem; font-weight:700; text-align:right;
  margin-top:10px; padding-top:10px; border-top:1px solid var(--border);
  background:linear-gradient(90deg, var(--cyan), #a78bfa);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

.ctb {
  background:linear-gradient(135deg, rgba(0,229,204,.06), rgba(124,58,237,.04));
  border:1.5px solid rgba(0,229,204,.2);
  border-radius:12px; padding:16px 18px;
}

/* ── PAGO MÉTODO ── */
.mg { display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; margin-bottom:14px }
.mc { background:var(--bg2); border:1.5px solid var(--border); border-radius:10px; padding:12px; text-align:center; cursor:pointer; transition:.15s }
.mc:hover { border-color:var(--border2) }
.mc.on { border-color:var(--cyan); background:var(--cyan-d); box-shadow:0 0 16px rgba(0,229,204,.1) }
.mc-i { font-size:1.3rem; margin-bottom:3px }
.mc-l { font-size:.73rem; font-weight:600; color:var(--t2) }
.mc.on .mc-l { color:var(--cyan) }

/* ── PDF ── */
.pdf { background:#fff; color:#111; padding:36px; border-radius:10px; max-width:540px; margin:0 auto; font-size:12.5px; line-height:1.5; font-family:'Outfit',sans-serif }
.pdf-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px }
.pdf-logo { font-size:18px; font-weight:900; background:linear-gradient(90deg,#00e5cc,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text }
.pdf-sub { font-size:10px; color:#888; margin-top:1px; text-transform:uppercase; letter-spacing:.1em }
.pdf-info { text-align:right; font-size:11px; color:#555 }
.pdf-div { border:none; border-top:1.5px solid #e5e7eb; margin:13px 0 }
.pdf-cli { background:#f8f7ff; border:1px solid #ede9fe; border-radius:8px; padding:9px 13px; margin-bottom:14px; font-size:11.5px }
.pdf-gh  { display:grid; grid-template-columns:2.2fr .8fr 1fr 1fr; gap:5px; padding:6px 0; font-size:10px; font-weight:700; color:#888; text-transform:uppercase; border-bottom:1.5px solid #e5e7eb }
.pdf-gr  { display:grid; grid-template-columns:2.2fr .8fr 1fr 1fr; gap:5px; padding:7px 0; border-bottom:1px solid #f3f4f6; font-size:11.5px; align-items:start }
.pdf-id  { font-size:10px; color:#888; margin-top:1px }
.pdf-tot { margin-top:12px; text-align:right }
.pdf-tr  { display:flex; justify-content:flex-end; gap:36px; font-size:12px; margin-bottom:4px; color:#555 }
.pdf-gd  { display:flex; justify-content:flex-end; gap:36px; font-size:14px; font-weight:900; margin-top:8px; padding-top:8px; border-top:2px solid #00e5cc; color:#00b8a3 }
.pdf-ft  { text-align:center; font-size:10px; color:#aaa; margin-top:18px; padding-top:13px; border-top:1px solid #e5e7eb }
.pdf-ep  { display:inline-block; padding:2px 9px; border-radius:99px; font-size:10px; font-weight:700 }
.pdf-pp  { background:#fee2e2; color:#dc2626 }
.pdf-pd  { background:#d1faf0; color:#059669 }

/* ── CAJA ── */
.cjm { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px }
.cjc { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center }
.cji { font-size:1.6rem; margin-bottom:7px }
.cjn { font-size:.68rem; font-weight:700; color:var(--t3); text-transform:uppercase; letter-spacing:.06em; margin-bottom:5px }
.cjt { font-family:var(--m); font-size:1.15rem; font-weight:800 }

/* ── PRODUCTOS GRID ── */
.pg-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(215px,1fr)); gap:14px }
.pc { background:var(--card); border:1.5px solid var(--border); border-radius:var(--r); overflow:hidden; transition:.18s }
.pc:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,.3) }
.pc-hd { padding:18px 16px 12px; display:flex; flex-direction:column; align-items:center; text-align:center }
.pc-i  { font-size:2rem; margin-bottom:8px; filter:drop-shadow(0 0 6px rgba(0,229,204,.3)) }
.pc-n  { font-size:.9rem; font-weight:700 }
.pc-c  { font-size:.65rem; color:var(--t3); margin-top:2px }
.pc-bd { padding:0 14px 16px }
.pc-dc { font-size:.73rem; color:var(--t2); margin-bottom:9px; line-height:1.5 }
.pc-pr { font-family:var(--m); font-size:1.05rem; font-weight:700; margin-bottom:9px }
.pm-li { display:flex; flex-direction:column; gap:3px }
.pm-it { display:flex; justify-content:space-between; font-size:.68rem; color:var(--t3); padding:3px 0; border-bottom:1px solid var(--border) }
.pm-it:last-child { border:none }

/* ── CODE TAG ── */
.code { font-family:var(--m); font-size:.71rem; background:var(--cyan-d); color:var(--cyan); padding:2px 8px; border-radius:5px; border:1px solid rgba(0,229,204,.15) }
.pl   { display:inline-flex; align-items:center; padding:2px 8px; border-radius:99px; font-size:.65rem; font-weight:600 }
.plc  { background:var(--cyan-d); color:var(--cyan) }
.plm  { background:var(--mag-d); color:var(--mag) }
.plp  { background:var(--pur-d); color:#a78bfa }

/* ── UTILS ── */
.r  { display:flex; align-items:center }
.g1 { gap:4px } .g2 { gap:8px } .g3 { gap:12px } .g4 { gap:16px }
.fw7 { font-weight:700 } .fw8 { font-weight:800 }
.fxs { font-size:.71rem } .fsm { font-size:.79rem }
.tm  { color:var(--t2) }  .td { color:var(--t3) }
.tc  { color:var(--cyan) } .tgr { color:var(--gr) } .tre { color:var(--re) } .tye { color:var(--ye) } .tbl { color:var(--bl) } .tpu { color:#a78bfa }
.mo  { font-family:var(--m) }
.mt1 { margin-top:4px } .mt2 { margin-top:9px } .mt3 { margin-top:14px } .mt4 { margin-top:20px }
.mb1 { margin-bottom:4px } .mb2 { margin-bottom:9px } .mb3 { margin-bottom:14px } .mb4 { margin-bottom:20px }
.mla { margin-left:auto }
.dv  { height:1px; background:var(--border); margin:14px 0 }
.sep { height:1px; background:var(--border) }
.tr  { text-align:right }
.fw  { width:100% }
.je  { justify-content:flex-end }
.fb  { display:flex; align-items:center; justify-content:space-between }
.em  { text-align:center; padding:48px 16px; color:var(--t3) }
.em-i { font-size:2.2rem; margin-bottom:9px }
.em-t { font-size:.85rem; margin-bottom:5px; color:var(--t2) }

/* ── GRAD TEXT ── */
.gt-cyan { background:linear-gradient(90deg,var(--cyan),#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text }
.gt-mag  { background:linear-gradient(90deg,var(--mag),var(--cyan)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text }

/* ── NEON GLOW ── */
.neon-cyan { box-shadow:0 0 16px rgba(0,229,204,.15) }
.neon-mag  { box-shadow:0 0 16px rgba(204,0,255,.15) }

@media(max-width:860px){
  .sb { display:none }
  .pg { padding:14px }
  .sts4 { grid-template-columns:1fr 1fr }
  .fr2,.fr3,.fr4 { grid-template-columns:1fr }
  .mg { grid-template-columns:repeat(3,1fr) }
}
`;

// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [session, setSession] = useState(null);
  const [pag, setPag] = useState("dashboard");
  const [pedidos, setPedidos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [catalogo, setCatalogo] = useState(CATALOGO);

  if (!session) return <><style>{CSS}</style><Login onLogin={setSession}/></>;

  const pend = pedidos.filter(p => p.estado==="PENDIENTE").length;

  const nav = [
    { sec:"Principal", items:[
      { id:"dashboard", i:"⬡",  lbl:"Dashboard" },
      { id:"cotizador", i:"🧮", lbl:"Nuevo Pedido" },
    ]},
    { sec:"Gestión", items:[
      { id:"pedidos",  i:"📦", lbl:"Pedidos",  bx:pend||null },
      { id:"historial",i:"📋", lbl:"Historial" },
      { id:"caja",     i:"💰", lbl:"Caja"      },
    ]},
    { sec:"Catálogo", items:[
      { id:"catalogo",i:"🗂️", lbl:"Ver Catálogo" },
      { id:"precios", i:"⚙️", lbl:"Gestión Precios" },
    ]},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="root">
        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-logo">
            <div className="sb-brandmark">
              <div className="sb-hex"><div className="sb-hex-inner">◈</div></div>
              <div className="sb-brand-text">
                <div className="sb-name">creatrix</div>
                <div className="sb-tagline">Diseño & Publicidad</div>
              </div>
            </div>
          </div>

          {nav.map(sec => (
            <div key={sec.sec}>
              <div className="sb-sec">{sec.sec}</div>
              <div className="sb-nav">
                {sec.items.map(item => (
                  <div key={item.id} className={`sb-item${pag===item.id?" on":""}`} onClick={()=>setPag(item.id)}>
                    <span className="sb-ico">{item.i}</span>
                    <span>{item.lbl}</span>
                    {item.bx ? <span className="sb-bx">{item.bx}</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="sb-ft">
            <div className="sb-user">
              <div className="sb-av">{session.nombre[0]}</div>
              <div>
                <div className="sb-un">{session.nombre}</div>
                <div className="sb-ur">{session.rol}</div>
              </div>
            </div>
            <button className="btn bg bsm" style={{width:"100%",justifyContent:"center"}} onClick={()=>setSession(null)}>
              ⎋ Cerrar sesión
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {pag==="dashboard" && <Dashboard pedidos={pedidos} pagos={pagos} catalogo={catalogo} setPag={setPag}/>}
          {pag==="cotizador" && <Cotizador catalogo={catalogo} pedidos={pedidos} setPedidos={setPedidos} setPag={setPag}/>}
          {pag==="pedidos"   && <Pedidos  pedidos={pedidos} setPedidos={setPedidos} pagos={pagos} setPagos={setPagos}/>}
          {pag==="historial" && <Historial pedidos={pedidos} pagos={pagos}/>}
          {pag==="caja"      && <Caja pagos={pagos}/>}
          {pag==="catalogo"  && <CatalogoVista catalogo={catalogo}/>}
          {pag==="precios"   && <PreciosEdit catalogo={catalogo} setCatalogo={setCatalogo}/>}
        </main>
      </div>
    </>
  );
}

/* ── LOGIN ─────────────────────────────────────────── */
function Login({ onLogin }) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [load,setLoad]=useState(false);
  const go=()=>{
    setLoad(true);
    setTimeout(()=>{
      const f=USUARIOS.find(x=>x.user===u.trim()&&x.pass===p);
      if(f){onLogin(f);}else{setErr("Usuario o contraseña incorrectos");setLoad(false);}
    },400);
  };
  return(
    <div className="lw">
      <div className="l-bg"/>
      <div className="l-grid"/>
      <div className="lc">
        <div className="l-glow-top"/>
        <div className="lh">
          <div className="l-logo">
            <div className="l-hex"><div className="l-hex-icon">◈</div></div>
            <div className="l-brand">creatrix</div>
          </div>
          <div className="lt">Sistema de Control de Ventas</div>
        </div>
        <div className="fg">
          <label className="lb">Usuario</label>
          <input className="inp" value={u} onChange={e=>setU(e.target.value)} placeholder="admin"/>
        </div>
        <div className="fg mb3">
          <label className="lb">Contraseña</label>
          <input className="inp" type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
        </div>
        {err&&<div className="l-err">⚠ {err}</div>}
        <button className="btn bp blk blg" onClick={go} disabled={load}>{load?"Verificando…":"Ingresar →"}</button>
        <div className="lhi"><div>admin / <b>1234</b> &nbsp;·&nbsp; ventas / <b>ventas</b></div></div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ─────────────────────────────────────── */
function Dashboard({pedidos,pagos,catalogo,setPag}){
  const pend=pedidos.filter(p=>p.estado==="PENDIENTE");
  const done=pedidos.filter(p=>p.estado==="CANCELADO");
  const totalV=pedidos.reduce((a,p)=>a+(p.total||0),0);
  const totalC=pagos.reduce((a,p)=>a+p.monto,0);
  const recientes=[...pedidos].sort((a,b)=>b.id-a.id).slice(0,6);
  const catVentas={};
  pedidos.forEach(ped=>ped.items?.forEach(it=>{const c=CATALOGO.find(x=>x.id===it.prod_id)?.cat||"Otros";catVentas[c]=(catVentas[c]||0)+it.sub;}));

  return(
    <div className="pg">
      <div className="pg-hd">
        <div>
          <h2 className="gt-cyan">⬡ Dashboard</h2>
          <p>Bienvenido — {new Date().toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long"})}</p>
        </div>
        <button className="btn bp" onClick={()=>setPag("cotizador")}>+ Nuevo Pedido</button>
      </div>
      <div className="glow-line"/>

      <div className="sts sts4">
        {[
          {lbl:"Total Pedidos",  val:pedidos.length,   i:"📦", c:"var(--cyan)",  sub:`${done.length} completados`},
          {lbl:"Pendientes",     val:pend.length,      i:"⏳", c:"var(--re)",    sub:"Por entregar"},
          {lbl:"Total Ventas",   val:fM(totalV),       i:"💹", c:"var(--gr)",    sub:`Cobrado: ${fM(totalC)}`},
          {lbl:"Por Cobrar",     val:fM(totalV-totalC),i:"🔔", c:"var(--ye)",    sub:"Saldo pendiente"},
        ].map(s=>(
          <div className="sc" key={s.lbl}>
            <div className="sg" style={{background:s.c}}/>
            <div className="si">{s.i}</div>
            <div className="sv" style={{color:s.c,fontSize:typeof s.val==="string"?"1.05rem":"1.4rem"}}>{s.val}</div>
            <div className="sl">{s.lbl}</div>
            <div className="sd">{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16,marginBottom:18}}>
        <div className="card">
          <div className="cb">
            <div className="ctit">Últimos Pedidos</div>
            {recientes.length===0?(
              <div className="em"><div className="em-i">📭</div><div className="em-t">Sin pedidos aún</div></div>
            ):(
              <div className="tw">
                <table>
                  <thead><tr><th>Código</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
                  <tbody>
                    {recientes.map(p=>(
                      <tr key={p.id}>
                        <td><span className="code">{p.codigo}</span></td>
                        <td style={{fontWeight:600}}>{p.cliente}</td>
                        <td><span className="mo tc">{fM(p.total)}</span></td>
                        <td><span className={`bge ${p.estado==="PENDIENTE"?"bgp":"bgd"}`}>{p.estado==="PENDIENTE"?"🔴":"🟢"} {p.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="cb">
            <div className="ctit">Ventas por Categoría</div>
            {Object.keys(catVentas).length===0?(
              <div className="td fsm mt2">Sin datos aún</div>
            ):Object.entries(catVentas).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>{
              const max=Math.max(...Object.values(catVentas));
              const pct=(val/max)*100;
              return(
                <div key={cat} style={{marginBottom:12}}>
                  <div className="fb mb1"><span className="fxs fw7 tm">{cat}</span><span className="mo fxs tc">{fM(val)}</span></div>
                  <div style={{height:4,background:"var(--bg3)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,var(--cyan),var(--pur))",borderRadius:99,transition:".5s"}}/>
                  </div>
                </div>
              );
            })}
            <div className="dv"/>
            <div className="fb">
              <span className="fxs td">Productos activos</span>
              <span className="mo fsm tc">{catalogo.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        {[
          {lbl:"Efectivo",      i:"💵", c:"var(--gr)", v:pagos.filter(p=>p.metodo==="efectivo").reduce((a,p)=>a+p.monto,0)},
          {lbl:"Yape",          i:"📱", c:"#a78bfa",   v:pagos.filter(p=>p.metodo==="yape").reduce((a,p)=>a+p.monto,0)},
          {lbl:"Transferencia", i:"🏦", c:"var(--bl)", v:pagos.filter(p=>p.metodo==="transferencia").reduce((a,p)=>a+p.monto,0)},
        ].map(m=>(
          <div className="card" key={m.lbl}>
            <div className="cb" style={{textAlign:"center"}}>
              <div style={{fontSize:"1.5rem",marginBottom:6}}>{m.i}</div>
              <div className="mo fw8" style={{fontSize:"1.05rem",color:m.c}}>{fM(m.v)}</div>
              <div className="fxs td mt1">{m.lbl}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── COTIZADOR ─────────────────────────────────────── */
function Cotizador({catalogo,pedidos,setPedidos,setPag}){
  const [cliente,setCliente]=useState("");
  const [tel,setTel]=useState("");
  const [items,setItems]=useState([]);
  const [igv,setIgv]=useState(false);
  const [saved,setSaved]=useState(null);
  const [pdfMd,setPdfMd]=useState(false);
  const [catAct,setCatAct]=useState("Todos");

  const cats=["Todos",...new Set(catalogo.map(c=>c.cat))];
  const prods=catalogo.filter(p=>catAct==="Todos"||p.cat===catAct);

  const add=(prod)=>setItems(prev=>[...prev,{
    key:uid(),prod_id:prod.id,nombre:prod.nombre,icon:prod.icon,
    unidad:prod.unidad,medidas:prod.medidas,
    ancho:1,alto:1,cantidad:1,precio:prod.precio,
    mat:prod.mats[0]||"",acabado:prod.acabados[0]||"",nota:"",
    mats:prod.mats,acabados:prod.acabados,
  }]);
  const upd=(key,f,v)=>setItems(prev=>prev.map(i=>i.key===key?{...i,[f]:v}:i));
  const rem=(key)=>setItems(prev=>prev.filter(i=>i.key!==key));

  const calcSub=(it)=>it.medidas?+it.ancho*+it.alto*+it.precio*+it.cantidad:+it.precio*+it.cantidad;
  const subtotal=items.reduce((a,i)=>a+calcSub(i),0);
  const igvMonto=igv?subtotal*IGV:0;
  const total=subtotal+igvMonto;

  const guardar=()=>{
    if(!cliente.trim()){alert("Ingresa el nombre del cliente");return;}
    if(!items.length){alert("Agrega al menos un producto");return;}
    const ped={
      id:Date.now(),codigo:genC(),cliente:cliente.trim(),tel,
      items:items.map(i=>({...i,sub:calcSub(i)})),
      subtotal,igv:igvMonto,total,con_igv:igv,
      estado:"PENDIENTE",fecha:new Date().toISOString(),
    };
    setPedidos(prev=>[...prev,ped]);
    setSaved(ped);
    setCliente("");setTel("");setItems([]);
  };

  const whatsapp=(ped)=>{
    const txt=`◈ *CREATRIX — Cotización*\n\n👤 Cliente: ${ped.cliente}\n🔖 Código: ${ped.codigo}\n\n${ped.items.map(i=>`• ${i.nombre}${i.medidas?` (${i.ancho}×${i.alto}m)`:""} ×${i.cantidad}: ${fM(i.sub)}`).join("\n")}\n\n${ped.con_igv?`Subtotal: ${fM(ped.subtotal)}\nIGV 18%: ${fM(ped.igv)}\n`:""}_TOTAL: *${fM(ped.total)}*_\n\nEstado: 🔴 PENDIENTE`;
    window.open(`https://wa.me/${ped.tel.replace(/\D/g,"")}?text=${encodeURIComponent(txt)}`,"_blank");
  };

  return(
    <div className="pg">
      <div className="pg-hd">
        <div><h2 className="gt-cyan">🧮 Nuevo Pedido</h2><p>Genera una cotización y conviértela en pedido</p></div>
        <div className="igvsw">
          <button className={`igvb${!igv?" on":""}`} onClick={()=>setIgv(false)}>Sin IGV</button>
          <button className={`igvb${igv?" on":""}`}  onClick={()=>setIgv(true)}>Con IGV 18%</button>
        </div>
      </div>
      <div className="glow-line"/>

      {saved&&(
        <div style={{background:"var(--gr-d)",border:"1.5px solid rgba(34,211,160,.25)",borderRadius:12,padding:"12px 16px",marginBottom:18}}>
          <div className="fb">
            <div className="r g2"><span>✅</span><span className="fw7 fsm">Pedido guardado:</span><span className="code">{saved.codigo}</span><span className="mo tgr fw7">{fM(saved.total)}</span></div>
            <div className="r g2">
              <button className="btn bs bsm" onClick={()=>whatsapp(saved)}>📲 WhatsApp</button>
              <button className="btn bb bsm" onClick={()=>setPdfMd(true)}>🖨️ PDF</button>
              <button className="btn bg bsm" onClick={()=>setPag("pedidos")}>Ver Pedidos →</button>
              <button className="cx" onClick={()=>setSaved(null)}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Cliente */}
      <div className="card mb3">
        <div className="cb">
          <div className="ctit">Datos del Cliente</div>
          <div className="fr fr2">
            <div className="fg"><label className="lb">Nombre / Empresa</label><input className="inp" value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Ej: Restaurante Lima"/></div>
            <div className="fg"><label className="lb">Teléfono / WhatsApp</label><input className="inp" value={tel} onChange={e=>setTel(e.target.value)} placeholder="9XXXXXXXX"/></div>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <div className="card mb3">
        <div className="cb">
          <div className="fb mb3">
            <div className="ctit" style={{margin:0}}>Seleccionar Producto</div>
            <div className="r g2" style={{flexWrap:"wrap"}}>
              {cats.map(c=><button key={c} className={`btn bsm ${catAct===c?"bp":"bg"}`} onClick={()=>setCatAct(c)}>{c}</button>)}
            </div>
          </div>
          <div className="cc">
            {prods.map(prod=>(
              <div key={prod.id} className="cpc" onClick={()=>add(prod)}>
                {prod.medidas&&<span className="cpc-bx">m²</span>}
                <span className="cpc-i">{prod.icon}</span>
                <div className="cpc-n">{prod.nombre}</div>
                <div className="cpc-p">{fM(prod.precio)}/{prod.unidad}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items */}
      {items.length>0&&(
        <div className="card mb3">
          <div className="cb">
            <div className="ctit">Detalle — {items.length} item{items.length!==1?"s":""}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {items.map(item=>(
                <div key={item.key} className="ci">
                  <div className="ci-hd">
                    <div className="ci-n">
                      <span style={{fontSize:"1.2rem"}}>{item.icon}</span>
                      <span>{item.nombre}</span>
                      <span className="pl plc">{item.unidad}</span>
                    </div>
                    <button className="btn bd bic bsm" onClick={()=>rem(item.key)}>✕</button>
                  </div>
                  <div className="fr fr4" style={{gap:10}}>
                    {item.medidas&&<>
                      <div className="fg"><label className="lb">Ancho (m)</label><input className="inp inpsm" type="number" min={0.1} step={0.05} value={item.ancho} onChange={e=>upd(item.key,"ancho",e.target.value)}/></div>
                      <div className="fg"><label className="lb">Alto (m)</label><input className="inp inpsm" type="number" min={0.1} step={0.05} value={item.alto} onChange={e=>upd(item.key,"alto",e.target.value)}/></div>
                    </>}
                    <div className="fg"><label className="lb">Cantidad</label><input className="inp inpsm" type="number" min={1} value={item.cantidad} onChange={e=>upd(item.key,"cantidad",e.target.value)}/></div>
                    <div className="fg"><label className="lb">Precio/{item.unidad}</label><input className="inp inpsm" type="number" min={0} step={0.5} value={item.precio} onChange={e=>upd(item.key,"precio",e.target.value)}/></div>
                  </div>
                  {item.mats.length>0&&(
                    <div className="fr fr2" style={{gap:10}}>
                      <div className="fg"><label className="lb">Material / Tipo</label>
                        <select className="inp inpsm" value={item.mat} onChange={e=>upd(item.key,"mat",e.target.value)}>
                          {item.mats.map(m=><option key={m}>{m}</option>)}
                        </select>
                      </div>
                      {item.acabados.length>0&&(
                        <div className="fg"><label className="lb">Acabado</label>
                          <select className="inp inpsm" value={item.acabado} onChange={e=>upd(item.key,"acabado",e.target.value)}>
                            {item.acabados.map(a=><option key={a}>{a}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="fg mt1"><label className="lb">Nota / Indicación</label><input className="inp inpsm" value={item.nota} placeholder="Ej: color rojo, con ojales, enviar diseño por WA..." onChange={e=>upd(item.key,"nota",e.target.value)}/></div>
                  <div className="ci-sp">
                    {item.medidas&&<span className="td fxs">{item.ancho}m × {item.alto}m × {item.cantidad} × {fM(item.precio)} = </span>}
                    {fM(calcSub(item))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="ctb mt3">
              {igv&&<>
                <div className="fb mb2"><span className="fsm tm">Subtotal sin IGV</span><span className="mo fw7">{fM(subtotal)}</span></div>
                <div className="fb mb2"><span className="fsm tm">IGV 18%</span><span className="mo fw7">{fM(igvMonto)}</span></div>
                <div className="sep mb2"/>
              </>}
              <div className="fb">
                <span className="fw8 gt-cyan" style={{fontSize:"1rem"}}>TOTAL {igv?"CON IGV":""}</span>
                <span className="mo fw8 tc" style={{fontSize:"1.2rem"}}>{fM(total)}</span>
              </div>
            </div>

            <div className="r g2 mt3 je">
              <button className="btn bg" onClick={()=>setItems([])}>🗑 Limpiar</button>
              <button className="btn bp blg" onClick={guardar}>💾 Guardar Pedido</button>
            </div>
          </div>
        </div>
      )}

      {pdfMd&&saved&&<ModalPdf pedido={saved} pagos={[]} onClose={()=>setPdfMd(false)}/>}
    </div>
  );
}

/* ── PEDIDOS ───────────────────────────────────────── */
function Pedidos({pedidos,setPedidos,pagos,setPagos}){
  const [busq,setBusq]=useState("");
  const [fil,setFil]=useState("TODOS");
  const [pagoMd,setPagoMd]=useState(null);
  const [pdfMd,setPdfMd]=useState(null);
  const [detMd,setDetMd]=useState(null);

  const lista=[...pedidos].sort((a,b)=>b.id-a.id).filter(p=>{
    const t=fil==="TODOS"||p.estado===fil;
    const s=!busq||p.codigo.includes(busq.toUpperCase())||p.cliente.toLowerCase().includes(busq.toLowerCase());
    return t&&s;
  });

  const pagado=(id)=>pagos.filter(p=>p.pedido_id===id).reduce((a,p)=>a+p.monto,0);
  const cancelar=(id)=>setPedidos(prev=>prev.map(p=>p.id===id?{...p,estado:"CANCELADO"}:p));
  const eliminar=(id)=>{if(window.confirm("¿Eliminar este pedido?"))setPedidos(prev=>prev.filter(p=>p.id!==id));};

  return(
    <div className="pg">
      <div className="pg-hd">
        <div><h2 className="gt-cyan">📦 Pedidos</h2><p>{lista.length} pedido{lista.length!==1?"s":""}</p></div>
      </div>
      <div className="glow-line"/>

      <div className="r g2 mb3" style={{flexWrap:"wrap"}}>
        <input className="inp" style={{flex:1,minWidth:200}} value={busq} onChange={e=>setBusq(e.target.value)} placeholder="🔍 Buscar por código o cliente…"/>
        {["TODOS","PENDIENTE","CANCELADO"].map(f=>(
          <button key={f} className={`btn bsm ${fil===f?"bp":"bg"}`} onClick={()=>setFil(f)}>
            {f==="PENDIENTE"?"🔴 ":f==="CANCELADO"?"🟢 ":""}{f}
          </button>
        ))}
      </div>

      <div className="tw">
        <table>
          <thead><tr><th>Código</th><th>Cliente</th><th>Items</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.length===0?(
              <tr><td colSpan={9} style={{padding:40,textAlign:"center"}}>
                <div className="em"><div className="em-i">📭</div><div className="em-t">Sin pedidos</div></div>
              </td></tr>
            ):lista.map(p=>{
              const pg=pagado(p.id);
              const sd=(p.total||0)-pg;
              return(
                <tr key={p.id}>
                  <td><span className="code">{p.codigo}</span></td>
                  <td><div style={{fontWeight:600}}>{p.cliente}</div>{p.tel&&<div className="fxs td">{p.tel}</div>}</td>
                  <td><span className="bge bgg">{p.items?.length||0}</span></td>
                  <td><span className="mo fw7 tc">{fM(p.total)}</span></td>
                  <td><span className="mo tgr fw7">{fM(pg)}</span></td>
                  <td><span className={`mo fw7 ${sd>0?"tre":"tgr"}`}>{fM(sd)}</span></td>
                  <td><span className={`bge ${p.estado==="PENDIENTE"?"bgp":"bgd"}`}>{p.estado==="PENDIENTE"?"🔴":"🟢"} {p.estado}</span></td>
                  <td><span className="fxs td">{fD(p.fecha)}</span></td>
                  <td>
                    <div className="ta">
                      <button className="btn bb bsm" onClick={()=>setDetMd(p)}>👁</button>
                      <button className="btn by bsm" onClick={()=>setPagoMd(p)}>💳</button>
                      <button className="btn bg bsm"  onClick={()=>setPdfMd(p)}>🖨️</button>
                      {p.estado==="PENDIENTE"&&<button className="btn bs bsm" onClick={()=>cancelar(p.id)}>✅</button>}
                      <button className="btn bd bsm" onClick={()=>eliminar(p.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagoMd&&<ModalPago pedido={pagoMd} pagos={pagos} setPagos={setPagos} onClose={()=>setPagoMd(null)}/>}
      {pdfMd&&<ModalPdf pedido={pdfMd} pagos={pagos} onClose={()=>setPdfMd(null)}/>}
      {detMd&&<ModalDetalle pedido={detMd} pagos={pagos} onClose={()=>setDetMd(null)} onPago={()=>{setPagoMd(detMd);setDetMd(null);}}/>}
    </div>
  );
}

/* ── MODAL DETALLE ─────────────────────────────────── */
function ModalDetalle({pedido,pagos,onClose,onPago}){
  const pp=pagos.filter(p=>p.pedido_id===pedido.id);
  const pg=pp.reduce((a,p)=>a+p.monto,0);
  const sd=(pedido.total||0)-pg;
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md mdlg">
        <div className="mh"><h3>📦 Detalle — <span className="code">{pedido.codigo}</span></h3><button className="cx" onClick={onClose}>✕</button></div>
        <div className="mb">
          <div className="fr fr2 mb3">
            <div><div className="lb">Cliente</div><div className="fw7">{pedido.cliente}</div></div>
            <div><div className="lb">Teléfono</div><div>{pedido.tel||"—"}</div></div>
            <div><div className="lb">Fecha</div><div>{fD(pedido.fecha)} {fH(pedido.fecha)}</div></div>
            <div><div className="lb">Estado</div><span className={`bge ${pedido.estado==="PENDIENTE"?"bgp":"bgd"}`}>{pedido.estado}</span></div>
          </div>
          <div className="ctit">Productos</div>
          <div className="tw mb3">
            <table>
              <thead><tr><th>Producto</th><th>Material</th><th>Medidas</th><th>Cant.</th><th>P.Unit</th><th>Subtotal</th></tr></thead>
              <tbody>
                {pedido.items?.map((it,i)=>(
                  <tr key={i}>
                    <td><span>{it.icon} {it.nombre}</span>{it.nota&&<div className="fxs td">{it.nota}</div>}</td>
                    <td className="fxs td">{it.mat||"—"}<br/>{it.acabado&&<span>{it.acabado}</span>}</td>
                    <td className="mo fxs">{it.medidas?`${it.ancho}×${it.alto}m`:"—"}</td>
                    <td>{it.cantidad} {it.unidad}</td>
                    <td className="mo">{fM(it.precio)}</td>
                    <td className="mo fw7 tc">{fM(it.sub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"Total",v:fM(pedido.total),c:"tc"},{l:"Pagado",v:fM(pg),c:"tgr"},{l:"Saldo",v:fM(sd),c:sd>0?"tre":"tgr"}].map(x=>(
              <div key={x.l} className="card"><div className="cb" style={{textAlign:"center",padding:"12px 14px"}}>
                <div className="fxs td mb1">{x.l}</div>
                <div className={`mo fw8 ${x.c}`}>{x.v}</div>
              </div></div>
            ))}
          </div>
          {pp.length>0&&<>
            <div className="ctit">Pagos registrados</div>
            {pp.map(p=>(
              <div key={p.id} className="fb" style={{padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                <div className="r g2"><span>{p.metodo==="efectivo"?"💵":p.metodo==="yape"?"📱":"🏦"}</span><span className="fsm" style={{textTransform:"capitalize"}}>{p.metodo}</span>{p.nota&&<span className="fxs td">— {p.nota}</span>}</div>
                <div className="r g3"><span className="fxs td">{fD(p.fecha)}</span><span className="mo fw7 tgr">{fM(p.monto)}</span></div>
              </div>
            ))}
          </>}
        </div>
        <div className="mf">
          <button className="btn bg" onClick={onClose}>Cerrar</button>
          <button className="btn by" onClick={onPago}>💳 Registrar Pago</button>
        </div>
      </div>
    </div>
  );
}

/* ── MODAL PAGO ─────────────────────────────────────── */
function ModalPago({pedido,pagos,setPagos,onClose}){
  const [monto,setMonto]=useState("");
  const [met,setMet]=useState("efectivo");
  const [nota,setNota]=useState("");
  const pp=pagos.filter(p=>p.pedido_id===pedido.id);
  const pg=pp.reduce((a,p)=>a+p.monto,0);
  const sd=(pedido.total||0)-pg;
  const reg=()=>{
    const m=parseFloat(monto);
    if(!m||m<=0){alert("Monto inválido");return;}
    if(m>sd+0.01){alert(`Excede el saldo (${fM(sd)})`);return;}
    setPagos(prev=>[...prev,{id:Date.now(),pedido_id:pedido.id,pedido_codigo:pedido.codigo,cliente:pedido.cliente,monto:m,metodo:met,nota:nota.trim(),fecha:new Date().toISOString()}]);
    setMonto("");setNota("");
  };
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md mdmd">
        <div className="mh"><h3>💳 Registrar Pago — <span className="code">{pedido.codigo}</span></h3><button className="cx" onClick={onClose}>✕</button></div>
        <div className="mb">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
            {[{l:"Total",v:fM(pedido.total),c:"tc"},{l:"Pagado",v:fM(pg),c:"tgr"},{l:"Saldo",v:fM(sd),c:sd>0?"tre":"tgr"}].map(x=>(
              <div key={x.l} style={{background:"var(--bg2)",borderRadius:10,padding:"12px",textAlign:"center",border:"1px solid var(--border)"}}>
                <div className="fxs td mb1">{x.l}</div>
                <div className={`mo fw8 ${x.c}`}>{x.v}</div>
              </div>
            ))}
          </div>
          <div className="fg">
            <label className="lb">Método de Pago</label>
            <div className="mg">
              {[{id:"efectivo",i:"💵",l:"Efectivo"},{id:"yape",i:"📱",l:"Yape"},{id:"transferencia",i:"🏦",l:"Transferencia"}].map(m=>(
                <div key={m.id} className={`mc${met===m.id?" on":""}`} onClick={()=>setMet(m.id)}>
                  <div className="mc-i">{m.i}</div>
                  <div className="mc-l">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fr fr2">
            <div className="fg"><label className="lb">Monto (S/)</label><input className="inp" type="number" min="0.5" step="0.5" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="0.00"/><div className="fxs td mt1">Saldo disponible: {fM(sd)}</div></div>
            <div className="fg"><label className="lb">Nota (opcional)</label><input className="inp" value={nota} onChange={e=>setNota(e.target.value)} placeholder="Adelanto, saldo, etc."/></div>
          </div>
          <button className="btn bp blk" onClick={reg}>✅ Registrar Pago</button>
          {pp.length>0&&<>
            <div className="dv"/>
            <div className="ctit">Pagos anteriores</div>
            {pp.map(p=>(
              <div key={p.id} className="fb" style={{padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:".79rem"}}>
                <div className="r g2"><span>{p.metodo==="efectivo"?"💵":p.metodo==="yape"?"📱":"🏦"}</span><span style={{textTransform:"capitalize"}}>{p.metodo}</span>{p.nota&&<span className="fxs td">— {p.nota}</span>}</div>
                <div className="r g3"><span className="fxs td">{fD(p.fecha)}</span><span className="mo fw7 tgr">{fM(p.monto)}</span></div>
              </div>
            ))}
          </>}
        </div>
      </div>
    </div>
  );
}

/* ── HISTORIAL ─────────────────────────────────────── */
function Historial({pedidos,pagos}){
  const [busq,setBusq]=useState(""); const [desde,setDesde]=useState(""); const [hasta,setHasta]=useState("");
  const lista=[...pedidos].sort((a,b)=>b.id-a.id).filter(p=>{
    const ok1=!busq||p.codigo.includes(busq.toUpperCase())||p.cliente.toLowerCase().includes(busq.toLowerCase());
    const ok2=!desde||p.fecha>=desde; const ok3=!hasta||p.fecha<=hasta+"T23:59:59";
    return ok1&&ok2&&ok3;
  });
  const pagado=(id)=>pagos.filter(p=>p.pedido_id===id).reduce((a,p)=>a+p.monto,0);
  const total=lista.reduce((a,p)=>a+(p.total||0),0);
  return(
    <div className="pg">
      <div className="pg-hd"><div><h2 className="gt-cyan">📋 Historial</h2><p>{lista.length} pedidos — Total: {fM(total)}</p></div></div>
      <div className="glow-line"/>
      <div className="r g2 mb3" style={{flexWrap:"wrap"}}>
        <input className="inp" style={{flex:1,minWidth:200}} value={busq} onChange={e=>setBusq(e.target.value)} placeholder="🔍 Código o cliente…"/>
        <input className="inp inpsm" type="date" value={desde} onChange={e=>setDesde(e.target.value)}/>
        <span className="td fsm">→</span>
        <input className="inp inpsm" type="date" value={hasta} onChange={e=>setHasta(e.target.value)}/>
        {(busq||desde||hasta)&&<button className="btn bg bsm" onClick={()=>{setBusq("");setDesde("");setHasta("");}}>✕</button>}
      </div>
      <div className="tw">
        <table>
          <thead><tr><th>Código</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>IGV</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>
            {lista.length===0?(<tr><td colSpan={9} style={{padding:40,textAlign:"center"}}><div className="em"><div className="em-i">📭</div><div className="em-t">Sin resultados</div></div></td></tr>)
            :lista.map(p=>{
              const pg=pagado(p.id); const sd=(p.total||0)-pg;
              return(<tr key={p.id}>
                <td><span className="code">{p.codigo}</span></td>
                <td><div className="fw7">{p.cliente}</div><div className="fxs td">{p.tel}</div></td>
                <td className="fxs td" style={{maxWidth:160}}>{p.items?.map(i=>i.icon+" "+i.nombre).join(", ")}</td>
                <td><span className="mo fw7 tc">{fM(p.total)}</span></td>
                <td><span className="mo tgr fw7">{fM(pg)}</span></td>
                <td><span className={`mo fw7 ${sd>0?"tre":"tgr"}`}>{fM(sd)}</span></td>
                <td>{p.con_igv?<span className="bge bgc">Con IGV</span>:<span className="bge bgg">Sin IGV</span>}</td>
                <td><span className={`bge ${p.estado==="PENDIENTE"?"bgp":"bgd"}`}>{p.estado==="PENDIENTE"?"🔴":"🟢"} {p.estado}</span></td>
                <td className="fxs td">{fD(p.fecha)}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── CAJA ──────────────────────────────────────────── */
function Caja({pagos}){
  const [fecha,setFecha]=useState(""); const [met,setMet]=useState("TODOS");
  const lista=[...pagos].sort((a,b)=>b.id-a.id).filter(p=>{
    const ok1=!fecha||p.fecha.startsWith(fecha);
    const ok2=met==="TODOS"||p.metodo===met;
    return ok1&&ok2;
  });
  const byM=(m)=>lista.filter(p=>p.metodo===m).reduce((a,p)=>a+p.monto,0);
  const total=lista.reduce((a,p)=>a+p.monto,0);
  return(
    <div className="pg">
      <div className="pg-hd">
        <div><h2 className="gt-cyan">💰 Caja</h2><p>Registro de ingresos por método de pago</p></div>
        <input type="date" className="inp inpsm" style={{width:"auto"}} value={fecha} onChange={e=>setFecha(e.target.value)}/>
      </div>
      <div className="glow-line"/>
      <div className="cjm">
        {[{i:"💵",l:"Efectivo",v:byM("efectivo"),c:"var(--gr)"},{i:"📱",l:"Yape",v:byM("yape"),c:"#a78bfa"},{i:"🏦",l:"Transferencia",v:byM("transferencia"),c:"var(--bl)"}].map(m=>(
          <div key={m.l} className="cjc"><div className="cji">{m.i}</div><div className="cjn">{m.l}</div><div className="cjt" style={{color:m.c}}>{fM(m.v)}</div></div>
        ))}
      </div>
      <div className="card mb3"><div className="cb" style={{textAlign:"center"}}>
        <div className="ctit">Total Ingresado</div>
        <div className="mo fw8 tc" style={{fontSize:"2rem"}}>{fM(total)}</div>
        <div className="fxs td mt1">{lista.length} transaccion{lista.length!==1?"es":""}</div>
      </div></div>
      <div className="r g2 mb3">
        {["TODOS","efectivo","yape","transferencia"].map(m=>(
          <button key={m} className={`btn bsm ${met===m?"bp":"bg"}`} onClick={()=>setMet(m)} style={{textTransform:"capitalize"}}>
            {m==="efectivo"?"💵 ":m==="yape"?"📱 ":m==="transferencia"?"🏦 ":""}{m}
          </button>
        ))}
      </div>
      <div className="tw">
        <table>
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Método</th><th>Monto</th><th>Nota</th><th>Fecha</th><th>Hora</th></tr></thead>
          <tbody>
            {lista.length===0?(<tr><td colSpan={7} style={{padding:40,textAlign:"center"}}><div className="em"><div className="em-i">💸</div><div className="em-t">Sin movimientos</div></div></td></tr>)
            :lista.map(p=>(
              <tr key={p.id}>
                <td><span className="code">{p.pedido_codigo}</span></td>
                <td className="fw7">{p.cliente}</td>
                <td><span className="r g1">{p.metodo==="efectivo"?"💵":p.metodo==="yape"?"📱":"🏦"}<span className="fsm" style={{textTransform:"capitalize"}}>{p.metodo}</span></span></td>
                <td><span className="mo fw8 tgr">{fM(p.monto)}</span></td>
                <td className="fxs td">{p.nota||"—"}</td>
                <td className="fxs td">{fD(p.fecha)}</td>
                <td className="fxs td">{fH(p.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── CATÁLOGO VISTA ────────────────────────────────── */
function CatalogoVista({catalogo}){
  const [cat,setCat]=useState("Todos");
  const cats=["Todos",...new Set(catalogo.map(c=>c.cat))];
  const lista=catalogo.filter(c=>cat==="Todos"||c.cat===cat);
  return(
    <div className="pg">
      <div className="pg-hd"><div><h2 className="gt-cyan">🗂️ Catálogo</h2><p>{catalogo.length} productos</p></div></div>
      <div className="glow-line"/>
      <div className="r g2 mb4" style={{flexWrap:"wrap"}}>
        {cats.map(c=><button key={c} className={`btn bsm ${cat===c?"bp":"bg"}`} onClick={()=>setCat(c)}>{c}</button>)}
      </div>
      <div className="pg-grid">
        {lista.map(prod=>(
          <div key={prod.id} className="pc">
            <div className="pc-hd" style={{borderBottom:"1px solid var(--border)"}}>
              <div className="pc-i">{prod.icon}</div>
              <div className="pc-n">{prod.nombre}</div>
              <div className="pc-c">{prod.cat}</div>
            </div>
            <div className="pc-bd" style={{paddingTop:14}}>
              <div className="pc-pr tc">{fM(prod.precio)}<span className="fxs td fw7"> / {prod.unidad}</span></div>
              {prod.medidas&&<span className="pl plc mb2" style={{fontSize:".63rem"}}>📐 Requiere medidas</span>}
              {prod.mats.length>0&&<>
                <div className="ctit" style={{marginBottom:6}}>Materiales / Tipos</div>
                <div className="pm-li">
                  {prod.mats.map(m=><div key={m} className="pm-it"><span>{m}</span></div>)}
                </div>
              </>}
              {prod.acabados.length>0&&<>
                <div className="ctit" style={{marginBottom:6,marginTop:10}}>Acabados</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {prod.acabados.map(a=><span key={a} className="bge bgg">{a}</span>)}
                </div>
              </>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PRECIOS EDIT ──────────────────────────────────── */
function PreciosEdit({catalogo,setCatalogo}){
  const [editId,setEditId]=useState(null);
  const [nP,setNP]=useState(""); const [nD,setND]=useState("");
  const startEdit=(p)=>{setEditId(p.id);setNP(String(p.precio));setND(p.descripcion||"");};
  const save=(id)=>{setCatalogo(prev=>prev.map(p=>p.id===id?{...p,precio:parseFloat(nP)||p.precio}:p));setEditId(null);};
  return(
    <div className="pg">
      <div className="pg-hd"><div><h2 className="gt-cyan">⚙️ Gestión de Precios</h2><p>Edita precios y productos del catálogo</p></div></div>
      <div className="glow-line"/>
      <div className="tw">
        <table>
          <thead><tr><th>Producto</th><th>Categoría</th><th>Unidad</th><th>Precio Base</th><th>Materiales</th><th>Acciones</th></tr></thead>
          <tbody>
            {catalogo.map(prod=>(
              <tr key={prod.id}>
                <td><div className="r g2"><span style={{fontSize:"1.2rem"}}>{prod.icon}</span><span className="fw7">{prod.nombre}</span>{prod.medidas&&<span className="pl plc fxs">m²</span>}</div></td>
                <td className="fxs td">{prod.cat}</td>
                <td className="mo fxs">{prod.unidad}</td>
                <td>
                  {editId===prod.id
                    ?<input className="inp inpsm" type="number" value={nP} onChange={e=>setNP(e.target.value)} style={{width:100}}/>
                    :<span className="mo fw7 tc">{fM(prod.precio)}</span>
                  }
                </td>
                <td className="fxs td">{prod.mats.slice(0,3).join(", ")}{prod.mats.length>3&&"…"}</td>
                <td>
                  <div className="ta">
                    {editId===prod.id
                      ?<><button className="btn bs bsm" onClick={()=>save(prod.id)}>✓ Guardar</button><button className="btn bg bsm" onClick={()=>setEditId(null)}>✕</button></>
                      :<button className="btn bcyan bsm" onClick={()=>startEdit(prod)}>✏️ Editar</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── MODAL PDF ─────────────────────────────────────── */
function ModalPdf({pedido,pagos,onClose}){
  const pp=pagos.filter(p=>p.pedido_id===pedido.id);
  const pg=pp.reduce((a,p)=>a+p.monto,0);
  const sd=(pedido.total||0)-pg;

  const imprimir=()=>{
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>${pedido.codigo}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Outfit',Helvetica,Arial,sans-serif;padding:32px;color:#111;font-size:13px;-webkit-print-color-adjust:exact}
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
      .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
      .logo{font-size:20px;font-weight:900;background:linear-gradient(90deg,#00e5cc,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .logo-s{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-top:2px}
      .info{text-align:right;font-size:11px;color:#555}
      hr{border:none;border-top:1.5px solid #e5e7eb;margin:13px 0}
      .cli{background:#f8f7ff;border:1px solid #ede9fe;border-radius:8px;padding:9px 13px;margin-bottom:14px;font-size:11.5px;display:flex;justify-content:space-between}
      .gh{display:grid;grid-template-columns:2.2fr .8fr 1fr 1fr;gap:6px;padding:6px 0;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;border-bottom:1.5px solid #e5e7eb}
      .gr{display:grid;grid-template-columns:2.2fr .8fr 1fr 1fr;gap:6px;padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:11.5px}
      .detail{font-size:10px;color:#888}
      .tots{text-align:right;margin-top:12px}
      .tr{display:flex;justify-content:flex-end;gap:36px;font-size:12px;margin-bottom:4px;color:#555}
      .gd{display:flex;justify-content:flex-end;gap:36px;font-size:15px;font-weight:900;color:#00b8a3;margin-top:8px;padding-top:8px;border-top:2.5px solid #00e5cc}
      .est{display:inline-block;padding:2px 10px;border-radius:99px;font-size:10px;font-weight:700}
      .ep{background:#fee2e2;color:#dc2626}.ed{background:#d1faf0;color:#059669}
      .pagos-tit{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px}
      .pago-row{display:flex;justify-content:space-between;font-size:11px;color:#555;margin-bottom:3px}
      .footer{text-align:center;font-size:10.5px;color:#aaa;margin-top:20px;padding-top:13px;border-top:1px solid #e5e7eb}
      .hex{font-size:12px;margin-right:4px}
    </style>
    </head><body>
    <div class="top">
      <div>
        <div class="logo">◈ creatrix</div>
        <div class="logo-s">Diseño & Publicidad</div>
      </div>
      <div class="info">
        <div><b>Código:</b> ${pedido.codigo}</div>
        <div><b>Fecha:</b> ${fD(pedido.fecha)} ${fH(pedido.fecha)}</div>
        <div style="margin-top:4px"><span class="est ${pedido.estado==="PENDIENTE"?"ep":"ed"}">${pedido.estado}</span></div>
      </div>
    </div>
    <hr/>
    <div class="cli">
      <span><b>Cliente:</b> ${pedido.cliente}</span>
      <span><b>Tel:</b> ${pedido.tel||"—"}</span>
    </div>
    <div class="gh"><div>Producto</div><div>Cant.</div><div>P.Unit</div><div style="text-align:right">Subtotal</div></div>
    ${pedido.items?.map(it=>`
      <div class="gr">
        <div>${it.icon} ${it.nombre}${it.medidas?`<div class="detail">${it.ancho}m × ${it.alto}m</div>`:""}${it.mat?`<div class="detail">${it.mat}</div>`:""}${it.nota?`<div class="detail">📝 ${it.nota}</div>`:""}</div>
        <div>${it.cantidad} ${it.unidad}</div>
        <div>${fM(it.precio)}</div>
        <div style="text-align:right;font-weight:700">${fM(it.sub)}</div>
      </div>
    `).join("")}
    <div class="tots">
      ${pedido.con_igv?`<div class="tr"><span>Subtotal sin IGV</span><span>${fM(pedido.subtotal)}</span></div><div class="tr"><span>IGV 18%</span><span>${fM(pedido.igv)}</span></div>`:""}
      <div class="gd"><span>TOTAL</span><span>${fM(pedido.total)}</span></div>
      <div class="tr" style="margin-top:6px"><span style="color:#059669">Pagado</span><span style="color:#059669;font-weight:700">${fM(pg)}</span></div>
      <div class="tr"><span style="color:${sd>0?"#dc2626":"#059669"};font-weight:700">Saldo</span><span style="color:${sd>0?"#dc2626":"#059669"};font-weight:700">${fM(sd)}</span></div>
    </div>
    ${pp.length>0?`<hr/><div class="pagos-tit">Pagos registrados</div>${pp.map(p=>`<div class="pago-row"><span>${p.metodo}${p.nota?" — "+p.nota:""}</span><span style="color:#059669;font-weight:700">${fM(p.monto)}</span></div>`).join("")}`:""}
    <div class="footer">¡Gracias por su preferencia! — <b>creatrix</b> Diseño & Publicidad</div>
    </body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),300);
  };

  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md mdlg">
        <div className="mh">
          <h3>🖨️ Nota de Venta — <span className="code">{pedido.codigo}</span></h3>
          <div className="r g2">
            <button className="btn bp bsm" onClick={imprimir}>🖨️ Imprimir / PDF</button>
            <button className="cx" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="mb">
          <div className="pdf">
            <div className="pdf-top">
              <div>
                <div className="pdf-logo">◈ creatrix</div>
                <div className="pdf-sub">Diseño & Publicidad</div>
              </div>
              <div className="pdf-info">
                <div><b>{pedido.codigo}</b></div>
                <div>{fD(pedido.fecha)} {fH(pedido.fecha)}</div>
                <div style={{marginTop:4}}><span className={`pdf-ep ${pedido.estado==="PENDIENTE"?"pdf-pp":"pdf-pd"}`}>{pedido.estado}</span></div>
              </div>
            </div>
            <hr className="pdf-div"/>
            <div className="pdf-cli">
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div><b>Cliente:</b> {pedido.cliente}</div>
                <div><b>Tel:</b> {pedido.tel||"—"}</div>
              </div>
            </div>
            <div className="pdf-gh"><div>Producto</div><div>Cant.</div><div>P.Unit</div><div style={{textAlign:"right"}}>Subtotal</div></div>
            {pedido.items?.map((it,i)=>(
              <div key={i} className="pdf-gr">
                <div>{it.icon} {it.nombre}{it.medidas&&<div className="pdf-id">{it.ancho}m × {it.alto}m</div>}{it.mat&&<div className="pdf-id">{it.mat}</div>}{it.nota&&<div className="pdf-id">📝 {it.nota}</div>}</div>
                <div>{it.cantidad} {it.unidad}</div>
                <div>{fM(it.precio)}</div>
                <div style={{textAlign:"right",fontWeight:700}}>{fM(it.sub)}</div>
              </div>
            ))}
            <div className="pdf-tot">
              {pedido.con_igv&&<><div className="pdf-tr"><span>Subtotal sin IGV</span><span>{fM(pedido.subtotal)}</span></div><div className="pdf-tr"><span>IGV 18%</span><span>{fM(pedido.igv)}</span></div></>}
              <div className="pdf-gd"><span>TOTAL</span><span>{fM(pedido.total)}</span></div>
              <div className="pdf-tr" style={{marginTop:6}}><span style={{color:"#059669"}}>Pagado</span><span style={{color:"#059669",fontWeight:700}}>{fM(pg)}</span></div>
              <div className="pdf-tr"><span style={{color:sd>0?"#dc2626":"#059669",fontWeight:700}}>Saldo</span><span style={{color:sd>0?"#dc2626":"#059669",fontWeight:700}}>{fM(sd)}</span></div>
            </div>
            {pp.length>0&&<><hr className="pdf-div"/><div style={{fontSize:10,fontWeight:700,color:"#888",textTransform:"uppercase",marginBottom:6}}>Pagos registrados</div>{pp.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#555"}}>{p.metodo}{p.nota?" — "+p.nota:""}</span><span style={{color:"#059669",fontWeight:700}}>{fM(p.monto)}</span></div>)}</>}
            <div className="pdf-ft">¡Gracias por su preferencia! — <b>creatrix</b> Diseño & Publicidad</div>
          </div>
        </div>
      </div>
    </div>
  );
}
