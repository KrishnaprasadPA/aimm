import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Sidebar = ({
  searchTerm,
  setSearchTerm,
  onSearchInput,
  filteredFactors,
  addFactorToDragArea,
  targetVariables,
  setSelectedTarget,
  addRectangleToGraph,
  adminFactors,
  userFactors,
  openAddFactorModal,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      sx={{
        width: "24vw",
        height: "100vh",
        backgroundColor: "#ffc0cb", // Pink background
        padding: "16px",
        overflowY: "auto",
        boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0)",
      }}
    >
      {/* Search Bar */}
      <Box sx={{ marginBottom: "16px" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search factors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onInput={onSearchInput}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "4px",
          }}
        />
      </Box>

      {/* Target Variables Section */}
      <Accordion
        expanded={expanded === "targetVariables"}
        onChange={handleAccordionChange("targetVariables")}
        sx={{ backgroundColor: "#f8bbd0", marginBottom: "8px" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Target Factors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {targetVariables.map((variable) => (
            <Button
              key={variable._id}
              onClick={() => {
                setSelectedTarget(variable.name);
                addRectangleToGraph(variable);
              }}
              sx={{
                display: "block",
                width: "100%",
                textAlign: "left",
                marginBottom: "4px",
                backgroundColor: "#f48fb1",
                color: "#fff",
              }}
            >
              {variable.name}
            </Button>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Factors Section */}
      <Accordion
        expanded={expanded === "factors"}
        onChange={handleAccordionChange("factors")}
        sx={{ backgroundColor: "#f8bbd0", marginBottom: "8px" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Factors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {filteredFactors.map((factor) => (
            <Box
              key={factor._id}
              onClick={() => addFactorToDragArea(factor)}
              sx={{
                padding: "8px",
                marginBottom: "4px",
                backgroundColor: "#f48fb1",
                color: "#fff",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {factor.name}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Admin Factors Section */}
      <Accordion
        expanded={expanded === "adminFactors"}
        onChange={handleAccordionChange("adminFactors")}
        sx={{ backgroundColor: "#f8bbd0", marginBottom: "8px" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Admin Factors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {adminFactors.map((factor) => (
            <Box
              key={factor._id}
              onClick={() => addRectangleToGraph(factor)}
              sx={{
                padding: "8px",
                marginBottom: "4px",
                backgroundColor: "#f48fb1",
                color: "#fff",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {factor.name}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Custom Factors Section */}
      <Accordion
        expanded={expanded === "customFactors"}
        onChange={handleAccordionChange("customFactors")}
        sx={{ backgroundColor: "#f8bbd0", marginBottom: "8px" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Custom Factors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {userFactors.map((factor) => (
            <Box
              key={factor._id}
              onClick={() => addRectangleToGraph(factor)}
              sx={{
                padding: "8px",
                marginBottom: "4px",
                backgroundColor: "#f48fb1",
                color: "#fff",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {factor.name}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Add Factor Button */}
      <Button
        fullWidth
        variant="contained"
        onClick={openAddFactorModal}
        sx={{
          marginTop: "16px",
          backgroundColor: "#e91e63", // Darker pink for the button
          color: "#fff",
          "&:hover": {
            backgroundColor: "#d81b60", // Slightly darker hover effect
          },
        }}
      >
        Add Factor
      </Button>
    </Box>
  );
};

export default Sidebar;
