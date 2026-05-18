'use client'

import { useState } from "react";
import { fM } from "@/lib/utils";

export default function PreciosEdit({ catalogo, setCatalogo }) {
  const [editId, setEditId] = useState(null);
  const [nP, setNP] = useState("");

  const startEdit = (p) => { setEditId(p.id); setNP(String(p.precio)); };
  const save = (id) => {
    setCatalogo(prev => prev.map(p => p.id === id ? { ...p, precio: parseFloat(nP) || p.precio } : p));
    setEditId(null);
  };

  const tieneOpciones = (p) => !!p.opciones;
  const tieneMatsObj  = (p) => Array.isArray(p.mats) && p.mats.length > 0 && typeof p.mats[0] === "object";

  return (
    <div className="pg">
      <div className="pg-hd"><div><h2 className="gt-cyan">⚙️ Gestión de Precios</h2><p>Edita precios y productos del catálogo</p></div></div>
      <div className="glow-line" />
      <div className="tw">
        <table>
          <thead>
            <tr><th>Producto</th><th>Categoría</th><th>Unidad</th><th>Precio base</th><th>Detalle de precios</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {catalogo.map(prod => (
              <tr key={prod.id}>
                <td>
                  <div className="r g2">
                    <span style={{ fontSize: "1.2rem" }}>{prod.icon}</span>
                    <span className="fw7">{prod.nombre}</span>
                  </div>
                </td>
                <td className="fxs td">{prod.cat}</td>
                <td className="mo fxs">{prod.unidad}</td>
                <td>
                  {editId === prod.id
                    ? <input className="inp inpsm" type="number" value={nP} onChange={e => setNP(e.target.value)} style={{ width: 100 }} />
                    : <span className="mo fw7 tc">{fM(prod.precio)}</span>
                  }
                </td>
                <td className="fxs td" style={{ maxWidth: 200 }}>
                  {tieneOpciones(prod) && prod.opciones.map(o => `${o.nombre}: ${fM(o.precio)}`).join(" · ")}
                  {tieneMatsObj(prod)  && prod.mats.map(m => `${m.nombre}: ${fM(m.precio)}`).join(" · ")}
                  {!tieneOpciones(prod) && !tieneMatsObj(prod) && Array.isArray(prod.mats) && prod.mats.slice(0, 3).join(", ")}
                </td>
                <td>
                  <div className="ta">
                    {editId === prod.id
                      ? <>
                          <button className="btn bs bsm" onClick={() => save(prod.id)}>✓ Guardar</button>
                          <button className="btn bg bsm" onClick={() => setEditId(null)}>✕</button>
                        </>
                      : <button className="btn bcyan bsm" onClick={() => startEdit(prod)}>✏️ Editar</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
