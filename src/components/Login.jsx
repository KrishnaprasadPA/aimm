import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import "../i18n";
import { useAuth } from "../context/AuthContext";

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
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
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
  right: 0;
  transform: translateX(0);
  ${(props) =>
    props.signingUp !== true ? `transform: translateX(200%);` : null}
`;

const Login = () => {
  const [isSignUpVisible, setIsSignUpVisible] = useState(false);
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
      const response = await axios.post(
        "https://localhost:5001/register",
        signUpObj
      );
      alert("Registration Successful");
      console.log(response);
      setIsSignUpVisible(false);
    } catch (error) {
      alert("Registration Failed");
      console.error(error);
    }
  };

  const { login } = useAuth();

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://localhost:5001/login",
        loginObj
      );
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
            {/* <a href="#" style={{ color: "#6e3a82", textDecoration: "none" }}>
              {t("forgot_password")}
            </a> */}
            <Button type="submit">{t("sign_in")}</Button>
          </Form>
        </SignInContainer>
        <ToggleContainer signingUp={isSignUpVisible}>
          <Toggle signingUp={isSignUpVisible}>
            <ToggleLeft signingUp={isSignUpVisible}>
              <Title>{t("hello_user")}</Title>
              <p>{t("register_info")}</p>
              <Button onClick={() => setIsSignUpVisible(false)}>
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
    </Parent>
  );
};

export default Login;
