// // // // import React, { useState } from "react";
// // // // import "./AddFactorModal.css";
// // // // import axios from "axios";
// // // // import styled from "styled-components";
// // // // import { Line } from "react-chartjs-2";
// // // // import {
// // // //   Chart as ChartJS,
// // // //   CategoryScale,
// // // //   LinearScale,
// // // //   PointElement,
// // // //   LineElement,
// // // //   Title,
// // // //   Tooltip,
// // // //   Legend,
// // // // } from "chart.js";

// // // // // Register Chart.js components
// // // // ChartJS.register(
// // // //   CategoryScale,
// // // //   LinearScale,
// // // //   PointElement,
// // // //   LineElement,
// // // //   Title,
// // // //   Tooltip,
// // // //   Legend
// // // // );

// // // // const apiUrl = process.env.REACT_APP_API_URI;

// // // // const CustomButton = styled.button`
// // // //   padding: 8px 15px;
// // // //   border: none;
// // // //   background-color: #975c5c;
// // // //   color: #fff;
// // // //   border-radius: 5px;
// // // //   cursor: pointer;
// // // //   margin-left: 5px;
// // // //   &:hover {
// // // //     background-color: #574141;
// // // //   }
// // // //   &:active {
// // // //     background-color: #40224a;
// // // //     transform: scale(0.98);
// // // //   }
// // // //   &:focus {
// // // //     outline: none;
// // // //   }
// // // // `;

// // // // const AddFactorModal = ({ onClose, onAddSuccess }) => {
// // // //   const [newFactor, setNewFactor] = useState({
// // // //     name: "",
// // // //     description: "",
// // // //     timeSeries: Array(43).fill(null), // Initial 43 years (1993-2035)
// // // //     color: "#975c5c", // Default color
// // // //   });

// // // //   const [maxYear, setMaxYear] = useState(2035); // Track the current maximum year
// // // //   const [activeTab, setActiveTab] = useState("table"); // Tabs: 'table' or 'graph'
// // // //   const [graphType, setGraphType] = useState("straight"); // Graph type: 'straight', 'linear', 'exponential'

// // // //   const years = Array.from({ length: maxYear - 1993 + 1 }, (_, i) => 1993 + i);

// // // //   const handleChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     setNewFactor((prev) => ({
// // // //       ...prev,
// // // //       [name]: value,
// // // //     }));
// // // //   };

// // // //   const handleTimeSeriesChange = (index, value) => {
// // // //     setNewFactor((prev) => {
// // // //       const timeSeries = [...prev.timeSeries];
// // // //       timeSeries[index] = value;
// // // //       return { ...prev, timeSeries };
// // // //     });
// // // //   };

// // // //   const handleAddYear = () => {
// // // //     const newYear = maxYear + 1; // Increment the year
// // // //     let newValue;

// // // //     // Calculate the new value based on the graph type
// // // //     switch (graphType) {
// // // //       case "straight":
// // // //         newValue = 0.5; // Straight line at 0.5
// // // //         break;
// // // //       case "linear-increase":
// // // //         newValue = newFactor.timeSeries.length / newFactor.timeSeries.length; // Linear increase
// // // //         break;
// // // //       case "linear-decrease":
// // // //         newValue =
// // // //           1 - newFactor.timeSeries.length / newFactor.timeSeries.length; // Linear decrease
// // // //         break;
// // // //       case "exponential-increase":
// // // //         newValue = Math.pow(
// // // //           newFactor.timeSeries.length / newFactor.timeSeries.length,
// // // //           2
// // // //         ); // Exponential increase
// // // //         break;
// // // //       case "exponential-decrease":
// // // //         newValue = Math.pow(
// // // //           1 - newFactor.timeSeries.length / newFactor.timeSeries.length,
// // // //           2
// // // //         ); // Exponential decrease
// // // //         break;
// // // //       default:
// // // //         newValue = 0.5; // Default to straight line
// // // //     }

// // // //     // Update the state
// // // //     setMaxYear(newYear);
// // // //     setNewFactor((prev) => ({
// // // //       ...prev,
// // // //       timeSeries: [...prev.timeSeries, newValue], // Add the new value
// // // //     }));
// // // //   };

// // // //   const handleDeleteYear = (index) => {
// // // //     if (years[index] > 2035) {
// // // //       setNewFactor((prev) => {
// // // //         const timeSeries = [...prev.timeSeries];
// // // //         timeSeries.splice(index, 1);
// // // //         return { ...prev, timeSeries };
// // // //       });
// // // //       setMaxYear((prev) => prev - 1);
// // // //     }
// // // //   };

// // // //   const handleGraphTypeChange = (type) => {
// // // //     setGraphType(type);
// // // //     updateGraphValues(type);
// // // //   };

// // // //   const updateGraphValues = (type) => {
// // // //     const updatedTimeSeries = newFactor.timeSeries.map((_, index) => {
// // // //       const x = index; // Year index
// // // //       let value;
// // // //       switch (type) {
// // // //         case "straight":
// // // //           value = 0.5; // Straight line at 0.5
// // // //           break;
// // // //         case "linear-increase":
// // // //           value = x / (newFactor.timeSeries.length - 1); // Linear increase from 0 to 1
// // // //           break;
// // // //         case "linear-decrease":
// // // //           value = 1 - x / (newFactor.timeSeries.length - 1); // Linear decrease from 1 to 0
// // // //           break;
// // // //         case "exponential-increase":
// // // //           value = Math.pow(x / (newFactor.timeSeries.length - 1), 2); // Exponential increase
// // // //           break;
// // // //         case "exponential-decrease":
// // // //           value = Math.pow(1 - x / (newFactor.timeSeries.length - 1), 2); // Exponential decrease
// // // //           break;
// // // //         default:
// // // //           value = 0.5;
// // // //       }
// // // //       // Round to 2 decimal places
// // // //       return parseFloat(value.toFixed(2));
// // // //     });
// // // //     setNewFactor((prev) => ({
// // // //       ...prev,
// // // //       timeSeries: updatedTimeSeries,
// // // //     }));
// // // //   };

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();

// // // //     try {
// // // //       const response = await fetch(`${apiUrl}/api/factors`, {
// // // //         method: "POST",
// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //         },
// // // //         body: JSON.stringify(newFactor),
// // // //       });

