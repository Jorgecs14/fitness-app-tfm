import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Diet, DietSupplementProduct } from '../types/Diet'
import { Food } from '../types/Food'

export interface MealGroup {
  mealName: string
  foods: Array<{
    food: Food
    quantity: number
    unit?: string
    calories?: number
  }>
}

export const exportDietToPDF = (diet: Diet, meals: MealGroup[] = [], clientName?: string) => {
  const doc = new jsPDF()

  // 1. Header Banner
  doc.setFillColor(0, 122, 255) // Apple Blue accent
  doc.rect(0, 0, 210, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('PLAN NUTRICIONAL PERSONALIZADO', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('LifeBoost CRM - Fitness App Platform', 14, 25)

  // 2. Information Block
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`Dieta: ${diet.name}`, 14, 42)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  let currentY = 48
  if (clientName) {
    doc.text(`Atleta / Cliente: ${clientName}`, 14, currentY)
    currentY += 5
  }
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, currentY)
  currentY += 5

  if (diet.description) {
    doc.text(`Pautas: ${diet.description}`, 14, currentY)
    currentY += 6
  }

  // 3. Calorie & Water Summary Box
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 122, 255)
  doc.setFontSize(10)
  doc.text(`Objetivo Calórico: ${diet.calories || 2000} kcal / día`, 20, currentY + 11)

  doc.setTextColor(52, 199, 89)
  doc.text(`💧 Hidratación Diaria: ${diet.water_liters || 2.5} Litros / día`, 110, currentY + 11)

  let startY = currentY + 24

  // Check structured meals in diet.meals_data if meals array is empty
  let mealsToRender = meals
  if (mealsToRender.length === 0 && diet.meals_data) {
    const rawMeals = typeof diet.meals_data === 'string' ? JSON.parse(diet.meals_data) : diet.meals_data
    const labels: Record<string, string> = {
      breakfast: 'Desayuno',
      mid_morning: 'Media Mañana',
      lunch: 'Almuerzo',
      snack: 'Merienda',
      dinner: 'Cena'
    }
    mealsToRender = Object.entries(rawMeals).map(([key, list]: [string, any]) => ({
      mealName: labels[key] || key,
      foods: (list || []).map((item: any) => ({
        food: {
          id: item.food_id || 0,
          name: item.name,
          calories: item.calories || 0,
          description: item.notes || ''
        },
        quantity: item.quantity || 100,
        unit: item.unit || 'g',
        calories: item.calories || 0
      }))
    })).filter((m) => m.foods.length > 0)
  }

  // 4. Render Meals Tables
  if (mealsToRender.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No hay alimentos registrados en este plan nutricional.', 14, startY)
    startY += 10
  } else {
    mealsToRender.forEach((meal) => {
      if (meal.foods.length === 0) return

      if (startY > 250) {
        doc.addPage()
        startY = 20
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(33, 43, 54)
      doc.text(`🍽️ ${meal.mealName.toUpperCase()}`, 14, startY)

      const tableData = meal.foods.map(({ food, quantity, unit, calories }) => {
        const cal = calories !== undefined ? calories : Math.round(((food.calories || 0) * quantity) / 100)
        return [food.name, `${quantity} ${unit || 'g'}`, `${cal} kcal`, food.description || '-']
      })

      autoTable(doc, {
        startY: startY + 3,
        head: [['Alimento', 'Cantidad', 'Calorías', 'Notas']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 122, 255],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 2.5
        },
        margin: { left: 14, right: 14 }
      })

      startY = (doc as any).lastAutoTable.finalY + 8
    })
  }

  // 5. Suplementación y Productos recomendados
  let supplements: DietSupplementProduct[] = []
  if (diet.supplement_products) {
    supplements = typeof diet.supplement_products === 'string' ? JSON.parse(diet.supplement_products) : diet.supplement_products
  }

  if (Array.isArray(supplements) && supplements.length > 0) {
    if (startY > 230) {
      doc.addPage()
      startY = 20
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 149, 0)
    doc.text('💊 SUPLEMENTACIÓN Y PRODUCTOS RECOMENDADOS', 14, startY)

    const suppTableData = supplements.map((s) => [
      s.name,
      s.timing || '-',
      s.dosage || '-',
      s.observations || '-',
      s.url || '-'
    ])

    autoTable(doc, {
      startY: startY + 3,
      head: [['Producto / Suplemento', 'Momento (Timing)', 'Dosis', 'Observaciones', 'Enlace']],
      body: suppTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 149, 0],
        textColor: 0,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      margin: { left: 14, right: 14 }
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
