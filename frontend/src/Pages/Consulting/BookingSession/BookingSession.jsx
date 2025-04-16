import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './BookingSession.css';

const BookingSession = ({ selectedType, consultants, filteredConsultants, loading, error }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        date: '',
        time: '',
        consultantId: '',
        duration: 90
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedConsultantAvailability, setSelectedConsultantAvailability] = useState([]);
    
    useEffect(() => {
        if (formData.consultantId) {
            const consultant = consultants.find(c => c._id === formData.consultantId);
            if (consultant) {
                const availabilityData = parseAvailabilityString(consultant.availableTimes);
                setSelectedConsultantAvailability(availabilityData);
                
                validateDateTime(formData.date, formData.time, availabilityData);
            }
        }
    }, [formData.consultantId, consultants]);
    
    const parseAvailabilityString = (availabilityStr) => {
        const availabilityArray = [];
        const dayMappings = {
            'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0
        };
        
        const slots = availabilityStr.split(',').map(s => s.trim());
        slots.forEach(slot => {
            const [dayPart, timePart] = slot.split(':').map(s => s.trim());
            const day = dayMappings[dayPart];
            
            if (day !== undefined && timePart) {
                const [timeRange] = timePart.split(',').map(t => t.trim());
                const [startTime, endTime] = timeRange.split('-').map(t => t.trim());
                
                availabilityArray.push({
                    dayOfWeek: day,
                    startTime: convertTo24Hour(startTime),
                    endTime: convertTo24Hour(endTime)
                });
            }
        });
        
        return availabilityArray;
    };
    
    // Convert 12-hour format to 24-hour
    const convertTo24Hour = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') {
            console.warn('Invalid time string:', timeStr);
            return '00:00'; // Return default value for invalid input
        }
        
        try {
            const [time, modifier] = timeStr.split(' ');
            
            if (!time || !modifier) {
                console.warn('Time string missing components:', timeStr);
                return '00:00';
            }
            
            let [hours, minutes] = time.split(':');
            
            if (hours === undefined || minutes === undefined) {
                console.warn('Invalid time format:', timeStr);
                return '00:00';
            }
            
            hours = parseInt(hours, 10);
            minutes = parseInt(minutes, 10);
            
            if (isNaN(hours) || isNaN(minutes)) {
                console.warn('Invalid time values:', timeStr);
                return '00:00';
            }
            
            if (hours === 12) {
                hours = modifier.toUpperCase() === 'PM' ? 12 : 0;
            } else if (modifier.toUpperCase() === 'PM') {
                hours += 12;
            }
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Error converting time:', error, timeStr);
            return '00:00';
        }
    };
    
    // Validate date and time against consultant availability
    const validateDateTime = (date, time, availabilityData = selectedConsultantAvailability) => {
        const errors = {};
        
        if (!date) return errors;
        
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errors.date = "You cannot book a session in the past";
        } else if (time) {
            // Only check time availability if date is valid and time is provided
            const dayOfWeek = selectedDate.getDay();
            
            // Get all slots for this day of week
            const availableSlots = availabilityData.filter(slot => slot.dayOfWeek === dayOfWeek);
            
            // Check if the time is available in any of the slots
            const isTimeAvailable = availableSlots.some(slot => {
                return time >= slot.startTime && time <= slot.endTime;
            });
            
            // Only show time error if there are available slots but time is outside them
            if (!isTimeAvailable && availableSlots.length > 0) {
                errors.time = "Consultant is not available at this time";
            }
        }
        
        // Set all errors at once
        setValidationErrors(prev => ({ ...prev, ...errors }));
        return errors;
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Validate date and time when they change
        if (name === 'date' || name === 'time') {
            const dateValue = name === 'date' ? value : formData.date;
            const timeValue = name === 'time' ? value : formData.time;
            validateDateTime(dateValue, timeValue);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Get the user ID from localStorage
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
            toast.error("You must be logged in to book a session. Please sign in first.");
            return;
        }
        
        // Find the selected consultant's name for the message
        const selectedConsultant = consultants.find(c => c._id === formData.consultantId);
        if (!selectedConsultant) {
            toast.error("Please select a consultant");
            return;
        }
        
        // Validate date and time before submission
        const errors = validateDateTime(formData.date, formData.time);
        if (Object.keys(errors).length > 0) {
            toast.error("Please fix the errors before submitting");
            return;
        }
        
        const consultantName = `${selectedConsultant.firstName} ${selectedConsultant.lastName}`;
        
        // Prepare booking data according to API requirements
        const bookingData = {
            userId: userId,
            userEmail: formData.email,
            userContact: formData.contact,
            sessionDate: new Date(formData.date).toISOString(),
            sessionTime: formData.time,
            sessionDuration: formData.duration
        };
        
        try {
            // Send booking request to the API
            const response = await axios.post(
                `http://localhost:4000/api/consultants/${formData.consultantId}/book-session`,
                bookingData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            
            toast.success(`Booking for ${selectedType} Consulting with ${consultantName} was submitted successfully!`);
            
            // Reset form after successful submission
            setFormData({
                name: '',
                email: '',
                contact: '',
                date: '',
                time: '',
                consultantId: '',
                duration: 90
            });
        } catch (error) {
            console.error('Error booking session:', error);
            toast.error(`Booking failed: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="booking-section">
            <h2>Book a {selectedType} Consulting Session</h2>
            
            {loading && <p className="loading-message">Loading consultants...</p>}
            {error && <p className="error-message">Error: {error}</p>}
            
            <form onSubmit={handleSubmit} className="consulting-form">
                {/* Consultant selection dropdown */}
                <div className="form-group">
                    <label htmlFor="consultantId">Select Consultant:</label>
                    <select
                        id="consultantId"
                        name="consultantId"
                        value={formData.consultantId}
                        onChange={handleChange}
                        required
                        className="consultant-select"
                    >
                        <option value="">-- Choose a consultant --</option>
                        {filteredConsultants.map(consultant => (
                            <option key={consultant._id} value={consultant._id}>
                                {`${consultant.firstName} ${consultant.lastName} - ${consultant.availableTimes}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contact">Contact Number:</label>
                    <input 
                        type="text" 
                        id="contact" 
                        name="contact" 
                        value={formData.contact} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Select Date:</label>
                    <input 
                        type="date" 
                        id="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]} 
                        className={validationErrors.date ? "input-error" : ""}
                        required 
                    />
                    {validationErrors.date && <p className="error-message">{validationErrors.date}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="time">Select Time:</label>
                    <input 
                        type="time" 
                        id="time" 
                        name="time" 
                        value={formData.time} 
                        onChange={handleChange}
                        className={validationErrors.time ? "input-error" : ""}
                        required 
                    />
                    {validationErrors.time && <p className="error-message">{validationErrors.time}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="duration">Session Duration (minutes):</label>
                    <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        className="consultant-select"
                    >
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                    </select>
                </div>

                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>
    );
};

export default BookingSession;