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

    const actualYears = [
      ...new Set([
        ...data.map((d) => d.year),
        ...futureData.map((d) => d.year),
        ...predictionSeries.map((d) => d.year),
      ]),
    ].sort((a, b) => a - b);

    const updatedHist = chartRef.current.data.datasets[0].data;
    const updatedFuture = chartRef.current.data.datasets[1].data;

    const histMap = {};
    const futureMap = {};

    actualYears.forEach((year, i) => {
      const histVal = updatedHist[i];
      const futureVal = updatedFuture[i];
      if (histVal !== null) histMap[year] = histVal;
      if (futureVal !== null) futureMap[year] = futureVal;
    });

    const updatedFactorData = data.map((item) => ({
      ...item,
      value:
        histMap[item.year] != null
          ? parseFloat(histMap[item.year])
          : item.value,
    }));

    const updatedFutureFactorData = futureData.map((item) => ({
      ...item,
      value:
        futureMap[item.year] != null
          ? parseFloat(futureMap[item.year])
          : item.value,
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
    const actualYears = [
      ...new Set([
        ...data.map((d) => d.year),
        ...futureData.map((d) => d.year),
        ...predictionSeries.map((d) => d.year),
      ]),
    ].sort((a, b) => a - b);

    const toMap = (arr) => {
      const map = {};
      arr.forEach((item) => (map[item.year] = item[field]));
      return map;
    };

    const histMap = toMap(data);
    const futMap = toMap(futureData);
    const predMap = toMap(predictionSeries);
    console.log("actualYears:", actualYears);
    console.log(
      "data years:",
      data.map((d) => d.year)
    );
    console.log(
      "futureData years:",
      futureData.map((d) => d.year)
    );
    console.log(
      "prediction years:",
      predictionSeries.map((d) => d.year)
    );

    return {
      labels: actualYears,
      datasets: [
        {
          label: "Historical Data",
          data: actualYears.map((y) => histMap[y] ?? null),
          borderColor: "#2ca02c",
          backgroundColor: "transparent",
          pointBackgroundColor: "#2ca02c",
          fill: false,
          borderWidth: 1.5,
          pointRadius: 3,
        },
        {
          label: "User Future Data",
          data: actualYears.map((y) => futMap[y] ?? null),
          borderColor: "#d62728",
          backgroundColor: "transparent",
          pointBackgroundColor: "#d62728",
          fill: false,
          borderWidth: 1.5,
          pointRadius: 3,
        },
        {
          label: "Model Predictions",
          data: actualYears.map((y) => predMap[y] ?? null),
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
