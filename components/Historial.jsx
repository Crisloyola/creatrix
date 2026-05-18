'use client'

import { useState } from "react";
import { fM, fD } from "@/lib/utils";
import ModalPdf from "./ModalPdf";

const wa = (p) => {
  const txt = `◈ *CREATRIX — Pedido*\n\n👤 Cliente: ${p.cliente}\n🔖 Código: ${p.codigo}\n\n${(p.items||[]).map(i=>`• ${i.nombre}${i.medidas?` (${i.ancho}×${i.alto}m)`:""} ×${i.cantidad}: ${fM(i.sub)}`).join("\n")}\n\n${p.con_igv?`Subtotal: ${fM(p.subtotal)}\nIGV 18%: ${fM(p.igv)}\n`:""}_TOTAL: *${fM(p.total)}*_\n\nEstado: ${p.estado==="PENDIENTE"?"🔴":"🟢"} ${p.estado}`;
  window.open(`https://wa.me/${(p.tel||"").replace(/\D/g,"")}?text=${encodeURIComponent(txt)}`,"_blank");
};

export default function Historial({pedidos,pagos,filtros,setFiltros}){
  const busq=filtros.busq,  setBusq =v=>setFiltros(f=>({...f,busq:v}));
  const desde=filtros.desde, setDesde=v=>setFiltros(f=>({...f,desde:v}));
  const hasta=filtros.hasta, setHasta=v=>setFiltros(f=>({...f,hasta:v}));
  const [pdfMd,setPdfMd]=useState(null);

  const lista=[...pedidos].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).filter(p=>{
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
          <thead><tr><th>Código</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>IGV</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.length===0?(<tr><td colSpan={10} style={{padding:40,textAlign:"center"}}><div className="em"><div className="em-i">📭</div><div className="em-t">Sin resultados</div></div></td></tr>)
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
                <td>
                  <div className="ta">
                    <button className="btn bg bsm" onClick={()=>setPdfMd(p)}>🖨️</button>
                    {p.tel&&<button className="btn bs bsm" onClick={()=>wa(p)}>📲</button>}
                  </div>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      {pdfMd&&<ModalPdf pedido={pdfMd} pagos={pagos} onClose={()=>setPdfMd(null)}/>}
    </div>
  );
}
