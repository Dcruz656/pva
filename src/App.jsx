import { useState, useEffect, useMemo, useCallback } from "react"
import { supabase } from "./lib/supabase"
import CrearEvaluacion from "./views/CrearEvaluacion"
import MisEvaluaciones from "./views/MisEvaluaciones"
import ResultadosEvaluacion from "./views/ResultadosEvaluacion"
import { exportarHistorialExcel, exportarHistorialPDF } from "./lib/exportar"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

function Toast({ notification, onClose }) {
  if (!notification) return null
  const ok = notification.type === "success"
  return (
    <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
      ok ? "bg-green-50 border-green-200 text-green-800"
         : "bg-error-container border-red-200 text-on-error-container"
    }`}>
      <Icon name={ok ? "check_circle" : "error"} className="text-xl" />
      <span className="text-sm font-medium">{notification.message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <Icon name="close" className="text-base" />
      </button>
    </div>
  )
}

// ── View: Dashboard ────────────────────────────────────────────────────────

function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState(null)
  const [recientes, setRecientes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: estudios }, { count: totalResp }] = await Promise.all([
      supabase.from("estudios").select("*").order("created_at", { ascending: false }),
      supabase.from("respuestas").select("*", { count: "exact", head: true }).eq("estado", "enviado"),
    ])
    const list = estudios || []
    setStats({
      total:      list.length,
      activos:    list.filter((e) => e.estado === "activo").length,
      cerrados:   list.filter((e) => e.estado !== "activo").length,
      respuestas: totalResp || 0,
    })
    setRecientes(list.slice(0, 5))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "respuestas" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "estudios" }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-on-surface-variant">
      <Icon name="hourglass_empty" className="text-4xl" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl text-primary mb-1">Panel de Control</h2>
        <p className="text-sm text-on-surface-variant">Vista general de la plataforma</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Evaluaciones totales", value: stats.total,      icon: "quiz",         bg: "bg-surface-container-high" },
          { label: "Activas",              value: stats.activos,    icon: "play_circle",  bg: "bg-green-50" },
          { label: "Cerradas",             value: stats.cerrados,   icon: "stop_circle",  bg: "bg-surface-container" },
          { label: "Respuestas enviadas",  value: stats.respuestas, icon: "rate_review",  bg: "bg-secondary-container" },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-outline-variant p-5`}>
            <Icon name={icon} className="text-primary text-2xl mb-2 block" />
            <div className="text-3xl font-bold text-on-surface">{value}</div>
            <div className="text-xs text-on-surface-variant mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Evaluaciones recientes */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-on-surface flex items-center gap-2">
            <Icon name="history" className="text-primary" /> Evaluaciones recientes
          </h3>
          <button onClick={() => onNavigate("evaluaciones")}
            className="text-xs text-primary font-semibold hover:underline">
            Ver todas
          </button>
        </div>
        {recientes.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            <Icon name="post_add" className="text-3xl block mb-2 mx-auto" />
            <p className="text-sm">No hay evaluaciones aún.</p>
            <button onClick={() => onNavigate("crear-evaluacion")}
              className="mt-3 text-sm text-primary font-semibold hover:underline">
              Crear la primera
            </button>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {recientes.map((e) => (
              <div key={e.id} className="py-3 flex justify-between items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-on-surface text-sm truncate">{e.titulo}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {e.variables?.length ?? 0} variables · {formatDate(e.created_at)}
                  </p>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  e.estado === "activo"
                    ? "bg-green-100 text-green-800"
                    : "bg-surface-container text-on-surface-variant"
                }`}>
                  {e.estado === "activo" ? "Activo" : "Cerrado"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="grid md:grid-cols-2 gap-4">
        <button onClick={() => onNavigate("crear-evaluacion")}
          className="bg-primary text-on-primary rounded-xl p-6 text-left hover:opacity-90 transition-opacity">
          <Icon name="add_circle" className="text-3xl mb-2 block" />
          <h4 className="font-bold text-lg mb-1">Nueva Evaluación</h4>
          <p className="text-sm opacity-80">Crea un nuevo instrumento de validación</p>
        </button>
        <button onClick={() => onNavigate("historial")}
          className="bg-surface-container-high border border-outline-variant rounded-xl p-6 text-left hover:shadow-md transition-shadow">
          <Icon name="rate_review" className="text-primary text-3xl mb-2 block" />
          <h4 className="font-bold text-lg text-on-surface mb-1">Ver Respuestas</h4>
          <p className="text-sm text-on-surface-variant">Consulta el historial de respuestas recibidas</p>
        </button>
      </div>
    </div>
  )
}

// ── View: Historial de respuestas ──────────────────────────────────────────

function HistorialView() {
  const [records, setRecords] = useState([])
  const [estudiosEnRespuestas, setEstudiosEnRespuestas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEstudio, setFilterEstudio] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [groupByEval, setGroupByEval] = useState(false)
  const [expandedEvals, setExpandedEvals] = useState({})

  // Carga inicial
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: resp }, { data: est }] = await Promise.all([
        supabase.from("respuestas").select("*").order("updated_at", { ascending: false }),
        supabase.from("estudios").select("id, titulo"),
      ])
      const rows = resp || []
      const estMap = Object.fromEntries((est || []).map((e) => [e.id, e.titulo]))
      const idsPresentes = [...new Set(rows.map((r) => r.estudio_id).filter(Boolean))]
      const opciones = idsPresentes.map((id) => ({
        id,
        titulo: estMap[id] ?? `Evaluación (${id.substring(0, 8)}…)`,
      }))
      setRecords(rows)
      setEstudiosEnRespuestas(opciones)
      setLoading(false)
    }
    load()
  }, [])

  // Refetch cuando cambia filtro a un estudio específico
  useEffect(() => {
    if (filterEstudio === "todos") return
    async function refetch() {
      setLoading(true)
      const { data } = await supabase
        .from("respuestas").select("*")
        .eq("estudio_id", filterEstudio)
        .order("updated_at", { ascending: false })
      setRecords(data || [])
      setLoading(false)
    }
    refetch()
  }, [filterEstudio])

  // Recarga todos cuando vuelve a "todos"
  useEffect(() => {
    if (filterEstudio !== "todos") return
    async function reloadAll() {
      setLoading(true)
      const { data } = await supabase
        .from("respuestas").select("*").order("updated_at", { ascending: false })
      setRecords(data || [])
      setLoading(false)
    }
    reloadAll()
  }, [filterEstudio])

  const filtered = filterEstado === "todos"
    ? records
    : records.filter((r) => r.estado === filterEstado)

  const estudioMap = Object.fromEntries(estudiosEnRespuestas.map((e) => [e.id, e.titulo]))
  const filtroLabel = filterEstudio === "todos"
    ? "todos"
    : (estudioMap[filterEstudio] ?? filterEstudio)

  // Agrupado por evaluador (session_id)
  const groupedByEval = useMemo(() => {
    if (!groupByEval) return null
    const groups = {}
    for (const r of filtered) {
      const sid = r.session_id || "sin-sesion"
      if (!groups[sid]) groups[sid] = []
      groups[sid].push(r)
    }
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [filtered, groupByEval])

  function toggleEval(sid) {
    setExpandedEvals((prev) => ({ ...prev, [sid]: !prev[sid] }))
  }

  const TABLE_HEADERS = ["Evaluación", "Criterio", "Variable", "Claridad", "Relevancia", "Coherencia", "Estado", "Fecha"]

  function RatingBadge({ val }) {
    return (
      <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
        val >= 4 ? "bg-green-100 text-green-800"
        : val === 3 ? "bg-amber-100 text-amber-800"
        : val ? "bg-red-100 text-red-800"
        : "bg-surface-container text-on-surface-variant"
      }`}>{val ?? "—"}</span>
    )
  }

  function TableRow({ r, i }) {
    return (
      <tr key={r.id ?? i} className="hover:bg-surface-container-low transition-colors">
        <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[160px] truncate" title={estudioMap[r.estudio_id]}>
          {estudioMap[r.estudio_id] ?? r.estudio_id?.substring(0, 8) + "…"}
        </td>
        <td className="px-4 py-3 font-medium text-on-surface">{r.variable}</td>
        <td className="px-4 py-3 text-on-surface-variant text-xs">{r.dimension}</td>
        {["claridad", "relevancia", "coherencia"].map((f) => (
          <td key={f} className="px-4 py-3 text-center"><RatingBadge val={r[f]} /></td>
        ))}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            r.estado === "enviado" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}>
            <Icon name={r.estado === "enviado" ? "verified" : "draft"} className="text-xs" />
            {r.estado}
          </span>
        </td>
        <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">{formatDate(r.updated_at)}</td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="font-bold text-2xl text-primary mb-1">Historial de Respuestas</h2>
          <p className="text-sm text-on-surface-variant">
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setGroupByEval((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${
              groupByEval
                ? "bg-primary text-on-primary border-primary"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Icon name="group" className="text-base" />
            {groupByEval ? "Agrupado por evaluador" : "Por evaluador"}
          </button>
          <button onClick={() => exportarHistorialExcel(filtered, filtroLabel)} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-secondary-container disabled:opacity-40">
            <Icon name="table_view" className="text-base" /> Excel
          </button>
          <button onClick={() => exportarHistorialPDF(filtered, filtroLabel)} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40">
            <Icon name="picture_as_pdf" className="text-base" /> PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {[
            { key: "todos",    label: "Todos" },
            { key: "enviado",  label: "Enviados" },
            { key: "borrador", label: "Borradores" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilterEstado(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterEstado === key
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
              }`}>
              {label}
            </button>
          ))}
        </div>
        {estudiosEnRespuestas.length > 0 && (
          <select
            value={filterEstudio}
            onChange={(e) => setFilterEstudio(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="todos">Todas las evaluaciones</option>
            {estudiosEnRespuestas.map((e) => (
              <option key={e.id} value={e.id}>{e.titulo}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">
          <Icon name="hourglass_empty" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">Cargando registros...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant border border-outline-variant rounded-xl">
          <Icon name="inbox" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">No hay respuestas registradas.</p>
        </div>
      ) : groupByEval && groupedByEval ? (
        /* ── Vista agrupada por evaluador ── */
        <div className="space-y-4">
          {groupedByEval.map(([sid, rows]) => {
            const enviadas = rows.filter((r) => r.estado === "enviado").length
            const isExpanded = expandedEvals[sid] ?? false
            const shortSid = sid.length > 12 ? sid.substring(0, 12) + "…" : sid
            const lastDate = rows.reduce((max, r) => (!max || r.updated_at > max ? r.updated_at : max), null)
            return (
              <div key={sid} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleEval(sid)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                      <Icon name="person" className="text-base" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm font-mono">{shortSid}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {rows.length} variable{rows.length !== 1 ? "s" : ""} ·{" "}
                        <span className={enviadas === rows.length ? "text-green-600 font-semibold" : "text-amber-600"}>
                          {enviadas} enviada{enviadas !== 1 ? "s" : ""}
                        </span>
                        {lastDate && ` · ${formatDate(lastDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-200 rounded-full h-1.5 hidden sm:block">
                      <div
                        className={`h-1.5 rounded-full ${enviadas === rows.length ? "bg-green-400" : "bg-primary"}`}
                        style={{ width: `${(enviadas / rows.length) * 100}%` }}
                      />
                    </div>
                    <Icon name={isExpanded ? "expand_less" : "expand_more"} className="text-on-surface-variant" />
                  </div>
                </button>
                {isExpanded && (
                  <div className="overflow-x-auto border-t border-outline-variant">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-container-high">
                        <tr>
                          {TABLE_HEADERS.map((h) => (
                            <th key={h} className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {rows.map((r, i) => <TableRow key={r.id ?? i} r={r} i={i} />)}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Vista plana ── */
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((r, i) => <TableRow key={r.id ?? i} r={r} i={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── View: Configuración ────────────────────────────────────────────────────

function ConfiguracionView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl text-primary mb-1">Configuración</h2>
        <p className="text-sm text-on-surface-variant">Información de la plataforma</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl divide-y divide-outline-variant">
        {[
          { label: "Plataforma",    value: "Plataforma de Validación Académica" },
          { label: "Versión",       value: "v1.0.0" },
          { label: "Base de datos", value: "Supabase" },
          { label: "Autenticación", value: "Sesión persistente (localStorage)" },
          { label: "Usuario admin", value: "admin" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-6 py-4 gap-4">
            <span className="text-sm text-on-surface-variant">{label}</span>
            <span className="text-sm text-on-surface font-semibold text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Icon name="storage" className="text-primary" /> Tablas Supabase
        </h3>
        <div className="space-y-3 text-sm text-on-surface-variant">
          {[
            { tabla: "estudios",   desc: "Evaluaciones creadas por el administrador" },
            { tabla: "respuestas", desc: "Respuestas enviadas por los evaluadores" },
          ].map(({ tabla, desc }) => (
            <div key={tabla} className="flex items-center gap-3">
              <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded text-primary">{tabla}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────

export default function App({ onLogout }) {
  const [view, setView] = useState("dashboard")
  const [notification, setNotification] = useState(null)
  const [editingEstudio, setEditingEstudio] = useState(null)
  const [resultsEstudio, setResultsEstudio] = useState(null)

  const sidebarItems = [
    { icon: "dashboard",   label: "Panel de Control", viewKey: "dashboard" },
    { icon: "quiz",        label: "Mis Evaluaciones", viewKey: "evaluaciones" },
    { icon: "rate_review", label: "Respuestas",        viewKey: "historial" },
    { icon: "settings",    label: "Configuración",     viewKey: "configuracion" },
  ]

  function navigate(v) {
    setView(v)
    if (v !== "crear-evaluacion") setEditingEstudio(null)
    if (v !== "resultados") setResultsEstudio(null)
  }

  function handleEdit(estudio) {
    setEditingEstudio(estudio)
    setView("crear-evaluacion")
  }

  function handleViewResults(estudio) {
    setResultsEstudio(estudio)
    setView("resultados")
  }

  return (
    <div className="bg-background text-on-surface flex flex-col min-h-screen">
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* ── Header ── */}
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 right-0 z-40">
        <div className="flex justify-between items-center w-full px-6 xl:px-10 h-16 max-w-[1440px] mx-auto">
          <button onClick={() => navigate("dashboard")}
            className="font-bold text-lg text-primary tracking-tight hover:opacity-80 transition-opacity">
            Plataforma de Validación Académica
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Icon name="admin_panel_settings" className="text-base" /> Panel de administración
            </span>
            <button onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:text-error hover:border-red-200 transition-colors">
              <Icon name="logout" className="text-base" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed left-0 top-0 h-full flex-col pt-16 z-40 bg-surface-container-low border-r border-outline-variant w-64 hidden xl:flex">
        <div className="p-6 flex flex-col items-center border-b border-outline-variant">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <Icon name="school" className="text-on-primary text-3xl" />
          </div>
          <h2 className="font-semibold text-sm text-on-surface text-center">Administración</h2>
          <p className="text-xs text-on-surface-variant">Validación Académica</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map(({ icon, label, viewKey }) => (
            <button key={viewKey} onClick={() => navigate(viewKey)}
              className={`flex items-center gap-3 rounded-lg mx-2 px-4 py-3 text-sm transition-all text-left ${
                view === viewKey
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
              style={{ width: "calc(100% - 1rem)" }}>
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-outline-variant space-y-2">
          <button onClick={() => { setEditingEstudio(null); setView("crear-evaluacion") }}
            className="w-full bg-primary text-on-primary py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2">
            <Icon name="add" className="text-base" /> Nueva Evaluación
          </button>
          <a href="mailto:dcruz@uacj.mx"
            className="flex items-center gap-3 text-on-surface-variant px-2 py-2 hover:text-primary text-sm transition-colors">
            <Icon name="contact_support" /> Soporte
          </a>
          <button onClick={onLogout}
            className="flex items-center gap-3 text-on-surface-variant px-2 py-2 hover:text-error text-sm w-full transition-colors">
            <Icon name="logout" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 mt-16 xl:ml-64 p-6 xl:p-10 pb-24 xl:pb-10 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto">
          {view === "dashboard" && <DashboardView onNavigate={navigate} />}
          {view === "historial" && <HistorialView />}
          {view === "evaluaciones" && (
            <MisEvaluaciones
              onCreateNew={() => { setEditingEstudio(null); setView("crear-evaluacion") }}
              onOpenEvaluation={(estudio) => {
                window.location.hash = `#/evaluar/${estudio.id}`
              }}
              onEdit={handleEdit}
              onViewResults={handleViewResults}
            />
          )}
          {view === "crear-evaluacion" && (
            <CrearEvaluacion
              onBack={() => navigate("evaluaciones")}
              onCreated={() => navigate("evaluaciones")}
              estudioToEdit={editingEstudio}
            />
          )}
          {view === "resultados" && resultsEstudio && (
            <ResultadosEvaluacion
              estudio={resultsEstudio}
              onBack={() => navigate("evaluaciones")}
            />
          )}
          {view === "configuracion" && <ConfiguracionView />}
        </div>
      </main>

      {/* ── Mobile Bottom Nav (xl:hidden) ── */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant">
        <div className="flex">
          {sidebarItems.map(({ icon, label, viewKey }) => (
            <button
              key={viewKey}
              onClick={() => navigate(viewKey)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                view === viewKey
                  ? "text-primary"
                  : "text-on-surface-variant"
              }`}
            >
              <Icon name={icon} className={`text-xl ${view === viewKey ? "text-primary" : ""}`} />
              <span className="leading-none">{label.split(" ")[0]}</span>
            </button>
          ))}
          <button
            onClick={() => { setEditingEstudio(null); setView("crear-evaluacion") }}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-on-surface-variant transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Icon name="add" className="text-white text-base" />
            </span>
            <span className="leading-none">Nueva</span>
          </button>
        </div>
      </nav>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-high border-t border-outline-variant xl:ml-64 hidden xl:block">
        <div className="flex justify-between items-center w-full px-10 py-3 max-w-[1440px] mx-auto">
          <span className="text-xs text-on-surface-variant">
            © 2024 Sistema de Validación Académica — Comité de Ética e Investigación
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">DCB PLATFORM</span>
        </div>
      </footer>
    </div>
  )
}
