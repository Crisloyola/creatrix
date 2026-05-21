'use client'

import { useState, useEffect } from "react";
import { CATALOGO } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Cotizador from "./Cotizador";
import Pedidos from "./Pedidos";
import Historial from "./Historial";
import Caja from "./Caja";
import CatalogoVista from "./CatalogoVista";
import PreciosEdit from "./PreciosEdit";
import Reportes from "./Reportes";
import Gastos from "./Gastos";

export default function App() {
  const [session, setSession] = useState(null);
  const [pag, setPag] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tema, setTema] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tema") || "dark";
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  const toggleTema = () => setTema(t => t === "dark" ? "light" : "dark");
  const [pedidos, setPedidos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [catalogo, setCatalogo] = useState(CATALOGO);
  const [productosCustom, setProductosCustom] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [histFiltros, setHistFiltros] = useState({ busq: "", desde: "", hasta: "" });
  const [cotDraft, setCotDraft] = useState({ cliente: "", tel: "", items: [], igv: false, catAct: "Todos", descuento: "" });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) cargarDatos(session);
      else setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) cargarDatos(session);
      else { setPedidos([]); setPagos([]); setCargando(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function cargarDatos(sess) {
    setCargando(true);
    const tienda = sess?.user?.user_metadata?.tienda || 'tienda1';
    const esAdmin = (sess?.user?.user_metadata?.rol || 'vendedor') === 'admin';
    const [{ data: peds }, { data: pays }, { data: prods }, { data: reps }, { data: gsts }] = await Promise.all([
      supabase.from('pedidos').select('*').eq('tienda_id', tienda).order('fecha', { ascending: false }),
      supabase.from('pagos').select('*').eq('tienda_id', tienda).order('fecha', { ascending: true }),
      supabase.from('productos_custom').select('*').eq('tienda_id', tienda).order('created_at', { ascending: true }),
      esAdmin
        ? supabase.from('reportes_semanales').select('*').eq('tienda_id', tienda).order('semana_inicio', { ascending: false })
        : Promise.resolve({ data: [] }),
      supabase.from('gastos').select('*').eq('tienda_id', tienda).order('fecha', { ascending: false }),
    ]);
    if (peds)  setPedidos(peds);
    if (pays)  setPagos(pays);
    if (prods) setProductosCustom(prods);
    if (reps)  setReportes(reps);
    if (gsts)  setGastos(gsts);
    setCargando(false);
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPedidos([]);
    setPagos([]);
  };

  if (cargando) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--bg)"}}>
      <div style={{textAlign:"center",color:"var(--t2)"}}>
        <div style={{fontSize:"2rem",marginBottom:12}}>◈</div>
        <div>Cargando…</div>
      </div>
    </div>
  );

  if (!session) return <Login onLogin={setSession} tema={tema} toggleTema={toggleTema}/>;

  const nombre = session.user?.user_metadata?.nombre || session.user?.email || "Usuario";
  const rol    = session.user?.user_metadata?.rol    || "vendedor";
  const tienda = session.user?.user_metadata?.tienda || "tienda1";
  const esLimitada = tienda === "tienda3";

  const pend = pedidos.filter(p => p.estado === "PENDIENTE").length;

  const catalogoCustom = productosCustom.map(p => ({
    id: p.id, nombre: p.nombre, tipo: "custom", icon: "📦",
    cat: "Personalizado", unidad: "unidad", precio: p.precio,
    medidas: false, mats: [], acabados: [], _esCustom: true,
  }));
  const catalogoCompleto = [...CATALOGO, ...catalogoCustom];

  const nav = esLimitada
    ? [
        { sec:"Tienda", items:[
          { id:"cotizador", i:"🧮", lbl:"Nuevo Pedido" },
          { id:"historial", i:"📋", lbl:"Historial"    },
          { id:"catalogo",  i:"🗂️", lbl:"Ver Catálogo" },
        ]},
      ]
    : [
        { sec:"Principal", items:[
          { id:"dashboard", i:"⬡",  lbl:"Dashboard"    },
          { id:"cotizador", i:"🧮", lbl:"Nuevo Pedido"  },
        ]},
        { sec:"Gestión", items:[
          { id:"pedidos",   i:"📦", lbl:"Pedidos",  bx:pend||null },
          { id:"historial", i:"📋", lbl:"Historial" },
          { id:"caja",      i:"💰", lbl:"Caja"      },
          { id:"gastos",    i:"🧾", lbl:"Gastos"    },
          ...(rol==="admin" ? [{ id:"reportes", i:"📊", lbl:"Reportes" }] : []),
        ]},
        { sec:"Catálogo", items:[
          { id:"catalogo", i:"🗂️", lbl:"Ver Catálogo" },
          ...(rol==="admin" ? [{ id:"precios", i:"⚙️", lbl:"Gestión Precios" }] : []),
        ]},
      ];

  // Si tienda3 aterriza en una página que no tiene acceso, redirigir
  const pagActual = esLimitada && !["cotizador","historial","catalogo"].includes(pag)
    ? "cotizador"
    : pag;

  const allItems  = nav.flatMap(s => s.items);
  const navLabel  = allItems.find(i => i.id === pagActual)?.lbl || "";
  const cerrarMenu = () => setMenuOpen(false);
  const navegarA   = (id) => { setPag(id); cerrarMenu(); };

  return (
    <div className="root">
      <div className="mob-hd">
        <button className="mob-ham" onClick={()=>setMenuOpen(o=>!o)}>☰</button>
        <span className="mob-brand">creatrix</span>
        <span className="mob-pg">{navLabel}</span>
      </div>

      <div className={`sb-backdrop${menuOpen?" open":""}`} onClick={cerrarMenu}/>

      <aside className={`sb${menuOpen?" open":""}`}>
        <div className="sb-logo">
          <img src={tema === "light" ? "/logooscuro.png" : "/logo.png"} alt="Logo" style={{height:44,objectFit:"contain",display:"block",margin:"0 auto 6px"}}/>
          <div className="sb-tagline" style={{textAlign:"center"}}>{tienda === "tienda3" ? "Tienda 3" : tienda === "tienda2" ? "Tienda 2" : "Tienda 1"}</div>
        </div>

        {nav.map(sec => (
          <div key={sec.sec}>
            <div className="sb-sec">{sec.sec}</div>
            <div className="sb-nav">
              {sec.items.map(item => (
                <div key={item.id} className={`sb-item${pagActual===item.id?" on":""}`} onClick={()=>navegarA(item.id)}>
                  <span className="sb-ico">{item.i}</span>
                  <span>{item.lbl}</span>
                  {item.bx ? <span className="sb-bx">{item.bx}</span> : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="sb-ft">
          <div className="sb-user">
            <div className="sb-av">{nombre[0].toUpperCase()}</div>
            <div>
              <div className="sb-un">{nombre}</div>
              <div className="sb-ur">{rol}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:7}}>
            <button className="btn bg bsm" style={{flex:1,justifyContent:"center"}} onClick={toggleTema}>
              {tema === "dark" ? "☀ Claro" : "◑ Oscuro"}
            </button>
          </div>
          <button className="btn bg bsm" style={{width:"100%",justifyContent:"center"}} onClick={logout}>
            ⎋ Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main">
        {pagActual==="dashboard" && <Dashboard pedidos={pedidos} pagos={pagos} catalogo={catalogo} setPag={setPag}/>}
        {pagActual==="cotizador" && <Cotizador catalogo={catalogoCompleto} pedidos={pedidos} setPedidos={setPedidos} setPag={setPag} tienda={tienda} draft={cotDraft} setDraft={setCotDraft} setProductosCustom={setProductosCustom}/>}
        {pagActual==="pedidos"   && !esLimitada && <Pedidos pedidos={pedidos} setPedidos={setPedidos} pagos={pagos} setPagos={setPagos} rol={rol}/>}
        {pagActual==="historial" && <Historial pedidos={pedidos} pagos={pagos} filtros={histFiltros} setFiltros={setHistFiltros}/>}
        {pagActual==="caja"      && !esLimitada && <Caja pagos={pagos} gastos={gastos}/>}
        {pagActual==="gastos"    && !esLimitada && <Gastos gastos={gastos} setGastos={setGastos} tienda={tienda} rol={rol}/>}
        {pagActual==="catalogo"  && <CatalogoVista catalogo={catalogoCompleto}/>}
        {pagActual==="precios"   && rol==="admin" && !esLimitada && <PreciosEdit catalogo={catalogo} setCatalogo={setCatalogo} productosCustom={productosCustom} setProductosCustom={setProductosCustom} tienda={tienda}/>}
        {pagActual==="reportes"  && rol==="admin" && !esLimitada && <Reportes reportes={reportes} setReportes={setReportes} tienda={tienda} pedidos={pedidos} pagos={pagos}/>}
      </main>
    </div>
  );
}