// // // //       const result = await response.json();

// // // //       if (response.ok) {
// // // //         console.log("Factor added successfully:", result);
// // // //         alert("Factor added successfully!");
// // // //         onAddSuccess();
// // // //         onClose();
// // // //       } else {
// // // //         console.error("Failed to add factor:", result.message);
// // // //         alert(result.message || "Failed to add factor.");
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Error adding factor:", error);
// // // //       alert("An error occurred while adding the factor.");
// // // //     }
// // // //   };

// // // //   const chartData = {
// // // //     labels: years,
// // // //     datasets: [
// // // //       {
// // // //         label: "Factor Values",
// // // //         data: newFactor.timeSeries,
// // // //         borderColor: newFactor.color,
// // // //         fill: false,
// // // //       },
// // // //     ],
// // // //   };

// // // //   const chartOptions = {
// // // //     scales: {
// // // //       y: {
// // // //         min: 0,
// // // //         max: 1,
// // // //       },
// // // //     },
// // // //   };

// // // //   return (
// // // //     <div className="model-overlay">
// // // //       <div className="model-content rounded-section">
// // // //         <button className="close-btn" onClick={onClose}>
// // // //           &times;
// // // //         </button>
// // // //         <h2>Add New Factor</h2>
// // // //         <form onSubmit={handleSubmit}>
// // // //           <div className="form-group">
// // // //             <label htmlFor="name">Name:</label>
// // // //             <input
// // // //               type="text"
// // // //               id="name"
// // // //               name="name"
// // // //               value={newFactor.name}
// // // //               onChange={handleChange}
// // // //               required
// // // //             />
// // // //           </div>
// // // //           <div className="form-group">
// // // //             <label htmlFor="description">Description:</label>
// // // //             <textarea
// // // //               id="description"
// // // //               name="description"
// // // //               value={newFactor.description}
// // // //               onChange={handleChange}
// // // //               style={{ height: "60px" }} // Set a fixed height
// // // //               required
// // // //             ></textarea>
// // // //           </div>
// // // //           <div className="form-group">
// // // //             <label htmlFor="color">Color:</label>
// // // //             <input
// // // //               type="color"
// // // //               id="color"
// // // //               name="color"
// // // //               value={newFactor.color}
// // // //               onChange={handleChange}
// // // //             />
// // // //           </div>
// // // //           <div className="tabs">
// // // //             <button
// // // //               type="button"
// // // //               className={activeTab === "table" ? "active" : ""}
// // // //               onClick={() => setActiveTab("table")}
// // // //             >
// // // //               Table Input
// // // //             </button>
// // // //             <button
// // // //               type="button"
// // // //               className={activeTab === "graph" ? "active" : ""}
// // // //               onClick={() => setActiveTab("graph")}
// // // //             >
// // // //               Graph Input
// // // //             </button>
// // // //           </div>
// // // //           {activeTab === "table" ? (
// // // //             <div className="form-group">
// // // //               <h3>Time Series Data (2000-{maxYear})</h3>
// // // //               <div className="time-series-grid">
// // // //                 {years.map((year, index) => (
// // // //                   <div key={year} className="year-input">
// // // //                     <label htmlFor={`year${year}`}>{year}:</label>
// // // //                     <input
// // // //                       id={`year${year}`}
// // // //                       type="number"
// // // //                       value={newFactor.timeSeries[index]}
// // // //                       onChange={(e) =>
// // // //                         handleTimeSeriesChange(index, e.target.value)
// // // //                       }
// // // //                       required
// // // //                     />
// // // //                     {year > 2035 && (
// // // //                       <button
// // // //                         type="button"
// // // //                         className="delete-year-btn"
// // // //                         onClick={() => handleDeleteYear(index)}
// // // //                       >
// // // //                         &#10005;
// // // //                       </button>
// // // //                     )}
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
// // // //             </div>
// // // //           ) : (
// // // //             <div className="form-group">
// // // //               <h3>Graph Input</h3>
// // // //               <div className="graph-options">
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={() => handleGraphTypeChange("straight")}
// // // //                 >
// // // //                   Straight Line
// // // //                 </button>
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={() => handleGraphTypeChange("linear-increase")}
// // // //                 >
// // // //                   Linear Increase
// // // //                 </button>
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={() => handleGraphTypeChange("linear-decrease")}
// // // //                 >
// // // //                   Linear Decrease
// // // //                 </button>
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={() => handleGraphTypeChange("exponential-increase")}
// // // //                 >
// // // //                   Exponential Increase
// // // //                 </button>
// // // //                 <button
// // // //                   type="button"
// // // //                   onClick={() => handleGraphTypeChange("exponential-decrease")}
// // // //                 >
// // // //                   Exponential Decrease
// // // //                 </button>
// // // //               </div>
// // // //               <div className="chart-container">
// // // //                 <Line data={chartData} options={chartOptions} />
// // // //               </div>
// // // //             </div>
// // // //           )}
// // // //           <div className="form-actions">
// // // //             <CustomButton
// // // //               type="button"
// // // //               onClick={handleAddYear}
// // // //               className="btn-time"
// // // //             >
// // // //               Add Year
// // // //             </CustomButton>
// // // //             <button
// // // //               type="submit"
// // // //               className="btn-primary"
// // // //               style={{ marginLeft: "10px" }}
// // // //             >
// // // //               Add Factor
// // // //             </button>
// // // //             <button type="button" onClick={onClose} className="btn-secondary">
// // // //               Cancel
// // // //             </button>
// // // //           </div>
// // // //         </form>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AddFactorModal;

// // // import React, { useState, useEffect } from "react";
// // // import "./AddFactorModal.css";
// // // import styled from "styled-components";
// // // import { Line } from "react-chartjs-2";
// // // import {
// // //   Chart as ChartJS,
// // //   CategoryScale,
// // //   LinearScale,
// // //   PointElement,
// // //   LineElement,
// // //   Title,
// // //   Tooltip,
// // //   Legend,
// // // } from "chart.js";

// // // // Register Chart.js components
// // // ChartJS.register(
// // //   CategoryScale,
// // //   LinearScale,
// // //   PointElement,
// // //   LineElement,
// // //   Title,
// // //   Tooltip,
// // //   Legend
// // // );

// // // const apiUrl = process.env.REACT_APP_API_URI;

