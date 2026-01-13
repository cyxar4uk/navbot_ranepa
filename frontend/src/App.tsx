import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EventProvider } from './context/EventContext'
import { UserProvider } from './context/UserContext'
import Layout from './components/common/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import ProgramView from './components/Program/ProgramView'
import EventPage from './components/Program/EventPage'
import SpeakersView from './components/Speakers/SpeakersView'
import SpeakerPage from './components/Speakers/SpeakerPage'
import MapView from './components/Map/MapView'
import ChatInterface from './components/Assistant/ChatInterface'
import NewsView from './components/News/NewsView'
import CustomPage from './components/CustomPage/CustomPage'
import AdminDashboard from './components/Admin/AdminDashboard'
import EventBuilder from './components/Admin/EventBuilder'
import { EventBuilderNew } from './components/Admin/EventBuilderNew'
import AdminGuard from './components/Admin/AdminGuard'
import AdminLogin from './components/Admin/AdminLogin'

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <EventProvider>
          <Layout>
            <Routes>
              {/* User routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/program" element={<ProgramView />} />
              <Route path="/program/:itemId" element={<EventPage />} />
              <Route path="/speakers" element={<SpeakersView />} />
              <Route path="/speakers/:speakerId" element={<SpeakerPage />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/assistant" element={<ChatInterface />} />
              <Route path="/news" element={<NewsView />} />
              <Route path="/page/:moduleId" element={<CustomPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<AdminGuard />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/events/:eventId" element={<EventBuilder />} />
                <Route path="/admin/events/:eventId/builder" element={<EventBuilderNew />} />
              </Route>
            </Routes>
          </Layout>
        </EventProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
