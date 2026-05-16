import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import ResponderEvaluacion   from "./views/ResponderEvaluacion.jsx"
import ResponderEvaluacionV2 from "./views/ResponderEvaluacionV2.jsx"
import Login from "./views/Login.jsx"
import "./App.css"

function Root() {
  const [hash, setHash] = useState(window.location.hash)
  const [authed, setAuthed] = useState(() => localStorage.getItem("pva_admin") === "1")

  useEffect(() => {
    const handler = () => setHash(window.location.hash)
    window.addEventListener("hashchange", handler)
    return () => window.removeEventListener("hashchange", handler)
  }, [])

  // Ruta pública — versión alternativa (v2)
  const matchV2 = hash.match(/^#\/evaluar-v2\/([0-9a-f-]{36})/i)
  if (matchV2) return <ResponderEvaluacionV2 studyId={matchV2[1]} />

  // Ruta pública del evaluador original
  const match = hash.match(/^#\/evaluar\/([0-9a-f-]{36})/i)
  if (match) return <ResponderEvaluacion studyId={match[1]} />

  // Panel de admin — requiere login
  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  return <App onLogout={() => { localStorage.removeItem("pva_admin"); setAuthed(false) }} />
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
