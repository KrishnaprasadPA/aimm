// // import React, { forwardRef, useEffect, useState } from "react";
// // import Chart from "chart.js/auto";
// // import "chartjs-plugin-dragdata";
// // import "chartjs-plugin-zoom";

// // const colors = [
// //   "red",
// //   "blue",
// //   "green",
// //   "purple",
// //   "orange",
// //   "pink",
// //   "cyan",
// //   "magenta",
// //   "lime",
// //   "teal",
// //   "olive",
// //   "maroon",
// //   "navy",
// //   "brown",
// //   "coral",
// //   "crimson",
// //   "turquoise",
// //   "indigo",
// //   "violet",
// //   "gold",
// //   "plum",
// //   "orchid",
// //   "sienna",
// //   "salmon",
// //   "chocolate",
// //   "silver",
// // ];

// // function getNextColor() {
// //   const colorIndex = Math.floor(Math.random() * colors.length);
// //   return colors[colorIndex];
// // }

// // const useChart = (ref, factorData, size, selectedRectangle) => {
// //   const [chartInstance, setChartInstance] = useState(null);

// //   useEffect(() => {
// //     if (!ref.current) {
// //       console.log("Ref is still null.");
// //       // return;
// //     }

// //     const years = factorData.map((item) => item.year);
// //     const values = factorData.map((item) => item.normalized_value);

// //     const chartConfig = {
// //       type: "line",
// //       data: {
// //         labels: years,
// //         datasets: [
// //           {
// //             label: "Past Data",
// //             borderColor: getNextColor(),
// //             data: values,
// //             fill: false,
// //             draggable: true, // Enable dragging
// //           },
// //         ],
// //       },
// //       options: {
// //         responsive: true,
// //         scales: { y: { beginAtZero: true } },
// //         plugins: {
// //           dragData: {
// //             round: 1,
// //             showTooltip: true,
// //             onDragEnd: (e, datasetIndex, index, value) => {
// //               chartInstance.data.datasets[datasetIndex].data[index] = value;
// //               chartInstance.update();

// //               const updatedData = [
// //                 ...selectedRectangle.attributes.factor.time_series_data,
// //               ];
// //               updatedData[index].value = value;
// //               selectedRectangle.attributes.factor.time_series_data =
// //                 updatedData;
// //             },
// //           },
// //           zoom: {
// //             zoom: {
// //               wheel: { enabled: true },
// //               pinch: { enabled: true },
// //               mode: "xy",
// //             },
// //             pan: { enabled: true, mode: "xy" },
// //           },
// //         },
// //       },
// //     };

// //     console.log("Chart config is: ", chartConfig);

// //     const newChartInstance = new Chart(ref.current, chartConfig);
// //     setChartInstance(newChartInstance);

// //     // return cleanup function to destroy chart instance when component unmounts
// //     return () => newChartInstance.destroy();
// //   }, [ref.current, factorData]);

// //   return chartInstance;
// // };

// // const ChartComponent = forwardRef(
// //   ({ factorData, selectedRectangle, onClose }, ref) => {
// //     const [position, setPosition] = useState({ x: 0, y: 0 });
// //     const [size, setSize] = useState({ width: 400, height: 400 });
// //     const [isResizing, setIsResizing] = useState(false);
// //     const [isDragging, setIsDragging] = useState(false);
// //     const [startPos, setStartPos] = useState({ x: 0, y: 0 });

// //     const handleResizeMouseDown = (e) => {
// //       e.stopPropagation();
// //       setIsResizing(true);
// //       setStartPos({ x: e.clientX, y: e.clientY });
// //     };

// //     const handleResizeMouseMove = (e) => {
// //       if (!isResizing) return;
// //       const deltaX = e.clientX - startPos.x;
// //       const deltaY = e.clientY - startPos.y;
// //       setSize((prevSize) => ({
// //         width: Math.max(100, prevSize.width + deltaX),
// //         height: Math.max(100, prevSize.height + deltaY),
// //       }));
// //       setStartPos({ x: e.clientX, y: e.clientY });
// //     };

// //     const handleResizeMouseUp = () => {
// //       setIsResizing(false);
// //     };

// //     const handleMouseDown = (e) => {
// //       setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
// //       setIsDragging(true);
// //     };

// //     const handleMouseMove = (e) => {
// //       if (!isDragging) return;
// //       const newPos = { x: e.clientX - startPos.x, y: e.clientY - startPos.y };
// //       setPosition(newPos);
// //     };

// //     const handleMouseUp = () => {
// //       setIsDragging(false);
// //     };

// //     // useEffect(() => {
// //     //   const handleClickOutside = (event) => {
// //     //     if (ref.current && !ref.current.contains(event.target)) {
// //     //       onClose(); // Call the onClose function when clicked outside
// //     //     }
// //     //   };

// //     //   document.addEventListener("mousedown", handleClickOutside);

// //     //   return () => {
// //     //     document.removeEventListener("mousedown", handleClickOutside);
// //     //   };
// //     // }, [onClose]);

// //     // Initialize chart instance
// //     useChart(ref, factorData, size, selectedRectangle);

