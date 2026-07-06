import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AnalysisPage } from '../pages/AnalysisPage'
import { DashboardPage } from '../pages/DashboardPage'
import { IncidentCreatePage } from '../pages/IncidentCreatePage'
import { IncidentDetailPage } from '../pages/IncidentDetailPage'
import { IncidentListPage } from '../pages/IncidentListPage'
import { RunbookPage } from '../pages/RunbookPage'

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents" element={<IncidentListPage />} />
        <Route path="/incidents/new" element={<IncidentCreatePage />} />
        <Route path="/incidents/:incidentId" element={<IncidentDetailPage />} />
        <Route path="/runbooks" element={<RunbookPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </AppShell>
  )
}
