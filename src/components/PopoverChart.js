import React, { forwardRef, useEffect, useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseTrigger as PopoverCloseButton,
  Dialog as Modal,
  DialogOverlay as ModalOverlay,
  DialogContent as ModalContent,
  DialogHeader as ModalHeader,
  DialogFooter as ModalFooter,
  DialogBody as ModalBody,
  DialogCloseTrigger as ModalCloseButton,
  Button as ChakraButton,
  useDisclosure,
  Input,
  Flex,
  Spacer,
  Box,
  useToastStyles,
} from "@chakra-ui/react";

import Chart from "chart.js/auto";
import "chartjs-plugin-dragdata";
import ChartDataLabels from "chartjs-plugin-dragdata";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const useChart = (
  ref,
  currentcomponent,
  onComponentDataUpdate,
  chartDataVersion
) => {
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (!currentcomponent || !ref.current) {
      return;
    }

    const componentData = currentcomponent.attributes["componentData"];
    if (!componentData) {
      return;
    }
    if (!originalData) {
      setOriginalData(Object.values(componentData));
    }
    if (ref.current) {
      const isEditable =
        !currentcomponent.attributes["componentName"].includes("area");
      console.log(currentcomponent.attributes["componentName"], isEditable);
      const separationYear = new Date().getFullYear(); // or the last historical year you have
      const pastData = Object.entries(componentData).filter(
        ([year]) => parseInt(year) <= separationYear
      );
      const futureData = Object.entries(componentData).filter(
        ([year]) => parseInt(year) > separationYear
      );

      // Labels and data for past and future
      const pastLabels = pastData.map(([year]) => year);
      const futureLabels = futureData.map(([year]) => year);
      const pastValues = pastData.map(([, value]) => value);
      const futureValues = futureData.map(([, value]) => value);
      const extraSeparation = ["", "", ""];

      const chartConfig = {
        type: "line",
        data: {
          labels: [...pastLabels, ...extraSeparation, ...futureLabels],
          datasets: [
            {
              label: "Past Data",
              borderColor: "green",
              data: [
                ...pastValues,
                ...new Array(extraSeparation.length + futureLabels.length).fill(
                  NaN
                ),
              ], // Extend past data with NaNs for separation and future data length
            },
            {
              label: "Future Data",
              borderColor: "red",
              borderDash: [5, 5], // Optional: make the future data dashed
              data: [
                ...new Array(pastLabels.length + extraSeparation.length).fill(
                  NaN
                ),
                ...futureValues,
              ], // Fill with NaNs to align future data after the gap
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
          plugins: {},
        },
      };

      const updateComponentData = (datasetIndex) => {
        const newComponentData = chart.data.labels.reduce((acc, label, i) => {
          acc[label] = chart.data.datasets[datasetIndex].data[i];
          return acc;
        }, {});

        currentcomponent.set("componentData", newComponentData);
      };

      if (isEditable) {
        chartConfig.options.plugins.dragData = {
          round: 1,
          showTooltip: true,
          onDragStart: function (e, datasetIndex, index, value) {},
          onDrag: function (e, datasetIndex, index, value) {},
          onDragEnd: function (e, datasetIndex, index, value) {
            // chart.data.datasets[datasetIndex].data[index] = value;

            // updateComponentData(datasetIndex)
            // if (onComponentDataUpdate) {
            //   onComponentDataUpdate(currentcomponent.id);
            // }
            // if (chart.data.datasets.length === 1) {
            //   chart.data.datasets.push({
            //     label: 'Original Data',
            //     borderColor: 'blue',
            //     data: originalData,
            //     fill: false,
            //   });
            // }
            // chart.update();

            if (chart.data.labels[index] > separationYear) {
              chart.data.datasets[datasetIndex].data[index] = value; // Update the chart data
              chart.update(); // Update the chart UI

              // Create a new componentData object with updated future values
              let newComponentData = { ...componentData }; // Copy the existing data
              const year = chart.data.labels[index]; // Get the corresponding year based on index
              newComponentData[year] = value; // Update only the value for the dragged year

              // Update the state and also call the provided update function
              currentcomponent.set("componentData", newComponentData);
              if (onComponentDataUpdate) {
                onComponentDataUpdate(currentcomponent.id);
              }
            }
          },
        };
      }

      const chart = new Chart(ref.current, chartConfig);
      return () => chart.destroy();
    }
  }, [
    ref,
    currentcomponent,
    originalData,
    onComponentDataUpdate,
    chartDataVersion,
  ]);
};

const PopoverChart = forwardRef(
  ({ componentData, onClose, onGroupSelect, onComponentDataUpdate }, ref) => {
    const [position, setPosition] = useState({
      x: componentData.position.x,
      y: componentData.position.y,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 600, height: 500 });
    const [isResizing, setIsResizing] = useState(false);
    const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
    const [editableData, setEditableData] = useState([{ year: "", area: "" }]);
    const [chartDataVersion, setChartDataVersion] = useState(0);
    const [originalData, setOriginalData] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const toast = useToastStyles();

    const handleGroupChange = (e) => {
      onGroupSelect(componentData.componentData.id, e.target.value);
    };
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

    useChart(
      ref,
      componentData.componentData,
      onComponentDataUpdate,
      chartDataVersion
    );

    const handleSaveChanges = () => {
      let isValid = true;
      const newValidationErrors = {};

      editableData.forEach((data, index) => {
        if (data.area < 0 || data.area > 1) {
          isValid = false;
          newValidationErrors[index] = "Value must be between 0 and 1.";
        }
      });
      setValidationErrors(newValidationErrors);

      if (!isValid) {
        // Optionally use a toast to notify user of validation errors
        toast({
          title: "Validation Error",
          description:
            "Some entries are invalid. Please fix them before saving.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return;
      }

      const updatedComponentData = editableData.reduce(
        (acc, { year, area }) => {
          const areafloat = parseFloat(area);
          acc[year] = areafloat;
          return acc;
        },
        {}
      );
      componentData.componentData.set("componentData", updatedComponentData);
      console.log(
        "from the save function ",
        componentData.componentData.get("componentData")
      );
      setChartDataVersion((prevVersion) => prevVersion + 1);
      onModalClose();
    };

    //handling the edit button on the statistical plot
    const handleEditClick = () => {
      const data =
        componentData.componentData.attributes["componentData"] || {};
      //sorting for the purpose of showing the future values on the top
      const sortedData = Object.entries(data)
        .map(([year, area]) => ({ year, area }))
        .sort((a, b) => b.year - a.year);
      setEditableData(sortedData);
      setOriginalData(sortedData);
      onOpen(); // Open the modal
    };

    const handleDeleteTopRow = () => {
      // Check if there's at least one row to delete
      if (editableData.length > 0) {
        setEditableData(editableData.slice(1));
      }
    };
    const handleReset = () => {
      setEditableData([...originalData]);
    };

    const renderEditableRows = () => {
      return editableData.map((data, index) => (
        <Flex key={index} mb={4}>
          {/* <div key={index} style={{ display: 'flex', marginBottom: '10px' }}> */}
          <Input
            value={data.year}
            onChange={(e) => {
              const newData = [...editableData];
              newData[index].year = e.target.value;
              setEditableData(newData);
            }}
            placeholder="Year"
            marginRight="10px"
          />
          <Input
            value={data.area}
            onChange={(e) => {
              const newData = [...editableData];
              newData[index].area = e.target.value;
              setEditableData(newData);
            }}
            placeholder="Value (0-1)"
          />
          {validationErrors[index] && (
            <Box
              color="white"
              bg="red.500"
              ml={2}
              p={2}
              borderRadius="md"
              fontSize="sm"
            >
              {validationErrors[index]}
            </Box>
          )}
        </Flex>
      ));
    };

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
              height: `${size.height + 100}px`,
            }}
          >
            <PopoverArrow />
            <PopoverCloseButton onClick={onClose} />
            <PopoverHeader>
              {componentData.componentData.get("componentName")}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  className="p-button-rounded p-button-success"
                  onClick={handleEditClick}
                  style={{ marginRight: "10px" }}
                >
                  <i
                    className="pi pi-pencil"
                    style={{ marginRight: "5px" }}
                  ></i>
                  Edit Data
                </Button>

                <select onChange={handleGroupChange} defaultValue="">
                  <option value="">Select</option>
                  <option value="1">Group 1</option>
                  <option value="2">Group 2</option>
                  <option value="3">Group 3</option>
                </select>
              </div>
            </PopoverHeader>
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

        <Modal isOpen={isOpen} onClose={onModalClose}>
          {/* <ModalOverlay /> */}
          <ModalContent>
            <ModalHeader>Edit Data</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex mb={4} alignItems="center">
                <ChakraButton
                  colorScheme="blue"
                  onClick={() =>
                    setEditableData([{ year: "", area: "" }, ...editableData])
                  }
                  mb={4}
                >
                  Add
                </ChakraButton>

                <Spacer />
                <ChakraButton
                  colorScheme="red"
                  onClick={handleDeleteTopRow}
                  mb={4}
                >
                  Delete
                </ChakraButton>

                <Spacer />

                <ChakraButton colorScheme="green" onClick={handleReset} mb={4}>
                  Reset
                </ChakraButton>
              </Flex>
              {renderEditableRows()}
            </ModalBody>
            <ModalFooter>
              <ChakraButton colorScheme="blue" mr={3} onClick={onModalClose}>
                Close
              </ChakraButton>
              <ChakraButton variant="ghost" onClick={handleSaveChanges}>
                Save Changes
              </ChakraButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    );
  }
);

export default PopoverChart;
