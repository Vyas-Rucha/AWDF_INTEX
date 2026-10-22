import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Navbar component (Task 2)
 * Contains React Router links to all routes:
 * - / (Login)
 * - /events (EventsPage)
 * - /my-tickets (MyTicketsPage)
 * - /organizer (OrganizerPanel)
 * Navigation performed without full-page reload.
 */
function Navbar() {
  const { attendee, token, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <NavLink to={token ? "/events" : "/"} className="nav-brand">
          🎟️ <span>EventHub</span>
        </NavLink>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className={({ isActive }) => (isActive ? 'active' : '')}>
                Events
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-tickets" className={({ isActive }) => (isActive ? 'active' : '')}>
                My Tickets
              </NavLink>
            </li>
            <li>
              <NavLink to="/organizer" className={({ isActive }) => (isActive ? 'active' : '')}>
                Organizer Panel
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {token && attendee ? (
            <>
              <div className="user-badge">
                <span>{attendee.name || attendee.email}</span>
                <span className="role-tag">{role}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not Logged In</span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
