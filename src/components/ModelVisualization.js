// // // import React, { useRef, useEffect } from "react";
// // // import { Modal, Box, IconButton } from "@mui/material";
// // // import CloseIcon from "@mui/icons-material/Close";
// // // import * as joint from "jointjs";

// // // const ModelVisualization = ({ model, open, onClose }) => {
// // //   const visualizePaperRef = useRef(null);
// // //   const visualizeGraphRef = useRef(null);

// // //   useEffect(() => {
// // //     // Initialize the graph and paper only when the modal is open and graph_data is available
// // //     if (open && model.graph_data) {
// // //       const parsedGraphData = JSON.parse(model.graph_data); // Parse the stringified graph data
// // //       console.log("Parsed Graph Data: ", parsedGraphData);

// // //       const graph = new joint.dia.Graph();

// // //       const paper = new joint.dia.Paper({
// // //         el: visualizeGraphRef,
// // //         model: graph,
// // //         width: "100%",
// // //         height: "100%",
// // //         gridSize: 10,
// // //         drawGrid: true,
// // //         interactive: { linkMove: true },
// // //         cellViewNamespace: joint.shapes,
// // //         linkPinning: false,
// // //         defaultLink: () =>
// // //           new joint.shapes.standard.Link({
// // //             attrs: {
// // //               wrapper: {
// // //                 cursor: "default",
// // //               },
// // //               line: {
// // //                 stroke: "black",
// // //                 strokeWidth: 2,
// // //               },
// // //             },
// // //           }),
// // //         defaultConnectionPoint: { name: "boundary" },
// // //         validateConnection: function (
// // //           cellViewS,
// // //           magnetS,
// // //           cellViewT,
// // //           magnetT,
// // //           end,
// // //           linkView
// // //         ) {
// // //           return magnetS !== magnetT;
// // //         },
// // //       });

// // //       // Load the graph data into the graph
// // //       try {
// // //         graph.fromJSON(parsedGraphData); // Use fromJSON method to load graph data into JointJS
// // //       } catch (error) {
// // //         console.error("Error parsing graph data:", error);
// // //       }

// // //       // Clean up the graph and paper when the modal is closed
// // //       return () => {
// // //         paper.remove(); // Remove the paper to clean up listeners
// // //         graph.clear(); // Clear the graph data
// // //       };
// // //     }
// // //   }, []);

// // //   return (
// // //     <Modal open={open} onClose={onClose}>
// // //       <Box
// // //         sx={{
// // //           width: "100%",
// // //           height: "100%",
// // //           bgcolor: "background.paper",
// // //           p: 2,
// // //         }}
// // //       >
// // //         <div
// // //           ref={visualizeGraphRef}
// // //           style={{ width: "100%", height: "100%" }}
// // //         ></div>
// // //         <IconButton
// // //           onClick={onClose}
// // //           sx={{ position: "absolute", top: 8, right: 8 }}
// // //         >
// // //           <CloseIcon />
// // //         </IconButton>
// // //       </Box>
// // //     </Modal>
// // //   );
// // // };

// // // export default ModelVisualization;
// // import React, { useRef, useEffect } from "react";
// // import { Modal, Box, IconButton } from "@mui/material";
// // import CloseIcon from "@mui/icons-material/Close";
// // import * as joint from "jointjs";

// // const ModelVisualization = ({ model, open, onClose }) => {
// //   const visualizeGraphRef = useRef(null);

// //   useEffect(() => {
// //     // Initialize the graph and paper only when the modal is open and graph_data is available
// //     if (open && model.graph_data) {
// //       const parsedGraphData = JSON.parse(model.graph_data); // Parse the stringified graph data
// //       console.log("Parsed Graph Data: ", parsedGraphData);

// //       const graph = new joint.dia.Graph();

// //       // Delay initialization to ensure modal is fully rendered
// //       setTimeout(() => {
// //         const paper = new joint.dia.Paper({
// //           el: visualizeGraphRef.current, // Use .current to access the DOM element
// //           model: graph,
// //           width: visualizeGraphRef.current.offsetWidth || 800, // Fallback width
// //           height: visualizeGraphRef.current.offsetHeight || 600, // Fallback height
// //           gridSize: 10,
// //           drawGrid: true,
// //           interactive: { linkMove: true },
// //           cellViewNamespace: joint.shapes,
// //           linkPinning: false,
// //           defaultLink: () =>
// //             new joint.shapes.standard.Link({
// //               attrs: {
// //                 wrapper: {
// //                   cursor: "default",
// //                 },
// //                 line: {
// //                   stroke: "black",
// //                   strokeWidth: 2,
// //                 },
// //               },
// //             }),
// //           defaultConnectionPoint: { name: "boundary" },
// //           validateConnection: function (
// //             cellViewS,
// //             magnetS,
// //             cellViewT,
// //             magnetT,
// //             end,
// //             linkView
// //           ) {
// //             return magnetS !== magnetT;
// //           },
// //         });