// // // const CustomButton = styled.button`
// // //   padding: 8px 15px;
// // //   border: none;
// // //   background-color: #975c5c;
// // //   color: #fff;
// // //   border-radius: 5px;
// // //   cursor: pointer;
// // //   margin-left: 5px;
// // //   &:hover {
// // //     background-color: #574141;
// // //   }
// // //   &:active {
// // //     background-color: #40224a;
// // //     transform: scale(0.98);
// // //   }
// // //   &:focus {
// // //     outline: none;
// // //   }
// // // `;

// // // const AddFactorModal = ({ onClose, onAddSuccess }) => {
// // //   const [newFactor, setNewFactor] = useState({
// // //     name: "",
// // //     description: "",
// // //     timeSeries: Array(43).fill(null), // Initial 43 years (1993-2035)
// // //     color: "#975c5c", // Default color
// // //   });

// // //   const [maxYear, setMaxYear] = useState(2035); // Track the current maximum year
// // //   const [activeTab, setActiveTab] = useState("table"); // Tabs: 'table' or 'graph'
// // //   const [graphType, setGraphType] = useState(null); // Graph type: 'straight', 'linear-increase', etc.

// // //   // State for min and max values
// // //   const [minValue, setMinValue] = useState(0);
// // //   const [maxValue, setMaxValue] = useState(1);

// // //   const years = Array.from({ length: maxYear - 1993 + 1 }, (_, i) => 1993 + i);

// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setNewFactor((prev) => ({
// // //       ...prev,
// // //       [name]: value,
// // //     }));
// // //   };

// // //   const handleTimeSeriesChange = (index, value) => {
// // //     setNewFactor((prev) => {
// // //       const timeSeries = [...prev.timeSeries];
// // //       timeSeries[index] = value;
// // //       return { ...prev, timeSeries };
// // //     });
// // //   };

// // //   const handleAddYear = () => {
// // //     const newYear = maxYear + 1; // Increment the year
// // //     let newValue;

// // //     // Calculate the new value based on the graph type
// // //     switch (graphType) {
// // //       case "straight":
// // //         newValue = (minValue + maxValue) / 2; // Midpoint for straight line
// // //         break;
// // //       case "linear-increase":
// // //         newValue = maxValue; // Use max value for linear increase
// // //         break;
// // //       case "linear-decrease":
// // //         newValue = minValue; // Use min value for linear decrease
// // //         break;
// // //       case "exponential-increase":
// // //         newValue = maxValue; // Use max value for exponential increase
// // //         break;
// // //       case "exponential-decrease":
// // //         newValue = minValue; // Use min value for exponential decrease
// // //         break;
// // //       default:
// // //         newValue = 0.5; // Default to midpoint
// // //     }

// // //     // Update the state
// // //     setMaxYear(newYear);
// // //     setNewFactor((prev) => ({
// // //       ...prev,
// // //       timeSeries: [...prev.timeSeries, newValue], // Add the new value
// // //     }));
// // //   };

// // //   const handleDeleteYear = (index) => {
// // //     if (years[index] > 2035) {
// // //       setNewFactor((prev) => {
// // //         const timeSeries = [...prev.timeSeries];
// // //         timeSeries.splice(index, 1);
// // //         return { ...prev, timeSeries };
// // //       });
// // //       setMaxYear((prev) => prev - 1);
// // //     }
// // //   };

// // //   const handleGraphTypeChange = (type) => {
// // //     setGraphType(type);
// // //     // Prompt the user for min and max values
// // //     const min = parseFloat(
// // //       prompt("Enter the minimum value (between 0 and 1):", minValue)
// // //     );
// // //     const max = parseFloat(
// // //       prompt("Enter the maximum value (between 0 and 1):", maxValue)
// // //     );

// // //     if (min !== null && max !== null && !isNaN(min) && !isNaN(max)) {
// // //       setMinValue(min);
// // //       setMaxValue(max);
// // //       updateGraphValues(type, min, max);
// // //     } else {
// // //       alert("Invalid input. Please enter valid numbers between 0 and 1.");
// // //     }
// // //   };

// // //   const updateGraphValues = (type, min, max) => {
// // //     const updatedTimeSeries = newFactor.timeSeries.map((_, index) => {
// // //       const x = index / (newFactor.timeSeries.length - 1); // Normalize x to [0, 1]
// // //       let value;
// // //       switch (type) {
// // //         case "straight":
// // //           value = (min + max) / 2; // Straight line at midpoint
// // //           break;
// // //         case "linear-increase":
// // //           value = min + (max - min) * x; // Linear interpolation
// // //           break;
// // //         case "linear-decrease":
// // //           value = max + (min - max) * x; // Linear interpolation
// // //           break;
// // //         case "exponential-increase":
// // //           value = min + (max - min) * Math.pow(x, 2); // Exponential interpolation
// // //           break;
// // //         case "exponential-decrease":
// // //           value = max + (min - max) * Math.pow(x, 2); // Exponential interpolation
// // //           break;
// // //         default:
// // //           value = 0.5;
// // //       }
// // //       // Round to 2 decimal places
// // //       return parseFloat(value.toFixed(2));
// // //     });
// // //     setNewFactor((prev) => ({
// // //       ...prev,
// // //       timeSeries: updatedTimeSeries,
// // //     }));
// // //   };

// // //   useEffect(() => {
// // //     if (graphType) {
// // //       updateGraphValues(graphType, minValue, maxValue);
// // //     }
// // //   }, [minValue, maxValue, graphType]);

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();

// // //     try {
// // //       const response = await fetch(`${apiUrl}/api/factors`, {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify(newFactor),
// // //       });

// // //       const result = await response.json();

// // //       if (response.ok) {
// // //         console.log("Factor added successfully:", result);
// // //         alert("Factor added successfully!");
// // //         onAddSuccess();
// // //         onClose();
// // //       } else {
// // //         console.error("Failed to add factor:", result.message);
// // //         alert(result.message || "Failed to add factor.");
// // //       }
// // //     } catch (error) {
// // //       console.error("Error adding factor:", error);
// // //       alert("An error occurred while adding the factor.");
// // //     }
// // //   };

// // //   const chartData = {
// // //     labels: years,
// // //     datasets: [
// // //       {
// // //         label: "Factor Values",
// // //         data: newFactor.timeSeries,
// // //         borderColor: newFactor.color,
// // //         fill: false,
// // //       },
// // //     ],
// // //   };

// // //   const chartOptions = {
// // //     scales: {
// // //       y: {
// // //         min: 0,
// // //         max: 1,
// // //       },
// // //     },
// // //   };

// // //   return (
// // //     <div className="model-overlay">
// // //       <div className="model-content rounded-section">
// // //         <button className="close-btn" onClick={onClose}>
// // //           &times;
// // //         </button>
// // //         <h2>Add New Factor</h2>
// // //         <form onSubmit={handleSubmit}>
// // //           <div className="form-group">
// // //             <label htmlFor="name">Name:</label>
// // //             <input
// // //               type="text"
// // //               id="name"
// // //               name="name"
// // //               value={newFactor.name}
// // //               onChange={handleChange}
// // //               required
// // //             />
// // //           </div>
// // //           <div className="form-group">
// // //             <label htmlFor="description">Description:</label>
// // //             <textarea
// // //               id="description"
// // //               name="description"
// // //               value={newFactor.description}
// // //               onChange={handleChange}
// // //               style={{ height: "60px" }} // Set a fixed height
// // //               required
// // //             ></textarea>
// // //           </div>
// // //           <div className="form-group">
// // //             <label htmlFor="color">Color:</label>
// // //             <input
// // //               type="color"
// // //               id="color"
// // //               name="color"
// // //               value={newFactor.color}
// // //               onChange={handleChange}
// // //             />
// // //           </div>
// // //           <div className="tabs">
// // //             <button
// // //               type="button"
// // //               className={activeTab === "table" ? "active" : ""}
// // //               onClick={() => setActiveTab("table")}
// // //             >
// // //               Table Input
// // //             </button>
// // //             <button
// // //               type="button"
// // //               className={activeTab === "graph" ? "active" : ""}
// // //               onClick={() => setActiveTab("graph")}
// // //             >
// // //               Graph Input
// // //             </button>
// // //           </div>
// // //           {activeTab === "table" ? (
// // //             <div className="form-group">
// // //               <h3>Time Series Data (2000-{maxYear})</h3>
// // //               <div className="time-series-grid">
// // //                 {years.map((year, index) => (
// // //                   <div key={year} className="year-input">
// // //                     <label htmlFor={`year${year}`}>{year}:</label>
// // //                     <input
// // //                       id={`year${year}`}
// // //                       type="number"
// // //                       value={newFactor.timeSeries[index]}
// // //                       onChange={(e) =>
// // //                         handleTimeSeriesChange(index, e.target.value)
// // //                       }
// // //                       required
// // //                     />
// // //                     {year > 2035 && (
// // //                       <button
// // //                         type="button"
// // //                         className="delete-year-btn"
// // //                         onClick={() => handleDeleteYear(index)}
// // //                       >
// // //                         &#10005;
// // //                       </button>
// // //                     )}
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             </div>
// // //           ) : (
// // //             <div className="form-group">
// // //               <h3>Graph Input</h3>
// // //               <div className="graph-options">
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => handleGraphTypeChange("straight")}
// // //                 >
// // //                   Straight Line
// // //                 </button>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => handleGraphTypeChange("linear-increase")}
// // //                 >
// // //                   Linear Increase
// // //                 </button>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => handleGraphTypeChange("linear-decrease")}
// // //                 >
// // //                   Linear Decrease
// // //                 </button>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => handleGraphTypeChange("exponential-increase")}
// // //                 >
// // //                   Exponential Increase
// // //                 </button>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => handleGraphTypeChange("exponential-decrease")}
// // //                 >
// // //                   Exponential Decrease
// // //                 </button>
// // //               </div>

// // //               <div className="chart-container">
// // //                 <Line data={chartData} options={chartOptions} />
// // //               </div>
// // //             </div>
// // //           )}
// // //           <div className="form-actions">
// // //             <CustomButton
// // //               type="button"
// // //               onClick={handleAddYear}
// // //               className="btn-time"
// // //             >
// // //               Add Year
// // //             </CustomButton>
// // //             <button
// // //               type="submit"
// // //               className="btn-primary"
// // //               style={{ marginLeft: "10px" }}
// // //             >
// // //               Add Factor
// // //             </button>
// // //             <button type="button" onClick={onClose} className="btn-secondary">
// // //               Cancel
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default AddFactorModal;
// // import React, { useState, useEffect } from "react";
// // import "./AddFactorModal.css";
// // import styled from "styled-components";
// // import { Line } from "react-chartjs-2";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";

// // // Register Chart.js components
// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend
// // );

// // const apiUrl = process.env.REACT_APP_API_URI;

// // const CustomButton = styled.button`
// //   padding: 8px 15px;
// //   border: none;
// //   background-color: #975c5c;
// //   color: #fff;
// //   border-radius: 5px;
// //   cursor: pointer;
// //   margin-left: 5px;
// //   &:hover {
// //     background-color: #574141;
// //   }
// //   &:active {
// //     background-color: #40224a;
// //     transform: scale(0.98);
// //   }
// //   &:focus {
// //     outline: none;
// //   }
// // `;

// // const AddFactorModal = ({ onClose, onAddSuccess }) => {
// //   const [newFactor, setNewFactor] = useState({
// //     name: "",
// //     description: "",
// //     timeSeries: Array(43).fill(null), // Initial 43 years (1993-2035)
// //     color: "#975c5c", // Default color
// //   });

// //   const [maxYear, setMaxYear] = useState(2035); // Track the current maximum year
// //   const [activeTab, setActiveTab] = useState("table"); // Tabs: 'table' or 'graph'
// //   const [graphType, setGraphType] = useState(null); // Graph type: 'straight', 'linear-increase', etc.

// //   // State for min and max values
// //   const [minValue, setMinValue] = useState(0);
// //   const [maxValue, setMaxValue] = useState(1);

// //   // State for the custom input modal
// //   const [showInputModal, setShowInputModal] = useState(false);
// //   const [inputValue, setInputValue] = useState("");

// //   const years = Array.from({ length: maxYear - 1993 + 1 }, (_, i) => 1993 + i);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setNewFactor((prev) => ({
// //       ...prev,
// //       [name]: value,
// //     }));
// //   };

