import { Routes, Route } from 'react-router-dom'
import PortfolioPage from './pages/PortfolioPage.jsx'
import AccountingPage from './pages/AccountingPage.jsx'
import SnakePage from './pages/SnakePage.jsx'
import WeatherPage from './pages/WeatherPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/accounting" element={<AccountingPage />} />
      <Route path="/snake" element={<SnakePage />} />
      <Route path="/weather" element={<WeatherPage />} />
    </Routes>
  )
}
