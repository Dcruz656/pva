/**
 * ResponderEvaluacion — Interfaz exclusiva para evaluadores.
 * Completamente separada del panel de administración.
 * Los evaluadores SOLO ven la evaluación asignada, nada más.
 */
import { useState, useCallback, useEffect } from "react"
import { supabase } from "../lib/supabase"

const LIKERT = [
  { n: 1, short: "1", label: "Totalmente en desacuerdo" },
  { n: 2, short: "2", label: "En desacuerdo" },
  { n: 3, short: "3", label: "Neutral" },
  { n: 4, short: "4", label: "De acuerdo" },
  { n: 5, short: "5", label: "Totalmente de acuerdo" },
]

// ── Utilidades ─────────────────────────────────────────────────────────────

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

function formatDeadline(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function daysLeft(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr + "T23:59:59") - new Date()) / 86400000)
}

// ── Layout base del evaluador ──────────────────────────────────────────────

function EvalLayout({ progress, children }) {
  return (
    <div className="min-h-screen bg-[#f0f4fa] flex flex-col">
      {/* Barra mínima */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-14 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="school" className="text-white text-sm" />
            </div>
            <span className="font-bold text-primary text-sm tracking-tight hidden sm:block">
              Validación Académica
            </span>
          </div>
          {progress !== null && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:block">Tu progreso</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-primary w-8 text-right">{progress}%</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-400">
          Sistema de Validación Académica · Plataforma de investigación
        </p>
      </footer>
    </div>
  )
}

// ── Pantallas de estado ────────────────────────────────────────────────────

function ScreenLoading() {
  return (
    <EvalLayout progress={null}>
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-500">
        <Icon name="hourglass_empty" className="text-4xl" />
        <p className="text-sm">Cargando evaluación…</p>
      </div>
    </EvalLayout>
  )
}

function ScreenError() {
  return (
    <EvalLayout progress={null}>
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Icon name="link_off" className="text-red-500 text-3xl" />
        </div>
        <h2 className="font-bold text-xl text-slate-800">Evaluación no encontrada</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          El enlace no es válido, la evaluación fue eliminada o no tienes permisos para acceder.
        </p>
        <p className="text-xs text-slate-400">Si crees que es un error, contacta al responsable.</p>
      </div>
    </EvalLayout>
  )
}

function ScreenClosed({ estudio }) {
  return (
    <EvalLayout progress={null}>
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <Icon name="lock_clock" className="text-slate-500 text-3xl" />
        </div>
        <h2 className="font-bold text-xl text-slate-800">Evaluación cerrada</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          <strong>"{estudio.titulo}"</strong> ya no acepta nuevas respuestas.
        </p>
        <p className="text-xs text-slate-400">Contacta al responsable del estudio si necesitas más información.</p>
      </div>
    </EvalLayout>
  )
}

function ScreenDone({ estudio }) {
  return (
    <EvalLayout progress={100}>
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <Icon name="verified" className="text-green-500 text-5xl" />
        </div>
        <div className="space-y-2">
          <h2 className="font-bold text-2xl text-slate-800">¡Gracias por su participación!</h2>
          <p className="text-slate-500 max-w-sm text-sm">
            Sus respuestas para <strong>"{estudio.titulo}"</strong> han sido registradas correctamente.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full text-left space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-sm">
            <Icon name="check_circle" className="text-green-500" />
            <span className="text-slate-700">Respuestas guardadas en el sistema</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Icon name="science" className="text-primary" />
            <span className="text-slate-700">Sus datos contribuyen a la investigación</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Icon name="lock" className="text-slate-400" />
            <span className="text-slate-700">Información tratada de forma confidencial</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">Puede cerrar esta ventana.</p>
      </div>
    </EvalLayout>
  )
}

// ── Pantalla de código de acceso ───────────────────────────────────────────

function ScreenCode({ estudio, onVerify }) {
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)
  const [attempts, setAttempts] = useState(0)

  function verify() {
    if (input.trim().toUpperCase() === estudio.codigo?.toUpperCase()) {
      onVerify()
    } else {
      setError(true)
      setAttempts((a) => a + 1)
    }
  }

  return (
    <EvalLayout progress={null}>
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-md space-y-6">
          {/* Icon + título */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="key" className="text-primary text-3xl" />
            </div>
            <h1 className="font-bold text-xl text-slate-800">Ingrese su código de acceso</h1>
            <p className="text-sm text-slate-500">
              Esta evaluación es privada. Necesita el código que le proporcionó el responsable.
            </p>
          </div>

          {/* Info del estudio */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Evaluación</p>
            <p className="font-semibold text-slate-800 text-sm">{estudio.titulo}</p>
            {estudio.descripcion && (
              <p className="text-xs text-slate-500 mt-1">{estudio.descripcion}</p>
            )}
          </div>

          {/* Input */}
          <div className="space-y-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(false) }}
              onKeyDown={(e) => e.key === "Enter" && input.trim().length >= 2 && verify()}
              placeholder="Código de acceso"
              maxLength={12}
              autoFocus
              className={`w-full border-2 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-[0.4em]
                          bg-slate-50 uppercase focus:outline-none focus:ring-0
                          ${error
                            ? "border-red-400 bg-red-50 text-red-700"
                            : "border-slate-300 focus:border-primary text-slate-800"
                          }`}
            />
            {error && (
              <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
                <Icon name="error" className="text-sm" />
                Código incorrecto{attempts > 1 ? ` (${attempts} intentos)` : ""}. Verifique e intente de nuevo.
              </p>
            )}
          </div>

          <button
            onClick={verify}
            disabled={input.trim().length < 2}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90
                       disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <Icon name="login" className="text-base" /> Acceder a la evaluación
          </button>

          <p className="text-xs text-center text-slate-400">
            ¿No tiene el código? Contacte al responsable del estudio.
          </p>
        </div>
      </div>
    </EvalLayout>
  )
}

// ── Pantalla de bienvenida ─────────────────────────────────────────────────

function ScreenWelcome({ estudio, onStart }) {
  const variables = estudio.variables || []
  const dims = [...new Set(variables.map((v) => v.dimension))]
  const dl = daysLeft(estudio.fecha_limite)

  return (
    <EvalLayout progress={0}>
      <div className="flex flex-col items-center gap-6 py-8">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="quiz" className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Evaluación académica</p>
              <h1 className="font-bold text-2xl text-slate-800 leading-tight">{estudio.titulo}</h1>
            </div>
          </div>

          {estudio.descripcion && (
            <p className="text-slate-600 text-sm leading-relaxed mb-6">{estudio.descripcion}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <div className="text-2xl font-bold text-primary">{variables.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Variables</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <div className="text-2xl font-bold text-primary">{dims.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Dimensiones</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <div className="text-2xl font-bold text-primary">~{Math.ceil(variables.length * 0.75)}</div>
              <div className="text-xs text-slate-500 mt-0.5">Min. aprox.</div>
            </div>
          </div>

          {/* Deadline */}
          {dl !== null && (
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm ${
              dl <= 0 ? "bg-red-50 text-red-700 border border-red-200"
              : dl <= 7 ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              <Icon name="calendar_today" className="text-base flex-shrink-0" />
              <span>
                {dl <= 0
                  ? "Esta evaluación ha vencido"
                  : `Fecha límite: ${formatDeadline(estudio.fecha_limite)} · ${dl} día${dl !== 1 ? "s" : ""} restante${dl !== 1 ? "s" : ""}`
                }
              </span>
            </div>
          )}

          {/* Instrucciones */}
          <div className="border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
              <Icon name="info" className="text-primary text-base" /> Antes de comenzar
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {[
                "Evalúe cada ítem usando la escala del 1 al 5 en tres criterios: Claridad, Relevancia y Coherencia.",
                "Puede guardar su progreso en cualquier momento y continuar después.",
                "Una vez enviada la validación, no podrá modificarla.",
                "Sus observaciones en cada ítem son opcionales pero muy valiosas.",
              ].map((txt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Escala Likert */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Escala de valoración</p>
            <div className="grid grid-cols-5 gap-2">
              {LIKERT.map(({ n, label }) => (
                <div key={n} className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mx-auto mb-1">
                    {n}
                  </div>
                  <div className="text-xs text-slate-500 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full max-w-2xl py-4 bg-primary text-white font-bold rounded-2xl shadow-lg
                     hover:opacity-90 active:scale-[0.98] transition-all text-base flex items-center justify-center gap-3"
        >
          <Icon name="play_arrow" className="text-xl" />
          Comenzar evaluación
        </button>
      </div>
    </EvalLayout>
  )
}

// ── Tarjeta de variable (responsive) ──────────────────────────────────────

function VariableCard({ variable, idx, total, rating, onChange }) {
  const isComplete = rating.claridad && rating.relevancia && rating.coherencia

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
      isComplete ? "border-green-400" : "border-slate-200"
    }`}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {idx + 1}
          </span>
          <div>
            <div className="font-semibold text-slate-800 text-sm leading-snug">{variable.nombre}</div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Icon name="category" className="text-xs" />
              {variable.dimension}
            </div>
          </div>
        </div>
        {isComplete && (
          <Icon name="check_circle" className="text-green-500 text-xl flex-shrink-0" />
        )}
      </div>

      {/* Ratings */}
      <div className="px-5 pb-4 space-y-4">
        {[
          { field: "claridad",   label: "Claridad",   hint: "¿Qué tan claro es el enunciado?" },
          { field: "relevancia", label: "Relevancia",  hint: "¿Es pertinente para el estudio?" },
          { field: "coherencia", label: "Coherencia",  hint: "¿Es coherente con la dimensión?" },
        ].map(({ field, label, hint }) => (
          <div key={field}>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</span>
              <span className="text-xs text-slate-400">{hint}</span>
            </div>
            <div className="flex gap-2">
              {LIKERT.map(({ n, label: fullLabel }) => (
                <label
                  key={n}
                  title={fullLabel}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 cursor-pointer transition-all
                    ${rating[field] === n
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <span className={`text-sm font-bold ${rating[field] === n ? "text-primary" : "text-slate-500"}`}>
                    {n}
                  </span>
                  <input
                    type="radio"
                    name={`${field}_${variable.id}`}
                    value={n}
                    checked={rating[field] === n}
                    onChange={() => onChange(variable.id, field, n)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Observaciones */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">
            Observaciones <span className="font-normal text-slate-400 normal-case tracking-normal">(opcional)</span>
          </label>
          <textarea
            value={rating.observaciones}
            onChange={(e) => onChange(variable.id, "observaciones", e.target.value)}
            placeholder="Sugerencias, aclaraciones o comentarios sobre este ítem..."
            rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700
                       focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none
                       bg-slate-50 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Progress bar bottom */}
      <div className="h-1 rounded-b-2xl overflow-hidden bg-slate-100">
        <div
          className="h-1 bg-green-400 transition-all duration-300"
          style={{ width: `${(([rating.claridad, rating.relevancia, rating.coherencia].filter(Boolean).length) / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ── Formulario principal ───────────────────────────────────────────────────

function ScreenForm({ estudio, sessionId, onDone }) {
  const variables = estudio.variables || []
  const [ratings, setRatings] = useState(
    Object.fromEntries(variables.map((v) => [v.id, { claridad: null, relevancia: null, coherencia: null, observaciones: "" }]))
  )
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [toast, setToast] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const completedCount = variables.filter((v) => {
    const r = ratings[v.id]
    return r?.claridad && r?.relevancia && r?.coherencia
  }).length
  const progress = Math.round((completedCount / variables.length) * 100)
  const allComplete = completedCount === variables.length

  // Cargar borrador existente
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("respuestas")
        .select("*")
        .eq("estudio_id", estudio.id)
        .eq("session_id", sessionId)

      if (data && data.length > 0) {
        let latest = null
        setRatings((prev) => {
          const next = { ...prev }
          for (const row of data) {
            if (next[row.variable_id] !== undefined) {
              next[row.variable_id] = {
                claridad:      row.claridad      ?? null,
                relevancia:    row.relevancia    ?? null,
                coherencia:    row.coherencia    ?? null,
                observaciones: row.observaciones ?? "",
              }
              if (!latest || row.updated_at > latest) latest = row.updated_at
            }
          }
          return next
        })
        if (latest) setLastSaved(latest)
      }
      setLoadingExisting(false)
    }
    load()
  }, [estudio.id, sessionId])

  const notify = useCallback((type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const handleChange = useCallback((varId, field, value) => {
    setRatings((prev) => ({ ...prev, [varId]: { ...prev[varId], [field]: value } }))
  }, [])

  function buildRows(estado) {
    return variables.map((v) => ({
      estudio_id:    estudio.id,
      session_id:    sessionId,
      variable_id:   v.id,
      variable:      v.nombre,
      dimension:     v.dimension,
      claridad:      ratings[v.id].claridad,
      relevancia:    ratings[v.id].relevancia,
      coherencia:    ratings[v.id].coherencia,
      observaciones: ratings[v.id].observaciones || null,
      estado,
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("respuestas")
        .upsert(buildRows("borrador"), { onConflict: "estudio_id,session_id,variable_id" })
      if (error) throw error
      setLastSaved(new Date().toISOString())
      notify("success", "Progreso guardado. Puede continuar más tarde.")
    } catch (err) {
      notify("error", "No se pudo guardar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setShowConfirm(false)
    try {
      const { error } = await supabase
        .from("respuestas")
        .upsert(buildRows("enviado"), { onConflict: "estudio_id,session_id,variable_id" })
      if (error) throw error
      onDone()
    } catch (err) {
      notify("error", "No se pudo enviar: " + err.message)
      setSubmitting(false)
    }
  }

  if (loadingExisting) return (
    <EvalLayout progress={0}>
      <div className="flex justify-center py-32">
        <Icon name="hourglass_empty" className="text-primary text-5xl" />
      </div>
    </EvalLayout>
  )

  return (
    <EvalLayout progress={progress}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
                         rounded-2xl shadow-lg border text-sm font-medium whitespace-nowrap ${
          toast.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <Icon name={toast.type === "success" ? "check_circle" : "error"} className="text-base" />
          {toast.msg}
        </div>
      )}

      {/* Modal de confirmación de envío */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="send" className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">¿Enviar validación?</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 space-y-1">
              <div className="flex items-center gap-2">
                <Icon name="check" className="text-green-500 text-base" />
                {completedCount} de {variables.length} variables evaluadas
              </div>
              {completedCount < variables.length && (
                <div className="flex items-center gap-2 text-amber-600">
                  <Icon name="warning" className="text-base" />
                  {variables.length - completedCount} variable{variables.length - completedCount !== 1 ? "s" : ""} sin completar
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Revisar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Enviando…" : "Confirmar envío"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-32">
        {/* Cabecera del estudio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-bold text-lg text-slate-800 mb-1">{estudio.titulo}</h2>
          {estudio.descripcion && (
            <p className="text-sm text-slate-500 mb-3">{estudio.descripcion}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Icon name="list_alt" className="text-sm text-primary" />
              {variables.length} variables
            </span>
            <span className="flex items-center gap-1">
              <Icon name="check_circle" className="text-sm text-green-500" />
              {completedCount} completadas
            </span>
            {lastSaved && (
              <span className="flex items-center gap-1">
                <Icon name="save" className="text-sm" />
                Guardado {new Date(lastSaved).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* Cards de variables */}
        {variables.map((v, i) => (
          <VariableCard
            key={v.id}
            variable={v}
            idx={i}
            total={variables.length}
            rating={ratings[v.id]}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* Barra de acciones fija abajo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30">
        <div className="flex items-center justify-between gap-3 px-4 py-3 max-w-4xl mx-auto">
          <div className="text-sm text-slate-500 hidden sm:block">
            {allComplete
              ? <span className="text-green-600 font-semibold flex items-center gap-1"><Icon name="check_circle" className="text-base" />Todo completado</span>
              : <span>{variables.length - completedCount} pendiente{variables.length - completedCount !== 1 ? "s" : ""}</span>
            }
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold
                         rounded-xl text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Icon name="save" className="text-base" />
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting || !allComplete}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm
                         hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 shadow-md"
            >
              <Icon name="send" className="text-base" />
              {submitting ? "Enviando…" : "Enviar validación"}
            </button>
          </div>
        </div>
      </div>
    </EvalLayout>
  )
}

// ── Entry point ────────────────────────────────────────────────────────────

export default function ResponderEvaluacion({ studyId }) {
  const [phase, setPhase] = useState("loading")
  const [estudio, setEstudio] = useState(null)

  const sessionId = useState(() => {
    const key = `pva_session_${studyId}`
    let id = localStorage.getItem(key)
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).substring(2)
      localStorage.setItem(key, id)
    }
    return id
  })[0]

  useEffect(() => {
    async function init() {
      const { data: study, error } = await supabase
        .from("estudios")
        .select("*")
        .eq("id", studyId)
        .single()

      if (error || !study) { setPhase("error"); return }
      setEstudio(study)

      if (study.estado === "cerrado") { setPhase("closed"); return }

      // ¿Ya respondió?
      const { data: submitted } = await supabase
        .from("respuestas")
        .select("id")
        .eq("estudio_id", studyId)
        .eq("session_id", sessionId)
        .eq("estado", "enviado")
        .limit(1)
      if (submitted?.length > 0) { setPhase("done"); return }

      // ¿Requiere código?
      if (study.modo_acceso === "invitacion_codigo") {
        const ok = sessionStorage.getItem(`pva_code_${studyId}`)
        if (ok !== "ok") { setPhase("code"); return }
      }

      setPhase("welcome")
    }
    init()
  }, [studyId, sessionId])

  if (phase === "loading") return <ScreenLoading />
  if (phase === "error")   return <ScreenError />
  if (phase === "closed")  return <ScreenClosed estudio={estudio} />
  if (phase === "done")    return <ScreenDone estudio={estudio} />
  if (phase === "code") {
    return (
      <ScreenCode
        estudio={estudio}
        onVerify={() => {
          sessionStorage.setItem(`pva_code_${studyId}`, "ok")
          setPhase("welcome")
        }}
      />
    )
  }
  if (phase === "welcome") return <ScreenWelcome estudio={estudio} onStart={() => setPhase("form")} />

  return (
    <ScreenForm
      estudio={estudio}
      sessionId={sessionId}
      onDone={() => setPhase("done")}
    />
  )
}
