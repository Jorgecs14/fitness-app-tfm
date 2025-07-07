// Hook personalizado para funcionalidades de exportación de datos a PDF, Excel y CSV
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface ExportData {
  headers: string[]
  data: any[][]
  filename: string
  title?: string
}

export const useExport = () => {
  const exportToPDF = ({
    headers,
    data,
    filename,
    title = 'Reporte'
  }: ExportData) => {
    try {
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text(title, 14, 22)

      doc.setFontSize(11)
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 32)

      if (typeof (doc as any).autoTable === 'function') {
        ;(doc as any).autoTable({
          head: [headers],
          body: data,
          startY: 40,
          styles: {
            fontSize: 10,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [63, 81, 181],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        })
      } else {
        let yPosition = 50
        doc.setFontSize(10)

        const pageWidth = doc.internal.pageSize.width
        const margins = 28 
        const availableWidth = pageWidth - margins
        const columnWidth = availableWidth / headers.length

        doc.setFont('helvetica', 'bold')
        let xPosition = 14
        headers.forEach((header) => {
          const displayHeader =
            header.length > 15 ? header.substring(0, 12) + '...' : header
          doc.text(displayHeader, xPosition, yPosition)
          xPosition += columnWidth
        })

        yPosition += 12
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)

        data.forEach((row) => {
          xPosition = 14
          row.forEach((cell, index) => {
            let displayText = String(cell)

            const maxLength = index === 0 ? 8 : 20 
            if (displayText.length > maxLength) {
              displayText = displayText.substring(0, maxLength - 3) + '...'
            }

            doc.text(displayText, xPosition, yPosition)
            xPosition += columnWidth
          })
          yPosition += 10

          if (yPosition > 280) {
            doc.addPage()
            yPosition = 30
          }
        })
      }

      doc.save(`${filename}.pdf`)
    } catch (error) {
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.')
    }
  }

  const exportToExcel = ({
    headers,
    data,
    filename,
    title = 'Reporte'
  }: ExportData) => {
    const wb = XLSX.utils.book_new()

    const wsData = [
      [title],
      [`Fecha: ${new Date().toLocaleDateString('es-ES')}`],
      [], 
      headers,
      ...data
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]

    const colWidths = headers.map((header) => ({
      wch: Math.max(header.length, 15)
    }))
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Datos')

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `${filename}.xlsx`)
  }

  const exportToCSV = ({ headers, data, filename }: ExportData) => {
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
          )
          .join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${filename}.csv`)
  }

  return {
    exportToPDF,
    exportToExcel,
    exportToCSV
  }
}
