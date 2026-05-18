'use client'

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login({ onLogin, tema, toggleTema }) {
  const [email, setEmail] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);

  const go = async () => {
    setLoad(true);
    setErr("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: p,
    });
    if (error) {
      setErr("Email o contraseña incorrectos");
      setLoad(false);
      return;
    }
    onLogin(data.session);
  };

  return (
    <div className="lw">
      <div className="l-bg"/>
      <div className="l-grid"/>
      <div className="lc">
        <div className="l-glow-top"/>
        <div className="lh">
          <div className="l-logo">
            <img src={tema === "light" ? "/logooscuro.png" : "/logo.png"} alt="Logo" style={{height:64,objectFit:"contain"}}/>
          </div>
          <div className="lt">Sistema de Control de Ventas</div>
        </div>
        <div className="fg">
          <label className="lb">Email</label>
          <input className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com"/>
        </div>
        <div className="fg mb3">
          <label className="lb">Contraseña</label>
          <input className="inp" type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
        </div>
        {err&&<div className="l-err">⚠ {err}</div>}
        <button className="btn bp blk blg" onClick={go} disabled={load}>{load?"Verificando…":"Ingresar →"}</button>
        <button className="btn bg bsm" style={{width:"100%",justifyContent:"center",marginTop:10}} onClick={toggleTema}>
          {tema === "light" ? "◑ Modo oscuro" : "☀ Modo claro"}
        </button>
      </div>
    </div>
  );
}
