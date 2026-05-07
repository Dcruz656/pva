import { useState, useCallback, useEffect } from "react"
import { supabase } from "./lib/supabase"
import CrearEvaluacion from "./views/CrearEvaluacion"
import MisEvaluaciones from "./views/MisEvaluaciones"
import { exportarHistorialExcel, exportarHistorialPDF } from "./lib/exportar"

const STUDY_ID = "STUDY-2024-082"
const DEADLINE = new Date("2026-06-15")

const VARIABLES = [
  { id: 1, nombre: "Frecuencia de uso de dispositivos",           dimension: "Hábitos Digitales" },
  { id: 2, nombre: "Nivel de concentración percibida",            dimension: "Rendimiento Cognitivo" },
  { id: 3, nombre: "Uso de herramientas de gestión de tiempo",    dimension: "Autorregulación" },
  { id: 4, nombre: "Calidad del sueño relacionada con pantallas", dimension: "Bienestar Físico" },
  { id: 5, nombre: "Nivel de ansiedad digital",                   dimension: "Salud Mental" },
  { id: 6, nombre: "Rendimiento en evaluaciones formales",        dimension: "Desempeño Académico" },
  { id: 7, nombre: "Participación en clases presenciales",        dimension: "Engagement Académico" },
  { id: 8, nombre: "Uso de redes sociales durante el estudio",    dimension: "Hábitos Digitales" },
  { id: 9, nombre: "Autopercepción del rendimiento académico",    dimension: "Metacognición" },
]

const LIKERT_LABELS = [
  "Totalmente\nen desacuerdo",
  "En\ndesacuerdo",
  "Neutral",
  "De\nacuerdo",
  "Totalmente\nde acuerdo",
]

const DIMENSIONS = [...new Set(VARIABLES.map((v) => v.dimension))]

function daysUntil(date) {
  return Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ── Shared components ──────────────────────────────────────────────────────

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

function RatingGroup({ groupName, value, onChange, disabled }) {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="flex flex-col items-center gap-1 cursor-pointer group">
          <span className={`text-xs font-bold transition-colors ${
            value === n ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
          }`}>{n}</span>
          <input
            type="radio"
            name={groupName}
            value={n}
            checked={value === n}
            onChange={() => onChange(n)}
            disabled={disabled}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
        </label>
      ))}
    </div>
  )
}

function VariableRow({ variable, rating, onChange, submitted }) {
  const isComplete = rating.claridad && rating.relevancia && rating.coherencia
  return (
    <tr className="hover:bg-surface-container-low transition-colors border-b border-outline-variant">
      <td className="px-6 py-4">
        <div className="flex items-start gap-2">
          <Icon
            name={isComplete ? "check_circle" : "radio_button_unchecked"}
            className={`text-base mt-0.5 flex-shrink-0 ${isComplete ? "text-green-600" : "text-outline"}`}
          />
          <div>
            <div className="font-semibold text-primary text-sm">{variable.nombre}</div>
            <div className="text-xs text-on-surface-variant mt-0.5">{variable.dimension}</div>
          </div>
        </div>
      </td>
      {["claridad", "relevancia", "coherencia"].map((field) => (
        <td key={field} className="px-4 py-4">
          <RatingGroup
            groupName={`${field}_${variable.id}`}
            value={rating[field]}
            onChange={(v) => onChange(variable.id, field, v)}
            disabled={submitted}
          />
        </td>
      ))}
      <td className="px-4 py-4">
        <textarea
          value={rating.observaciones}
          onChange={(e) => onChange(variable.id, "observaciones", e.target.value)}
          disabled={submitted}
          placeholder="Escriba aquí..."
          rows={2}
          className="w-full bg-surface border border-outline-variant rounded p-2 text-xs
                     focus:border-primary focus:ring-1 focus:ring-primary resize-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
    </tr>
  )
}

