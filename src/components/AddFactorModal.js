// AddFactorModal.js
import React, { useState } from "react";
import "./AddFactorModal.css";
import axios from "axios";

const AddFactorModal = ({ onClose, onAddSuccess }) => {
  const [newFactor, setNewFactor] = useState({
    name: "",
    description: "",
    timeSeries: Array(25).fill(null),
  });

  const years = Array.from({ length: 25 }, (_, i) => 2000 + i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFactor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeSeriesChange = (index, value) => {
    setNewFactor((prev) => {
      const timeSeries = [...prev.timeSeries];
      timeSeries[index] = value;
      return { ...prev, timeSeries };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/factors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFactor),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Factor added successfully:", result);
        alert("Factor added successfully!");
        onAddSuccess();
        onClose();
      } else {
        console.error("Failed to add factor:", result.message);
        alert(result.message || "Failed to add factor.");
      }
    } catch (error) {
      console.error("Error adding factor:", error);
      alert("An error occurred while adding the factor.");
    }
  };

  return (
    <div className="model-overlay">
      <div className="model-content rounded-section">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Add New Factor</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newFactor.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={newFactor.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <h3>Time Series Data (2000-2024)</h3>
            <div className="time-series-grid">
              {years.map((year, index) => (
                <div key={year} className="year-input">
                  <label htmlFor={`year${year}`}>{year}:</label>
                  <input
                    id={`year${year}`}
                    type="number"
                    value={newFactor.timeSeries[index]}
                    onChange={(e) =>
                      handleTimeSeriesChange(index, e.target.value)
                    }
                    required
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Add Factor
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFactorModal;
