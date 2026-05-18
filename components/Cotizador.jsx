'use client'

import { useState } from "react";
import { uid, fM, genC } from "@/lib/utils";
import { IGV } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import ModalPdf from "./ModalPdf";

// ── Banner: redondeo de medidas al rollo disponible ─────────────────────────
const ROLLOS_B = [1, 1.5, 2, 3];
const rollW = (w) => ROLLOS_B.find(r => r >= +w) ?? 3;
const rollH = (h) => Math.ceil(+h / 0.5) * 0.5;

// ── Costos proveedor (para calcular ganancia en tienda3) ─────────────────────
const COSTOS = {
  banner: {
    'Banner 8 onzas':           8,
    'Banner 13 onzas Black Out': 13,
  },
  vinil: {
    'Vinil normal':   20,
    'Vinil laminado': 25,
  },
  caballete: {
    'Caballete 1.20×0.70m': 50,
    'Caballete 1.50×0.80m': 60,
    'Caballete 2.00×1.00m': 80,
  },
  parante: {
    'Parante de fierro 2×1 + banner grueso':           60,
    'Roll Screen aluminio 2×1 + banner grueso':        90,
    'Parante tipo araña aluminio 2×1 + banner grueso': 95,
    'Módulo de PVC + brandeo en vinil':               200,
  },
};

function calcCosto(it) {
  switch (it.tipo) {
    case 'banner': {
      const c = COSTOS.banner[it.mat] ?? 0;
      return rollW(it.ancho) * rollH(it.alto) * c * +it.cantidad + (it.precioTubo || 0) * +it.cantidad;
    }
    case 'vinil': {
      const c = COSTOS.vinil[it.mat] ?? 0;
      return +it.metros * c * +it.cantidad;
    }
    case 'caballete': {
      const c = COSTOS.caballete[it.opcion] ?? 0;
      return c * +it.cantidad;
    }
    case 'parante': {
      const c = COSTOS.parante[it.opcion] ?? 0;
      return c * +it.cantidad;
    }
    default: return null;
  }
}

// ── Cálculo de subtotal por tipo de producto ────────────────────────────────
function calcSub(it) {
  switch (it.tipo) {
    case "banner": {
      const area = rollW(it.ancho) * rollH(it.alto);
      return area * it.precio * +it.cantidad + (it.bastidor ? (it.precioBastidor || 0) : 0) * +it.cantidad + (it.precioTubo || 0) * +it.cantidad;
    }

    case "vinil":
      return +it.metros * (it.precio + it.precioBase) * +it.cantidad;

    case "uvdtf": {
      if (it.medida === "A4")  return 20 * +it.cantidad;
      if (it.medida === "0.5m") return 30 * +it.cantidad;
      const m = +it.metros;
      return (m <= 3 ? m * 45 : 135 + (m - 3) * 35) * +it.cantidad;
    }

    case "vinilCorte": {
      const m = +it.metros;
      return (m <= 0.20 ? 20 : 20 + (m - 0.20) * 50) * +it.cantidad;
    }

    case "caballete":
    case "parante":
    case "offset":
      return it.precio * +it.cantidad;

    case "imantado":
      if (it.modo === "pack") return it.precio * +it.cantidad;
      return +it.metros * 45 * +it.cantidad;

    case "letrero":
      return Math.ceil(+it.ancho) * 300 * +it.cantidad;

    case "cartas": {
      const tp = it.tipos?.find(t => t.nombre === it.tipo_carta);
      if (!tp) return 0;
      const qty = +it.cantidad;
      const pe = [...tp.precios].reverse().find(p => qty >= p.desde);
      return (pe?.precio ?? tp.precios[0].precio) * qty;
    }

    case "merchandising": {
      const pr = it.productos?.find(p => p.nombre === it.producto_merch);
      if (!pr) return 0;
      const qty = +it.cantidad;
      if (pr.unidad === "ciento") {
        const c = Math.ceil(qty / 100);
        const pe = [...pr.precios].reverse().find(p => c * 100 >= p.desde);
        return c * (pe?.precio ?? pr.precios[0].precio);
      }
      const pe = [...pr.precios].reverse().find(p => qty >= p.desde);
      return (pe?.precio ?? pr.precios[0].precio) * qty;
    }

    default:
      return (it.medidas ? +it.ancho * +it.alto * +it.precio : +it.precio) * +it.cantidad;
  }
}

