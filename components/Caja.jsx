'use client'

import { useState } from "react";
import { fM, fD, fH } from "@/lib/utils";

export default function Caja({pagos, gastos=[]}){
  const [fecha,setFecha]=useState(""); const [met,setMet]=useState("TODOS");
  const lista=[...pagos].sort((a,b)=>b.id-a.id).filter(p=>{
    const ok1=!fecha||p.fecha.startsWith(fecha);
    const ok2=met==="TODOS"||p.metodo===met;
    return ok1&&ok2;
  });
  const gastosLista=[...gastos].filter(g=>!fecha||g.fecha.startsWith(fecha));
  const byM=(m)=>lista.filter(p=>p.metodo===m).reduce((a,p)=>a+p.monto,0);
  const totalIngresos=lista.reduce((a,p)=>a+p.monto,0);
  const totalGastos=gastosLista.reduce((a,g)=>a+g.monto,0);
  const total=totalIngresos-totalGastos;
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
      <div className="card mb3"><div className="cb">
        <div className="fb mb2"><span className="ctit" style={{margin:0}}>Ingresos</span><span className="mo fw8 tgr" style={{fontSize:"1.3rem"}}>{fM(totalIngresos)}</span></div>
        <div className="fb mb2"><span className="fsm td">Gastos</span><span className="mo fw7 tre" style={{fontSize:"1.1rem"}}>−{fM(totalGastos)}</span></div>
        <div className="sep mb2"/>
        <div className="fb"><span className="fw8 gt-cyan" style={{fontSize:"1rem"}}>NETO EN CAJA</span><span className="mo fw8 tc" style={{fontSize:"1.6rem"}}>{fM(total)}</span></div>
        <div className="fxs td mt1" style={{textAlign:"right"}}>{lista.length} cobro{lista.length!==1?"s":""} · {gastosLista.length} gasto{gastosLista.length!==1?"s":""}</div>
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
