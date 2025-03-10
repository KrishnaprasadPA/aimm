// import React, { useEffect, useRef, useState } from "react";
// import Chart from "chart.js/auto";
// import {
//   Popover,
//   Paper,
//   Grid,
//   Box,
//   Button,
//   Tabs,
//   Tab,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// const ChartComponent = ({ factorData, onClose, onSave }) => {
//   const [tabIndex, setTabIndex] = useState(0); // State to manage active tab
//   const [data, setData] = useState(factorData); // State to manage data
//   const canvasRef = useRef(null); // Ref for the canvas element
//   const chartInstanceRef = useRef(null); // Ref to store the Chart.js instance

//   useEffect(() => {
//     // Extract data for the chart
//     const years = factorData.map((item) => item.year);
//     const values = factorData.map((item) => item.normalized_value);

//     // Create a new Chart.js instance
//     const chartConfig = {
//       type: "line",
//       data: {
//         labels: years,
//         datasets: [
//           {
//             label: "Past Data",
//             borderColor: "blue",
//             data: values,
//             fill: false,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true,
//           },
//         },
//       },
//     };

//     chartInstanceRef.current = new Chart(canvasRef.current, chartConfig);
//     console.log(chartInstanceRef.current);

//     // Cleanup function to destroy the chart when component unmounts or updates
//     return () => {
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.destroy();
//         chartInstanceRef.current = null;
//       }
//     };
//   }, [factorData, chartInstanceRef.current]); // Re-run effect when factorData changes

//   // return (
//   //   <div style={{ width: "100%", height: "400px" }}>
//   //     <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
//   //   </div>
//   // );
//   const handleTabChange = (event, newValue) => {
//     setTabIndex(newValue);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedData = [...data];
//     updatedData[index][field] =
//       field === "normalized_value" ? parseFloat(value) : value;
//     setData(updatedData);
//   };

//   // Add a new row of data
//   const handleAddRow = () => {
//     setData([
//       ...data,
//       { year: new Date().getFullYear(), normalized_value: 0 }, // Default values for new row
//     ]);
//   };

//   const handleDeleteRow = (index) => {
//     const updatedData = data.filter((_, i) => i !== index);
//     setData(updatedData);
//   };

//   const handleSaveChanges = () => {
//     // Extract updated data from the chart
//     const updatedValues = chartInstanceRef.current.data.datasets[0].data;

//     // Map updated values back to factorData structure
//     const updatedFactorData = factorData.map((item, index) => ({
//       ...item,
//       normalized_value: updatedValues[index],
//     }));
//     console.log("Inside handleSave");
//     console.log("Updated factorData is: ", updatedFactorData);

//     // Call onSave callback to update parent state
//     onSave(updatedFactorData);
//   };

//   return (
//     <div>
//       <Popover
//         open={true}
//         anchorEl={chartInstanceRef.current}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//         sx={{
//           position: "fixed",
//           zIndex: 1400,
//           cursor: "move",
//           minWidth: `400px`,
//           maxHeight: `600px`,
//           overflow: "auto",
//         }}
//       >
//         <button
//           onClick={onClose}
//           style={{
//             position: "absolute",
//             top: "10px",
//             right: "10px",
//             zIndex: 1000,
//             backgroundColor: "red",
//             color: "white",
//             borderRadius: "50%",
//             border: "none",
//             cursor: "pointer",
//           }}
//         >
//           X
//         </button>
//         <Tabs value={tabIndex} onChange={handleTabChange} centered>
//           <Tab label="Chart View" />
//           <Tab label="Table View" />
//         </Tabs>
//         {tabIndex === 0 && (
//           <Box
//             sx={{
//               position: "relative",
//               width: "100%",
//               height: "100%",
//               flexGrow: 1,
//             }}
//           >
//             <canvas ref={canvasRef} width="400" height="300" />
//           </Box>
//         )}
//         {tabIndex === 1 && (
//           <Box
//             sx={{
//               position: "relative",
//               width: "100%",
//               height: "100%",
//               flexGrow: 1,
//             }}
//           >
//             {/* Table View */}
//             <Box
//               sx={{
//                 fontFamily: "'Nunito Sans', sans-serif", // Apply Nunito Sans font
//               }}
//             >
//               <Grid container spacing={2}>
//                 {data.map((row, index) => (
//                   <Grid item xs={6} sm={4} md={3} key={index}>
//                     <Box
//                       sx={{
//                         // border: "1px solid #e0e0e0",
//                         borderRadius: "8px",
//                         padding: "16px",
//                         textAlign: "center",
//                         // backgroundColor: "#f5f5f5",
//                       }}
//                     >
//                       {/* Year as Typography */}
//                       <Typography
//                         variant="body1" // Use a smaller variant
//                         sx={{
//                           fontFamily: "'Nunito Sans', sans-serif",
//                           fontWeight: 400, // Normal weight
//                           fontSize: "14px", // Smaller font size
//                           marginBottom: "8px",
//                         }}
//                       >
//                         {row.year}
//                       </Typography>

//                       {/* Normalized Value as TextField */}
//                       <TextField
//                         type="number"
//                         value={row.normalized_value}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "normalized_value",
//                             e.target.value
//                           )
//                         }
//                         size="small"
//                         fullWidth
//                         sx={{
//                           "& .MuiInputBase-input": {
//                             fontFamily: "'Nunito Sans', sans-serif",
//                             fontWeight: 400,
//                           },
//                         }}
//                       />

//                       {/* Delete Button */}
//                       <IconButton
//                         color="error"
//                         onClick={() => handleDeleteRow(index)}
//                         sx={{ marginTop: "8px" }}
//                       >
//                         <CloseIcon />
//                       </IconButton>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>
//             </Box>

