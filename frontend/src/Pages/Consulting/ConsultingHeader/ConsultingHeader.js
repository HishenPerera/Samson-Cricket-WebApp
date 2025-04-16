import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import logo1 from '../../../assets/images/logo1.png'; 
import './ConsultingHeader.css'; 
import Swal from 'sweetalert2';

const ConsultingHeader = () => {

    const [userName, setUserName] = useState("");
    
        useEffect(() => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUserName(payload.firstname || "User"); 
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
        }, []);
    
        const navigate = useNavigate();
    
        const handleLogout = () => {
            localStorage.removeItem('token');
            Swal.fire({
                title: 'Logout Successful!',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500, // Close after 1.5 seconds
            }).then(() => {
                navigate('/');
            });
        };

    return (
        <header className="header">
            <div className="header-left">
                <a href="/" className="header-content">
                    <img src={logo1} alt="Samson Cricket Logo" /> 
                    <h1 className="titlename">SAMSON CRICKET</h1>
                </a>
            </div>
            <a href="/consultantdashboard">
                <div className="consultantdashboard-title">Consultant Dashboard</div>
            </a>
            <div className="consultantdashboard-username">
                <h1 className="consultantdashboard-username">Welcome, {userName}</h1>
            </div>
            <div className="header-right">
                <button onClick={handleLogout} className="consultinglogout-btn">Logout</button>
            </div>
        </header>
    );
}

export default ConsultingHeader;