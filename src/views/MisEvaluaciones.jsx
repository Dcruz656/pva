import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { exportarRespuestasExcel, exportarRespuestasPDF } from "../lib/exportar"

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

export default function MisEvaluaciones({ onCreateNew, onOpenEvaluation }) {
  const [estudios, setEstudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null) // { id, action, message }
  const [copiedId, setCopiedId] = useState(null)
  const [copiedLinkId, setCopiedLinkId] = useState(null)
  const [exportingId, setExportingId] = useState(null) // estudio.id + format

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from("estudios")
      .select("*")
      .order("created_at", { ascending: false })
    setEstudios(data || [])
    setLoading(false)
  }

  async function toggleEstado(estudio) {
    const nuevoEstado = estudio.estado === "activo" ? "cerrado" : "activo"
    const msg = nuevoEstado === "cerrado"
      ? `¿Cerrar "${estudio.titulo}"? Los respondientes ya no podrán acceder.`
      : `¿Reactivar "${estudio.titulo}"?`
    setConfirm({
      message: msg,
      onConfirm: async () => {
        await supabase.from("estudios").update({ estado: nuevoEstado }).eq("id", estudio.id)
        setEstudios((prev) => prev.map((e) => e.id === estudio.id ? { ...e, estado: nuevoEstado } : e))
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

  function openEvaluation(estudio) {
    window.location.hash = `#/evaluar/${estudio.id}`
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
    <div className="space-y-8">
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
          <p className="text-sm text-on-surface-variant">Evaluaciones creadas en esta plataforma</p>
        </div>
        <button onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 text-sm">
          <Icon name="add" className="text-base" /> Nueva Evaluación
        </button>
      </div>

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
      ) : (
        <div className="grid gap-4">
          {estudios.map((estudio) => {
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
                    <button
                      onClick={() => exportar(estudio, "excel")}
                      disabled={exportingId === estudio.id + "excel"}
                      title="Exportar respuestas a Excel"
                      className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-40"
                    >
                      <Icon name="table_view" className="text-base" />
                      {exportingId === estudio.id + "excel" ? "…" : "Excel"}
                    </button>
                    <button
                      onClick={() => exportar(estudio, "pdf")}
                      disabled={exportingId === estudio.id + "pdf"}
                      title="Exportar respuestas a PDF"
                      className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-40"
                    >
                      <Icon name="picture_as_pdf" className="text-base" />
                      {exportingId === estudio.id + "pdf" ? "…" : "PDF"}
                    </button>
                    <button
                      onClick={() => copyLink(estudio)}
                      title="Copiar enlace para respondientes"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        copiedLinkId === estudio.id
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <Icon name={copiedLinkId === estudio.id ? "check" : "share"} className="text-base" />
                      {copiedLinkId === estudio.id ? "¡Enlace copiado!" : "Compartir"}
                    </button>
                    <button
                      onClick={() => openEvaluation(estudio)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90"
                    >
                      <Icon name="open_in_new" className="text-base" /> Responder
                    </button>
                    <button
                      onClick={() => toggleEstado(estudio)}
                      title={estudio.estado === "activo" ? "Cerrar evaluación" : "Reactivar"}
                      className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      <Icon name={estudio.estado === "activo" ? "stop_circle" : "play_circle"} className="text-base" />
                    </button>
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
