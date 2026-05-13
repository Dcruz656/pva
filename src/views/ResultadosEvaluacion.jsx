import { useState, useEffect, useMemo } from "react"
import { supabase } from "../lib/supabase"

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined leading-none select-none ${className}`}>{name}</span>
}

// ── Helpers ────────────────────────────────────────────────────────────────

function avg(arr) {
  if (!arr.length) return null
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function round2(n) {
  return n === null || n === undefined ? null : Math.round(n * 100) / 100
}

function scoreColor(val) {
  if (val === null) return "bg-slate-300"
  if (val >= 4) return "bg-green-500"
  if (val >= 3) return "bg-amber-400"
  return "bg-red-500"
}

function scoreBg(val) {
  if (val === null) return ""
  if (val >= 4) return "bg-green-50 text-green-800"
  if (val >= 3) return "bg-amber-50 text-amber-800"
  return "bg-red-50 text-red-800"
}

// Mini horizontal bar + numeric value
function MiniBar({ value, maxVal = 5 }) {
  if (value === null) return <span className="text-xs text-on-surface-variant">—</span>
  const pct = Math.min(100, (value / maxVal) * 100)
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${scoreColor(value)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-on-surface w-8 text-right">{round2(value)}</span>
    </div>
  )
}

// ── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, extra, highlight }) {
  return (
    <div className={`rounded-xl border p-5 flex items-start gap-4 ${highlight || "bg-surface-container-lowest border-outline-variant"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${highlight ? "bg-white/30" : "bg-surface-container"}`}>
        <Icon name={icon} className={`text-xl ${highlight ? "text-inherit" : "text-primary"}`} />
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-tight">{value ?? "—"}</div>
        <div className="text-xs font-semibold opacity-80">{label}</div>
        {extra && <div className="text-xs opacity-60 mt-0.5">{extra}</div>}
      </div>
    </div>
  )
}

// ── Tab: Por Variable ──────────────────────────────────────────────────────

function TabVariable({ respuestas, variables }) {
  const rows = useMemo(() => {
    // Etapa 1 only: exclude criterios rows (variable_id contains "__")
    const etapa1 = respuestas.filter((r) => !String(r.variable_id ?? "").includes("__"))
    const map = new Map()
    etapa1.forEach((r) => {
      const key = r.variable_id ?? r.variable
      if (!map.has(key)) {
        const varDef = variables.find((v) => String(v.id) === String(r.variable_id)) || null
        map.set(key, {
          key,
          nombre: varDef ? varDef.nombre : r.variable,
          dimension: varDef ? varDef.dimension : r.dimension,
          claridad: [], relevancia: [], coherencia: [], pertinencia: [],
        })
      }
      const row = map.get(key)
      if (r.claridad    != null) row.claridad.push(r.claridad)
      if (r.relevancia  != null) row.relevancia.push(r.relevancia)
      if (r.coherencia  != null) row.coherencia.push(r.coherencia)
      if (r.pertinencia != null) row.pertinencia.push(r.pertinencia)
    })
    return Array.from(map.values()).map((row) => {
      const all = [...row.claridad, ...row.relevancia, ...row.coherencia, ...row.pertinencia]
      return {
        ...row,
        n: Math.max(row.claridad.length, row.relevancia.length, row.coherencia.length, row.pertinencia.length),
        avgClaridad:    avg(row.claridad),
        avgRelevancia:  avg(row.relevancia),
        avgCoherencia:  avg(row.coherencia),
        avgPertinencia: avg(row.pertinencia),
        promedio: avg(all),
      }
    })
  }, [respuestas, variables])

  if (!rows.length) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <Icon name="inbox" className="text-5xl block mb-3 mx-auto opacity-40" />
        <p className="text-sm">No hay respuestas para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant">
            <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Variable</th>
            <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Dimensión</th>
            <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">N°</th>
            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Claridad</th>
            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Relevancia</th>
            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Coherencia</th>
            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Pertinencia</th>
            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Promedio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {rows.map((row, i) => (
            <tr key={row.key} className="hover:bg-surface-container-low transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant w-5 text-center flex-shrink-0">{i + 1}</span>
                  <span className="font-medium text-on-surface">{row.nombre}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                  {row.dimension || "—"}
                </span>
              </td>
              <td className="py-3 px-4 text-center font-bold text-on-surface">{row.n}</td>
              <td className="py-3 px-4"><MiniBar value={row.avgClaridad} /></td>
              <td className="py-3 px-4"><MiniBar value={row.avgRelevancia} /></td>
              <td className="py-3 px-4"><MiniBar value={row.avgCoherencia} /></td>
              <td className="py-3 px-4"><MiniBar value={row.avgPertinencia} /></td>
              <td className="py-3 px-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${scoreBg(row.promedio)}`}>
                  {row.promedio !== null ? round2(row.promedio) : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Tab: Por Dimensión ─────────────────────────────────────────────────────

function DimensionBar({ label, value }) {
  const pct = value !== null ? Math.min(100, (value / 5) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-on-surface-variant font-medium">{label}</span>
        <span className="font-bold text-on-surface">{value !== null ? round2(value) : "—"}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${scoreColor(value)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function TabDimension({ respuestas }) {
  const dims = useMemo(() => {
    // Etapa 1 only
    const etapa1 = respuestas.filter((r) => !String(r.variable_id ?? "").includes("__"))
    const map = new Map()
    etapa1.forEach((r) => {
      const key = r.dimension || "Sin dimensión"
      if (!map.has(key)) map.set(key, { claridad: [], relevancia: [], coherencia: [], pertinencia: [] })
      const d = map.get(key)
      if (r.claridad    != null) d.claridad.push(r.claridad)
      if (r.relevancia  != null) d.relevancia.push(r.relevancia)
      if (r.coherencia  != null) d.coherencia.push(r.coherencia)
      if (r.pertinencia != null) d.pertinencia.push(r.pertinencia)
    })
    return Array.from(map.entries()).map(([nombre, d]) => {
      const all = [...d.claridad, ...d.relevancia, ...d.coherencia, ...d.pertinencia]
      return {
        nombre,
        n: etapa1.filter((r) => (r.dimension || "Sin dimensión") === nombre).length,
        avgClaridad:    avg(d.claridad),
        avgRelevancia:  avg(d.relevancia),
        avgCoherencia:  avg(d.coherencia),
        avgPertinencia: avg(d.pertinencia),
        promedio: avg(all),
      }
    })
  }, [respuestas])

  if (!dims.length) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <Icon name="inbox" className="text-5xl block mb-3 mx-auto opacity-40" />
        <p className="text-sm">No hay respuestas para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dims.map((d) => (
        <div key={d.nombre} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-on-surface">{d.nombre}</h4>
              <p className="text-xs text-on-surface-variant">{d.n} respuesta{d.n !== 1 ? "s" : ""}</p>
            </div>
            <span className={`text-sm font-extrabold px-3 py-1 rounded-xl flex-shrink-0 ${scoreBg(d.promedio)}`}>
              {d.promedio !== null ? round2(d.promedio) : "—"}
            </span>
          </div>
          <div className="space-y-3">
            <DimensionBar label="Claridad"    value={d.avgClaridad} />
            <DimensionBar label="Relevancia"  value={d.avgRelevancia} />
            <DimensionBar label="Coherencia"  value={d.avgCoherencia} />
            <DimensionBar label="Pertinencia" value={d.avgPertinencia} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Por Evaluador ─────────────────────────────────────────────────────

function TabEvaluador({ respuestas, totalVariables }) {
  const evaluadores = useMemo(() => {
    // Etapa 1 only
    const etapa1 = respuestas.filter((r) => !String(r.variable_id ?? "").includes("__"))
    const map = new Map()
    etapa1.forEach((r) => {
      if (!map.has(r.session_id)) {
        map.set(r.session_id, { session_id: r.session_id, variables: new Set(), scores: [] })
      }
      const e = map.get(r.session_id)
      e.variables.add(r.variable_id ?? r.variable)
      if (r.claridad    != null) e.scores.push(r.claridad)
      if (r.relevancia  != null) e.scores.push(r.relevancia)
      if (r.coherencia  != null) e.scores.push(r.coherencia)
      if (r.pertinencia != null) e.scores.push(r.pertinencia)
    })
    return Array.from(map.values()).map((e, i) => ({
      index: i + 1,
      session_id: e.session_id,
      label: e.session_id ? e.session_id.substring(0, 8) + "…" : "—",
      varCount: e.variables.size,
      completePct: totalVariables > 0 ? Math.round((e.variables.size / totalVariables) * 100) : 0,
      promedio: avg(e.scores),
    }))
  }, [respuestas, totalVariables])

  if (!evaluadores.length) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <Icon name="inbox" className="text-5xl block mb-3 mx-auto opacity-40" />
        <p className="text-sm">No hay evaluadores aún.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant">
            <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Evaluador</th>
            <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Variables respondidas</th>
            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Completadas</th>
            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Promedio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {evaluadores.map((e) => (
            <tr key={e.session_id} className="hover:bg-surface-container-low transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {e.index}
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant">{e.label}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-center font-bold text-on-surface">
                {e.varCount} / {totalVariables}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreColor(e.completePct >= 80 ? 4 : e.completePct >= 60 ? 3 : 2)}`}
                      style={{ width: `${e.completePct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-on-surface w-10 text-right">{e.completePct}%</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${scoreBg(e.promedio)}`}>
                  {e.promedio !== null ? round2(e.promedio) : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

const TABS = ["Por variable", "Por dimensión", "Por evaluador"]

export default function ResultadosEvaluacion({ estudio, onBack }) {
  const [respuestas, setRespuestas] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    async function fetchRespuestas() {
      setLoading(true)
      const { data, error } = await supabase
        .from("respuestas")
        .select("*")
        .eq("estudio_id", estudio.id)
        .eq("estado", "enviado")
      if (!error && data) setRespuestas(data)
      setLoading(false)
    }
    fetchRespuestas()
  }, [estudio.id])

  // ── KPI calculations ──────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const evaluadores = new Set(respuestas.map((r) => r.session_id)).size
    const totalResp = respuestas.length
    const variablesEval = new Set(respuestas.map((r) => r.variable_id ?? r.variable)).size
    const etapa1 = respuestas.filter((r) => !String(r.variable_id ?? "").includes("__"))
    const allScores = etapa1.flatMap((r) => [r.claridad, r.relevancia, r.coherencia, r.pertinencia].filter((v) => v != null))
    const promedioGlobal = avg(allScores)
    return { evaluadores, totalResp, variablesEval, promedioGlobal }
  }, [respuestas])

  const promedioHighlight = kpis.promedioGlobal === null
    ? "bg-surface-container-lowest border-outline-variant text-on-surface"
    : kpis.promedioGlobal >= 4
      ? "bg-green-600 border-green-700 text-white"
      : kpis.promedioGlobal >= 3
        ? "bg-amber-400 border-amber-500 text-amber-900"
        : "bg-red-500 border-red-600 text-white"

  const totalVariables = estudio.variables?.length ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
          title="Volver"
        >
          <Icon name="arrow_back" className="text-2xl" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-2xl text-primary truncate">{estudio.titulo}</h2>
          <p className="text-sm text-on-surface-variant">Resultados de validación</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-outline-variant border-t-primary animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon="group"
              label="Evaluadores"
              value={kpis.evaluadores}
              extra="sesiones únicas"
            />
            <KpiCard
              icon="assignment_turned_in"
              label="Respuestas enviadas"
              value={kpis.totalResp}
            />
            <KpiCard
              icon="checklist"
              label="Variables evaluadas"
              value={kpis.variablesEval}
              extra={`de ${totalVariables} totales`}
            />
            <KpiCard
              icon="bar_chart"
              label="Promedio global"
              value={kpis.promedioGlobal !== null ? round2(kpis.promedioGlobal) : "—"}
              extra="sobre 5 puntos"
              highlight={promedioHighlight}
            />
          </div>

          {/* Empty state */}
          {respuestas.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant">
              <Icon name="inbox" className="text-6xl block mb-4 mx-auto opacity-30" />
              <p className="text-base font-semibold">Aún no hay respuestas enviadas</p>
              <p className="text-sm mt-1">Las respuestas aparecerán aquí una vez que los evaluadores las envíen.</p>
            </div>
          )}

          {/* Tabs */}
          {respuestas.length > 0 && (
            <>
              <div className="border-b border-outline-variant flex gap-1">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                      activeTab === i
                        ? "border-primary text-primary"
                        : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                {activeTab === 0 && (
                  <TabVariable respuestas={respuestas} variables={estudio.variables ?? []} />
                )}
                {activeTab === 1 && (
                  <TabDimension respuestas={respuestas} />
                )}
                {activeTab === 2 && (
                  <TabEvaluador respuestas={respuestas} totalVariables={totalVariables} />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
