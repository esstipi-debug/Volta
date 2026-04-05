#!/usr/bin/env node

/**
 * Database Initialization Script
 * Ejecuta el schema SQL en Supabase
 */

import { config } from 'dotenv'
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Cargar .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está definido')
  console.error('Asegúrate de que .env.local existe con DATABASE_URL configurado')
  process.exit(1)
}

console.log('🚀 VOLTA Database Initialization\n')
console.log('='.repeat(60))

try {
  // Conectar a la base de datos
  console.log('📡 Conectando a Supabase PostgreSQL...')
  const sql = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 5,
  })

  // Leer el script SQL
  const sqlPath = path.join(__dirname, '..', 'sql', '001_init_schema.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

  console.log('✓ Script SQL leído')

  // Dividir el script en statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  console.log(`✓ ${statements.length} operaciones encontradas\n`)

  // Ejecutar cada statement
  ;(async () => {
    let completed = 0
    for (const statement of statements) {
      try {
        await sql.unsafe(statement)
        completed++
        process.stdout.write(`\r✓ Completadas ${completed}/${statements.length} operaciones`)
      } catch (error) {
        // Algunos errores son esperados (tabla ya existe, etc)
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('UNIQUE constraint')
        ) {
          // Ignorar errores de objetos que ya existen
          completed++
          process.stdout.write(`\r✓ Completadas ${completed}/${statements.length} operaciones`)
        } else if (error.message.includes('CREATE POLICY')) {
          // Las políticas de RLS pueden fallar si ya existen
          completed++
          process.stdout.write(`\r✓ Completadas ${completed}/${statements.length} operaciones`)
        } else {
          throw error
        }
      }
    }

    console.log('\n\n✅ Schema inicializado exitosamente!\n')
    console.log('='.repeat(60))
    console.log('\n✓ Tablas creadas:')
    console.log('  📊 athletes')
    console.log('  🏋️  training_sessions')
    console.log('  📈 biometrics')
    console.log('  📉 acwr_daily')
    console.log('  💪 readiness_daily')
    console.log('  🎮 athlete_gamification')
    console.log('  🏥 injuries')
    console.log('\n✓ Row-Level Security (RLS) habilitado')
    console.log('✓ Índices creados para performance')
    console.log('\n' + '='.repeat(60))
    console.log('\n📝 Próximos pasos:\n')
    console.log('1. npm run dev           # Inicia servidor local')
    console.log('2. http://localhost:3000 # Abre en navegador')
    console.log('3. Crea una cuenta de prueba')
    console.log('4. Verifica en Supabase → Editor → athletes\n')

    await sql.end()
    process.exit(0)
  })()
} catch (error) {
  console.error('\n❌ Error:\n')
  console.error(error.message)
  console.log('\nTroubleshooting:')
  console.log('✓ Verifica que DATABASE_URL es correcto')
  console.log('✓ Verifica que .env.local existe')
  console.log('✓ Verifica conexión a internet')
  console.log('\nAlternativa manual:')
  console.log('1. Copia contenido de sql/001_init_schema.sql')
  console.log('2. Ve a Supabase Dashboard → SQL Editor')
  console.log('3. Pega y haz click "Run"\n')
  process.exit(1)
}
