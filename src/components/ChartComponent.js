import React, { forwardRef, useEffect, useState, useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from "@chakra-ui/react";
import Chart from "chart.js/auto";
import "chartjs-plugin-dragdata";
import ChartDataLabels from "chartjs-plugin-dragdata";
import "chartjs-plugin-zoom";

const colors = [
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "cyan",
  "magenta",
  "lime",
  "teal",
  "olive",
  "maroon",
  "navy",
  "brown",
  "coral",
  "crimson",
  "turquoise",
  "indigo",
  "violet",
  "gold",
  "plum",
  "orchid",
  "sienna",
  "salmon",
  "chocolate",
  "silver",
  "skyblue",
  "goldenrod",
  "cadetblue",
  "peru",
];

function getNextColor(colorIndex) {
  const color = colors[colorIndex % colors.length];
  return color;
}

const useChart = (ref, components, size) => {
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (!ref.current || !components) return;

    const datasets = components.map((component, i) => {
      const componentName = component.get("componentName");
      const componentData = component.get("componentData");
      const isDraggable = !componentName.toLowerCase().includes("area");
      return {
        id: `dataset-${i}`,
        label: componentName,
        borderColor: getNextColor(i),
        data: Object.values(componentData),
        isDraggable,
      };
    });

    const chartConfig = {
      type: "line",
      data: {
        labels: Object.keys(components[0].get("componentData")),
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true, // Enable zooming with mouse wheel
              },
              pinch: {
                enabled: true, // Enable zooming with pinch gestures
              },
              mode: "xy", // Zoom both x and y axes
            },
            pan: {
              enabled: true, // Enable panning
              mode: "xy", // Pan both x and y axes
            },
          },
          dragData: {}, // Initialize dragData plugin configuration
        },
      },
    };

    // Configure dragData for each draggable dataset
    datasets.forEach((dataset, index) => {
      if (dataset.isDraggable) {
        chartConfig.options.plugins.dragData[dataset.id] = {
          round: 1,
          showTooltip: true,
          onDragStart: function (e, datasetIndex, index, value) {},
          onDrag: function (e, datasetIndex, index, value) {},
          onDragEnd: function (e, datasetIndex, index, value) {
            chartInstance.data.datasets[index].data[datasetIndex] = value;
            chartInstance.update();
          },
        };
      }
    });

    const newChart = new Chart(ref.current, chartConfig);
    setChartInstance(newChart);
    return () => newChart.destroy();
  }, [ref, components]);

  return chartInstance;
};

const chartComponent = forwardRef(({ data, groupId }, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [size, setSize] = useState({ width: 400, height: 400 });
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setSize((prevSize) => ({
      width: Math.max(100, prevSize.width + deltaX),
      height: Math.max(100, prevSize.height + deltaY),
    }));
    setStartPos({ x: e.clientX, y: e.clientY });
  };
  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleResizeMouseUp);
    } else {
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, [isResizing, startPos]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
  const handleMouseDown = (e) => {
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newPos = {
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    };
    setPosition(newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  Chart.register(ChartDataLabels);
  const chartInstance = useChart(ref, data, size); // Capture the chart instance

  const handleWheelZoom = (event) => {
    event.preventDefault();
    const zoomFactor = 1.1;
    const direction = event.deltaY < 0 ? 1 : -1;

    if (chartInstance && chartInstance.scales) {
      const xAxes = chartInstance.scales.x;
      const yAxes = chartInstance.scales.y;

      if (xAxes && yAxes) {
        // Update axes range
        console.log(xAxes, yAxes);
        xAxes.min = adjustRange(xAxes.min, direction, zoomFactor);
        xAxes.max = adjustRange(xAxes.max, direction, zoomFactor);
        yAxes.min = adjustRange(yAxes.min, direction, zoomFactor);
        yAxes.max = adjustRange(yAxes.max, direction, zoomFactor);

        chartInstance.update();
      } else {
        console.error("Axes not found in chart instance");
      }
    } else {
      console.error("Chart instance not initialized or scales not available");
    }
  };

  const adjustRange = (value, direction, zoomFactor) => {
    return direction > 0 ? value / zoomFactor : value * zoomFactor;
  };

  useEffect(() => {
    const canvas = ref.current;
    if (canvas && chartInstance) {
      canvas.addEventListener("wheel", handleWheelZoom);
    }

    return () => {
      if (canvas && chartInstance) {
        canvas.removeEventListener("wheel", handleWheelZoom);
      }
    };
  }, [ref, chartInstance]);

  return (
    <div>
      <Popover isOpen={true}>
        <PopoverContent
          onMouseDown={handleMouseDown}
          position="fixed"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1400,
            cursor: "move",
            width: `${size.width}px`,
            height: `${size.height}px`,
          }}
        >
          <PopoverArrow />
          {/* <PopoverCloseButton onClick={onClose} /> */}
          <PopoverHeader>Group {groupId}</PopoverHeader>
          <PopoverBody>
            <canvas ref={ref} width={size.width} height={size.height} />
          </PopoverBody>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "20px",
              height: "20px",
              backgroundColor: "lightgray",
              cursor: "nwse-resize",
              zIndex: 1500,
            }}
            onMouseDown={handleResizeMouseDown}
          ></div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

export default chartComponent;
