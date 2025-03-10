// // import React, { useState, useMemo, useEffect, useRef } from "react";
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
// // import { Line } from "react-chartjs-2";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogTitle,
// //   Tabs,
// //   Tab,
// //   TextField,
// //   Button,
// //   IconButton,
// //   Paper,
// //   Grid,
// // } from "@mui/material";
// // import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
// // import { ResizableBox } from "react-resizable";
// // import "react-resizable/css/styles.css"; // Import the resizable styles

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

// // const ResizableChartComponent = ({
// //   factorData,
// //   factorName,
// //   onClose,
// //   onSave,
// // }) => {
// //   const [tabValue, setTabValue] = useState(0); // 0 for graph, 1 for table
// //   const [data, setData] = useState(factorData || []);
// //   const [dialogSize, setDialogSize] = useState({ width: 600, height: 500 });
// //   const chartRef = useRef(null);

// //   // Handle tab change
// //   const handleTabChange = (event, newValue) => {
// //     setTabValue(newValue);
// //   };

// //   useEffect(() => {
// //     if (chartRef.current) {
// //       chartRef.current.update(); // Force the chart to update
// //     }
// //   }, [data]);

// //   // Handle input change for table view
// //   const handleInputChange = (index, field, value) => {
// //     const updatedData = [...data];
// //     updatedData[index][field] =
// //       field === "normalized_value" ? parseFloat(value) : value;
// //     setData(updatedData);
// //   };

// //   // Add a new row of data
// //   const handleAddRow = () => {
// //     setData([
// //       ...data,
// //       { year: new Date().getFullYear(), normalized_value: 0 }, // Default values for new row
// //     ]);
// //   };

// //   // Delete a row of data
// //   const handleDeleteRow = (index) => {
// //     const updatedData = data.filter((_, i) => i !== index);
// //     setData(updatedData);
// //   };

// //   // Save changes
// //   // const handleSaveChanges = () => {
// //   //   // Extract updated data from the chart
// //   //   const updatedValues = chartRef.current.data.datasets[0].data;

// //   //   // Map updated values back to factorData structure
// //   //   const updatedFactorData = data.map((item, index) => ({
// //   //     ...item,
// //   //     normalized_value: updatedValues[index],
// //   //   }));

// //   //   console.log("Inside handleSave");
// //   //   console.log("Updated factorData is: ", updatedFactorData);

// //   //   // Call onSave callback to update parent state
// //   //   onSave(updatedFactorData);
// //   // };

// //   const handleSaveChanges = () => {
// //     if (!chartRef.current) {
// //       console.error("Chart reference is not available.");
// //       return;
// //     }

// //     // Extract updated data from the chart
// //     const updatedValues = chartRef.current.data.datasets[0].data;

// //     // Map updated values back to factorData structure
// //     const updatedFactorData = data.map((item, index) => ({
// //       ...item,
// //       normalized_value: updatedValues[index],
// //     }));

// //     console.log("Inside handleSave");
// //     console.log("Updated factorData is: ", updatedFactorData);

// //     // Call onSave callback to update parent state
// //     onSave(updatedFactorData);
// //   };

// //   // Re-render the chart when data changes
// //   useEffect(() => {
// //     if (chartRef.current) {
// //       chartRef.current.update(); // Force the chart to update
// //     }
// //   }, [data]);

// //   // Chart data
// //   const chartData = useMemo(
// //     () => ({
// //       labels: data.map((item) => item.year),
// //       datasets: [
// //         {
// //           label: "Normalized Value",
// //           data: data.map((item) => item.normalized_value),
// //           borderColor: "rgba(75, 192, 192, 1)",
// //           backgroundColor: "rgba(75, 192, 192, 0.2)",
// //           fill: true,
// //           pointRadius: 5,
// //           pointHoverRadius: 8,
// //         },
// //       ],
// //     }),
// //     [data]
// //   );

// //   // Handle dialog resize
// //   const onResize = (event, { size }) => {
// //     setDialogSize({ width: size.width, height: size.height });
// //   };