// //         parsedGraphData.cells.forEach((cell) => {
// //           if (cell.type === "standard.Rectangle") {
// //             // Apply default size if missing
// //             cell.size = cell.size || { width: 120, height: 40 };

// //             // Apply default position if missing
// //             cell.position = cell.position || { x: 100, y: 100 };

// //             // Apply default attrs if missing
// //             cell.attrs = cell.attrs || {};
// //             cell.attrs.body = cell.attrs.body || {
// //               fill: "#FFFFFF",
// //               stroke: "#000000",
// //             };
// //             cell.attrs.label = cell.attrs.label || {
// //               text: "Label",
// //               fill: "#000000",
// //               fontSize: 12,
// //             };
// //           }
// //         });

// //         try {
// //           graph.fromJSON(parsedGraphData); // Load the graph data into JointJS
// //         } catch (error) {
// //           console.error("Error parsing graph data:", error);
// //         }

// //         // Resize the paper on window resize
// //         const handleResize = () => {
// //           if (visualizeGraphRef.current) {
// //             paper.setDimensions(
// //               visualizeGraphRef.current.offsetWidth,
// //               visualizeGraphRef.current.offsetHeight
// //             );
// //           }
// //         };

// //         window.addEventListener("resize", handleResize);

// //         // Cleanup function
// //         return () => {
// //           paper.remove(); // Remove the paper to clean up listeners
// //           graph.clear(); // Clear the graph data
// //           window.removeEventListener("resize", handleResize);
// //         };
// //       }, 0); // Delay initialization slightly to allow modal rendering
// //     }
// //   }, [open, model]);

// //   return (
// //     <Modal open={open} onClose={onClose}>
// //       <Box
// //         sx={{
// //           width: "100%",
// //           height: "100vh", // Ensure full viewport height for modal
// //           bgcolor: "background.paper",
// //           p: 2,
// //         }}
// //       >
// //         <div
// //           ref={visualizeGraphRef}
// //           style={{ width: "100%", height: "100%" }}
// //         ></div>
// //         <IconButton
// //           onClick={onClose}
// //           sx={{ position: "absolute", top: 8, right: 8 }}
// //         >
// //           <CloseIcon />
// //         </IconButton>
// //       </Box>
// //     </Modal>
// //   );
// // };

// // export default ModelVisualization;
// import React, { useRef, useEffect } from "react";
// import { Modal, Box, IconButton } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import * as joint from "jointjs";

// const ModelVisualization = ({ model, open, onClose }) => {
//   const visualizeGraphRef = useRef(null);

//   useEffect(() => {
//     // Initialize the graph and paper only when the modal is open and graph_data is available
//     if (open && model.graph_data) {
//       const parsedGraphData = JSON.parse(model.graph_data); // Parse the stringified graph data
//       console.log("Parsed Graph Data: ", parsedGraphData);

//       const graph = new joint.dia.Graph();

//       // Delay initialization to ensure modal is fully rendered
//       setTimeout(() => {
//         const paper = new joint.dia.Paper({
//           el: visualizeGraphRef.current, // Use .current to access the DOM element
//           model: graph,
//           width: visualizeGraphRef.current.offsetWidth || 800, // Fallback width
//           height: visualizeGraphRef.current.offsetHeight || 600, // Fallback height
//           gridSize: 10,
//           drawGrid: true,
//           interactive: { linkMove: true },
//           cellViewNamespace: joint.shapes,
//           linkPinning: false,
//           // defaultLink: () =>
//           //   new joint.shapes.standard.Link({
//           //     attrs: {
//           //       wrapper: {
//           //         cursor: "default",
//           //       },
//           //       line: {
//           //         stroke: "black",
//           //         strokeWidth: 2,
//           //       },
//           //     },
//           //   }),
//           // defaultConnectionPoint: { name: "boundary" },
//           // validateConnection: function (
//           //   cellViewS,
//           //   magnetS,
//           //   cellViewT,
//           //   magnetT,
//           //   end,
//           //   linkView
//           // ) {
//           //   return magnetS !== magnetT;
//           // },
//         });

//         // Loop through cells and adjust z-index for rectangles and links
//         parsedGraphData.cells.forEach((cell) => {
//           if (cell.type === "standard.Rectangle") {
//             // Apply default size if missing
//             // cell.size = cell.size || { width: 120, height: 40 };

//             // // Apply default position if missing
//             // cell.position = cell.position || { x: 100, y: 100 };

//             // // Apply default attrs if missing
//             // if (cell.attrs) {
//             //   console.log("Cell with attr is : ", cell.attrs);
//             // }
//             // cell.attrs = cell.attrs || {};
//             // cell.attrs.body = cell.attrs.body || {
//             //   fill: "#FFFFFF",
//             //   stroke: "#000000",
//             // };
//             // cell.attrs.label = cell.attrs.label || {
//             //   text: "Label",
//             //   fill: "#000000",
//             //   fontSize: 12,
//             // };