// //     return (
// //       <div>
// //         <Popover
// //           open={true}
// //           anchorEl={ref.current}
// //           onClose={() => {}}
// //           anchorOrigin={{ vertical: "top", horizontal: "right" }}
// //           onMouseDown={handleMouseDown}
// //           sx={{
// //             position: "fixed",
// //             // left: "30%",
// //             // top: "-50%",
// //             zIndex: 1400,
// //             cursor: "move",
// //             width: `${size.width + 100}px`,
// //             height: `${size.height + 100}px`,
// //           }}
// //         >
// //           <Paper sx={{ width: size.width, height: size.height }}>
// //             <Box
// //               sx={{
// //                 position: "relative",
// //                 width: "100%",
// //                 height: "100%",
// //               }}
// //             >
// //               <canvas ref={ref} width={size.width} height={size.height} />
// //               {/* <div
// //                 style={{
// //                   position: "absolute",
// //                   bottom: "0",
// //                   right: "0",
// //                   width: "20px",
// //                   height: "20px",
// //                   backgroundColor: "lightgray",
// //                   // cursor: "nwse-resize",
// //                   zIndex: "1500",
// //                 }}
// //                 // onMouseDown={handleResizeMouseDown}
// //               ></div> */}
// //             </Box>
// //           </Paper>
// //         </Popover>
// //       </div>
// //     );
// //   }
// // );

// // export default ChartComponent;
// import React, { useEffect, useRef, useState } from "react";
// import { Popover, Paper, Box } from "@mui/material";
// import Chart from "chart.js/auto";
// import "chartjs-plugin-dragdata";
// import "chartjs-plugin-zoom";

// const colors = [
//   "red", "blue", "green", "purple", "orange", "pink", "cyan",
//   "magenta", "lime", "teal", "olive", "maroon", "navy",
//   "brown", "coral", "crimson", "turquoise", "indigo",
//   "violet", "gold", "plum", "orchid", "sienna",
//   "salmon", "chocolate", "silver",
// ];

// function getNextColor() {
//   const colorIndex = Math.floor(Math.random() * colors.length);
//   return colors[colorIndex];
// }

// const ChartComponent = ({ factorData, selectedRectangle, onClose }) => {
//   const canvasRef = useRef(null);
//   const [chartInstance, setChartInstance] = useState(null);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [size, setSize] = useState({ width: 400, height: 400 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [startPos, setStartPos] = useState({ x: 0, y: 0 });

//   // Initialize Chart.js instance
//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const years = factorData.map((item) => item.year);
//     const values = factorData.map((item) => item.normalized_value);

//     const chartConfig = {
//       type: "line",
//       data: {
//         labels: years,
//         datasets: [
//           {
//             label: "Past Data",
//             borderColor: getNextColor(),
//             data: values,
//             fill: false,
//             draggable: true,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         scales: { y: { beginAtZero: true } },
//         plugins: {
//           dragData: {
//             round: 1,
//             showTooltip: true,
//             onDragEnd: (e, datasetIndex, index, value) => {
//               chartInstance.data.datasets[datasetIndex].data[index] = value;
//               chartInstance.update();

//               // Update selected rectangle's data
//               const updatedData = [...selectedRectangle.attributes.factor.time_series_data];
//               updatedData[index].value = value;
//               selectedRectangle.attributes.factor.time_series_data = updatedData;
//             },
//           },
//           zoom: {
//             zoom: {
//               wheel: { enabled: true },
//               pinch: { enabled: true },
//               mode: "xy",
//             },
//             pan: { enabled: true, mode: "xy" },
//           },
//         },
//       },
//     };

//     // Create Chart.js instance
//     const newChartInstance = new Chart(canvasRef.current, chartConfig);
//     setChartInstance(newChartInstance);

//     // Cleanup function to destroy chart instance when unmounting
//     return () => newChartInstance.destroy();
//   }, [factorData]);

//   // Dragging functionality
//   const handleMouseDown = (e) => {
//     setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
//     setIsDragging(true);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     const newPos = { x: e.clientX - startPos.x, y: e.clientY - startPos.y };
//     setPosition(newPos);
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   return (
//     <div>
//       <Popover
//         open={true}
//         anchorReference="anchorPosition"
//         anchorPosition={{ top: position.y, left: position.x }}
//         onClose={onClose}
//         PaperProps={{
//           style: { width: size.width + 'px', height: size.height + 'px', cursor: isDragging ? 'grabbing' : 'move' }
//         }}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       >
//         <Paper sx={{ width: size.width, height: size.height }}>
//           <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
//             <canvas ref={canvasRef} width={size.width} height={size.height} />
//           </Box>
//         </Paper>
//       </Popover>
//     </div>
//   );
// };

// export default ChartComponent;
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Popover, Paper, Box, Typography } from "@mui/material";

const ChartComponent = ({ factorData }) => {
  const canvasRef = useRef(null); // Ref for the canvas element
  const chartInstanceRef = useRef(null); // Ref to store the Chart.js instance

  useEffect(() => {
    // Cleanup any existing chart instance before creating a new one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

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
      }
    };
  }, [factorData, chartInstanceRef.current]); // Re-run effect when factorData changes

  // return (
  //   <div style={{ width: "100%", height: "400px" }}>
  //     <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
  //   </div>
  // );
  return (
    <div>
      <Popover
        open={true}
        anchorEl={chartInstanceRef.current}
        onClose={() => {}}
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
        <Paper sx={{ width: "400px", height: "400px" }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
            }}
          >
            <canvas ref={canvasRef} width="400" height="400" />
            {/* <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "lightgray",
                      // cursor: "nwse-resize",
                      zIndex: "1500",
                    }}
                    // onMouseDown={handleResizeMouseDown}
                  ></div> */}
          </Box>
        </Paper>
      </Popover>
    </div>
  );
};

export default ChartComponent;
