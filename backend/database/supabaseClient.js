/**
 * Adaptador de Base de Datos para Neon DB (PostgreSQL)
 * Traduce consultas a PostgreSQL nativo a través de la librería pg y la variable DATABASE_URL
 */

require('dotenv').config()
const { Pool } = require('pg')
const jwt = require('jsonwebtoken')

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_8WXFzveJq7aL@ep-broad-sea-abagn2gh-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Query builder compatible para traducir sintaxis de .from(...) a PostgreSQL
class QueryBuilder {
  constructor(table) {
    this.table = table
    this.operation = 'SELECT'
    this.columns = '*'
    this.whereConditions = []
    this.values = []
    this.orderClause = ''
    this.insertData = null
    this.updateData = null
    this.isSingle = false
    this.isMaybeSingle = false
  }

  select(columns = '*') {
    this.columns = columns === '*' ? '*' : columns
    return this
  }

  insert(data) {
    this.operation = 'INSERT'
    this.insertData = data
    return this
  }

  upsert(data, options = {}) {
    this.operation = 'UPSERT'
    this.insertData = data
    this.upsertOptions = options
    return this
  }

  update(data) {
    this.operation = 'UPDATE'
    this.updateData = data
    return this
  }

  delete() {
    this.operation = 'DELETE'
    return this
  }

  eq(column, value) {
    if (value !== undefined) {
      this.values.push(value)
      this.whereConditions.push(`"${column}" = $${this.values.length}`)
    }
    return this
  }

  in(column, valuesArr) {
    if (Array.isArray(valuesArr) && valuesArr.length > 0) {
      const placeholders = valuesArr.map((v) => {
        this.values.push(v)
        return `$${this.values.length}`
      })
      this.whereConditions.push(`"${column}" IN (${placeholders.join(', ')})`)
    }
    return this
  }

  order(column, options = {}) {
    const direction = options.ascending === false ? 'DESC' : 'ASC'
    this.orderClause = `ORDER BY "${column}" ${direction}`
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  maybeSingle() {
    this.isMaybeSingle = true
    return this
  }

  async then(resolve, reject) {
    try {
      let queryText = ''

      if (this.operation === 'SELECT') {
        let cols = this.columns
        if (cols !== '*') {
          cols = cols
            .split(',')
            .map((c) => `"${c.trim()}"`)
            .join(', ')
        }
        queryText = `SELECT ${cols} FROM "${this.table}"`
        if (this.whereConditions.length > 0) {
          queryText += ` WHERE ${this.whereConditions.join(' AND ')}`
        }
        if (this.orderClause) {
          queryText += ` ${this.orderClause}`
        }
      } else if (this.operation === 'INSERT' || this.operation === 'UPSERT') {
        const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
        if (items.length > 0) {
          const keys = Object.keys(items[0])
          const cols = keys.map((k) => `"${k}"`).join(', ')
          const valueRows = []
          items.forEach((item) => {
            const rowPlaceholders = keys.map((k) => {
              this.values.push(item[k])
              return `$${this.values.length}`
            })
            valueRows.push(`(${rowPlaceholders.join(', ')})`)
          })

          if (this.operation === 'UPSERT') {
            const conflictTarget = this.upsertOptions?.onConflict || 'slug'
            const updateSet = keys
              .filter((k) => k !== conflictTarget && k !== 'id')
              .map((k) => `"${k}" = EXCLUDED."${k}"`)
              .join(', ')
            const onConflictClause = updateSet
              ? `ON CONFLICT ("${conflictTarget}") DO UPDATE SET ${updateSet}`
              : `ON CONFLICT ("${conflictTarget}") DO NOTHING`
            queryText = `INSERT INTO "${this.table}" (${cols}) VALUES ${valueRows.join(', ')} ${onConflictClause} RETURNING *`
          } else {
            queryText = `INSERT INTO "${this.table}" (${cols}) VALUES ${valueRows.join(', ')} RETURNING *`
          }
        }
      } else if (this.operation === 'UPDATE') {
        const keys = Object.keys(this.updateData)
        const setClauses = keys.map((k) => {
          this.values.push(this.updateData[k])
          return `"${k}" = $${this.values.length}`
        })
        queryText = `UPDATE "${this.table}" SET ${setClauses.join(', ')}`
        if (this.whereConditions.length > 0) {
          queryText += ` WHERE ${this.whereConditions.join(' AND ')}`
        }
        queryText += ' RETURNING *'
      } else if (this.operation === 'DELETE') {
        queryText = `DELETE FROM "${this.table}"`
        if (this.whereConditions.length > 0) {
          queryText += ` WHERE ${this.whereConditions.join(' AND ')}`
        }
        queryText += ' RETURNING *'
      }

      const result = await pool.query(queryText, this.values)
      let data = result.rows

      if (this.isSingle) {
        data = data[0] || null
      } else if (this.isMaybeSingle) {
        data = data[0] || null
      }

      resolve({ data, error: null })
    } catch (err) {
      console.error(`Error en consulta Neon DB (${this.table}):`, err)
      resolve({ data: null, error: err })
    }
  }
}

// Simulador de Auth para Neon DB usando JWT
const authSimulator = {
  admin: {
    createUser: async ({ email, password, user_metadata }) => {
      try {
        const result = await pool.query(
          `INSERT INTO users (email, name, surname, birth_date, role, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
           RETURNING *`,
          [
            email,
            user_metadata?.first_name || user_metadata?.name || '',
            user_metadata?.last_name || user_metadata?.surname || '',
            user_metadata?.birth_date || '2000-01-01',
            user_metadata?.role || 'client',
          ]
        )
        const user = result.rows[0]
        return { data: { user: { id: user.id, email: user.email, user_metadata } }, error: null }
      } catch (err) {
        return { data: null, error: err }
      }
    },
  },
  getUser: async (token) => {
    try {
      const secret = process.env.JWT_SECRET || 'lifeboost_jwt_secret_8f9a2b4c6e1d3f5a7b9c0d2e4f6a8b1c2d3e4f5a'
      const decoded = jwt.verify(token, secret)
      const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [decoded.id])
      const user = result.rows[0]
      if (!user) return { data: { user: null }, error: new Error('Usuario no encontrado') }
      return { data: { user: { id: user.id, email: user.email, ...user } }, error: null }
    } catch (err) {
      return { data: { user: null }, error: err }
    }
  },
}

const dbAdapter = {
  from: (table) => new QueryBuilder(table),
  auth: authSimulator,
  pool,
}

module.exports = {
  pool,
  supabase: dbAdapter,
  supabaseAdmin: dbAdapter,
}


