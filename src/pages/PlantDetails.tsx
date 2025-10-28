"use client";

import React, { useState, useEffect } from 'react';
import { withApi } from '@/lib/api';

const PlantDetails = ({ selectedPlant, onBackClick, onUpdate }) => {
    // State to hold the editable plant data
    const [editedPlant, setEditedPlant] = useState(selectedPlant);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Sync the internal state with the prop when selectedPlant changes
    useEffect(() => {
        setEditedPlant(selectedPlant);
        setIsEditing(false); // Reset editing mode on new plant selection
        setSuccess(null);
        setError(null);
    }, [selectedPlant]);

    if (!selectedPlant) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedPlant(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Add a new function to handle logger changes
    const handleLoggerChange = (index, value) => {
        const updatedLoggers = [...editedPlant.loggers];
        updatedLoggers[index] = value;
        setEditedPlant(prev => ({
            ...prev,
            loggers: updatedLoggers
        }));
    };

    const handleAddLogger = () => {
        setEditedPlant(prev => ({
            ...prev,
            loggers: [...prev.loggers, ''] // Add a new empty logger field
        }));
    };

    const handleRemoveLogger = (index) => {
        const updatedLoggers = editedPlant.loggers.filter((_, i) => i !== index);
        setEditedPlant(prev => ({
            ...prev,
            loggers: updatedLoggers
        }));
    };


    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await fetch(withApi(`/plants?plantId=${selectedPlant.plantId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editedPlant)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setSuccess('Plant updated successfully!');
                setIsEditing(false); // Exit editing mode
                onUpdate(); // Trigger parent component to refetch data
            } else {
                throw new Error(result.message || 'Failed to update plant.');
            }
        } catch (e) {
            console.error("Error updating plant:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={onBackClick} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                    &larr; Back to Plants
                </button>
                {isEditing ? (
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleSave} 
                            disabled={loading}
                            className={`px-4 py-2 rounded-md transition-colors duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                            onClick={() => setIsEditing(false)} 
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleEditClick} 
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                    >
                        Edit Plant
                    </button>
                )}
            </div>
            
            {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}
            {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <h2 className="text-2xl font-bold mb-4">{selectedPlant.plantName} Details</h2>
            <div className="space-y-4">
                {/* Editable Fields */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Plant Name:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="plantName"
                            value={editedPlant.plantName || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.plantName}</p>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Project Type:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="projectType"
                            value={editedPlant.projectType || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.projectType}</p>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">DC Capacity:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="dcCapacity"
                            value={editedPlant.dcCapacity || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.dcCapacity}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Modules:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="modules"
                            value={editedPlant.modules || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.modules}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">AC Capacity:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="acCapacity"
                            value={editedPlant.acCapacity || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.acCapacity}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Inverters:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="inverters"
                            value={editedPlant.inverters || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.inverters}</p>
                    )}
                </div>

                {/* Loggers */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Loggers:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        {Array.isArray(editedPlant.loggers) && editedPlant.loggers.map((loggerId, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                                {isEditing ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={loggerId}
                                            onChange={(e) => handleLoggerChange(index, e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                        <button 
                                            onClick={() => handleRemoveLogger(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <p>{loggerId}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    {isEditing && (
                        <button 
                            onClick={handleAddLogger}
                            className="mt-2 w-max px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Add Logger
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Start Time:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="plantStartTime"
                            value={editedPlant.plantStartTime || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.plantStartTime}</p>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">End Time:</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            name="plantEndTime"
                            value={editedPlant.plantEndTime || ''}
                            onChange={handleChange}
                            className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="p-2 border border-transparent rounded-md">{selectedPlant.plantEndTime}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlantDetails;