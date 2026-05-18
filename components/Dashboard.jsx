'use client'

import { fM } from "@/lib/utils";
import { CATALOGO } from "@/lib/constants";

export default function Dashboard({pedidos,pagos,catalogo,setPag}){
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
