'use client'

import { fM, fD, fH } from "@/lib/utils";

export default function ModalPdf({pedido,pagos,onClose}){
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