// //   const handleTimeSeriesChange = (index, value) => {
// //     setNewFactor((prev) => {
// //       const timeSeries = [...prev.timeSeries];
// //       timeSeries[index] = value;
// //       return { ...prev, timeSeries };
// //     });
// //   };

// //   const handleAddYear = () => {
// //     const newYear = maxYear + 1; // Increment the year
// //     let newValue;

// //     // Calculate the new value based on the graph type
// //     switch (graphType) {
// //       case "straight":
// //         newValue = parseFloat(inputValue); // Use the single value for straight line
// //         break;
// //       case "linear-increase":
// //       case "linear-decrease":
// //       case "exponential-increase":
// //       case "exponential-decrease":
// //         newValue = maxValue; // Use max value for other graph types
// //         break;
// //       default:
// //         newValue = 0.5; // Default to midpoint
// //     }

// //     // Update the state
// //     setMaxYear(newYear);
// //     setNewFactor((prev) => ({
// //       ...prev,
// //       timeSeries: [...prev.timeSeries, newValue], // Add the new value
// //     }));
// //   };

// //   const handleDeleteYear = (index) => {
// //     if (years[index] > 2035) {
// //       setNewFactor((prev) => {
// //         const timeSeries = [...prev.timeSeries];
// //         timeSeries.splice(index, 1);
// //         return { ...prev, timeSeries };
// //       });
// //       setMaxYear((prev) => prev - 1);
// //     }
// //   };

// //   const handleGraphTypeChange = (type) => {
// //     setGraphType(type);
// //     setShowInputModal(true); // Show the custom input modal
// //   };

// //   const handleInputSubmit = () => {
// //     if (graphType === "straight") {
// //       const value = parseFloat(inputValue);
// //       if (!isNaN(value) && value >= 0 && value <= 1) {
// //         setMinValue(value);
// //         setMaxValue(value);
// //         updateGraphValues(graphType, value, value);
// //         setShowInputModal(false);
// //       } else {
// //         alert("Invalid input. Please enter a value between 0 and 1.");
// //       }
// //     } else {
// //       const [min, max] = inputValue
// //         .split(",")
// //         .map((val) => parseFloat(val.trim()));
// //       if (!isNaN(min) && !isNaN(max) && min >= 0 && max <= 1 && min <= max) {
// //         setMinValue(min);
// //         setMaxValue(max);
// //         updateGraphValues(graphType, min, max);
// //         setShowInputModal(false);
// //       } else {
// //         alert("Invalid input. Please enter valid numbers between 0 and 1.");
// //       }
// //     }
// //   };

// //   const updateGraphValues = (type, min, max) => {
// //     const updatedTimeSeries = newFactor.timeSeries.map((_, index) => {
// //       const x = index / (newFactor.timeSeries.length - 1); // Normalize x to [0, 1]
// //       let value;
// //       switch (type) {
// //         case "straight":
// //           value = min; // Straight line at the provided value
// //           break;
// //         case "linear-increase":
// //           value = min + (max - min) * x; // Linear interpolation
// //           break;
// //         case "linear-decrease":
// //           value = max + (min - max) * x; // Linear interpolation
// //           break;
// //         case "exponential-increase":
// //           value = min + (max - min) * Math.pow(x, 2); // Exponential interpolation
// //           break;
// //         case "exponential-decrease":
// //           value = max + (min - max) * Math.pow(x, 2); // Exponential interpolation
// //           break;
// //         default:
// //           value = 0.5;
// //       }
// //       // Round to 2 decimal places
// //       return parseFloat(value.toFixed(2));
// //     });
// //     setNewFactor((prev) => ({
// //       ...prev,
// //       timeSeries: updatedTimeSeries,
// //     }));
// //   };

// //   useEffect(() => {
// //     if (graphType) {
// //       updateGraphValues(graphType, minValue, maxValue);
// //     }
// //   }, [minValue, maxValue, graphType]);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const response = await fetch(`${apiUrl}/api/factors`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(newFactor),
// //       });

// //       const result = await response.json();

// //       if (response.ok) {
// //         console.log("Factor added successfully:", result);
// //         alert("Factor added successfully!");
// //         onAddSuccess();
// //         onClose();
// //       } else {
// //         console.error("Failed to add factor:", result.message);
// //         alert(result.message || "Failed to add factor.");
// //       }
// //     } catch (error) {
// //       console.error("Error adding factor:", error);
// //       alert("An error occurred while adding the factor.");
// //     }
// //   };

// //   const chartData = {
// //     labels: years,
// //     datasets: [
// //       {
// //         label: "Factor Values",
// //         data: newFactor.timeSeries,
// //         borderColor: newFactor.color,
// //         fill: false,
// //       },
// //     ],
// //   };

// //   const chartOptions = {
// //     scales: {
// //       y: {
// //         min: 0,
// //         max: 1,
// //       },
// //     },
// //   };

