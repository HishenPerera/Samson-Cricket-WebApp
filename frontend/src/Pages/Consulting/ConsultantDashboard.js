import React, { useState } from "react";
import ConsultingHeader from './ConsultingHeader/ConsultingHeader';
import './ConsultantDashboard.css';
import ManageConsultant from './ManageConsultant/manageConsultant';
import ManageConsultingSession from './ManageConsultingSession/manageConsultingSession';

const ConsultantDashboard = () => {
    const [activeComponent, setActiveComponent] = useState('dashboard');

    const renderComponent = () => {
        switch(activeComponent) {
            case 'manage-consultant':
                return <ManageConsultant onBack={() => setActiveComponent('dashboard')} />;
            case 'manage-consulting-session':
                return <ManageConsultingSession onBack={() => setActiveComponent('dashboard')} />;
            case 'manage-questions':
                return <div className="content-area"><h1>Q & A Section</h1><button onClick={() => setActiveComponent('dashboard')}>Back to Dashboard</button></div>;
            default:
                return (
                    <div className="dashboard-container">
                        <div className="con-card-link" onClick={() => setActiveComponent('manage-consultant')}>
                            <div className="con-card">
                              Manage Consultant
                            </div>
                        </div>
                        <div className="con-card-link" onClick={() => setActiveComponent('manage-consulting-session')}>
                            <div className="con-card">
                                Manage Consulting Sessions
                            </div>
                        </div>
                        <div className="con-card-link" onClick={() => setActiveComponent('manage-questions')}>
                            <div className="con-card">
                                Q & A
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className='container'>
            <ConsultingHeader/>
            {renderComponent()}
        </div>
    );
};

export default ConsultantDashboard;