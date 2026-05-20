'use client'

import { useState } from "react";
import { fM, fD, fH } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Gastos({ gastos, setGastos, tienda, rol }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto]   = useState("");
  const [met, setMet]       = useState("efectivo");
  const [guardando, setGuardando] = useState(false);
  const [fecha, setFecha]   = useState("");
  const [filtMet, setFiltMet] = useState("TODOS");

  const agregar = async () => {
    if (!nombre.trim()) { alert("Escribe el nombre del gasto"); return; }
    const m = parseFloat(monto);
    if (!m || m <= 0) { alert("Ingresa un monto válido"); return; }
    setGuardando(true);
    const gasto = { nombre: nombre.trim(), monto: m, metodo: met, fecha: new Date().toISOString(), tienda_id: tienda };
    const { data, error } = await supabase.from('gastos').insert(gasto).select().single();
    setGuardando(false);
    if (error) { alert("Error al guardar: " + error.message); return; }
    setGastos(prev => [data, ...prev]);
    setNombre(""); setMonto("");
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    const { error } = await supabase.from('gastos').delete().eq('id', id);
    if (!error) setGastos(prev => prev.filter(g => g.id !== id));
  };

  const lista = [...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).filter(g => {
    const ok1 = !fecha || g.fecha.startsWith(fecha);
    const ok2 = filtMet === "TODOS" || g.metodo === filtMet;
    return ok1 && ok2;
  });

  const byM  = (m) => lista.filter(g => g.metodo === m).reduce((a, g) => a + g.monto, 0);
  const total = lista.reduce((a, g) => a + g.monto, 0);

  return (
    <div className="pg">
      <div className="pg-hd">
        <div><h2 className="gt-cyan">🧾 Gastos</h2><p>Registro de gastos realizados</p></div>
        <input type="date" className="inp inpsm" style={{ width: "auto" }} value={fecha} onChange={e => setFecha(e.target.value)} />
      </div>
      <div className="glow-line" />

      {/* Formulario */}
      <div className="card mb3">
        <div className="cb">
          <div className="ctit">Registrar Gasto</div>
          <div className="fg mb2">
            <label className="lb">Nombre / Descripción</label>
            <input className="inp" value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Pasaje, materiales, impresión..." onKeyDown={e => e.key === "Enter" && agregar()} />
          </div>
          <div className="fr fr2 mb2">
            <div className="fg" style={{ margin: 0 }}>
              <label className="lb">Monto (S/)</label>
              <input className="inp" type="text" inputMode="decimal" value={monto}
                onChange={e => setMonto(e.target.value)} placeholder="0.00"
                onKeyDown={e => e.key === "Enter" && agregar()} />
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label className="lb">Método de Pago</label>
              <div className="mg">
                {[{ id: "efectivo", i: "💵", l: "Efectivo" }, { id: "yape", i: "📱", l: "Yape" }, { id: "transferencia", i: "🏦", l: "Transferencia" }].map(m => (
                  <div key={m.id} className={`mc${met === m.id ? " on" : ""}`} onClick={() => setMet(m.id)}>
                    <div className="mc-i">{m.i}</div>
                    <div className="mc-l">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="btn bp blk" onClick={agregar} disabled={guardando}>
            {guardando ? "Guardando…" : "+ Agregar Gasto"}
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="cjm mb3">
        {[{ i: "💵", l: "Efectivo", v: byM("efectivo"), c: "var(--gr)" }, { i: "📱", l: "Yape", v: byM("yape"), c: "#a78bfa" }, { i: "🏦", l: "Transferencia", v: byM("transferencia"), c: "var(--bl)" }].map(m => (
          <div key={m.l} className="cjc">
            <div className="cji">{m.i}</div>
            <div className="cjn">{m.l}</div>
            <div className="cjt" style={{ color: m.c }}>{fM(m.v)}</div>
          </div>
        ))}
      </div>
      <div className="card mb3"><div className="cb" style={{ textAlign: "center" }}>
        <div className="ctit">Total Gastos</div>
        <div className="mo fw8 tre" style={{ fontSize: "2rem" }}>{fM(total)}</div>
        <div className="fxs td mt1">{lista.length} gasto{lista.length !== 1 ? "s" : ""}</div>
      </div></div>

      {/* Filtros */}
      <div className="r g2 mb3">
        {["TODOS", "efectivo", "yape", "transferencia"].map(m => (
          <button key={m} className={`btn bsm ${filtMet === m ? "bp" : "bg"}`} onClick={() => setFiltMet(m)} style={{ textTransform: "capitalize" }}>
            {m === "efectivo" ? "💵 " : m === "yape" ? "📱 " : m === "transferencia" ? "🏦 " : ""}{m}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="tw">
        <table>
          <thead>
            <tr><th>Descripción</th><th>Método</th><th>Monto</th><th>Fecha</th><th>Hora</th><th></th></tr>
          </thead>
          <tbody>
            {lista.length === 0
              ? <tr><td colSpan={6} style={{ padding: 40, textAlign: "center" }}><div className="em"><div className="em-i">🧾</div><div className="em-t">Sin gastos registrados</div></div></td></tr>
              : lista.map(g => (
                <tr key={g.id}>
                  <td className="fw7">{g.nombre}</td>
                  <td><span className="r g1">{g.metodo === "efectivo" ? "💵" : g.metodo === "yape" ? "📱" : "🏦"}<span className="fsm" style={{ textTransform: "capitalize" }}>{g.metodo}</span></span></td>
                  <td><span className="mo fw8 tre">{fM(g.monto)}</span></td>
                  <td className="fxs td">{fD(g.fecha)}</td>
                  <td className="fxs td">{fH(g.fecha)}</td>
                  <td>{rol === "admin" && <button className="btn bd bsm" onClick={() => eliminar(g.id)}>🗑</button>}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
