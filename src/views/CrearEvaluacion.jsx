import { useState } from "react"
import { supabase } from "../lib/supabase"

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const STEP_LABELS = ["Información", "Variables", "Acceso", "Publicar"]

// ── Step 1: Información básica ─────────────────────────────────────────────
function StepInfo({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1">
          Título de la evaluación <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => onChange("titulo", e.target.value)}
          placeholder="Ej: Impacto del uso de redes sociales en el rendimiento académico"
          className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => onChange("descripcion", e.target.value)}
          placeholder="Breve descripción del propósito de esta evaluación..."
          rows={3}
          className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1">Fecha límite</label>
        <input
          type="date"
          value={form.fecha_limite}
          onChange={(e) => onChange("fecha_limite", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
        />
      </div>
    </div>
  )
}

// ── Step 2: Variables ──────────────────────────────────────────────────────
function StepVariables({ variables, onChange }) {
  const [newVar, setNewVar] = useState({ nombre: "", dimension: "" })
  const [editingId, setEditingId] = useState(null)

  const dimensionesExistentes = [...new Set(variables.map((v) => v.dimension).filter(Boolean))]

  function addVariable() {
    if (!newVar.nombre.trim()) return
    const v = {
      id: Date.now(),
      nombre: newVar.nombre.trim(),
      dimension: newVar.dimension.trim() || "General",
    }
    onChange([...variables, v])
    setNewVar({ nombre: "", dimension: "" })
  }

  function removeVariable(id) {
    onChange(variables.filter((v) => v.id !== id))
  }

  function updateVariable(id, field, value) {
    onChange(variables.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  return (
    <div className="space-y-6">
      {/* Variable list */}
      {variables.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant">
          <Icon name="list_alt" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">No hay variables. Agrega la primera abajo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {variables.map((v, i) => (
            <div key={v.id} className="bg-surface-container-low border border-outline-variant rounded-lg p-3">
              {editingId === v.id ? (
                <div className="space-y-2">
                  <input
                    value={v.nombre}
                    onChange={(e) => updateVariable(v.id, "nombre", e.target.value)}
                    className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
                  />
                  <div className="flex gap-2">
                    <input
                      value={v.dimension}
                      onChange={(e) => updateVariable(v.id, "dimension", e.target.value)}
                      list="dims-edit"
                      placeholder="Dimensión"
                      className="flex-1 border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
                    />
                    <datalist id="dims-edit">
                      {dimensionesExistentes.map((d) => <option key={d} value={d} />)}
                    </datalist>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-2 bg-primary text-on-primary rounded text-sm font-semibold hover:opacity-90">
                      Listo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-on-surface-variant w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-primary truncate">{v.nombre}</div>
                    <div className="text-xs text-on-surface-variant">{v.dimension}</div>
                  </div>
                  <button onClick={() => setEditingId(v.id)} title="Editar"
                    className="text-on-surface-variant hover:text-primary transition-colors">
                    <Icon name="edit" className="text-base" />
                  </button>
                  <button onClick={() => removeVariable(v.id)} title="Eliminar"
                    className="text-on-surface-variant hover:text-error transition-colors">
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new variable */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <Icon name="add_circle" className="text-primary text-base" /> Agregar variable
        </h4>
        <input
          value={newVar.nombre}
          onChange={(e) => setNewVar((p) => ({ ...p, nombre: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && addVariable()}
          placeholder="Nombre de la variable o ítem..."
          className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
        />
        <div className="flex gap-2">
          <input
            value={newVar.dimension}
            onChange={(e) => setNewVar((p) => ({ ...p, dimension: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addVariable()}
            list="dims-new"
            placeholder="Dimensión (Ej: Hábitos, Rendimiento…)"
            className="flex-1 border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
          />
          <datalist id="dims-new">
            {dimensionesExistentes.map((d) => <option key={d} value={d} />)}
          </datalist>
          <button onClick={addVariable} disabled={!newVar.nombre.trim()}
            className="px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center gap-2">
            <Icon name="add" className="text-base" /> Agregar
          </button>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant">
        {variables.length} variable{variables.length !== 1 ? "s" : ""} agregada{variables.length !== 1 ? "s" : ""}. Mínimo 1 para continuar.
      </p>
    </div>
  )
}

// ── Step 3: Tipo de acceso ─────────────────────────────────────────────────
function StepAcceso({ form, onChange }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-on-surface-variant">
        Define quién puede responder esta evaluación.
      </p>

      <div className="space-y-4">
        {/* Libre */}
        <label className={`flex gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
          form.modo_acceso === "liga_publica"
            ? "border-primary bg-secondary-container"
            : "border-outline-variant hover:border-outline"
        }`}>
          <input
            type="radio"
            name="modo_acceso"
            value="liga_publica"
            checked={form.modo_acceso === "liga_publica"}
            onChange={() => onChange("modo_acceso", "liga_publica")}
            className="mt-1 accent-primary"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="public" className="text-primary text-xl" />
              <span className="font-bold text-on-surface">Acceso libre</span>
            </div>
            <p className="text-sm text-on-surface-variant">
              Cualquier persona con el enlace puede responder la evaluación sin restricciones.
            </p>
          </div>
        </label>

        {/* Con código */}
        <label className={`flex gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
          form.modo_acceso === "invitacion_codigo"
            ? "border-primary bg-secondary-container"
            : "border-outline-variant hover:border-outline"
        }`}>
          <input
            type="radio"
            name="modo_acceso"
            value="invitacion_codigo"
            checked={form.modo_acceso === "invitacion_codigo"}
            onChange={() => onChange("modo_acceso", "invitacion_codigo")}
            className="mt-1 accent-primary"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="lock" className="text-primary text-xl" />
              <span className="font-bold text-on-surface">Con código de acceso</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-3">
              Solo quienes tengan el código podrán responder. Ideal para panel de expertos cerrado.
            </p>

            {form.modo_acceso === "invitacion_codigo" && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 space-y-3"
                   onClick={(e) => e.preventDefault()}>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  Código de acceso
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => onChange("codigo", e.target.value.toUpperCase())}
                    maxLength={10}
                    className="flex-1 border border-outline-variant rounded-lg px-4 py-2.5 text-sm font-mono font-bold tracking-widest focus:border-primary focus:ring-1 focus:ring-primary bg-surface uppercase"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onChange("codigo", generateCode()) }}
                    className="px-3 py-2.5 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                    title="Generar nuevo código"
                  >
                    <Icon name="refresh" className="text-base" />
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Comparte este código únicamente con los evaluadores autorizados.
                </p>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  )
}

// ── Step 4: Publicar (resumen) ─────────────────────────────────────────────
function StepPublicar({ form }) {
  const dims = [...new Set(form.variables.map((v) => v.dimension))]
  return (
    <div className="space-y-5">
      <div className="bg-surface-container-low rounded-xl border border-outline-variant divide-y divide-outline-variant">
        {[
          { label: "Título",        value: form.titulo },
          { label: "Descripción",   value: form.descripcion || "—" },
          { label: "Fecha límite",  value: form.fecha_limite
              ? new Date(form.fecha_limite + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
              : "Sin fecha límite" },
          { label: "Variables",     value: `${form.variables.length} ítems en ${dims.length} dimensión${dims.length !== 1 ? "es" : ""}` },
          { label: "Tipo de acceso", value: form.modo_acceso === "liga_publica" ? "Acceso libre" : "Con código de acceso" },
          ...(form.modo_acceso === "invitacion_codigo"
            ? [{ label: "Código de acceso", value: form.codigo, mono: true }]
            : []),
        ].map(({ label, value, mono }) => (
          <div key={label} className="flex justify-between items-center px-5 py-3 gap-4">
            <span className="text-sm text-on-surface-variant">{label}</span>
            <span className={`text-sm font-semibold text-on-surface text-right ${mono ? "font-mono tracking-widest bg-surface-container px-2 py-0.5 rounded" : ""}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Variables preview */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Variables incluidas
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {form.variables.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-on-surface-variant w-5 text-center">{i + 1}</span>
              <span className="text-on-surface flex-1">{v.nombre}</span>
              <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
                {v.dimension}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 bg-secondary-container rounded-xl p-4 text-sm text-on-secondary-container">
        <Icon name="info" className="text-base flex-shrink-0 mt-0.5" />
        <p>Al publicar, la evaluación quedará activa e inmediatamente disponible para los respondientes.</p>
      </div>
    </div>
  )
}

// ── Main wizard component ──────────────────────────────────────────────────
export default function CrearEvaluacion({ onBack, onCreated, estudioToEdit }) {
  const isEdit = Boolean(estudioToEdit)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => {
    if (estudioToEdit) {
      return {
        titulo:       estudioToEdit.titulo ?? "",
        descripcion:  estudioToEdit.descripcion ?? "",
        fecha_limite: estudioToEdit.fecha_limite ? estudioToEdit.fecha_limite.split("T")[0] : "",
        variables:    estudioToEdit.variables ?? [],
        modo_acceso:  estudioToEdit.modo_acceso ?? "liga_publica",
        codigo:       estudioToEdit.codigo ?? generateCode(),
      }
    }
    return {
      titulo: "",
      descripcion: "",
      fecha_limite: "",
      variables: [],
      modo_acceso: "liga_publica",
      codigo: generateCode(),
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function updateForm(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function canAdvance() {
    if (step === 0) return form.titulo.trim().length > 0
    if (step === 1) return form.variables.length > 0
    if (step === 2) return form.modo_acceso === "liga_publica" || form.codigo.trim().length >= 4
    return true
  }

  async function handlePublish() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        titulo:        form.titulo.trim(),
        descripcion:   form.descripcion.trim() || null,
        fecha_limite:  form.fecha_limite || null,
        variables:     form.variables,
        modo_acceso:   form.modo_acceso,
        codigo: form.modo_acceso === "invitacion_codigo" ? form.codigo.trim() : null,
        estado:        "activo",
      }
      const { data, error: err } = isEdit
        ? await supabase.from("estudios").update(payload).eq("id", estudioToEdit.id).select().single()
        : await supabase.from("estudios").insert(payload).select().single()
      if (err) throw err
      onCreated(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-on-surface-variant hover:text-on-surface transition-colors">
          <Icon name="arrow_back" className="text-2xl" />
        </button>
        <div>
          <h2 className="font-bold text-2xl text-primary">{isEdit ? "Editar Evaluación" : "Nueva Evaluación"}</h2>
          <p className="text-sm text-on-surface-variant">{isEdit ? "Modifica los datos del instrumento de validación" : "Diseña un instrumento de validación personalizado"}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step  ? "bg-green-500 text-white cursor-pointer hover:opacity-80"
                  : i === step ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {i < step ? <Icon name="check" className="text-base" /> : i + 1}
              </button>
              <span className={`text-xs font-medium hidden sm:block ${
                i === step ? "text-primary" : "text-on-surface-variant"
              }`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${i < step ? "bg-green-500" : "bg-outline-variant"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 min-h-[300px]">
        {step === 0 && <StepInfo form={form} onChange={updateForm} />}
        {step === 1 && <StepVariables variables={form.variables} onChange={(v) => updateForm("variables", v)} />}
        {step === 2 && <StepAcceso form={form} onChange={updateForm} />}
        {step === 3 && <StepPublicar form={form} />}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-error-container border border-red-200 rounded-xl px-5 py-3 text-on-error-container text-sm">
          <Icon name="error" className="text-error" /> {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => step === 0 ? onBack() : setStep(step - 1)}
          className="px-6 py-3 border border-outline-variant text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container transition-all text-sm flex items-center gap-2"
        >
          <Icon name="arrow_back" className="text-base" />
          {step === 0 ? "Cancelar" : "Anterior"}
        </button>

        {step < STEP_LABELS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-40 transition-all text-sm flex items-center gap-2"
          >
            Siguiente <Icon name="arrow_forward" className="text-base" />
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 transition-all text-sm flex items-center gap-2"
          >
            {saving ? (
              <><Icon name="hourglass_empty" className="text-base" /> Publicando…</>
            ) : isEdit ? (
              <><Icon name="save" className="text-base" /> Guardar cambios</>
            ) : (
              <><Icon name="publish" className="text-base" /> Publicar Evaluación</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