// //   return (
// //     <Dialog
// //       open
// //       onClose={onClose}
// //       maxWidth="md"
// //       fullWidth
// //       PaperProps={{
// //         style: {
// //           width: dialogSize.width,
// //           height: dialogSize.height,
// //           overflow: "hidden",
// //         },
// //       }}
// //     >
// //       <ResizableBox
// //         width={dialogSize.width}
// //         height={dialogSize.height}
// //         onResize={onResize}
// //         minConstraints={[400, 400]} // Minimum size
// //         maxConstraints={[800, 800]} // Maximum size
// //       >
// //         <DialogTitle>
// //           {factorName}
// //           <IconButton
// //             onClick={onClose}
// //             style={{ position: "absolute", right: 8, top: 8 }}
// //           >
// //             <CloseIcon />
// //           </IconButton>
// //         </DialogTitle>
// //         <DialogContent style={{ height: "calc(100% - 96px)", padding: 16 }}>
// //           <Tabs value={tabValue} onChange={handleTabChange}>
// //             <Tab label="Graph View" />
// //             <Tab label="Table View" />
// //           </Tabs>
// //           {tabValue === 0 && (
// //             <div style={{ height: "calc(100% - 96px)", marginTop: 16 }}>
// //               <Line
// //                 ref={chartRef} // Ensure the ref is correctly assigned
// //                 key={JSON.stringify(data)} // Force re-render when data changes
// //                 data={chartData}
// //                 options={{
// //                   maintainAspectRatio: false,
// //                   responsive: true,
// //                   interaction: {
// //                     mode: "nearest",
// //                     intersect: false,
// //                   },
// //                   scales: {
// //                     y: {
// //                       min: -1, // Set the minimum value of the y-axis
// //                       max: 1, // Set the maximum value of the y-axis
// //                     },
// //                   },
// //                 }}
// //               />
// //             </div>
// //           )}
// //           {tabValue === 1 && (
// //             <Grid container spacing={2} style={{ marginTop: 16 }}>
// //               {data.map((item, index) => (
// //                 <Grid item xs={4} key={index}>
// //                   <Paper
// //                     style={{
// //                       padding: 16,
// //                       display: "flex",
// //                       alignItems: "center",
// //                     }}
// //                   >
// //                     <span
// //                       style={{
// //                         marginRight: 8,
// //                         fontSize: "14px",
// //                         marginBottom: 4,
// //                       }}
// //                     >
// //                       {item.year}
// //                     </span>
// //                     <TextField
// //                       type="number"
// //                       value={item.normalized_value}
// //                       onChange={(e) =>
// //                         handleInputChange(
// //                           index,
// //                           "normalized_value",
// //                           e.target.value
// //                         )
// //                       }
// //                       variant="standard"
// //                       fullWidth
// //                       InputProps={{ disableUnderline: true }} // Remove the double border
// //                       style={{ marginRight: 8 }}
// //                     />
// //                     <IconButton onClick={() => handleDeleteRow(index)}>
// //                       <CloseIcon />
// //                     </IconButton>
// //                   </Paper>
// //                 </Grid>
// //               ))}
// //               <Grid item xs={12}>
// //                 <Button
// //                   onClick={handleAddRow}
// //                   startIcon={<AddIcon />}
// //                   style={{ marginTop: 16 }}
// //                 >
// //                   Add Data
// //                 </Button>
// //               </Grid>
// //             </Grid>
// //           )}
// //           <Button
// //             variant="contained"
// //             color="primary"
// //             onClick={handleSaveChanges}
// //             style={{ marginTop: 16 }}
// //           >
// //             Save Changes
// //           </Button>
// //         </DialogContent>
// //       </ResizableBox>
// //     </Dialog>
// //   );
// // };

// // export default ResizableChartComponent;

// import React, { useState, useMemo, useEffect, useRef } from "react";
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
// import { Line } from "react-chartjs-2";
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   Tabs,
//   Tab,
//   TextField,
//   Button,
//   IconButton,
//   Paper,
//   Grid,
// } from "@mui/material";
// import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
// import { ResizableBox } from "react-resizable";
// import "react-resizable/css/styles.css"; // Import the resizable styles

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

// const ResizableChartComponent = ({
//   factorData,
//   factorName,
//   onClose,
//   onSave,
// }) => {
//   const [tabValue, setTabValue] = useState(0); // 0 for graph, 1 for table
//   const [data, setData] = useState(factorData || []);
//   const [dialogSize, setDialogSize] = useState({ width: 600, height: 500 });
//   const chartRef = useRef(null);