function Toast({ notification, onClose }) {
  if (!notification) return null
  const ok = notification.type === "success"
  return (
    <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
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

function DashboardView({ ratings, progress, completedCount, lastSaved, expertoCount, onNavigate }) {
  const daysLeft = daysUntil(DEADLINE)

  const byDimension = DIMENSIONS.map((dim) => {
    const vars = VARIABLES.filter((v) => v.dimension === dim)
    const done = vars.filter((v) => ratings[v.id]?.claridad && ratings[v.id]?.relevancia && ratings[v.id]?.coherencia).length
    return { dim, total: vars.length, done }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl text-primary mb-1">Panel de Control</h2>
        <p className="text-sm text-on-surface-variant">Resumen del estado de validación — Estudio {STUDY_ID}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Variables totales", value: VARIABLES.length,                 icon: "list_alt",     bg: "bg-surface-container-high" },
          { label: "Completadas",       value: completedCount,                   icon: "check_circle", bg: "bg-green-50" },
          { label: "Pendientes",        value: VARIABLES.length - completedCount, icon: "pending",      bg: "bg-amber-50" },
          { label: "Envíos recibidos",  value: expertoCount,                     icon: "groups",       bg: "bg-secondary-container" },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-outline-variant p-5`}>
            <Icon name={icon} className="text-primary text-2xl mb-2 block" />
            <div className="text-3xl font-bold text-on-surface">{value}</div>
            <div className="text-xs text-on-surface-variant mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress + Deadline */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="timeline" className="text-primary" /> Progreso General
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl font-bold text-primary">{progress}%</div>
            <div className="flex-1">
              <div className="w-full bg-surface-container-high rounded-full h-3 mb-1">
                <div className="bg-primary h-3 rounded-full transition-all duration-700"
                     style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-on-surface-variant">{completedCount} de {VARIABLES.length} variables</p>
            </div>
          </div>
          {lastSaved && (
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-2">
              <Icon name="save" className="text-sm" /> Último guardado: {formatDate(lastSaved)}
            </p>
          )}
          <button onClick={() => onNavigate("variables")}
            className="mt-4 w-full bg-primary text-on-primary py-2 rounded-lg text-sm font-semibold hover:opacity-90">
            Continuar Validación
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="event" className="text-primary" /> Fecha Límite
          </h3>
          <div className="text-base font-bold text-primary mb-1">
            {DEADLINE.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className={`text-4xl font-bold mb-1 ${
            daysLeft <= 0 ? "text-error" : daysLeft <= 5 ? "text-error" : daysLeft <= 14 ? "text-amber-600" : "text-green-700"
          }`}>
            {daysLeft > 0 ? `${daysLeft} días` : "Vencido"}
          </div>
          <p className="text-xs text-on-surface-variant">
            {daysLeft > 0 ? "restantes para el cierre" : "El período de validación ha concluido"}
          </p>
        </div>
      </div>

      {/* By dimension */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Icon name="category" className="text-primary" /> Progreso por Dimensión
        </h3>
        <div className="space-y-3">
          {byDimension.map(({ dim, total, done }) => (
            <div key={dim}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface-variant font-medium">{dim}</span>
                <span className="font-bold text-primary">{done}/{total}</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${done === total && total > 0 ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${(done / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── View: Historial ────────────────────────────────────────────────────────

function HistorialView() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("todos")

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from("validaciones")
        .select("*")
        .order("updated_at", { ascending: false })
      if (!error) setRecords(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === "todos" ? records : records.filter((r) => r.estado === filter)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="font-bold text-2xl text-primary mb-1">Historial de Revisiones</h2>
          <p className="text-sm text-on-surface-variant">Todos los registros guardados para el estudio {STUDY_ID}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportarHistorialExcel(filtered, filter)} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-secondary-container disabled:opacity-40">
            <Icon name="table_view" className="text-base" /> Excel
          </button>
          <button onClick={() => exportarHistorialPDF(filtered, filter)} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40">
            <Icon name="picture_as_pdf" className="text-base" /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[{ key: "todos", label: "Todos" }, { key: "borrador", label: "Borrador" }, { key: "enviado", label: "Enviado" }].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === key
                ? "bg-primary text-on-primary"
                : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">
          <Icon name="hourglass_empty" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">Cargando registros...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant border border-outline-variant rounded-xl">
          <Icon name="inbox" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">No hay registros {filter !== "todos" ? `con estado "${filter}"` : "aún"}.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  {["#", "Variable", "Dimensión", "Claridad", "Relevancia", "Coherencia", "Estado", "Actualizado"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{r.variable_id}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">{r.variable}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{r.dimension}</td>
                    {["claridad", "relevancia", "coherencia"].map((f) => (
                      <td key={f} className="px-4 py-3 text-center">
                        <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
                          r[f] >= 4 ? "bg-green-100 text-green-800"
                          : r[f] === 3 ? "bg-amber-100 text-amber-800"
                          : r[f] ? "bg-red-100 text-red-800"
                          : "bg-surface-container text-on-surface-variant"
                        }`}>{r[f] ?? "—"}</span>
                      </td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── View: Configuración ────────────────────────────────────────────────────

function ConfiguracionView({ onReset, lastSaved }) {
  const daysLeft = daysUntil(DEADLINE)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl text-primary mb-1">Configuración del Estudio</h2>
        <p className="text-sm text-on-surface-variant">Información general del instrumento de validación</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl divide-y divide-outline-variant">
        {[
          { label: "ID del Estudio",      value: STUDY_ID },
          { label: "Título",              value: "Impacto del Bienestar Digital en el Rendimiento Académico" },
          { label: "Total de variables",  value: `${VARIABLES.length} ítems` },
          { label: "Dimensiones",         value: DIMENSIONS.join(", ") },
          { label: "Fecha límite",        value: DEADLINE.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) },
          { label: "Días restantes",      value: daysLeft > 0 ? `${daysLeft} días` : "Período vencido" },
          { label: "Protocolo",           value: "v2.4" },
          { label: "Base de datos",       value: "Supabase — tabla validaciones" },
          { label: "Último guardado",     value: lastSaved ? formatDate(lastSaved) : "Sin guardar aún" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-6 py-4 gap-4">
            <span className="text-sm text-on-surface-variant">{label}</span>
            <span className="text-sm text-on-surface font-semibold text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Likert reference */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Icon name="straighten" className="text-primary" /> Escala Likert de Referencia
        </h3>
        <div className="grid grid-cols-5 gap-3 text-center">
          {LIKERT_LABELS.map((label, i) => (
            <div key={i} className="bg-surface-container-low rounded-lg p-3">
              <div className="font-bold text-primary text-xl mb-1">{i + 1}</div>
              <div className="text-xs text-on-surface-variant whitespace-pre-line leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-error-container border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-on-error-container mb-2 flex items-center gap-2">
          <Icon name="warning" className="text-error" /> Zona de Riesgo
        </h3>
        <p className="text-sm text-on-error-container mb-4">
          Reiniciar el formulario borrará todas las respuestas locales. Los datos ya guardados en Supabase no se eliminan.
        </p>
        <button onClick={onReset}
          className="px-5 py-2 bg-error text-on-error rounded-lg text-sm font-bold hover:opacity-90">
          Reiniciar formulario local
        </button>
      </div>
    </div>
  )
}

// ── View: Variables (form) ─────────────────────────────────────────────────

function VariablesView({ ratings, completedCount, allComplete, submitted, saving, submitting, onChange, onSave, onSubmit, lastSaved, expertoCount, onNavigate }) {
  const daysLeft = daysUntil(DEADLINE)
  const progress = Math.round((completedCount / VARIABLES.length) * 100)

  return (
    <>
      {/* Section header */}
      <section id="section-estudio" className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-lg">
            Validación Académica
          </span>
          <span className="text-on-surface-variant text-xs font-mono">ID: {STUDY_ID}</span>
        </div>
        <h1 className="font-bold text-4xl text-primary mb-6 tracking-tight leading-tight">
          Impacto del Bienestar Digital en el Rendimiento Académico
        </h1>

        {/* Instructions */}
        <div id="section-instrucciones" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex gap-4 items-start">
            <Icon name="info" className="text-primary text-3xl flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-on-surface mb-2">Instrucciones para el Validador</h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Por favor, evalúe cada ítem de acuerdo con su experiencia profesional utilizando la escala de Likert propuesta.
                Sus comentarios son fundamentales para refinar el instrumento de investigación.
              </p>
              <div className="grid grid-cols-5 gap-3 bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                {LIKERT_LABELS.map((label, i) => (
                  <div key={i} className="text-center">
                    <div className="font-bold text-primary text-base">{i + 1}</div>
                    <div className="text-xs text-on-surface-variant whitespace-pre-line leading-tight mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submitted banner */}
      {submitted && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-4 text-green-800">
          <Icon name="verified" className="text-2xl" />
          <span className="font-semibold">Validación enviada exitosamente. Sus respuestas han sido registradas.</span>
        </div>
      )}

      {/* Validation Table */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant w-1/4">
                  Variable / Ítem
                </th>
                {["Claridad", "Relevancia", "Coherencia"].map((h) => (
                  <th key={h} className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">{h}</th>
                ))}
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {VARIABLES.map((variable) => (
                <VariableRow
                  key={variable.id}
                  variable={variable}
                  rating={ratings[variable.id]}
                  onChange={onChange}
                  submitted={submitted}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-between items-center gap-6 mb-12 flex-wrap">
        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
          {!allComplete ? (
            <>
              <Icon name="pending" className="text-amber-500" />
              <span>Faltan <strong>{VARIABLES.length - completedCount}</strong> variables por evaluar</span>
            </>
          ) : (
            <>
              <Icon name="check_circle" className="text-green-600" />
              <span className="text-green-700 font-medium">Todas las variables evaluadas</span>
            </>
          )}
          {lastSaved && (
            <span className="text-xs text-on-surface-variant hidden md:inline">
              · Guardado {formatDate(lastSaved)}
            </span>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={onSave}
            disabled={saving || submitted}
            className="px-8 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-secondary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {saving ? "Guardando..." : "Guardar Progreso"}
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || submitted || !allComplete}
            className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {submitting ? "Enviando…" : submitted
              ? <><Icon name="check" className="text-base" />Enviado</>
              : "Finalizar y Enviar Validación"
            }
          </button>
        </div>
      </div>

      {/* Bento cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-primary-container p-6 rounded-xl text-on-primary-container flex flex-col justify-between hover:opacity-90 transition-opacity text-left"
        >
          <div>
            <Icon name="timeline" className="text-3xl mb-2 block" />
            <h4 className="font-semibold text-lg mb-2">Progreso Actual</h4>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">{progress}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-white h-2 rounded-full transition-all duration-500"
                   style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm opacity-80">{completedCount} de {VARIABLES.length} variables revisadas</p>
          </div>
        </button>

        <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant flex flex-col justify-between">
          <div>
            <Icon name="groups" className="text-primary text-3xl mb-2 block" />
            <h4 className="font-semibold text-lg text-on-surface mb-3">Panel de Expertos</h4>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">{expertoCount}</div>
            <p className="text-sm text-on-surface-variant">
              {expertoCount === 1 ? "validación enviada" : "validaciones enviadas"}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Revisión colegiada activa</p>
          </div>
        </div>

        <div className="bg-surface-container-highest p-6 rounded-xl border border-outline-variant relative overflow-hidden">
          <div className="relative z-10">
            <Icon name="calendar_today" className="text-primary text-3xl mb-2 block" />
            <h4 className="font-semibold text-lg text-on-surface mb-2">Fecha Límite</h4>
            <div className="text-base font-bold text-primary">
              {DEADLINE.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <p className={`text-sm font-bold mt-1 ${
              daysLeft <= 0 ? "text-error" : daysLeft <= 5 ? "text-error" : daysLeft <= 14 ? "text-amber-600" : "text-green-700"
            }`}>
              {daysLeft > 0 ? `Quedan ${daysLeft} días` : "Período vencido"}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Icon name="event" className="text-[100px]" />
          </div>
        </div>
      </div>
    </>
  )
}

// ── Help Modal ─────────────────────────────────────────────────────────────

function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 max-w-md w-full shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-2">
            <Icon name="help" className="text-primary text-2xl" />
            <h3 className="font-bold text-lg text-primary">Guía de Uso</h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <Icon name="close" />
          </button>
        </div>
        <ol className="space-y-4 text-sm text-on-surface-variant list-none">
          {[
            { n: "1", text: "Evalúe cada variable con la escala 1–5 en Claridad, Relevancia y Coherencia." },
            { n: "2", text: 'Use "Guardar Progreso" para guardar un borrador en cualquier momento.' },
            { n: "3", text: 'Cuando complete todas las variables, se habilitará "Finalizar y Enviar".' },
            { n: "4", text: "Consulte el Historial para ver todas sus respuestas guardadas y exportarlas a CSV." },
            { n: "5", text: "El Panel de Control muestra su avance por dimensión y estadísticas generales." },
          ].map(({ n, text }) => (
            <li key={n} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center justify-center">
                {n}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <button onClick={onClose}
          className="mt-6 w-full bg-primary text-on-primary py-2 rounded-lg text-sm font-bold hover:opacity-90">
          Entendido
        </button>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────

const emptyRating = () => ({ claridad: null, relevancia: null, coherencia: null, observaciones: "" })

export default function App({ onLogout }) {
  const [view, setView] = useState("variables")
  const [ratings, setRatings] = useState(
    Object.fromEntries(VARIABLES.map((v) => [v.id, emptyRating()]))
  )
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notification, setNotification] = useState(null)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [lastSaved, setLastSaved] = useState(null)
  const [expertoCount, setExpertoCount] = useState(0)
  const [showHelp, setShowHelp] = useState(false)

  const completedCount = VARIABLES.filter((v) => {
    const r = ratings[v.id]
    return r?.claridad && r?.relevancia && r?.coherencia
  }).length
  const progress = Math.round((completedCount / VARIABLES.length) * 100)
  const allComplete = completedCount === VARIABLES.length

  // Load saved state + expert count on mount
  useEffect(() => {
    async function init() {
      const [{ data }, { count }] = await Promise.all([
        supabase.from("validaciones").select("*").eq("study_id", STUDY_ID),
        supabase.from("validaciones").select("*", { count: "exact", head: true }).eq("estado", "enviado"),
      ])

      if (data && data.length > 0) {
        const restored = Object.fromEntries(VARIABLES.map((v) => [v.id, emptyRating()]))
        let latestUpdate = null
        let wasSubmitted = false
        for (const row of data) {
          if (restored[row.variable_id] !== undefined) {
            restored[row.variable_id] = {
              claridad:      row.claridad      ?? null,
              relevancia:    row.relevancia    ?? null,
              coherencia:    row.coherencia    ?? null,
              observaciones: row.observaciones ?? "",
            }
            if (!latestUpdate || row.updated_at > latestUpdate) latestUpdate = row.updated_at
            if (row.estado === "enviado") wasSubmitted = true
          }
        }
        setRatings(restored)
        setLastSaved(latestUpdate)
        if (wasSubmitted) setSubmitted(true)
      }

      setExpertoCount(count ?? 0)
      setLoadingInitial(false)
    }
    init()
  }, [])

  const notify = useCallback((type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }, [])

  const handleChange = useCallback((variableId, field, value) => {
    setRatings((prev) => ({
      ...prev,
      [variableId]: { ...prev[variableId], [field]: value },
    }))
  }, [])

  const buildRows = useCallback((estado) =>
    VARIABLES.map((v) => ({
      study_id:      STUDY_ID,
      variable_id:   v.id,
      variable:      v.nombre,
      dimension:     v.dimension,
      claridad:      ratings[v.id].claridad,
      relevancia:    ratings[v.id].relevancia,
      coherencia:    ratings[v.id].coherencia,
      observaciones: ratings[v.id].observaciones || null,
      estado,
    })),
  [ratings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("validaciones")
        .upsert(buildRows("borrador"), { onConflict: "study_id,variable_id" })
      if (error) throw error
      const now = new Date().toISOString()
      setLastSaved(now)
      notify("success", "Progreso guardado correctamente.")
    } catch (err) {
      notify("error", "Error al guardar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!allComplete) {
      notify("error", "Debe evaluar todas las variables antes de enviar.")
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from("validaciones")
        .upsert(buildRows("enviado"), { onConflict: "study_id,variable_id" })
      if (error) throw error
      setSubmitted(true)
      setExpertoCount((c) => c + 1)
      const now = new Date().toISOString()
      setLastSaved(now)
      notify("success", "¡Validación enviada exitosamente. Gracias!")
    } catch (err) {
      notify("error", "Error al enviar: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (!confirm("¿Reiniciar el formulario local? Los datos en Supabase no se borran.")) return
    setRatings(Object.fromEntries(VARIABLES.map((v) => [v.id, emptyRating()])))
    setSubmitted(false)
    setLastSaved(null)
    setView("variables")
    notify("success", "Formulario reiniciado.")
  }

  function scrollToSection(id) {
    setView("variables")
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60)
  }

  const navItems = [
    { label: "Estudio",       action: () => scrollToSection("section-estudio") },
    { label: "Metodología",   action: () => scrollToSection("section-instrucciones") },
    { label: "Variables",     action: () => setView("variables") },
    { label: "Instrucciones", action: () => scrollToSection("section-instrucciones") },
  ]

  const sidebarItems = [
    { icon: "dashboard",  label: "Panel de Control",        viewKey: "dashboard" },
    { icon: "fact_check", label: "Variables Pendientes",    viewKey: "variables" },
    { icon: "history",    label: "Historial de Revisiones", viewKey: "historial" },
    { icon: "quiz",       label: "Mis Evaluaciones",        viewKey: "evaluaciones" },
    { icon: "settings",   label: "Configuración",           viewKey: "configuracion" },
  ]

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Icon name="hourglass_empty" className="text-primary text-5xl" />
        <p className="text-on-surface-variant text-sm">Cargando validación guardada…</p>
      </div>
    )
  }

  return (
    <div className="bg-background text-on-surface flex flex-col min-h-screen">
      <Toast notification={notification} onClose={() => setNotification(null)} />
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* ── Header ── */}
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 right-0 z-40">
        <div className="flex justify-between items-center w-full px-10 h-20 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-10">
            <button onClick={() => setView("variables")}
              className="font-bold text-xl text-primary tracking-tight hover:opacity-80 transition-opacity text-left">
              Plataforma de Validación Académica
            </button>
            <nav className="hidden md:flex gap-6">
              {navItems.map(({ label, action }) => (
                <button key={label} onClick={action}
                  className={`text-sm transition-colors ${
                    label === "Variables" && view === "variables"
                      ? "text-primary font-bold border-b-2 border-primary pb-1"
                      : "text-on-surface-variant hover:text-primary"
                  }`}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Mini progress */}
            <div className="hidden md:flex items-center gap-2 text-xs text-on-surface-variant">
              <div className="w-20 bg-surface-container-high rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <button onClick={() => setShowHelp(true)} title="Ayuda" className="hover:text-primary transition-colors">
              <Icon name="help_outline" className="text-on-surface-variant" />
            </button>
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:opacity-90">
              <Icon name="account_circle" className="text-base" />
              <span className="hidden md:inline">Perfil del Experto</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full flex-col pt-20 z-40 bg-surface-container-low border-r border-outline-variant w-64 hidden xl:flex">
        <div className="p-6 flex flex-col items-center border-b border-outline-variant">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-3">
            <Icon name="school" className="text-on-primary-container text-4xl" />
          </div>
          <h2 className="font-semibold text-base text-on-surface text-center">Gestión de Variables</h2>
          <p className="text-xs text-on-surface-variant">Protocolo v2.4</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map(({ icon, label, viewKey }) => (
            <button key={viewKey} onClick={() => setView(viewKey)}
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
        <div className="p-6 border-t border-outline-variant space-y-3">
          <div className="mb-2">
            <div className="flex justify-between text-xs text-on-surface-variant mb-1">
              <span>Progreso</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500"
                   style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{completedCount} de {VARIABLES.length} variables</p>
          </div>
          <button onClick={() => setView("crear-evaluacion")}
            className="w-full bg-primary text-on-primary py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2">
            <Icon name="add" className="text-base" /> Nueva Evaluación
          </button>
          <button onClick={handleSave} disabled={saving || submitted}
            className="w-full border border-primary text-primary py-2 rounded-lg text-sm font-semibold hover:bg-secondary-container disabled:opacity-50">
            {saving ? "Guardando…" : "Guardar Progreso"}
          </button>
          <a href="mailto:soporte@sva.edu"
            className="flex items-center gap-3 text-on-surface-variant px-2 py-2 hover:text-primary text-sm">
            <Icon name="contact_support" /> Soporte
          </a>
          <button onClick={onLogout}
            className="flex items-center gap-3 text-on-surface-variant px-2 py-2 hover:text-error text-sm w-full">
            <Icon name="logout" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 mt-20 xl:ml-64 p-10 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto">
          {view === "dashboard" && (
            <DashboardView
              ratings={ratings}
              progress={progress}
              completedCount={completedCount}
              lastSaved={lastSaved}
              expertoCount={expertoCount}
              onNavigate={setView}
            />
          )}
          {view === "historial" && <HistorialView />}
          {view === "evaluaciones" && (
            <MisEvaluaciones
              onCreateNew={() => setView("crear-evaluacion")}
              onOpenEvaluation={(estudio) => {
                // TODO: abrir evaluación para responder
                alert(`Abriendo: ${estudio.titulo}`)
              }}
            />
          )}
          {view === "crear-evaluacion" && (
            <CrearEvaluacion
              onBack={() => setView("evaluaciones")}
              onCreated={() => {
                setView("evaluaciones")
              }}
            />
          )}
          {view === "configuracion" && (
            <ConfiguracionView onReset={handleReset} lastSaved={lastSaved} />
          )}
          {view === "variables" && (
            <VariablesView
              ratings={ratings}
              completedCount={completedCount}
              allComplete={allComplete}
              submitted={submitted}
              saving={saving}
              submitting={submitting}
              onChange={handleChange}
              onSave={handleSave}
              onSubmit={handleSubmit}
              lastSaved={lastSaved}
              expertoCount={expertoCount}
              onNavigate={setView}
            />
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-high border-t border-outline-variant xl:ml-64">
        <div className="flex flex-wrap justify-between items-center w-full px-10 py-3 max-w-[1440px] mx-auto gap-4">
          <span className="text-xs text-on-surface-variant">
            © 2024 Sistema de Validación Académica — Comité de Ética e Investigación
          </span>
          <div className="flex gap-8">
            {[
              { label: "Privacidad",         action: () => setView("configuracion") },
              { label: "Términos de Uso",    action: () => setView("configuracion") },
              { label: "Guía del Evaluador", action: () => setShowHelp(true) },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                className="text-on-secondary-container text-xs hover:text-primary transition-colors">
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">SVA PLATFORM</span>
        </div>
      </footer>
    </div>
  )
}
