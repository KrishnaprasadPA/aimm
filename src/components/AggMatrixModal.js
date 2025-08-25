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
  IconButton,
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

const AggMatrixModal = ({ open, onClose, data }) => {
  if (!data || !data.aggregated_matrix) return null;

  const { aggregated_matrix, summary } = data;
  const factors = Object.keys(aggregated_matrix);
  const hasData = factors.length > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            Aggregated Model for User Group {summary.user_level}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <hr />
        <Typography sx={{ mt: 2, fontWeight: "bold" }}>Summary</Typography>
        <Typography>
          Number of Models Aggregated: {summary.num_models}
        </Typography>
        <Typography>Total Unique Factors: {summary.num_factors}</Typography>
        <Typography>Total Unique Links: {summary.num_links}</Typography>
        <hr />
        {hasData ? (
          <>
            <Typography sx={{ mt: 2, fontWeight: "bold" }}>
              Aggregated Adjacency Matrix
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
                        <span style={{ fontWeight: "bold" }}>{fromFactor}</span>
                      </TableCell>
                      {factors.map((toFactor) => (
                        <TableCell key={`${fromFactor}-${toFactor}`}>
                          {aggregated_matrix[fromFactor][toFactor] !== 0
                            ? aggregated_matrix[fromFactor][toFactor].toFixed(2)
                            : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography sx={{ mt: 2 }}>
            No data available for this user group.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default AggMatrixModal;
