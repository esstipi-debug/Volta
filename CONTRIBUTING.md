# Contributing to VOLTA

Gracias por tu interés en contribuir a VOLTA. Esta guía te ayuda a colaborar de manera efectiva.

## Código de conducta

- **Respeto**: Trata a todos con respeto
- **Inclusión**: Somos una comunidad inclusiva
- **Colaboración**: Pregunta antes de grandes cambios

## Antes de empezar

1. **Fork** el repositorio (si no eres core contributor)
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/descripcion-cambio
   ```
3. **Lee** `DEVELOPMENT.md` para setup local

## Tipos de contribuciones

### 🐛 Bug Fixes

```bash
git checkout -b fix/descripcion-bug
# Edita el código
npm run test -- [related-test]
git commit -m "fix: corta descripción del bug"
```

**Checklist:**
- [ ] Test que reproduzca el bug
- [ ] Fix implementado
- [ ] Test pasa ahora
- [ ] Documentación actualizada (si aplica)

### ✨ Nuevas features

```bash
git checkout -b feature/descripcion-feature
# Implementa feature
npm run test
npm run build  # Verifica que compila
git commit -m "feat: descripción de la feature"
```

**Checklist:**
- [ ] Tests para la nueva feature
- [ ] Documentación actualizada
- [ ] Tipos TypeScript correctos
- [ ] No breaking changes (si es posible)

### 📚 Documentación

```bash
git checkout -b docs/mejora-documentacion
# Edita archivos .md
git commit -m "docs: descripción del cambio"
```

## Requisitos para PR

Cada pull request debe:

1. **Pasar tests**:
   ```bash
   npm run test
   ```

2. **Pasar linter**:
   ```bash
   npm run lint
   ```

3. **Estar formateado**:
   ```bash
   npx prettier --write .
   ```

4. **Compilar sin errores**:
   ```bash
   npm run build
   ```

5. **Tener descripción clara**:
   - Qué problema resuelve
   - Cómo lo resuelve
   - Tests que lo validan

## Convenciones de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)
footer (optional)
```

**Types:**
- `feat`: Nueva feature
- `fix`: Bug fix
- `docs`: Cambios a documentación
- `style`: Cambios de formato (no code logic)
- `refactor`: Refactorización
- `test`: Agregar/actualizar tests
- `chore`: Dependencias, configuración

**Ejemplos:**
```
feat(engines): add Engine #14 Programming Guide
fix(auth): fix NextAuth session persistence
docs(readme): update Neon setup instructions
```

## Estilo de código

### TypeScript

```typescript
// ✅ Exporta tipos
export interface StressEngineInput {
  movements: MovementInput[]
  srpe: number
}

export function calculateIMR(input: StressEngineInput): StressEngineResult {
  // Documenta fórmulas
  // IMR = Σ(stress_coeff × weight × reps × sets)
  return { ... }
}

// ✅ Comenta lógica compleja
// EWMA = λ × new_value + (1 - λ) × previous
const ewma = lambda * load + (1 - lambda) * prevEWMA

// ❌ No: comentarios obvios
const x = 5  // variable x
```

### React Components

```typescript
// ✅ Props con tipos
interface DashboardProps {
  athlete_id: string
  acwr?: number
}

export function Dashboard({ athlete_id, acwr }: DashboardProps) {
  return <div>...</div>
}

// ✅ Usa hooks correctamente
useEffect(() => {
  // fetch data
}, [athlete_id])
```

### SQL / Database

```typescript
// ✅ Usa Drizzle para queries
const sessions = await db
  .select()
  .from(training_sessions)
  .where(eq(training_sessions.athlete_id, athleteId))
  .limit(30)

// ❌ No: raw SQL (excepto migraciones)
```

## Testing

### Escribe tests para:

- Funciones core de engines
- API endpoints públicos
- Cambios críticos en lógica

### Estructura de tests

```typescript
describe('ComponentOrFunction', () => {
  it('should do X when Y', () => {
    // Arrange
    const input = { ... }
    
    // Act
    const result = myFunction(input)
    
    // Assert
    expect(result).toBe(expected)
  })
})
```

**Ejecutar tests:**
```bash
npm run test -- [filename].test.ts
npm run test -- --watch
```

## Documentación

### Para cada engine:

```typescript
/**
 * ENGINE #01 — StressEngine
 *
 * Propósito: Calcula el IMR (Intensity Magnitude Rating) de cada sesión.
 *
 * Fórmula:
 *   IMR = Σ(stress_coeff × weight_kg × reps × sets) × WOD_type_multiplier
 *
 * Entrada: StressEngineInput
 * Salida: StressEngineResult
 *
 * @example
 * const result = calculateIMR({
 *   movements: [{ movement_id: 'back_squat', sets: 3, reps: 5, weight_kg: 100 }],
 *   srpe: 8,
 *   workout_type: 'STRENGTH'
 * })
 */
```

### Para cambios en schema:

Documenta en `docs/` si es cambio significativo:
```markdown
## Schema Change: Add new_column to athletes

- **Reason**: [why you added this]
- **Migration**: [migration command]
- **Impact**: [what breaks if any]
```

## Proceso de review

1. **Crea PR** con descripción clara
2. **Espera review** de maintainers
3. **Responde comments** o solicita cambios
4. **Pasa CI/CD checks** (tests, linter, build)
5. **Merge** cuando esté aprobado

## Reportar bugs

### GitHub Issues

Incluye:
1. **Descripción clara** del problema
2. **Pasos para reproducir**
3. **Resultado esperado** vs actual
4. **Stack trace** (si aplica)
5. **Environment**: Node version, OS, etc.

**Template:**
```markdown
## Bug: [Título claro]

### Descripción
[Explicación clara]

### Pasos para reproducir
1. 
2. 

### Esperado
[Qué debería pasar]

### Actual
[Qué pasa ahora]

### Stack trace
[Error si aplica]

### Environment
- Node: v18.x
- OS: macOS/Linux/Windows
```

## Recursos útiles

- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team/)
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)

## Preguntas?

- Abre un **Discussion** en GitHub
- Pregunta en **Slack** #volta-dev
- Crea un **Issue** si no es claro

---

**Gracias por contribuir a VOLTA! 🙌**

*Last updated: 2026-04-04*
