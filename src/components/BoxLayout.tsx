'use client'

import React, { useMemo, useState } from 'react'

type EquipmentType =
  | 'rower'
  | 'bike'
  | 'ski'
  | 'rig-station'
  | 'plyo-box'
  | 'barbell-platform'
  | 'dumbbell-rack'
  | 'ghd'

type Equipment = {
  id: string
  type: EquipmentType
  label: string
  x: number
  y: number
  w: number
  h: number
  rotation: 0 | 90
}

type Zone = {
  id: string
  label: string
  color: string
  x: number
  y: number
  w: number
  h: number
  perAthleteM2: number
}

const EQUIPMENT_CATALOG: Record<
  EquipmentType,
  { label: string; w: number; h: number; clearance: number; color: string }
> = {
  rower: { label: 'Remadora', w: 2.4, h: 0.6, clearance: 1.0, color: '#0ea5e9' },
  bike: { label: 'Bike Erg', w: 1.2, h: 0.6, clearance: 0.8, color: '#22d3ee' },
  ski: { label: 'Ski Erg', w: 0.6, h: 0.6, clearance: 1.2, color: '#06b6d4' },
  'rig-station': { label: 'Estación rig', w: 1.5, h: 1.5, clearance: 1.0, color: '#f59e0b' },
  'plyo-box': { label: 'Cajón pliometría', w: 0.75, h: 0.6, clearance: 1.0, color: '#a78bfa' },
  'barbell-platform': { label: 'Plataforma barra', w: 2.4, h: 2.4, clearance: 1.0, color: '#ef4444' },
  'dumbbell-rack': { label: 'Rack mancuernas', w: 2.0, h: 0.6, clearance: 0.8, color: '#84cc16' },
  ghd: { label: 'GHD', w: 1.6, h: 0.7, clearance: 0.8, color: '#ec4899' },
}

const ZONE_PRESETS = [
  { label: 'Zona WOD', perAthleteM2: 4, color: 'rgba(59,130,246,0.18)' },
  { label: 'Calistenia', perAthleteM2: 3, color: 'rgba(34,197,94,0.18)' },
  { label: 'Halterofilia', perAthleteM2: 6, color: 'rgba(239,68,68,0.18)' },
  { label: 'Cardio', perAthleteM2: 2.5, color: 'rgba(14,165,233,0.18)' },
  { label: 'Movilidad', perAthleteM2: 2, color: 'rgba(168,85,247,0.18)' },
]

const uid = () => Math.random().toString(36).slice(2, 9)

type Props = { darkMode: boolean; onBack: () => void }

