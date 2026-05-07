/**
 * ResponderEvaluacion — Interfaz exclusiva para evaluadores.
 * Completamente separada del panel de administración.
 */
import { useState, useCallback, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"

const LIKERT = [
  { n: 1, label: "Totalmente en desacuerdo", short: "Muy bajo",  color: { border: "border-red-400",    bg: "bg-red-50",    text: "text-red-600",   dot: "bg-red-400"   } },
  { n: 2, label: "En desacuerdo",            short: "Bajo",      color: { border: "border-orange-400", bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400" } },
  { n: 3, label: "Neutral",                  short: "Regular",   color: { border: "border-amber-400",  bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-400"  } },
  { n: 4, label: "De acuerdo",               short: "Alto",      color: { border: "border-lime-500",   bg: "bg-lime-50",   text: "text-lime-700",   dot: "bg-lime-500"   } },
  { n: 5, label: "Totalmente de acuerdo",    short: "Muy alto",  color: { border: "border-green-500",  bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  } },
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

// ── Layout base ────────────────────────────────────────────────────────────

function EvalLayout({ progress, title, children }) {
  return (
    <div className="min-h-screen bg-[#f0f4fa] flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-6 h-14 max-w-4xl mx-auto gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Icon name="school" className="text-white text-sm" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-primary text-sm leading-none tracking-tight">Validación Académica</p>
              {title && <p className="text-xs text-slate-400 leading-none mt-0.5 truncate max-w-[200px]">{title}</p>}
            </div>
          </div>

          {/* Progress */}
          {progress !== null && (
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className="text-xs text-slate-500 hidden sm:block">Progreso</span>
              <div className="flex items-center gap-2">
                <div className="w-36 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      progress === 100 ? "bg-green-500" : "bg-primary"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-9 text-right ${progress === 100 ? "text-green-600" : "text-primary"}`}>
                  {progress}%
                </span>
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
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        <p className="text-sm">Cargando evaluación…</p>
      </div>
    </EvalLayout>
  )
}

function ScreenError() {
  return (
    <EvalLayout progress={null}>
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <Icon name="link_off" className="text-red-400 text-4xl" />
        </div>
        <div className="space-y-2">
          <h2 className="font-bold text-xl text-slate-800">Evaluación no encontrada</h2>
          <p className="text-sm text-slate-500 max-w-sm">
            El enlace no es válido, la evaluación fue eliminada o no tiene permisos para acceder.
          </p>
        </div>
        <p className="text-xs text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
          Si cree que es un error, contacte al responsable del estudio.
        </p>
      </div>
    </EvalLayout>
  )
}

function ScreenClosed({ estudio }) {
  return (
    <EvalLayout progress={null} title={estudio.titulo}>
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Icon name="lock_clock" className="text-slate-400 text-4xl" />
        </div>
        <div className="space-y-2">
          <h2 className="font-bold text-xl text-slate-800">Evaluación cerrada</h2>
          <p className="text-sm text-slate-500 max-w-sm">
            <strong>"{estudio.titulo}"</strong> ya no acepta nuevas respuestas.
          </p>
        </div>
        <p className="text-xs text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
          Contacte al responsable del estudio para más información.
        </p>
      </div>
    </EvalLayout>
  )
}

function ScreenDone({ estudio, sessionId }) {
  const variables = estudio.variables || []
  const dims = [...new Set(variables.map((v) => v.dimension))]

  return (
    <EvalLayout progress={100} title={estudio.titulo}>
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        {/* Icono */}
        <div className="relative">
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="verified" className="text-green-500 text-6xl" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
            <Icon name="school" className="text-white text-lg" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-2xl text-slate-800">¡Gracias por su participación!</h2>
          <p className="text-slate-500 text-sm max-w-md">
            Su validación de <strong>"{estudio.titulo}"</strong> ha sido registrada exitosamente.
          </p>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md text-left overflow-hidden">
          <div className="bg-primary px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Resumen de su envío</p>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { icon: "quiz",      label: "Variables evaluadas",  value: variables.length },
              { icon: "category",  label: "Dimensiones cubiertas", value: dims.length },
              { icon: "badge",     label: "ID de sesión",          value: sessionId.substring(0, 12) + "…" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name={icon} className="text-primary text-base" />
                  {label}
                </div>
                <span className="font-semibold text-slate-800 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmaciones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 w-full max-w-md space-y-3">
          {[
            { icon: "check_circle",   color: "text-green-500", text: "Respuestas guardadas en el sistema" },
            { icon: "science",        color: "text-primary",   text: "Sus datos contribuyen a la investigación" },
            { icon: "lock",           color: "text-slate-400", text: "Información tratada de forma confidencial" },
          ].map(({ icon, color, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-slate-700">
              <Icon name={icon} className={`${color} flex-shrink-0`} />
              {text}
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400">Puede cerrar esta ventana con seguridad.</p>
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
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="key" className="text-primary text-3xl" />
            </div>
            <h1 className="font-bold text-xl text-slate-800">Ingrese su código de acceso</h1>
            <p className="text-sm text-slate-500">
              Esta evaluación es privada. Necesita el código proporcionado por el responsable.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Evaluación</p>
            <p className="font-semibold text-slate-800 text-sm">{estudio.titulo}</p>
            {estudio.descripcion && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{estudio.descripcion}</p>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(false) }}
              onKeyDown={(e) => e.key === "Enter" && input.trim().length >= 2 && verify()}
              placeholder="CÓDIGO"
              maxLength={12}
              autoFocus
              className={`w-full border-2 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-[0.4em]
                          bg-slate-50 uppercase focus:outline-none transition-colors
                          ${error
                            ? "border-red-400 bg-red-50 text-red-700"
                            : "border-slate-300 focus:border-primary text-slate-800"
                          }`}
            />
            {error && (
              <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
                <Icon name="error" className="text-sm" />
                Código incorrecto{attempts > 1 ? ` · ${attempts} intentos` : ""}. Verifique e intente de nuevo.
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

  const dimData = dims.map((d) => ({
    name: d,
    count: variables.filter((v) => v.dimension === d).length,
  }))

  return (
    <EvalLayout progress={0} title={estudio.titulo}>
      <div className="flex flex-col gap-5 py-4 max-w-2xl mx-auto">

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-primary px-8 py-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Evaluación académica</p>
            <h1 className="font-bold text-2xl text-white leading-tight">{estudio.titulo}</h1>
          </div>
          {estudio.descripcion && (
            <div className="px-8 py-5 border-b border-slate-100">
              <p className="text-slate-600 text-sm leading-relaxed">{estudio.descripcion}</p>
            </div>
          )}
          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { icon: "quiz",        value: variables.length, label: "variables" },
              { icon: "category",    value: dims.length,      label: "dimensiones" },
              { icon: "timer",       value: `~${Math.ceil(variables.length * 0.8)}`, label: "minutos" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <Icon name={icon} className="text-primary text-xl" />
                <span className="font-bold text-2xl text-slate-800">{value}</span>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fecha límite */}
        {dl !== null && (
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm border ${
            dl <= 0 ? "bg-red-50 text-red-700 border-red-200"
            : dl <= 7 ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-green-50 text-green-700 border-green-200"
          }`}>
            <Icon name="calendar_today" className="text-base flex-shrink-0" />
            {dl <= 0
              ? "Esta evaluación ha vencido."
              : `Fecha límite: ${formatDeadline(estudio.fecha_limite)} · ${dl} día${dl !== 1 ? "s" : ""} restante${dl !== 1 ? "s" : ""}`
            }
          </div>
        )}

        {/* Dimensiones */}
        {dimData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <Icon name="category" className="text-primary text-base" />
              Dimensiones a evaluar
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {dimData.map(({ name, count }, i) => (
                <div key={name} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{name}</p>
                    <p className="text-xs text-slate-400">{count} variable{count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones del investigador */}
        {estudio.instrucciones && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Icon name="assignment" className="text-primary text-base" /> Instrucciones del investigador
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {estudio.instrucciones}
            </p>
          </div>
        )}

        {/* Instrucciones generales */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <Icon name="info" className="text-primary text-base" /> Antes de comenzar
          </h3>
          <ul className="space-y-2">
            {[
              "Evalúe cada variable con la escala del 1 al 5 en tres criterios: Claridad, Relevancia y Coherencia.",
              "Puede guardar su progreso en cualquier momento y continuar después desde el mismo dispositivo.",
              "Una vez enviada la validación, no podrá modificarla.",
              "Sus observaciones en cada ítem son opcionales pero muy valiosas para el investigador.",
            ].map((txt, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {txt}
              </li>
            ))}
          </ul>
        </div>

        {/* Escala */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Escala de valoración</p>
          <div className="flex gap-2">
            {LIKERT.map(({ n, label, color }) => (
              <div key={n} className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 ${color.border} ${color.bg}`}>
                <span className={`text-base font-bold ${color.text}`}>{n}</span>
                <span className={`text-[10px] font-medium text-center leading-tight ${color.text} hidden sm:block`}>
                  {label.split(" ").slice(0, 2).join("\n")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg
                     hover:opacity-90 active:scale-[0.99] transition-all text-base flex items-center justify-center gap-3"
        >
          <Icon name="play_arrow" className="text-xl" />
          Comenzar evaluación
        </button>
      </div>
    </EvalLayout>
  )
}

// ── Tarjeta de variable ────────────────────────────────────────────────────

function VariableCard({ variable, idx, rating, onChange }) {
  const isComplete = rating.claridad && rating.relevancia && rating.coherencia
  const filledCount = [rating.claridad, rating.relevancia, rating.coherencia].filter(Boolean).length

  const CRITERIA = [
    { field: "claridad",   label: "Claridad",   hint: "¿Qué tan claro es el enunciado?" },
    { field: "relevancia", label: "Relevancia",  hint: "¿Es pertinente para el estudio?" },
    { field: "coherencia", label: "Coherencia",  hint: "¿Es coherente con la dimensión?" },
  ]

  return (
    <div
      id={`var-${variable.id}`}
      className={`bg-white rounded-2xl border-2 shadow-sm transition-all duration-300 ${
        isComplete ? "border-green-400 shadow-green-100" : "border-slate-200"
      }`}
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            isComplete
              ? "bg-green-500 text-white shadow-sm shadow-green-200"
              : "bg-slate-100 text-slate-500"
          }`}>
            {isComplete
              ? <Icon name="check" className="text-sm" />
              : <span>{idx + 1}</span>
            }
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-snug">{variable.nombre}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Icon name="category" className="text-xs" />
              {variable.dimension}
            </p>
          </div>
        </div>
        {/* Dots de progreso */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex gap-1">
            {CRITERIA.map(({ field }) => {
              const val = rating[field]
              const lk = val ? LIKERT[val - 1] : null
              return (
                <div
                  key={field}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    lk ? lk.color.dot : "bg-slate-200"
                  }`}
                />
              )
            })}
          </div>
          <span className="text-xs text-slate-400">{filledCount}/3</span>
        </div>
      </div>

      {/* Criterios */}
      <div className="px-5 py-4 space-y-5">
        {CRITERIA.map(({ field, label, hint }) => {
          const val = rating[field]
          const selectedLK = val ? LIKERT[val - 1] : null

          return (
            <div key={field}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</span>
                  {selectedLK && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${selectedLK.color.border} ${selectedLK.color.bg} ${selectedLK.color.text}`}>
                      {selectedLK.short}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 italic text-right hidden sm:block">{hint}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {LIKERT.map(({ n, label: fullLabel, color }) => {
                  const selected = val === n
                  return (
                    <label
                      key={n}
                      title={fullLabel}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none
                        ${selected
                          ? `${color.border} ${color.bg}`
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                      <span className={`text-base font-bold leading-none transition-colors ${selected ? color.text : "text-slate-400"}`}>
                        {n}
                      </span>
                      <span className={`text-[10px] leading-none font-medium hidden sm:block transition-colors ${selected ? color.text : "text-slate-300"}`}>
                        {n === 1 ? "Bajo" : n === 2 ? "Regular" : n === 3 ? "Medio" : n === 4 ? "Alto" : "Óptimo"}
                      </span>
                      <input
                        type="radio"
                        name={`${field}_${variable.id}`}
                        value={n}
                        checked={selected}
                        onChange={() => onChange(variable.id, field, n)}
                        className="sr-only"
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Observaciones */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">
            Observaciones{" "}
            <span className="font-normal text-slate-400 normal-case tracking-normal">(opcional)</span>
          </label>
          <textarea
            value={rating.observaciones}
            onChange={(e) => onChange(variable.id, "observaciones", e.target.value)}
            placeholder="Sugerencias, aclaraciones o comentarios sobre este ítem..."
            rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700
                       focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none
                       bg-slate-50 placeholder:text-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Barra de progreso inferior */}
      <div className="h-1.5 rounded-b-2xl overflow-hidden bg-slate-100">
        <div
          className={`h-1.5 transition-all duration-300 ${isComplete ? "bg-green-400" : "bg-primary/40"}`}
          style={{ width: `${(filledCount / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ── Formulario principal ───────────────────────────────────────────────────

function ScreenReview({ estudio, ratings, onConfirm, onBack, submitting }) {
  const variables = estudio.variables || []
  const dims = [...new Set(variables.map((v) => v.dimension))]

  const completedCount = variables.filter((v) => {
    const r = ratings[v.id]
    return r?.claridad && r?.relevancia && r?.coherencia
  }).length
  const incomplete = variables.length - completedCount

  return (
    <EvalLayout progress={Math.round((completedCount / variables.length) * 100)} title={estudio.titulo}>
      <div className="max-w-2xl mx-auto space-y-5 pb-32">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-primary px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Revisión de respuestas</p>
            <h2 className="font-bold text-xl text-white">{estudio.titulo}</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { icon: "quiz",         value: completedCount,           label: "completadas", color: "text-green-600" },
              { icon: "pending",      value: incomplete,               label: "pendientes",  color: incomplete > 0 ? "text-amber-600" : "text-slate-400" },
              { icon: "category",     value: dims.length,              label: "dimensiones", color: "text-primary" },
            ].map(({ icon, value, label, color }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <Icon name={icon} className={`text-xl ${color}`} />
                <span className={`font-bold text-2xl ${color}`}>{value}</span>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {incomplete > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            <Icon name="warning" className="flex-shrink-0" />
            {incomplete} variable{incomplete !== 1 ? "s" : ""} sin completar. Puede enviar de todas formas o regresar a completarlas.
          </div>
        )}

        {/* Variables por dimensión */}
        {dims.map((dim) => {
          const dimVars = variables.filter((v) => v.dimension === dim)
          return (
            <div key={dim} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <Icon name="category" className="text-primary text-base" />
                <span className="font-semibold text-slate-700 text-sm">{dim}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {dimVars.map((v) => {
                  const r = ratings[v.id]
                  const isComplete = r?.claridad && r?.relevancia && r?.coherencia
                  return (
                    <div key={v.id} className="px-5 py-3 flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isComplete ? "bg-green-500" : "bg-amber-200"
                      }`}>
                        <Icon name={isComplete ? "check" : "pending"} className="text-white text-xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{v.nombre}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {[
                            { label: "Claridad",   val: r?.claridad },
                            { label: "Relevancia", val: r?.relevancia },
                            { label: "Coherencia", val: r?.coherencia },
                          ].map(({ label, val }) => {
                            const lk = val ? LIKERT[val - 1] : null
                            return (
                              <span key={label} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                lk
                                  ? `${lk.color.border} ${lk.color.bg} ${lk.color.text}`
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                              }`}>
                                {label}: {val ? `${val} – ${lk?.short}` : "—"}
                              </span>
                            )
                          })}
                        </div>
                        {r?.observaciones && (
                          <p className="text-xs text-slate-500 mt-1 italic">"{r.observaciones}"</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra de acciones fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            <Icon name="arrow_back" className="text-base" /> Volver a editar
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
          >
            <Icon name="send" className="text-base" />
            {submitting ? "Enviando…" : "Confirmar y enviar"}
          </button>
        </div>
      </div>
    </EvalLayout>
  )
}

function ScreenForm({ estudio, sessionId, onDone }) {
  const variables = estudio.variables || []
  const dims = [...new Set(variables.map((v) => v.dimension))]

  const [ratings, setRatings] = useState(
    Object.fromEntries(
      variables.map((v) => [v.id, { claridad: null, relevancia: null, coherencia: null, observaciones: "" }])
    )
  )
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [toast, setToast] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [activeDim, setActiveDim] = useState(dims[0] ?? null)
  const dimRefs = useRef({})
  const autoSaveTimer = useRef(null)

  const completedCount = variables.filter((v) => {
    const r = ratings[v.id]
    return r?.claridad && r?.relevancia && r?.coherencia
  }).length
  const progress = variables.length > 0 ? Math.round((completedCount / variables.length) * 100) : 0
  const allComplete = completedCount === variables.length

  // Completados por dimensión
  const dimStats = dims.map((d) => {
    const dvars = variables.filter((v) => v.dimension === d)
    const done = dvars.filter((v) => ratings[v.id]?.claridad && ratings[v.id]?.relevancia && ratings[v.id]?.coherencia).length
    return { name: d, total: dvars.length, done }
  })

  // Cargar borrador existente
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("respuestas")
        .select("*")
        .eq("estudio_id", estudio.id)
        .eq("session_id", sessionId)

      if (data?.length > 0) {
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

  // Actualizar dimensión activa según scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveDim(e.target.dataset.dim)
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    )
    Object.values(dimRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [loadingExisting])

  // Auto-save silencioso (debounced 3 s)
  useEffect(() => {
    if (loadingExisting) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await supabase
          .from("respuestas")
          .upsert(buildRows("borrador"), { onConflict: "estudio_id,session_id,variable_id" })
        setLastSaved(new Date().toISOString())
      } catch {
        // silent fail — user can always save manually
      }
    }, 3000)
    return () => clearTimeout(autoSaveTimer.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratings, loadingExisting])

  // Variable siguiente sin completar
  const nextIncomplete = variables.find((v) => {
    const r = ratings[v.id]
    return !r?.claridad || !r?.relevancia || !r?.coherencia
  })

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

  function scrollToDim(dimName) {
    const el = dimRefs.current[dimName]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    setActiveDim(dimName)
  }

  if (loadingExisting) return (
    <EvalLayout progress={0} title={estudio.titulo}>
      <div className="flex justify-center py-32">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    </EvalLayout>
  )

  if (showReview) return (
    <ScreenReview
      estudio={estudio}
      ratings={ratings}
      submitting={submitting}
      onBack={() => setShowReview(false)}
      onConfirm={handleSubmit}
    />
  )

  return (
    <EvalLayout progress={progress} title={estudio.titulo}>
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

      {/* Modal de confirmación */}
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
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              {dimStats.map(({ name, done, total }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done === total ? "bg-green-400" : "bg-amber-400"}`} />
                  <span className="text-xs text-slate-600 flex-1 truncate">{name}</span>
                  <span className={`text-xs font-semibold ${done === total ? "text-green-600" : "text-amber-600"}`}>
                    {done}/{total}
                  </span>
                </div>
              ))}
            </div>
            {completedCount < variables.length && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2 text-xs">
                <Icon name="warning" className="text-base flex-shrink-0" />
                {variables.length - completedCount} variable{variables.length - completedCount !== 1 ? "s" : ""} sin completar
              </div>
            )}
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

      {/* Nav de dimensiones */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-2 bg-[#f0f4fa]/95 backdrop-blur-sm border-b border-slate-200 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {dimStats.map(({ name, done, total }) => {
            const isActive = activeDim === name
            const isDone = done === total
            return (
              <button
                key={name}
                onClick={() => scrollToDim(name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all border ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-sm"
                    : isDone
                    ? "bg-green-50 text-green-700 border-green-300"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {isDone
                  ? <Icon name="check_circle" className="text-xs" />
                  : <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? "bg-white/20" : "bg-slate-200 text-slate-500"}`}>{done}</span>
                }
                {name}
                <span className={`text-[10px] ${isActive ? "opacity-70" : "text-slate-400"}`}>{done}/{total}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Variables agrupadas por dimensión */}
      <div className="space-y-10 pb-36">
        {dims.map((dim) => {
          const dimVars = variables.filter((v) => v.dimension === dim)
          const stat = dimStats.find((d) => d.name === dim)

          return (
            <div
              key={dim}
              ref={(el) => { dimRefs.current[dim] = el }}
              data-dim={dim}
            >
              {/* Encabezado de dimensión */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                    stat.done === stat.total ? "bg-green-500" : "bg-primary"
                  }`}>
                    <Icon name={stat.done === stat.total ? "check" : "category"} className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{dim}</h3>
                    <p className="text-xs text-slate-400">{stat.total} variable{stat.total !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${stat.done === stat.total ? "bg-green-400" : "bg-primary"}`}
                      style={{ width: `${(stat.done / stat.total) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${stat.done === stat.total ? "text-green-600" : "text-slate-500"}`}>
                    {stat.done}/{stat.total}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {dimVars.map((v) => (
                  <VariableCard
                    key={v.id}
                    variable={v}
                    idx={variables.indexOf(v)}
                    rating={ratings[v.id]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra de acciones fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Mini progreso por dimensión */}
          <div className="flex gap-1 mb-3">
            {dimStats.map(({ name, done, total }) => (
              <div
                key={name}
                title={`${name}: ${done}/${total}`}
                className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200"
              >
                <div
                  className={`h-1.5 rounded-full transition-all ${done === total ? "bg-green-400" : "bg-primary"}`}
                  style={{ width: `${(done / total) * 100}%` }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm hidden sm:flex items-center gap-3">
              {allComplete ? (
                <span className="text-green-600 font-semibold flex items-center gap-1.5">
                  <Icon name="check_circle" className="text-base" />
                  Todas completadas
                </span>
              ) : (
                <span className="text-slate-500">
                  <strong className="text-slate-700">{completedCount}</strong>
                  <span className="text-slate-400">/{variables.length}</span> completadas
                </span>
              )}
              {lastSaved && (
                <span className="text-xs text-slate-400">
                  · Auto-guardado {new Date(lastSaved).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {nextIncomplete && !allComplete && (
                <button
                  onClick={() => document.getElementById(`var-${nextIncomplete.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 text-slate-600 font-semibold
                             rounded-xl text-sm hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon name="arrow_downward" className="text-base" />
                  <span className="hidden sm:inline">Pendiente</span>
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold
                           rounded-xl text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Icon name="save" className="text-base" />
                {saving ? "…" : "Guardar"}
              </button>
              <button
                onClick={() => setShowReview(true)}
                disabled={submitting}
                className={`flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-xl text-sm
                           flex items-center justify-center gap-2 transition-all shadow-md
                           bg-primary text-white hover:opacity-90
                           disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Icon name="fact_check" className="text-base" />
                {allComplete ? "Revisar y enviar" : `Revisar (${variables.length - completedCount} faltan)`}
              </button>
            </div>
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

      const { data: submitted } = await supabase
        .from("respuestas")
        .select("id")
        .eq("estudio_id", studyId)
        .eq("session_id", sessionId)
        .eq("estado", "enviado")
        .limit(1)
      if (submitted?.length > 0) { setPhase("done"); return }

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
  if (phase === "done")    return <ScreenDone estudio={estudio} sessionId={sessionId} />
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
