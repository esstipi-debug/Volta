# ACTIVO #6: MovementEscalationEngine (Motor de Escalado de Movimientos)

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** ALTO — cierra el ciclo detección → acción
- **Estado actual:** Implementado en TypeScript, biblioteca de 30+ movimientos con 3 niveles

## Ubicación en el sistema actual
- **Frontend TypeScript:** `src/lib/movement-escalation.ts` (clase `MovementEscalationEngine`)
- **Datos de referencia:** `backend/app/data/movement_mappings.json` (30+ movimientos con escalados)
- **Integración API:** `src/api/injury-prevention-endpoint.ts` (incluye `movement_modifications` en respuesta)
- **Fuente metodológica:** `docs/Mayhem-Athlete-Scaling-Doc.pdf`

## Lógica subyacente

### Arquitectura de 3 niveles por movimiento

Cada movimiento tiene 3 escalas con criterio biomecánico:

```
┌──────────┬────────────────────────────────────────────────────┐
│ NIVEL    │ CRITERIO DE ACTIVACIÓN                             │
├──────────┼────────────────────────────────────────────────────┤
│ Rx+      │ ACWR verde + Recovery GOOD + técnica validada      │
│          │ Atleta en pico de rendimiento, puede progresar     │
├──────────┼────────────────────────────────────────────────────┤
│ Rx       │ ACWR verde/amarillo + Recovery FAIR+               │
│          │ Estándar para la mayoría de sesiones               │
├──────────┼────────────────────────────────────────────────────┤
│ Beginner │ Alerta YELLOW/RED + Recovery POOR + técnica débil  │
│          │ Preserva estímulo muscular sin riesgo articular    │
└──────────┴────────────────────────────────────────────────────┘
```

### Biblioteca de movimientos (ejemplos representativos)

**HALTEROFILIA (Weightlifting)**

| Movimiento | Rx+ | Rx | Beginner |
|------------|-----|-----|----------|
| Back Squat | 90%+ 1RM, ATG completo | 70-89% 1RM, paralelo | Goblet Squat 20-30 lbs |
| Deadlift | 90%+ 1RM, sumo o convencional | 70-89% 1RM, convencional | KB Deadlift, carga moderada |
| Power Clean | 85%+ 1RM, full squat clean | 70-84% 1RM, power position | Hang Power Clean con barra vacía |
| Squat Snatch | 85%+ 1RM, overhead squat completo | 70-84%, power snatch | Overhead Squat con PVC/barra |
| Thruster | 80%+ 1RM | 65-79% 1RM | Front Squat + Push Press separados |

**GIMNASIA (Gymnastics)**

| Movimiento | Rx+ | Rx | Beginner |
|------------|-----|-----|----------|
| Pull-ups | Chest-to-bar, kipping estricto | Kipping standard | Ring rows / Banded pull-ups |
| Ring Muscle-ups | Estrictos | Kipping | Transition drills + dips separados |
| Handstand Walk | 50+ ft sin interrupción | 25 ft segmentos | Wall walks / Shoulder taps |
| Toes-to-bar | Estrictos, kipping eficiente | Kipping standard | Knee raises / V-ups |
| Rope Climb | Legless | Con pies, 15 ft | Rope pulls desde suelo |

**CARDIO**

| Movimiento | Rx+ | Rx | Beginner |
|------------|-----|-----|----------|
| Row | Pace <1:40/500m | Pace 1:40-2:00/500m | Pace >2:00, resistencia baja |
| Assault Bike | >70 RPM sostenido | 50-70 RPM | <50 RPM, resistencia mínima |
| Double Unders | Unbroken series 50+ | Sets de 20-30 | Single unders ×3 reps |
| Burpees | Chest-to-floor, salto alto | Standard | Step-back burpees, sin salto |
| Box Jump | 30"/24" | 24"/20" | Step-ups a 20"/16" |

