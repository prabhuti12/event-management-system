
import React, { useState, useEffect, useCallback } from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import UpdateEvent from './UpdateEvent';
import EventCreationForm from './EventCreationForm';

const locations = [
  { value: '', label: 'All' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Gandhinagar', label: 'Gandhinagar' },
  { value: 'Vadodara', label: 'Vadodara' },
];

const categories = [
  { value: '', label: 'All' },
  { value: 'Music', label: 'Music' },
  { value: 'Business', label: 'Business' },
  { value: 'Exhibition', label: 'Exhibition' },
];

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateTimeFilter, setDateTimeFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createEvent, setCreateEvent] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/data');
      if (!response.ok) throw new Error(`Failed to Fetch Data: ${response.status}`);
      const data = await response.json();
      let filteredEvents = data[0] || [];

      if (locationFilter) {
        filteredEvents = filteredEvents.filter(event => event[4] === locationFilter);
      }
      if (categoryFilter) {
        filteredEvents = filteredEvents.filter(event => event[6] === categoryFilter);
      }
      if (dateTimeFilter) {
        const dateTime = new Date(dateTimeFilter).getTime();
        filteredEvents = filteredEvents.filter(
          event =>
            new Date(event[2]).getTime() <= dateTime &&
            new Date(event[3]).getTime() >= dateTime
        );
      }

      setEvents(filteredEvents);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [locationFilter, categoryFilter, dateTimeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, selectedEvent, createEvent]);

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/events/delete/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete event: ${response.status}`);
      alert('Event Deleted successfully!');
      fetchEvents();
    } catch (error) {
      setError(error.message);
    }
  };

  const getImageUrl = (url) => (url?.startsWith('http') ? url : `http://127.0.0.1:5000${url}`);

  return (
    <div style={{ background: 'linear-gradient(to right, #e0eafc, #cfdef3)', minHeight: '100vh' }}>
      {loading ? (
        <p style={{ textAlign: 'center', paddingTop: '50px' }}>Loading events...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>
      ) : selectedEvent ? (
        <UpdateEvent eventData={selectedEvent} onCancelUpdate={() => setSelectedEvent(null)} />
      ) : createEvent ? (
        <EventCreationForm onCancelCreate={() => setCreateEvent(false)} />
      ) : (
        <div>
          <section className="py-5 text-center container">
            <div className="row py-lg-5">
              <div className="col-lg-8 col-md-10 mx-auto">
                <h1 className="fw-bold" style={{ color: '#2c3e50' }}>All Events</h1>
                <p className="lead text-muted">
                  Explore our curated collection of events tailored for your interests. Discover, engage, and enjoy!
                </p>
                <button
                  className="btn btn-success my-3"
                  style={{ padding: '10px 20px', fontWeight: '500', fontSize: '16px' }}
                  onClick={() => setCreateEvent(true)}
                >
                  + Create New Event
                </button>
                <div
                  className="filters-container"
                  style={{
                    background: '#ffffff',
                    padding: '20px',
                    marginTop: '20px',
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <FormControl sx={{ m: 1, minWidth: 160 }} variant="outlined">
                    <InputLabel id="location-label">Location</InputLabel>
                    <Select
                      labelId="location-label"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      label="Location"
                    >
                      {locations.map((loc) => (
                        <MenuItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ m: 1, minWidth: 160 }} variant="outlined">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      label="Category"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Date & Time"
                    type="datetime-local"
                    value={dateTimeFilter}
                    onChange={(e) => setDateTimeFilter(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ m: 1, minWidth: 220 }}
                  />
                </div>
              </div>
            </div>
          </section>
          <div className="album py-5">
            <div className="container">
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                {events.map((event) => (
                  <div className="col" key={event[0]}>
                    <div
                      className="card h-100 shadow-sm"
                      style={{
                        borderRadius: '15px',
                        transition: 'transform 0.2s',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <img
                        src={getImageUrl(event[7])}
                        alt={event[1]}
                        className="card-img-top"
                        style={{
                          height: '220px',
                          objectFit: 'cover',
                          borderTopLeftRadius: '15px',
                          borderTopRightRadius: '15px'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x225?text=No+Image';
                        }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{event[1]}</h5>
                        <p className="card-text text-muted">{event[5]}</p>
                        <p className="card-text"><strong>Start:</strong> {event[2]}</p>
                        <p className="card-text"><strong>End:</strong> {event[3]}</p>
                        <p className="card-text"><strong>Location:</strong> {event[4]}</p>
                      </div>
                      <div className="card-footer d-flex justify-content-between align-items-center bg-light">
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedEvent(event)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteEvent(event[0])}
                          >
                            Delete
                          </button>
                        </div>
                        <small className="text-muted">{event[6]}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