// ── Estado inicial al agregar un producto ───────────────────────────────────
function initItem(prod) {
  const b = { key: uid(), prod_id: prod.id, nombre: prod.nombre, icon: prod.icon, tipo: prod.tipo ?? "generico", nota: "", cantidad: 1 };
  switch (prod.tipo) {
    case "banner":
      return { ...b, ancho: 1, alto: 1, rollos: prod.rollos,
               mat: prod.mats[0].nombre, precio: prod.mats[0].precio, mats: prod.mats,
               acabado: prod.acabados[0] || "", acabados: prod.acabados,
               tubo: "sin", precioTubo: 0,
               bastidor: false, precioBastidor: prod.mats[0].precio * 2 };
    case "vinil":
      return { ...b, anchoFijo: prod.anchoFijo, metros: 1,
               mat: prod.mats[0].nombre, precio: prod.mats[0].precio, mats: prod.mats,
               base: prod.bases[0].nombre, precioBase: prod.bases[0].precio, bases: prod.bases };
    case "uvdtf":
      return { ...b, anchoFijo: prod.anchoFijo, medida: "custom", metros: 1 };
    case "vinilCorte":
      return { ...b, anchoFijo: prod.anchoFijo, metros: 0.20, mat: prod.mats[0], mats: prod.mats };
    case "caballete":
    case "parante":
    case "offset":
      return { ...b, opcion: prod.opciones[0].nombre, precio: prod.opciones[0].precio, opciones: prod.opciones };
    case "imantado":
      return { ...b, modo: "pack", packs: prod.packs,
               opcion: prod.packs[0].und, precio: prod.packs[0].precio,
               anchoFijo: prod.anchoFijo, metros: 1 };
    case "letrero":
      return { ...b, ancho: 1, alto: 1, alturaMax: prod.alturaMax, precio: prod.precioMetro };
    case "cartas":
      return { ...b, tipos: prod.tipos,
               tipo_carta: prod.tipos[0].nombre, precio: prod.tipos[0].precios[0].precio };
    case "merchandising":
      return { ...b, productos: prod.productos,
               producto_merch: prod.productos[0].nombre,
               cantidad: prod.productos[0].unidad === "ciento" ? 100 : 1 };
    default:
      return { ...b, medidas: prod.medidas, ancho: 1, alto: 1, unidad: prod.unidad, precio: prod.precio,
               mat: (prod.mats || [])[0] || "", mats: prod.mats || [],
               acabado: (prod.acabados || [])[0] || "", acabados: prod.acabados || [] };
  }
}

// ── Normalizar item para guardar en pedido (estructura compatible con modales)
function forSave(it) {
  const sub = calcSub(it);
  switch (it.tipo) {
    case "banner": {
      const notaExtra = [it.tubo !== "sin" ? `Tubo ${it.tubo}` : "", it.bastidor ? "Bastidor de madera" : ""].filter(Boolean).join(", ");
      return { ...it, sub, unidad: "m²", medidas: true, ancho: rollW(it.ancho), alto: rollH(it.alto),
               nota: [it.nota, notaExtra].filter(Boolean).join(" · ") };
    }
    case "vinil":
      return { ...it, sub, unidad: "m lineal", medidas: false,
               mat: it.mat + (it.base !== "Sin base" ? ` + ${it.base}` : ""),
               precio: it.precio + it.precioBase };
    case "uvdtf":
      return { ...it, sub, unidad: it.medida !== "custom" ? it.medida : "m lineal", medidas: false, mat: "UV DTF 28cm" };
    case "vinilCorte":
      return { ...it, sub, unidad: "m lineal", medidas: false };
    case "caballete":
    case "parante":
    case "offset":
      return { ...it, sub, unidad: "unidad", medidas: false, mat: it.opcion };
    case "imantado":
      return { ...it, sub, medidas: false,
               unidad: it.modo === "pack" ? `pack ${it.opcion}und` : "m lineal",
               mat: it.modo === "pack" ? `Pack ${it.opcion} unidades` : `Rollo ${it.anchoFijo * 100}cm` };
    case "letrero":
      return { ...it, sub, unidad: "m lineal", medidas: false, ancho: Math.ceil(+it.ancho) };
    case "cartas":
      return { ...it, sub, unidad: "unidad", medidas: false, mat: it.tipo_carta };
    case "merchandising": {
      const pr = it.productos?.find(p => p.nombre === it.producto_merch);
      return { ...it, sub, unidad: pr?.unidad ?? "unidad", medidas: false, mat: it.producto_merch };
    }
    default:
      return { ...it, sub };
  }
}

// ── Redondear a 1 decimal al salir del campo ────────────────────────────────
const r1 = (v, min = 0.1) => Math.max(min, Math.round(+v * 10) / 10) || min;

// ── Campos del formulario por tipo ──────────────────────────────────────────
const TUBOS_OPT = [
  { id: "sin", lbl: "Sin tubo",  precio: 0 },
  { id: "1m",  lbl: "Tubo 1m",  precio: 5 },
  { id: "1.5m",lbl: "Tubo 1.5m",precio: 10 },
];

