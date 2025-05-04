
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const UpdateEvent = ({ eventData, onCancelUpdate }) => {
    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toISOString().slice(0, 16);
    };

    const [updatedEventData, setUpdatedEventData] = useState({
        event_name: eventData[1],
        start_time: formatDate(eventData[2]),
        end_time: formatDate(eventData[3]),
        location: eventData[4],
        description: eventData[5],
        category: eventData[6],
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(eventData[7] || '');
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedEventData({ ...updatedEventData, [name]: value });
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
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const formData = new FormData();
            Object.entries(updatedEventData).forEach(([key, value]) => {
                formData.append(key, value);
            });
            if (imageFile) {
                formData.append('file', imageFile);
            } else if (!eventData[7] && !imageFile) {
                throw new Error('Please upload an image');
            }

            const response = await fetch(`http://127.0.0.1:5000/api/events/update/${eventData[0]}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update event: ${response.status}`);
            }

            alert('Event updated successfully!');
            onCancelUpdate();
        } catch (error) {
            setError(error.message);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
        }}>
            <section style={{
                background: '#fff',
                padding: '30px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '600px'
            }}>
                <h1 style={{ textAlign: 'center', color: '#3f51b5', marginBottom: '30px' }}>Update Event</h1>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}
                <Box
                    component="form"
                    sx={{ '& .MuiTextField-root': { m: 1, width: '100%' } }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField label="Event Name" name="event_name" required value={updatedEventData.event_name} onChange={handleChange} inputProps={{ maxLength: 100 }} />
                    <TextField label="Start Time" name="start_time" required type="datetime-local" value={updatedEventData.start_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    <TextField label="End Time" name="end_time" required type="datetime-local" value={updatedEventData.end_time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    <TextField label="Location" name="location" required value={updatedEventData.location} onChange={handleChange} inputProps={{ maxLength: 255 }} />
                    <TextField label="Description" name="description" required value={updatedEventData.description} onChange={handleChange} />
                    <TextField label="Category" name="category" required value={updatedEventData.category} onChange={handleChange} inputProps={{ maxLength: 50 }} />
                    <div style={{ margin: '10px 0' }}>
                        <Button variant="contained" component="label" sx={{ m: 1 }}>
                            Upload New Image
                            <input type="file" hidden accept="image/png,image/jpeg,image/gif" onChange={handleFileChange} />
                        </Button>
                        {imagePreview && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <img
                                    src={getImageUrl(imagePreview)}
                                    alt="Event Banner Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '1px solid #ccc',
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
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Button type="submit" variant="contained" onClick={handleUpdate} sx={{ padding: '10px 30px', marginRight: '10px', backgroundColor: '#4caf50' }}>
                        Update
                    </Button>
                    <Button type="button" variant="outlined" onClick={onCancelUpdate} sx={{ padding: '10px 30px' }}>
                        Cancel
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default UpdateEvent;