const BoxLayout: React.FC<Props> = ({ darkMode, onBack }) => {
  const [boxW, setBoxW] = useState(20)
  const [boxH, setBoxH] = useState(15)
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: uid(), type: 'rower', label: 'Remadora 1', x: 1, y: 1, w: 2.4, h: 0.6, rotation: 0 },
    { id: uid(), type: 'rower', label: 'Remadora 2', x: 1, y: 2.2, w: 2.4, h: 0.6, rotation: 0 },
  ])
  const [zones, setZones] = useState<Zone[]>([
    { id: uid(), label: 'Zona WOD', color: 'rgba(59,130,246,0.18)', x: 5, y: 1, w: 10, h: 8, perAthleteM2: 4 },
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const boxArea = boxW * boxH

  const equipmentArea = useMemo(
    () =>
      equipment.reduce((sum, e) => {
        const { clearance } = EQUIPMENT_CATALOG[e.type]
        const w = e.rotation === 90 ? e.h : e.w
        const h = e.rotation === 90 ? e.w : e.h
        return sum + (w + clearance) * (h + clearance)
      }, 0),
    [equipment]
  )

  const zonesArea = useMemo(() => zones.reduce((s, z) => s + z.w * z.h, 0), [zones])
  const freeArea = Math.max(0, boxArea - equipmentArea - zonesArea)

  const totalCapacity = useMemo(
    () => zones.reduce((sum, z) => sum + Math.floor((z.w * z.h) / z.perAthleteM2), 0),
    [zones]
  )

  const SCALE = 30 // px per meter
  const svgW = boxW * SCALE
  const svgH = boxH * SCALE

  const c = {
    bg: darkMode ? '#0f172a' : '#ffffff',
    panel: darkMode ? '#111827' : '#f9fafb',
    border: darkMode ? '#1f2937' : '#e5e7eb',
    text: darkMode ? '#ffffff' : '#000000',
    muted: darkMode ? '#9ca3af' : '#6b7280',
    floor: darkMode ? '#1e293b' : '#f1f5f9',
    grid: darkMode ? '#334155' : '#cbd5e1',
  }

  const addEquipment = (type: EquipmentType) => {
    const def = EQUIPMENT_CATALOG[type]
    setEquipment((prev) => [
      ...prev,
      {
        id: uid(),
        type,
        label: `${def.label} ${prev.filter((p) => p.type === type).length + 1}`,
        x: 0.5,
        y: 0.5,
        w: def.w,
        h: def.h,
        rotation: 0,
      },
    ])
  }

  const addZone = (preset: typeof ZONE_PRESETS[number]) => {
    setZones((prev) => [
      ...prev,
      {
        id: uid(),
        label: preset.label,
        color: preset.color,
        x: 1,
        y: 1,
        w: 4,
        h: 3,
        perAthleteM2: preset.perAthleteM2,
      },
    ])
  }

  const updateEquipment = (id: string, patch: Partial<Equipment>) => {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }
  const updateZone = (id: string, patch: Partial<Zone>) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)))
  }
  const removeItem = (id: string) => {
    setEquipment((p) => p.filter((e) => e.id !== id))
    setZones((p) => p.filter((z) => z.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // Drag handling on SVG
  const [drag, setDrag] = useState<{ id: string; kind: 'eq' | 'zone'; dx: number; dy: number } | null>(null)

  const onMouseDown = (e: React.MouseEvent, id: string, kind: 'eq' | 'zone', x: number, y: number) => {
    const svg = (e.target as SVGElement).ownerSVGElement
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const local = pt.matrixTransform(ctm.inverse())
    setDrag({ id, kind, dx: local.x / SCALE - x, dy: local.y / SCALE - y })
    setSelectedId(id)
  }

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag) return
    const svg = e.currentTarget
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const local = pt.matrixTransform(ctm.inverse())
    const nx = Math.max(0, local.x / SCALE - drag.dx)
    const ny = Math.max(0, local.y / SCALE - drag.dy)
    if (drag.kind === 'eq') {
      const item = equipment.find((q) => q.id === drag.id)
      if (!item) return
      const w = item.rotation === 90 ? item.h : item.w
      const h = item.rotation === 90 ? item.w : item.h
      updateEquipment(drag.id, {
        x: Math.min(nx, boxW - w),
        y: Math.min(ny, boxH - h),
      })
    } else {
      const z = zones.find((q) => q.id === drag.id)
      if (!z) return
      updateZone(drag.id, {
        x: Math.min(nx, boxW - z.w),
        y: Math.min(ny, boxH - z.h),
      })
    }
  }

  const onMouseUp = () => setDrag(null)

  const styles = {
    container: { padding: '1rem 2rem', color: c.text },
    layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' },
    panel: {
      backgroundColor: c.panel,
      border: `1px solid ${c.border}`,
      borderRadius: '0.5rem',
      padding: '1rem',
    },
    section: { marginBottom: '1.5rem' },
    h3: { fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' },
    label: { display: 'block', fontSize: '0.8rem', color: c.muted, marginTop: '0.5rem' },
    input: {
      width: '100%',
      padding: '0.4rem 0.6rem',
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      border: `1px solid ${c.border}`,
      borderRadius: '0.375rem',
      color: c.text,
      fontSize: '0.85rem',
    },
    btn: {
      padding: '0.4rem 0.8rem',
      backgroundColor: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.8rem',
      marginRight: '0.4rem',
      marginBottom: '0.4rem',
    },
    chip: {
      display: 'inline-block',
      padding: '0.25rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      backgroundColor: darkMode ? '#1f2937' : '#e5e7eb',
      marginRight: '0.4rem',
      marginBottom: '0.4rem',
      cursor: 'pointer',
      border: `1px solid ${c.border}`,
    },
    stat: { display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.85rem' },
  }

  const selectedEq = equipment.find((e) => e.id === selectedId)
  const selectedZone = zones.find((z) => z.id === selectedId)

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Vista cenital del box</h1>
          <p style={{ color: c.muted, fontSize: '0.9rem' }}>
            Diseña la distribución, calcula m² y capacidad por WOD
          </p>
        </div>
        <button onClick={onBack} style={{ ...styles.btn, backgroundColor: c.muted }}>
          ← Volver
        </button>
      </div>

      <div style={styles.layout}>
        {/* MAPA */}
        <div style={styles.panel}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.85rem' }}>
              Ancho (m)
              <input
                type="number"
                min={3}
                max={60}
                value={boxW}
                onChange={(e) => setBoxW(Math.max(3, Number(e.target.value) || 3))}
                style={{ ...styles.input, width: '80px', marginLeft: '0.5rem' }}
              />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              Largo (m)
              <input
                type="number"
                min={3}
                max={60}
                value={boxH}
                onChange={(e) => setBoxH(Math.max(3, Number(e.target.value) || 3))}
                style={{ ...styles.input, width: '80px', marginLeft: '0.5rem' }}
              />
            </label>
          </div>

          <div style={{ overflow: 'auto', border: `1px solid ${c.border}`, borderRadius: '0.375rem' }}>
            <svg
              width={svgW}
              height={svgH}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{ display: 'block', backgroundColor: c.floor, cursor: drag ? 'grabbing' : 'default' }}
            >
              {/* grilla 1m */}
              <defs>
                <pattern id="grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
                  <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke={c.grid} strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width={svgW} height={svgH} fill="url(#grid)" />

              {/* zonas */}
              {zones.map((z) => (
                <g key={z.id} onMouseDown={(e) => onMouseDown(e, z.id, 'zone', z.x, z.y)} style={{ cursor: 'grab' }}>
                  <rect
                    x={z.x * SCALE}
                    y={z.y * SCALE}
                    width={z.w * SCALE}
                    height={z.h * SCALE}
                    fill={z.color}
                    stroke={selectedId === z.id ? '#3b82f6' : c.grid}
                    strokeDasharray="4 2"
                    strokeWidth={selectedId === z.id ? 2 : 1}
                  />
                  <text
                    x={z.x * SCALE + 6}
                    y={z.y * SCALE + 16}
                    fill={c.text}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {z.label} · {(z.w * z.h).toFixed(1)}m² ·{' '}
                    {Math.floor((z.w * z.h) / z.perAthleteM2)} atletas
                  </text>
                </g>
              ))}

              {/* equipos */}
              {equipment.map((e) => {
                const def = EQUIPMENT_CATALOG[e.type]
                const w = e.rotation === 90 ? e.h : e.w
                const h = e.rotation === 90 ? e.w : e.h
                return (
                  <g key={e.id} onMouseDown={(ev) => onMouseDown(ev, e.id, 'eq', e.x, e.y)} style={{ cursor: 'grab' }}>
                    {/* clearance */}
                    <rect
                      x={(e.x - def.clearance / 2) * SCALE}
                      y={(e.y - def.clearance / 2) * SCALE}
                      width={(w + def.clearance) * SCALE}
                      height={(h + def.clearance) * SCALE}
                      fill={def.color}
                      fillOpacity={0.12}
                      stroke={def.color}
                      strokeOpacity={0.35}
                      strokeDasharray="2 2"
                    />
                    <rect
                      x={e.x * SCALE}
                      y={e.y * SCALE}
                      width={w * SCALE}
                      height={h * SCALE}
                      fill={def.color}
                      stroke={selectedId === e.id ? '#fff' : '#000'}
                      strokeWidth={selectedId === e.id ? 2 : 1}
                      rx={3}
                    />
                    <text
                      x={e.x * SCALE + 4}
                      y={e.y * SCALE + 12}
                      fill="#fff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {e.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <p style={{ color: c.muted, fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Arrastra equipos y zonas. Grilla = 1m². El área punteada alrededor del equipo es la holgura de seguridad.
          </p>
        </div>

        {/* PANEL */}
        <div>
          <div style={styles.panel}>
            <div style={styles.section}>
              <h3 style={styles.h3}>Resumen</h3>
              <div style={styles.stat}>
                <span style={{ color: c.muted }}>Área total</span>
                <strong>{boxArea.toFixed(1)} m²</strong>
              </div>
              <div style={styles.stat}>
                <span style={{ color: c.muted }}>Ocupado por equipos</span>
                <strong>{equipmentArea.toFixed(1)} m²</strong>
              </div>
              <div style={styles.stat}>
                <span style={{ color: c.muted }}>Asignado a zonas</span>
                <strong>{zonesArea.toFixed(1)} m²</strong>
              </div>
              <div style={styles.stat}>
                <span style={{ color: c.muted }}>Libre</span>
                <strong style={{ color: freeArea < 0 ? '#ef4444' : '#10b981' }}>
                  {freeArea.toFixed(1)} m²
                </strong>
              </div>
              <div style={{ ...styles.stat, borderTop: `1px solid ${c.border}`, marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <span style={{ color: c.muted }}>Capacidad total WOD</span>
                <strong style={{ fontSize: '1.1rem', color: '#3b82f6' }}>{totalCapacity} atletas</strong>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.h3}>Añadir equipo</h3>
              {(Object.keys(EQUIPMENT_CATALOG) as EquipmentType[]).map((t) => (
                <span key={t} style={styles.chip} onClick={() => addEquipment(t)}>
                  + {EQUIPMENT_CATALOG[t].label}
                </span>
              ))}
            </div>

            <div style={styles.section}>
              <h3 style={styles.h3}>Añadir zona</h3>
              {ZONE_PRESETS.map((p) => (
                <span key={p.label} style={styles.chip} onClick={() => addZone(p)}>
                  + {p.label} ({p.perAthleteM2}m²/atleta)
                </span>
              ))}
            </div>
          </div>

          {selectedEq && (
            <div style={{ ...styles.panel, marginTop: '1rem' }}>
              <h3 style={styles.h3}>Equipo seleccionado</h3>
              <label style={styles.label}>Nombre</label>
              <input
                style={styles.input}
                value={selectedEq.label}
                onChange={(e) => updateEquipment(selectedEq.id, { label: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  style={styles.btn}
                  onClick={() => updateEquipment(selectedEq.id, { rotation: selectedEq.rotation === 0 ? 90 : 0 })}
                >
                  Rotar 90°
                </button>
                <button
                  style={{ ...styles.btn, backgroundColor: '#ef4444' }}
                  onClick={() => removeItem(selectedEq.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}

          {selectedZone && (
            <div style={{ ...styles.panel, marginTop: '1rem' }}>
              <h3 style={styles.h3}>Zona seleccionada</h3>
              <label style={styles.label}>Nombre</label>
              <input
                style={styles.input}
                value={selectedZone.label}
                onChange={(e) => updateZone(selectedZone.id, { label: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Ancho (m)</label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    style={styles.input}
                    value={selectedZone.w}
                    onChange={(e) => updateZone(selectedZone.id, { w: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Largo (m)</label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    style={styles.input}
                    value={selectedZone.h}
                    onChange={(e) => updateZone(selectedZone.id, { h: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </div>
              </div>
              <label style={styles.label}>m² por atleta</label>
              <input
                type="number"
                min={1}
                step={0.5}
                style={styles.input}
                value={selectedZone.perAthleteM2}
                onChange={(e) =>
                  updateZone(selectedZone.id, { perAthleteM2: Math.max(1, Number(e.target.value) || 1) })
                }
              />
              <p style={{ color: c.muted, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Capacidad: <strong>{Math.floor((selectedZone.w * selectedZone.h) / selectedZone.perAthleteM2)}</strong>{' '}
                atletas en {(selectedZone.w * selectedZone.h).toFixed(1)} m²
              </p>
              <button
                style={{ ...styles.btn, backgroundColor: '#ef4444', marginTop: '0.5rem' }}
                onClick={() => removeItem(selectedZone.id)}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BoxLayout
