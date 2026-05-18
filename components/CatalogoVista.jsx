'use client'

import { useState } from "react";
import { fM } from "@/lib/utils";

export default function CatalogoVista({ catalogo }) {
  const [cat, setCat] = useState("Todos");
  const cats = ["Todos", ...new Set(catalogo.map(c => c.cat))];
  const lista = catalogo.filter(c => cat === "Todos" || c.cat === cat);

  return (
    <div className="pg">
      <div className="pg-hd"><div><h2 className="gt-cyan">🗂️ Catálogo</h2><p>{catalogo.length} productos</p></div></div>
      <div className="glow-line" />
      <div className="r g2 mb4" style={{ flexWrap: "wrap" }}>
        {cats.map(c => <button key={c} className={`btn bsm ${cat === c ? "bp" : "bg"}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="pg-grid">
        {lista.map(prod => (
          <div key={prod.id} className="pc">
            <div className="pc-hd" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="pc-i">{prod.icon}</div>
              <div className="pc-n">{prod.nombre}</div>
              <div className="pc-c">{prod.cat}</div>
            </div>
            <div className="pc-bd" style={{ paddingTop: 14 }}>
              <div className="pc-pr tc">
                {prod.opciones
                  ? `desde ${fM(prod.opciones[0].precio)}`
                  : fM(prod.precio)}
                <span className="fxs td fw7"> / {prod.unidad}</span>
              </div>

              {/* Opciones (caballete, parante, offset) */}
              {prod.opciones && (
                <>
                  <div className="ctit" style={{ marginBottom: 6, marginTop: 10 }}>Opciones</div>
                  <div className="pm-li">
                    {prod.opciones.map(o => (
                      <div key={o.nombre} className="pm-it">
                        <span>{o.nombre}</span>
                        <span className="mo fxs tc">{fM(o.precio)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Materiales / tipos con precio (banner, vinil) */}
              {prod.mats && prod.mats.length > 0 && (
                <>
                  <div className="ctit" style={{ marginBottom: 6, marginTop: 10 }}>Materiales</div>
                  <div className="pm-li">
                    {prod.mats.map((m, i) => {
                      const nombre = typeof m === "string" ? m : m.nombre;
                      const precio = typeof m === "object" ? m.precio : null;
                      return (
                        <div key={i} className="pm-it">
                          <span>{nombre}</span>
                          {precio != null && <span className="mo fxs tc">{fM(precio)}/{prod.unidad}</span>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Bases adicionales (vinil) */}
              {prod.bases && prod.bases.filter(b => b.precio > 0).length > 0 && (
                <>
                  <div className="ctit" style={{ marginBottom: 6, marginTop: 10 }}>Bases adicionales</div>
                  <div className="pm-li">
                    {prod.bases.filter(b => b.precio > 0).map(b => (
                      <div key={b.nombre} className="pm-it">
                        <span>{b.nombre}</span>
                        <span className="mo fxs tye">+{fM(b.precio)}/m</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Notas especiales por tipo */}
              {prod.tipo === "banner" && (
                <div className="fxs td mt2">Rollos: {prod.rollos.join("m · ")}m — se redondea al rollo superior</div>
              )}
              {prod.tipo === "vinil" && (
                <div className="fxs td mt2">Ancho fijo: {prod.anchoFijo}m — precio por metro lineal</div>
              )}
              {prod.tipo === "uvdtf" && (
                <div className="fxs td mt2">Rollo {prod.anchoFijo * 100}cm · A4=S/20 · ½m=S/30 · S/45/m · &gt;3m=S/35/m</div>
              )}
              {prod.tipo === "vinilCorte" && (
                <div className="fxs td mt2">Rollo {prod.anchoFijo * 100}cm · Mín. 20cm=S/20 · S/50/m adicional</div>
              )}

              {/* Imantado: packs y opción personalizada */}
              {prod.tipo === "imantado" && prod.packs && (
                <>
                  <div className="ctit" style={{ marginBottom: 6, marginTop: 10 }}>Packs (tamaño tarjeta)</div>
                  <div className="pm-li">
                    {prod.packs.map(p => (
                      <div key={p.und} className="pm-it">
                        <span>{p.und} unidades</span>
                        <span className="mo fxs tc">{fM(p.precio)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="fxs td mt2">Personalizado: rollo {prod.anchoFijo * 100}cm · S/{prod.precioLineal}/m lineal</div>
                </>
              )}

              {/* Letrero Luminoso */}
              {prod.tipo === "letrero" && (
                <div className="fxs td mt2">Altura máx. {prod.alturaMax}m · S/{prod.precioMetro}/m lineal de ancho (redondeado al metro superior)</div>
              )}

              {/* Cartas / Menús: tipos con precios escalonados */}
              {prod.tipo === "cartas" && prod.tipos && (
                <>
                  {prod.tipos.map(t => (
                    <div key={t.nombre} style={{ marginTop: 10 }}>
                      <div className="ctit" style={{ marginBottom: 4 }}>{t.nombre}</div>
                      <div className="pm-li">
                        {t.precios.map(p => (
                          <div key={p.desde} className="pm-it">
                            <span>{p.desde === 1 ? "1–5 und" : p.desde === 6 ? "6–11 und" : `${p.desde}+ und`}</span>
                            <span className="mo fxs tc">{fM(p.precio)}/und</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Merchandising: productos con precios escalonados */}
              {prod.tipo === "merchandising" && prod.productos && (
                <>
                  {prod.productos.map(p => (
                    <div key={p.nombre} style={{ marginTop: 10 }}>
                      <div className="ctit" style={{ marginBottom: 4 }}>{p.nombre}</div>
                      <div className="pm-li">
                        {p.precios.map((pr, i) => {
                          const siguiente = p.precios[i + 1];
                          const label = p.unidad === "ciento"
                            ? `${pr.desde}${siguiente ? `–${siguiente.desde - 1}` : "+"} und`
                            : `${pr.desde}${siguiente ? `–${siguiente.desde - 1}` : "+"} und`;
                          return (
                            <div key={pr.desde} className="pm-it">
                              <span>{label}</span>
                              <span className="mo fxs tc">{fM(pr.precio)}/{p.unidad === "ciento" ? "ciento" : "und"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Acabados genéricos */}
              {prod.acabados && prod.acabados.length > 0 && (
                <>
                  <div className="ctit" style={{ marginBottom: 6, marginTop: 10 }}>Acabados</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {prod.acabados.map(a => <span key={a} className="bge bgg">{a}</span>)}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
