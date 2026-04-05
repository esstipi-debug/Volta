#!/usr/bin/env node

/**
 * Supabase Setup Script
 * Ejecuta el schema SQL automáticamente
 *
 * Uso: node scripts/setup-supabase.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const SUPABASE_URL = 'https://svkmvvykkzjbypfvyqhk.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a212dnlra3pqYnlwZnZ5cWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NjIwMSwiZXhwIjoyMDkwOTcyMjAxfQ.cNOVdNB86U-uGq-rICfd4pDkoRsmd4OFPJKNkAMLCAQ'

console.log('🚀 VOLTA Supabase Setup\n')
console.log('=' .repeat(50))

// Leer el script SQL
const sqlPath = path.join(__dirname, '..', 'sql', '001_init_schema.sql')
const sql = fs.readFileSync(sqlPath, 'utf-8')

console.log('✓ SQL schema leído')
console.log(`✓ Conectando a Supabase...`)

// Ejecutar SQL via REST API
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  },
}

const req = https.request(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 204) {
      console.log('\n✅ Schema creado exitosamente!\n')
      console.log('=' .repeat(50))
      console.log('\n✓ Tablas creadas:')
      console.log('  - athletes')
      console.log('  - training_sessions')
      console.log('  - biometrics')
      console.log('  - acwr_daily')
      console.log('  - readiness_daily')
      console.log('  - athlete_gamification')
      console.log('  - injuries')
      console.log('\n✓ Row-Level Security (RLS) habilitado')
      console.log('✓ Índices creados para performance')
      console.log('\n' + '=' .repeat(50))
      console.log('\n📝 Próximos pasos:\n')
      console.log('1. npm run dev         # Inicia servidor local')
      console.log('2. http://localhost:3000 # Abre en navegador')
      console.log('3. Crea una cuenta de prueba')
      console.log('4. Verifica en Supabase → Editor → athletes')
      console.log('\n')
    } else {
      console.error('\n❌ Error ejecutando schema:\n')
      console.error(`Status: ${res.statusCode}`)
      console.error(data)
      process.exit(1)
    }
  })
})

req.on('error', (error) => {
  console.error('\n❌ Error de conexión:\n')
  console.error(error.message)
  console.log('\nTroubleshooting:')
  console.log('- Verifica que SUPABASE_URL es correcto')
  console.log('- Verifica que SERVICE_ROLE_KEY es válido')
  console.log('- Intenta ejecutar el SQL manualmente:')
  console.log('  1. Copia contenido de sql/001_init_schema.sql')
  console.log('  2. Ve a Supabase SQL Editor')
  console.log('  3. Pega y haz click "Run"')
  process.exit(1)
})

// Para Supabase, mejor usar SQL directamente
// Aquí usamos un enfoque alternativo con psql
const { spawn } = require('child_process')

const psql = spawn('psql', [
  process.env.DATABASE_URL,
  '-f',
  sqlPath,
])

let output = ''
let errorOutput = ''

psql.stdout.on('data', (data) => {
  output += data.toString()
})

psql.stderr.on('data', (data) => {
  errorOutput += data.toString()
})

psql.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Schema creado exitosamente!\n')
    console.log('=' .repeat(50))
    console.log('\n✓ Tablas creadas:')
    console.log('  - athletes')
    console.log('  - training_sessions')
    console.log('  - biometrics')
    console.log('  - acwr_daily')
    console.log('  - readiness_daily')
    console.log('  - athlete_gamification')
    console.log('  - injuries')
    console.log('\n✓ Row-Level Security (RLS) habilitado')
    console.log('✓ Índices creados para performance')
    console.log('\n' + '=' .repeat(50))
    console.log('\n📝 Próximos pasos:\n')
    console.log('1. npm run dev         # Inicia servidor local')
    console.log('2. http://localhost:3000 # Abre en navegador')
    console.log('3. Crea una cuenta de prueba')
    console.log('4. Verifica en Supabase → Editor → athletes')
    console.log('\n')
  } else {
    console.error('❌ Error ejecutando schema:\n')
    console.error(errorOutput || output)
    console.log('\nTroubleshooting:')
    console.log('- Instala psql: brew install postgresql (macOS) o apt-get install postgresql (Linux)')
    console.log('- O ejecuta el SQL manualmente:')
    console.log('  1. Copia contenido de sql/001_init_schema.sql')
    console.log('  2. Ve a Supabase SQL Editor')
    console.log('  3. Pega y haz click "Run"')
    process.exit(1)
  }
})
