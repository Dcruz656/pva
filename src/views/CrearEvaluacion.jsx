import { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"
import { DIMENSION_PRINCIPAL, SUBDIMENSIONES } from "../lib/variablesData"

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const STEP_LABELS = ["Información", "Variables", "Criterios", "Evaluación Criterios", "Acceso", "Publicar"]

const LIKERT_FACES = [
  { n: 1, emoji: "😞", label: "Totalmente en\ndesacuerdo", color: "border-red-300 bg-red-50 text-red-600" },
  { n: 2, emoji: "🙁", label: "En\ndesacuerdo",           color: "border-orange-300 bg-orange-50 text-orange-600" },
  { n: 3, emoji: "😐", label: "Neutral",                  color: "border-amber-300 bg-amber-50 text-amber-600" },
  { n: 4, emoji: "🙂", label: "De\nacuerdo",              color: "border-lime-400 bg-lime-50 text-lime-700" },
  { n: 5, emoji: "😄", label: "Totalmente de\nacuerdo",   color: "border-green-400 bg-green-50 text-green-700" },
]

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
        <label className="block text-sm font-semibold text-on-surface mb-1">
          Instrucciones para el evaluador
        </label>
        <textarea
          value={form.instrucciones}
          onChange={(e) => onChange("instrucciones", e.target.value)}
          placeholder="Indique al evaluador cómo responder, qué criterios tener en cuenta, contexto del estudio, etc."
          rows={4}
          className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface resize-none"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Se mostrará en la pantalla de bienvenida antes de que el evaluador comience.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Fecha de inicio</label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => onChange("fecha_inicio", e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Fecha límite</label>
          <input
            type="date"
            value={form.fecha_limite}
            onChange={(e) => onChange("fecha_limite", e.target.value)}
            min={form.fecha_inicio || new Date().toISOString().split("T")[0]}
            className="w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
          />
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Variables (selección desde catálogo precargado) ────────────────
function StepVariables({ variables, onChange }) {
  const [openSub, setOpenSub] = useState(null)
  const [hoveredClave, setHoveredClave] = useState(null)

  // Mapa rápido: clave → variable seleccionada
  const selectedClaves = new Set(variables.map((v) => v.clave).filter(Boolean))

  function toggleVariable(sub, varData) {
    if (selectedClaves.has(varData.clave)) {
      // Deseleccionar
      onChange(variables.filter((v) => v.clave !== varData.clave))
    } else {
      // Seleccionar — añadir con todos sus datos
      onChange([...variables, {
        id:          Date.now(),
        clave:       varData.clave,
        nombre:      varData.nombre,
        descripcion: varData.descripcion,
        dimension:   sub.nombre,
      }])
    }
  }

  function removeVariable(clave) {
    onChange(variables.filter((v) => v.clave !== clave))
  }

  const totalSelected = variables.length

  return (
    <div className="space-y-5">

      {/* Dimensión principal */}
      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
        <Icon name="account_balance" className="text-primary text-xl flex-shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Dimensión principal</p>
          <p className="font-bold text-primary text-sm">{DIMENSION_PRINCIPAL}</p>
        </div>
      </div>

      {/* Resumen de selección */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface">
          Subdimensiones
        </p>
        {totalSelected > 0 && (
          <span className="text-xs font-bold bg-primary text-white px-2.5 py-1 rounded-full">
            {totalSelected} variable{totalSelected !== 1 ? "s" : ""} seleccionada{totalSelected !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Lista de subdimensiones */}
      <div className="space-y-3">
        {SUBDIMENSIONES.map((sub) => {
          const isOpen = openSub === sub.id
          const countInSub = sub.variables.filter((v) => selectedClaves.has(v.clave)).length

          return (
            <div key={sub.id} className={`rounded-xl border-2 overflow-hidden transition-colors ${
              countInSub > 0 ? "border-primary/40" : "border-outline-variant"
            }`}>
              {/* Cabecera subdimensión */}
              <button
                type="button"
                onClick={() => setOpenSub(isOpen ? null : sub.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface hover:bg-surface-container-low transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  countInSub > 0 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                }`}>
                  {countInSub > 0
                    ? <span className="text-xs font-bold">{countInSub}</span>
                    : <Icon name="folder" className="text-sm" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-on-surface leading-tight">{sub.nombre}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-tight line-clamp-1">{sub.descripcion}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-on-surface-variant">
                    {sub.variables.length} vars
                  </span>
                  <Icon name={isOpen ? "expand_less" : "expand_more"} className="text-on-surface-variant text-base" />
                </div>
              </button>

              {/* Descripción de subdimensión (expandida) */}
              {isOpen && (
                <div>
                  <div className="px-4 py-3 bg-secondary-container/30 border-y border-outline-variant/30">
                    <p className="text-xs text-on-surface-variant leading-relaxed">{sub.descripcion}</p>
                  </div>

                  {/* Variables de la subdimensión */}
                  <div className="divide-y divide-outline-variant/20">
                    {sub.variables.map((varData) => {
                      const isSelected = selectedClaves.has(varData.clave)
                      const isHovered = hoveredClave === varData.clave

                      return (
                        <div
                          key={varData.clave}
                          className={`transition-colors ${isSelected ? "bg-primary/5" : "bg-surface hover:bg-surface-container-low"}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleVariable(sub, varData)}
                            onMouseEnter={() => setHoveredClave(varData.clave)}
                            onMouseLeave={() => setHoveredClave(null)}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left"
                          >
                            {/* Checkbox visual */}
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-outline-variant bg-surface"
                            }`}>
                              {isSelected && <Icon name="check" className="text-white text-xs" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                                  isSelected ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                                }`}>
                                  {varData.clave}
                                </span>
                                <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-primary" : "text-on-surface"}`}>
                                  {varData.nombre.replace(`${varData.clave}. `, "")}
                                </p>
                              </div>
                              {/* Descripción: siempre visible si está seleccionada o en hover */}
                              {(isSelected || isHovered) && (
                                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                                  {varData.descripcion}
                                </p>
                              )}
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Variables seleccionadas (resumen) */}
      {totalSelected > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Variables seleccionadas ({totalSelected})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {variables.map((v) => (
              <div key={v.clave} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-outline-variant/50">
                <span className="text-[10px] font-bold font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                  {v.clave}
                </span>
                <span className="text-xs font-medium text-on-surface flex-1 truncate">
                  {v.nombre.replace(`${v.clave}. `, "")}
                </span>
                <span className="text-[10px] text-on-surface-variant flex-shrink-0 hidden sm:block truncate max-w-[120px]">
                  {v.dimension}
                </span>
                <button
                  type="button"
                  onClick={() => removeVariable(v.clave)}
                  className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0"
                  title="Quitar"
                >
                  <Icon name="close" className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-on-surface-variant">
        Seleccione al menos 1 variable para continuar. Haga clic en una subdimensión para expandirla.
      </p>
    </div>
  )
}

// ── Step 3: Criterios de evaluación ───────────────────────────────────────
function StepCriterios({ criterios, onChange }) {
  const [newNombre, setNewNombre] = useState("")
  const [editingId, setEditingId] = useState(null)

  function addCriterio() {
    if (!newNombre.trim()) return
    onChange([...criterios, {
      id:     Date.now(),
      nombre: newNombre.trim(),
    }])
    setNewNombre("")
  }

  function removeCriterio(id) {
    onChange(criterios.filter((c) => c.id !== id))
  }

  function updateCriterio(id, field, value) {
    onChange(criterios.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  return (
    <div className="space-y-6">

      {/* Instrucción */}
      <div className="flex items-start gap-3 bg-secondary-container rounded-xl px-5 py-4">
        <Icon name="info" className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-on-secondary-container leading-relaxed">
          Evalúe la pertinencia del criterio para explicar la variable.
        </p>
      </div>

      {/* Escala de Likert con caritas */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
          Escala de valoración aplicada
        </p>
        <div className="flex gap-2">
          {LIKERT_FACES.map(({ n, emoji, label, color }) => (
            <div key={n} className={`flex-1 flex flex-col items-center gap-1.5 border-2 rounded-xl py-3 px-1 ${color}`}>
              <span className="text-2xl leading-none">{emoji}</span>
              <span className="text-sm font-bold leading-none">{n}</span>
              <span className="text-[10px] font-medium text-center leading-tight hidden sm:block whitespace-pre-line">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de criterios ya agregados */}
      {criterios.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant">
          <Icon name="rule" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm">No hay criterios. Agrega el primero abajo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {criterios.map((c, i) => (
            <div key={c.id} className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3">
              {editingId === c.id ? (
                <div className="flex gap-2">
                  <input
                    value={c.nombre}
                    onChange={(e) => updateCriterio(c.id, "nombre", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    autoFocus
                    placeholder="Nombre del criterio"
                    className="flex-1 border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
                  />
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 bg-primary text-on-primary rounded text-sm font-semibold hover:opacity-90"
                  >
                    Listo
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-on-surface-variant w-5 text-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-on-surface">{c.nombre}</span>
                  </div>
                  <button onClick={() => setEditingId(c.id)} title="Editar"
                    className="text-on-surface-variant hover:text-primary transition-colors flex-shrink-0">
                    <Icon name="edit" className="text-base" />
                  </button>
                  <button onClick={() => removeCriterio(c.id)} title="Eliminar"
                    disabled={criterios.length <= 1}
                    className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-30 flex-shrink-0">
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario agregar criterio */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-4">
        <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <Icon name="add_circle" className="text-primary text-base" /> Agregar criterio
        </h4>

        {/* Nombre del criterio */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
            Nombre del criterio
          </label>
          <input
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCriterio()}
            placeholder="Ej: Claridad, Relevancia, Coherencia…"
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
          />
        </div>

        <button
          onClick={addCriterio}
          disabled={!newNombre.trim()}
          className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Icon name="add" className="text-base" /> Agregar criterio
        </button>
      </div>

      <p className="text-xs text-on-surface-variant">
        {criterios.length} criterio{criterios.length !== 1 ? "s" : ""} definido{criterios.length !== 1 ? "s" : ""}. Mínimo 1 para continuar.
      </p>
    </div>
  )
}

// ── Step 4: Evaluación Criterios ──────────────────────────────────────────
function StepEvaluacionCriterios({ evalCriterios, variables, onChange }) {
  const [newNombre, setNewNombre] = useState("")
  const [newVariableId, setNewVariableId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  function add() {
    if (!newNombre.trim()) return
    const variable = variables.find((v) => v.id === newVariableId)
    onChange([...evalCriterios, {
      id:              Date.now(),
      nombre:          newNombre.trim(),
      variable_id:     newVariableId ?? null,
      variable_nombre: variable?.nombre ?? null,
    }])
    setNewNombre("")
    setNewVariableId(null)
  }

  function remove(id) {
    onChange(evalCriterios.filter((c) => c.id !== id))
  }

  function updateCriterio(id, field, value) {
    onChange(evalCriterios.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  return (
    <div className="space-y-6">

      {/* Instrucción */}
      <div className="flex items-start gap-3 bg-secondary-container rounded-xl px-5 py-4">
        <Icon name="info" className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-on-secondary-container leading-relaxed">
          Define los criterios personalizados que serán evaluados con la escala Likert.
          Estos criterios aparecerán en el formulario de validación para que los evaluadores los califiquen.
        </p>
      </div>

      {/* Escala de Likert con caritas */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
          Escala de valoración aplicada
        </p>
        <div className="flex gap-2">
          {LIKERT_FACES.map(({ n, emoji, label, color }) => (
            <div key={n} className={`flex-1 flex flex-col items-center gap-1.5 border-2 rounded-xl py-3 px-1 ${color}`}>
              <span className="text-2xl leading-none">{emoji}</span>
              <span className="text-sm font-bold leading-none">{n}</span>
              <span className="text-[10px] font-medium text-center leading-tight hidden sm:block whitespace-pre-line">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de criterios de evaluación */}
      {evalCriterios.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant">
          <Icon name="checklist" className="text-4xl block mb-2 mx-auto" />
          <p className="text-sm font-medium">No hay criterios de evaluación.</p>
          <p className="text-xs mt-1">Agrega los criterios personalizados que deseas evaluar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {evalCriterios.map((c, i) => (
            <div key={c.id} className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3">
              {editingId === c.id ? (
                <div className="space-y-2">
                  <input
                    value={c.nombre}
                    onChange={(e) => updateCriterio(c.id, "nombre", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    autoFocus
                    placeholder="Nombre del criterio"
                    className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
                  />
                  {variables.length > 0 && (
                    <select
                      value={c.variable_id ?? ""}
                      onChange={(e) => {
                        const v = variables.find((v) => String(v.id) === e.target.value)
                        updateCriterio(c.id, "variable_id", v?.id ?? null)
                        updateCriterio(c.id, "variable_nombre", v?.nombre ?? null)
                      }}
                      className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
                    >
                      <option value="">— Sin variable asociada —</option>
                      {variables.map((v) => (
                        <option key={v.id} value={v.id}>{v.nombre}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex justify-end">
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-2 bg-primary text-on-primary rounded text-sm font-semibold hover:opacity-90">
                      Listo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-on-surface block">{c.nombre}</span>
                    {c.variable_nombre && (
                      <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Icon name="link" className="text-xs" />
                        {c.variable_nombre}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex gap-1 flex-shrink-0">
                    {LIKERT_FACES.map(({ n, emoji }) => (
                      <span key={n} className="text-base leading-none opacity-60">{emoji}</span>
                    ))}
                  </div>
                  <button onClick={() => setEditingId(c.id)} title="Editar"
                    className="text-on-surface-variant hover:text-primary transition-colors flex-shrink-0">
                    <Icon name="edit" className="text-base" />
                  </button>
                  <button onClick={() => remove(c.id)} title="Eliminar"
                    className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0">
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Agregar criterio de evaluación */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-4">
        <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <Icon name="add_circle" className="text-primary text-base" /> Agregar criterio de evaluación
        </h4>

        {/* Nombre */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
            Nombre del criterio
          </label>
          <input
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Ej: Aplicabilidad, Pertinencia, Originalidad…"
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-surface"
          />
        </div>

        {/* Selector de variable asociada */}
        {variables.length > 0 && (
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">
              Variable asociada
            </label>
            <div className="max-h-44 overflow-y-auto space-y-1 border border-outline-variant rounded-lg p-2 bg-surface">
              <button
                type="button"
                onClick={() => setNewVariableId(null)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  newVariableId === null
                    ? "bg-surface-container text-on-surface-variant font-medium"
                    : "hover:bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <Icon name={newVariableId === null ? "radio_button_checked" : "radio_button_unchecked"} className="text-base flex-shrink-0" />
                <span className="italic">Sin variable asociada</span>
              </button>
              {variables.map((v) => {
                const selected = newVariableId === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setNewVariableId(v.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all ${
                      selected
                        ? "border-primary bg-secondary-container text-primary font-semibold"
                        : "border-transparent hover:border-outline-variant hover:bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <Icon
                      name={selected ? "radio_button_checked" : "radio_button_unchecked"}
                      className={`text-base flex-shrink-0 ${selected ? "text-primary" : "text-on-surface-variant"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="truncate block">{v.nombre}</span>
                      {v.dimension && (
                        <span className="text-[11px] text-on-surface-variant font-normal">{v.dimension}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={add}
          disabled={!newNombre.trim()}
          className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Icon name="add" className="text-base" /> Agregar criterio
        </button>
      </div>

      <p className="text-xs text-on-surface-variant">
        {evalCriterios.length > 0
          ? `${evalCriterios.length} criterio${evalCriterios.length !== 1 ? "s" : ""} de evaluación definido${evalCriterios.length !== 1 ? "s" : ""}.`
          : "Este paso es opcional. Puedes continuar sin agregar criterios adicionales."
        }
      </p>
    </div>
  )
}

// ── Step 5: Tipo de acceso ─────────────────────────────────────────────────
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
          { label: "Título",         value: form.titulo },
          { label: "Descripción",    value: form.descripcion || "—" },
          { label: "Instrucciones",  value: form.instrucciones
              ? (form.instrucciones.length > 80 ? form.instrucciones.substring(0, 80) + "…" : form.instrucciones)
              : "—" },
          { label: "Fecha de inicio", value: form.fecha_inicio
              ? new Date(form.fecha_inicio + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
              : "Sin fecha de inicio" },
          { label: "Fecha límite",   value: form.fecha_limite
              ? new Date(form.fecha_limite + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
              : "Sin fecha límite" },
          { label: "Variables",      value: `${form.variables.length} ítems en ${dims.length} dimensión${dims.length !== 1 ? "es" : ""}` },
          { label: "Criterios",              value: form.criterios.map((c) => c.nombre).join(", ") },
          { label: "Criterios de evaluación", value: form.criterios_evaluacion.length > 0
              ? form.criterios_evaluacion.map((c) => c.nombre).join(", ")
              : "Sin criterios adicionales" },
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
    const defaultCriterios = [
      { id: 1, nombre: "Claridad" },
      { id: 2, nombre: "Relevancia" },
      { id: 3, nombre: "Coherencia" },
    ]
    if (estudioToEdit) {
      return {
        titulo:        estudioToEdit.titulo ?? "",
        descripcion:   estudioToEdit.descripcion ?? "",
        instrucciones: estudioToEdit.instrucciones ?? "",
        fecha_inicio:  estudioToEdit.fecha_inicio ? estudioToEdit.fecha_inicio.split("T")[0] : "",
        fecha_limite:  estudioToEdit.fecha_limite ? estudioToEdit.fecha_limite.split("T")[0] : "",
        variables:           estudioToEdit.variables ?? [],
        criterios:           estudioToEdit.criterios ?? defaultCriterios,
        criterios_evaluacion: estudioToEdit.criterios_evaluacion ?? [],
        modo_acceso:         estudioToEdit.modo_acceso ?? "liga_publica",
        codigo:        estudioToEdit.codigo ?? generateCode(),
      }
    }
    return {
      titulo:        "",
      descripcion:   "",
      instrucciones: "",
      fecha_inicio:  "",
      fecha_limite:  "",
      variables:            [],
      criterios:            defaultCriterios,
      criterios_evaluacion: [],
      modo_acceso:          "liga_publica",
      codigo:        generateCode(),
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [autoSaved, setAutoSaved] = useState(null)
  const autoSaveTimer = useRef(null)
  const isFirstRender = useRef(true)

  // Auto-guardado con debounce de 3 s (solo en modo edición)
  useEffect(() => {
    if (!isEdit) return
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await supabase.from("estudios").update({
          titulo:        form.titulo.trim(),
          descripcion:   form.descripcion.trim() || null,
          instrucciones: form.instrucciones.trim() || null,
          fecha_inicio:  form.fecha_inicio || null,
          fecha_limite:  form.fecha_limite || null,
          variables:            form.variables,
          criterios:            form.criterios,
          criterios_evaluacion: form.criterios_evaluacion,
          modo_acceso:          form.modo_acceso,
          codigo:               form.modo_acceso === "invitacion_codigo" ? form.codigo.trim() : null,
        }).eq("id", estudioToEdit.id)
        setAutoSaved(new Date())
      } catch { /* silent fail */ }
    }, 3000)
    return () => clearTimeout(autoSaveTimer.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  function updateForm(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function canAdvance() {
    if (step === 0) return form.titulo.trim().length > 0
    if (step === 1) return form.variables.length > 0
    if (step === 2) return form.criterios.length > 0
    if (step === 3) return true  // Evaluación Criterios es opcional
    if (step === 4) return form.modo_acceso === "liga_publica" || form.codigo.trim().length >= 4
    return true
  }

  async function handlePublish() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        titulo:        form.titulo.trim(),
        descripcion:   form.descripcion.trim() || null,
        instrucciones: form.instrucciones.trim() || null,
        fecha_inicio:  form.fecha_inicio || null,
        fecha_limite:  form.fecha_limite || null,
        variables:            form.variables,
        criterios:            form.criterios,
        criterios_evaluacion: form.criterios_evaluacion,
        modo_acceso:          form.modo_acceso,
        codigo:               form.modo_acceso === "invitacion_codigo" ? form.codigo.trim() : null,
        estado:               "activo",
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
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-bold text-2xl text-primary">{isEdit ? "Editar Evaluación" : "Nueva Evaluación"}</h2>
            {isEdit && autoSaved && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <Icon name="cloud_done" className="text-sm" />
                Auto-guardado {autoSaved.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {isEdit ? "Modifica los datos del instrumento de validación" : "Diseña un instrumento de validación personalizado"}
          </p>
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
        {step === 2 && <StepCriterios criterios={form.criterios} onChange={(c) => updateForm("criterios", c)} />}
        {step === 3 && <StepEvaluacionCriterios evalCriterios={form.criterios_evaluacion} variables={form.variables} onChange={(c) => updateForm("criterios_evaluacion", c)} />}
        {step === 4 && <StepAcceso form={form} onChange={updateForm} />}
        {step === 5 && <StepPublicar form={form} />}
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
