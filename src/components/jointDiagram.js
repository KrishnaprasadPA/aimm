import React, { useEffect, useState, useMemo, useRef } from "react";
import * as joint from "jointjs";
import PouchDB from "pouchdb";
import pouchdbFind from "pouchdb-find";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Alert, AlertIcon, CloseButton } from "@chakra-ui/react";
import {
  addElementTools,
  fetchNextVersionNumber,
  saveGraphToPouch,
} from "./utils";
import { Component } from "./Schema";
import { debounce, head, update } from "lodash";
import { Heading } from "@chakra-ui/react";
import {
  AiFillSave,
  AiOutlinePlus,
  AiOutlineFolderOpen,
  AiOutlineReload,
} from "react-icons/ai";
import { Icon } from "@chakra-ui/react";
import Papa from "papaparse";
import Chart from "chart.js/auto";
import "chartjs-plugin-dragdata";
import ChartDataLabels from "chartjs-plugin-dragdata";
import PopoverChart from "./PopoverChart";
import ChartComponent from "./chartComponent";
import ApiManager from "./ApiManager";
import { layoutOptions, scaleOptions } from "./constants";
import GraphManager from "./GraphManager";
import WeightManager from "./WeightManager";
import { MdOutlineBatchPrediction } from "react-icons/md";
import CSVFileGenerator from "./CSVFileGenerator";
import { AiFillFileExcel } from "react-icons/ai";
import { Switch, FormLabel } from "@chakra-ui/react";

PouchDB.plugin(pouchdbFind);

const pouchDB = new PouchDB("my_graph_data", { adapter: "idb" });

