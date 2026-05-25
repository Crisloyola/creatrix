'use client'

import { useState } from "react";
import { fM, fD } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

function imprimirReporte(r) {
  const w = window.open("", "_blank");
  const items = r.pedidos_data || [];
  const saldo = (r.total_ventas || 0) - (r.total_pagado || 0);
  w.document.write(`<html><head><title>Reporte ${r.semana_inicio}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Outfit',Helvetica,Arial,sans-serif;padding:32px;color:#111;font-size:13px;-webkit-print-color-adjust:exact}
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
    .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
    hr{border:none;border-top:1.5px solid #e5e7eb;margin:13px 0}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
    .kpi{background:#f8f7ff;border:1px solid #ede9fe;border-radius:8px;padding:12px;text-align:center}
    .kpi-v{font-size:18px;font-weight:800;color:#7c3aed;font-family:monospace}
    .kpi-l{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-top:3px}
    .gh{display:grid;grid-template-columns:1.2fr 2fr 1fr 1fr;gap:6px;padding:7px 0;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;border-bottom:1.5px solid #e5e7eb}
    .gr{display:grid;grid-template-columns:1.2fr 2fr 1fr 1fr;gap:6px;padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:11px}
    .ep{color:#dc2626;font-weight:700}.ed{color:#059669;font-weight:700}
    .footer{text-align:center;font-size:10px;color:#aaa;margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb}
  </style></head><body>
  <div class="top">
    <div>
      <img src="${window.location.origin}/logooscuro.png" alt="Logo" style="height:44px;object-fit:contain;display:block;margin-bottom:4px"/>
      <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.1em">Reporte Semanal</div>
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div><b>Período:</b> ${fD(r.semana_inicio)} — ${fD(r.semana_fin)}</div>
      <div style="margin-top:4px;font-size:10px;color:#aaa">Generado: ${new Date(r.created_at).toLocaleDateString('es-PE')}</div>
    </div>
  </div>
  <hr/>
  <div class="kpis">
    <div class="kpi"><div class="kpi-v">${r.total_pedidos}</div><div class="kpi-l">Pedidos</div></div>
    <div class="kpi"><div class="kpi-v" style="color:#00b8a3">${fM(r.total_ventas)}</div><div class="kpi-l">Total ventas</div></div>
    <div class="kpi"><div class="kpi-v" style="color:#059669">${fM(r.total_pagado)}</div><div class="kpi-l">Cobrado</div></div>
    <div class="kpi"><div class="kpi-v" style="color:${saldo > 0 ? '#dc2626' : '#059669'}">${fM(saldo)}</div><div class="kpi-l">Saldo pendiente</div></div>
  </div>
  ${items.length > 0 ? `
    <div class="gh"><div>Código</div><div>Cliente</div><div>Total</div><div>Estado</div></div>
    ${items.map(p => `
      <div class="gr">
        <div style="font-family:monospace;font-size:10px">${p.codigo}</div>
        <div>${p.cliente}</div>
        <div style="font-weight:700;font-family:monospace">${fM(p.total)}</div>
        <div class="${p.estado === 'PENDIENTE' ? 'ep' : 'ed'}">${p.estado}</div>
      </div>
    `).join("")}
  ` : '<div style="text-align:center;color:#aaa;padding:20px 0">Sin pedidos en este período</div>'}
  <div class="footer">creatrix — Reporte semanal generado automáticamente</div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

export default function Reportes({ reportes, setReportes, tienda, pedidos, pagos }) {
  const [generando, setGenerando] = useState(false);

  const vistaPrevia = () => {
    const hoy = new Date();
    const domingo = new Date(hoy);
    domingo.setDate(hoy.getDate() - hoy.getDay());
    const ini = domingo.toISOString().split("T")[0];
    const fin = hoy.toISOString().split("T")[0];

    const peds = (pedidos || []).filter(p => p.fecha >= ini && p.fecha <= fin + 'T23:59:59');
    const pays = (pagos  || []).filter(p => p.fecha >= ini && p.fecha <= fin + 'T23:59:59');
    const totalVentas = peds.reduce((a, p) => a + (p.total || 0), 0);
    const totalPagado = pays.reduce((a, p) => a + (p.monto || 0), 0);

    imprimirReporte({
      semana_inicio: ini,
      semana_fin: fin,
      total_pedidos: peds.length,
      total_ventas: totalVentas,
      total_pagado: totalPagado,
      pedidos_data: peds,
      created_at: new Date().toISOString(),
    });
  };

  const generarAhora = async () => {
    setGenerando(true);
    const hoy = new Date();
    const domingo = new Date(hoy);
    domingo.setDate(hoy.getDate() - hoy.getDay()); // domingo de esta semana
    const ini = domingo.toISOString().split("T")[0];
    const fin = hoy.toISOString().split("T")[0];

    const [{ data: peds }, { data: pays }] = await Promise.all([
      supabase.from('pedidos').select('*').eq('tienda_id', tienda)
        .gte('fecha', ini).lte('fecha', fin + 'T23:59:59'),
      supabase.from('pagos').select('*').eq('tienda_id', tienda)
        .gte('fecha', ini).lte('fecha', fin + 'T23:59:59'),
    ]);

    const totalVentas = (peds || []).reduce((a, p) => a + (p.total || 0), 0);
    const totalPagado = (pays || []).reduce((a, p) => a + (p.monto || 0), 0);

    const { data, error } = await supabase.from('reportes_semanales').upsert({
      tienda_id: tienda,
      semana_inicio: ini,
      semana_fin: fin,
      total_pedidos: (peds || []).length,
      total_ventas: totalVentas,
      total_pagado: totalPagado,
      pedidos_data: peds || [],
    }, { onConflict: 'tienda_id,semana_inicio' }).select().single();

    setGenerando(false);
    if (error) { alert("Error: " + error.message); return; }
    setReportes(prev =>
      [data, ...prev.filter(r => r.semana_inicio !== data.semana_inicio)]
        .sort((a, b) => b.semana_inicio.localeCompare(a.semana_inicio))
    );
    alert("✅ Semana cerrada correctamente.\n\n📊 Reporte guardado con los datos de esta semana.\n🔄 Dashboard y Caja reiniciados en S/ 0.\n📋 Historial conserva todos los pedidos anteriores.");
  };

  return (
    <div className="pg">
      <div className="pg-hd">
        <div>
          <h2 className="gt-cyan">📊 Cierres Semanales</h2>
          <p>{reportes.length} cierre{reportes.length !== 1 ? "s" : ""} guardados</p>
        </div>
        <div className="r g2">
          <button className="btn bg" onClick={vistaPrevia}>👁 Vista previa</button>
          <button className="btn bm blg" onClick={generarAhora} disabled={generando}>
            {generando ? "Cerrando…" : "🔄 Cerrar Semana Actual"}
          </button>
        </div>
      </div>
      <div className="glow-line" />

      <div style={{background:"rgba(0,229,204,.06)",border:"1px solid rgba(0,229,204,.18)",borderRadius:10,padding:"11px 16px",marginBottom:20,display:"flex",alignItems:"flex-start",gap:10,fontSize:".78rem",color:"var(--t2)"}}>
        <span style={{fontSize:"1.1rem",flexShrink:0}}>💡</span>
        <div>
          <b style={{color:"var(--t)"}}>¿Cómo funciona el cierre semanal?</b><br/>
          Al cerrar la semana se guarda un reporte con todos los datos actuales.
          El <b style={{color:"var(--t)"}}>Dashboard</b> y la <b style={{color:"var(--t)"}}>Caja</b> arrancan en <b style={{color:"var(--cyan)"}}>S/ 0</b> para la nueva semana.
          El <b style={{color:"var(--t)"}}>Historial</b> y <b style={{color:"var(--t)"}}>Pedidos</b> siguen mostrando todos los datos anteriores sin cambios.
        </div>
      </div>

      {reportes.length === 0 ? (
        <div className="em" style={{ marginTop: 60 }}>
          <div className="em-i">🗓</div>
          <div className="em-t">Sin cierres registrados aún</div>
          <div className="fxs td mt1">Usa <b>"Cerrar Semana Actual"</b> al finalizar cada semana para guardar el reporte y reiniciar el dashboard en 0</div>
        </div>
      ) : (
        <div className="tw">
          <table>
            <thead>
              <tr><th>#</th><th>Período</th><th>Pedidos</th><th>Total ventas</th><th>Cobrado</th><th>Saldo</th><th>Fecha cierre</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {reportes.map((r, idx) => {
                const saldo = (r.total_ventas || 0) - (r.total_pagado || 0);
                return (
                  <tr key={r.id}>
                    <td><span className="bge bgc">#{reportes.length - idx}</span></td>
                    <td>
                      <div className="fw7">{fD(r.semana_inicio)}</div>
                      <div className="fxs td">→ {fD(r.semana_fin)}</div>
                    </td>
                    <td><span className="bge bgg">{r.total_pedidos}</span></td>
                    <td><span className="mo fw7 tc">{fM(r.total_ventas)}</span></td>
                    <td><span className="mo tgr fw7">{fM(r.total_pagado)}</span></td>
                    <td><span className={`mo fw7 ${saldo > 0 ? "tre" : "tgr"}`}>{fM(saldo)}</span></td>
                    <td className="fxs td">
                      {new Date(r.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn bp bsm" onClick={() => imprimirReporte(r)}>🖨️ Descargar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
