'use client'

import React, { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const VoltaApp: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true)
  const [view, setView] = useState<'login' | 'athlete-dashboard' | 'coach-dashboard'>('login')
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
      transition: 'background-color 0.3s',
    },
    navbar: {
      position: 'fixed' as const,
      top: 0,
      width: '100%',
      backgroundColor: darkMode ? '#111827' : '#f3f4f6',
      borderBottom: `1px solid ${darkMode ? '#1f2937' : '#e5e7eb'}`,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 50,
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
    },
    main: {
      paddingTop: '4rem',
      minHeight: '100vh',
      padding: '2rem',
    },
    card: {
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
      border: `1px solid ${darkMode ? '#1f2937' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      padding: '2rem',
      maxWidth: '28rem',
      margin: '2rem auto',
    },
    input: {
      width: '100%',
      padding: '0.5rem 1rem',
      marginTop: '0.5rem',
      marginBottom: '1rem',
      backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
      borderRadius: '0.375rem',
      color: darkMode ? '#ffffff' : '#000000',
    },
    button: {
      width: '100%',
      padding: '0.5rem 1rem',
      marginTop: '1.5rem',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem',
    },
    alertCard: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
    },
  }

  const handleLogin = (role: 'athlete' | 'coach') => {
    const name = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || 'User'
    setUser({ name: name.split('@')[0] || 'User', role })
    setView(role === 'athlete' ? 'athlete-dashboard' : 'coach-dashboard')
  }

  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.title}>VOLTA</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user && (
            <button
              onClick={() => { setUser(null); setView('login'); }}
              style={{ ...styles.button, width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        {view === 'login' && !user && (
          <div style={styles.card}>
            <h1 style={{ marginBottom: '1rem' }}>Welcome to VOLTA</h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '2rem' }}>
              CrossFit Performance Intelligence
            </p>
            <input type="email" placeholder="Email" style={styles.input} />
            <input type="password" placeholder="Password" style={styles.input} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <label style={{ flex: 1 }}>
                <input type="radio" name="role" value="athlete" defaultChecked /> Athlete
              </label>
              <label style={{ flex: 1 }}>
                <input type="radio" name="role" value="coach" /> Coach
              </label>
            </div>
            <button
              style={styles.button}
              onClick={() => {
                const role = (document.querySelector('input[name="role"]:checked') as HTMLInputElement)?.value as 'athlete' | 'coach'
                handleLogin(role || 'athlete')
              }}
            >
              Sign In
            </button>
          </div>
        )}

        {view === 'athlete-dashboard' && user && (
          <div>
            <h1>Welcome {user.name}! 💪</h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '2rem' }}>
              Athlete Dashboard
            </p>
            <div style={styles.grid}>
              {[
                { title: 'ACWR Status', value: '0.78', status: 'yellow' },
                { title: 'HRV Recovery', value: 'Stable', status: 'green' },
                { title: 'Sleep Last Night', value: '6h 30m', status: 'yellow' },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    ...styles.alertCard,
                    borderColor: card.status === 'green' ? '#10b981' : '#f59e0b',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'coach-dashboard' && user && (
          <div>
            <h1>Coach Dashboard 👨‍🏫</h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '2rem' }}>
              Managing athletes
            </p>
            <div style={styles.grid}>
              {['Carlos', 'Maria', 'Juan'].map((name) => (
                <div key={name} style={styles.alertCard}>
                  <p style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{name}</p>
                  <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    ACWR: 0.{Math.floor(Math.random() * 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoltaApp
