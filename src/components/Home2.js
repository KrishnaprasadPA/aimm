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
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Modal,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAuth } from "../context/AuthContext";

const HomeContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #f8bbd0;
  padding: 16px;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #fce4ec;
`;

const MiddleColumn = styled.div`
  flex-grow: 1;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  margin: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const RightColumn = styled.div`
  width: 250px;
  background-color: #f8bbd0;
  padding: 16px;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 16px;

  input {
    flex: 1;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  button {
    padding: 8px 16px;
    border: none;
    background-color: #e91e63;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 8px;
  }
`;

const PredictionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  button {
    padding: 8px 10px;
    border: none;
    background-color: #e91e63;
    color: #fff;
    border-radius: 4px;
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
  padding: 8px;
  gap: 4px;
`;

const FactorItem = styled.div`
  background-color: #e91e63;
  padding: 4px 8px;
  margin: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  color: white;
  font-size: 12px;

  &:hover {
    transform: scale(1.05);
  }
`;

const DragDropArea = styled.div`
  flex-grow: 1;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 16px;
  min-height: 200px;
`;

const ModelActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModelNameInput = styled.input`
  flex: 1;
  padding: 8px;
  margin-right: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const CustomButton = styled.button`
  padding: 8px 16px;
  border: none;
  background-color: #e91e63;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  &:hover {
    background-color: #d81b60;
  }
  &:active {
    background-color: #c2185b;
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  border: none;
  background-color: #ff4d4d;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  &:hover {
    background-color: #e64545;
  }
`;

const apiUrl = process.env.REACT_APP_API_URI;

const Home2 = () => {
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
  const [sourceElement, setSourceElement] = React.useState(null);
  const [sourcePort, setSourcePort] = React.useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFactors, setFilteredFactors] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const openAddFactorModal = () => setShowAddFactorModal(true);

  const graphRef = useRef(null);
  const paperRef = useRef(null);
  const [selectedElements, setSelectedElements] = React.useState([]);
  const linkModal = new LinkModal();
  const [duplicatedGraphData, setDuplicatedGraphData] = useState(null);
  const [selectedFactorData, setSelectedFactorData] = useState(null);
  const [selectedRectangle, setSelectedRectangle] = useState(null);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [userModels, setUserModels] = useState([]);
  const [expanded, setExpanded] = useState(false);

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
        const factor = element.get("factor");
        handleOpenPopover(element);
      }
    });

    if (duplicatedGraphData) {
      try {
        graph.fromJSON(duplicatedGraphData);
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

  const handleOpenPopover = (element) => {
    const timeSeriesData = element.attributes.factor.time_series_data;

    setSelectedFactorData(timeSeriesData);
    setSelectedRectangle(element);
    setIsChartVisible(true);
  };

  const handleAddSuccess = () => {
    console.log("Factor added to the system.");
  };

  const handleVisualize = (model) => {
    if (model) {
      setSelectedModel(model);
      setShowVisualization(true);
    }
  };

  const handleDuplicateGraph = (graphData) => {
    setDuplicatedGraphData(graphData);
    setModelName(selectedModel.name + "-copy");
    setSelectedTarget(selectedModel.target_factor);
  };

  const handleClear = () => {
    if (graphRef.current && graphRef.current.graph) {
      graphRef.current.graph.clear();
      setSelectedModel(null);
      setModelName("");
    }
  };

  const loadTargets = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/target`);
      setTargetVariables(response.data);
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
    setShowVisualization(true);
  };

  const handleDeleteModel = async (modelId) => {
    try {
      await axios.delete(`${apiUrl}/api/models/delete/${modelId}`);
      setUserModels(userModels.filter((model) => model.id !== modelId));
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  const addRectangleToGraph = (factor) => {
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

    let rectColor = "#8e7fa2"; // Default purple color

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

  const createLinkBetweenSelected = (weight) => {
    if (selectedElements.length === 2) {
      const link = new joint.shapes.standard.Link();
      link.source(selectedElements[0]);
      link.target(selectedElements[1]);
      link.attr({
        line: {
          stroke: "#000",
          strokeWidth: 2,
        },
        label: {
          position: 0.5,
          text: `Weight: ${weight}`, // You can customize the weight here
          fill: "#000",
        },
      });
      link.addTo(graphRef.current);

      // Clear selection after linking
      setSelectedElements([]);
      // Reset colors
      selectedElements.forEach((el) => el.attr("body/fill", "#8e7fa2"));
    } else {
      alert("Please select exactly two rectangles to create a link.");
    }
  };

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
      quality: 0.12,
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

    // const graphData = graph.toJSON();
    return JSON.stringify(coreData);
  };

  const saveGraphToAPI = async (graph) => {
    const savableData = convertGraphToSavableFormat(graph);

    try {
      const response = await fetch(`${apiUrl}/api/models`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: savableData,
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
    console.log(graph);
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const username = loggedUser ? loggedUser.username : null;

    console.log(username);
  };

  const addFactorToDragArea = (factor) => {
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

  const handleRetrainClick = () => {
    const graph = graphRef.current.graph; // Assuming `graphRef` holds the JointJS graph instance
    const graphData = extractGraphData(graph);

    console.log("Extracted Graph Data:", graphData);

    // Send data to backend or process further
    retrainModel(graphData);
  };

  const retrainModel = async (graphData) => {
    try {
      const response = await axios.post(`${apiUrl}/api/retrain`, graphData);
      const updatedWeights = response.data.updated_weights;

      updateGraphWeights(graphRef.current.graph, updatedWeights);
      alert("Model retrained successfully!");
    } catch (error) {
      console.error("Error during retraining:", error);
      alert("Failed to retrain the model.");
    }
  };

  const updateGraphWeights = (graph, updatedWeights) => {
    updatedWeights.forEach((updatedLink) => {
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
        link.set("weight", updatedLink.new_weight);
        console.log(
          `Updated weight for link ${updatedLink.startFactor} -> ${updatedLink.endFactor}`
        );
      }
    });
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

  const handleSaveChanges = (updatedFactorData) => {
    const updatedRectangle = { ...selectedRectangle };
    updatedRectangle.attributes.factor.time_series_data = updatedFactorData;

    setSelectedRectangle(updatedRectangle);
    setSelectedFactorData(updatedFactorData);
    setIsChartVisible(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <HomeContainer>
      <Sidebar style={{ width: isSidebarCollapsed ? "64px" : "250px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          {!isSidebarCollapsed && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={`${process.env.PUBLIC_URL}/aimm-logo.png`}
                alt="AIMM"
                style={{ height: "40px", marginRight: "10px" }}
              />
              <Typography variant="h5">AI Mental Modeler</Typography>
            </Box>
          )}
          <IconButton onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
        </Box>
        {!isSidebarCollapsed && (
          <>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Target Factors</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {targetVariables.map((variable) => (
                    <ListItem
                      key={variable._id}
                      button
                      onClick={() => {
                        setSelectedTarget(variable.name);
                        addRectangleToGraph(variable);
                      }}
                    >
                      <ListItemText primary={variable.name} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Admin Factors</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {adminFactors.map((factor) => (
                    <ListItem
                      key={factor._id}
                      button
                      onClick={() => addRectangleToGraph(factor)}
                    >
                      <ListItemText primary={factor.name} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">User Factors</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {userFactors.map((factor) => (
                    <ListItem
                      key={factor._id}
                      button
                      onClick={() => addRectangleToGraph(factor)}
                    >
                      <ListItemText primary={factor.name} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={openAddFactorModal}
            >
              Add Factor
            </Button>
          </>
        )}
      </Sidebar>
      <MainContent>
        <AppBar
          position="static"
          sx={{ backgroundColor: "#e91e63", boxShadow: "none" }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Model Builder
            </Typography>
            <IconButton onClick={toggleUserMenu}>
              <AccountCircleIcon />
            </IconButton>
            <Popper open={isUserMenuOpen} anchorEl={document.body}>
              <Paper>
                <List>
                  <ListItem button onClick={() => setShowModels(true)}>
                    <ListItemText primary="View My Models" />
                  </ListItem>
                  <ListItem button onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                  </ListItem>
                </List>
              </Paper>
            </Popper>
          </Toolbar>
        </AppBar>
        <MiddleColumn>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <TextField
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter Model Name..."
              fullWidth
              sx={{ marginRight: "16px" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => saveGraphToAPI(graphRef.current.graph)}
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRetrainClick}
            >
              Retrain
            </Button>
          </Box>
          <Box
            ref={graphRef}
            sx={{
              flexGrow: 1,
              border: "2px dashed #ddd",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          ></Box>
          {isChartVisible && selectedFactorData && (
            <ChartComponent
              factorData={selectedFactorData}
              setSelected={setSelectedFactorData}
              selectedRectangle={selectedRectangle}
              onClose={() => setIsChartVisible(false)}
              onSave={handleSaveChanges}
            />
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography>
              Training Quality:{" "}
              {duplicatedGraphData
                ? selectedModel?.quality || "Not trained yet"
                : "NA"}
            </Typography>
            <Button variant="contained" color="error" onClick={handleClear}>
              Clear
            </Button>
          </Box>
        </MiddleColumn>
      </MainContent>
      <RightColumn>
        <Typography
          variant="h5"
          sx={{ textAlign: "center", marginBottom: "16px" }}
        >
          Existing Models
        </Typography>
        {modelLevels.map((level) => (
          <Box key={level.level} sx={{ marginBottom: "16px" }}>
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              User Group {level.level}
            </Typography>
            {level.models.map((model) => (
              <Box
                key={model.name}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <Typography>{model.name}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleVisualize(model)}
                >
                  Visualize
                </Button>
              </Box>
            ))}
          </Box>
        ))}
      </RightColumn>
    </HomeContainer>
  );
};

export default Home2;
