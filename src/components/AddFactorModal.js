import React, { useState } from "react";
import "./AddFactorModal.css";
import styled from "styled-components";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const apiUrl = process.env.REACT_APP_API_URI;

const CustomButton = styled.button`
  padding: 8px 15px;
  border: none;
  background-color: #975c5c;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    background-color: #574141;
  }
  &:active {
    background-color: #40224a;
    transform: scale(0.98);
  }
  &:focus {
    outline: none;
  }
`;

const AddFactorModal = ({ onClose, onAddSuccess }) => {
  const [newFactor, setNewFactor] = useState({
    name: "",
    description: "",
    timeSeries: Array(42).fill(null), // 1994–2035
    color: "#975c5c",
  });

  const [maxYear, setMaxYear] = useState(2035);
  const [activeTab, setActiveTab] = useState("table");
  const [graphType, setGraphType] = useState(null);

  const [showInputModal, setShowInputModal] = useState(false);
  const [singleValue, setSingleValue] = useState("");
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");

  const years = Array.from({ length: maxYear - 1994 + 1 }, (_, i) => 1994 + i);

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

  const handleDeleteYear = (index) => {
    if (years[index] > 2035) {
      setNewFactor((prev) => {
        const timeSeries = [...prev.timeSeries];
        timeSeries.splice(index, 1);
        return { ...prev, timeSeries };
      });
      setMaxYear((prev) => prev - 1);
    }
  };

  const handleGraphTypeChange = (type) => {
    setGraphType(type);
    setShowInputModal(true);
  };

  const handleInputSubmit = () => {
    const parseVal = (val) => parseFloat(val);
    if (graphType === "straight") {
      const value = parseVal(singleValue);
      if (!isNaN(value) && value >= 0 && value <= 1) {
        updateGraphValues(graphType, value, value);
        setShowInputModal(false);
      } else {
        alert("Enter a number between 0 and 1.");
      }
    } else {
      const start = parseVal(startValue);
      const end = parseVal(endValue);
      if (!isNaN(start) && !isNaN(end) && start >= 0 && end <= 1) {
        updateGraphValues(graphType, start, end);
        setShowInputModal(false);
      } else {
        alert("Enter valid numbers between 0 and 1.");
      }
    }
  };

  const updateGraphValues = (type, start, end) => {
    const updatedTimeSeries = newFactor.timeSeries.map((_, index) => {
      const x = index / (newFactor.timeSeries.length - 1);
      let value;
      switch (type) {
        case "straight":
          value = start;
          break;
        case "linear":
          value = start + (end - start) * x;
          break;
        case "exponential": {
          const k = 5;
          let factor =
            end > start
              ? (Math.exp(k * x) - 1) / (Math.exp(k) - 1)
              : 1 - Math.exp(-k * x) / (1 - Math.exp(-k));
          value = start + (end - start) * factor;
          break;
        }
        default:
          value = 0.5;
      }
      return parseFloat(value.toFixed(2));
    });

    setNewFactor((prev) => ({
      ...prev,
      timeSeries: updatedTimeSeries,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const values = newFactor.timeSeries.map((v) => parseFloat(v));

    // Compute mean and standard deviation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    // Compute standardized values
    const time_series_data = years.map((year, index) => ({
      year,
      value: values[index],
      normalized_value: std !== 0 ? (values[index] - mean) / std : 0,
    }));

    const payload = {
      name: newFactor.name,
      description: newFactor.description,
      color: newFactor.color,
      time_series_data,
    };

    try {
      const response = await fetch(`${apiUrl}/api/factors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Factor added successfully!");
        onAddSuccess();
        onClose();
      } else {
        alert(result.message || "Failed to add factor.");
      }
    } catch (error) {
      alert("An error occurred while adding the factor.");
      console.error(error);
    }
  };

  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Factor Values",
        data: newFactor.timeSeries,
        borderColor: newFactor.color,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: 0,
        max: 1,
      },
    },
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
              style={{ height: "60px" }}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <input
              type="color"
              id="color"
              name="color"
              value={newFactor.color}
              onChange={handleChange}
            />
          </div>
          <div className="tabs">
            <button
              type="button"
              className={activeTab === "table" ? "active" : ""}
              onClick={() => setActiveTab("table")}
            >
              Table Input
            </button>
            <button
              type="button"
              className={activeTab === "graph" ? "active" : ""}
              onClick={() => setActiveTab("graph")}
            >
              Graph Input
            </button>
          </div>
          {activeTab === "table" ? (
            <div className="form-group">
              <h3>Time Series Data (1994–{maxYear})</h3>
              <div className="time-series-grid">
                {years.map((year, index) => (
                  <div key={year} className="year-input">
                    <label htmlFor={`year${year}`}>{year}:</label>
                    <input
                      id={`year${year}`}
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={newFactor.timeSeries[index]}
                      onChange={(e) =>
                        handleTimeSeriesChange(index, e.target.value)
                      }
                      required
                    />
                    {year > 2035 && (
                      <button
                        type="button"
                        className="delete-year-btn"
                        onClick={() => handleDeleteYear(index)}
                      >
                        &#10005;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="form-group">
              <h3>Graph Input</h3>
              <div className="graph-options">
                <button
                  type="button"
                  onClick={() => handleGraphTypeChange("straight")}
                >
                  Straight Line
                </button>
                <button
                  type="button"
                  onClick={() => handleGraphTypeChange("linear")}
                >
                  Linear
                </button>
                <button
                  type="button"
                  onClick={() => handleGraphTypeChange("exponential")}
                >
                  Exponential
                </button>
              </div>
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
          <div className="form-actions">
            <CustomButton type="submit">Add Factor</CustomButton>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showInputModal && (
        <div className="small-modal-overlay">
          <div className="small-modal-content">
            <h3>
              {graphType === "straight"
                ? "Enter the value for the straight line (0 to 1):"
                : "Enter the start and end values (0 to 1):"}
            </h3>
            {graphType === "straight" ? (
              <input
                type="number"
                value={singleValue}
                onChange={(e) => setSingleValue(e.target.value)}
                min="0"
                max="1"
                step="0.01"
                placeholder="e.g., 0.5"
              />
            ) : (
              <div className="input-group">
                <input
                  type="number"
                  value={startValue}
                  onChange={(e) => setStartValue(e.target.value)}
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="Start (e.g., 0.2)"
                />
                <input
                  type="number"
                  value={endValue}
                  onChange={(e) => setEndValue(e.target.value)}
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="End (e.g., 0.8)"
                />
              </div>
            )}
            <div className="small-modal-actions">
              <button onClick={handleInputSubmit}>Submit</button>
              <button onClick={() => setShowInputModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFactorModal;
