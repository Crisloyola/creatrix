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

export default function App() {
  const [session, setSession] = useState(null);
  const [pag, setPag] = useState("dashboard");
  const [pedidos, setPedidos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [catalogo, setCatalogo] = useState(CATALOGO);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) cargarDatos();
      else setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) cargarDatos();
      else { setPedidos([]); setPagos([]); setCargando(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const [{ data: peds }, { data: pays }] = await Promise.all([
      supabase.from('pedidos').select('*').order('fecha', { ascending: false }),
      supabase.from('pagos').select('*').order('fecha', { ascending: true }),
    ]);
    if (peds) setPedidos(peds);
    if (pays) setPagos(pays);
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

  if (!session) return <Login onLogin={setSession}/>;

  const nombre = session.user?.user_metadata?.nombre || session.user?.email || "Usuario";
  const rol    = session.user?.user_metadata?.rol || "vendedor";
  const pend   = pedidos.filter(p => p.estado === "PENDIENTE").length;

  const nav = [
    { sec:"Principal", items:[
      { id:"dashboard", i:"⬡",  lbl:"Dashboard" },
      { id:"cotizador", i:"🧮", lbl:"Nuevo Pedido" },
    ]},
    { sec:"Gestión", items:[
      { id:"pedidos",  i:"📦", lbl:"Pedidos",  bx:pend||null },
      { id:"historial",i:"📋", lbl:"Historial" },
      { id:"caja",     i:"💰", lbl:"Caja"      },
    ]},
    { sec:"Catálogo", items:[
      { id:"catalogo",i:"🗂️", lbl:"Ver Catálogo" },
      ...(rol==="admin" ? [{ id:"precios", i:"⚙️", lbl:"Gestión Precios" }] : []),
    ]},
  ];

  return (
    <div className="root">
      <aside className="sb">
        <div className="sb-logo">
          <div className="sb-brandmark">
            <div className="sb-hex"><div className="sb-hex-inner">◈</div></div>
            <div className="sb-brand-text">
              <div className="sb-name">creatrix</div>
              <div className="sb-tagline">Diseño & Publicidad</div>
            </div>
          </div>
        </div>

        {nav.map(sec => (
          <div key={sec.sec}>
            <div className="sb-sec">{sec.sec}</div>
            <div className="sb-nav">
              {sec.items.map(item => (
                <div key={item.id} className={`sb-item${pag===item.id?" on":""}`} onClick={()=>setPag(item.id)}>
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
          <button className="btn bg bsm" style={{width:"100%",justifyContent:"center"}} onClick={logout}>
            ⎋ Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main">
        {pag==="dashboard" && <Dashboard pedidos={pedidos} pagos={pagos} catalogo={catalogo} setPag={setPag}/>}
        {pag==="cotizador" && <Cotizador catalogo={catalogo} pedidos={pedidos} setPedidos={setPedidos} setPag={setPag}/>}
        {pag==="pedidos"   && <Pedidos  pedidos={pedidos} setPedidos={setPedidos} pagos={pagos} setPagos={setPagos}/>}
        {pag==="historial" && <Historial pedidos={pedidos} pagos={pagos}/>}
        {pag==="caja"      && <Caja pagos={pagos}/>}
        {pag==="catalogo"  && <CatalogoVista catalogo={catalogo}/>}
        {pag==="precios"   && rol==="admin" && <PreciosEdit catalogo={catalogo} setCatalogo={setCatalogo}/>}
      </main>
    </div>
  );
}
