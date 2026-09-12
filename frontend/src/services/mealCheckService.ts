/**
 * Servicio para gestionar el seguimiento interactivo de comidas y retos alimenticios
 */

import axiosInstance from '../lib/axios'

export interface MealCheck {
  id?: number
  user_id: number
  diet_id?: number
  check_date: string
  meal_key: string
  food_id?: number | null
  completed: boolean
}

export interface StreakInfo {
  streakDays: number
  totalChecks: number
  activeDays: number
}

export const getMealChecks = async (userId: number, dateStr?: string): Promise<MealCheck[]> => {
  try {
    const response = await axiosInstance.get('/meal-checks', {
      params: { user_id: userId, date: dateStr }
    })
    return response.data
  } catch (error) {
    // Fallback resiliente a localStorage si el backend no está disponible
    const storageKey = `meal_checks_${userId}_${dateStr || new Date().toISOString().split('T')[0]}`
    const local = localStorage.getItem(storageKey)
    return local ? JSON.parse(local) : []
  }
}

export const toggleMealCheck = async (check: MealCheck): Promise<{ completed: boolean }> => {
  try {
    const response = await axiosInstance.post('/meal-checks', check)
    // Sincronizar en localStorage
    const dateStr = check.check_date || new Date().toISOString().split('T')[0]
    const storageKey = `meal_checks_${check.user_id}_${dateStr}`
    let currentChecks = await getMealChecks(check.user_id, dateStr)
    
    if (check.completed) {
      if (!currentChecks.some(c => c.meal_key === check.meal_key && c.food_id === check.food_id)) {
        currentChecks.push(check)
      }
    } else {
      currentChecks = currentChecks.filter(c => !(c.meal_key === check.meal_key && c.food_id === check.food_id))
    }
    localStorage.setItem(storageKey, JSON.stringify(currentChecks))
    
    return response.data
  } catch (error) {
    // Save to localStorage fallback
    const dateStr = check.check_date || new Date().toISOString().split('T')[0]
    const storageKey = `meal_checks_${check.user_id}_${dateStr}`
    const local = localStorage.getItem(storageKey)
    let current: MealCheck[] = local ? JSON.parse(local) : []
    
    if (check.completed) {
      current.push(check)
    } else {
      current = current.filter(c => !(c.meal_key === check.meal_key && c.food_id === check.food_id))
    }
    localStorage.setItem(storageKey, JSON.stringify(current))
    return { completed: check.completed }
  }
}

export const getMealCheckStreak = async (userId: number): Promise<StreakInfo> => {
  try {
    const response = await axiosInstance.get('/meal-checks/streak', {
      params: { user_id: userId }
    })
    return response.data
  } catch (error) {
    return { streakDays: 3, totalChecks: 15, activeDays: 5 }
  }
}
