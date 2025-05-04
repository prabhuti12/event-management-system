
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const EventCreationForm = ({ initialData = {}, onCancelCreate }) => {
  const [eventData, setEventData] = useState({
    event_name: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    category: '',
    ...initialData,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState(null);

  const maxLengths = {
    event_name: 100,
    location: 255,
    category: 50,
  };

  const isEventDataEmpty = Object.values(eventData).some(value => value === '') || !imageFile;

  const validateInput = (name, value) => {
    if (maxLengths[name] && value.length > maxLengths[name]) {
      return `Maximum length for ${name.replace('_', ' ')} is ${maxLengths[name]} characters`;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value);
    if (validationError) {
      setError(validationError);
      return;
    }
    setEventData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
        setError('Only PNG, JPEG, and GIF files are allowed');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setError('Please select an image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      for (const [name, value] of Object.entries(eventData)) {
        const validationError = validateInput(name, value);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      if (!imageFile) {
        setError('Please upload an image');
        return;
      }

      const formData = new FormData();
      Object.entries(eventData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', imageFile);

      const response = await fetch('http://127.0.0.1:5000/api/create/event', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create event: ${response.status}`);
      }

      alert('Event Created Successfully!');
      setEventData({
        event_name: '',
        start_time: '',
        end_time: '',
        location: '',
        description: '',
        category: '',
      });
      setImageFile(null);
      setImagePreview('');
      onCancelCreate();
    }
    catch (error) {
      console.error('Error Creating Event:', error);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(to right,rgb(248, 232, 237), #FA8072, rgb(247, 191, 191))', minHeight: '100vh', padding: '30px 0' }}>
      <section className="text-center container">
        <div
          className="form-card"
          style={{
            maxWidth: '550px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '15px',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)',
            padding: '40px',
          }}
        >
          <h1 className="fw-bold" style={{ marginBottom: '25px', color: '#1b2631' }}>Create Event</h1>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}
          >
            <TextField
              required
              label="Title"
              name="event_name"
              value={eventData.event_name}
              onChange={handleChange}
              inputProps={{ maxLength: maxLengths.event_name }}
            />
            <TextField
              required
              label="Start Time"
              name="start_time"
              type="datetime-local"
              value={eventData.start_time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              label="End Time"
              name="end_time"
              type="datetime-local"
              value={eventData.end_time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              label="Location"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              inputProps={{ maxLength: maxLengths.location }}
            />
            <TextField
              required
              label="Description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
            <TextField
              required
              label="Category"
              name="category"
              value={eventData.category}
              onChange={handleChange}
              inputProps={{ maxLength: maxLengths.category }}
            />
            <div style={{ margin: '15px 0' }}>
              <Button
                variant="contained"
                component="label"
                sx={{ m: 1, backgroundColor: '#007bff', '&:hover': { backgroundColor: '#00aaff' } }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleFileChange}
                  required
                />
              </Button>
              {imagePreview && (
                <div style={{ marginTop: '15px' }}>
                  <img
                    src={imagePreview}
                    alt="Event Banner Preview"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </Box>
          <div style={{ marginTop: '30px' }}>
            <Button
              variant="contained"
              type="submit"
              onClick={handleSubmit}
              disabled={isEventDataEmpty}
              style={{
                padding: '10px 30px',
                marginRight: '10px',
                backgroundColor: '#43a047',
              }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={onCancelCreate}
              style={{ padding: '10px 30px', borderColor: '#e65100', color: '#e65100' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventCreationForm;
