import React from 'react';

/**
 * EventCard component (Task 1)
 * Accepts props: title, category, date, venue, ticketsAvailable
 * Displays all 5 values.
 * Uses conditional logic at the top to render 'Sold Out' badge if ticketsAvailable === 0.
 */
function EventCard({
  title,
  category,
  date,
  venue,
  ticketsAvailable,
  onBook,
}) {
  // Hint: keep the sold-out check as a simple conditional at the top of the component
  const isSoldOut = ticketsAvailable === 0 || ticketsAvailable <= 0;

  // Format date safely
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'TBA';

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-card-title">{title}</h3>
        <span className="event-category-pill">{category || 'General'}</span>
      </div>

      <div className="event-card-body">
        <p className="event-info">
          <span className="info-label">Date:</span> {formattedDate}
        </p>
        <p className="event-info">
          <span className="info-label">Venue:</span> {venue}
        </p>
        <p className="event-info">
          <span className="info-label">Tickets Available:</span>{' '}
          <strong className={ticketsAvailable <= 5 && !isSoldOut ? 'low-tickets' : ''}>
            {ticketsAvailable}
          </strong>
        </p>
      </div>

      <div className="event-card-footer">
        {isSoldOut ? (
          <span className="badge badge-sold-out">Sold Out</span>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-book"
            onClick={onBook}
          >
            Book
          </button>
        )}
      </div>
    </div>
  );
}

export default EventCard;