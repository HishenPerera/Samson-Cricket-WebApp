import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../ConsultantDashboard.css';
import './manageConsultingSession.css';

const ManageConsultingSession = ({ onBack }) => {
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [activeConsultant, setActiveConsultant] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetchConsultants();
    }, []);

    const fetchConsultants = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/api/consultants', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            setConsultants(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching consultants:", err);
            setError("Failed to load consultants data. Please try again.");
            toast.error("Error loading consultants: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (sessionId) => {
        try {
            await axios.patch(
                `http://localhost:4000/api/consultants/sessions/${sessionId}/accept`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            toast.success("Session confirmed successfully");
            fetchConsultants();
        } catch (err) {
            console.error("Error confirming session:", err);
            toast.error("Failed to confirm session: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCancel = async (sessionId) => {
        try {
            await axios.patch(
                `http://localhost:4000/api/consultants/sessions/${sessionId}/reject`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            toast.success("Session cancelled successfully");
            fetchConsultants();
        } catch (err) {
            console.error("Error cancelling session:", err);
            toast.error("Failed to cancel session: " + (err.response?.data?.message || err.message));
        }
    };

    const handleComplete = async (sessionId) => {
        setCurrentSession(sessionId);
        setShowModal(true);
    };

    const confirmComplete = async () => {
        try {
            await axios.patch(
                `http://localhost:4000/api/consultants/sessions/${currentSession}/complete`,
                { notes },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            toast.success("Session marked as completed");
            setShowModal(false);
            setNotes("");
            fetchConsultants();
        } catch (err) {
            console.error("Error completing session:", err);
            toast.error("Failed to complete session: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (sessionId) => {
        if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
            try {
                await axios.delete(
                    `http://localhost:4000/api/consultants/sessions/${sessionId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                toast.success("Session deleted successfully");
                fetchConsultants();
            } catch (err) {
                console.error("Error deleting session:", err);
                toast.error("Failed to delete session: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const toggleConsultant = (consultantId) => {
        if (activeConsultant === consultantId) {
            setActiveConsultant(null);
        } else {
            setActiveConsultant(consultantId);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (timeString) => {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const getFilteredSessions = (consultant) => {
        if (!consultant.sessions || consultant.sessions.length === 0) {
            return [];
        }
        
        return filter === "all" 
            ? consultant.sessions
            : consultant.sessions.filter(session => session.status === filter);
    };
    const getStatusLabel = (status) => {
        switch(status) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'cancelled': return 'Cancelled';
            case 'completed': return 'Completed';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };
    const totalFilteredSessions = consultants.reduce((total, consultant) => {
        const filteredSessions = getFilteredSessions(consultant);
        return total + filteredSessions.length;
    }, 0);

    return (
        <div className="content-area">
            <h1>Manage Consulting Sessions</h1>
            
            <div className="filter-controls">
                <label htmlFor="status-filter">Filter by status:</label>
                <select 
                    id="status-filter" 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="status-filter"
                >
                    <option value="all">All Sessions</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
                <button onClick={fetchConsultants} className="refresh-button">
                    Refresh
                </button>
            </div>
            <div className="scrollable-content">

            {loading ? (
                <div className="loading-indicator">Loading consultants and sessions...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : consultants.length === 0 ? (
                <div className="no-consultants">No consultants found.</div>
            ) : totalFilteredSessions === 0 ? (
                <div className="no-sessions">
                    No {filter !== "all" ? filter : ""} sessions found for any consultant.
                </div>
            ) : (
                
                    <div className="consultants-container">
                    {consultants.map(consultant => {
                        const filteredSessions = getFilteredSessions(consultant);
                        if (filteredSessions.length === 0) {
                            return null;
                        }
                        
                        return (
                            <div key={consultant._id} className="consultant-card">
                                <div 
                                    className="consultant-header"
                                    onClick={() => toggleConsultant(consultant._id)}
                                >
                                    <div className="consultant-info">
                                        <h2>{consultant.firstName} {consultant.lastName}</h2>
                                        <p>
                                            <span className="consultant-type">{consultant.type}</span> | 
                                            <span className="consultant-email">{consultant.email}</span>
                                        </p>
                                        <p className="available-times">
                                            <strong>Available:</strong> {consultant.availableTimes}
                                        </p>
                                    </div>
                                    <div className="session-count">
                                        {filteredSessions.length} {filter !== "all" ? filter : ""} session(s)
                                        <span className={`arrow ${activeConsultant === consultant._id ? 'up' : 'down'}`}>
                                            &#9650;
                                        </span>
                                    </div>
                                </div>
                                
                                {activeConsultant === consultant._id && (
                                    <div className="sessions-container">
                                        {filteredSessions.map((session) => (
                                            <div 
                                                key={session._id} 
                                                className={`session-card status-${session.status}`}
                                            >
                                                <div className="session-header">
                                                    <span className={`status-badge ${session.status}`}>
                                                        {getStatusLabel(session.status)}
                                                    </span>
                                                    <h3>Session with {session.userEmail}</h3>
                                                </div>
                                                
                                                <div className="session-details">
                                                    
                                                
                                                    <p><strong>Contact:</strong> {session.userContact}</p>
                                                    <p><strong>Date:</strong> {formatDate(session.sessionDate)}</p>
                                                    <p><strong>Time:</strong> {formatTime(session.sessionTime)}</p>
                                                    <p><strong>Duration:</strong> {session.sessionDuration} minutes</p>
                                                </div>
                                                
                                                <div className="session-actions">
                                                    {session.status === "pending" && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleConfirm(session._id)}
                                                                className="action-button confirm"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button 
                                                                onClick={() => handleCancel(session._id)}
                                                                className="action-button cancel"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    {session.status === "confirmed" && (
                                                        <button 
                                                            onClick={() => handleComplete(session._id)}
                                                            className="action-button complete"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => handleDelete(session._id)}
                                                        className="action-button delete"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                
            )}
            
            
            <button onClick={onBack} className="back-button">
                Back to Dashboard
            </button>
            </div>
            
            {/* Completion Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Complete Session</h2>
                        <p>Add any notes about this session:</p>
                        
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Session notes (optional)"
                            rows={5}
                            className="session-notes"
                        />
                        
                        <div className="modal-actions">
                            <button 
                                onClick={() => {
                                    setShowModal(false);
                                    setNotes("");
                                }}
                                className="modal-button cancel"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmComplete}
                                className="modal-button confirm"
                            >
                                Complete Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ToastContainer position="top-right" />
        </div>
    );
};

export default ManageConsultingSession;