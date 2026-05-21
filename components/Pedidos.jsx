'use client'

import { useState } from "react";
import { fM, fD } from "@/lib/utils";

import { supabase } from "@/lib/supabase";
import ModalPago from "./ModalPago";
import ModalPdf from "./ModalPdf";
import ModalDetalle from "./ModalDetalle";

const wa = (p) => {
  const txt = `◈ *CREATRIX — Pedido*\n\n👤 Cliente: ${p.cliente}\n🔖 Código: ${p.codigo}\n\n${(p.items||[]).map(i=>`• ${i.nombre}${i.medidas?` (${i.ancho}×${i.alto}m)`:""} ×${i.cantidad}: ${fM(i.sub)}`).join("\n")}\n\n${p.con_igv?`Subtotal: ${fM(p.subtotal)}\nIGV 18%: ${fM(p.igv)}\n`:""}_TOTAL: *${fM(p.total)}*_\n\nEstado: ${p.estado==="PENDIENTE"?"🔴":"🟢"} ${p.estado}`;
  window.open(`https://wa.me/${(p.tel||"").replace(/\D/g,"")}?text=${encodeURIComponent(txt)}`,"_blank");
};

export default function Pedidos({pedidos,setPedidos,pagos,setPagos,rol,tienda}){
  const [busq,setBusq]=useState("");
  const [fil,setFil]=useState("TODOS");
  const [pagoMd,setPagoMd]=useState(null);
  const [pdfMd,setPdfMd]=useState(null);
  const [detMd,setDetMd]=useState(null);

  const lista=[...pedidos].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).filter(p=>{
    const t=fil==="TODOS"||p.estado===fil;
    const s=!busq||p.codigo.includes(busq.toUpperCase())||p.cliente.toLowerCase().includes(busq.toLowerCase());
    return t&&s;
  });

  const pagado=(id)=>pagos.filter(p=>p.pedido_id===id).reduce((a,p)=>a+p.monto,0);

  const cancelar=async(id)=>{
    const{error}=await supabase.from('pedidos').update({estado:'CANCELADO'}).eq('id',id);
    if(!error) setPedidos(prev=>prev.map(p=>p.id===id?{...p,estado:"CANCELADO"}:p));
  };

  const eliminar=async(id)=>{
    if(!window.confirm("¿Eliminar este pedido?")) return;
    const{error}=await supabase.from('pedidos').delete().eq('id',id);
    if(!error) setPedidos(prev=>prev.filter(p=>p.id!==id));
  };

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
                      <button className="btn bg bsm" onClick={()=>setPdfMd(p)}>🖨️</button>
                      {p.tel&&<button className="btn bs bsm" onClick={()=>wa(p)}>📲</button>}
                      {p.estado==="PENDIENTE"&&<button className="btn bs bsm" onClick={()=>cancelar(p.id)}>✅</button>}
                      {rol==="admin"&&<button className="btn bd bsm" onClick={()=>eliminar(p.id)}>🗑</button>}
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
