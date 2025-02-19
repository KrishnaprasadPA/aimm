import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import "../i18n";
import { useAuth } from "../context/AuthContext";
import CookieConsent from "./CookieConsent"; // Import CookieConsent Component

// Styled components
const Parent = styled.div`
  background-color: #c9d6ff;
  background: linear-gradient(to right, #d8b4d4, #60396e);
  // background: linear-gradient(to right, #888888, #666666);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  font-family: "Montserrat", sans-serif;
`;

const DescriptionContainer = styled.div`
  position: absolute;
  bottom: 20px; // Keeps it at the bottom of the screen
  left: 50%;
  transform: translateX(-50%); // Centers it horizontally
  padding: 0 40px; // Adds padding to the left and right
  text-align: center;
  font-size: 13px;
  color: #fff;
  max-width: 100%;
  border-radius: 10px;
  line-height: 1.6; // Increases line height to avoid text looking too cramped
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

const LanguageButton = styled.button`
  background-color: #8b68a1; // Lighter version of #60396e
  color: #fff; // White text
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px; // Optional, adds spacing between buttons

  &:hover {
    background-color: #734f7f; // Slightly darker shade on hover
  }
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
  margin-top: -220px;
`;

const FormContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
`;

const SignUpContainer = styled(FormContainer)`
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  ${(props) =>
    props.signingUp !== true
      ? `
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
  `
      : null}
`;

const SignInContainer = styled(FormContainer)`
  left: 0;
  width: 50%;
  z-index: 2;
  ${(props) =>
    props.signingUp !== true ? `transform: translateX(100%);` : null}
`;

const Form = styled.form`
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  height: 100%;
`;

const Title = styled.h1`
  font-weight: bold;
  margin: 0;
`;

const Input = styled.input`
  background-color: #eee;
  border: none;
  margin: 8px 0;
  padding: 10px 15px;
  font-size: 13px;
  border-radius: 8px;
  width: 100%;
  outline: none;
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

const ToggleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: all 0.6s ease-in-out;
  border-radius: 150px 0 0 100px;
  z-index: 1000;
  ${(props) =>
    props.signingUp !== true
      ? `
    transform: translateX(-100%);
    border-radius: 0 150px 100px 0;
  `
      : null}
`;

const Toggle = styled.div`
  background-color: #60396e;
  height: 100%;
  background: linear-gradient(to right, #8c66a4, #60396e);
  color: #fff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: all 0.6s ease-in-out;
  ${(props) =>
    props.signingUp !== true ? `transform: translateX(50%);` : null}
`;

const TogglePanel = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 30px;
  text-align: center;
  top: 0;
  transform: translateX(0);
  transition: all 0.6s ease-in-out;
`;

const ToggleRight = styled(TogglePanel)`
  transform: translateX(-100%);
  ${(props) => (props.signingUp !== true ? `transform: translateX(0);` : null)}
`;

const ToggleLeft = styled(TogglePanel)`
  right: -30px;
  transform: translateX(0);
  ${(props) =>
    props.signingUp !== true ? `transform: translateX(200%);` : null}
