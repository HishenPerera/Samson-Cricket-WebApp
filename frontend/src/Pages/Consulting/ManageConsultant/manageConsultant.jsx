import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

import '../ConsultantDashboard.css';
import './manageConsultant.css';
import 'react-toastify/dist/ReactToastify.css';

import ConsultantTable from './components/ConsultantTable';

const ManageConsultant = ({ onBack }) => {
    // State for consultants, loading and error handling
    const [consultants, setConsultants] = useState([]);
    const [isConsultantsLoading, setIsConsultantsLoading] = useState(true);
    const [consultantsError, setConsultantsError] = useState(null);
    
    // States
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newConsultant, setNewConsultant] = useState({
        firstName: "",
        lastName: "",
        email: "",
        type: "batting",
        availableTimes: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch consultants from API
    useEffect(() => {
        const fetchConsultants = async () => {
            setIsConsultantsLoading(true);
            try {
                const response = await axios.get('http://localhost:4000/api/consultants');
                
                const formattedConsultants = response.data.map(consultant => ({
                    id: consultant._id,
                    name: `${consultant.firstName} ${consultant.lastName}`,
                    type: consultant.type.charAt(0).toUpperCase() + consultant.type.slice(1),
                    availableTimes: consultant.availableTimes,
                    email: consultant.email
                }));
                
                setConsultants(formattedConsultants);
                setConsultantsError(null);
            } catch (err) {
                console.error("Error fetching consultants:", err);
                setConsultantsError("Failed to load consultants. Please try again later.");
                toast.error("Failed to load consultants");
            } finally {
                setIsConsultantsLoading(false);
            }
        };

        fetchConsultants();
    }, []);

    // Filter consultants by type
    const battingConsultants = consultants.filter(c => c.type.toLowerCase() === "batting");
    const bowlingConsultants = consultants.filter(c => c.type.toLowerCase() === "bowling");
    const fieldingConsultants = consultants.filter(c => c.type.toLowerCase() === "fielding");
    const physicalConsultants = consultants.filter(c => c.type.toLowerCase() === "physical");

    // Handle input changes for new consultant
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewConsultant({
            ...newConsultant,
            [name]: value
        });
    };

    // Handle edit button click
    const handleEditClick = (consultant) => {
        const nameParts = consultant.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        // Set form data with consultant details
        setNewConsultant({
            id: consultant.id,
            firstName: firstName,
            lastName: lastName,
            email: consultant.email,
            type: consultant.type.toLowerCase(),
            availableTimes: consultant.availableTimes
        });
        
        setIsEditMode(true);
        setShowModal(true);
    };
    
    // Updated handleSubmit to handle both add and edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            let response;
            let successMessage;
            
            if (isEditMode) {
                // Update existing consultant
                response = await axios.put(`http://localhost:4000/api/consultants/${newConsultant.id}`, {
                    firstName: newConsultant.firstName,
                    lastName: newConsultant.lastName,
                    email: newConsultant.email,
                    type: newConsultant.type,
                    availableTimes: newConsultant.availableTimes
                });
                
                // Update the local state
                const fullName = `${newConsultant.firstName} ${newConsultant.lastName}`;
                setConsultants(consultants.map(c => 
                    c.id === newConsultant.id 
                        ? {
                            ...c,
                            name: fullName,
                            type: newConsultant.type.charAt(0).toUpperCase() + newConsultant.type.slice(1),
                            availableTimes: newConsultant.availableTimes,
                            email: newConsultant.email
                          } 
                        : c
                ));
                
                successMessage = `Consultant ${fullName} updated successfully`;
            } else {
                // Add new consultant
                response = await axios.post('http://localhost:4000/api/consultants', newConsultant);
                
                // Add new consultant
                const createdConsultant = response.data;
                const fullName = `${createdConsultant.firstName} ${createdConsultant.lastName}`;
                
                setConsultants([
                    ...consultants,
                    {
                        id: createdConsultant._id,
                        name: fullName,
                        type: createdConsultant.type.charAt(0).toUpperCase() + createdConsultant.type.slice(1),
                        availableTimes: createdConsultant.availableTimes,
                        email: createdConsultant.email
                    }
                ]);
                
                successMessage = `Consultant ${fullName} added successfully`;
            }
            
            toast.success(successMessage);
            setShowModal(false);
            setIsEditMode(false);
            setNewConsultant({
                firstName: "",
                lastName: "",
                email: "",
                type: "batting",
                availableTimes: ""
            });
        } catch (err) {
            // Show error toast notification
            toast.error(err.response?.data?.message || `Failed to ${isEditMode ? "update" : "add"} consultant`);
            console.error(`Error ${isEditMode ? "updating" : "adding"} consultant:`, err);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete consultant
    const handleDeleteConsultant = async (consultantId, consultantName) => {
        try {
            await axios.delete(`http://localhost:4000/api/consultants/${consultantId}`);
            setConsultants(consultants.filter(c => c.id !== consultantId));
            toast.success(`Consultant ${consultantName} deleted successfully`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete consultant");
            console.error("Error deleting consultant:", err);
        }
    };

    // toast notifications
    const handleAddTimeSlot = () => {
        const day = document.getElementById('daySelect').value;
        const start = document.getElementById('startTime').value;
        const end = document.getElementById('endTime').value;
        
        if (!start || !end) {
            toast.warning("Please select both start and end times");
            return;
        }
        
        // Convert 24h format to 12h format for display
        const formatTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            return `${hour % 12 || 12}${minutes ? `:${minutes}` : ''} ${hour >= 12 ? 'PM' : 'AM'}`;
        };
        
        const newSchedule = `${day}: ${formatTime(start)}-${formatTime(end)}`;
        
        setNewConsultant({
            ...newConsultant, 
            availableTimes: newConsultant.availableTimes 
                ? `${newConsultant.availableTimes}, ${newSchedule}` 
                : newSchedule
        });
        
        toast.info(`Time slot "${newSchedule}" added`);
    };

    return (
        <div className="content-area" style={{width: "100%", height: "100%"}}>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <h1 className="manaTitle">Manage Consultants</h1>
            <button onClick={onBack} className="back-button" style={{marginTop:"-100px"}}>Back to Dashboard</button>
            
            <div className="add-consultant-container">
                <button 
                    onClick={() => {
                        setIsEditMode(false);
                        setNewConsultant({
                            firstName: "",
                            lastName: "",
                            email: "",
                            type: "batting",
                            availableTimes: ""
                        });
                        setShowModal(true);
                    }} 
                    className="add-consultant-btn"
                >
                    Add New Consultant
                </button>
            </div>
            
            {isConsultantsLoading ? (
                <div className="loading-message">Loading consultants...</div>
            ) : consultantsError ? (
                <div className="error-message">{consultantsError}</div>
            ) : (
                <div className="consultant-tables-wrapper">
                    <div className="consultant-tables">
                        {/* Batting Consultants */}
                        <h2>Batting Consultants</h2>
                        <ConsultantTable 
                            consultants={battingConsultants} 
                            onDelete={handleDeleteConsultant} 
                            onEdit={handleEditClick} 
                        />
                        
                        {/* Bowling Consultants */}
                        <h2>Bowling Consultants</h2>
                        <ConsultantTable 
                            consultants={bowlingConsultants} 
                            onDelete={handleDeleteConsultant} 
                            onEdit={handleEditClick}
                        />
                        
                        {/* Fielding Consultants */}
                        <h2>Fielding Consultants</h2>
                        <ConsultantTable 
                            consultants={fieldingConsultants} 
                            onDelete={handleDeleteConsultant} 
                            onEdit={handleEditClick}
                        />
                        
                        {/* Physical Consultants */}
                        <h2>Physical Consultants</h2>
                        <ConsultantTable 
                            consultants={physicalConsultants} 
                            onDelete={handleDeleteConsultant} 
                            onEdit={handleEditClick}
                        />
                        <div className="table-bottom-spacer"></div>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditMode ? "Edit Consultant" : "Add New Consultant"}</h2>
                            <button 
                                className="close-btn" 
                                onClick={() => setShowModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="consultant-form">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name:</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={newConsultant.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name:</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={newConsultant.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={newConsultant.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="type">Type:</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={newConsultant.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="batting">Batting</option>
                                    <option value="bowling">Bowling</option>
                                    <option value="fielding">Fielding</option>
                                    <option value="physical">Physical</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="availableTimes">Available Times:</label>
                                <div className="schedule-container">
                                    {/* Current schedules display */}
                                    {newConsultant.availableTimes && (
                                        <div className="selected-schedules">
                                            {newConsultant.availableTimes.split(',').map((schedule, index) => (
                                                <div key={index} className="schedule-item">
                                                    <span>{schedule.trim()}</span>
                                                    <button 
                                                        type="button"
                                                        className="remove-schedule"
                                                        onClick={() => {
                                                            const updatedTimes = newConsultant.availableTimes
                                                                .split(',')
                                                                .filter((_, i) => i !== index)
                                                                .join(',');
                                                            setNewConsultant({...newConsultant, availableTimes: updatedTimes});
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Schedule selector */}
                                    <div className="schedule-selector">
                                        <div className="day-selector">
                                            <label>Day:</label>
                                            <select id="daySelect" className="day-select">
                                                <option value="Mon">Monday</option>
                                                <option value="Tue">Tuesday</option>
                                                <option value="Wed">Wednesday</option>
                                                <option value="Thu">Thursday</option>
                                                <option value="Fri">Friday</option>
                                                <option value="Sat">Saturday</option>
                                                <option value="Sun">Sunday</option>
                                                <option value="Mon-Fri">Monday-Friday</option>
                                                <option value="Sat-Sun">Weekend</option>
                                            </select>
                                        </div>
                                        
                                        <div className="time-selector">
                                            <label>From:</label>
                                            <input type="time" id="startTime" className="time-input" />
                                            
                                            <label>To:</label>
                                            <input type="time" id="endTime" className="time-input" />
                                        </div>
                                        
                                        <button 
                                            type="button" 
                                            className="add-time-btn"
                                            onClick={handleAddTimeSlot}
                                        >
                                            Add Time Slot
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="submit-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading 
                                        ? (isEditMode ? "Updating..." : "Adding...") 
                                        : (isEditMode ? "Update Consultant" : "Add Consultant")
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageConsultant;