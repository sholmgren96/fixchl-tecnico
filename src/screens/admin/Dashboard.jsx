import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { adminApi } from '../../services/adminApi'

const COLORS = ['#FE8315', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B']

function KpiCard({ label, value, sub, color = '#FE8315' }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: '1 1 160px', minWidth: 0,
    }}>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: 40, color: '#6B7280', fontSize: 14 }}>Cargando estadísticas…</div>
  )
  if (error) return (
    <div style={{ padding: 40, color: '#EF4444', fontSize: 14 }}>Error: {error}</div>
  )

  const { kpis, funnel, por_semana, por_categoria, por_comuna, calificaciones_dist, top_tecnicos, tecnicos_por_estado } = stats

  // Derive activos/pendientes from tecnicos_por_estado array
  const tecActivos   = tecnicos_por_estado?.find(r => r.estado === 'activo')?.cantidad  ?? 0
  const tecPendientes= tecnicos_por_estado?.find(r => r.estado === 'pendiente')?.cantidad ?? 0

  // Rating dist for chart
  const ratingData = (calificaciones_dist || []).map(r => ({
    name: `${r.puntaje}★`,
    count: Number(r.cantidad),
  }))

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Dashboard</h1>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <KpiCard label="Técnicos activos"    value={tecActivos}              color="#10B981" />
        <KpiCard label="Técnicos pendientes" value={tecPendientes}           color="#F59E0B" />
        <KpiCard label="Trabajos totales"    value={kpis?.total_trabajos}    color="#3B82F6" />
        <KpiCard label="Completados"         value={kpis?.completados}       color="#FE8315" />
        <KpiCard label="Tasa de conversión"  value={kpis?.tasa_conversion != null ? `${kpis.tasa_conversion}%` : null} color="#8B5CF6" sub="creados → completados" />
        <KpiCard label="Rating promedio"     value={kpis?.rating_promedio > 0 ? `${kpis.rating_promedio}★` : null} color="#EF4444" />
      </div>

      {/* Actividad semanal + Funnel */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 400px' }}>
          <Section title="Trabajos últimas 10 semanas">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={por_semana || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Line type="monotone" dataKey="cantidad" stroke="#FE8315" strokeWidth={2} dot={{ r: 3 }} name="Trabajos" />
              </LineChart>
            </ResponsiveContainer>
          </Section>
        </div>

        <div style={{ flex: '1 1 220px' }}>
          <Section title="Embudo de conversión">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnel || []} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                <YAxis type="category" dataKey="etapa" tick={{ fontSize: 11, fill: '#6B7280' }} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="cantidad" radius={4} name="Trabajos">
                  {(funnel || []).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>
      </div>

      {/* Por categoría + por comuna + ratings */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px' }}>
          <Section title="Trabajos por categoría">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={por_categoria || []} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="nombre" tick={{ fontSize: 9, fill: '#9CA3AF' }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="cantidad" radius={4} name="Trabajos">
                  {(por_categoria || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        <div style={{ flex: '1 1 220px' }}>
          <Section title="Trabajos por comuna">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={por_comuna || []}
                  dataKey="cantidad"
                  nameKey="nombre"
                  cx="50%" cy="50%"
                  outerRadius={75}
                  label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(por_comuna || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, n, p) => [v, p.payload.nombre]} />
              </PieChart>
            </ResponsiveContainer>
          </Section>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <Section title="Distribución de ratings">
            {ratingData.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingTop: 60 }}>Sin calificaciones aún</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ratingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#FE8315" radius={4} name="Calificaciones" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Section>
        </div>
      </div>

      {/* Top técnicos */}
      {top_tecnicos?.length > 0 && (
        <Section title="Top técnicos (por trabajos completados)">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                {['#', 'Técnico', 'Completados', 'Total trabajos', 'Rating'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600, color: '#374151', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top_tecnicos.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F9FAFB', background: i % 2 ? '#FAFAFA' : 'white' }}>
                  <td style={{ padding: '10px 12px', color: '#9CA3AF', fontWeight: 700, fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>{t.nombre}</td>
                  <td style={{ padding: '10px 12px', color: '#10B981', fontWeight: 700 }}>{t.completados}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{t.total_jobs}</td>
                  <td style={{ padding: '10px 12px', color: '#FE8315', fontWeight: 700 }}>
                    {t.rating > 0 ? `${t.rating}★` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

    </div>
  )
}