### Estructura de datos por movimiento
```typescript
interface MovementEscalation {
  name: string;                    // "Back Squat"
  category: "gymnastics" | "weightlifting" | "cardio";
  stress_coefficient: number;      // 1.1 (del StressEngine)
  levels: {
    rx_plus: {
      description: string;         // "90%+ 1RM, full ATG depth"
      load_range: string;          // "90-100% 1RM"
      biomechanical_rationale: string;  // "Máxima demanda CNS, requiere técnica perfecta"
      stress_multiplier: number;   // 1.15 (IMR ajustado para este nivel)
    };
    rx: {
      description: string;
      load_range: string;
      biomechanical_rationale: string;
      stress_multiplier: number;   // 1.0 (baseline)
    };
    beginner: {
      description: string;
      load_range: string;
      biomechanical_rationale: string;
      stress_multiplier: number;   // 0.6-0.8 (menor estrés)
      alternative_movement: string; // "Goblet Squat" (movimiento sustituto)
    };
  };
  scaling_options: string[];       // Lista completa de Mayhem Scaling Doc
}
```

### Lógica de selección automática
```
Input: alert_severity + recovery_status + athlete_training_age

Si alert = GREEN y recovery = GOOD y training_age > 3 años:
  → Rx+ permitido

Si alert = GREEN/YELLOW y recovery ≥ FAIR:
  → Rx estándar

Si alert = YELLOW/RED o recovery = POOR:
  → Beginner obligatorio

Si alert = BLACK:
  → No entrenar. Descanso total.
```

### Recálculo de IMR post-escalado
Cuando el atleta escala, el IMR del WOD se recalcula con el `stress_multiplier` del nivel aplicado:
```
IMR_escalado = IMR_original × stress_multiplier_del_nivel

Ejemplo:
  WOD programado Rx: Back Squat 5×5 @ 90kg → IMR = 5,000
  Atleta escala a Beginner (Goblet Squat): 5,000 × 0.65 = 3,250 IMR
  → El ACWR refleja la carga REAL, no la programada
```

## Dependencias
- **Consume:**
  - AlertResult del InjuryPreventionAlertSystem (Activo #3) — severidad determina nivel
  - RecoveryCalculator (Activo #4) — estado de recuperación como segundo criterio
  - Perfil del atleta — training age para permitir Rx+
  - `movement_mappings.json` — biblioteca completa de movimientos y escalados
- **Alimenta:**
  - StressEngine (Activo #1) — el IMR se recalcula con el stress_multiplier post-escalado
  - Dashboard del atleta — muestra la escala recomendada antes del WOD
  - Coach Dashboard — el coach ve qué escala se recomendó a cada atleta
  - API Response — `movement_modifications` array en la respuesta del endpoint

## Valor diferenciador
1. **Cierra el ciclo completo:** Detección (ACWR/Alertas) → Diagnóstico (Recovery/HRV) → **Prescripción (Escalado exacto)**
2. **No dice "escala"** — dice exactamente **a qué movimiento, a qué carga, y por qué**
3. **Justificación biomecánica** por nivel — el atleta entiende la razón, no solo la instrucción
4. **30+ movimientos × 3 niveles = 90+ combinaciones** — biblioteca propietaria significativa
5. **Basado en Mayhem Athlete Scaling Doc** — metodología probada en competencia de élite
6. **Recalcula IMR automáticamente** — el ACWR refleja carga real post-escalado, no carga programada
7. **Previene el ego silenciosamente** — la recomendación viene del sistema, no del coach (reduce fricción social)

## Requisitos para migración/adaptación
1. **Migrar `movement_mappings.json` íntegro** — es la biblioteca core (compartida con StressEngine)
2. **Preservar la estructura de 3 niveles** con `stress_multiplier` por nivel
3. **Mantener `biomechanical_rationale`** por escalado — es valor educativo y diferenciador UX
4. **El recálculo de IMR post-escalado es crítico** — sin esto, el ACWR no refleja realidad
5. **La biblioteca debe ser extensible** — nuevos movimientos deben poder agregarse via JSON sin tocar código
6. **Considerar versionado de la biblioteca** — a medida que la metodología evolucione, los escalados pueden cambiar
7. **Preservar categorización** (gymnastics/weightlifting/cardio) — alimenta la métrica de Distribución de Movimientos