function CamposBanner({ item, upd, updM }) {
  const aw = rollW(item.ancho), ah = rollH(item.alto);
  return (
    <>
      <div className="fg">
        <label className="lb">Material</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.mats.map(m => (
            <div key={m.nombre} className={`mc${item.mat === m.nombre ? " on" : ""}`}
              style={{ flex: 1, minWidth: 140 }}
              onClick={() => updM(item.key, { mat: m.nombre, precio: m.precio, precioBastidor: m.precio * 2 })}>
              <div className="mc-l" style={{ fontWeight: 600 }}>{m.nombre}</div>
              <div style={{ fontSize: ".65rem", color: "var(--cyan)", fontFamily: "var(--m)", marginTop: 2 }}>{fM(m.precio)}/m²</div>
            </div>
          ))}
        </div>
      </div>
      <div className="fg">
        <label className="lb">Tubo</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TUBOS_OPT.map(t => (
            <div key={t.id} className={`mc${item.tubo === t.id ? " on" : ""}`}
              style={{ flex: 1, minWidth: 90 }}
              onClick={() => updM(item.key, { tubo: t.id, precioTubo: t.precio })}>
              <div className="mc-l" style={{ fontWeight: 600 }}>{t.lbl}</div>
              {t.precio > 0 && <div style={{ fontSize: ".65rem", color: "var(--ye)", fontFamily: "var(--m)", marginTop: 2 }}>+{fM(t.precio)}/und</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="fg">
        <label className="lb">Bastidor de madera</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className={`mc${item.bastidor ? " on" : ""}`}
            style={{ flex: "0 0 auto", minWidth: 140 }}
            onClick={() => upd(item.key, "bastidor", !item.bastidor)}>
            <div className="mc-l" style={{ fontWeight: 600 }}>{item.bastidor ? "✓ Con bastidor" : "Sin bastidor"}</div>
            {!item.bastidor && <div style={{ fontSize: ".65rem", color: "var(--t3)", marginTop: 2 }}>costo extra por unidad</div>}
          </div>
          {item.bastidor && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <input className="inp inpsm" type="number" min={0} step={0.5}
                value={item.precioBastidor}
                onChange={e => upd(item.key, "precioBastidor", parseFloat(e.target.value) || 0)}
                style={{ maxWidth: 120 }} />
              <div className="fxs td">Precio extra bastidor/und</div>
            </div>
          )}
        </div>
      </div>
      <div className="fr fr4" style={{ gap: 10 }}>
        <div className="fg">
          <label className="lb">Ancho real (m)</label>
          <input className="inp inpsm" type="number" min={0.1} step={0.1} value={item.ancho}
            onChange={e => upd(item.key, "ancho", e.target.value)}
            onBlur={e => upd(item.key, "ancho", r1(e.target.value))} />
        </div>
        <div className="fg">
          <label className="lb">Alto real (m)</label>
          <input className="inp inpsm" type="number" min={0.1} step={0.1} value={item.alto}
            onChange={e => upd(item.key, "alto", e.target.value)}
            onBlur={e => upd(item.key, "alto", r1(e.target.value))} />
        </div>
        <div className="fg">
          <label className="lb">Cantidad</label>
          <input className="inp inpsm" type="number" min={1} value={item.cantidad}
            onChange={e => upd(item.key, "cantidad", e.target.value)} />
        </div>
        <div className="fg">
          <label className="lb">Rollo a imprimir</label>
          <div style={{ padding: "6px 11px", background: "var(--cyan-d)", border: "1px solid rgba(0,229,204,.25)", borderRadius: "var(--rs)", fontFamily: "var(--m)", fontSize: ".82rem", color: "var(--cyan)", fontWeight: 700 }}>
            {aw}m × {ah}m
          </div>
        </div>
      </div>
      {item.acabados.length > 0 && (
        <div className="fg">
          <label className="lb">Acabado</label>
          <select className="inp inpsm" value={item.acabado} onChange={e => upd(item.key, "acabado", e.target.value)}>
            {item.acabados.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      )}
    </>
  );
}

function CamposVinil({ item, upd, updM }) {
  return (
    <>
      <div className="fg">
        <label className="lb">Tipo de Vinil</label>
        <div style={{ display: "flex", gap: 8 }}>
          {item.mats.map(m => (
            <div key={m.nombre} className={`mc${item.mat === m.nombre ? " on" : ""}`}
              style={{ flex: 1 }}
              onClick={() => updM(item.key, { mat: m.nombre, precio: m.precio })}>
              <div className="mc-l" style={{ fontWeight: 600 }}>{m.nombre}</div>
              <div style={{ fontSize: ".65rem", color: "var(--cyan)", fontFamily: "var(--m)", marginTop: 2 }}>{fM(m.precio)}/m lineal</div>
            </div>
          ))}
        </div>
      </div>
      <div className="fg">
        <label className="lb">Base adicional</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.bases.map(b => (
            <div key={b.nombre} className={`mc${item.base === b.nombre ? " on" : ""}`}
              style={{ flex: 1, minWidth: 110 }}
              onClick={() => updM(item.key, { base: b.nombre, precioBase: b.precio })}>
              <div className="mc-l" style={{ fontWeight: 600 }}>{b.nombre}</div>
              {b.precio > 0 && <div style={{ fontSize: ".65rem", color: "var(--ye)", fontFamily: "var(--m)", marginTop: 2 }}>+{fM(b.precio)}/m</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="fr fr3" style={{ gap: 10 }}>
        <div className="fg">
          <label className="lb">Ancho (fijo)</label>
          <div style={{ padding: "6px 11px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--rs)", fontFamily: "var(--m)", fontSize: ".82rem", color: "var(--t2)" }}>
            {item.anchoFijo}m
          </div>
        </div>
        <div className="fg">
          <label className="lb">Metros lineales</label>
          <input className="inp inpsm" type="number" min={0.1} step={0.1} value={item.metros}
            onChange={e => upd(item.key, "metros", e.target.value)}
            onBlur={e => upd(item.key, "metros", r1(e.target.value))} />
        </div>
        <div className="fg">
          <label className="lb">Cantidad</label>
          <input className="inp inpsm" type="number" min={1} value={item.cantidad}
            onChange={e => upd(item.key, "cantidad", e.target.value)} />
        </div>
      </div>
    </>
  );
}

function CamposUvDtf({ item, upd, updM }) {
  return (
    <>
      <div className="fg">
        <label className="lb">Medida</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "A4",    lbl: "A4",         sub: "S/ 20 — fijo" },
            { id: "0.5m",  lbl: "½ metro",    sub: "S/ 30 — fijo" },
            { id: "custom",lbl: "Personalizado", sub: "S/45/m · >3m: S/35/m" },
          ].map(o => (
            <div key={o.id} className={`mc${item.medida === o.id ? " on" : ""}`}
              style={{ flex: 1, minWidth: 110 }}
              onClick={() => updM(item.key, { medida: o.id })}>
              <div className="mc-l" style={{ fontWeight: 700 }}>{o.lbl}</div>
              <div style={{ fontSize: ".62rem", color: "var(--t3)", marginTop: 3 }}>{o.sub}</div>
            </div>
          ))}
        </div>
      </div>
      {item.medida === "custom" && (
        <div className="fr fr2" style={{ gap: 10 }}>
          <div className="fg">
            <label className="lb">Ancho (fijo)</label>
            <div style={{ padding: "6px 11px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--rs)", fontFamily: "var(--m)", fontSize: ".82rem", color: "var(--t2)" }}>
              {item.anchoFijo * 100}cm
            </div>
          </div>
          <div className="fg">
            <label className="lb">Largo (metros)</label>
            <input className="inp inpsm" type="number" min={0.5} step={0.1} value={item.metros}
              onChange={e => upd(item.key, "metros", e.target.value)}
              onBlur={e => upd(item.key, "metros", r1(e.target.value, 0.5))} />
          </div>
        </div>
      )}
      <div className="fg">
        <label className="lb">Cantidad</label>
        <input className="inp inpsm" type="number" min={1} value={item.cantidad} style={{ maxWidth: 100 }}
          onChange={e => upd(item.key, "cantidad", e.target.value)} />
      </div>
    </>
  );
}

function CamposVinilCorte({ item, upd }) {
  return (
    <>
      <div className="fg">
        <label className="lb">Color / Material</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.mats.map(m => (
            <div key={m} className={`mc${item.mat === m ? " on" : ""}`}
              style={{ flex: 1, minWidth: 90 }}
              onClick={() => upd(item.key, "mat", m)}>
              <div className="mc-l">{m}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="fr fr3" style={{ gap: 10 }}>
        <div className="fg">
          <label className="lb">Ancho (fijo)</label>
          <div style={{ padding: "6px 11px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--rs)", fontFamily: "var(--m)", fontSize: ".82rem", color: "var(--t2)" }}>
            {item.anchoFijo * 100}cm
          </div>
        </div>
        <div className="fg">
          <label className="lb">Largo (m) — mín. 20cm</label>
          <input className="inp inpsm" type="number" min={0.20} step={0.1} value={item.metros}
            onChange={e => upd(item.key, "metros", e.target.value)}
            onBlur={e => upd(item.key, "metros", r1(e.target.value, 0.2))} />
          <div className="fxs td mt1">Primeros 20cm = S/20 · Resto: S/50/m</div>
        </div>
        <div className="fg">
          <label className="lb">Cantidad</label>
          <input className="inp inpsm" type="number" min={1} value={item.cantidad}
            onChange={e => upd(item.key, "cantidad", e.target.value)} />
        </div>
      </div>
    </>
  );
}

function CamposOpcion({ item, upd, updM, label }) {
  return (
    <>
      <div className="fg">
        <label className="lb">{label}</label>
        <select className="inp inpsm" value={item.opcion}
          onChange={e => {
            const o = item.opciones.find(o => o.nombre === e.target.value);
            if (o) updM(item.key, { opcion: o.nombre, precio: o.precio });
          }}>
          {item.opciones.map(o => (
            <option key={o.nombre} value={o.nombre}>{o.nombre} — {fM(o.precio)}</option>
          ))}
        </select>
      </div>
      <div className="fg">
        <label className="lb">Cantidad</label>
        <input className="inp inpsm" type="number" min={1} value={item.cantidad} style={{ maxWidth: 100 }}
          onChange={e => upd(item.key, "cantidad", e.target.value)} />
      </div>
    </>
  );
}

function CamposImantado({ item, upd, updM }) {
  return (
    <>
      <div className="fg">
        <label className="lb">Modo</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "pack",   lbl: "Pack estándar",  sub: "tamaño tarjeta personal" },
            { id: "custom", lbl: "Personalizado",   sub: `rollo ${item.anchoFijo * 100}cm · S/45/m lineal` },
          ].map(o => (
            <div key={o.id} className={`mc${item.modo === o.id ? " on" : ""}`}
              style={{ flex: 1 }}
              onClick={() => updM(item.key, { modo: o.id })}>
              <div className="mc-l" style={{ fontWeight: 700 }}>{o.lbl}</div>
              <div style={{ fontSize: ".62rem", color: "var(--t3)", marginTop: 3 }}>{o.sub}</div>
            </div>
          ))}
        </div>
      </div>
      {item.modo === "pack" ? (
        <>
          <div className="fg">
            <label className="lb">Pack</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {item.packs.map(p => (
                <div key={p.und} className={`mc${item.opcion === p.und ? " on" : ""}`}
                  style={{ flex: 1, minWidth: 80 }}
                  onClick={() => updM(item.key, { opcion: p.und, precio: p.precio })}>
                  <div className="mc-l" style={{ fontWeight: 700 }}>{p.und} und</div>
                  <div style={{ fontSize: ".65rem", color: "var(--cyan)", fontFamily: "var(--m)", marginTop: 2 }}>{fM(p.precio)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fg">
            <label className="lb">Cantidad de packs</label>
            <input className="inp inpsm" type="number" min={1} value={item.cantidad} style={{ maxWidth: 100 }}
              onChange={e => upd(item.key, "cantidad", e.target.value)} />
          </div>
        </>
      ) : (
        <div className="fr fr2" style={{ gap: 10 }}>
          <div className="fg">
            <label className="lb">Metros lineales</label>
            <input className="inp inpsm" type="number" min={0.1} step={0.1} value={item.metros}
              onChange={e => upd(item.key, "metros", e.target.value)}
              onBlur={e => upd(item.key, "metros", r1(e.target.value))} />
          </div>
          <div className="fg">
            <label className="lb">Cantidad</label>
            <input className="inp inpsm" type="number" min={1} value={item.cantidad}
              onChange={e => upd(item.key, "cantidad", e.target.value)} />
          </div>
        </div>
      )}
    </>
  );
}

function CamposLetrero({ item, upd }) {
  const anchoCeil = Math.ceil(+item.ancho);
  return (
    <>
      <div className="fr fr3" style={{ gap: 10 }}>
        <div className="fg">
          <label className="lb">Ancho real (m)</label>
          <input className="inp inpsm" type="number" min={0.1} step={0.1} value={item.ancho}
            onChange={e => upd(item.key, "ancho", e.target.value)}
            onBlur={e => upd(item.key, "ancho", r1(e.target.value))} />
        </div>
        <div className="fg">
          <label className="lb">Alto (m) — máx {item.alturaMax}m</label>
          <input className="inp inpsm" type="number" min={0.1} step={0.1} max={item.alturaMax} value={item.alto}
            onChange={e => upd(item.key, "alto", e.target.value)}
            onBlur={e => upd(item.key, "alto", r1(e.target.value))} />
        </div>
        <div className="fg">
          <label className="lb">Cantidad</label>
          <input className="inp inpsm" type="number" min={1} value={item.cantidad}
            onChange={e => upd(item.key, "cantidad", e.target.value)} />
        </div>
      </div>
      <div className="fxs td mt1">Ancho a cobrar: {anchoCeil}m (redondeado al metro superior) · S/300/m lineal</div>
    </>
  );
}

function CamposCartas({ item, upd, updM }) {
  const tipo = item.tipos?.find(t => t.nombre === item.tipo_carta);
  const qty = +item.cantidad;
  const pe = tipo ? [...tipo.precios].reverse().find(p => qty >= p.desde) : null;
  const precioUnit = pe?.precio ?? tipo?.precios[0].precio ?? 0;
  return (
    <>
      <div className="fg">
        <label className="lb">Tipo</label>
        <div style={{ display: "flex", gap: 8 }}>
          {item.tipos.map(t => (
            <div key={t.nombre} className={`mc${item.tipo_carta === t.nombre ? " on" : ""}`}
              style={{ flex: 1 }}
              onClick={() => updM(item.key, { tipo_carta: t.nombre, precio: t.precios[0].precio })}>
              <div className="mc-l" style={{ fontWeight: 600 }}>{t.nombre}</div>
              <div style={{ fontSize: ".62rem", color: "var(--t3)", marginTop: 3 }}>
                {t.precios.map(p => `${p.desde}+: ${fM(p.precio)}`).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fr fr2" style={{ gap: 10 }}>
        <div className="fg">
          <label className="lb">Cantidad</label>
          <input className="inp inpsm" type="number" min={1} value={item.cantidad}
            onChange={e => upd(item.key, "cantidad", e.target.value)} />
          <div className="fxs td mt1">Precio actual: {fM(precioUnit)}/und</div>
        </div>
      </div>
    </>
  );
}

function CamposMerchandising({ item, upd, updM }) {
  const prod = item.productos?.find(p => p.nombre === item.producto_merch);
  const qty = +item.cantidad;
  const esCiento = prod?.unidad === "ciento";
  const cientos = esCiento ? Math.ceil(qty / 100) : 0;
  const pe = prod ? [...prod.precios].reverse().find(p => (esCiento ? cientos * 100 : qty) >= p.desde) : null;
  const precioUnit = pe?.precio ?? prod?.precios[0].precio ?? 0;
  return (
    <>
      <div className="fg">
        <label className="lb">Producto</label>
        <div style={{ display: "flex", gap: 8 }}>
          {item.productos.map(p => (
            <div key={p.nombre} className={`mc${item.producto_merch === p.nombre ? " on" : ""}`}
              style={{ flex: 1 }}
              onClick={() => updM(item.key, { producto_merch: p.nombre, cantidad: p.unidad === "ciento" ? 100 : 1 })}>
              <div className="mc-l" style={{ fontWeight: 600 }}>{p.nombre}</div>
              <div style={{ fontSize: ".62rem", color: "var(--t3)", marginTop: 3 }}>
                {p.precios.map(pr => `${pr.desde}+ ${p.unidad === "ciento" ? "und" : p.unidad}: ${fM(pr.precio)}/${p.unidad}`).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fg">
        <label className="lb">Cantidad{esCiento ? " (unidades)" : ""}</label>
        <input className="inp inpsm" type="number" min={esCiento ? 100 : 1} step={esCiento ? 100 : 1} value={item.cantidad} style={{ maxWidth: 120 }}
          onChange={e => upd(item.key, "cantidad", e.target.value)} />
        {esCiento && <div className="fxs td mt1">{cientos} ciento{cientos !== 1 ? "s" : ""} · {fM(precioUnit)}/ciento</div>}
        {!esCiento && <div className="fxs td mt1">{fM(precioUnit)}/und</div>}
      </div>
    </>
  );
}

function CamposGenerico({ item, upd }) {
  return (
    <>
      <div className="fr fr4" style={{ gap: 10 }}>
        {item.medidas && <>
          <div className="fg"><label className="lb">Ancho (m)</label><input className="inp inpsm" type="number" min={0.1} step={0.1} value={item.ancho} onChange={e => upd(item.key, "ancho", e.target.value)} onBlur={e => upd(item.key, "ancho", r1(e.target.value))} /></div>
          <div className="fg"><label className="lb">Alto (m)</label><input className="inp inpsm" type="number" min={0.1} step={0.1} value={item.alto} onChange={e => upd(item.key, "alto", e.target.value)} onBlur={e => upd(item.key, "alto", r1(e.target.value))} /></div>
        </>}
        <div className="fg"><label className="lb">Cantidad</label><input className="inp inpsm" type="number" min={1} value={item.cantidad} onChange={e => upd(item.key, "cantidad", e.target.value)} /></div>
        <div className="fg"><label className="lb">Precio/{item.unidad}</label><input className="inp inpsm" type="number" min={0} step={0.5} value={item.precio} onChange={e => upd(item.key, "precio", e.target.value)} /></div>
      </div>
      {item.mats.length > 0 && (
        <div className="fr fr2" style={{ gap: 10 }}>
          <div className="fg">
            <label className="lb">Material / Tipo</label>
            <select className="inp inpsm" value={item.mat} onChange={e => upd(item.key, "mat", e.target.value)}>
              {item.mats.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          {item.acabados.length > 0 && (
            <div className="fg">
              <label className="lb">Acabado</label>
              <select className="inp inpsm" value={item.acabado} onChange={e => upd(item.key, "acabado", e.target.value)}>
                {item.acabados.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── Resumen de precio en el item ─────────────────────────────────────────────
function ResumenPrecio({ item }) {
  const sub = calcSub(item);
  switch (item.tipo) {
    case "banner": {
      const aw = rollW(item.ancho), ah = rollH(item.alto);
      const tuboTxt = item.precioTubo > 0 ? ` + tubo ${fM(item.precioTubo)}×${item.cantidad}` : "";
      const bastidorTxt = item.bastidor && item.precioBastidor > 0 ? ` + bastidor ${fM(item.precioBastidor)}×${item.cantidad}` : "";
      return <><span className="td fxs">{aw}m × {ah}m × {item.cantidad} × {fM(item.precio)}/m²{bastidorTxt}{tuboTxt} = </span>{fM(sub)}</>;
    }
    case "vinil":
      return <><span className="td fxs">{item.metros}m × {item.cantidad} × {fM(item.precio + item.precioBase)}/m = </span>{fM(sub)}</>;
    case "uvdtf":
      if (item.medida === "A4")   return <><span className="td fxs">A4 × {item.cantidad} = </span>{fM(sub)}</>;
      if (item.medida === "0.5m") return <><span className="td fxs">½m × {item.cantidad} = </span>{fM(sub)}</>;
      return <><span className="td fxs">{item.metros}m × {item.cantidad} = </span>{fM(sub)}</>;
    case "vinilCorte":
      return <><span className="td fxs">{(+item.metros * 100).toFixed(0)}cm × {item.cantidad} = </span>{fM(sub)}</>;
    case "caballete":
    case "parante":
    case "offset":
      return <><span className="td fxs">{fM(item.precio)} × {item.cantidad} = </span>{fM(sub)}</>;
    case "imantado":
      if (item.modo === "pack")
        return <><span className="td fxs">Pack {item.opcion}und × {item.cantidad} = </span>{fM(sub)}</>;
      return <><span className="td fxs">{item.metros}m × {item.cantidad} × S/45/m = </span>{fM(sub)}</>;
    case "letrero":
      return <><span className="td fxs">{Math.ceil(+item.ancho)}m × {item.cantidad} × S/300/m = </span>{fM(sub)}</>;
    case "cartas": {
      const tp = item.tipos?.find(t => t.nombre === item.tipo_carta);
      const qty = +item.cantidad;
      const pe = tp ? [...tp.precios].reverse().find(p => qty >= p.desde) : null;
      const pu = pe?.precio ?? tp?.precios[0].precio ?? 0;
      return <><span className="td fxs">{qty} und × {fM(pu)} = </span>{fM(sub)}</>;
    }
    case "merchandising": {
      const pr = item.productos?.find(p => p.nombre === item.producto_merch);
      const qty = +item.cantidad;
      const esCiento = pr?.unidad === "ciento";
      const cientos = esCiento ? Math.ceil(qty / 100) : 0;
      const pe = pr ? [...pr.precios].reverse().find(p => (esCiento ? cientos * 100 : qty) >= p.desde) : null;
      const pu = pe?.precio ?? pr?.precios[0].precio ?? 0;
      return esCiento
        ? <><span className="td fxs">{cientos} ciento{cientos !== 1 ? "s" : ""} × {fM(pu)}/ciento = </span>{fM(sub)}</>
        : <><span className="td fxs">{qty} und × {fM(pu)} = </span>{fM(sub)}</>;
    }
    default:
      return item.medidas
        ? <><span className="td fxs">{item.ancho}m × {item.alto}m × {item.cantidad} × {fM(item.precio)} = </span>{fM(sub)}</>
        : fM(sub);
  }
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Cotizador({ catalogo, pedidos, setPedidos, setPag, tienda, draft, setDraft }) {
  const { cliente, tel, items, igv, catAct } = draft;
  const setCliente = v  => setDraft(d => ({ ...d, cliente: v }));
  const setTel     = v  => setDraft(d => ({ ...d, tel: v }));
  const setItems   = fn => setDraft(d => ({ ...d, items: typeof fn === "function" ? fn(d.items) : fn }));
  const setIgv     = v  => setDraft(d => ({ ...d, igv: v }));
  const setCatAct  = v  => setDraft(d => ({ ...d, catAct: v }));

  const [saved, setSaved] = useState(null);
  const [pdfMd, setPdfMd] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cats = ["Todos", ...new Set(catalogo.map(c => c.cat))];
  const prods = catalogo.filter(p => catAct === "Todos" || p.cat === catAct);

  const add  = (prod) => setItems(prev => [initItem(prod), ...prev]);
  const upd  = (key, f, v) => setItems(prev => prev.map(i => i.key === key ? { ...i, [f]: v } : i));
  const updM = (key, obj) => setItems(prev => prev.map(i => i.key === key ? { ...i, ...obj } : i));
  const rem  = (key) => setItems(prev => prev.filter(i => i.key !== key));

  const subtotal = items.reduce((a, i) => a + calcSub(i), 0);
  const igvMonto = igv ? subtotal * IGV : 0;
  const total    = subtotal + igvMonto;

  const guardar = async () => {
    if (!cliente.trim()) { alert("Ingresa el nombre del cliente"); return; }
    if (!items.length)   { alert("Agrega al menos un producto"); return; }
    setGuardando(true);

    const tid = tienda || 'tienda1';
    const { count } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('tienda_id', tid);
    const codigo = `CTX-${String((count || 0) + 1).padStart(5, '0')}`;

    const ped = {
      codigo, cliente: cliente.trim(), tel,
      items: items.map(forSave),
      subtotal, igv: igvMonto, total, con_igv: igv,
      estado: "PENDIENTE", fecha: new Date().toISOString(),
      tienda_id: tid,
    };
    const { data, error } = await supabase.from('pedidos').insert(ped).select().single();
    setGuardando(false);
    if (error) { alert("Error al guardar: " + error.message); return; }
    setPedidos(prev => [data, ...prev]);
    setSaved(data);
    setDraft({ cliente: "", tel: "", items: [], igv: false, catAct: "Todos" });
  };

  const whatsapp = (ped) => {
    const txt = `◈ *CREATRIX — Cotización*\n\n👤 Cliente: ${ped.cliente}\n🔖 Código: ${ped.codigo}\n\n${ped.items.map(i => `• ${i.nombre}${i.medidas ? ` (${i.ancho}×${i.alto}m)` : ""} ×${i.cantidad}: ${fM(i.sub)}`).join("\n")}\n\n${ped.con_igv ? `Subtotal: ${fM(ped.subtotal)}\nIGV 18%: ${fM(ped.igv)}\n` : ""}_TOTAL: *${fM(ped.total)}*_\n\nEstado: 🔴 PENDIENTE`;
    window.open(`https://wa.me/${ped.tel.replace(/\D/g, "")}?text=${encodeURIComponent(txt)}`, "_blank");
  };

  const renderCampos = (item) => {
    switch (item.tipo) {
      case "banner":     return <CamposBanner     item={item} upd={upd} updM={updM} />;
      case "vinil":      return <CamposVinil       item={item} upd={upd} updM={updM} />;
      case "uvdtf":      return <CamposUvDtf       item={item} upd={upd} updM={updM} />;
      case "vinilCorte": return <CamposVinilCorte  item={item} upd={upd} />;
      case "caballete":     return <CamposOpcion        item={item} upd={upd} updM={updM} label="Modelo" />;
      case "parante":       return <CamposOpcion        item={item} upd={upd} updM={updM} label="Modelo" />;
      case "offset":        return <CamposOpcion        item={item} upd={upd} updM={updM} label="Producto" />;
      case "imantado":      return <CamposImantado      item={item} upd={upd} updM={updM} />;
      case "letrero":       return <CamposLetrero        item={item} upd={upd} />;
      case "cartas":        return <CamposCartas         item={item} upd={upd} updM={updM} />;
      case "merchandising": return <CamposMerchandising  item={item} upd={upd} updM={updM} />;
      default:              return <CamposGenerico        item={item} upd={upd} />;
    }
  };

  return (
    <div className="pg">
      <div className="pg-hd">
        <div><h2 className="gt-cyan">🧮 Nuevo Pedido</h2><p>Genera una cotización y conviértela en pedido</p></div>
        <div className="igvsw">
          <button className={`igvb${!igv ? " on" : ""}`} onClick={() => setIgv(false)}>Sin IGV</button>
          <button className={`igvb${igv  ? " on" : ""}`} onClick={() => setIgv(true)}>Con IGV 18%</button>
        </div>
      </div>
      <div className="glow-line" />

      {saved && (
        <div style={{ background: "var(--gr-d)", border: "1.5px solid rgba(34,211,160,.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
          <div className="fb">
            <div className="r g2">
              <span>✅</span>
              <span className="fw7 fsm">Pedido guardado:</span>
              <span className="code">{saved.codigo}</span>
              <span className="mo tgr fw7">{fM(saved.total)}</span>
            </div>
            <div className="r g2">
              <button className="btn bs bsm" onClick={() => whatsapp(saved)}>📲 WhatsApp</button>
              <button className="btn bb bsm" onClick={() => setPdfMd(true)}>🖨️ PDF</button>
              <button className="btn bg bsm" onClick={() => setPag("pedidos")}>Ver Pedidos →</button>
              <button className="cx" onClick={() => setSaved(null)}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Cliente */}
      <div className="card mb3">
        <div className="cb">
          <div className="ctit">Datos del Cliente</div>
          <div className="fr fr2">
            <div className="fg"><label className="lb">Nombre / Empresa</label><input className="inp" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej: Restaurante Lima" /></div>
            <div className="fg"><label className="lb">Teléfono / WhatsApp</label><input className="inp" value={tel} onChange={e => setTel(e.target.value)} placeholder="9XXXXXXXX" /></div>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <div className="card mb3">
        <div className="cb">
          <div className="fb mb3">
            <div className="ctit" style={{ margin: 0 }}>Seleccionar Producto</div>
            <div className="r g2" style={{ flexWrap: "wrap" }}>
              {cats.map(c => <button key={c} className={`btn bsm ${catAct === c ? "bp" : "bg"}`} onClick={() => setCatAct(c)}>{c}</button>)}
            </div>
          </div>
          <div className="cc">
            {prods.map(prod => (
              <div key={prod.id} className="cpc" onClick={() => add(prod)}>
                <span className="cpc-i">{prod.icon}</span>
                <div className="cpc-n">{prod.nombre}</div>
                <div className="cpc-p">desde {fM(prod.precio)}/{prod.unidad}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items seleccionados */}
      {items.length > 0 && (
        <div className="card mb3">
          <div className="cb">
            <div className="ctit">Detalle — {items.length} item{items.length !== 1 ? "s" : ""}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(item => (
                <div key={item.key} className="ci">
                  <div className="ci-hd">
                    <div className="ci-n">
                      <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                      <span>{item.nombre}</span>
                    </div>
                    <button className="btn bd bic bsm" onClick={() => rem(item.key)}>✕</button>
                  </div>
                  {renderCampos(item)}
                  <div className="fg mt1">
                    <label className="lb">Nota / Indicación</label>
                    <input className="inp inpsm" value={item.nota} placeholder="Observaciones, color, diseño..." onChange={e => upd(item.key, "nota", e.target.value)} />
                  </div>
                  <div className="ci-sp"><ResumenPrecio item={item} /></div>
                  {tienda === 'tienda3' && (() => {
                    const costo = calcCosto(item);
                    if (costo === null) return null;
                    const ganancia = calcSub(item) - costo;
                    return (
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6,padding:'6px 10px',background:'rgba(34,211,160,.07)',borderRadius:8,border:'1px solid rgba(34,211,160,.15)'}}>
                        <span style={{fontSize:'.68rem',color:'var(--t3)'}}>Costo proveedor: <span style={{fontFamily:'var(--m)',color:'var(--t2)'}}>{fM(costo)}</span></span>
                        <span style={{fontSize:'.75rem',fontFamily:'var(--m)',fontWeight:700,color:'var(--gr)'}}>Ganancia: {fM(ganancia)}</span>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="ctb mt3">
              {igv && <>
                <div className="fb mb2"><span className="fsm tm">Subtotal sin IGV</span><span className="mo fw7">{fM(subtotal)}</span></div>
                <div className="fb mb2"><span className="fsm tm">IGV 18%</span><span className="mo fw7">{fM(igvMonto)}</span></div>
                <div className="sep mb2" />
              </>}
              <div className="fb">
                <span className="fw8 gt-cyan" style={{ fontSize: "1rem" }}>TOTAL {igv ? "CON IGV" : ""}</span>
                <span className="mo fw8 tc" style={{ fontSize: "1.2rem" }}>{fM(total)}</span>
              </div>
            </div>

            <div className="r g2 mt3 je">
              <button className="btn bg" onClick={() => setDraft(d => ({ ...d, items: [], cliente: "", tel: "" }))}>🗑 Limpiar</button>
              <button className="btn bp blg" onClick={guardar} disabled={guardando}>{guardando?"Guardando…":"💾 Guardar Pedido"}</button>
            </div>
          </div>
        </div>
      )}

      {pdfMd && saved && <ModalPdf pedido={saved} pagos={[]} onClose={() => setPdfMd(false)} />}
    </div>
  );
}
