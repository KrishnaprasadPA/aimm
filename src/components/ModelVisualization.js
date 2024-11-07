import React, { useRef, useEffect } from "react";
import { Modal, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkModal from "./LinkModal.js";
import styled from "styled-components";

import * as joint from "jointjs";

const CustomButton = styled.button`
  padding: 8px 15px;
  border: none;
  background-color: #00396e;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
`;

const ModelVisualization = ({ model, open, onClose }) => {
  const visualizeGraphRef = useRef(null);
  const linkModal = new LinkModal();

  useEffect(() => {
    // Initialize the graph and paper only when the modal is open and graph_data is available
    if (open && model.graph_data) {
      const parsedGraphData = JSON.parse(model.graph_data); // Parse the stringified graph data
      console.log("Model data is : ", model);

      const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

      // Delay initialization to ensure modal is fully rendered
      setTimeout(() => {
        const paper = new joint.dia.Paper({
          el: visualizeGraphRef.current, // Use .current to access the DOM element
          model: graph,
          width: 1000, // Fallback width
          height: 800, // Fallback height
          gridSize: 10,
          drawGrid: true,
          interactive: { linkMove: true },
          cellViewNamespace: joint.shapes,
          linkPinning: false,
          defaultLink: () =>
            new joint.shapes.standard.Link({
              attrs: {
                wrapper: {
                  cursor: "default",
                },
                line: {
                  stroke: "black",
                  strokeWidth: 2,
                },
              },
              markup: [
                {
                  tagName: "path",
                  selector: "wrapper",
                  attributes: {
                    fill: "none",
                    cursor: "pointer",
                    stroke: "transparent",
                    strokeWidth: 10,
                  },
                },
                {
                  tagName: "path",
                  selector: "line",
                  attributes: {
                    fill: "none",
                    stroke: "black",
                    strokeWidth: 2,
                  },
                },
              ],
            }),
          defaultConnectionPoint: { name: "boundary" },
          validateConnection: function (
            cellViewS,
            magnetS,
            cellViewT,
            magnetT,
            end,
            linkView
          ) {
            return magnetS !== magnetT;
          },
        });
        paper.on("element:contextmenu", (elementView, evt) => {
          evt.preventDefault();
          elementView.model.remove();
        });

        // // Enable link deletion on right-click
        paper.on("link:contextmenu", (linkView, evt) => {
          evt.preventDefault();
          linkView.model.remove();
        });

        paper.on("link:mouseenter", (linkView) => {
          showLinkTools(linkView);
        });

        paper.on("link:mouseleave", (linkView) => {
          linkView.removeTools();
        });

        paper.on("cell:pointerclick", (cellView) => {
          const element = cellView.model;
        });

        // Loop through cells and adjust z-index for rectangles and links
        // parsedGraphData.cells.forEach((cell) => {
        //   if (cell.type === "standard.Rectangle") {
        //     console.log("Inside cell.Rect");

        //     // Ensure z-index is set (increase it to ensure visibility)
        //     cell.z = 2000; // Default z-index for rectangles

        //     // Ensure attrs.body exists and has valid fill/stroke values
        //     cell.attrs = cell.attrs || {};
        //     console.log("Cell bod is :", cell.attrs.body);
        //     cell.attrs.body = cell.attrs.body || {
        //       fill: "#8e7fa2", // Default fill color if missing
        //       stroke: "#121212", // Default stroke color if missing
        //       strokeWidth: 2,
        //       borderRadius: 3,
        //     };
        //     cell.attrs.label = cell.attrs.label || {
        //       text: "Label",
        //       fill: "#FFFFFF", // Label text color
        //       fontSize: 12,
        //     };
        //   } else if (cell.type === "standard.Link") {
        //     console.log("Inside cell.Link");
        //     // Ensure z-index is set for links as well (set it higher than rectangles)
        //     cell.z = 2010; // Default z-index for links to ensure they're above rectangles
        //   }
        // });

        try {
          graph.fromJSON(parsedGraphData); // Load the graph data into JointJS
          visualizeGraphRef.current.graph = graph;
          console.log("This is the final graph: ", graph);
        } catch (error) {
          console.error("Error parsing graph data:", error);
        }

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
          paper.remove();
          graph.clear();
          window.removeEventListener("resize", handleResize);
        };
      }, 0); // Delay initialization slightly to allow modal rendering
    }
  }, [open, model]);

  const handleDuplicate = () => {
    console.log("Duplicating");
  };

  function showLinkTools(linkView) {
    var infoButton = new joint.linkTools.Button({
      markup: [
        {
          tagName: "circle", // Defines the button as a circle
          selector: "button", // Selector for styling and interaction
          attributes: {
            r: 7, // Radius of the circle
            fill: "#001DFF", // Blue fill color for the button
            cursor: "pointer", // Changes cursor to pointer on hover
          },
        },
        {
          tagName: "path", // Defines an icon inside the circle using SVG path
          selector: "icon", // Selector for icon styling
          attributes: {
            d: "M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4", // Path data for an "i" icon (information symbol)
            fill: "none", // No fill for the path
            stroke: "#FFFFFF", // White stroke color for the icon
            "stroke-width": 2, // Stroke width of the icon lines
            "pointer-events": "none", // Prevents pointer events on the icon itself
          },
        },
      ],
      distance: 60, // Distance from the link (adjust as needed)
      action: function (evt) {
        // Action to perform when the button is clicked
        linkModal.show(linkView.model, (updatedData) => {
          // Update the link model with new values from modal input
          linkView.model.set({
            weight: updatedData.weight,
            trainable: updatedData.trainable,
          });
          console.log("Updated link data:", updatedData);
        });
      },
    });

    //const infoButton = new joint.linkTools.InfoButton();

    // const removeButton = new joint.linkTools.Remove();
    //var sourceAnchorTool = new joint.linkTools.SourceAnchor();

    const tools = new joint.dia.ToolsView({
      tools: [infoButton],
    });

    linkView.addTools(tools);
  }

  return (
    <Modal
      sx={{ zIndex: 1 }}
      open={open}
      onClose={onClose}
      BackdropProps={{
        style: { backgroundColor: "rgba(0, 0, 0, 0.2)" }, // Lighten the backdrop
      }}
    >
      <Box
        sx={{
          position: "absolute", // Positioning the Box absolutely
          top: "50%", // Center vertically
          left: "50%", // Center horizontally
          transform: "translate(-50%, -50%)", // Move the box back by half its width and height to center it
          width: 1000, // Set a fixed width for the modal
          height: 800, // Set a fixed height for the modal
          bgcolor: "#F0FFFF", // Background color for better visibility
          boxShadow: 2, // Add some shadow for depth effect
          p: 2, // Padding inside the Box
          zIndex: 2, // Set a lower z-index if needed (adjust as per your requirement)
        }}
      >
        {/* Title Section */}
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          Model for {model ? model.target_factor : ""}
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2 }}>
          {model ? model.name : ""}
        </Typography>

        {/* Visualization Area */}
        <div
          ref={visualizeGraphRef}
          style={{ width: "100%", height: "100%" }}
        ></div>

        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            bottom: 8,
            left: 8,
            color: "#333",
          }}
        >
          Training Quality:{" "}
          {model ? model.quality || "Not trained" : "Not trained"}
        </Typography>
        <CustomButton
          onClick={handleDuplicate}
          style={{ position: "absolute", bottom: 8, right: 8 }}
        >
          Duplicate
        </CustomButton>
      </Box>
    </Modal>
  );
};

export default ModelVisualization;