const JointDiagram = ({
  graph,
  setGraph,
  graphName,
  setGraphName,
  versionNumber,
  setVersionNumber,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    shapes: defaultShapes,
    dia,
    connectionStrategies,
    elementTools,
  } = joint;
  const [components, setComponents] = useState(() => {
    return graph ? graph.getCells().filter((cell) => !cell.isLink()) : [];
  });
  Chart.register(ChartDataLabels);

  components.forEach((component) => {
    const componentName = component.get("componentName");
    component.attr("componentname/props/value", componentName);
  });
  const [isGraphNameEmpty, setIsGraphNameEmpty] = useState(false);
  const [isFilePopulated, setIsFilePopulated] = useState(false);
  const paperRef = useRef(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const defaultScale = 1;
  const [sliderValue, setSliderValue] = useState(0);
  const [openPopovers, setOpenPopovers] = useState([]);
  const [groupSelections, setGroupSelections] = useState({});
  const [notification, setNotification] = useState({
    message: "",
    isVisible: false,
  });
  const [showToggle, setShowToggle] = useState(false);
  const [trainableStatus, setTrainableStatus] = useState(false);

  const graphManager = GraphManager.getInstance(graph);
  const weightManager = WeightManager.getInstance(graph);

  const getChartData = (chartId) => {
    const component = components.find((comp) => comp.id === chartId);
    return component ? component : null;
  };

  const combinedChartDataByGroup = useMemo(() => {
    const combinedData = {};

    Object.entries(groupSelections).forEach(([groupId, chartIds]) => {
      if (chartIds.length >= 2) {
        combinedData[groupId] = chartIds
          .map((chartId) => getChartData(chartId))
          .filter((data) => data !== null);
      }
    });

    return combinedData;
  }, [groupSelections]);

  const handleGroupSelection = (chartId, groupId) => {
    setGroupSelections((prevSelections) => {
      if (!groupId) {
        return Object.keys(prevSelections).reduce((acc, gid) => {
          acc[gid] = prevSelections[gid].filter((id) => id !== chartId);
          return acc;
        }, {});
      }

      if (!prevSelections[groupId]) {
        prevSelections[groupId] = [];
      }

      if (!prevSelections[groupId].includes(chartId)) {
        prevSelections[groupId] = [...prevSelections[groupId], chartId];
      }

      return Object.keys(prevSelections).reduce((acc, gid) => {
        if (gid !== groupId) {
          acc[gid] = prevSelections[gid].filter((id) => id !== chartId);
        } else {
          acc[gid] = prevSelections[gid];
        }
        return acc;
      }, {});
    });
  };

  const handleUnitChange = (e) => {
    if (selectedComponent) {
      selectedComponent.set("unitOfMeasurement", e.target.value);
    }
  };
  useEffect(() => {
    if (!paperRef.current) {
      paperRef.current = new dia.Paper({
        el: document.getElementById("paper-container"),
        width: "100%",
        height: "100%",
        model: graph,
        markAvailable: true,
        async: true,
        cellViewNamespace: {
          ...joint.shapes,
          custom: { Component },
        },
        drawGrid: { name: "mesh" },
        sorting: dia.Paper.sorting.APPROX,
        defaultLink: () => new joint.shapes.standard.Link(),
        moveThreshold: 5,
        defaultConnector: {
          name: "smooth",
        },
        background: {
          color: "white",
        },
        validateConnection: (srcView, _, tgtView) => {
          const src = srcView.model;
          const tgt = tgtView.model;
          const targetType = tgt.get("type");
          if (src.isLink() || tgt.isLink()) return false;
          if (src === tgt) return false;
          return targetType === "custom.Component";
        },
        highlighting: {
          connecting: {
            name: "addClass",
            options: {
              className: "highlighted-connecting",
            },
          },
        },
        connectionStrategy: (end, view, magnet, coords) => {
          const bbox = view.getNodeUnrotatedBBox(magnet);
          const p = bbox.pointNearestToPoint(coords);
          return connectionStrategies.pinRelative(end, view, magnet, p);
        },
        snapLinks: { radius: 10 },
        linkPinning: false,
        preventDefaultViewAction: false,
        interactive: function (cellView) {
          const cell = cellView.model;
          return cell.isLink()
            ? { linkMove: false, labelMove: false, vertexMove: false }
            : true;
        },
        elementView: dia.ElementView.extend({
          events: {
            "change input,select": "onInputChange",
          },
          onInputChange: function (evt) {
            const input = evt.target;
            if (!input.validity.valid) return;
            if (input.getAttribute("joint-selector") === "componentname") {
              this.model.set("componentName", input.value);
            } else {
              const valuePath =
                input.getAttribute("joint-selector") + "/props/value";
              const currentValue = this.model.attr(valuePath);
              this.model.attr(valuePath, input.value, {
                previousValue: currentValue,
                calc: true,
              });
            }
          },
        }),
      });

      paperRef.current.on("blank:pointerdown", () => {
        let sliderDiv = document.getElementById("slider-input");
        if (sliderDiv) {
          sliderDiv.style.display = "none";
        }
      });
    }
    graphManager.updateGraph(graph);
    weightManager.updateGraph(graph);
  }, [graph]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    saveGraphToPouch(pouchDB, graph, versionNumber, graphName, onClose);
    const username = localStorage.getItem("username"); // Retrieve username

    const autosaveGraphToMongoDB = async () => {
      const jsonObject = graph.toJSON();
      const document = {
        username: username,
        _id: graphName,
        state: {
          versionNumber: versionNumber,

          timestamp: new Date().toISOString(),
          data: JSON.stringify(jsonObject),
        },
      };
      try {
        const data = await ApiManager.saveGraphToMongoDB(document);
        console.log("Data saved to Flask server: this is auto saving", data);
      } catch (error) {
        console.error("Error saving data to Flask server:", error);
      }
    };

    const debouncedSaveToPouch = debounce(saveGraphToPouch, 10000); // Save to PouchDB after 10 seconds
    const debouncedSaveToMongoDB = debounce(autosaveGraphToMongoDB, 300000); // Save to MongoDB after 5 minutes

    const onChange = () => {
      debouncedSaveToPouch();
      debouncedSaveToMongoDB();
    };

    graph.on("change", onChange);

    return () => {
      graph.off("change", onChange);
      debouncedSaveToPouch.cancel();
      debouncedSaveToMongoDB.cancel();
    };
  }, [graph]);

  const showNotification = (message) => {
    setNotification({ message: message, isVisible: true });
    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
      setNotification((prevState) => ({ ...prevState, isVisible: false }));
    }, 5000);
  };

  const saveGraphToMongoDB = async () => {
    const jsonObject = graph.toJSON();
    const jsonString = JSON.stringify(jsonObject);
    const username = localStorage.getItem("username"); // Retrieve username

    if (!graphName.trim()) {
      setIsGraphNameEmpty(true);
      return;
    }

    const nextVersionNumber = await fetchNextVersionNumber(graphName);

    const document = {
      _id: graphName,
      username: username,

      state: {
        versionNumber: nextVersionNumber,
        timestamp: new Date().toISOString(),
        data: jsonString,
      },
    };

    try {
      const data = await ApiManager.saveGraphToMongoDB(document);
      console.log("Data saved to Flask server:", data);
      onClose();

      showNotification("Graph Saved!");

      setVersionNumber(nextVersionNumber);
    } catch (error) {
      console.error("Error saving data to Flask server:", error);
    }
  };
  const [lastRectPosition, setLastRectPosition] = useState({ x: 100, y: 30 });

  function addLinkTools(link, scale) {
    if (link && paperRef.current) {
      const targetAnchorTool = new joint.linkTools.TargetAnchor({ scale });
      const removeTool = new joint.linkTools.Remove({ scale });
      const buttonTool = new ButtonTool();
      const view = link.findView(paperRef.current);
      if (view) {
        view.addTools(
          new joint.dia.ToolsView({
            tools: [targetAnchorTool, removeTool, buttonTool],
          })
        );
      }
    }
  }

  const openNewPopover = (component) => {
    const newPopoverData = {
      id: component.id,
      componentData: component,
      position: getComponentPosition(component),
    };
    setOpenPopovers((prev) => {
      if (prev.some((popover) => popover.id === newPopoverData.id)) {
        return prev;
      }
      return [...prev, newPopoverData];
    });
  };

  const closePopover = (popoverId) => {
    setOpenPopovers((prev) => prev.filter((p) => p.id !== popoverId));
  };

  function handleSliderChange(evt) {
    const newValue = parseFloat(evt.target.value);
    const weightdisplayvalue = newValue.toFixed(2);

    setSliderValue(evt.target.value);
    let weightDisplay = document.getElementById("weight-display");
    if (weightDisplay) {
      weightDisplay.textContent = `${weightdisplayvalue}`;
    }

    if (selectedLink) {
      const linkColor = weightdisplayvalue >= 0 ? "blue" : "red";
      let maxweightfromweightmanager = weightManager.getMaxWeight();
      if (Math.abs(maxweightfromweightmanager) == Infinity) {
        maxweightfromweightmanager = 1;
      }
      console.log(
        "the max weight from weight manager is ",
        maxweightfromweightmanager
      );

      const strokeWidth =
        Math.abs(weightdisplayvalue) / maxweightfromweightmanager;

      console.log("the strokewidth is ", strokeWidth);
      if (strokeWidth === 0) {
        // If the value is zero, set the line to be dashed
        console.log("executing dashed lines");
        selectedLink.attr({
          line: {
            stroke: "grey",
            strokeDasharray: "10,5", // This makes the line dashed
            strokeWidth: 2,
          },
        });
      } else {
        selectedLink.attr({
          line: {
            stroke: linkColor,
            strokeDasharray: "0", // This makes the line solid
            strokeWidth: strokeWidth * 2,
          },
        });
      }
      selectedLink.set("dependency", newValue);
    }
  }

  const handleAddRectangle = () => {
    console.log("handle add rectangle is being called");
    if (graph) {
      const newX = lastRectPosition.x + 10;
      const newY = lastRectPosition.y + 10;
      let component = graphManager.createNewComponentWithPostion(
        "",
        newX,
        newY
      );
      graph.addCell(component);
      setLastRectPosition({ x: newX, y: newY });
      setComponents((prevComponents) => [...prevComponents, component]);
      const temp = graph.getCells().filter((cell) => !cell.isLink());
    }
  };
  useEffect(() => {
    setGraph(graph);
    graph
      .getElements()
      .forEach((element) =>
        addElementTools(element, defaultScale, paperRef.current)
      );
    graph.getLinks().forEach((link) => addLinkTools(link, defaultScale));
    const temp = graph.getCells().filter((cell) => !cell.isLink());
    temp.forEach((component) => {
      const componentName = component.get("componentName");
      component.attr("componentname/props/value", componentName);
    });
  }, [graph, setGraph]);

  const ButtonTool = elementTools.Button.extend({
    name: "button-tool",
    options: {
      markup: [
        {
          tagName: "circle",
          selector: "button",
          attributes: {
            r: 7,
            fill: "#001DFF",
            cursor: "pointer",
          },
        },
        {
          tagName: "path",
          selector: "icon",
          attributes: {
            d: "M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4",
            fill: "none",
            stroke: "#FFFFFF",
            "stroke-width": 2,
            "pointer-events": "none",
          },
        },
      ],
      distance: 20,
      rotate: true,
      action: function (evt) {
        setSelectedLink(this.model);
        setSliderValue(this.model.get("dependency"));
        setShowToggle(true);

        let weightValue = this.model.get("dependency");
        let sliderDiv = document.getElementById("slider-input");
        let toggleDiv = document.getElementById("toggle-switch");
        let weightDisplay = document.getElementById("weight-display");

        let slider = document.getElementById("slider");
        let rect = evt.target.getBoundingClientRect();

        weightDisplay.textContent = `${weightValue.toFixed(2)}`;
        sliderDiv.style.left = rect.left + "px";
        sliderDiv.style.top = rect.top + 90 + "px";
        toggleDiv.style.left = rect.left + "px"; // Position toggleDiv similar to sliderDiv
        toggleDiv.style.top = rect.top + 30 + "px";
        slider.value = weightValue;
        sliderDiv.style.display = "block";
        toggleDiv.style.display = "block"; // Show the toggle switch
      },
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log("No file was chosen");
      return;
    }
    setIsFilePopulated(true);
    readAndParseFile(file);
  };

  const readAndParseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        complete: handleParseComplete,
      });
    };
    reader.readAsText(file);
  };

  const handleParseComplete = async (results) => {
    graphManager.updateGraph(graph);

    const { fields: headers } = results.meta;
    const sourceColumn = headers[0];
    const destinationColumn = headers[1];
    let connectionsStart = false;

    results.data.forEach((row, index) => {
      if (index === 0) {
        graphManager.initializeComponents(row, headers);
      } else if (!connectionsStart && row[sourceColumn] === "Connections") {
        connectionsStart = true;
      } else if (!connectionsStart) {
        graphManager.populateComponentData(row, headers, sourceColumn);
      } else {
        graphManager.collectLinks(row, sourceColumn, destinationColumn);
      }
    });

    const newComponents = graphManager.createComponents(headers);
    setComponents(newComponents);
    graphManager.createAndAddLinks();

    performLayout();

    try {
      const responseData = await ApiManager.initiateModel(results);
      weightManager.updateGraph(graph);

      if (
        responseData["results"] == null ||
        Object.keys(responseData["results"]).length == 0
      ) {
        showNotification("Internal server error while training the model");
      } else {
        showNotification("Traning Successful");
      }

      weightManager.parseWeightReponse(responseData["results"]);
      updateLinkTools();
    } catch (error) {
      console.error("Error making API call:", error);
    }
  };

  const performLayout = () => {
    joint.layout.DirectedGraph.layout(graph, layoutOptions);
    paperRef.current.scaleContentToFit(scaleOptions);
    graph.getElements().forEach((element) => {
      let position = element.position();
      position = {
        x: Math.max(10, position.x),
        y: Math.max(10, position.y),
      };

      element.position(position.x, position.y);
    });
  };

  const updateLinkTools = () => {
    graph.getLinks().forEach((link) => addLinkTools(link, defaultScale));
  };

  useEffect(() => {
    if (components.length > 0) {
      graph.on("cell:pointerup", function (cellView, evt) {
        evt.stopPropagation();
        if (cellView.model instanceof Component) {
          setSelectedComponent(cellView.model);
        }
      });

      graph.on("add", (cell) => {
        if (cell.isLink()) {
          cell.set("dependency", 0);
          addLinkTools(cell, defaultScale);
        }
      });

      graph
        .getElements()
        .forEach((element) =>
          addElementTools(element, defaultScale, paperRef.current)
        );
      attachEventListenersToComponents();

      paperRef.current.on("blank:pointerdown", () => {
        let sliderDiv = document.getElementById("slider-input");
        setShowToggle(false);
        if (sliderDiv) {
          sliderDiv.style.display = "none";
        }
      });
    }
  }, [components, graph]);

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const showPlotForComponent = (component) => {
    // console.log("the component is being clicked")
    setSelectedComponent(null);

    setTimeout(() => setSelectedComponent(component), 0);
    if (component.attributes["componentData"]) {
      openNewPopover(component);
    }
  };

  const getAccordionWidth = () => {
    return window.innerWidth * 0.2;
  };

  const handleCSVFileGenerator = (component) => {
    const csvfilegenerator = new CSVFileGenerator(graph);
    csvfilegenerator.generateCSV();
  };
  const getComponentPosition = (component) => {
    const accordionWidth = getAccordionWidth();
    const position = component.position();
    const componentWidth = 400;
    const componentHeight = 400;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const paperContainer = document.getElementById("paper-container");

    let xPosition =
      position.x + accordionWidth + (paperContainer.scrollLeft || 0) + 200;
    let yPosition = position.y + (paperContainer.scrollTop || 0) + 100;

    if (xPosition + componentWidth > screenWidth) {
      xPosition -= componentWidth + 100;
    }

    if (yPosition + componentHeight > screenHeight) {
      yPosition -= componentHeight;
    }

    return { x: xPosition, y: yPosition };
  };

  const attachEventListenersToComponents = () => {
    graph.getElements().forEach((element) => {
      const view = paperRef.current.findViewByModel(element);
      if (view) {
        view.on("element:pointerdown", function (evt) {
          showPlotForComponent(this.model);
          evt.stopPropagation();
        });
      }
    });
  };
  const handlePredict = () => {};

  const handleRetrainModel = async () => {
    console.log("Retraining the model...");
    graphManager.updateGraph(graph);
    weightManager.updateGraph(graph);

    const linkWeights = weightManager.getLinkWeights();
    let statisticalData = graphManager.prepareDataForRetraining();
    let trainablestatus = weightManager.getLinkTrainableStatus();
    console.log("the trainable status is", trainablestatus);
    console.log(" link weights is", linkWeights);

    try {
      const response = await ApiManager.retrainModel({
        statisticalData: statisticalData,
        linkWeights: linkWeights,
        trainableStatus: trainablestatus,
      });
      console.log("Retrain model response:", response);
      let status = response["status"];

      if (status == false) {
        showNotification(response["data"]);
      } else {
        try {
          const jsonContent = JSON.parse(response["data"]);
          showNotification("Tranining Successfull");
          weightManager.parseWeightReponse(jsonContent["weight_map"]);
          updateTargetStatisticalData(jsonContent);
        } catch (e) {
          console.error("Error parsing JSON string:", e);
        }
        updateLinkTools();
      }
    } catch (error) {
      console.error("Error retraining model:", error);
    }
  };

  const updateTargetStatisticalData = (data) => {
    console.log("the data that is obtained from the backend is ", data);

    graphManager.updateComponentDataByid(
      data["y_predicted"],
      data["target_vertex"]
    );
  };

  useEffect(() => {
    if (selectedLink) {
      setTrainableStatus(selectedLink.get("trainablestatus") || false);
    }
  }, [selectedLink]);

  // // Update both the graph model and the local state when the switch is toggled
  const handleToggleChange = () => {
    const newTrainableStatus = !trainableStatus;

    // Update the graph model
    if (selectedLink) {
      selectedLink.set("trainablestatus", newTrainableStatus);
      graph.trigger("change", selectedLink);
    }

    // Update the component state
    setTrainableStatus(newTrainableStatus);
  };

  const closeNotification = () => {
    setNotification((prevState) => ({ ...prevState, isVisible: false }));
  };

  const handleGraphNameChange = (event) => {
    setGraphName(event.target.value);
    setIsGraphNameEmpty(false);
  };
  const printComponentData = (componentId) => {
    const component = graph.getCell(componentId);
    if (component) {
      console.log("Updated Component Data:", component.get("componentData"));
    } else {
      console.log("Component not found");
    }
  };

  const popoverRefs = useRef({});

  const chartRefs = useRef({});

  Object.entries(combinedChartDataByGroup).forEach(([groupId, _]) => {
    if (!chartRefs.current[groupId]) {
      chartRefs.current[groupId] = React.createRef();
    }
  });

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Heading size="md">{graphName}</Heading>
        <Icon onClick={onOpen} as={AiFillSave} boxSize="24px" />
      </div>
      {openPopovers.map((popover) => {
        if (!popoverRefs.current[popover.id]) {
          popoverRefs.current[popover.id] = React.createRef();
        }

        return (
          <PopoverChart
            key={popover.id}
            ref={popoverRefs.current[popover.id]}
            componentData={popover}
            onGroupSelect={handleGroupSelection}
            onComponentDataUpdate={printComponentData}
            onClose={() => closePopover(popover.id)}
          />
        );
      })}

      {Object.entries(combinedChartDataByGroup).map(([groupId, components]) => {
        if (!chartRefs.current[groupId]) {
          chartRefs.current[groupId] = React.createRef();
        }
        return (
          <ChartComponent
            key={groupId}
            groupId={groupId}
            data={components}
            ref={chartRefs.current[groupId]}
          />
        );
      })}
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Graph</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input
              placeholder="Enter the Graph name"
              size="md"
              value={graphName}
              onChange={handleGraphNameChange}
              isInvalid={isGraphNameEmpty}
            />
            {isGraphNameEmpty && (
              <span style={{ color: "red" }}>Graph name is required</span>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveGraphToMongoDB}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div
        id="slider-input"
        style={{ display: "none", position: "absolute", zIndex: 1000 }}
      >
        <div
          id="weight-display"
          style={{ textAlign: "center", marginBottom: "5px" }}
        >
          0.00
        </div>

        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={sliderValue}
          id="slider"
          onChange={handleSliderChange}
        />
      </div>
      <div
        id="toggle-switch"
        style={{
          display: showToggle ? "block" : "none",
          position: "absolute",
          zIndex: 1001,
        }}
      >
        <FormLabel htmlFor="trainable-toggle">
          {selectedLink?.get("trainablestatus") ? "Trainable" : "Non-Trainable"}
        </FormLabel>

        <Switch
          id="trainable-toggle"
          isChecked={selectedLink?.get("trainablestatus")} // Adjusted
          onChange={handleToggleChange}
        />
      </div>

      {notification.isVisible && (
        <Alert
          status={
            notification.message ===
            "Internal server error while training the model"
              ? "error"
              : "success"
          }
        >
          <AlertIcon />
          {notification.message}
          <CloseButton
            alignSelf="flex-start"
            position="relative"
            right={-1}
            top={-1}
            onClick={closeNotification}
          />
        </Alert>
      )}

      <div style={{ height: "100vh", display: "flex" }}>
        <div
          style={{
            flex: "80%",
            position: "relative",
            padding: "5px",
            marginTop: "5px",
          }}
        >
          <div style={{ display: "flex", marginBottom: "10px" }}>
            <Button
              onClick={handleAddRectangle}
              style={{
                width: "100%",
                backgroundColor: "#292827",
                color: "white",
              }}
              _hover={{ backgroundColor: "#829d1d" }}
            >
              <Icon as={AiOutlinePlus} boxSize="24px" mr={2} />
              Add Component
            </Button>
            <input
              type="file"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
            />

            <Button
              onClick={handleFileSelect}
              style={{
                marginLeft: "10px",
                backgroundColor: "#292827",
                color: "white",
                height: "40px",
              }}
              _hover={{ backgroundColor: "#829d1d" }}
            >
              <Icon as={AiOutlineFolderOpen} boxSize="24px" mr={2} />
            </Button>
            <Button
              onClick={handlePredict}
              style={{
                marginLeft: "10px",
                backgroundColor: "#292827",
                color: "white",
                height: "40px",
              }}
              _hover={{ backgroundColor: "#829d1d" }}
            >
              <MdOutlineBatchPrediction size={48} mr={4} />
              Predict
            </Button>
            <Button
              onClick={handleRetrainModel}
              style={{
                marginLeft: "10px",
                backgroundColor: "#292827",
                color: "white",
                height: "40px",
              }}
              _hover={{ backgroundColor: "#829d1d" }}
            >
              <Icon as={AiOutlineReload} boxSize="24px" mr={2} />
              Retrain
            </Button>
            <Button
              onClick={handleCSVFileGenerator}
              style={{
                marginLeft: "10px",
                backgroundColor: "#292827",
                color: "white",
                height: "40px",
              }}
              _hover={{ backgroundColor: "#829d1d" }}
            >
              <Icon as={AiFillFileExcel} boxSize="24px" m={2} />
              CSV Generator
            </Button>
          </div>

          <div
            id="paper-container"
            style={{
              flex: "1",
              position: "relative",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JointDiagram;
