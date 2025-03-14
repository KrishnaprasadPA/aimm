import React, { useEffect, useState } from "react";
import styled from "styled-components";

// const CookieConsentContainer = styled.div`
//   position: fixed;
//   bottom: 0;
//   left: 0;
//   width: 100%;
//   background-color: #ea216870;
//   color: white;
//   padding: 10px;
//   text-align: center;
//   font-size: 14px;
//   z-index: 999;
// `;

// const Button = styled.button`
//   background-color: #ea216870; // Softer pink
//   color: #fff; // White text
//   border: none;
//   padding: 10px 20px;
//   border-radius: 5px;
//   cursor: pointer;
//   margin-right: 10px; // Optional, adds spacing between buttons

//   &:hover {
//     background-color: #e64980; // Slightly darker pink on hover
//   }
// `;
const CookieConsentContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ea216870; // Match the app bar color
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 14px;
  z-index: 1000;
  backdrop-filter: blur(5px); // Optional: Adds a blur effect to the background
`;

const Button = styled.button`
  background-color: #e64980;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px; // Adds spacing between buttons

  &:hover {
    background-color: #d6336c; // Slightly darker pink on hover
  }
`;

const CookieConsent = ({ onAccept, onReject }) => {
  return (
    <CookieConsentContainer>
      <p>
        This website uses cookies to ensure you get the best experience.{" "}
        <strong>
          By continuing to use this site, you accept our use of cookies.
        </strong>
      </p>
      <Button onClick={onAccept}>Accept Cookies</Button>
      <Button onClick={onReject}>Reject Cookies</Button>
    </CookieConsentContainer>
  );
};

export default CookieConsent;
