import React from 'react';

// ConsultantTable component with consistent column widths
const ConsultantTable = ({ consultants, onDelete, onEdit }) => {
    return (
        <div className="table-container">
            <div className="table-responsive">
                <table className="consultant-table">
                    <thead>
                        <tr>
                            <th className="col-name">Name</th>
                            <th className="col-email">Email</th>
                            <th className="col-times">Available Times</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consultants.length > 0 ? (
                            consultants.map(consultant => (
                                <tr key={consultant.id}>
                                    <td data-label="Name" className="col-name">{consultant.name}</td>
                                    <td data-label="Email" className="col-email">{consultant.email}</td>
                                    <td data-label="Available Times" className="col-times">{consultant.availableTimes}</td>
                                    <td data-label="Actions" className="col-actions">
                                        <div className="action-buttons">
                                            <button 
                                                className="action-btn edit-btn"
                                                onClick={() => onEdit(consultant)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="action-btn delete-btn" 
                                                onClick={() => onDelete(consultant.id, consultant.name)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">No consultants available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConsultantTable;