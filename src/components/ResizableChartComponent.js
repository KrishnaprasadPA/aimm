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
//   predictionSeries = [],
//   onClose,
//   onSave,
// }) => {
//   const [tabValue, setTabValue] = useState(0); // 0 for graph, 1 for table
//   const [data, setData] = useState([]); // Historical data (1993–2024)
//   const [futureData, setFutureData] = useState([]); // Future data (2025–2035)
//   const [dialogSize, setDialogSize] = useState({ width: 600, height: 500 });
//   const chartRef = useRef(null);

//   // Load saved data and split into historical and future datasets
//   useEffect(() => {
//     if (factorData && factorData.length > 0) {
//       const historicalData = factorData.filter((item) => item.year <= 2024);
//       const futureData = factorData.filter((item) => item.year >= 2025);

//       setData(historicalData);
//       setFutureData(futureData);
//     }
//   }, [factorData]);

//   // Generate future data only if it doesn't already exist
//   useEffect(() => {
//     if (data.length > 0 && futureData.length === 0) {
//       const hasFutureData = factorData.some((item) => item.year >= 2025);

//       // if (!hasFutureData) {
//       //   const lastYear = data[data.length - 1].year;
//       //   const lastValue = data[data.length - 1].normalized_value;

//       //   const newFutureData = [];
//       //   for (let year = 2025; year <= 2035; year++) {
//       //     newFutureData.push({
//       //       year,
//       //       normalized_value: lastValue, // Use last value as a placeholder
//       //     });
//       //   }
//       //   setFutureData(newFutureData);
//       // }
//       if (!hasFutureData) {
//         const historicalYears = data.map((d) => d.year);
//         const historicalValues = data.map((d) => d.normalized_value);

//         // Use last 5 years for trend
//         const recentData = historicalYears
//           .map((year, i) => ({ x: year, y: historicalValues[i] }))
//           .slice(-5);

//         // Calculate simple linear slope
//         const n = recentData.length;
//         const avgX = recentData.reduce((sum, p) => sum + p.x, 0) / n;
//         const avgY = recentData.reduce((sum, p) => sum + p.y, 0) / n;
//         const numerator = recentData.reduce(
//           (sum, p) => sum + (p.x - avgX) * (p.y - avgY),
//           0
//         );
//         const denominator = recentData.reduce(
//           (sum, p) => sum + (p.x - avgX) ** 2,
//           0
//         );
//         const slope = denominator !== 0 ? numerator / denominator : 0;
//         const intercept = avgY - slope * avgX;

//         const newFutureData = [];
//         for (let year = 2025; year <= 2035; year++) {
//           const value = intercept + slope * year;
//           newFutureData.push({
//             year,
//             normalized_value: parseFloat(
//               Math.max(-2, Math.min(2, value.toFixed(2)))
//             ), // Clamp between -2 and 2
//           });
//         }

//         setFutureData(newFutureData);
//       }
//     }
//   }, [data, futureData, factorData]);

//   // Handle tab change
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   // Handle input change for table view
//   const handleInputChange = (index, field, value, isFutureData = false) => {
//     const updatedData = isFutureData ? [...futureData] : [...data];
//     let newValue = field === "normalized_value" ? parseFloat(value) : value;

//     // Ensure normalized_value is within -1 to 1
//     if (field === "normalized_value" && (newValue < -1 || newValue > 1)) {
//       newValue = Math.max(-1, Math.min(1, newValue));
//     }

//     updatedData[index][field] = newValue;

//     if (isFutureData) {
//       setFutureData(updatedData);
//     } else {
//       setData(updatedData);
//     }
//   };

//   // Add a new row of data
//   const handleAddRow = () => {
//     const lastYear =
//       futureData.length > 0 ? futureData[futureData.length - 1].year : 2035;
//     setFutureData([
//       ...futureData,
//       { year: lastYear + 1, normalized_value: 0 }, // Increment the year
//     ]);
//   };

//   // Delete a row of data
//   const handleDeleteRow = (index, isFutureData = false) => {
//     if (isFutureData) {
//       const updatedData = futureData.filter((_, i) => i !== index);
//       setFutureData(updatedData);
//     } else {
//       const updatedData = data.filter((_, i) => i !== index);
//       setData(updatedData);
//     }
//   };

//   // Save changes for Graph view
//   const handleSaveGraphChanges = () => {
//     if (!chartRef.current) {
//       console.error("Chart reference is not available.");
//       return;
//     }

//     // Extract updated data from the chart
//     const updatedValues = chartRef.current.data.datasets[0].data;
//     const updatedFutureValues = chartRef.current.data.datasets[1].data.slice(
//       data.length
//     );

//     // Map updated values back to factorData structure
//     const updatedFactorData = data.map((item, index) => ({
//       ...item,
//       normalized_value: updatedValues[index],
//     }));

//     const updatedFutureFactorData = futureData.map((item, index) => ({
//       ...item,
//       normalized_value: updatedFutureValues[index],
//     }));

//     // Combine historical and future data
//     const combinedData = [...updatedFactorData, ...updatedFutureFactorData];

//     console.log("Saving Graph changes:", combinedData);

//     // Call onSave callback to update parent state
//     onSave(combinedData);

//     // Close the dialog
//     onClose();
//   };

//   const handleSaveTableChanges = () => {
//     // Combine historical and future data
//     const combinedData = [...data, ...futureData];

//     console.log("Saving Table changes:", combinedData);

//     // Call onSave callback to update parent state
//     onSave(combinedData);

//     // Close the dialog
//     onClose();
//   };

//   // Re-render the chart when data changes
//   useEffect(() => {
//     if (chartRef.current) {
//       chartRef.current.update(); // Force the chart to update
//     }
//   }, [data, futureData, predictionSeries]);

//   // Chart data
//   // const chartData = useMemo(
//   //   () => ({
//   //     labels: [
//   //       ...data.map((item) => item.year),
//   //       ...futureData.map((item) => item.year),
//   //     ], // Labels for all years (1993–2035)
//   //     datasets: [
//   //       {
//   //         label: "Historical Data (1993–2024)",
//   //         data: [
//   //           ...data.map((item) => item.normalized_value),
//   //           ...Array(futureData.length).fill(null), // Fill future years with null
//   //         ],
//   //         borderColor: "rgba(75, 192, 192, 1)",
//   //         backgroundColor: "rgba(75, 192, 192, 0.2)",
//   //         fill: true,
//   //         pointRadius: 5,
//   //         pointHoverRadius: 8,
//   //       },
//   //       {
//   //         label: "Future Data (2025–2035)",
//   //         data: [
//   //           ...Array(data.length).fill(null), // Fill historical years with null
//   //           ...futureData.map((item) => item.normalized_value),
//   //         ],
//   //         borderColor: "rgba(255, 99, 132, 1)",
//   //         backgroundColor: "rgba(255, 99, 132, 0.2)",
//   //         fill: true,
//   //         pointRadius: 5,
//   //         pointHoverRadius: 8,
//   //       },
//   //       {
//   //         label: "Forecasted Values (1993–2035)", // <-- LSTM
//   //         data: predictionSeries.map((item) => item.normalized_value),
//   //         borderColor: "rgba(153, 102, 255, 1)",
//   //         backgroundColor: "rgba(153, 102, 255, 0.2)",
//   //         borderDash: [5, 5],
//   //         fill: false,
//   //         pointRadius: 3,
//   //         pointHoverRadius: 6,
//   //       },
//   //     ],
//   //   }),
//   //   [data, futureData, predictionSeries]
//   // );
//   const chartData = useMemo(() => {
//     const allYears = Array.from(
//       { length: 2035 - 1993 + 1 },
//       (_, i) => 1993 + i
//     );

//     const getYearMap = (arr) => {
//       const map = {};
//       arr.forEach((item) => {
//         map[item.year] = item.normalized_value;
//       });
//       return map;
//     };

//     const historicalMap = getYearMap(data); // 1993–2024
//     const futureMap = getYearMap(futureData); // 2025–2035
//     const predictionMap = getYearMap(predictionSeries); // 1993–2035

//     // return {
//     //   labels: allYears,
//     //   datasets: [
//     //     {
//     //       label: "Historical Data (1993–2024)",
//     //       data: allYears.map((year) => historicalMap[year] ?? null),
//     //       borderColor: "rgba(75, 192, 192, 1)",
//     //       backgroundColor: "rgba(75, 192, 192, 0.2)",
//     //       fill: true,
//     //       pointRadius: 4,
//     //       pointHoverRadius: 6,
//     //     },
//     //     {
//     //       label: "User Future Data (2025–2035)",
//     //       data: allYears.map((year) => futureMap[year] ?? null),
//     //       borderColor: "rgba(255, 99, 132, 1)",
//     //       backgroundColor: "rgba(255, 99, 132, 0.2)",
//     //       fill: true,
//     //       pointRadius: 4,
//     //       pointHoverRadius: 6,
//     //     },
//     //     {
//     //       label: "Model Predictions (1993–2035)",
//     //       data: allYears.map((year) => predictionMap[year] ?? null),
//     //       borderColor: "rgba(54, 162, 235, 1)",
//     //       backgroundColor: "rgba(54, 162, 235, 0.2)",
//     //       borderDash: [6, 4],
//     //       fill: false,
//     //       pointRadius: 3,
//     //       pointHoverRadius: 5,
//     //     },
//     //   ],
//     // };
//     return {
//       labels: allYears,
//       datasets: [
//         {
//           label: "Historical Data (1993–2024)",
//           data: allYears.map((year) => historicalMap[year] ?? null),
//           borderColor: "#2ca02c", // Blue
//           backgroundColor: "transparent",
//           fill: false,
//           borderWidth: 1.5,
//           pointBackgroundColor: "#2ca02c", // Opaque data points
//           pointRadius: 3,
//           pointHoverRadius: 5,
//         },
//         {
//           label: "User Future Data (2025–2035)",
//           data: allYears.map((year) => futureMap[year] ?? null),
//           borderColor: "#d62728", // Red
//           backgroundColor: "transparent",
//           fill: false,
//           borderWidth: 1.5,
//           pointBackgroundColor: "#d62728", // Opaque data points
//           pointRadius: 3,
//           pointHoverRadius: 5,
//         },
//         {
//           label: "Model Predictions (1993–2035)",
//           data: allYears.map((year) => predictionMap[year] ?? null),
//           borderColor: "#1f77b4", // Green
//           backgroundColor: "transparent",
//           borderDash: [5, 4],
//           fill: false,
//           borderWidth: 1.5,
//           pointBackgroundColor: "#1f77b4", // Opaque data points
//           pointRadius: 3,
//           pointHoverRadius: 5,
//         },
//       ],
//     };
//   }, [data, futureData, predictionSeries]);

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
//         <DialogContent style={{ height: "calc(100% - 96px)" }}>
//           <Tabs value={tabValue} onChange={handleTabChange}>
//             <Tab label="Graph View" />
//             <Tab label="Table View" />
//           </Tabs>
//           {tabValue === 0 && (
//             <div style={{ height: "calc(100% - 96px)", marginTop: 16 }}>
//               <Line
//                 ref={chartRef} // Ensure the ref is correctly assigned
//                 key={JSON.stringify([...data, ...futureData])} // Force re-render when data changes
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
//                       min: -4, // Set the minimum value of the y-axis
//                       max: 4, // Set the maximum value of the y-axis
//                     },
//                   },
//                 }}
//               />
//             </div>
//           )}
//           {tabValue === 1 && (
//             <Grid container spacing={2} style={{ marginTop: 16 }}>
//               {/* Historical Data */}
//               {data.map((item, index) => (
//                 <Grid item xs={4} key={`historical-${index}`}>
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
//                     {/* <IconButton onClick={() => handleDeleteRow(index)}>
//                       <CloseIcon />
//                     </IconButton> */}
//                   </Paper>
//                 </Grid>
//               ))}
//               {/* Future Data */}
//               {futureData.map((item, index) => (
//                 <Grid item xs={4} key={`future-${index}`}>
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
//                           e.target.value,
//                           true
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
//                     {/* <IconButton onClick={() => handleDeleteRow(index, true)}>
//                       <CloseIcon />
//                     </IconButton> */}
//                   </Paper>
//                 </Grid>
//               ))}
//               <Grid item xs={12}>
//                 {/* <Button
//                   onClick={handleAddRow}
//                   startIcon={<AddIcon />}
//                   style={{ marginTop: 16 }}
//                 >
//                   Add Future Data
//                 </Button> */}
//               </Grid>
//             </Grid>
//           )}
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={
//               tabValue === 0 ? handleSaveGraphChanges : handleSaveTableChanges
//             }
//             style={{ marginTop: 16, marginBottom: 10 }}
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
import { Close as CloseIcon } from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

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
  factorUnit,
  predictionSeries = [],
  onClose,
  onSave,
}) => {
  const [tabValue, setTabValue] = useState(0); // 0: Original Graph, 1: Standardized Graph, 2: Table
  const [data, setData] = useState([]);
  const [futureData, setFutureData] = useState([]);
  const [dialogSize, setDialogSize] = useState({ width: 650, height: 650 });
  const chartRef = useRef(null);

  useEffect(() => {
    if (factorData && factorData.length > 0) {
      const historicalData = factorData.filter((item) => item.year <= 2024);
      const futureData = factorData.filter((item) => item.year >= 2025);
      setData(historicalData);
      setFutureData(futureData);
    }
  }, [factorData]);

  // useEffect(() => {
  //   if (data.length > 0 && futureData.length === 0) {
  //     const hasFutureData = factorData.some((item) => item.year >= 2025);
  //     if (!hasFutureData) {
  //       const recent = data.slice(-5);
  //       const slope =
  //         recent.length >= 2
  //           ? (recent[recent.length - 1].value - recent[0].value) /
  //             (recent[recent.length - 1].year - recent[0].year)
  //           : 0;
  //       const intercept = recent[recent.length - 1].value;

  //       const newFuture = [];
  //       for (let year = 2025; year <= 2035; year++) {
  //         const val = intercept + slope * (year - 2024);
  //         newFuture.push({
  //           year,
  //           value: parseFloat(val.toFixed(2)),
  //           normalized_value: 0, // placeholder
  //         });
  //       }
  //       setFutureData(newFuture);
  //     }
  //   }
  // }, [data, futureData, factorData]);
  useEffect(() => {
    if (data.length > 0 && futureData.length === 0) {
      const hasFutureData = factorData.some((item) => item.year >= 2025);
      if (!hasFutureData) {
        const recent = data.slice(-5);
        const last = recent[recent.length - 1];
        const safeSlope =
          recent.length >= 2
            ? (last.value - recent[0].value) /
              Math.max(1, last.year - recent[0].year)
            : 0;

        const maxYearlyChange = Math.abs(last.value) * 0.05; // max 5% change per year
        const boundedSlope = Math.max(
          -maxYearlyChange,
          Math.min(safeSlope, maxYearlyChange)
        );

        const newFuture = [];
        for (let year = 2025; year <= 2035; year++) {
          const offset = year - 2024;
          let val = last.value + boundedSlope * offset;
          val = Math.max(0, parseFloat(val.toFixed(2))); // Clamp to ≥ 0
          newFuture.push({
            year,
            value: val,
            normalized_value: 0, // Placeholder; will be updated on save
          });
        }
        setFutureData(newFuture);
      }
    }
  }, [data, futureData, factorData]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleInputChange = (index, field, value, isFuture = false) => {
    const updated = isFuture ? [...futureData] : [...data];
    updated[index][field] = parseFloat(value);
    if (isFuture) setFutureData(updated);
    else setData(updated);
  };

  const recalculateNormalizedValues = (allData) => {
    const values = allData.map((d) => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );
    return allData.map((item) => ({
      ...item,
      normalized_value:
        std === 0 ? 0 : parseFloat(((item.value - mean) / std).toFixed(3)),
    }));
  };

  const handleSaveGraphChanges = () => {
    if (!chartRef.current) {
      console.error("Chart reference is not available.");
      return;
    }

    const updatedValues = chartRef.current.data.datasets[0].data;
    const updatedFutureValues = chartRef.current.data.datasets[1].data.slice(
      data.length
    );

    const updatedFactorData = data.map((item, index) => ({
      ...item,
      value: updatedValues[index],
    }));

    const updatedFutureFactorData = futureData.map((item, index) => ({
      ...item,
      value: updatedFutureValues[index],
    }));

    const combined = [...updatedFactorData, ...updatedFutureFactorData];
    const normalizedCombined = recalculateNormalizedValues(combined);

    onSave(normalizedCombined);
    onClose();
  };

  const handleSaveTableChanges = () => {
    const combined = [...data, ...futureData];
    const normalizedCombined = recalculateNormalizedValues(combined);
    onSave(normalizedCombined);
    onClose();
  };

  const getChartData = (field) => {
    const allYears = Array.from(
      { length: 2035 - 1993 + 1 },
      (_, i) => 1993 + i
    );

    const toMap = (arr) => {
      const map = {};
      arr.forEach((item) => (map[item.year] = item[field]));
      return map;
    };

    const histMap = toMap(data);
    const futMap = toMap(futureData);
    const predMap = toMap(predictionSeries);

    return {
      labels: allYears,
      datasets: [
        {
          label: "Historical Data",
          data: allYears.map((y) => histMap[y] ?? null),
          borderColor: "#2ca02c",
          backgroundColor: "transparent",
          pointBackgroundColor: "#2ca02c",
          fill: false,
          borderWidth: 1.5,
          pointRadius: 3,
        },
        {
          label: "User Future Data",
          data: allYears.map((y) => futMap[y] ?? null),
          borderColor: "#d62728",
          backgroundColor: "transparent",
          pointBackgroundColor: "#d62728",
          fill: false,
          borderWidth: 1.5,
          pointRadius: 3,
        },
        {
          label: "Model Predictions",
          data: allYears.map((y) => predMap[y] ?? null),
          borderColor: "#1f77b4",
          backgroundColor: "transparent",
          pointBackgroundColor: "#1f77b4",
          borderDash: [5, 4],
          fill: false,
          borderWidth: 1.5,
          pointRadius: 3,
        },
      ],
    };
  };

  const getChartOptions = (field, editable) => ({
    maintainAspectRatio: false,
    responsive: true,
    interaction: { mode: "nearest", intersect: false },
    scales: {
      y: {
        min: field === "value" ? undefined : -4,
        max: field === "value" ? undefined : 4,
      },
    },
    plugins: {
      tooltip: { enabled: true },
    },
    animation: { duration: 0 },
  });

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
        minConstraints={[650, 650]}
        maxConstraints={[800, 800]}
      >
        {/* <DialogTitle>
          {factorName}
          <IconButton
            onClick={onClose}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle> */}
        <DialogTitle
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{factorName}</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            {factorUnit && (
              <span
                style={{ marginRight: 16, fontSize: "0.9rem", color: "#555" }}
              >
                Unit: {factorUnit}
              </span>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent style={{ height: "calc(100% - 96px)" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Original Values" />
            <Tab label="Standardized Values" />
            <Tab label="Table View" />
          </Tabs>

          {tabValue === 0 && (
            <div style={{ height: "calc(100% - 96px)", marginTop: 16 }}>
              <Line
                ref={chartRef}
                key="original-chart"
                data={getChartData("value")}
                options={getChartOptions("value", true)}
              />
            </div>
          )}
          {tabValue === 1 && (
            <div style={{ height: "calc(100% - 96px)", marginTop: 16 }}>
              <Line
                key="standardized-chart"
                data={getChartData("normalized_value")}
                options={getChartOptions("normalized_value", false)}
              />
            </div>
          )}
          {tabValue === 2 && (
            <Grid container spacing={2} style={{ marginTop: 16 }}>
              {[...data, ...futureData].map((item, idx) => (
                <Grid item xs={4} key={item.year}>
                  <Paper
                    style={{
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: 8, fontSize: "14px" }}>
                      {item.year}
                    </span>
                    <TextField
                      type="number"
                      value={item.value}
                      onChange={(e) =>
                        handleInputChange(
                          idx < data.length ? idx : idx - data.length,
                          "value",
                          e.target.value,
                          idx >= data.length
                        )
                      }
                      variant="standard"
                      fullWidth
                      InputProps={{ disableUnderline: true }}
                      inputProps={{ step: 0.01 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={
              tabValue === 2 ? handleSaveTableChanges : handleSaveGraphChanges
            }
            style={{ marginTop: 16, marginBottom: 10 }}
          >
            Save Changes
          </Button>
        </DialogContent>
      </ResizableBox>
    </Dialog>
  );
};

export default ResizableChartComponent;
