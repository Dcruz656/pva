import { useState, useEffect, useMemo } from "react"
import { supabase } from "../lib/supabase"
import { exportarRespuestasExcel, exportarRespuestasPDF } from "../lib/exportar"
import { INDICES, SUBDIMENSIONES, SUBDIMENSIONES_INDICE2, SUBDIMENSIONES_INDICE3 } from "../lib/variablesData"

// Mapa: nombre de dimensión → número de índice
const ALL_SUBDIMS = [
  ...SUBDIMENSIONES.map((s) => ({ ...s, indice: 1 })),
  ...SUBDIMENSIONES_INDICE2,
  ...SUBDIMENSIONES_INDICE3,
]
const DIM_TO_INDICE = Object.fromEntries(ALL_SUBDIMS.map((s) => [s.nombre, s.indice]))

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

function formatDate(dateStr) {
  if (!dateStr) return "Sin fecha"
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr + "T23:59:59") - new Date()) / (1000 * 60 * 60 * 24))
}

function BadgeEstado({ estado }) {
  const map = {
    activo:   { color: "bg-green-100 text-green-800",  icon: "play_circle",  label: "Activo" },
    cerrado:  { color: "bg-surface-container text-on-surface-variant", icon: "stop_circle", label: "Cerrado" },
    borrador: { color: "bg-amber-100 text-amber-800",  icon: "draft",        label: "Borrador" },
  }
  const { color, icon, label } = map[estado] ?? map.borrador
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      <Icon name={icon} className="text-xs" /> {label}
    </span>
  )
}

