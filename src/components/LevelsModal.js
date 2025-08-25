import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const LevelsModal = ({ open, onClose, userLevels, onLevelClick }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2">
            Select a User Group
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ mt: 2 }}>
          {userLevels.length > 0 ? (
            userLevels.map((level) => (
              <Button
                key={level}
                variant="contained"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => onLevelClick(level)}
              >
                User Group {level}
              </Button>
            ))
          ) : (
            <Typography>No user levels found.</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default LevelsModal;
