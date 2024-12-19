import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import {
  Popover,
  Paper,
  Box,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ChartComponent = ({ factorData, onClose, onSave }) => {
  const canvasRef = useRef(null); // Ref for the canvas element
  const chartInstanceRef = useRef(null); // Ref to store the Chart.js instance

  useEffect(() => {
    // Cleanup any existing chart instance before creating a new one
    // if (chartInstanceRef.current) {
    //   chartInstanceRef.current.destroy();
    // }

    // Extract data for the chart
    const years = factorData.map((item) => item.year);
    const values = factorData.map((item) => item.normalized_value);

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
      },
    };

    chartInstanceRef.current = new Chart(canvasRef.current, chartConfig);
    console.log(chartInstanceRef.current);

    // Cleanup function to destroy the chart when component unmounts or updates
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [factorData, chartInstanceRef.current]); // Re-run effect when factorData changes

  // return (
  //   <div style={{ width: "100%", height: "400px" }}>
  //     <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
  //   </div>
  // );
  const handleSaveChanges = () => {
    // Extract updated data from the chart
    const updatedValues = chartInstanceRef.current.data.datasets[0].data;

    // Map updated values back to factorData structure
    const updatedFactorData = factorData.map((item, index) => ({
      ...item,
      normalized_value: updatedValues[index],
    }));
    console.log("Inside handleSave");
    console.log("Updated factorData is: ", updatedFactorData);

    // Call onSave callback to update parent state
    onSave(updatedFactorData);
  };

  return (
    <div>
      <Popover
        open={true}
        anchorEl={chartInstanceRef.current}
        // onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        // onMouseDown={handleMouseDown}
        sx={{
          position: "fixed",
          // left: "30%",
          // top: "-50%",
          zIndex: 1400,
          cursor: "move",
          width: `500px`,
          height: `500px`,
        }}
      >
        <Paper
          sx={{
            width: "400px",
            height: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              flexGrow: 1,
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
            <canvas ref={canvasRef} width="400" height="300" />
          </Box>
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
                textTransform: "none", // Disable all-caps
                padding: "4px 8px", // Adjust padding for a smaller button
                fontSize: "0.8rem", // Reduce font size
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      </Popover>
    </div>
  );
};

export default ChartComponent;
