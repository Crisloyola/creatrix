export const uid  = () => Date.now() + Math.random().toString(36).slice(2,6);
export const fM   = (n) => `S/ ${Number(n||0).toFixed(2)}`;
export const fD   = (i) => i ? new Date(i).toLocaleDateString("es-PE",{day:"2-digit",month:"2-digit",year:"numeric"}) : "-";
export const fH   = (i) => i ? new Date(i).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}) : "";
export const genC = () => { const d=new Date(); return `CTX-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}-${Math.floor(1000+Math.random()*9000)}`; };
