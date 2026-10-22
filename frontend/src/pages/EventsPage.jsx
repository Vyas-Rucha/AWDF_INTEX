import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Initial demo events matching Task 1 & fallback for offline/preview
const INITIAL_DEMO_EVENTS = [
  {
    _id: 'evt-1',
    id: 1,
    title: 'Web Development Workshop',
    category: 'Workshop',
    date: '2026-11-15',
    venue: 'CSPIT Auditorium',
    ticketsAvailable: 25,
  },
  {
    _id: 'evt-2',
    id: 2,
    title: 'Tech Fest 2026',
    category: 'Festival',
    date: '2026-12-10',
    venue: 'CHARUSAT Campus',
    ticketsAvailable: 0,
  },
  {
    _id: 'evt-3',
    id: 3,
    title: 'Coding Competition',
    category: 'Competition',
    date: '2026-11-25',
    venue: 'Computer Lab 3',
    ticketsAvailable: 12,
  },
];

function EventsPage() {
  const { attendee, token } = useAuth();

  // Task 4 States: events, loading, error
  const [events, setEvents] = useState(INITIAL_DEMO_EVENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Task 4 Search Box: client-side search box that filters already-fetched events by title
  const [searchTerm, setSearchTerm] = useState('');

  // Task 2 States: Booking form state using useState (at least two state values used meaningfully)
  const [selectedEventId, setSelectedEventId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Booking action feedback state
  const [bookingMessage, setBookingMessage] = useState({ text: '', type: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch events from Express API (Task 4)
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/v1/events');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data.data && Array.isArray(data.data)) {
        setEvents(data.data);
      }
    } catch (err) {
      // If API fails or backend is starting up, display error and keep fallback
      setError(`Failed to fetch events from backend (${err.message}). Showing cached events.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Set default selected event once events load
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const firstAvailable = events.find((e) => e.ticketsAvailable > 0);
      if (firstAvailable) {
        setSelectedEventId(firstAvailable._id || String(firstAvailable.id));
      }
    }
  }, [events, selectedEventId]);

  // Task 4 Hint: derive the filtered list with .filter() on render without triggering a new API request
  const filteredEvents = events.filter((evt) =>
    evt.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Handle clicking "Book" on any EventCard
  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setBookingMessage({ text: '', type: '' });
    const formElement = document.getElementById('booking-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle booking form submission (Task 2 & Task 4/5 integration)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage({ text: '', type: '' });

    const targetEvent = events.find(
      (ev) => (ev._id || String(ev.id)) === String(selectedEventId)
    );

    if (!targetEvent) {
      setBookingMessage({ text: 'Please select an event to book.', type: 'danger' });
      return;
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      setBookingMessage({ text: 'Ticket quantity must be at least 1.', type: 'danger' });
      return;
    }

    if (qty > targetEvent.ticketsAvailable) {
      setBookingMessage({
        text: `Cannot book ${qty} tickets. Only ${targetEvent.ticketsAvailable} tickets available!`,
        type: 'danger',
      });
      return;
    }

    setBookingLoading(true);

    try {
      const authToken = token || localStorage.getItem('eventhub_token');
      const res = await fetch('http://localhost:5000/api/v1/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          eventId: targetEvent._id || targetEvent.id,
          quantity: qty,
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        setBookingMessage({
          text: `🎉 Successfully booked ${qty} ticket(s) for "${targetEvent.title}"!`,
          type: 'success',
        });
        // Optimistically update ticketsAvailable in state
        setEvents((prev) =>
          prev.map((ev) =>
            (ev._id || String(ev.id)) === String(selectedEventId)
              ? { ...ev, ticketsAvailable: ev.ticketsAvailable - qty }
              : ev
          )
        );
      } else {
        setBookingMessage({
          text: resData.message || 'Booking failed on server.',
          type: 'danger',
        });
      }
    } catch {
      // Local optimistic fallback if backend is offline
      setEvents((prev) =>
        prev.map((ev) =>
          (ev._id || String(ev.id)) === String(selectedEventId)
            ? { ...ev, ticketsAvailable: ev.ticketsAvailable - qty }
            : ev
        )
      );
      setBookingMessage({
        text: `🎉 Successfully booked ${qty} ticket(s) for "${targetEvent.title}"! (Offline simulation)`,
        type: 'success',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="app-header">
        <h1 className="page-title">Upcoming Events</h1>
        <p className="page-subtitle">
          Browse workshops, hackathons, and conferences at CSPIT CHARUSAT.
        </p>
      </div>

      {/* Task 4: Client-side search box that filters already-fetched events by title */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search events by title (instant filter)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </button>
        )}
      </div>

      {/* Task 4: Display a loading indicator while request is in progress */}
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Fetching latest events from server...</p>
        </div>
      )}

      {/* Task 4: Display error message if request fails */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Task 1 & Task 4: Render events via EventCard */}
      {!loading && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="alert alert-info">
              No events found matching &quot;{searchTerm}&quot;.
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id || event.id}
                  title={event.title}
                  category={event.category}
                  date={event.date}
                  venue={event.venue}
                  ticketsAvailable={event.ticketsAvailable}
                  onBook={() => handleSelectEvent(event._id || String(event.id))}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Task 2: Booking Form containing at least selected event and quantity, managed by useState */}
      <div id="booking-form-section" className="form-card" style={{ marginTop: '36px' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>
          🎟️ Book Event Tickets
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Logged in as: <strong>{attendee?.name || 'Attendee'}</strong> ({attendee?.email || 'attendee@eventhub.com'})
        </p>

        {bookingMessage.text && (
          <div className={`alert alert-${bookingMessage.type}`}>
            {bookingMessage.text}
          </div>
        )}

        <form onSubmit={handleBookingSubmit}>
          <div className="form-group">
            <label htmlFor="selectedEventId">Select Event:</label>
            <select
              id="selectedEventId"
              className="form-control"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select an Event --</option>
              {events.map((evt) => (
                <option
                  key={evt._id || evt.id}
                  value={evt._id || String(evt.id)}
                  disabled={evt.ticketsAvailable <= 0}
                >
                  {evt.title} ({evt.ticketsAvailable > 0 ? `${evt.ticketsAvailable} tickets available` : 'Sold Out'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Ticket Quantity:</label>
            <input
              type="number"
              id="quantity"
              className="form-control"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Processing Booking...' : 'Confirm Ticket Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EventsPage;