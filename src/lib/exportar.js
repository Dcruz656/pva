import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ── Helpers ────────────────────────────────────────────────────────────────

function labelEstado(e) {
  return e === "enviado" ? "Enviado" : "Borrador"
}

function labelAcceso(m) {
  return m === "liga_publica" ? "Acceso libre" : "Código de acceso"
}

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ── Colores corporativos ───────────────────────────────────────────────────
const COLOR_PRIMARY   = [0, 32, 69]      // #002045
const COLOR_HEADER_BG = [230, 232, 234]  // surface-container-high
const COLOR_WHITE     = [255, 255, 255]
const COLOR_GREEN     = [22, 163, 74]
const COLOR_AMBER     = [217, 119, 6]
const COLOR_RED       = [220, 38, 38]

function scoreColor(n) {
  if (!n) return COLOR_AMBER
  if (n >= 4) return COLOR_GREEN
  if (n === 3) return COLOR_AMBER
  return COLOR_RED
}

// ── PDF: cabecera corporativa ──────────────────────────────────────────────

function pdfHeader(doc, titulo, subtitulo) {
  // Banda superior
  doc.setFillColor(...COLOR_PRIMARY)
  doc.rect(0, 0, 210, 22, "F")

  // Título
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(...COLOR_WHITE)
  doc.text("Plataforma de Validación Académica", 14, 10)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("DCB Platform · Sistema de Investigación Académica", 14, 16)

  // Fecha de generación
  doc.setFontSize(7)
  doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`, 196, 16, { align: "right" })

  // Título del reporte
  doc.setTextColor(...COLOR_PRIMARY)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(titulo, 14, 32)

  if (subtitulo) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text(subtitulo, 14, 38)
  }
}

function pdfFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...COLOR_HEADER_BG)
    doc.rect(0, 286, 210, 11, "F")
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text("Sistema de Validación Académica · Confidencial", 14, 292)
    doc.text(`Página ${i} de ${pageCount}`, 196, 292, { align: "right" })
  }
}

// ══════════════════════════════════════════════════════════════════════════
// EXPORTAR HISTORIAL DE VALIDACIONES (tabla validaciones)
// ══════════════════════════════════════════════════════════════════════════

export function exportarHistorialExcel(registros, filtro = "todos") {
  const filas = registros.map((r, i) => ({
    "#":            i + 1,
    "Variable":     r.variable,
    "Dimensión":    r.dimension ?? "—",
    "Claridad":     r.claridad  ?? "—",
    "Relevancia":   r.relevancia ?? "—",
    "Coherencia":   r.coherencia ?? "—",
    "Promedio":     r.claridad && r.relevancia && r.coherencia
                      ? ((r.claridad + r.relevancia + r.coherencia) / 3).toFixed(2)
                      : "—",
    "Observaciones": r.observaciones ?? "",
    "Estado":       labelEstado(r.estado),
    "Actualizado":  fmtDate(r.updated_at),
  }))

  const ws = XLSX.utils.json_to_sheet(filas)

  // Anchos de columna
  ws["!cols"] = [
    { wch: 4 }, { wch: 40 }, { wch: 22 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 35 }, { wch: 12 }, { wch: 20 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Historial")

  // Hoja resumen
  const dims = [...new Set(registros.map((r) => r.dimension).filter(Boolean))]
  const resumen = dims.map((d) => {
    const rows = registros.filter((r) => r.dimension === d && r.claridad)
    const avg = (field) =>
      rows.length ? (rows.reduce((s, r) => s + (r[field] || 0), 0) / rows.length).toFixed(2) : "—"
    return {
      "Dimensión": d,
      "Variables": rows.length,
      "Promedio Claridad":   avg("claridad"),
      "Promedio Relevancia": avg("relevancia"),
      "Promedio Coherencia": avg("coherencia"),
    }
  })
  if (resumen.length) {
    const wsR = XLSX.utils.json_to_sheet(resumen)
    wsR["!cols"] = [{ wch: 25 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsR, "Resumen por dimensión")
  }

  XLSX.writeFile(wb, `historial_validaciones_${filtro}.xlsx`)
}

export function exportarHistorialPDF(registros, filtro = "todos") {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

  pdfHeader(
    doc,
    "Historial de Validaciones",
    `Estudio STUDY-2024-082 · Filtro: ${filtro === "todos" ? "Todos los registros" : filtro} · ${registros.length} registros`
  )

  const completados = registros.filter((r) => r.claridad && r.relevancia && r.coherencia)
  const promGlobal = completados.length
    ? ((completados.reduce((s, r) => s + r.claridad + r.relevancia + r.coherencia, 0)) /
       (completados.length * 3)).toFixed(2)
    : "—"

  // KPIs
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(`Total registros: ${registros.length}`, 14, 44)
  doc.text(`Completados: ${completados.length}`, 60, 44)
  doc.text(`Promedio global: ${promGlobal}`, 110, 44)
  doc.text(`Enviados: ${registros.filter((r) => r.estado === "enviado").length}`, 160, 44)

  autoTable(doc, {
    startY: 48,
    head: [["#", "Variable", "Dimensión", "Claridad", "Relevancia", "Coherencia", "Promedio", "Estado", "Observaciones"]],
    body: registros.map((r, i) => {
      const prom = r.claridad && r.relevancia && r.coherencia
        ? ((r.claridad + r.relevancia + r.coherencia) / 3).toFixed(1)
        : "—"
      return [
        i + 1,
        r.variable,
        r.dimension ?? "—",
        r.claridad  ?? "—",
        r.relevancia ?? "—",
        r.coherencia ?? "—",
        prom,
        labelEstado(r.estado),
        r.observaciones ?? "",
      ]
    }),
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: COLOR_PRIMARY, textColor: COLOR_WHITE, fontStyle: "bold", fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 8,  halign: "center" },
      1: { cellWidth: 52 },
      2: { cellWidth: 30 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 16, halign: "center" },
      7: { cellWidth: 18, halign: "center" },
      8: { cellWidth: 55 },
    },
    didDrawCell(data) {
      // Colorear celdas numéricas
      if (data.section === "body" && data.column.index >= 3 && data.column.index <= 6) {
        const val = parseFloat(data.cell.text[0])
        if (!isNaN(val)) {
          const [r, g, b] = scoreColor(val)
          doc.setFillColor(r, g, b, 0.15)
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F")
          doc.setTextColor(r, g, b)
          doc.setFontSize(7.5)
          doc.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" })
        }
      }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })

  pdfFooter(doc)
  doc.save(`historial_validaciones_${filtro}.pdf`)
}

// ══════════════════════════════════════════════════════════════════════════
// EXPORTAR RESPUESTAS DE UNA EVALUACIÓN (tabla respuestas)
// ══════════════════════════════════════════════════════════════════════════

export function exportarRespuestasExcel(estudio, respuestas) {
  const wb = XLSX.utils.book_new()

  // ── Hoja 1: Respuestas detalladas ──
  const filas = respuestas.map((r, i) => ({
    "#":              i + 1,
    "Sesión":         r.session_id?.substring(0, 8) + "…",
    "Variable":       r.variable,
    "Dimensión":      r.dimension ?? "—",
    "Claridad":       r.claridad  ?? "—",
    "Relevancia":     r.relevancia ?? "—",
    "Coherencia":     r.coherencia ?? "—",
    "Promedio":       r.claridad && r.relevancia && r.coherencia
                        ? ((r.claridad + r.relevancia + r.coherencia) / 3).toFixed(2)
                        : "—",
    "Observaciones":  r.observaciones ?? "",
    "Estado":         labelEstado(r.estado),
    "Fecha":          fmtDate(r.updated_at),
  }))
  const ws1 = XLSX.utils.json_to_sheet(filas)
  ws1["!cols"] = [
    { wch: 4 }, { wch: 12 }, { wch: 42 }, { wch: 22 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 35 }, { wch: 12 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, ws1, "Respuestas detalladas")

  // ── Hoja 2: Resumen por variable ──
  const variables = [...new Set(respuestas.map((r) => r.variable))]
  const resVars = variables.map((v) => {
    const rows = respuestas.filter((r) => r.variable === v && r.estado === "enviado" && r.claridad)
    const avg = (f) => rows.length ? (rows.reduce((s, r) => s + (r[f] || 0), 0) / rows.length).toFixed(2) : "—"
    return {
      "Variable":            v,
      "Dimensión":           respuestas.find((r) => r.variable === v)?.dimension ?? "—",
      "N° respuestas":       rows.length,
      "Prom. Claridad":      avg("claridad"),
      "Prom. Relevancia":    avg("relevancia"),
      "Prom. Coherencia":    avg("coherencia"),
    }
  })
  const ws2 = XLSX.utils.json_to_sheet(resVars)
  ws2["!cols"] = [{ wch: 42 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws2, "Resumen por variable")

  // ── Hoja 3: Info del estudio ──
  const info = [
    { "Campo": "Título",         "Valor": estudio.titulo },
    { "Campo": "Descripción",    "Valor": estudio.descripcion ?? "—" },
    { "Campo": "Modo de acceso", "Valor": labelAcceso(estudio.modo_acceso) },
    { "Campo": "Estado",         "Valor": estudio.estado },
    { "Campo": "Fecha límite",   "Valor": fmtDate(estudio.fecha_limite) },
    { "Campo": "Creado",         "Valor": fmtDate(estudio.created_at) },
    { "Campo": "Total respuestas enviadas", "Valor": respuestas.filter((r) => r.estado === "enviado").length },
  ]
  const ws3 = XLSX.utils.json_to_sheet(info)
  ws3["!cols"] = [{ wch: 25 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, ws3, "Info del estudio")

  const nombre = estudio.titulo.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")
  XLSX.writeFile(wb, `evaluacion_${nombre}.xlsx`)
}

export function exportarRespuestasPDF(estudio, respuestas) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  const enviadas = respuestas.filter((r) => r.estado === "enviado")
  const sessions = [...new Set(enviadas.map((r) => r.session_id))]

  pdfHeader(
    doc,
    estudio.titulo,
    `${labelAcceso(estudio.modo_acceso)} · ${sessions.length} evaluador${sessions.length !== 1 ? "es" : ""} · ${enviadas.length} respuestas enviadas`
  )

  // KPIs
  const completadas = enviadas.filter((r) => r.claridad && r.relevancia && r.coherencia)
  const promGlobal = completadas.length
    ? ((completadas.reduce((s, r) => s + r.claridad + r.relevancia + r.coherencia, 0)) /
       (completadas.length * 3)).toFixed(2)
    : "—"

  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(`Evaluadores: ${sessions.length}`, 14, 44)
  doc.text(`Respuestas enviadas: ${enviadas.length}`, 55, 44)
  doc.text(`Promedio global: ${promGlobal}`, 115, 44)
  if (estudio.fecha_limite) {
    doc.text(`Fecha límite: ${new Date(estudio.fecha_limite + "T12:00:00").toLocaleDateString("es-ES")}`, 175, 44)
  }

  // ── Tabla de respuestas ──
  autoTable(doc, {
    startY: 49,
    head: [["Sesión", "Variable", "Dimensión", "Claridad", "Relevancia", "Coherencia", "Promedio", "Observaciones"]],
    body: enviadas.map((r) => {
      const prom = r.claridad && r.relevancia && r.coherencia
        ? ((r.claridad + r.relevancia + r.coherencia) / 3).toFixed(1)
        : "—"
      return [
        r.session_id?.substring(0, 8) + "…",
        r.variable,
        r.dimension ?? "—",
        r.claridad  ?? "—",
        r.relevancia ?? "—",
        r.coherencia ?? "—",
        prom,
        r.observaciones ?? "",
      ]
    }),
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: COLOR_PRIMARY, textColor: COLOR_WHITE, fontStyle: "bold", fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 52 },
      2: { cellWidth: 28 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 16, halign: "center" },
      7: { cellWidth: 53 },
    },
    didDrawCell(data) {
      if (data.section === "body" && data.column.index >= 3 && data.column.index <= 6) {
        const val = parseFloat(data.cell.text[0])
        if (!isNaN(val)) {
          const [r, g, b] = scoreColor(val)
          doc.setFillColor(r, g, b, 0.12)
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F")
          doc.setTextColor(r, g, b)
          doc.setFontSize(7.5)
          doc.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" })
        }
      }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })

  // ── Página 2: Resumen por variable ──
  doc.addPage()
  pdfHeader(doc, "Resumen por Variable", estudio.titulo)

  const variables = [...new Set(enviadas.map((r) => r.variable))]
  const resumen = variables.map((v) => {
    const rows = enviadas.filter((r) => r.variable === v && r.claridad)
    const avg = (f) => rows.length ? (rows.reduce((s, r) => s + (r[f] || 0), 0) / rows.length).toFixed(2) : "—"
    const prom = rows.length
      ? ((rows.reduce((s, r) => s + r.claridad + r.relevancia + r.coherencia, 0)) / (rows.length * 3)).toFixed(2)
      : "—"
    return [
      v,
      enviadas.find((r) => r.variable === v)?.dimension ?? "—",
      rows.length,
      avg("claridad"),
      avg("relevancia"),
      avg("coherencia"),
      prom,
    ]
  })

  autoTable(doc, {
    startY: 44,
    head: [["Variable", "Dimensión", "N°", "Prom. Claridad", "Prom. Relevancia", "Prom. Coherencia", "Promedio Global"]],
    body: resumen,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLOR_PRIMARY, textColor: COLOR_WHITE, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40 },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 26, halign: "center" },
      4: { cellWidth: 28, halign: "center" },
      5: { cellWidth: 28, halign: "center" },
      6: { cellWidth: 26, halign: "center" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })

  pdfFooter(doc)
  const nombre = estudio.titulo.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")
  doc.save(`evaluacion_${nombre}.pdf`)
}
