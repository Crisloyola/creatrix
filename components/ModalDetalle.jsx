'use client'

import { fM, fD, fH } from "@/lib/utils";

export default function ModalDetalle({pedido,pagos,onClose,onPago}){
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