//             <Box sx={{ textAlign: "center", marginTop: "16px" }}>
//               <Button variant="contained" onClick={handleAddRow}>
//                 Add Data
//               </Button>
//             </Box>
//           </Box>
//         )}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "flex-end",
//             padding: "8px",
//           }}
//         >
//           <Button
//             variant="contained"
//             color="primary"
//             size="small"
//             onClick={handleSaveChanges}
//             sx={{
//               textTransform: "none",
//               padding: "4px 8px",
//               fontSize: "0.8rem",
//             }}
//           >
//             Save Changes
//           </Button>
//         </Box>
//       </Popover>
//     </div>
//   );
// };

// export default ChartComponent;
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  Popover,
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ChartComponent = ({ factorData, onClose, onSave }) => {
  const [tabIndex, setTabIndex] = useState(0); // State to manage active tab
  const [data, setData] = useState(factorData); // State to manage data
  const canvasRef = useRef(null); // Ref for the canvas element
  const chartInstanceRef = useRef(null); // Ref to store the Chart.js instance

  useEffect(() => {
    // Extract data for the chart
    const years = data.map((item) => item.year);
    const values = data.map((item) => item.normalized_value);

    // Create a new Chart.js instance
    const chartConfig = {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Past Data",
            borderColor: "blue",
            data: values,
            fill: false,
            pointRadius: 5, // Make points visible
            pointHoverRadius: 8, // Increase size on hover
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        // Enable drag-to-update interaction
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
          },
        },
        onHover: (event, chartElement) => {
          // Change cursor to pointer when hovering over points
          if (chartElement.length > 0) {
            event.native.target.style.cursor = "pointer";
          } else {
            event.native.target.style.cursor = "default";
          }
        },
      },
    };

    chartInstanceRef.current = new Chart(canvasRef.current, chartConfig);

    // Add drag-to-update functionality
    const handleDragUpdate = (event) => {
      const chart = chartInstanceRef.current;
      if (chart.tooltip?.dataPoints?.length > 0) {
        const { datasetIndex, index } = chart.tooltip.dataPoints[0];
        const newValue = chart.scales.y.getValueForPixel(event.y);
        const updatedData = [...data];
        updatedData[index].normalized_value = newValue;
        setData(updatedData);

        // Update the chart data
        chart.data.datasets[datasetIndex].data[index] = newValue;
        chart.update();
      }
    };

    // Attach event listeners for drag-to-update
    const canvas = canvasRef.current;
    let isDragging = false;

    canvas.addEventListener("mousedown", () => {
      isDragging = true;
    });

    canvas.addEventListener("mousemove", (event) => {
      if (isDragging) {
        handleDragUpdate(event);
      }
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    canvas.addEventListener("mouseleave", () => {
      isDragging = false;
    });

    // Cleanup function to destroy the chart and remove event listeners
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      canvas.removeEventListener("mousedown", () => {});
      canvas.removeEventListener("mousemove", () => {});
      canvas.removeEventListener("mouseup", () => {});
      canvas.removeEventListener("mouseleave", () => {});
    };
  }, [data]); // Re-run effect when data changes

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleInputChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] =
      field === "normalized_value" ? parseFloat(value) : value;
    setData(updatedData);
  };

  const handleAddRow = () => {
    setData([
      ...data,
      { year: new Date().getFullYear(), normalized_value: 0 }, // Default values for new row
    ]);
  };

  const handleDeleteRow = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  const handleSaveChanges = () => {
    // Extract updated data from the chart
    const updatedValues = chartInstanceRef.current.data.datasets[0].data;

    // Map updated values back to factorData structure
    const updatedFactorData = data.map((item, index) => ({
      ...item,
      normalized_value: updatedValues[index],
    }));

    // Call onSave callback to update parent state
    onSave(updatedFactorData);
  };

  return (
    <div>
      <Popover
        open={true}
        anchorEl={chartInstanceRef.current}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          position: "fixed",
          zIndex: 1400,
          cursor: "move",
          minWidth: `400px`,
          maxHeight: `600px`,
          overflow: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            backgroundColor: "red",
            color: "white",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
          }}
        >
          X
        </button>
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="Chart View" />
          <Tab label="Table View" />
        </Tabs>
        {tabIndex === 0 && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              flexGrow: 1,
            }}
          >
            <canvas ref={canvasRef} width="400" height="300" />
          </Box>
        )}
        {tabIndex === 1 && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              flexGrow: 1,
            }}
          >
            {/* Table View */}
            <Box
              sx={{
                fontFamily: "'Nunito Sans', sans-serif", // Apply Nunito Sans font
              }}
            >
              <Grid container spacing={2}>
                {data.map((row, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      sx={{
                        borderRadius: "8px",
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Nunito Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "14px",
                          marginBottom: "8px",
                        }}
                      >
                        {row.year}
                      </Typography>
                      <TextField
                        type="number"
                        value={row.normalized_value}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "normalized_value",
                            e.target.value
                          )
                        }
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiInputBase-input": {
                            fontFamily: "'Nunito Sans', sans-serif",
                            fontWeight: 400,
                          },
                        }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteRow(index)}
                        sx={{ marginTop: "8px" }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box sx={{ textAlign: "center", marginTop: "16px" }}>
              <Button variant="contained" onClick={handleAddRow}>
                Add Data
              </Button>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "8px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSaveChanges}
            sx={{
              textTransform: "none",
              padding: "4px 8px",
              fontSize: "0.8rem",
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Popover>
    </div>
  );
};

export default ChartComponent;
