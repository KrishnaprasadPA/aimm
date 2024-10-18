import React, { useState } from 'react';

const AddFactorModel = ({ onClose, onAddFactor }) => {
  const [newFactor, setNewFactor] = useState({
    name: '',
    description: '',
    timeSeries: new Array(25).fill(null)
  });

  const years = Array.from({length: 25}, (_, i) => 2000 + i);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFactor(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSeriesChange = (index, value) => {
    const updatedTimeSeries = [...newFactor.timeSeries];
    updatedTimeSeries[index] = value;
    setNewFactor(prev => ({ ...prev, timeSeries: updatedTimeSeries }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddFactor(newFactor);
    onClose();
  };

  return (
    <div className="model-overlay">
      <div className="model-content rounded-section">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Add New Factor</h2>
        <form onSubmit={handleSubmit}>
          {/* Implement form fields here */}
        </form>
      </div>
    </div>
  );
};

export default AddFactorModel;