// //   return (
// //     <div className="model-overlay">
// //       <div className="model-content rounded-section">
// //         <button className="close-btn" onClick={onClose}>
// //           &times;
// //         </button>
// //         <h2>Add New Factor</h2>
// //         <form onSubmit={handleSubmit}>
// //           <div className="form-group">
// //             <label htmlFor="name">Name:</label>
// //             <input
// //               type="text"
// //               id="name"
// //               name="name"
// //               value={newFactor.name}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //           <div className="form-group">
// //             <label htmlFor="description">Description:</label>
// //             <textarea
// //               id="description"
// //               name="description"
// //               value={newFactor.description}
// //               onChange={handleChange}
// //               style={{ height: "60px" }} // Set a fixed height
// //               required
// //             ></textarea>
// //           </div>
// //           <div className="form-group">
// //             <label htmlFor="color">Color:</label>
// //             <input
// //               type="color"
// //               id="color"
// //               name="color"
// //               value={newFactor.color}
// //               onChange={handleChange}
// //             />
// //           </div>
// //           <div className="tabs">
// //             <button
// //               type="button"
// //               className={activeTab === "table" ? "active" : ""}
// //               onClick={() => setActiveTab("table")}
// //             >
// //               Table Input
// //             </button>
// //             <button
// //               type="button"
// //               className={activeTab === "graph" ? "active" : ""}
// //               onClick={() => setActiveTab("graph")}
// //             >
// //               Graph Input
// //             </button>
// //           </div>
// //           {activeTab === "table" ? (
// //             <div className="form-group">
// //               <h3>Time Series Data (2000-{maxYear})</h3>
// //               <div className="time-series-grid">
// //                 {years.map((year, index) => (
// //                   <div key={year} className="year-input">
// //                     <label htmlFor={`year${year}`}>{year}:</label>
// //                     <input
// //                       id={`year${year}`}
// //                       type="number"
// //                       value={newFactor.timeSeries[index]}
// //                       onChange={(e) =>
// //                         handleTimeSeriesChange(index, e.target.value)
// //                       }
// //                       required
// //                     />
// //                     {year > 2035 && (
// //                       <button
// //                         type="button"
// //                         className="delete-year-btn"
// //                         onClick={() => handleDeleteYear(index)}
// //                       >
// //                         &#10005;
// //                       </button>
// //                     )}
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           ) : (
// //             <div className="form-group">
// //               <h3>Graph Input</h3>
// //               <div className="graph-options">
// //                 <button
// //                   type="button"
// //                   onClick={() => handleGraphTypeChange("straight")}
// //                 >
// //                   Straight Line
// //                 </button>
// //                 <button
// //                   type="button"
// //                   onClick={() => handleGraphTypeChange("linear-increase")}
// //                 >
// //                   Linear Increase
// //                 </button>
// //                 <button
// //                   type="button"
// //                   onClick={() => handleGraphTypeChange("linear-decrease")}
// //                 >
// //                   Linear Decrease
// //                 </button>
// //                 <button
// //                   type="button"
// //                   onClick={() => handleGraphTypeChange("exponential-increase")}
// //                 >
// //                   Exponential Increase
// //                 </button>
// //                 <button
// //                   type="button"
// //                   onClick={() => handleGraphTypeChange("exponential-decrease")}
// //                 >
// //                   Exponential Decrease
// //                 </button>
// //               </div>

// //               <div className="chart-container">
// //                 <Line data={chartData} options={chartOptions} />
// //               </div>
// //             </div>
// //           )}
// //           <div className="form-actions">
// //             <CustomButton
// //               type="button"
// //               onClick={handleAddYear}
// //               className="btn-time"
// //             >
// //               Add Year
// //             </CustomButton>
// //             <button
// //               type="submit"
// //               className="btn-primary"
// //               style={{ marginLeft: "10px" }}
// //             >
// //               Add Factor
// //             </button>
// //             <button type="button" onClick={onClose} className="btn-secondary">
// //               Cancel
// //             </button>
// //           </div>
// //         </form>
// //       </div>

// //       {/* Custom Input Modal */}
// //       {showInputModal && (
// //         <div className="input-modal-overlay">
// //           <div className="input-modal-content">
// //             <h3>
// //               {graphType === "straight"
// //                 ? "Enter the value for the straight line (0 to 1):"
// //                 : "Enter the min and max values (0 to 1, separated by a comma):"}
// //             </h3>
// //             <input
// //               type="text"
// //               value={inputValue}
// //               onChange={(e) => setInputValue(e.target.value)}
// //               placeholder={
// //                 graphType === "straight" ? "e.g., 0.5" : "e.g., 0.2, 0.8"
// //               }
// //             />
// //             <div className="input-modal-actions">
// //               <button onClick={handleInputSubmit}>Submit</button>
// //               <button onClick={() => setShowInputModal(false)}>Cancel</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default AddFactorModal;

// import React, { useState, useEffect } from "react";
// import "./AddFactorModal.css";
// import styled from "styled-components";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const apiUrl = process.env.REACT_APP_API_URI;

// const CustomButton = styled.button`
//   padding: 8px 15px;
//   border: none;
//   background-color: #975c5c;
//   color: #fff;
//   border-radius: 5px;
//   cursor: pointer;
//   margin-left: 5px;
//   &:hover {
//     background-color: #574141;
//   }
//   &:active {
//     background-color: #40224a;
//     transform: scale(0.98);
//   }
//   &:focus {
//     outline: none;
//   }
// `;

// const AddFactorModal = ({ onClose, onAddSuccess }) => {
//   const [newFactor, setNewFactor] = useState({
//     name: "",
//     description: "",
//     timeSeries: Array(43).fill(null), // Initial 43 years (1993-2035)
//     color: "#975c5c", // Default color
//   });

//   const [maxYear, setMaxYear] = useState(2035); // Track the current maximum year
//   const [activeTab, setActiveTab] = useState("table"); // Tabs: 'table' or 'graph'
//   const [graphType, setGraphType] = useState(null); // Graph type: 'straight', 'linear-increase', etc.

//   // State for min and max values
//   const [minValue, setMinValue] = useState(0);
//   const [maxValue, setMaxValue] = useState(1);

//   // State for the small input modal
//   const [showInputModal, setShowInputModal] = useState(false);
//   const [singleValue, setSingleValue] = useState(""); // For Straight Line
//   const [minInputValue, setMinInputValue] = useState(""); // For other graph types
//   const [maxInputValue, setMaxInputValue] = useState(""); // For other graph types

//   const years = Array.from({ length: maxYear - 1993 + 1 }, (_, i) => 1993 + i);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewFactor((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleTimeSeriesChange = (index, value) => {
//     setNewFactor((prev) => {
//       const timeSeries = [...prev.timeSeries];
//       timeSeries[index] = value;
//       return { ...prev, timeSeries };
//     });
//   };

//   const handleAddYear = () => {
//     const newYear = maxYear + 1; // Increment the year
//     let newValue;

//     // Calculate the new value based on the graph type
//     switch (graphType) {
//       case "straight":
//         newValue = parseFloat(singleValue); // Use the single value for straight line
//         break;
//       case "linear-increase":
//       case "linear-decrease":
//       case "exponential-increase":
//       case "exponential-decrease":
//         newValue = maxValue; // Use max value for other graph types
//         break;
//       default:
//         newValue = 0.5; // Default to midpoint
//     }

//     // Update the state
//     setMaxYear(newYear);
//     setNewFactor((prev) => ({
//       ...prev,
//       timeSeries: [...prev.timeSeries, newValue], // Add the new value
//     }));
//   };

//   const handleDeleteYear = (index) => {
//     if (years[index] > 2035) {
//       setNewFactor((prev) => {
//         const timeSeries = [...prev.timeSeries];
//         timeSeries.splice(index, 1);
//         return { ...prev, timeSeries };
//       });
//       setMaxYear((prev) => prev - 1);
//     }
//   };

//   const handleGraphTypeChange = (type) => {
//     setGraphType(type);
//     setShowInputModal(true); // Show the small input modal
//   };

//   const handleInputSubmit = () => {
//     if (graphType === "straight") {
//       const value = parseFloat(singleValue);
//       if (!isNaN(value) && value >= 0 && value <= 1) {
//         setMinValue(value);
//         setMaxValue(value);
//         updateGraphValues(graphType, value, value);
//         setShowInputModal(false);
//       } else {
//         alert("Invalid input. Please enter a value between 0 and 1.");
//       }
//     } else {
//       const min = parseFloat(minInputValue);
//       const max = parseFloat(maxInputValue);

//       // Validate min and max values
//       if (
//         !isNaN(min) &&
//         !isNaN(max) &&
//         min >= 0 &&
//         max <= 1 &&
//         (graphType.includes("decrease") ? min >= max : min <= max) // Check for decreasing trends
//       ) {
//         setMinValue(min);
//         setMaxValue(max);
//         updateGraphValues(graphType, min, max);
//         setShowInputModal(false);
//       } else {
//         alert(
//           graphType.includes("decrease")
//             ? "For decreasing trends, min must be greater than or equal to max."
//             : "Invalid input. Please enter valid numbers between 0 and 1."
//         );
//       }
//     }
//   };

//   // const handleInputSubmit = () => {
//   //   if (graphType === "straight") {
//   //     const value = parseFloat(singleValue);
//   //     if (!isNaN(value) && value >= 0 && value <= 1) {
//   //       setMinValue(value);
//   //       setMaxValue(value);
//   //       updateGraphValues(graphType, value, value);
//   //       setShowInputModal(false);
//   //     } else {
//   //       alert("Invalid input. Please enter a value between 0 and 1.");
//   //     }
//   //   } else {
//   //     const min = parseFloat(minInputValue);
//   //     const max = parseFloat(maxInputValue);
//   //     if (!isNaN(min) && !isNaN(max) && min >= 0 && max <= 1 && min <= max) {
//   //       setMinValue(min);
//   //       setMaxValue(max);
//   //       updateGraphValues(graphType, min, max);
//   //       setShowInputModal(false);
//   //     } else {
//   //       alert("Invalid input. Please enter valid numbers between 0 and 1.");
//   //     }
//   //   }
//   // };

//   const updateGraphValues = (type, min, max) => {
//     const updatedTimeSeries = newFactor.timeSeries.map((_, index) => {
//       const x = index / (newFactor.timeSeries.length - 1); // Normalize x to [0, 1]
//       let value;
//       switch (type) {
//         case "straight":
//           value = min; // Straight line at the provided value
//           break;
//         case "linear-increase":
//           value = min + (max - min) * x; // Linear interpolation
//           break;
//         case "linear-decrease":
//           value = max + (min - max) * x; // Linear interpolation
//           break;
//         case "exponential-increase":
//           value = min + (max - min) * Math.pow(x, 2); // Exponential interpolation
//           break;
//         case "exponential-decrease":
//           value = max + (min - max) * Math.pow(x, 2); // Exponential interpolation
//           break;
//         default:
//           value = 0.5;
//       }
//       // Round to 2 decimal places
//       return parseFloat(value.toFixed(2));
//     });
//     setNewFactor((prev) => ({
//       ...prev,
//       timeSeries: updatedTimeSeries,
//     }));
//   };

//   useEffect(() => {
//     if (graphType) {
//       updateGraphValues(graphType, minValue, maxValue);
//     }
//   }, [minValue, maxValue, graphType]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     console.log("New Factor is :", newFactor);

//     try {
//       const response = await fetch(`${apiUrl}/api/factors`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newFactor),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         console.log("Factor added successfully:", result);
//         alert("Factor added successfully!");
//         onAddSuccess();
//         onClose();
//       } else {
//         console.error("Failed to add factor:", result.message);
//         alert(result.message || "Failed to add factor.");
//       }
//     } catch (error) {
//       console.error("Error adding factor:", error);
//       alert("An error occurred while adding the factor.");
//     }
//   };

//   const chartData = {
//     labels: years,
//     datasets: [
//       {
//         label: "Factor Values",
//         data: newFactor.timeSeries,
//         borderColor: newFactor.color,
//         fill: false,
//       },
//     ],
//   };

//   const chartOptions = {
//     scales: {
//       y: {
//         min: 0,
//         max: 1,
//       },
//     },
//   };

//   return (
//     <div className="model-overlay">
//       <div className="model-content rounded-section">
//         <button className="close-btn" onClick={onClose}>
//           &times;
//         </button>
//         <h2>Add New Factor</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="name">Name:</label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={newFactor.name}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="description">Description:</label>
//             <textarea
//               id="description"
//               name="description"
//               value={newFactor.description}
//               onChange={handleChange}
//               style={{ height: "60px" }} // Set a fixed height
//               required
//             ></textarea>
//           </div>
//           <div className="form-group">
//             <label htmlFor="color">Color:</label>
//             <input
//               type="color"
//               id="color"
//               name="color"
//               value={newFactor.color}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="tabs">
//             <button
//               type="button"
//               className={activeTab === "table" ? "active" : ""}
//               onClick={() => setActiveTab("table")}
//             >
//               Table Input
//             </button>
//             <button
//               type="button"
//               className={activeTab === "graph" ? "active" : ""}
//               onClick={() => setActiveTab("graph")}
//             >
//               Graph Input
//             </button>
//           </div>
//           {activeTab === "table" ? (
//             <div className="form-group">
//               <h3>Time Series Data (2000-{maxYear})</h3>
//               <div className="time-series-grid">
//                 {years.map((year, index) => (
//                   <div key={year} className="year-input">
//                     <label htmlFor={`year${year}`}>{year}:</label>
//                     <input
//                       id={`year${year}`}
//                       type="number"
//                       value={newFactor.timeSeries[index]}
//                       onChange={(e) =>
//                         handleTimeSeriesChange(index, e.target.value)
//                       }
//                       required
//                     />
//                     {year > 2035 && (
//                       <button
//                         type="button"
//                         className="delete-year-btn"
//                         onClick={() => handleDeleteYear(index)}
//                       >
//                         &#10005;
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="form-group">
//               <h3>Graph Input</h3>
//               <div className="graph-options">
//                 <button
//                   type="button"
//                   onClick={() => handleGraphTypeChange("straight")}
//                 >
//                   Straight Line
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => handleGraphTypeChange("linear-increase")}
//                 >
//                   Linear Increase
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => handleGraphTypeChange("linear-decrease")}
//                 >
//                   Linear Decrease
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => handleGraphTypeChange("exponential-increase")}
//                 >
//                   Exponential Increase
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => handleGraphTypeChange("exponential-decrease")}
//                 >
//                   Exponential Decrease
//                 </button>
//               </div>

