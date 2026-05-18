'use client'

import { useState } from "react";
import { fM } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function PreciosEdit({ catalogo, setCatalogo, productosCustom, setProductosCustom, tienda }) {
  const [editId, setEditId] = useState(null);
  const [nP, setNP] = useState("");

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [guardando, setGuardando] = useState(false);

  const startEdit = (p) => { setEditId(p.id); setNP(String(p.precio)); };
  const save = (id) => {
    setCatalogo(prev => prev.map(p => p.id === id ? { ...p, precio: parseFloat(nP) || p.precio } : p));
    setEditId(null);
  };

  const agregarCustom = async () => {
    if (!nuevoNombre.trim()) { alert("Escribe el nombre del producto"); return; }
    const precio = parseFloat(nuevoPrecio);
    if (!precio || precio <= 0) { alert("Ingresa un precio válido"); return; }
    setGuardando(true);
    const { data, error } = await supabase.from('productos_custom')
      .insert({ nombre: nuevoNombre.trim(), precio, tienda_id: tienda })
      .select().single();
    setGuardando(false);
    if (error) { alert("Error al guardar: " + error.message); return; }
    setProductosCustom(prev => [...prev, data]);
    setNuevoNombre("");
    setNuevoPrecio("");
  };

  const eliminarCustom = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from('productos_custom').delete().eq('id', id);
    if (!error) setProductosCustom(prev => prev.filter(p => p.id !== id));
  };

  const tieneOpciones = (p) => !!p.opciones;
  const tieneMatsObj  = (p) => Array.isArray(p.mats) && p.mats.length > 0 && typeof p.mats[0] === "object";

  return (
    <div className="pg">
      <div className="pg-hd"><div><h2 className="gt-cyan">⚙️ Gestión de Precios</h2><p>Edita precios y productos del catálogo</p></div></div>
      <div className="glow-line" />
      
      {/* Productos personalizados */}
      <div className="card">
        <div className="cb">
          <div className="ctit">Productos Personalizados</div>

          {/* Formulario para agregar */}
          <div className="fr fr3 mb3" style={{ alignItems: "flex-end" }}>
            <div className="fg" style={{ margin: 0 }}>
              <label className="lb">Nombre del producto</label>
              <input className="inp" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
                placeholder="Ej: Lona impresa especial" onKeyDown={e => e.key === "Enter" && agregarCustom()} />
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label className="lb">Precio (S/)</label>
              <input className="inp" type="number" min="0" step="0.5" value={nuevoPrecio}
                onChange={e => setNuevoPrecio(e.target.value)} placeholder="0.00"
                onKeyDown={e => e.key === "Enter" && agregarCustom()} />
            </div>
            <button className="btn bp" onClick={agregarCustom} disabled={guardando}>
              {guardando ? "Guardando…" : "+ Agregar"}
            </button>
          </div>

          {/* Lista de productos custom */}
          {productosCustom.length === 0 ? (
            <div className="em" style={{ padding: "24px 0" }}>
              <div className="em-i">📦</div>
              <div className="em-t">Sin productos personalizados aún</div>
            </div>
          ) : (
            <div className="tw">
              <table>
                <thead>
                  <tr><th>Producto</th><th>Precio</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {productosCustom.map(p => (
                    <tr key={p.id}>
                      <td><div className="r g2"><span>📦</span><span className="fw7">{p.nombre}</span></div></td>
                      <td><span className="mo fw7 tc">{fM(p.precio)}</span></td>
                      <td>
                        <button className="btn bd bsm" onClick={() => eliminarCustom(p.id)}>🗑 Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="glow-line" style={{ margin: "28px 0" }} />

      {/* Tabla catálogo base */}
      <div className="tw mb3">
        <table>
          <thead>
            <tr><th>Producto</th><th>Categoría</th><th>Unidad</th><th>Precio base</th><th>Detalle</th><th>Acciones</th></tr>
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
