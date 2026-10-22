import LoginPage from "./pages/LoginPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import MyTicketsPage from "./pages/MyTicketsPage.jsx";

function App() {
  return (
    <div>
      <h1>EventHub Ticket Booking System</h1>
      <LoginPage />
      <hr />
      <EventsPage />
      <hr />
      <MyTicketsPage />
    </div>
  );
}

export default App;