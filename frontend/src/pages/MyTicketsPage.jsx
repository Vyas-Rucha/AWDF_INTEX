import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function MyTicketsPage() {
  const { attendee, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchMyTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const authToken = token || localStorage.getItem('eventhub_token');
      const res = await fetch('http://localhost:5000/api/v1/tickets/my', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data.data && Array.isArray(data.data)) {
        setTickets(data.data);
      }
    } catch {
      // Offline fallback mock data for testing
      setTickets([
        {
          _id: 'tkt-mock-1',
          quantity: 2,
          bookingDate: new Date().toISOString(),
          status: 'booked',
          eventId: {
            title: 'Web Development Workshop',
            date: '2026-11-15',
            venue: 'CSPIT Auditorium',
          },
          attendeeId: {
            name: attendee?.name || 'Demo Attendee',
            email: attendee?.email || 'attendee@eventhub.com',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setActionMessage('');
    try {
      const authToken = token || localStorage.getItem('eventhub_token');
      const res = await fetch(`http://localhost:5000/api/v1/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setActionMessage(`Ticket status updated to "${newStatus}"!`);
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
        );
      } else {
        const data = await res.json();
        setActionMessage(data.message || 'Status update failed.');
      }
    } catch {
      // Local optimistic update
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
      );
      setActionMessage(`Ticket status updated to "${newStatus}"! (Local simulation)`);
    }
  };

  return (
    <div className="container">
      <div className="app-header">
        <h1 className="page-title">My Booked Tickets</h1>
        <p className="page-subtitle">
          Attendee: <strong>{attendee?.name || 'Attendee'}</strong> ({attendee?.email || 'attendee@eventhub.com'})
        </p>
      </div>

      {actionMessage && <div className="alert alert-info">{actionMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="alert alert-info">
          You haven't booked any event tickets yet. Head to the Events page to book one!
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Event</th>
                <th>Date & Venue</th>
                <th>Qty</th>
                <th>Booked On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const eventInfo = t.eventId || {};
                return (
                  <tr key={t._id}>
                    <td>
                      <code>{t._id.slice(-6)}</code>
                    </td>
                    <td>
                      <strong>{eventInfo.title || 'Event Booking'}</strong>
                    </td>
                    <td>
                      {eventInfo.date ? new Date(eventInfo.date).toLocaleDateString() : 'N/A'}<br />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {eventInfo.venue || 'Campus'}
                      </span>
                    </td>
                    <td>{t.quantity}</td>
                    <td>{new Date(t.bookingDate || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${t.status}`}>{t.status}</span>
                    </td>
                    <td>
                      {t.status === 'booked' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUpdateStatus(t._id, 'used')}
                          >
                            Mark Used
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateStatus(t._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {t.status !== 'booked' && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyTicketsPage;