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
  const [data, setData] = useState([]); // Historical data (1993–2024)
  const [futureData, setFutureData] = useState([]); // Future data (2025–2035)
  const [dialogSize, setDialogSize] = useState({ width: 600, height: 500 });
  const chartRef = useRef(null);

  // Load saved data and split into historical and future datasets
  useEffect(() => {
    if (factorData && factorData.length > 0) {
      const historicalData = factorData.filter((item) => item.year <= 2024);
      const futureData = factorData.filter((item) => item.year >= 2025);

      setData(historicalData);
      setFutureData(futureData);
    }
  }, [factorData]);

  // Generate future data only if it doesn't already exist
  useEffect(() => {
    if (data.length > 0 && futureData.length === 0) {
      const hasFutureData = factorData.some((item) => item.year >= 2025);

      if (!hasFutureData) {
        const lastYear = data[data.length - 1].year;
        const lastValue = data[data.length - 1].normalized_value;

        const newFutureData = [];
        for (let year = 2025; year <= 2035; year++) {
          newFutureData.push({
            year,
            normalized_value: lastValue, // Use last value as a placeholder
          });
        }
        setFutureData(newFutureData);
      }
    }
  }, [data, futureData, factorData]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle input change for table view
  const handleInputChange = (index, field, value, isFutureData = false) => {
    const updatedData = isFutureData ? [...futureData] : [...data];
    let newValue = field === "normalized_value" ? parseFloat(value) : value;

    // Ensure normalized_value is within -1 to 1
    if (field === "normalized_value" && (newValue < -1 || newValue > 1)) {
      newValue = Math.max(-1, Math.min(1, newValue));
    }

    updatedData[index][field] = newValue;

    if (isFutureData) {
      setFutureData(updatedData);
    } else {
      setData(updatedData);
    }
  };

  // Add a new row of data
  const handleAddRow = () => {
    const lastYear =
      futureData.length > 0 ? futureData[futureData.length - 1].year : 2035;
    setFutureData([
      ...futureData,
      { year: lastYear + 1, normalized_value: 0 }, // Increment the year
    ]);
  };

  // Delete a row of data
  const handleDeleteRow = (index, isFutureData = false) => {
    if (isFutureData) {
      const updatedData = futureData.filter((_, i) => i !== index);
      setFutureData(updatedData);
    } else {
      const updatedData = data.filter((_, i) => i !== index);
      setData(updatedData);
    }
  };

  // Save changes for Graph view
  const handleSaveGraphChanges = () => {
    if (!chartRef.current) {
      console.error("Chart reference is not available.");
      return;
    }

    // Extract updated data from the chart
    const updatedValues = chartRef.current.data.datasets[0].data;
    const updatedFutureValues = chartRef.current.data.datasets[1].data.slice(
      data.length
    );

    // Map updated values back to factorData structure
    const updatedFactorData = data.map((item, index) => ({
      ...item,
      normalized_value: updatedValues[index],
    }));

    const updatedFutureFactorData = futureData.map((item, index) => ({
      ...item,
      normalized_value: updatedFutureValues[index],
    }));

    // Combine historical and future data
    const combinedData = [...updatedFactorData, ...updatedFutureFactorData];

    console.log("Saving Graph changes:", combinedData);

    // Call onSave callback to update parent state
    onSave(combinedData);

    // Close the dialog
    onClose();
  };

  const handleSaveTableChanges = () => {
    // Combine historical and future data
    const combinedData = [...data, ...futureData];

    console.log("Saving Table changes:", combinedData);

    // Call onSave callback to update parent state
    onSave(combinedData);

    // Close the dialog
    onClose();
  };

  // Re-render the chart when data changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update(); // Force the chart to update
    }
  }, [data, futureData]);

  // Chart data
  const chartData = useMemo(
    () => ({
      labels: [
        ...data.map((item) => item.year),
        ...futureData.map((item) => item.year),
      ], // Labels for all years (1993–2035)
      datasets: [
        {
          label: "Historical Data (1993–2024)",
          data: [
            ...data.map((item) => item.normalized_value),
            ...Array(futureData.length).fill(null), // Fill future years with null
          ],
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
        {
          label: "Future Data (2025–2035)",
          data: [
            ...Array(data.length).fill(null), // Fill historical years with null
            ...futureData.map((item) => item.normalized_value),
          ],
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    }),
    [data, futureData]
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
        <DialogContent style={{ height: "calc(100% - 96px)" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Graph View" />
            <Tab label="Table View" />
          </Tabs>
          {tabValue === 0 && (
            <div style={{ height: "calc(100% - 96px)", marginTop: 16 }}>
              <Line
                ref={chartRef} // Ensure the ref is correctly assigned
                key={JSON.stringify([...data, ...futureData])} // Force re-render when data changes
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
              {/* Historical Data */}
              {data.map((item, index) => (
                <Grid item xs={4} key={`historical-${index}`}>
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
              {/* Future Data */}
              {futureData.map((item, index) => (
                <Grid item xs={4} key={`future-${index}`}>
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
                          e.target.value,
                          true
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
                    <IconButton onClick={() => handleDeleteRow(index, true)}>
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
                  Add Future Data
                </Button>
              </Grid>
            </Grid>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={
              tabValue === 0 ? handleSaveGraphChanges : handleSaveTableChanges
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
