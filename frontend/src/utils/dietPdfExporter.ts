import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Diet } from '../types/Diet'
import { Food } from '../types/Food'

export interface MealGroup {
  mealName: string
  foods: Array<{
    food: Food
    quantity: number
  }>
}

export const exportDietToPDF = (diet: Diet, meals: MealGroup[] = [], clientName?: string) => {
  const doc = new jsPDF()

  // 1. Header Banner
  doc.setFillColor(0, 167, 111) // Accent color #00a76f
  doc.rect(0, 0, 210, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('PLAN NUTRICIONAL PERSONALIZADO', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('LifeBoost CRM - Fitness App', 14, 25)

  // 2. Information Block
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Dieta: ${diet.name}`, 14, 42)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (clientName) {
    doc.text(`Cliente: ${clientName}`, 14, 48)
  }
  doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, clientName ? 54 : 48)
  if (diet.description) {
    doc.text(`Descripción: ${diet.description}`, 14, clientName ? 60 : 54)
  }

  // 3. Calorie Summary Box
  const summaryY = clientName ? 68 : 62
  doc.setFillColor(244, 246, 248)
  doc.roundedRect(14, summaryY, 182, 18, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 167, 111)
  doc.text(`Objetivo Calórico: ${diet.calories || 2000} kcal / día`, 20, summaryY + 11)

  // Calculate totals
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  meals.forEach((m) => {
    m.foods.forEach(({ food, quantity }) => {
      const multiplier = quantity / 100
      totalCalories += Math.round((food.calories || 0) * multiplier)
    })
  })

  // 4. Render Meals Tables
  let startY = summaryY + 26

  if (meals.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No hay alimentos registrados en este plan nutricional.', 14, startY)
  } else {
    meals.forEach((meal) => {
      if (meal.foods.length === 0) return

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(33, 43, 54)
      doc.text(`🍽️ ${meal.mealName.toUpperCase()}`, 14, startY)

      const tableData = meal.foods.map(({ food, quantity }) => {
        const multiplier = quantity / 100
        const cal = Math.round((food.calories || 0) * multiplier)
        return [food.name, `${quantity} g`, `${cal} kcal`, food.description || '-']
      })

      autoTable(doc, {
        startY: startY + 4,
        head: [['Alimento', 'Cantidad', 'Calorías', 'Detalles / Notas']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 167, 111],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { left: 14, right: 14 }
      })

      // Update startY for next table
      startY = (doc as any).lastAutoTable.finalY + 12
    })
  }

  // Footer Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Página ${i} de ${pageCount} - Generado por Fitness App CRM`, 105, 290, { align: 'center' })
  }

  // Save the PDF file
  const fileName = `Dieta_${diet.name.replace(/[^a-z0-9]/gi, '_')}.pdf`
  doc.save(fileName)
}
