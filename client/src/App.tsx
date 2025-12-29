import { useState, useEffect } from 'react'
import './App.css'

// Use window.location.origin to work in any environment
// In GKE, this will be the Load Balancer IP (http://34.54.86.122)
// Ingress routes: / -> frontend, /api -> backend, /health -> backend
const API_URL = window.location.origin

interface HealthStatus {
  status: string
  timestamp: string
  uptime: number
  environment: string
  database: {
    status: string
    latency: string
    connections?: {
      total_connections: string
      active_connections: string
    }
  }
  memory: {
    used: string
    total: string
  }
  responseTime: string
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/health`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 dx03 Application</h1>
        <p className="subtitle">Google Cloud Platform Demo</p>
      </header>

      <main className="App-main">
        <div className="status-card">
          <h2>System Status</h2>
          
          {loading && <p className="loading">Loading...</p>}
          
          {error && (
            <div className="error-box">
              <p>❌ Error: {error}</p>
              <button onClick={fetchHealth} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {health && !loading && (
            <div className="health-info">
              <div className={`status-badge ${health.status}`}>
                {health.status === 'healthy' ? '✅' : '⚠️'} {health.status.toUpperCase()}
              </div>

              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-label">Environment</div>
                  <div className="metric-value">{health.environment}</div>
                </div>

                <div className="metric">
                  <div className="metric-label">Uptime</div>
                  <div className="metric-value">{formatUptime(health.uptime)}</div>
                </div>

                <div className="metric">
                  <div className="metric-label">Response Time</div>
                  <div className="metric-value">{health.responseTime}</div>
                </div>

                <div className="metric">
                  <div className="metric-label">Memory Usage</div>
                  <div className="metric-value">{health.memory.used} / {health.memory.total}</div>
                </div>
              </div>

              <div className="database-section">
                <h3>📊 Database Status</h3>
                <div className="db-status">
                  <span className={`db-badge ${health.database.status}`}>
                    {health.database.status}
                  </span>
                  <span className="db-latency">
                    Latency: {health.database.latency}
                  </span>
                  {health.database.connections && (
                    <div className="db-connections">
                      <span>Connections: {health.database.connections.active_connections} / {health.database.connections.total_connections}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="timestamp">
                Last updated: {new Date(health.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="info-section">
          <h3>🎯 Architecture</h3>
          <ul className="tech-stack">
            <li>⚛️ React 18 + TypeScript</li>
            <li>⚡ Vite</li>
            <li>🚀 Node.js + Express</li>
            <li>🗄️ PostgreSQL (Cloud SQL)</li>
            <li>☸️ Google Kubernetes Engine</li>
            <li>📦 Artifact Registry</li>
          </ul>
        </div>

        <div className="actions">
          <button onClick={fetchHealth} className="refresh-btn">
            🔄 Refresh Status
          </button>
          <a 
            href={`${API_URL}/api/metrics`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-btn"
          >
            📈 View Metrics
          </a>
        </div>
      </main>

      <footer className="App-footer">
        <p>Built with ❤️ on Google Cloud Platform</p>
        <p className="api-url">API: {API_URL}</p>
      </footer>
    </div>
  )
}

export default App
