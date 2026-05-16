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
  const [filterEvaluador, setFilterEvaluador] = useState("todos")
  const [groupByEval, setGroupByEval] = useState(false)
  const [expandedEvals, setExpandedEvals] = useState({})
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

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

  // Mapa session_id → nombre_evaluador (primer nombre encontrado por sesión)
  const sessionNameMap = useMemo(() => {
    const map = {}
    for (const r of records) {
      if (r.session_id && r.nombre_evaluador && !map[r.session_id]) {
        map[r.session_id] = r.nombre_evaluador
      }
    }
    return map
  }, [records])

  // Evaluadores únicos con nombre registrado
  const evaluadoresConNombre = useMemo(() => {
    const set = new Set()
    for (const r of records) {
      if (r.nombre_evaluador) set.add(r.nombre_evaluador)
    }
    return [...set].sort()
  }, [records])

  const filtered = useMemo(() => {
    let list = records
    if (filterEstado !== "todos") list = list.filter((r) => r.estado === filterEstado)
    if (filterEvaluador !== "todos") {
      list = list.filter((r) => r.nombre_evaluador === filterEvaluador)
    }
    return list
  }, [records, filterEstado, filterEvaluador])

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

  async function handleDelete(id) {
    setDeletingId(id)
    const { error } = await supabase.from("respuestas").delete().eq("id", id)
    if (!error) {
      setRecords((prev) => prev.filter((r) => r.id !== id))
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  function toggleSelectId(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectSession(ids) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const allSelected = ids.every((id) => next.has(id))
      ids.forEach((id) => allSelected ? next.delete(id) : next.add(id))
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)))
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true)
    const ids = [...selectedIds]
    const { error } = await supabase.from("respuestas").delete().in("id", ids)
    if (!error) {
      setRecords((prev) => prev.filter((r) => !selectedIds.has(r.id)))
      setSelectedIds(new Set())
      setSelectionMode(false)
    }
    setBulkDeleting(false)
    setConfirmBulkDelete(false)
  }

  // ── Clasificadores ────────────────────────────────────────────────────────
  function getEtapa(r) {
    return String(r.variable_id ?? "").includes("__") ? 2 : 1
  }
  function getIndice(r) {
    if (getEtapa(r) === 2) return 1
    const first = String(r.variable ?? "").match(/^([A-Z])/)?.[1] ?? ""
    if (first === "S") return 2
    if (first === "O") return 3
    return 1
  }

  // ── Badges ────────────────────────────────────────────────────────────────
  const EMOJI_FACES = ["", "😞", "🙁", "😐", "🙂", "😄"]
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
  function PertinenciaBadge({ val }) {
    if (!val) return <span className="text-on-surface-variant text-sm">—</span>
    return <span className="text-xl leading-none" title={`${val}/5`}>{EMOJI_FACES[val]}</span>
  }
  function EstadoBadge({ estado }) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
        estado === "enviado" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}>
        <Icon name={estado === "enviado" ? "verified" : "draft"} className="text-xs" />
        {estado}
      </span>
    )
  }

  // ── Cabeceras específicas ─────────────────────────────────────────────────
  const thBase = "px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant whitespace-nowrap"

  function HeadVars() {
    return (
      <thead className="bg-surface-container-high border-b border-outline-variant">
        <tr>
          {selectionMode && <th rowSpan={2} className="px-3 py-3 w-8" />}
          <th rowSpan={2} className={`${thBase} py-3`}>Evaluación</th>
          <th rowSpan={2} className={`${thBase} py-3`}>Variable</th>
          <th rowSpan={2} className={`${thBase} py-3`}>Subdimensión</th>
          <th colSpan={4} className="px-4 pt-2 pb-0 text-xs font-bold text-center text-primary border-b border-primary/30 whitespace-nowrap">
            Atributos de Valoración
          </th>
          <th rowSpan={2} className={`${thBase} py-3`}>Estado</th>
          <th rowSpan={2} className={`${thBase} py-3`}>Fecha</th>
          <th rowSpan={2} className={`${thBase} py-3`}></th>
        </tr>
        <tr>
          {["Claridad", "Relevancia", "Coherencia", "Pertinencia"].map((h) => (
            <th key={h} className={`${thBase} pt-1 pb-2`}>{h}</th>
          ))}
        </tr>
      </thead>
    )
  }

  function HeadCriterios() {
    return (
      <thead className="bg-surface-container-high border-b border-outline-variant">
        <tr>
          {selectionMode && <th className="px-3 py-3 w-8" />}
          <th className={`${thBase} py-3`}>Evaluación</th>
          <th className={`${thBase} py-3`}>Criterio</th>
          <th className={`${thBase} py-3 text-center`}>Pertinencia</th>
          <th className={`${thBase} py-3`}>Estado</th>
          <th className={`${thBase} py-3`}>Fecha</th>
          <th className={`${thBase} py-3`}></th>
        </tr>
      </thead>
    )
  }

  // ── Filas específicas ─────────────────────────────────────────────────────
  function DeleteCell({ id }) {
    const isConfirming = confirmDeleteId === id
    const isDeleting   = deletingId === id
    if (isDeleting) return (
      <td className="px-3 py-3 text-center">
        <Icon name="hourglass_empty" className="text-base text-on-surface-variant animate-spin" />
      </td>
    )
    if (isConfirming) return (
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleDelete(id)}
            className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
          >
            Sí
          </button>
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface-variant text-xs hover:bg-surface-container transition-colors"
          >
            No
          </button>
        </div>
      </td>
    )
    return (
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => setConfirmDeleteId(id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Eliminar registro"
        >
          <Icon name="delete" className="text-base" />
        </button>
      </td>
    )
  }

  function RowVars({ r }) {
    const isSel = selectedIds.has(r.id)
    return (
      <tr className={`hover:bg-surface-container-low transition-colors ${isSel ? "bg-primary/5" : ""}`}>
        {selectionMode && (
          <td className="px-3 py-3 w-8">
            <input type="checkbox" checked={isSel} onChange={() => toggleSelectId(r.id)}
              className="w-4 h-4 accent-primary cursor-pointer" />
          </td>
        )}
        <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[140px] truncate" title={estudioMap[r.estudio_id]}>
          {estudioMap[r.estudio_id] ?? r.estudio_id?.substring(0, 8) + "…"}
        </td>
        <td className="px-4 py-3 font-medium text-on-surface text-sm">{r.variable}</td>
        <td className="px-4 py-3 text-on-surface-variant text-xs">{r.dimension}</td>
        <td className="px-4 py-3 text-center"><RatingBadge val={r.claridad} /></td>
        <td className="px-4 py-3 text-center"><RatingBadge val={r.relevancia} /></td>
        <td className="px-4 py-3 text-center"><RatingBadge val={r.coherencia} /></td>
        <td className="px-4 py-3 text-center"><RatingBadge val={r.pertinencia} /></td>
        <td className="px-4 py-3"><EstadoBadge estado={r.estado} /></td>
        <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">{formatDate(r.updated_at)}</td>
        <DeleteCell id={r.id} />
      </tr>
    )
  }

  function RowCriterios({ r }) {
    const isSel = selectedIds.has(r.id)
    return (
      <tr className={`hover:bg-indigo-50/30 transition-colors ${isSel ? "bg-primary/5" : ""}`}>
        {selectionMode && (
          <td className="px-3 py-3 w-8">
            <input type="checkbox" checked={isSel} onChange={() => toggleSelectId(r.id)}
              className="w-4 h-4 accent-primary cursor-pointer" />
          </td>
        )}
        <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[140px] truncate" title={estudioMap[r.estudio_id]}>
          {estudioMap[r.estudio_id] ?? r.estudio_id?.substring(0, 8) + "…"}
        </td>
        <td className="px-4 py-3 font-medium text-on-surface text-sm">{r.variable}</td>
        <td className="px-4 py-3 text-center"><PertinenciaBadge val={r.claridad} /></td>
        <td className="px-4 py-3"><EstadoBadge estado={r.estado} /></td>
        <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">{formatDate(r.updated_at)}</td>
        <DeleteCell id={r.id} />
      </tr>
    )
  }

  // ── Bloque de sección ─────────────────────────────────────────────────────
  function SectionTable({ label, title, subtitle, headerBg, labelColor, rows, Head, Row }) {
    if (rows.length === 0) return null
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className={`${headerBg} px-5 py-3 flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</span>
            <p className="font-bold text-white text-sm leading-tight">{title}</p>
            {subtitle && <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-bold text-white/80 bg-white/20 px-2.5 py-1 rounded-full">
            {rows.length} registro{rows.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <Head />
            <tbody className="divide-y divide-outline-variant">
              {rows.map((r, i) => <Row key={r.id ?? i} r={r} />)}
            </tbody>
          </table>
        </div>
      </div>
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
          {/* Modo selección */}
          <button
            onClick={() => { setSelectionMode((v) => !v); setSelectedIds(new Set()) }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${
              selectionMode
                ? "bg-red-50 text-red-600 border-red-200"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <Icon name={selectionMode ? "close" : "checklist"} className="text-base" />
            {selectionMode ? "Cancelar selección" : "Seleccionar"}
          </button>
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

      {/* Barra de selección */}
      {selectionMode && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selectedIds.size === filtered.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-red-500 cursor-pointer"
            />
            <span className="text-sm text-red-700 font-medium">
              {selectedIds.size === 0
                ? "Seleccione registros para eliminar"
                : `${selectedIds.size} registro${selectedIds.size !== 1 ? "s" : ""} seleccionado${selectedIds.size !== 1 ? "s" : ""}`}
            </span>
            {filtered.length > 0 && (
              <button onClick={toggleSelectAll} className="text-xs text-red-500 hover:underline">
                {selectedIds.size === filtered.length ? "Deseleccionar todo" : "Seleccionar todo"}
              </button>
            )}
          </div>
          <button
            onClick={() => setConfirmBulkDelete(true)}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold rounded-lg text-sm
                       hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Icon name="delete_sweep" className="text-base" />
            Eliminar {selectedIds.size > 0 ? selectedIds.size : ""} seleccionados
          </button>
        </div>
      )}

      {/* Modal confirmación borrado grupal */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-outline-variant p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="delete_sweep" className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">¿Eliminar {selectedIds.size} registro{selectedIds.size !== 1 ? "s" : ""}?</h3>
                <p className="text-sm text-slate-500 mt-1">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container">
                Cancelar
              </button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
                <Icon name={bulkDeleting ? "sync" : "delete"} className={`text-base ${bulkDeleting ? "animate-spin" : ""}`} />
                {bulkDeleting ? "Eliminando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {evaluadoresConNombre.length > 0 && (
          <select
            value={filterEvaluador}
            onChange={(e) => setFilterEvaluador(e.target.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border focus:ring-1 focus:ring-primary outline-none transition-colors
              ${filterEvaluador !== "todos"
                ? "border-primary bg-primary/5 text-primary font-semibold"
                : "border-outline-variant bg-surface text-on-surface"}`}
          >
            <option value="todos">Todos los evaluadores</option>
            {evaluadoresConNombre.map((n) => (
              <option key={n} value={n}>{n}</option>
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
            const nombre = sessionNameMap[sid] || null
            const shortSid = sid.length > 12 ? sid.substring(0, 12) + "…" : sid
            const lastDate = rows.reduce((max, r) => (!max || r.updated_at > max ? r.updated_at : max), null)
            return (
              <div key={sid} className={`bg-surface-container-lowest border rounded-xl overflow-hidden transition-colors ${
                selectionMode && rows.every((r) => selectedIds.has(r.id)) ? "border-primary bg-primary/5" : "border-outline-variant"
              }`}>
                <div className="flex items-center">
                  {selectionMode && (
                    <div className="pl-4 pr-1 flex items-center self-stretch" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={rows.every((r) => selectedIds.has(r.id))}
                        ref={(el) => { if (el) el.indeterminate = rows.some((r) => selectedIds.has(r.id)) && !rows.every((r) => selectedIds.has(r.id)) }}
                        onChange={() => toggleSelectSession(rows.map((r) => r.id))}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => toggleEval(sid)}
                    className="flex-1 flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                        <Icon name="person" className="text-base" />
                      </div>
                      <div>
                        {nombre ? (
                          <>
                            <p className="font-semibold text-on-surface text-sm">{nombre}</p>
                            <p className="text-[10px] text-on-surface-variant font-mono opacity-60">ID: {shortSid}</p>
                          </>
                        ) : (
                          <p className="font-semibold text-on-surface text-sm font-mono">{shortSid}</p>
                        )}
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
                </div>
                {isExpanded && (
                  <div className="space-y-2 border-t border-outline-variant p-3">
                    <SectionTable
                      label="Índice 1 · Etapa 1" title="La biblioteca como espacio público" subtitle="Evaluación de variables"
                      headerBg="bg-blue-600" labelColor="text-blue-200"
                      rows={rows.filter((r) => getEtapa(r) === 1 && getIndice(r) === 1)}
                      Head={HeadVars} Row={RowVars}
                    />
                    <SectionTable
                      label="Índice 1 · Etapa 2" title="La biblioteca como espacio público" subtitle="Evaluación de criterios"
                      headerBg="bg-indigo-600" labelColor="text-indigo-200"
                      rows={rows.filter((r) => getEtapa(r) === 2)}
                      Head={HeadCriterios} Row={RowCriterios}
                    />
                    <SectionTable
                      label="Índice 2" title="La biblioteca como sujeto colectivo" subtitle="Evaluación de variables"
                      headerBg="bg-purple-600" labelColor="text-purple-200"
                      rows={rows.filter((r) => getIndice(r) === 2)}
                      Head={HeadVars} Row={RowVars}
                    />
                    <SectionTable
                      label="Índice 3" title="La biblioteca como objeto de debate y representación" subtitle="Evaluación de variables"
                      headerBg="bg-violet-700" labelColor="text-violet-200"
                      rows={rows.filter((r) => getIndice(r) === 3)}
                      Head={HeadVars} Row={RowVars}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Vista plana: tablas separadas por índice y etapa ── */
        <div className="space-y-4">
          <SectionTable
            label="Índice 1 · Etapa 1" title="La biblioteca como espacio público" subtitle="Evaluación de variables"
            headerBg="bg-blue-600" labelColor="text-blue-200"
            rows={filtered.filter((r) => getEtapa(r) === 1 && getIndice(r) === 1)}
            Head={HeadVars} Row={RowVars}
          />
          <SectionTable
            label="Índice 1 · Etapa 2" title="La biblioteca como espacio público" subtitle="Evaluación de criterios"
            headerBg="bg-indigo-600" labelColor="text-indigo-200"
            rows={filtered.filter((r) => getEtapa(r) === 2)}
            Head={HeadCriterios} Row={RowCriterios}
          />
          <SectionTable
            label="Índice 2" title="La biblioteca como sujeto colectivo" subtitle="Evaluación de variables"
            headerBg="bg-purple-600" labelColor="text-purple-200"
            rows={filtered.filter((r) => getIndice(r) === 2)}
            Head={HeadVars} Row={RowVars}
          />
          <SectionTable
            label="Índice 3" title="La biblioteca como objeto de debate y representación" subtitle="Evaluación de variables"
            headerBg="bg-violet-700" labelColor="text-violet-200"
            rows={filtered.filter((r) => getIndice(r) === 3)}
            Head={HeadVars} Row={RowVars}
          />
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
        <div className="max-w-[1600px] mx-auto">
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