//               <div className="chart-container">
//                 <Line data={chartData} options={chartOptions} />
//               </div>
//             </div>
//           )}
//           <div className="form-actions">
//             <CustomButton
//               type="button"
//               onClick={handleAddYear}
//               className="btn-time"
//             >
//               Add Year
//             </CustomButton>
//             <button
//               type="submit"
//               className="btn-primary"
//               style={{ marginLeft: "10px" }}
//             >
//               Add Factor
//             </button>
//             <button type="button" onClick={onClose} className="btn-secondary">
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Small Input Modal */}
//       {showInputModal && (
//         <div className="small-modal-overlay">
//           <div className="small-modal-content">
//             <h3>
//               {graphType === "straight"
//                 ? "Enter the value for the straight line (0 to 1):"
//                 : "Enter the min and max values (0 to 1):"}
//             </h3>
//             {graphType === "straight" ? (
//               <input
//                 type="number"
//                 value={singleValue}
//                 onChange={(e) => setSingleValue(e.target.value)}
//                 min="0"
//                 max="1"
//                 step="0.1"
//                 placeholder="e.g., 0.5"
//               />
//             ) : (
//               <div className="input-group">
//                 <input
//                   type="number"
//                   value={minInputValue}
//                   onChange={(e) => setMinInputValue(e.target.value)}
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   placeholder="Min (e.g., 0.2)"
//                 />
//                 <input
//                   type="number"
//                   value={maxInputValue}
//                   onChange={(e) => setMaxInputValue(e.target.value)}
//                   min="0"
//                   max="1"
//                   step="0.1"
//                   placeholder="Max (e.g., 0.8)"
//                 />
//               </div>
//             )}
//             <div className="small-modal-actions">
//               <button onClick={handleInputSubmit}>Submit</button>
//               <button onClick={() => setShowInputModal(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddFactorModal;

