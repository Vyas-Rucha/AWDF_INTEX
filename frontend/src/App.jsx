import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';

// Direct imports for standard routes
import LoginPage from './pages/LoginPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import MyTicketsPage from './pages/MyTicketsPage.jsx';

// Task 2: Lazy-loaded route for Organizer Panel using React.lazy + Suspense
const OrganizerPanel = lazy(() => import('./pages/OrganizerPanel.jsx'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ minHeight: '80vh', paddingBottom: '40px' }}>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<LoginPage />} />

            {/* Protected Route: EventsPage */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Route: MyTicketsPage */}
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTicketsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected + Lazy-loaded Route: OrganizerPanel (role 'organizer' required) */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute requiredRole="organizer">
                  <Suspense
                    fallback={
                      <div className="spinner-container">
                        <div className="spinner"></div>
                        <p>Loading Organizer Panel (Lazy Loaded)...</p>
                      </div>
                    }
                  >
                    <OrganizerPanel />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Fallback wildcard route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer>
          <p>© 2026 EventHub · CSPIT, CHARUSAT · ITUE301 Advanced Web Development Frameworks</p>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;