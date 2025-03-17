import React from "react";
import CircularProgress from "@mui/material/CircularProgress"; // Material-UI spinner
import styled from "styled-components";

// Styled components for the modal and blur effect
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  backdrop-filter: blur(5px); /* Blur effect */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top of everything */
`;

const SpinnerContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) return null; // Don't render if not loading

  return (
    <ModalOverlay>
      <SpinnerContainer>
        <CircularProgress color="primary" /> {/* Material-UI spinner */}
        <span>Loading...</span>
      </SpinnerContainer>
    </ModalOverlay>
  );
};

export default LoadingSpinner;