import React, { useState, useEffect } from "react";
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

// Register Chart.js components
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
    timeSeries: Array(43).fill(null), // Initial 43 years (1993-2035)
    color: "#975c5c", // Default color
  });

  const [maxYear, setMaxYear] = useState(2035); // Track the current maximum year
  const [activeTab, setActiveTab] = useState("table"); // Tabs: 'table' or 'graph'
  const [graphType, setGraphType] = useState(null); // Graph type: 'straight', 'linear', 'exponential'

  // State for the small input modal
  const [showInputModal, setShowInputModal] = useState(false);
  const [singleValue, setSingleValue] = useState(""); // For Straight Line
  const [startValue, setStartValue] = useState(""); // For Linear and Exponential
  const [endValue, setEndValue] = useState(""); // For Linear and Exponential

  const years = Array.from({ length: maxYear - 1993 + 1 }, (_, i) => 1993 + i);

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

  const handleAddYear = () => {
    const newYear = maxYear + 1; // Increment the year
    let newValue;

    // Calculate the new value based on the graph type
    switch (graphType) {
      case "straight":
        newValue = parseFloat(singleValue); // Use the single value for straight line
        break;
      case "linear":
      case "exponential":
        newValue = parseFloat(endValue); // Use the end value for other graph types
        break;
      default:
        newValue = 0.5; // Default to midpoint
    }

    // Update the state
    setMaxYear(newYear);
    setNewFactor((prev) => ({
      ...prev,
      timeSeries: [...prev.timeSeries, newValue], // Add the new value
    }));
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
    setShowInputModal(true); // Show the small input modal
  };

  const handleInputSubmit = () => {
    if (graphType === "straight") {
      const value = parseFloat(singleValue);
      if (!isNaN(value) && value >= 0 && value <= 1) {
        updateGraphValues(graphType, value, value);
        setShowInputModal(false);
      } else {
        alert("Invalid input. Please enter a value between 0 and 1.");
      }
    } else {
      const start = parseFloat(startValue);
      const end = parseFloat(endValue);

      // Validate start and end values
      if (!isNaN(start) && !isNaN(end) && start >= 0 && end <= 1) {
        updateGraphValues(graphType, start, end);
        setShowInputModal(false);
      } else {
        alert("Invalid input. Please enter valid numbers between 0 and 1.");
      }
    }
  };

  const updateGraphValues = (type, start, end) => {
    const updatedTimeSeries = newFactor.timeSeries.map((_, index) => {
      const x = index / (newFactor.timeSeries.length - 1); // Normalize x to [0, 1]
      let value;

      switch (type) {
        case "straight":
          value = start; // Straight line at the provided value
          break;
        case "linear":
          value = start + (end - start) * x; // Linear interpolation
          break;
        case "exponential":
          value = start + (end - start) * Math.pow(x, 2); // Exponential interpolation
          break;
        default:
          value = 0.5;
      }

      // Round to 2 decimal places
      return parseFloat(value.toFixed(2));
    });

    setNewFactor((prev) => ({
      ...prev,
      timeSeries: updatedTimeSeries,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/factors`, {
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
              style={{ height: "60px" }} // Set a fixed height
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
              <h3>Time Series Data (2000-{maxYear})</h3>
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
            <CustomButton
              type="button"
              onClick={handleAddYear}
              className="btn-time"
            >
              Add Year
            </CustomButton>
            <button
              type="submit"
              className="btn-primary"
              style={{ marginLeft: "10px" }}
            >
              Add Factor
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Small Input Modal */}
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
                step="0.1"
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
                  step="0.1"
                  placeholder="Start (e.g., 0.2)"
                />
                <input
                  type="number"
                  value={endValue}
                  onChange={(e) => setEndValue(e.target.value)}
                  min="0"
                  max="1"
                  step="0.1"
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