//   // Handle tab change
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   useEffect(() => {
//     if (chartRef.current) {
//       chartRef.current.update(); // Force the chart to update
//     }
//   }, [data]);

//   // Handle input change for table view
//   const handleInputChange = (index, field, value) => {
//     const updatedData = [...data];
//     let newValue = field === "normalized_value" ? parseFloat(value) : value;

//     // Ensure normalized_value is within -1 to 1
//     if (field === "normalized_value" && (newValue < -1 || newValue > 1)) {
//       newValue = Math.max(-1, Math.min(1, newValue));
//     }

//     updatedData[index][field] = newValue;
//     setData(updatedData);
//   };

//   // Add a new row of data
//   const handleAddRow = () => {
//     const lastYear = data.length > 0 ? data[data.length - 1].year : 2024;
//     setData([
//       ...data,
//       { year: lastYear + 1, normalized_value: 0 }, // Increment the year
//     ]);
//   };

//   // Delete a row of data
//   const handleDeleteRow = (index) => {
//     const updatedData = data.filter((_, i) => i !== index);
//     setData(updatedData);
//   };

//   // Save changes
//   const handleSaveChanges = () => {
//     if (!chartRef.current) {
//       console.error("Chart reference is not available.");
//       return;
//     }

//     // Extract updated data from the chart
//     const updatedValues = chartRef.current.data.datasets[0].data;

//     // Map updated values back to factorData structure
//     const updatedFactorData = data.map((item, index) => ({
//       ...item,
//       normalized_value: updatedValues[index],
//     }));

//     console.log("Inside handleSave");
//     console.log("Updated factorData is: ", updatedFactorData);

//     // Call onSave callback to update parent state
//     onSave(updatedFactorData);

//     // Close the dialog
//     onClose();
//   };

//   // Re-render the chart when data changes
//   useEffect(() => {
//     if (chartRef.current) {
//       chartRef.current.update(); // Force the chart to update
//     }
//   }, [data]);

//   // Chart data
//   const chartData = useMemo(
//     () => ({
//       labels: data.map((item) => item.year),
//       datasets: [
//         {
//           label: "Normalized Value",
//           data: data.map((item) => item.normalized_value),
//           borderColor: "rgba(75, 192, 192, 1)",
//           backgroundColor: "rgba(75, 192, 192, 0.2)",
//           fill: true,
//           pointRadius: 5,
//           pointHoverRadius: 8,
//         },
//       ],
//     }),
//     [data]
//   );

//   // Handle dialog resize
//   const onResize = (event, { size }) => {
//     setDialogSize({ width: size.width, height: size.height });
//   };

//   return (
//     <Dialog
//       open
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         style: {
//           width: dialogSize.width,
//           height: dialogSize.height,
//           overflow: "hidden",
//         },
//       }}
//     >
//       <ResizableBox
//         width={dialogSize.width}
//         height={dialogSize.height}
//         onResize={onResize}
//         minConstraints={[400, 400]} // Minimum size
//         maxConstraints={[800, 800]} // Maximum size
//       >
//         <DialogTitle>
//           {factorName}
//           <IconButton
//             onClick={onClose}
//             style={{ position: "absolute", right: 8, top: 8 }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent style={{ height: "calc(100% - 96px)", padding: 16 }}>
//           <Tabs value={tabValue} onChange={handleTabChange}>
//             <Tab label="Graph View" />
//             <Tab label="Table View" />
//           </Tabs>
//           {tabValue === 0 && (
//             <div style={{ height: "calc(100% - 96px)", marginTop: 16 }}>
//               <Line
//                 ref={chartRef} // Ensure the ref is correctly assigned
//                 key={JSON.stringify(data)} // Force re-render when data changes
//                 data={chartData}
//                 options={{
//                   maintainAspectRatio: false,
//                   responsive: true,
//                   interaction: {
//                     mode: "nearest",
//                     intersect: false,
//                   },
//                   scales: {
//                     y: {
//                       min: -1, // Set the minimum value of the y-axis
//                       max: 1, // Set the maximum value of the y-axis
//                     },
//                   },
//                 }}
//               />
//             </div>
//           )}
//           {tabValue === 1 && (
//             <Grid container spacing={2} style={{ marginTop: 16 }}>
//               {data.map((item, index) => (
//                 <Grid item xs={4} key={index}>
//                   <Paper
//                     style={{
//                       padding: 16,
//                       display: "flex",
//                       alignItems: "center",
//                     }}
//                   >
//                     <span
//                       style={{
//                         marginRight: 8,
//                         fontSize: "14px",
//                         marginBottom: 4,
//                       }}
//                     >
//                       {item.year}
//                     </span>
//                     <TextField
//                       type="number"
//                       value={item.normalized_value}
//                       onChange={(e) =>
//                         handleInputChange(
//                           index,
//                           "normalized_value",
//                           e.target.value
//                         )
//                       }
//                       variant="standard"
//                       fullWidth
//                       InputProps={{ disableUnderline: true }} // Remove the double border
//                       style={{ marginRight: 8 }}
//                       inputProps={{
//                         min: -1,
//                         max: 1,
//                         step: 0.01,
//                       }}
//                     />
//                     <IconButton onClick={() => handleDeleteRow(index)}>
//                       <CloseIcon />
//                     </IconButton>
//                   </Paper>
//                 </Grid>
//               ))}
//               <Grid item xs={12}>
//                 <Button
//                   onClick={handleAddRow}
//                   startIcon={<AddIcon />}
//                   style={{ marginTop: 16 }}
//                 >
//                   Add Data
//                 </Button>
//               </Grid>
//             </Grid>
//           )}
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleSaveChanges}
//             style={{ marginTop: 16 }}
//           >
//             Save Changes
//           </Button>
//         </DialogContent>
//       </ResizableBox>
//     </Dialog>
//   );
// };

// export default ResizableChartComponent;

import React, { useState, useMemo, useEffect, useRef } from "react";
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
import { Line } from "react-chartjs-2";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Paper,
  Grid,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css"; // Import the resizable styles

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

const ResizableChartComponent = ({
  factorData,
  factorName,
  onClose,
  onSave,
}) => {
  const [tabValue, setTabValue] = useState(0); // 0 for graph, 1 for table
  const [data, setData] = useState(factorData || []);
  const [dialogSize, setDialogSize] = useState({ width: 600, height: 500 });
  const chartRef = useRef(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update(); // Force the chart to update
    }
  }, [data]);

  // Handle input change for table view
  const handleInputChange = (index, field, value) => {
    const updatedData = [...data];
    let newValue = field === "normalized_value" ? parseFloat(value) : value;

    // Ensure normalized_value is within -1 to 1
    if (field === "normalized_value" && (newValue < -1 || newValue > 1)) {
      newValue = Math.max(-1, Math.min(1, newValue));
    }

    updatedData[index][field] = newValue;
    setData(updatedData);
  };

  // Add a new row of data
  const handleAddRow = () => {
    const lastYear = data.length > 0 ? data[data.length - 1].year : 2024;
    setData([
      ...data,
      { year: lastYear + 1, normalized_value: 0 }, // Increment the year
    ]);
  };

  // Delete a row of data
  const handleDeleteRow = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  // Save changes
  const handleSaveChanges = () => {
    // Use the current state of `data` directly
    const updatedFactorData = data.map((item) => ({
      ...item,
      normalized_value: item.normalized_value,
    }));

    console.log("Inside handleSave");
    console.log("Updated factorData is: ", updatedFactorData);

    // Call onSave callback to update parent state
    onSave(updatedFactorData);

    // Close the dialog
    onClose();
  };

  // Re-render the chart when data changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update(); // Force the chart to update
    }
  }, [data]);

  // Chart data
  const chartData = useMemo(
    () => ({
      labels: data.map((item) => item.year),
      datasets: [
        {
          label: "Normalized Value",
          data: data.map((item) => item.normalized_value),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    }),
    [data]
  );

  // Handle dialog resize
  const onResize = (event, { size }) => {
    setDialogSize({ width: size.width, height: size.height });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          width: dialogSize.width,
          height: dialogSize.height,
          overflow: "hidden",
        },
      }}
    >
      <ResizableBox
        width={dialogSize.width}
        height={dialogSize.height}
        onResize={onResize}
        minConstraints={[400, 400]} // Minimum size
        maxConstraints={[800, 800]} // Maximum size
      >
        <DialogTitle>
          {factorName}
          <IconButton
            onClick={onClose}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ height: "calc(100% - 96px)", padding: 16 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Graph View" />
            <Tab label="Table View" />
          </Tabs>
          {tabValue === 0 && (
            <div style={{ height: "calc(100% - 96px)", marginTop: 16 }}>
              <Line
                ref={chartRef} // Ensure the ref is correctly assigned
                key={JSON.stringify(data)} // Force re-render when data changes
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  interaction: {
                    mode: "nearest",
                    intersect: false,
                  },
                  scales: {
                    y: {
                      min: -1, // Set the minimum value of the y-axis
                      max: 1, // Set the maximum value of the y-axis
                    },
                  },
                }}
              />
            </div>
          )}
          {tabValue === 1 && (
            <Grid container spacing={2} style={{ marginTop: 16 }}>
              {data.map((item, index) => (
                <Grid item xs={4} key={index}>
                  <Paper
                    style={{
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        marginRight: 8,
                        fontSize: "14px",
                        marginBottom: 4,
                      }}
                    >
                      {item.year}
                    </span>
                    <TextField
                      type="number"
                      value={item.normalized_value}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "normalized_value",
                          e.target.value
                        )
                      }
                      variant="standard"
                      fullWidth
                      InputProps={{ disableUnderline: true }} // Remove the double border
                      style={{ marginRight: 8 }}
                      inputProps={{
                        min: -1,
                        max: 1,
                        step: 0.01,
                      }}
                    />
                    <IconButton onClick={() => handleDeleteRow(index)}>
                      <CloseIcon />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  onClick={handleAddRow}
                  startIcon={<AddIcon />}
                  style={{ marginTop: 16 }}
                >
                  Add Data
                </Button>
              </Grid>
            </Grid>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            style={{ marginTop: 16 }}
          >
            Save Changes
          </Button>
        </DialogContent>
      </ResizableBox>
    </Dialog>
  );
};

export default ResizableChartComponent;
