import React, { useEffect } from "react";
import { Modal, Box, Typography } from "@mui/material";
import * as joint from "jointjs";

const ModelVisualization = ({
  showVisualization,
  setShowVisualization,
  modelData,
}) => {
  useEffect(() => {
    if (showVisualization) {
      const graph = new joint.dia.Graph();
      const paper = new joint.dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        width: 600,
        height: 400,
        gridSize: 1,
      });

      const factorElements = {};

      // Create elements for each start_factor and end_factor
      modelData.links.forEach((link) => {
        const { start_factor, end_factor, weight } = link;

        // Create or get existing start factor element
        if (!factorElements[start_factor]) {
          factorElements[start_factor] = new joint.shapes.standard.Rectangle();
          factorElements[start_factor]
            .position(50, 50 + Object.keys(factorElements).length * 60)
            .resize(100, 40)
            .attr({
              body: { fill: "lightblue" },
              label: { text: start_factor, fill: "black" },
            })
            .addTo(graph);
        }

        // Create or get existing end factor element
        if (!factorElements[end_factor]) {
          factorElements[end_factor] = new joint.shapes.standard.Rectangle();
          factorElements[end_factor]
            .position(250, 50 + Object.keys(factorElements).length * 60)
            .resize(100, 40)
            .attr({
              body: { fill: "lightgreen" },
              label: { text: end_factor, fill: "black" },
            })
            .addTo(graph);
        }

        // Create link with weight label
        const linkElement = new joint.shapes.standard.Link();
        linkElement
          .set("source", { id: factorElements[start_factor].id })
          .set("target", { id: factorElements[end_factor].id })
          .addTo(graph);

        // Create a text element to show the weight
        const textElement = new joint.shapes.standard.TextBlock();
        textElement.position(150, 50 + Object.keys(factorElements).length * 60);
        textElement.resize(50, 20);
        textElement.attr({ text: { text: weight.toString(), fill: "black" } });
        textElement.addTo(graph);
      });

      // Set the target factor visually if needed
      // You can customize the appearance for the target factor separately if required
      const targetElement = new joint.shapes.standard.Rectangle();
      targetElement
        .position(450, 50)
        .resize(100, 40)
        .attr({
          body: { fill: "orange" },
          label: { text: modelData.target_factor, fill: "black" },
        })
        .addTo(graph);
    }
  }, [showVisualization, modelData]);

  return (
    <Modal
      open={showVisualization}
      onClose={() => setShowVisualization(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 400,
          bgcolor: "white",
          p: 2,
        }}
      >
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Model Visualization
        </Typography>
        <div id="paper" style={{ width: "100%", height: "100%" }}></div>
      </Box>
    </Modal>
  );
};

export default ModelVisualization;
