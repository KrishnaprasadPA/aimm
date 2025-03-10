import React, { useEffect, useState } from "react";
import styled from "styled-components";

const CookieConsentContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #60396e;
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  z-index: 999;
`;

const Button = styled.button`
  background-color: #8b68a1;
  color: #fff;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;

  &:hover {
    background-color: #734f7f;
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