function BadgeAcceso({ tipo, codigo }) {
  return tipo === "liga_publica" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-container text-on-secondary-container">
      <Icon name="public" className="text-xs" /> Libre
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">
      <Icon name="lock" className="text-xs" /> Código: <strong className="font-mono tracking-wider">{codigo}</strong>
    </span>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-start gap-3 mb-5">
          <Icon name="warning" className="text-error text-2xl flex-shrink-0" />
          <p className="text-sm text-on-surface">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 bg-error text-on-error rounded-lg text-sm font-bold hover:opacity-90">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

const SORT_OPTIONS = [
  { value: "date_desc", label: "Más recientes" },
  { value: "date_asc",  label: "Más antiguas" },
  { value: "name_asc",  label: "Nombre A–Z" },
  { value: "name_desc", label: "Nombre Z–A" },
  { value: "estado",    label: "Estado (activas primero)" },
]

export default function MisEvaluaciones({ onCreateNew, onOpenEvaluation, onEdit, onViewResults }) {
  const [estudios, setEstudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [copiedLinkId, setCopiedLinkId] = useState(null)
  const [exportingId, setExportingId] = useState(null)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("date_desc")
  const [filterIndice, setFilterIndice]       = useState("")
  const [filterDimension, setFilterDimension] = useState("")
  const [filterVariable, setFilterVariable]   = useState("")
  const [filterEvaluador, setFilterEvaluador] = useState("")
  const [evaluadoresDB, setEvaluadoresDB]     = useState([]) // nombres únicos de evaluadores

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: estudiosData }, { data: evalData }] = await Promise.all([
      supabase.from("estudios").select("*").order("created_at", { ascending: false }),
      supabase.from("respuestas").select("estudio_id, nombre_evaluador").eq("estado", "enviado").not("nombre_evaluador", "is", null),
    ])
    setEstudios(estudiosData || [])
    // Construir mapa estudio_id → [nombres evaluadores]
    const evMap = {}
    for (const r of evalData || []) {
      if (!evMap[r.estudio_id]) evMap[r.estudio_id] = new Set()
      evMap[r.estudio_id].add(r.nombre_evaluador)
    }
    setEvaluadoresDB(evMap)
    setLoading(false)
  }

  // Opciones de filtro derivadas de los estudios cargados
  const filterOptions = useMemo(() => {
    const indices     = new Set()
    const dimensions  = new Set()
    const variables   = new Set()
    const evaluadores = new Set()

    for (const e of estudios) {
      for (const v of e.variables || []) {
        if (v.dimension) {
          dimensions.add(v.dimension)
          const idx = DIM_TO_INDICE[v.dimension]
          if (idx) indices.add(idx)
        }
        if (v.nombre) variables.add(v.nombre)
      }
      for (const nombre of evaluadoresDB[e.id] || []) {
        evaluadores.add(nombre)
      }
    }

    return {
      indices:     [...indices].sort((a, b) => a - b),
      dimensions:  [...dimensions].sort(),
      variables:   [...variables].sort(),
      evaluadores: [...evaluadores].sort(),
    }
  }, [estudios, evaluadoresDB])

  // Filtered + sorted
  const displayed = useMemo(() => {
    let list = estudios

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((e) =>
        e.titulo?.toLowerCase().includes(q) ||
        e.descripcion?.toLowerCase().includes(q)
      )
    }

    if (filterIndice) {
      const idx = Number(filterIndice)
      list = list.filter((e) =>
        (e.variables || []).some((v) => DIM_TO_INDICE[v.dimension] === idx)
      )
    }

    if (filterDimension) {
      list = list.filter((e) =>
        (e.variables || []).some((v) => v.dimension === filterDimension)
      )
    }

    if (filterVariable) {
      list = list.filter((e) =>
        (e.variables || []).some((v) => v.nombre === filterVariable)
      )
    }

    if (filterEvaluador) {
      list = list.filter((e) => evaluadoresDB[e.id]?.has(filterEvaluador))
    }

    list = [...list].sort((a, b) => {
      if (sort === "date_desc") return new Date(b.created_at) - new Date(a.created_at)
      if (sort === "date_asc")  return new Date(a.created_at) - new Date(b.created_at)
      if (sort === "name_asc")  return a.titulo.localeCompare(b.titulo)
      if (sort === "name_desc") return b.titulo.localeCompare(a.titulo)
      if (sort === "estado")    return (a.estado === "activo" ? 0 : 1) - (b.estado === "activo" ? 0 : 1)
      return 0
    })
    return list
  }, [estudios, evaluadoresDB, search, sort, filterIndice, filterDimension, filterVariable, filterEvaluador])

  async function toggleEstado(estudio) {
    const nuevoEstado = estudio.estado === "activo" ? "cerrado" : "activo"
    setConfirm({
      message: nuevoEstado === "cerrado"
        ? `¿Cerrar "${estudio.titulo}"? Los respondientes ya no podrán acceder.`
        : `¿Reactivar "${estudio.titulo}"?`,
      onConfirm: async () => {
        await supabase.from("estudios").update({ estado: nuevoEstado }).eq("id", estudio.id)
        setEstudios((prev) => prev.map((e) => e.id === estudio.id ? { ...e, estado: nuevoEstado } : e))
        setConfirm(null)
      },
    })
  }

  async function resetEstudio(estudio) {
    setConfirm({
      message: `¿Borrar todo el avance guardado de "${estudio.titulo}"? Se eliminarán todas las respuestas registradas. Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await supabase.from("respuestas").delete().eq("estudio_id", estudio.id)
        localStorage.removeItem(`pva_session_${estudio.id}`)
        setConfirm(null)
      },
    })
  }

  async function deleteEstudio(estudio) {
    setConfirm({
      message: `¿Eliminar permanentemente "${estudio.titulo}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await supabase.from("estudios").delete().eq("id", estudio.id)
        setEstudios((prev) => prev.filter((e) => e.id !== estudio.id))
        setConfirm(null)
      },
    })
  }

  function copyCode(estudio) {
    navigator.clipboard.writeText(estudio.codigo)
    setCopiedId(estudio.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function copyLink(estudio) {
    const link = `${window.location.origin}${window.location.pathname}#/evaluar/${estudio.id}`
    navigator.clipboard.writeText(link)
    setCopiedLinkId(estudio.id)
    setTimeout(() => setCopiedLinkId(null), 2500)
  }

  async function exportar(estudio, formato) {
    const key = estudio.id + formato
    setExportingId(key)
    try {
      const { data: respuestas } = await supabase
        .from("respuestas")
        .select("*")
        .eq("estudio_id", estudio.id)
        .order("updated_at", { ascending: false })
      if (formato === "excel") exportarRespuestasExcel(estudio, respuestas || [])
      else exportarRespuestasPDF(estudio, respuestas || [])
    } finally {
      setExportingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="font-bold text-2xl text-primary mb-1">Mis Evaluaciones</h2>
          <p className="text-sm text-on-surface-variant">
            {estudios.length} evaluación{estudios.length !== 1 ? "es" : ""} creada{estudios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 text-sm">
          <Icon name="add" className="text-base" /> Nueva Evaluación
        </button>
      </div>

      {/* Búsqueda y orden */}
      {estudios.length > 0 && (
        <div className="space-y-3">
          {/* Fila 1: búsqueda + orden */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] flex items-center border border-outline-variant rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-surface">
              <span className="pl-3 text-on-surface-variant">
                <Icon name="search" className="text-lg" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar evaluaciones…"
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-on-surface placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="pr-3 text-on-surface-variant hover:text-on-surface">
                  <Icon name="close" className="text-sm" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Fila 2: filtros */}
          <div className="flex flex-wrap gap-2 items-center">
            <Icon name="filter_list" className="text-on-surface-variant text-base flex-shrink-0" />

            {/* Índice */}
            <select
              value={filterIndice}
              onChange={(e) => { setFilterIndice(e.target.value); setFilterDimension(""); setFilterVariable("") }}
              className={`px-3 py-1.5 border rounded-lg text-sm outline-none transition-colors
                ${filterIndice ? "border-primary bg-primary/5 text-primary font-semibold" : "border-outline-variant bg-surface text-on-surface-variant"}`}
            >
              <option value="">Todos los índices</option>
              {filterOptions.indices.map((i) => (
                <option key={i} value={i}>{INDICES[i - 1]?.nombre ?? `Índice ${i}`}</option>
              ))}
            </select>

            {/* Dimensión */}
            <select
              value={filterDimension}
              onChange={(e) => { setFilterDimension(e.target.value); setFilterVariable("") }}
              className={`px-3 py-1.5 border rounded-lg text-sm outline-none transition-colors
                ${filterDimension ? "border-primary bg-primary/5 text-primary font-semibold" : "border-outline-variant bg-surface text-on-surface-variant"}`}
            >
              <option value="">Todas las dimensiones</option>
              {filterOptions.dimensions
                .filter((d) => !filterIndice || DIM_TO_INDICE[d] === Number(filterIndice))
                .map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
            </select>

            {/* Variable */}
            <select
              value={filterVariable}
              onChange={(e) => setFilterVariable(e.target.value)}
              className={`px-3 py-1.5 border rounded-lg text-sm outline-none transition-colors
                ${filterVariable ? "border-primary bg-primary/5 text-primary font-semibold" : "border-outline-variant bg-surface text-on-surface-variant"}`}
            >
              <option value="">Todas las variables</option>
              {filterOptions.variables
                .filter((v) => {
                  if (!filterDimension && !filterIndice) return true
                  // Solo variables que pertenecen a estudios que pasan los filtros activos
                  return estudios.some((e) =>
                    (e.variables || []).some((ev) =>
                      ev.nombre === v &&
                      (!filterDimension || ev.dimension === filterDimension) &&
                      (!filterIndice || DIM_TO_INDICE[ev.dimension] === Number(filterIndice))
                    )
                  )
                })
                .map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
            </select>

            {/* Evaluador */}
            {filterOptions.evaluadores.length > 0 && (
              <select
                value={filterEvaluador}
                onChange={(e) => setFilterEvaluador(e.target.value)}
                className={`px-3 py-1.5 border rounded-lg text-sm outline-none transition-colors
                  ${filterEvaluador ? "border-primary bg-primary/5 text-primary font-semibold" : "border-outline-variant bg-surface text-on-surface-variant"}`}
              >
                <option value="">Todos los evaluadores</option>
                {filterOptions.evaluadores.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            )}

            {/* Limpiar filtros */}
            {(filterIndice || filterDimension || filterVariable || filterEvaluador) && (
              <button
                onClick={() => { setFilterIndice(""); setFilterDimension(""); setFilterVariable(""); setFilterEvaluador("") }}
                className="flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1.5"
              >
                <Icon name="close" className="text-sm" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-on-surface-variant">
          <Icon name="hourglass_empty" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">Cargando evaluaciones…</p>
        </div>
      ) : estudios.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant space-y-4">
          <Icon name="post_add" className="text-5xl block mx-auto" />
          <div>
            <p className="font-semibold text-on-surface">Aún no hay evaluaciones</p>
            <p className="text-sm mt-1">Crea tu primer instrumento de validación</p>
          </div>
          <button onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg text-sm hover:opacity-90">
            <Icon name="add" className="text-base" /> Crear evaluación
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 border border-outline-variant rounded-xl text-on-surface-variant">
          <Icon name="search_off" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">Sin resultados para los filtros seleccionados</p>
          <button
            onClick={() => { setSearch(""); setFilterIndice(""); setFilterDimension(""); setFilterVariable(""); setFilterEvaluador("") }}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Limpiar búsqueda y filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayed.map((estudio) => {
            const days = daysUntil(estudio.fecha_limite)
            const dimCount = estudio.variables
              ? [...new Set(estudio.variables.map((v) => v.dimension))].length
              : 0

            return (
              <div key={estudio.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <BadgeEstado estado={estudio.estado} />
                      <BadgeAcceso tipo={estudio.modo_acceso} codigo={estudio.codigo} />
                      {estudio.modo_acceso === "invitacion_codigo" && (
                        <button onClick={() => copyCode(estudio)}
                          className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
                          title="Copiar código">
                          <Icon name={copiedId === estudio.id ? "check" : "content_copy"} className="text-xs" />
                          {copiedId === estudio.id ? "Copiado" : "Copiar código"}
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-on-surface text-base mb-1 truncate">{estudio.titulo}</h3>
                    {estudio.descripcion && (
                      <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{estudio.descripcion}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Icon name="list_alt" className="text-sm" />
                        {estudio.variables?.length ?? 0} variables · {dimCount} dimensión{dimCount !== 1 ? "es" : ""}
                      </span>
                      {estudio.fecha_limite && (
                        <span className={`flex items-center gap-1 font-medium ${
                          days === null ? "" : days <= 0 ? "text-error" : days <= 7 ? "text-amber-600" : "text-green-700"
                        }`}>
                          <Icon name="calendar_today" className="text-sm" />
                          {days === null ? "" : days <= 0 ? "Vencida" : `${days} días restantes`}
                          {" · "}{formatDate(estudio.fecha_limite)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Icon name="schedule" className="text-sm" />
                        Creada {formatDate(estudio.created_at?.split("T")[0])}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    {/* Resultados */}
                    <button
                      onClick={() => onViewResults(estudio)}
                      title="Ver resultados"
                      className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors"
                    >
                      <Icon name="analytics" className="text-base" />
                      <span className="hidden sm:inline">Resultados</span>
                    </button>
                    {/* Excel */}
                    <button
                      onClick={() => exportar(estudio, "excel")}
                      disabled={exportingId === estudio.id + "excel"}
                      title="Exportar a Excel"
                      className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-40"
                    >
                      <Icon name="table_view" className="text-base" />
                      {exportingId === estudio.id + "excel" ? "…" : <span className="hidden sm:inline">Excel</span>}
                    </button>
                    {/* PDF */}
                    <button
                      onClick={() => exportar(estudio, "pdf")}
                      disabled={exportingId === estudio.id + "pdf"}
                      title="Exportar a PDF"
                      className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-40"
                    >
                      <Icon name="picture_as_pdf" className="text-base" />
                      {exportingId === estudio.id + "pdf" ? "…" : <span className="hidden sm:inline">PDF</span>}
                    </button>
                    {/* Compartir */}
                    <button
                      onClick={() => copyLink(estudio)}
                      title="Copiar enlace"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        copiedLinkId === estudio.id
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <Icon name={copiedLinkId === estudio.id ? "check" : "share"} className="text-base" />
                      <span className="hidden sm:inline">{copiedLinkId === estudio.id ? "¡Copiado!" : "Compartir"}</span>
                    </button>
                    {/* Responder */}
                    <button
                      onClick={() => { window.location.hash = `#/evaluar/${estudio.id}` }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90"
                    >
                      <Icon name="open_in_new" className="text-base" />
                      <span className="hidden sm:inline">Responder</span>
                    </button>
                    {/* Reset avance */}
                    <button
                      onClick={() => resetEstudio(estudio)}
                      title="Borrar avance guardado"
                      className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:text-amber-600 hover:border-amber-300 transition-colors"
                    >
                      <Icon name="restart_alt" className="text-base" />
                    </button>
                    {/* Editar */}
                    <button
                      onClick={() => onEdit(estudio)}
                      title="Editar evaluación"
                      className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                    >
                      <Icon name="edit" className="text-base" />
                    </button>
                    {/* Toggle estado */}
                    <button
                      onClick={() => toggleEstado(estudio)}
                      title={estudio.estado === "activo" ? "Cerrar" : "Reactivar"}
                      className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      <Icon name={estudio.estado === "activo" ? "stop_circle" : "play_circle"} className="text-base" />
                    </button>
                    {/* Eliminar */}
                    <button
                      onClick={() => deleteEstudio(estudio)}
                      title="Eliminar"
                      className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:text-error hover:border-red-200 transition-colors"
                    >
                      <Icon name="delete" className="text-base" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
