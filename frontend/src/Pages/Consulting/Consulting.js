import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainHeader from '../../Common/mainHeader';
import MainFooter from "../../Common/mainFooter";
import './Consulting.css';
import BookingSession from './BookingSession/BookingSession';

const Consulting = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        date: '',
        time: '',
        consultantId: '',
        duration: 90 
    });

    useEffect(() => {
        const fetchConsultants = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:4000/api/consultants');
                setConsultants(response.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                console.error('Error fetching consultants:', err);
                toast.error(`Failed to load consultants: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchConsultants();
    }, []);

    // Filter consultants based on selected type
    const filteredConsultants = consultants.filter(
        consultant => selectedType && consultant.type.toLowerCase() === selectedType.toLowerCase()
    );

    const handleSelectType = (type) => {
        setSelectedType(type);
        setFormData({
            ...formData,
            consultantId: ''
        });
        setTimeout(() => {
            document.getElementById('consulting-content').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Content for each consulting type
    const consultingContent = {
        Batting: {
            title: "Batting Consulting",
            description: "Our batting consultation service is designed to help players improve their technique, footwork, and shot selection. Whether you're a beginner or an advanced player, our expert coaches will provide personalized guidance to enhance your game."
        },
        Bowling: {
            title: "Bowling Consulting",
            description: "Bowling Consulting helps players refine their bowling techniques with expert guidance. Our coaches provide personalized feedback to improve speed, accuracy, and strategy. Book a session to elevate your bowling performance today!"
        },
        Fielding: {
            title: "Fielding Consulting",
            description: "Fielding consulting enhances players' agility, catching, and throwing techniques. Our experts provide personalized drills to improve reflexes and positioning. Book a session to sharpen your defensive skills on the field."
        },
        Physical: {
            title: "Physical Consulting",
            description: "Physical consulting focuses on fitness, strength, and conditioning tailored for cricket performance. Our experts provide personalized training plans to enhance endurance, agility, and injury prevention. Optimize your physical capabilities to excel on the field."
        }
    };

    return (
        <div className="consulting-management">
            <MainHeader />
            <h1 className="consulting-title">Consulting</h1>

            <div className="consulting-description">
                <p>
                    Consulting Management in a website allows users to book specialized coaching sessions 
                    in four categories: Bowling, Batting, Physical, and Fielding. Users can 
                    schedule appointments with expert consultants to improve their cricket skills and 
                    overall performance. The system provides an easy-to-use interface for booking, managing, 
                    and canceling consultations. Coaches can oversee scheduled sessions, track progress, 
                    and communicate with players. This platform ensures a seamless experience for both 
                    players and consultants, enhancing training efficiency.
                </p>
            </div>

            <h2 className="consulting-subtitle">Select a Consulting Type</h2>

            <div className="consulting-dashboard">
                <a className="consulting-card-link" onClick={() => handleSelectType('Batting')}>
                    <div className={`consulting-card ${selectedType === 'Batting' ? 'selected' : ''}`}>Batting Consulting</div>
                </a>
                <a className="consulting-card-link" onClick={() => handleSelectType('Bowling')}>
                    <div className={`consulting-card ${selectedType === 'Bowling' ? 'selected' : ''}`}>Bowling Consulting</div>
                </a>
                <a className="consulting-card-link" onClick={() => handleSelectType('Fielding')}>
                    <div className={`consulting-card ${selectedType === 'Fielding' ? 'selected' : ''}`}>Fielding Consulting</div>
                </a>
                <a className="consulting-card-link" onClick={() => handleSelectType('Physical')}>
                    <div className={`consulting-card ${selectedType === 'Physical' ? 'selected' : ''}`}>Physical Consulting</div>
                </a>
            </div>

            {/* Content displayed only when a consulting type is selected */}
            {selectedType && (
                <div id="consulting-content" className="selected-content">
                    <div className="consulting-details">
                        <div className="consulting-info">
                            <h3>{consultingContent[selectedType].title}</h3>
                            <p>{consultingContent[selectedType].description}</p>
                        </div>
                    </div>

                    <BookingSession 
                        selectedType={selectedType}
                        consultants={consultants}
                        filteredConsultants={filteredConsultants}
                        loading={loading}
                        error={error}
                    />
                </div>
            )}
            
            {/* Toast container for notifications */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
         <MainFooter/>
        </div>
    );
};

export default Consulting;
