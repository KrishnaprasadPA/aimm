import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

// Styled Components
const Parent = styled.div`
  background-color: #c9d6ff;
  background: linear-gradient(to right, #d8b4d4, #60396e);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  font-family: "Nunito Sans", sans-serif;
`;

const Navbar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  background-color: #60396e;
  color: #fff;
  padding: 10px 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const Container = styled.div`
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
  padding: 40px;
`;

const Title = styled.h1`
  font-weight: bold;
  margin: 0;
  text-align: center;
`;

const Paragraph = styled.p`
  text-align: justify;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const Button = styled.button`
  background-color: #60396e;
  color: #fff;
  font-size: 12px;
  padding: 10px 45px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: 10px;
  cursor: pointer;
`;

const PrivacyStatement = () => {
  const { t } = useTranslation();

  return (
    <Parent>
      <Container>
        <Title>{t("privacy_statement")}</Title>
        <Paragraph>
          At waterDMD, we value your privacy and are committed to protecting
          your personal information. This Privacy Statement outlines the types
          of information we collect, how we use it, and the steps we take to
          safeguard it.
        </Paragraph>
        <Paragraph>
          <strong>1. Information We Collect</strong>
          <br />
          We collect personal information that you provide when using our
          website or services. This may include:
          <ul>
            <li>
              Personal Identification Information (e.g., name, email address,
              phone number)
            </li>
            <li>
              Usage Information (e.g., your interaction with our website, IP
              address, browser type)
            </li>
            <li>
              Cookies and Tracking Technologies (e.g., to enhance user
              experience)
            </li>
          </ul>
        </Paragraph>
        <Paragraph>
          <strong>2. How We Use Your Information</strong>
          <br />
          We use the collected information for various purposes, including:
          <ul>
            <li>Providing, operating, and improving our services</li>
            <li>
              Communicating with you (e.g., to respond to inquiries or send
              updates)
            </li>
            <li>
              Enhancing your user experience (e.g., customizing content or
              services)
            </li>
            <li>Analyzing site usage and trends to improve functionality</li>
          </ul>
        </Paragraph>
        <Paragraph>
          <strong>3. How We Protect Your Information</strong>
          <br />
          We implement appropriate technical and organizational measures to
          safeguard your personal information.
        </Paragraph>
        <Paragraph>
          <strong>4. Sharing Your Information</strong>
          <br />
          We do not share, sell, or rent your personal information to third
          parties, except in certain cases, such as legal obligations or
          third-party service providers assisting us.
        </Paragraph>
        <Paragraph>
          <strong>5. Cookies</strong>
          <br />
          Our website uses cookies to enhance your experience. You can control
          cookie settings through your browser, but some functionality may be
          limited without cookies.
        </Paragraph>
        <Paragraph>
          <strong>6. Your Rights</strong>
          <br />
          You have the right to access, correct, or delete your personal
          information.
        </Paragraph>
        <Paragraph>
          <strong>7. Changes to This Privacy Statement</strong>
          <br />
          We may update this Privacy Statement from time to time. Any changes
          will be posted on this page.
        </Paragraph>
        <Paragraph>
          <strong>8. Contact Us</strong>
          <br />
          If you have any questions regarding this Privacy Statement, please
          contact us at:
          <br />
          Email: [Your Email]
          <br />
          Address: [Your Company Address]
        </Paragraph>
      </Container>
    </Parent>
  );
};

export default PrivacyStatement;
