import EventCard from "../components/EventCard.jsx";

function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Web Development Workshop",
      category: "Workshop",
      date: "2026-11-15",
      venue: "CSPIT Auditorium",
      ticketsAvailable: 25,
    },
    {
      id: 2,
      title: "Tech Fest 2026",
      category: "Festival",
      date: "2026-12-10",
      venue: "CHARUSAT Campus",
      ticketsAvailable: 0,
    },
    {
      id: 3,
      title: "Coding Competition",
      category: "Competition",
      date: "2026-11-25",
      venue: "Computer Lab",
      ticketsAvailable: 12,
    },
  ];

  return (
    <div>
      <h2>Upcoming Events</h2>

      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          category={event.category}
          date={event.date}
          venue={event.venue}
          ticketsAvailable={event.ticketsAvailable}
        />
      ))}
    </div>
  );
}

export default EventsPage;