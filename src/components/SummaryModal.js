import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  maxHeight: "80vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const SummaryModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const {
    modelName,
    adjacencyMatrix,
    topFactors,
    numFactors,
    numLinks,
    quality,
    targetFactor,
  } = data;
  const factors = Object.keys(adjacencyMatrix);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            Model Summary: {modelName}
          </Typography>
          <Button onClick={onClose}>
            <CloseIcon />
          </Button>
        </Box>
        <hr />
        <Typography sx={{ mt: 2, fontWeight: "bold" }}>Details</Typography>
        <Typography>Number of Factors: {numFactors}</Typography>
        <Typography>Number of Links: {numLinks}</Typography>
        <Typography>Target Factor: {targetFactor || "None"}</Typography>
        <Typography>Training Quality: {quality}</Typography>
        <hr />
        <Typography sx={{ mt: 2, fontWeight: "bold" }}>
          Top Influencing Factors on "{targetFactor}"
        </Typography>
        {topFactors.length > 0 ? (
          <ol>
            {topFactors.map((factor, index) => (
              <li key={index}>
                {factor.name} (Weight: {factor.weight.toFixed(2)})
              </li>
            ))}
          </ol>
        ) : (
          <Typography>No factors are linked to the target.</Typography>
        )}
        <hr />
        <Typography sx={{ mt: 2, fontWeight: "bold" }}>
          Adjacency Matrix
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>From/To</TableCell>
                {factors.map((factor) => (
                  <TableCell key={factor}>{factor}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {factors.map((fromFactor) => (
                <TableRow key={fromFactor}>
                  <TableCell component="th" scope="row">
                    <strong>{fromFactor}</strong>
                  </TableCell>
                  {factors.map((toFactor) => (
                    <TableCell key={`${fromFactor}-${toFactor}`}>
                      {adjacencyMatrix[fromFactor][toFactor] !== 0
                        ? adjacencyMatrix[fromFactor][toFactor].toFixed(2)
                        : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
};

export default SummaryModal;
