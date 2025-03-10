import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AddFactorModal from "./AddFactorModal.js";
import ModelVisualization from "./ModelVisualization.js";
import Popper from "@mui/material/Popper";
import PopupState, { bindToggle, bindPopper } from "material-ui-popup-state";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import * as joint from "jointjs";
import styled from "styled-components";
import LinkModal from "./LinkModal.js";
import Chart from "chart.js/auto";
import "chartjs-plugin-dragdata";
import ChartDataLabels from "chartjs-plugin-dragdata";
import ChartComponent from "./ChartComponent.js";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ResizableChartComponent from "./ResizableChartComponent.js";

import {
  Avatar,
  Box,
  AppBar,
  Toolbar,
  Tooltip,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Modal,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Grid from "@mui/material/Grid2";
import { useAuth } from "../context/AuthContext";

const HomeContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Column = styled.div`
  padding: 10px;
  background-color: #f4f4f4;
`;

const LeftColumn = styled(Column)`
  width: 25%;
`;

const MiddleColumn = styled(Column)`
  width: 50%;
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled(Column)`
  width: 25%;
`;

const SectionContainer = styled.div`
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 10px;

  input {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  button {
    padding: 10px 20px;
    border: none;
    background-color: #ff4d4d;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
  }
`;

const PredictionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  button {
    padding: 8px 10px;
    border: none;
    background-color: #512da8;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const FactorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  gap: 4px;
`;

const FactorItem = styled.div`
  background-color: #e7a9a9;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s;
  color: black;
  font-size: 12px;

  &:hover {
    background-color: #d8a2a2;
    transform: scale(1.05);
  }
`;

const DragDropArea = styled.div`
  flex-grow: 1;
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 20px;
  min-height: 200px;
`;

const ModelActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModelNameInput = styled.input`
  flex: 1;
  padding: 8px;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const CustomButton = styled.button`
  padding: 8px 15px;
  border: none;
  background-color: #975c5c;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    background-color: #574141; /* Slightly darker shade on hover */
  }
  &:active {
    background-color: #40224a; /* Darker shade when clicked */
    transform: scale(0.98); /* Optional: Adds a click effect */
  }

  &:focus {
    outline: none; /* Removes the focus outline if present */
  }
`;

const DeleteButton = styled.button`
  padding: 8px 15px;
  border: none;
  // background-color: #512da8;
  background-color: #ff4d4d;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    background-color: #e64545; /* Slightly darker shade on hover */
  }
`;

const apiUrl = process.env.REACT_APP_API_URI;

const Home = () => {
  const [modelName, setModelName] = useState("");
  const [modelQuality, setModelQuality] = useState("Not trained yet");
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [targetVariables, setTargetVariables] = useState([]);
  const [adminFactors, setAdminFactors] = useState([]);
  const [userFactors, setUserFactors] = useState([]);
  const [modelLevels, setModelLevels] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showAddFactorModal, setShowAddFactorModal] = useState(false);
  const [lastRectPosition, setLastRectPosition] = useState({ x: 50, y: 50 });
  const [selectedModel, setSelectedModel] = useState(null);
  const [openPopovers, setOpenPopovers] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [addedFactors, setAddedFactors] = useState([]);

  const [sourceElement, setSourceElement] = React.useState(null);
  const [sourcePort, setSourcePort] = React.useState(null);

  const openAddFactorModal = () => setShowAddFactorModal(true);
  const closeAddFactorModal = () => setShowAddFactorModal(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFactors, setFilteredFactors] = useState([]);

  const graphRef = useRef(null);
  const paperRef = useRef(null);
  // const chartRef = useRef(null);
  const [selectedElements, setSelectedElements] = React.useState([]);
  const linkModal = new LinkModal();
  const [duplicatedGraphData, setDuplicatedGraphData] = useState(null);
  const [selectedFactorData, setSelectedFactorData] = useState(null); // Time series data
  const [selectedFactorName, setselectedFactorName] = useState(null); // Time series data
  const [selectedRectangle, setSelectedRectangle] = useState(null); // Selected rectangle
  const [isChartVisible, setIsChartVisible] = useState(false); // For showing the chart modal
  const [showModels, setShowModels] = useState(false);
  const [userModels, setUserModels] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCustomToggleExpand = () => {
    setIsCustomExpanded(!isCustomExpanded);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

    const paper = new joint.dia.Paper({
      el: graphRef.current,
      model: graph,
      width: "100%",
      height: "100%",
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
              stroke: getLinkColor(1), // Default color for weight = 1
              strokeWidth: getLinkThickness(1), // Default thickness for weight = 1
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
                stroke: getLinkColor(1), // Default color for weight = 1
                strokeWidth: getLinkThickness(1), // Default thickness for weight = 1
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

    // Enable element deletion on right-click
    paper.on("element:contextmenu", (elementView, evt) => {
      evt.preventDefault();
      const factorId = elementView.model.attributes.factor._id;
      setAddedFactors(addedFactors.filter((id) => id !== factorId));
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

      if (element.isElement()) {
        const factor = element.get("factor"); // Assuming time series data is stored in model attributes
        handleOpenPopover(element);
        // paper.$el.css("cursor", "pointer");
      }
    });
    if (duplicatedGraphData) {
      try {
        // Load duplicated graph data into JointJS
        graph.fromJSON(duplicatedGraphData);
        console.log("Inside if block");
      } catch (error) {
        console.error("Error loading duplicated graph:", error);
      }
    }

    graphRef.current.graph = graph;
  }, [duplicatedGraphData]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const userId = loggedUser ? loggedUser.id : null;

  useEffect(() => {
    loadTargets();
    loadFactors();
    loadModels();
    loadUserModels(userId);

    if (showModels) {
      axios
        .get(`${apiUrl}/api/models/user`)
        .then((response) => {
          setUserModels(response.data);
        })
        .catch((error) => {
          console.error("Error loading user models:", error);
        });
    }
  }, [duplicatedGraphData, showModels, isChartVisible]);

  // Function to close a specific popover
  // const handleClosePopover = (popoverId) => {
  //   setOpenPopovers((prev) => prev.filter((p) => p.id !== popoverId));
  // };

  // const getComponentPosition = (component) => {
  //   const position = component.attributes.position;
  //   const screenWidth = window.innerWidth;
  //   const screenHeight = window.innerHeight;

  //   let xPosition = position.x + 200; // Adjust based on your layout
  //   let yPosition = position.y + 100;

  //   if (xPosition + 400 > screenWidth) xPosition -= 400;
  //   if (yPosition + 400 > screenHeight) yPosition -= 400;

  //   return { x: xPosition, y: yPosition };
  // };
  const handleOpenPopover = (element) => {
    // Assuming time series data is stored in element.attributes.factor.time_series_data
    const timeSeriesData = element.attributes.factor.time_series_data;
    const factorName = element.attributes.factor.name;

    setSelectedFactorData(timeSeriesData);
    console.log("Time series data is: ", timeSeriesData);

    setselectedFactorName(factorName);
    console.log("Selected factor is : ", factorName);

    setSelectedRectangle(element);
    console.log("Selected rectangle is: ", element);

    setIsChartVisible(true);
    console.log("Chart visible is: ", isChartVisible);
  };

  const handleAddSuccess = () => {
    console.log("Factor added to the system.");
    // Update any additional state if needed.
  };

  const handleVisualize = (model) => {
    if (model) {
      setSelectedModel(model);
      setShowVisualization(true);
    }
  };

  const handleDuplicateGraph = (graphData) => {
    // setAddedFactors([]);
    console.log("selected model is: ", selectedModel);
    setDuplicatedGraphData(graphData);
    setModelName(selectedModel.name + "-copy");
    setSelectedTarget(selectedModel.target_factor);
    setModelQuality(selectedModel.quality || "Not trained yet");
  };

  const handleClear = () => {
    if (graphRef.current && graphRef.current.graph) {
      // Clear all elements and links from the graph
      graphRef.current.graph.clear();
      setAddedFactors([]);
      setSelectedModel(null);
      setModelName("");
      setModelQuality("Not trained yet");

      console.log("Graph cleared");
    }
  };

  // Helper function to calculate link thickness based on weight
  const getLinkThickness = (weight) => {
    const absoluteWeight = Math.abs(weight);
    // Thickness ranges from 1 (minimum) to 5 (maximum)
    return 1 + absoluteWeight * 4; // Adjust multiplier as needed
  };

  // Helper function to calculate link color based on weight
  const getLinkColor = (weight) => {
    if (weight < 0) {
      // Negative weights: red gradient
      const intensity = Math.abs(weight); // Intensity of red
      return `rgba(255, ${100 - intensity * 100}, ${100 - intensity * 100}, 1)`;
    } else if (weight > 0) {
      // Positive weights: blue gradient
      const intensity = weight; // Intensity of blue
      return `rgba(${100 - intensity * 100}, ${100 - intensity * 100}, 255, 1)`;
    } else {
      // Neutral weight: black
      return "black";
    }
  };

  const loadTargets = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/target`);
      setTargetVariables(response.data);
      console.log();
    } catch (error) {
      console.error("Error loading target variables:", error);
    }
  };

  const loadFactors = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/factors`);
      setAdminFactors(
        response.data.filter((factor) => factor.creator === "admin")
      );
      setUserFactors(
        response.data.filter((factor) => factor.creator !== "admin")
      );
    } catch (error) {
      console.error("Error loading factors:", error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/models`);
      if (response.data && typeof response.data === "object") {
        setModelLevels(
          Object.keys(response.data).map((levelKey) => ({
            level: parseInt(levelKey, 10),
            models: response.data[levelKey],
          }))
        );
      } else {
        console.error("Unexpected API response format:", response.data);
        setModelLevels([]);
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setModelLevels([]);
    }
  };

  const loadUserModels = async (user_id) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/models/user?user_id=${user_id}`
      );

      if (Array.isArray(response.data)) {
        setUserModels(
          response.data.map((model) => ({
            id: model.id,
            name: model.name,
            quality: model.quality,
            links: model.links,
            target_factor: model.target_factor,
            graph_data: model.graph_data,
          }))
        );
      } else {
        console.error("Unexpected API response format:", response.data);
        setUserModels([]);
      }
    } catch (error) {
      console.error("Error fetching user models:", error);
      setUserModels([]);
    }
  };

  const handleViewModel = (model) => {
    setSelectedModel(model);
    setShowVisualization(true); // Assuming you already have logic for this
  };

  const handleDeleteModel = async (modelId) => {
    console.log("This is the modelId: ", modelId);
    try {
      await axios.delete(`${apiUrl}/api/models/delete/${modelId}`);
      setUserModels(userModels.filter((model) => model.id !== modelId));
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  const onSearchInput = () => {
    if (searchTerm.length > 0) {
      setFilteredFactors(
        [...adminFactors, ...userFactors].filter((factor) =>
          factor.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredFactors([]);
    }
  };

  const addFactorToDragArea = (factor) => {
    if (addedFactors.includes(factor._id)) {
      alert(`${factor.name} is already added to the canvas.`);
      return;
    }
    if (!selectedFactors.some((f) => f._id === factor._id)) {
      setSelectedFactors([...selectedFactors, { ...factor }]);
    }
    setSearchTerm("");
    setFilteredFactors([]);
    addRectangleToGraph(factor);
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const extractGraphData = (graph) => {
    const cells = graph.getCells();
    const links = [];
    const factors = {};

    cells.forEach((cell) => {
      if (cell.isLink()) {
        // Extract link details
        links.push({
          startFactor:
            cell.getSourceCell()?.attributes?.attrs?.label?.text || "",
          endFactor: cell.getTargetCell()?.attributes?.attrs?.label?.text || "",
          weight: cell.attributes.weight || 1, // Default weight is 1
          trainable: cell.attributes.trainable || false, // Default trainable is false
        });
      } else if (cell.isElement()) {
        // Extract factor details
        const factorName = cell.attributes.attrs.label.text;
        factors[factorName] = {
          data: cell.attributes.factor || {}, // Assuming factor data is stored in attributes.factor
          position: cell.position(), // Store position for reference
        };
      }
    });

    return { modelName, links, factors, selectedTarget };
  };

  // const retrainModel = async (graphData) => {
  //   try {
  //     const response = await axios.post(`${apiUrl}/api/retrain`, graphData);
  //     const updatedWeights = response.data.updated_weights;

  //     updateGraphWeights(graphRef.current.graph, updatedWeights);
  //     alert("Model retrained successfully!");
  //   } catch (error) {
  //     console.error("Error during retraining:", error);
  //     alert("Failed to retrain the model.");
  //   }
  // };
  const retrainModel = async (graphData) => {
    try {
      const response = await axios.post(`${apiUrl}/api/retrain`, graphData);
      const { updated_links, model_quality } = response.data; // Destructure the response

      console.log("response.data: ", response.data);

      if (!updated_links || !Array.isArray(updated_links)) {
        throw new Error("Invalid updated weights received from the server.");
      }

      // Update the graph weights
      updateGraphWeights(graphRef.current.graph, updated_links);

      // Update the model quality
      setModelQuality(model_quality.toFixed(2)); // Round to 2 decimal places

      alert("Model retrained successfully!");
    } catch (error) {
      console.error("Error during retraining:", error);
      alert("Failed to retrain the model.");
    }
  };

  const handleRetrainClick = () => {
    const graph = graphRef.current.graph; // Assuming `graphRef` holds the JointJS graph instance

    const cells = graph.getCells();
    if (cells.length === 0) {
      alert("Cannot train an empty model");
      return;
    }

    // Check if a target factor is selected
    if (!selectedTarget) {
      alert("Please select a target factor to train the model");
      return;
    }

    // Check if there is at least one link to the target factor
    const links = cells.filter((cell) => cell.isLink());
    const targetLinks = links.filter(
      (link) =>
        link.getTargetCell()?.attributes?.attrs?.label?.text === selectedTarget
    );

    if (targetLinks.length === 0) {
      alert("There should be at least one link to the target factor");
      return;
    }
    const graphData = extractGraphData(graph);

    console.log("Extracted Graph Data:", graphData);

    // Send data to backend or process further
    retrainModel(graphData);
  };

  // const updateGraphWeights = (graph, updatedWeights) => {
  //   updatedWeights.forEach((updatedLink) => {
  //     const link = graph
  //       .getLinks()
  //       .find(
  //         (l) =>
  //           l.getSourceCell()?.attributes?.attrs?.label?.text ===
  //             updatedLink.startFactor &&
  //           l.getTargetCell()?.attributes?.attrs?.label?.text ===
  //             updatedLink.endFactor
  //       );

  //     if (link && link.attributes.trainable) {
  //       link.set("weight", updatedLink.new_weight);
  //       console.log(
  //         `Updated weight for link ${updatedLink.startFactor} -> ${updatedLink.endFactor}`
  //       );
  //     }
  //   });
  // };
  const updateGraphWeights = (graph, updatedLinks) => {
    updatedLinks.forEach((updatedLink) => {
      const link = graph
        .getLinks()
        .find(
          (l) =>
            l.getSourceCell()?.attributes?.attrs?.label?.text ===
              updatedLink.startFactor &&
            l.getTargetCell()?.attributes?.attrs?.label?.text ===
              updatedLink.endFactor
        );

      if (link && link.attributes.trainable) {
        const roundedWeight =
          Math.round(updatedLink.normalized_weight * 100) / 100; // Round to 2 decimal places
        link.set("weight", roundedWeight);

        // Update link appearance
        link.attr({
          line: {
            stroke: linkModal.getLinkColor(roundedWeight), // Update color
            strokeWidth: linkModal.getLinkThickness(roundedWeight), // Update thickness
          },
        });

        console.log(
          `Updated weight for link ${updatedLink.startFactor} -> ${updatedLink.endFactor}`
        );
      }
    });
  };

  const addRectangleToGraph = (factor) => {
    if (addedFactors.includes(factor._id)) {
      alert(`${factor.name} is already added to the canvas.`);
      return;
    }

    const portsOut = {
      position: {
        name: "right",
      },
      attrs: {
        label: { text: "out" },
        portBody: {
          magnet: true,
          r: 4,
          fill: "black",
          stroke: "white",
        },
      },
      markup: [
        {
          tagName: "circle",
          selector: "portBody",
        },
      ],
    };

    let rectColor = factor.color || "#8e7fa2"; // Default purple color

    // Check if factorName is in targetVariables and change color accordingly
    if (targetVariables.includes(factor)) {
      rectColor = "#80396e";
    }

    if (graphRef.current && graphRef.current.graph) {
      const newX = lastRectPosition.x + 10;
      const newY = lastRectPosition.y + 10;
      const rect = new joint.shapes.standard.Rectangle({
        ports: {
          groups: {
            out: portsOut,
          },
        },
        factor: factor,
        markup: [
          { tagName: "rect", selector: "body" },
          { tagName: "text", selector: "label" },
        ],
      });
      rect.position(newX, newY); // Adjust position as needed
      rect.resize(120, 40);
      rect.attr({
        body: {
          fill: rectColor, // Purple color
          // borderRadius: "3px",
          stroke: "#121212",
          strokeWidth: 1,
        },
        label: {
          text: factor.name,
          fill: "white",
          fontSize: 10, // Smaller font size
        },
      });

      rect.addPorts([
        {
          group: "out",
        },
      ]);
      // rect.on("element:pointerclick", () => handleOpenPopover(factor));
      graphRef.current.graph.addCells(rect);
      console.log("Graph is: ", JSON.stringify(graphRef.current.graph));
      setLastRectPosition({ x: newX, y: newY });

      setAddedFactors([...addedFactors, factor._id]);
    }
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

          // Update the link's appearance
          linkView.model.attr({
            line: {
              stroke: linkModal.getLinkColor(updatedData.weight), // Use the helper function
              strokeWidth: linkModal.getLinkThickness(updatedData.weight), // Use the helper function
            },
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

  // const createLinkBetweenSelected = (weight) => {
  //   if (selectedElements.length === 2) {
  //     const link = new joint.shapes.standard.Link();
  //     link.source(selectedElements[0]);
  //     link.target(selectedElements[1]);
  //     link.attr({
  //       line: {
  //         stroke: "#000",
  //         strokeWidth: 2,
  //       },
  //       label: {
  //         position: 0.5,
  //         text: `Weight: ${weight}`, // You can customize the weight here
  //         fill: "#000",
  //       },
  //     });
  //     link.addTo(graphRef.current);

  //     // Clear selection after linking
  //     setSelectedElements([]);
  //     // Reset colors
  //     selectedElements.forEach((el) => el.attr("body/fill", "#8e7fa2"));
  //   } else {
  //     alert("Please select exactly two rectangles to create a link.");
  //   }
  // };

  const convertGraphToSavableFormat = (graph) => {
    const allCells = graph.getCells();
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    // Access the username from the retrieved object
    const userId = loggedUser ? loggedUser.id : null;
    console.log("logged user is: ", loggedUser);

    const coreData = {
      name: modelName,
      description: "A brief description of the model",
      links: [],
      target_factor: selectedTarget,
      creator: userId,
      quality: modelQuality, // Include the training quality
      deleted: false,
      graphData: JSON.stringify(graph),
    };

    allCells.forEach((cell) => {
      if (cell.isLink()) {
        const linkData = {
          start_factor: cell.getSourceCell().attributes.attrs.label.text,
          end_factor: cell.getTargetCell().attributes.attrs.label.text,
          weight: cell.attributes.weight || 1,
          trainable: cell.attributes.trainable || true,
        };
        coreData.links.push(linkData);
      }
    });

    return coreData;
  };

  const saveGraphToAPI = async (graph) => {
    if (!modelName.trim()) {
      alert("Model name cannot be empty.");
      return;
    }

    // Check if the canvas is empty
    const cells = graph.getCells();
    if (cells.length === 0) {
      alert("The graph cannot be empty.");
      return;
    }

    // Check if a target factor is selected
    if (!selectedTarget) {
      alert("Please select a target factor.");
      return;
    }

    // Check if there is at least one link to the target factor
    const links = cells.filter((cell) => cell.isLink());
    const targetLinks = links.filter(
      (link) =>
        link.getTargetCell()?.attributes?.attrs?.label?.text === selectedTarget
    );

    if (targetLinks.length === 0) {
      alert("There should be at least one link to the target factor.");
      return;
    }

    const savableData = convertGraphToSavableFormat(graph);

    try {
      const response = await fetch(`${apiUrl}/api/models`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...savableData,
          quality: modelQuality, // Include the training quality
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Model saved successfully:", result);
        alert("Model saved successfully!");
      } else {
        console.error("Failed to save models:", result.message);
        alert(result.message || "Failed to save models.");
      }
    } catch (error) {
      console.error("Error saving models:", error);
      alert("An error occurred while saving models.");
    }
  };

  const handleSaveChanges = (updatedFactorData) => {
    const updatedRectangle = { ...selectedRectangle };
    updatedRectangle.attributes.factor.time_series_data = updatedFactorData;

    // Update state with modified rectangle
    setSelectedRectangle(updatedRectangle);

    // Optionally update selectedFactorData if needed
    setSelectedFactorData(updatedFactorData);

    console.log("Updated Rectangle:", updatedRectangle);
    console.log("Updated Factor Data:", updatedFactorData);

    // Close chart after saving changes
    setIsChartVisible(false);
  };

  return (
    <Box sx={{ height: "100%", backgroundColor: "white" }}>
      <AppBar
        position="static"
        sx={{
          display: "flex",
          height: "8vh",
          backgroundColor: "#F4C2C2",
          flexDirection: "row",
        }}
      >
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/aimm-logo.png`}
            alt="AIMM"
            style={{ height: "40px", marginRight: "10px", paddingLeft: "10px" }}
          />
          <Typography
            variant="h5"
            sx={{
              fontSize: "1.6rem", // Adjust size
              color: "black", // Change text color
              fontWeight: "800",
              fontFamily: "Nunito Sans, sans-serif",
            }}
          >
            AI Mental Modeler
          </Typography>
        </IconButton>
        <PopupState variant="popper" popupId="avatar-popup-popper">
          {(popupState) => (
            <>
              <Avatar
                {...bindToggle(popupState)}
                sx={{
                  cursor: "pointer",
                  marginLeft: "auto",
                  marginRight: "12px",
                  marginTop: "16px",
                }}
              >
                {loggedUser.username.charAt(0).toUpperCase()}
              </Avatar>

              {/* Popup Content */}
              <Popper {...bindPopper(popupState)} transition>
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper
                      sx={{
                        marginTop: "16px",
                        width: "300px",
                        padding: "10px",
                        backgroundColor: "#ecf2ff",
                        zIndex: 2,
                      }}
                    >
                      {/* My Models Section */}
                      <Box>
                        {userModels.length === 0 ? (
                          <Typography sx={{ color: "black" }}>
                            No models found.
                          </Typography>
                        ) : (
                          userModels.map((model) => (
                            <Box
                              key={model.id}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "10px",
                              }}
                            >
                              <Typography
                                sx={{ color: "black", fontSize: "0.875rem" }}
                              >
                                {model.name}
                              </Typography>
                              <Box>
                                {/* View Button */}
                                <CustomButton
                                  onClick={() => handleViewModel(model)}
                                >
                                  View
                                </CustomButton>

                                {/* Delete Button */}
                                <DeleteButton
                                  onClick={() => handleDeleteModel(model.id)}
                                >
                                  Delete
                                </DeleteButton>
                              </Box>
                            </Box>
                          ))
                        )}
                      </Box>

                      {/* Logout Button */}
                      <Box sx={{ marginTop: "10px" }}>
                        <CustomButton
                          color="inherit"
                          onClick={handleLogout}
                          fullWidth
                        >
                          Logout
                        </CustomButton>
                      </Box>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </AppBar>
      <Grid container sx={{ display: "flex", maxHeight: "92vh" }}>
        <Box
          sx={{
            paddingTop: "12px",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            maxWidth: "20vw",
            borderRadius: "3px",
            backgroundColor: "#ff9c9c",
            boxShadow: "6px 0px 10px rgb(254 176 176 / 20%)",
            overflowY: "auto",
            transition: "transform 0.3s ease-in-out",
            transform: isCollapsed ? "translateX(-100%)" : "translateX(0)",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            // zIndex: 1000,
          }}
          gap={2}
        >
          <Box
            sx={{
              margin: "3px",
              padding: "4px",
              borderRadius: "3px",
              // boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0.2)", // Darker shadow
              paddingTop: "6px",
              // backgroundColor: "#3f3f3f",
            }}
          >
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/aimm-logo.png`}
                alt="AIMM"
                style={{ height: "40px", marginRight: "10px" }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Nunito Sans, sans-serif",
                  fontWeight: "600",
                  fontSize: "1.6rem", // Adjust size
                  color: "black", // Change text color
                }}
              >
                AI Mental Modeler
              </Typography>
              {/* AI Mental Modeler */}
            </IconButton>

            <SearchBar>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onInput={onSearchInput}
                placeholder="Search factors..."
              />
              <CustomButton onClick={onSearchInput}>Search</CustomButton>
            </SearchBar>
            {filteredFactors.length > 0 && (
              <div>
                {filteredFactors.map((factor) => (
                  <FactorItem
                    key={factor._id}
                    onClick={() => addFactorToDragArea(factor)}
                  >
                    {factor.name}
                  </FactorItem>
                ))}
              </div>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              marginX: "6px",
              margin: "3px",
              border: "0.5px solid #a19b9b",
              borderRadius: "10px",
              paddingTop: "6px",
              padding: "12px",
              backgroundColor: "#F4C2C2",
              gap: "4px",
            }}
          >
            <Typography
              sx={{
                color: "black",
                textAlign: "left",
                width: "100%",
                padding: "8px",
                // background: "#f57c7c",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              Target Factors
            </Typography>
            {targetVariables.map((variable) => (
              <Tooltip
                key={variable._id}
                title={variable.description} // Display the factor's description
                placement="right" // Adjust placement as needed (top, bottom, left, right)
                arrow // Add an arrow to the tooltip
              >
                <CustomButton
                  key={variable._id}
                  onClick={() => {
                    setSelectedTarget(variable.name);
                    addRectangleToGraph(variable);
                  }}
                >
                  {variable.name}
                </CustomButton>
              </Tooltip>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              margin: "3px",
              border: "solid 0.5px #a19b9b",
              borderRadius: "8px",
              padding: "12px",
              backgroundColor: "#F4C2C2",
              gap: "4px",
              maxHeight: "200px",
              cursor: "pointer",
            }}
            onClick={handleToggleExpand}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                // background: "#f57c7c",
                borderRadius: "8px",
                padding: "8px",
              }}
            >
              <Typography
                sx={{
                  color: "black",
                  textAlign: "left",
                }}
              >
                Factors
              </Typography>
              {isExpanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </Box>
            {isExpanded && (
              <Box
                sx={{
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column", // List items vertically
                  gap: "4px", // Space between items
                }}
              >
                {adminFactors.map((factor) => (
                  <Tooltip
                    key={factor._id}
                    title={factor.description} // Display the factor's description
                    placement="right" // Adjust placement as needed (top, bottom, left, right)
                    arrow // Add an arrow to the tooltip
                  >
                    <Box
                      sx={{
                        fontSize: "small",
                        padding: "8px",
                        borderRadius: "2px",
                        cursor: "pointer",
                        backgroundColor: "#e7a9a9", // Default background color
                        "&:hover": {
                          backgroundColor: "#D8A2A2", // Darker shade on hover
                          transform: "scale(1.05)",
                        },
                        fontWeight: "500", // Heavier font
                        fontFamily: "Nunito Sans, sans-serif",
                        marginLeft: "4px",
                      }}
                      key={factor._id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        addRectangleToGraph(factor);
                      }}
                    >
                      <Typography sx={{ fontSize: "0.75rem" }}>
                        {factor.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              margin: "3px",
              border: "solid 0.5px #a19b9b",
              borderRadius: "8px",
              padding: "12px",
              backgroundColor: "#F4C2C2",
              gap: "4px",
              maxHeight: "200px",
              cursor: "pointer",
            }}
            onClick={handleCustomToggleExpand}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                // background: "#f57c7c",
                borderRadius: "8px",
                padding: "8px",
              }}
            >
              <Typography
                sx={{
                  color: "black",
                  textAlign: "left",
                }}
              >
                Custom Factors
              </Typography>
              {isCustomExpanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </Box>
            {isCustomExpanded && (
              <Box
                sx={{
                  overflowY: "auto", // Vertical auto-flow (scrollable)
                  display: "flex",
                  flexDirection: "column", // List items vertically
                  gap: "4px", // Space between items
                }}
              >
                {userFactors.map((factor) => (
                  <Tooltip
                    key={factor._id}
                    title={factor.description} // Display the factor's description
                    placement="right" // Adjust placement as needed (top, bottom, left, right)
                    arrow // Add an arrow to the tooltip
                  >
                    <Box
                      sx={{
                        fontSize: "small",
                        padding: "8px",
                        borderRadius: "2px",
                        cursor: "pointer",
                        backgroundColor: "#e7a9a9", // Default background color
                        "&:hover": {
                          backgroundColor: "#D8A2A2", // Darker shade on hover
                          transform: "scale(1.05)",
                        },
                        fontWeight: "500", // Heavier font
                        fontFamily: "Georgia, serif", // Classy font
                        marginLeft: "4px",
                      }}
                      key={factor._id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        addRectangleToGraph(factor);
                      }}
                    >
                      <Typography sx={{ fontSize: "0.75rem" }}>
                        {factor.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <CustomButton onClick={openAddFactorModal}>Add Factor</CustomButton>
          </Box>
        </Box>
        {showAddFactorModal && (
          <AddFactorModal
            onClose={closeAddFactorModal}
            onAddSuccess={handleAddSuccess}
          />
        )}
        <Button
          onClick={toggleSidebar}
          sx={{
            position: "fixed",
            left: isCollapsed ? "0" : "21.3vw", // Adjust based on sidebar width
            top: "140px", // Adjust to position below the title bar
            transition: "left 0.3s ease-in-out",
            backgroundColor: "black",
            color: "white",
            borderRadius: "4px",
            border: "none",
            minWidth: "20px",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#615050",
            },
          }}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </Button>

        <Grid
          item
          md
          sx={{
            paddingTop: "12px",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ecf2ff",
            color: "#000000",
            height: "92vh",
            flexGrow: 1,
            marginLeft: isCollapsed ? "0" : "20vw", // Dynamic margin based on collapse state
            width: isCollapsed
              ? "calc(100% - 300px)"
              : "calc(100% - 20vw - 300px)", // Adjust width to account for the right box
            transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out", // Smooth transition
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignContent: "center",
              padding: "8px",
              borderRadius: "10px",
              boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0.2)", // Darker shadow
              paddingTop: "10px",
              backgroundColor: "white",
              marginBottom: "10px",
            }}
          >
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder=" Enter Model Name..."
              style={{
                width: "300px",
                borderRadius: "3px",
              }}
            />

            <Box>
              <CustomButton
                onClick={() => {
                  saveGraphToAPI(graphRef.current.graph);
                }}
              >
                Save
              </CustomButton>
              <CustomButton onClick={handleRetrainClick}>Retrain</CustomButton>
            </Box>
          </Box>

          <Box
            ref={graphRef}
            sx={{
              borderRadius: "10px",
              boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0.2)",
              backgroundColor: "white",
              background: "url('/dotBackground.jpeg')",
            }}
          ></Box>
          {/* {isChartVisible && selectedFactorData && (
            <ChartComponent
              factorData={selectedFactorData}
              setSelected={setSelectedFactorData}
              selectedRectangle={selectedRectangle}
              onClose={() => setIsChartVisible(false)}
              onSave={handleSaveChanges}
              // ref={chartRef}
            />
          )} */}
          {isChartVisible && selectedFactorData && (
            <ResizableChartComponent
              factorData={selectedFactorData}
              factorName={selectedFactorName}
              onClose={() => setIsChartVisible(false)}
              onSave={handleSaveChanges}
            />
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center", // Center content vertically
              marginTop: "12px",
              padding: "8px",
              borderRadius: "10px",
              boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0.2)", // Darker shadow
              paddingTop: "6px",
              backgroundColor: "white",
              color: "black",
              flexGrow: 1, // Makes this Box fill the remaining space
            }}
          >
            <Typography>
              Training Quality:{" "}
              {modelQuality !== "Not trained yet"
                ? modelQuality
                : "Not trained yet"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center", // Center CustomButton vertically
              }}
            >
              <DeleteButton onClick={() => handleClear()}>Clear</DeleteButton>
            </Box>
          </Box>
        </Grid>
        {/* Third Box */}
        <Grid
          item
          md
          sx={{
            maxWidth: "300px",
            paddingTop: "12px",
            padding: "10px",
            maxHeight: "92vh",
            backgroundColor: "#ecf2ff", // Dark grey background
            color: "black", // White text for contrast
            height: "100vh",
            flexDirection: "column",
            flexGrow: 1, // Ensures it fills the remaining space
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              borderRadius: "10px",
              boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0.2)", // Darker shadow
              height: "83vh",
              overflow: "auto",
              backgroundColor: "white",
            }}
          >
            {/* Existing Models Heading (Outside the Loop) */}
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                background: "#F4C2C2",
                padding: "12px",
                borderRadius: "10px 10px 0 0",
                fontWeight: "800",
                fontFamily: "Nunito Sans, sans-serif",
                position: "sticky", // Make it sticky
                top: 0, // Stick to the top
                borderBottom: 0.5,
              }}
            >
              Existing Models
            </Typography>

            {/* Loop for User Groups and Models */}
            {modelLevels.map((level) => (
              <Box
                key={level.level}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                {/* User Group Heading */}
                <Typography
                  sx={{
                    width: "100%",
                    fontSize: "18px",
                    padding: "4px",
                    marginBottom: "16px",
                    border: "0.5px solid #a19b9b",
                    borderRadius: "6px",
                    paddingLeft: "8px",
                    fontWeight: "600",
                    fontFamily: "Nunito Sans, sans-serif",
                    color: "white",
                    bgcolor: "#666b73",
                  }}
                >
                  User Group {level.level}
                </Typography>

                {/* Loop for Models */}
                {level.models.map((model) => (
                  <Box
                    key={model.name}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginBottom: "16px",
                      border: "solid 0.5px #cfcccc",
                      backgroundColor: "#fad9d9",
                      gap: 2,
                      paddingTop: "4px",
                      paddingBottom: "8px",
                      borderRadius: "5px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: "800",
                        fontFamily: "Nunito Sans, sans-serif",
                      }}
                    >
                      {model.name}
                    </Typography>
                    <Box
                      sx={{
                        width: "80%",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={{ fontSize: "14px" }}>
                        Quality: {model.quality || "Not Applicable"}
                      </Typography>
                      <Typography
                        onClick={() => handleVisualize(model)}
                        sx={{
                          color: "blue",
                          fontSize: "14px",
                          cursor: "pointer",
                          border: "solid 0.5px #cfcccc",
                        }}
                      >
                        View
                      </Typography>
                    </Box>
                    <ModelVisualization
                      model={selectedModel}
                      open={showVisualization}
                      onClose={() => setShowVisualization(false)}
                      onDuplicate={handleDuplicateGraph}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