//             // Ensure z-index is set (increase it to ensure visibility)
//             cell.z = 2000; // Default z-index for rectangles
//           } else if (cell.type === "standard.Link") {
//             // Ensure z-index is set for links as well (set it higher than rectangles)
//             cell.z = 2010; // Default z-index for links to ensure they're above rectangles
//           }
//         });

//         try {
//           graph.fromJSON(parsedGraphData); // Load the graph data into JointJS
//         } catch (error) {
//           console.error("Error parsing graph data:", error);
//         }

//         // Resize the paper on window resize
//         const handleResize = () => {
//           if (visualizeGraphRef.current) {
//             paper.setDimensions(
//               visualizeGraphRef.current.offsetWidth,
//               visualizeGraphRef.current.offsetHeight
//             );
//           }
//         };

//         window.addEventListener("resize", handleResize);

//         // Cleanup function
//         return () => {
//           paper.remove(); // Remove the paper to clean up listeners
//           graph.clear(); // Clear the graph data
//           window.removeEventListener("resize", handleResize);
//         };
//       }, 0); // Delay initialization slightly to allow modal rendering
//     }
//   }, [open, model]);

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box
//         sx={{
//           width: "100%",
//           height: "100vh", // Ensure full viewport height for modal
//           bgcolor: "black",
//           p: 2,
//         }}
//       >
//         <div
//           ref={visualizeGraphRef}
//           style={{ width: "100%", height: "100%" }}
//         ></div>
//         <IconButton
//           onClick={onClose}
//           sx={{ position: "absolute", top: 8, right: 8 }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </Box>
//     </Modal>
//   );
// };

// export default ModelVisualization;
import React, { useRef, useEffect } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as joint from "jointjs";

const ModelVisualization = ({ model, open, onClose }) => {
  const visualizeGraphRef = useRef(null);

  useEffect(() => {
    // Initialize the graph and paper only when the modal is open and graph_data is available
    if (open && model.graph_data) {
      const parsedGraphData = JSON.parse(model.graph_data); // Parse the stringified graph data
      console.log("Parsed Graph Data: ", parsedGraphData);

      const graph = new joint.dia.Graph();

      // Delay initialization to ensure modal is fully rendered
      setTimeout(() => {
        const paper = new joint.dia.Paper({
          el: visualizeGraphRef.current, // Use .current to access the DOM element
          model: graph,
          width: visualizeGraphRef.current.offsetWidth || 800, // Fallback width
          height: visualizeGraphRef.current.offsetHeight || 600, // Fallback height
          gridSize: 10,
          drawGrid: true,
          interactive: { linkMove: true },
          cellViewNamespace: joint.shapes,
          linkPinning: false,
        });

        // Loop through cells and adjust z-index for rectangles and links
        parsedGraphData.cells.forEach((cell) => {
          if (cell.type === "standard.Rectangle") {
            // Ensure z-index is set (increase it to ensure visibility)
            cell.z = 2000; // Default z-index for rectangles

            // Ensure attrs.body exists and has valid fill/stroke values
            cell.attrs = cell.attrs || {};
            cell.attrs.body = cell.attrs.body || {
              fill: "#80396e", // Default fill color if missing
              stroke: "#121212", // Default stroke color if missing
              strokeWidth: 2,
              borderRadius: 3,
            };
            cell.attrs.label = cell.attrs.label || {
              text: "Label",
              fill: "#FFFFFF", // Label text color
              fontSize: 12,
            };
          } else if (cell.type === "standard.Link") {
            // Ensure z-index is set for links as well (set it higher than rectangles)
            cell.z = 2010; // Default z-index for links to ensure they're above rectangles
          }
        });

        try {
          graph.fromJSON(parsedGraphData); // Load the graph data into JointJS
        } catch (error) {
          console.error("Error parsing graph data:", error);
        }

        // Resize the paper on window resize
        const handleResize = () => {
          if (visualizeGraphRef.current) {
            paper.setDimensions(
              visualizeGraphRef.current.offsetWidth,
              visualizeGraphRef.current.offsetHeight
            );
          }
        };

        window.addEventListener("resize", handleResize);

        // Cleanup function
        return () => {
          paper.remove(); // Remove the paper to clean up listeners
          graph.clear(); // Clear the graph data
          window.removeEventListener("resize", handleResize);
        };
      }, 0); // Delay initialization slightly to allow modal rendering
    }
  }, [open, model]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "100%",
          height: "100vh", // Ensure full viewport height for modal
          bgcolor: "background.paper", // Change background color to white or a light color for better visibility
          p: 2,
        }}
      >
        <div
          ref={visualizeGraphRef}
          style={{ width: "100%", height: "100%" }}
        ></div>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Modal>
  );
};

export default ModelVisualization;