`;

const Login = () => {
  const apiUrl = process.env.REACT_APP_API_URI;
  const [isSignUpVisible, setIsSignUpVisible] = useState(true);
  const [signUpObj, setSignUpObj] = useState({
    name: "",
    email: "",
    password: "",
    level: "",
    level_description: "",
  });
  const [loginObj, setLoginObj] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSignUpChange = (e) => {
    setSignUpObj({ ...signUpObj, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginObj({ ...loginObj, [e.target.name]: e.target.value });
  };

  const onRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/register`, signUpObj);
      alert("Registration Successful");
      console.log(response);
      setIsSignUpVisible(false);
    } catch (error) {
      alert("Registration Failed");
      console.error(error);
    }
  };

  const { login } = useAuth();

  const [isCookieConsentVisible, setIsCookieConsentVisible] = useState(false);

  useEffect(() => {
    // Check if the user has accepted cookies
    if (!localStorage.getItem("cookiesAccepted")) {
      setIsCookieConsentVisible(true);
    }
  }, []);

  const handleCookieConsent = () => {
    localStorage.setItem("cookiesAccepted", true); // Save cookie acceptance in localStorage
    setIsCookieConsentVisible(false); // Hide the cookie consent banner
  };

  const handleCookieReject = () => {
    localStorage.setItem("cookiesAccepted", false); // Save cookie rejection in localStorage
    setIsCookieConsentVisible(false); // Hide the cookie consent banner
    // logout(); // Optionally, log the user out or clear session data
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/login`, loginObj);
      if (response.data.message === "Login successful") {
        localStorage.setItem("loggedUser", JSON.stringify(response.data));
        login(response.data); // Set isLoggedIn to true
        navigate("/home");
      }
    } catch (error) {
      alert("Invalid credentials");
      console.error(error);
    }
  };

  const switchLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <Parent>
      <Navbar>
        <div className="language-select">
          <LanguageButton onClick={() => switchLanguage("en")}>
            English
          </LanguageButton>
          <LanguageButton onClick={() => switchLanguage("es")}>
            Español
          </LanguageButton>
        </div>
      </Navbar>
      <Container>
        <SignUpContainer signingUp={isSignUpVisible}>
          <Form onSubmit={onRegister}>
            <Title>{t("user_registration")}</Title>
            <Input
              type="text"
              name="name"
              value={signUpObj.name}
              onChange={handleSignUpChange}
              placeholder={t("name")}
            />
            <Input
              type="email"
              name="email"
              value={signUpObj.email}
              onChange={handleSignUpChange}
              placeholder={t("email")}
            />
            <Input
              type="password"
              name="password"
              value={signUpObj.password}
              onChange={handleSignUpChange}
              placeholder={t("password")}
            />
            <Input
              type="text"
              name="level"
              value={signUpObj.level}
              onChange={handleSignUpChange}
              placeholder={t("level")}
              title={t("level_info")}
            />
            <Input
              type="text"
              name="level_description"
              value={signUpObj.level_description}
              onChange={handleSignUpChange}
              placeholder={t("level_description")}
            />
            <Button type="submit">{t("sign_up")}</Button>
          </Form>
        </SignUpContainer>
        <SignInContainer signingUp={isSignUpVisible}>
          <Form onSubmit={onLogin}>
            <Title>{t("sign_in")}</Title>
            <Input
              type="email"
              name="email"
              value={loginObj.email}
              onChange={handleLoginChange}
              placeholder={t("email")}
            />
            <Input
              type="password"
              name="password"
              value={loginObj.password}
              onChange={handleLoginChange}
              placeholder={t("password")}
            />
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{
                color: "#6e3a82",
                textDecoration: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t("forgot_password")}
            </button>
            <Button type="submit">{t("sign_in")}</Button>
          </Form>
        </SignInContainer>
        <ToggleContainer signingUp={isSignUpVisible}>
          <Toggle signingUp={isSignUpVisible}>
            <ToggleLeft signingUp={isSignUpVisible}>
              <Title>{t("hello_user")}</Title>
              <p>{t("register_info")}</p>
              <Button onClick={() => navigate("/register")}>
                {t("sign_up")}
              </Button>
            </ToggleLeft>
            <ToggleRight signingUp={isSignUpVisible}>
              <Title>{t("welcome_back")}</Title>
              <p>{t("sign_in_info")}</p>
              <Button onClick={() => setIsSignUpVisible(true)}>
                {t("sign_in")}
              </Button>
            </ToggleRight>
          </Toggle>
        </ToggleContainer>
      </Container>
      <DescriptionContainer>
        {/* <p>
          AIMM (AI-driven Mental Modeler) is being developed by the{" "}
          <a
            href="https://www.waterdmd.info"
            target="_blank"
            rel="noopener noreferrer"
          >
            waterDMD
          </a>{" "}
          lab at Arizona State University. This was designed as a learning and
          research tool for understanding the Mental Models of diverse
          stakeholders. We invite you to develop your Mental Model for the
          system and explore others. The research is supported by NASA LCLUC{" "}
          <a
            href="https://lcluc.umd.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={process.env.PUBLIC_URL + "/lcluc.png"} // Image in the public folder
              alt="NASA LCLUC logo"
              style={{
                width: "30px",
                height: "30px",
                verticalAlign: "middle",
                marginLeft: "5px",
              }}
            />
          </a>
          through a research grant for the project “Exploring the Nexus between
          LCLUC, Socio-Economic Factors, and Water for a Vulnerable Arid
          US-Mexico Transboundary Region”({" "}
          <a
            href="https://lcluc.umd.edu/projects/exploring-nexus-between-lcluc-socio-economic-factors-and-water-vulnerable-arid-us-mexico"
            target="_blank"
            rel="noopener noreferrer"
          >
            #80NSSC23K0507
          </a>{" "}
          ) led by PI Saurav Kumar.
        </p>
        <p>
          This research was reviewed by ASU IRB# XXXX. For any questions, please
          email Saurav Kumar at{" "}
          <a
            href="mailto:sk2@asu.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            sk2@asu.edu
          </a>{" "}
          or ASU IRB directly at XXX.
        </p>
        <p>
          Please read our{" "}
          <a
            href="/privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            privacy statement
          </a>{" "}
          here.
        </p> */}
        <p>
          {t("aimm_intro")}{" "}
          <a
            href="https://www.waterdmd.info"
            target="_blank"
            rel="noopener noreferrer"
          >
            waterDMD
          </a>{" "}
          {t("aimm_lab_description")}
        </p>
        <p>
          {t("nasa_funding")}{" "}
          <a
            href="https://lcluc.umd.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={process.env.PUBLIC_URL + "/lcluc.png"}
              alt="NASA LCLUC logo"
              style={{
                width: "30px",
                height: "30px",
                verticalAlign: "middle",
                marginLeft: "5px",
              }}
            />
          </a>{" "}
          {t("nasa_project")}{" "}
          <a
            href="https://lcluc.umd.edu/projects/exploring-nexus-between-lcluc-socio-economic-factors-and-water-vulnerable-arid-us-mexico"
            target="_blank"
            rel="noopener noreferrer"
          >
            #80NSSC23K0507
          </a>{" "}
          {t("nasa_pi")}
        </p>
        <p>
          {t("irb_review")}{" "}
          <a
            href="mailto:sk2@asu.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("contact_pi")}
          </a>{" "}
          {t("or_irb")}{" "}
        </p>
        <p>
          {t("privacy_notice")}{" "}
          <a
            href="/privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("privacy_statement")}
          </a>
          .
        </p>
      </DescriptionContainer>
      {isCookieConsentVisible && (
        <CookieConsent
          onAccept={handleCookieConsent}
          onReject={handleCookieReject}
        />
      )}
    </Parent>
  );
};

export default Login;
