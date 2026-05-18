'use client'

import { useState } from "react";
import { fM, fD } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function ModalPago({pedido,pagos,setPagos,onClose}){
  const [monto,setMonto]=useState("");
  const [met,setMet]=useState("efectivo");
  const [nota,setNota]=useState("");
  const [registrando,setRegistrando]=useState(false);
  const pp=pagos.filter(p=>p.pedido_id===pedido.id);
  const pg=pp.reduce((a,p)=>a+p.monto,0);
  const sd=(pedido.total||0)-pg;
  const reg=async()=>{
    const m=parseFloat(monto);
    if(!m||m<=0){alert("Monto inválido");return;}
    if(m>sd+0.01){alert(`Excede el saldo (${fM(sd)})`);return;}
    setRegistrando(true);
    const pago={pedido_id:pedido.id,pedido_codigo:pedido.codigo,cliente:pedido.cliente,monto:m,metodo:met,nota:nota.trim(),fecha:new Date().toISOString()};
    const{data,error}=await supabase.from('pagos').insert(pago).select().single();
    setRegistrando(false);
    if(error){alert("Error al registrar: "+error.message);return;}
    setPagos(prev=>[...prev,data]);
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
          <button className="btn bp blk" onClick={reg} disabled={registrando}>{registrando?"Registrando…":"✅ Registrar Pago"}</button>
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
