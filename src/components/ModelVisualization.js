// // ModelVisualization.js
// import React from "react";
// import { Modal, Box, Typography } from "@mui/material";
// import { dia, shapes } from "jointjs";

// const ModelVisualization = ({ model, open, onClose }) => {
//   const visualizeModel = () => {
//     // Clear existing graph if needed
//     const graph = new dia.Graph();
//     const paper = new dia.Paper({
//       el: document.getElementById("paper"), // A div where the graph will be rendered
//       model: graph,
//       width: 600,
//       height: 400,
//     });

//     // Create nodes and links based on the model data

//     if (model && model.links) {
//       model.links.forEach((link) => {
//         const startNode = new shapes.standard.Rectangle();
//         const endNode = new shapes.standard.Rectangle();

//         startNode.position(100, 100); // Customize positions
//         startNode.resize(100, 40);
//         startNode.attr("label/text", link.start_factor);

//         endNode.position(300, 100); // Customize positions
//         endNode.resize(100, 40);
//         endNode.attr("label/text", link.end_factor);

//         graph.addCell(startNode);
//         graph.addCell(endNode);

//         const connection = new shapes.standard.Link();
//         connection.source(startNode);
//         connection.target(endNode);
//         connection.attr("label/text", `Weight: ${link.weight}`);
//         graph.addCell(connection);
//       });
//       console.log("Current graph is: ", graph);
//     }
//   };

//   React.useEffect(() => {
//     if (open && model) {
//       visualizeModel();
//     }
//   }, [open, model]);

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box sx={{ p: 4 }}>
//         <Typography variant="h6">
//           Visualizing: {model ? model.name : "Loading..."}
//         </Typography>
//         <div id="paper" style={{ width: "600px", height: "400px" }}></div>
//       </Box>
//     </Modal>
//   );
// };

// export default ModelVisualization;
// ModelVisualization.js
import React, { useRef, useEffect } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { dia, shapes } from "jointjs";

const ModelVisualization = ({ model, open, onClose }) => {
  const paperRef = useRef(null);
  const graphRef = useRef(null);

  useEffect(() => {
    if (open && model) {
      if (!graphRef.current) {
        graphRef.current = new dia.Graph();
      }
      if (!paperRef.current) {
        paperRef.current = new dia.Paper({
          el: document.getElementById("model-visualization-paper"),
          model: graphRef.current,
          width: 600,
          height: 400,
        });
      }

      graphRef.current.clear();

      model.links.forEach((link, index) => {
        const startNode = new shapes.standard.Rectangle();
        const endNode = new shapes.standard.Rectangle();

        // Unique positions for each node to prevent overlap
        startNode.position(100, 50 + index * 80);
        startNode.resize(100, 40);
        startNode.attr("label/text", link.start_factor);

        endNode.position(300, 50 + index * 80);
        endNode.resize(100, 40);
        endNode.attr("label/text", link.end_factor);

        graphRef.current.addCell(startNode);
        graphRef.current.addCell(endNode);

        const connection = new shapes.standard.Link();
        connection.source(startNode);
        connection.target(endNode);
        connection.attr("label/text", `Weight: ${link.weight}`);
        graphRef.current.addCell(connection);
      });
    }
  }, [open, model]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Set desired transparency here
        },
      }}
    >
      <Box
        sx={{
          width: "40vw",
          height: "40vh",
          borderRadius: "10px",
          p: 4,
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box></Box>
      </Box>
    </Modal>
  );
};

export default ModelVisualization;
