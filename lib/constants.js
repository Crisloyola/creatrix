export const USUARIOS = [
  { user: "admin",  pass: "1234",   nombre: "Administrador", rol: "admin"    },
  { user: "ventas", pass: "ventas", nombre: "Vendedor",      rol: "vendedor" },
];

export const IGV = 0.18;

export const CATALOGO = [
  {
    id: 1, nombre: "Banner", tipo: "banner",
    icon: "🖼️", cat: "Gran Formato", unidad: "m²", precio: 15,
    rollos: [1, 1.5, 2, 3],
    mats: [
      { nombre: "Banner 8 onzas",          precio: 15 },
      { nombre: "Banner 13 onzas Black Out",precio: 20 },
    ],
    acabados: ["Sin acabado", "Con ojales", "Con dobladillo", "Ojales y dobladillo"],
  },
  {
    id: 2, nombre: "Vinil Adhesivo", tipo: "vinil",
    icon: "📋", cat: "Gran Formato", unidad: "m lineal", precio: 35,
    anchoFijo: 1.48,
    mats: [
      { nombre: "Vinil normal",   precio: 35 },
      { nombre: "Vinil laminado", precio: 50 },
    ],
    bases: [
      { nombre: "Sin base",       precio: 0  },
      { nombre: "Con base FOAM",  precio: 20 },
      { nombre: "Con base CELTEX",precio: 30 },
    ],
  },
  {
    id: 3, nombre: "UV DTF", tipo: "uvdtf",
    icon: "✨", cat: "Especial", unidad: "m lineal", precio: 45,
    anchoFijo: 0.28,
  },
  {
    id: 4, nombre: "Vinil de Corte", tipo: "vinilCorte",
    icon: "✂️", cat: "Gran Formato", unidad: "m lineal", precio: 50,
    anchoFijo: 0.58,
    mats: ["Dorado", "Plateado", "Blanco", "De colores"],
  },
  {
    id: 5, nombre: "Caballete", tipo: "caballete",
    icon: "🪧", cat: "Estructuras", unidad: "unidad", precio: 75,
    opciones: [
      { nombre: "Caballete 1.20×0.70m", precio: 75  },
      { nombre: "Caballete 1.50×0.80m", precio: 90  },
      { nombre: "Caballete 2.00×1.00m", precio: 120 },
    ],
  },
  {
    id: 6, nombre: "Parante / Roll Up", tipo: "parante",
    icon: "🗂️", cat: "Estructuras", unidad: "unidad", precio: 85,
    opciones: [
      { nombre: "Parante de fierro 2×1 + banner grueso",          precio: 85  },
      { nombre: "Roll Screen aluminio 2×1 + banner grueso",       precio: 120 },
      { nombre: "Parante tipo araña aluminio 2×1 + banner grueso",precio: 135 },
      { nombre: "Módulo de PVC + brandeo en vinil",               precio: 250 },
    ],
  },
  {
    id: 7, nombre: "Impresión Offset", tipo: "offset",
    icon: "🖨️", cat: "Offset", unidad: "paquete", precio: 80,
    opciones: [
      { nombre: "Tarjetas (millar)",               precio: 80  },
      { nombre: "Volantes A6 (millar)",            precio: 90  },
      { nombre: "Volantes A5 (millar)",            precio: 175 },
      { nombre: "Volantes A4 (millar)",            precio: 270 },
      { nombre: "Proformas / Notas A6 (millar)",   precio: 130 },
      { nombre: "Proformas / Notas A6 (4 millares)",precio: 320 },
    ],
  },
  {
    id: 8, nombre: "Imantado", tipo: "imantado",
    icon: "🧲", cat: "Especial", unidad: "unidad", precio: 90,
    packs: [
      { und: 100, precio: 90  },
      { und: 200, precio: 150 },
      { und: 300, precio: 200 },
      { und: 500, precio: 250 },
    ],
    anchoFijo: 0.60, precioLineal: 45,
  },
  {
    id: 9, nombre: "Letrero Luminoso", tipo: "letrero",
    icon: "💡", cat: "Letreros", unidad: "m lineal", precio: 300,
    alturaMax: 1.20, precioMetro: 300,
  },
  {
    id: 10, nombre: "Cartas / Menús", tipo: "cartas",
    icon: "📄", cat: "Offset", unidad: "unidad", precio: 15,
    tipos: [
      { nombre: "Enmicada",         precios: [{ desde: 1, precio: 15 }, { desde: 6, precio: 12 }, { desde: 12, precio: 10 }] },
      { nombre: "Vinil con Celtex", precios: [{ desde: 1, precio: 20 }, { desde: 6, precio: 15 }, { desde: 12, precio: 12 }] },
    ],
  },
  {
    id: 11, nombre: "Merchandising", tipo: "merchandising",
    icon: "🎁", cat: "Merchandising", unidad: "unidad", precio: 15,
    productos: [
      { nombre: "Taza cerámica",    unidad: "unidad", precios: [{ desde: 1, precio: 15 }, { desde: 6, precio: 12 }] },
      { nombre: "Lapicero impreso", unidad: "ciento", precios: [{ desde: 100, precio: 110 }, { desde: 300, precio: 90 }] },
    ],
  },
];
