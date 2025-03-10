import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

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

const Container = styled.div`
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 400px; /* Reduced width for a smaller container */
  max-width: 100%;
  min-height: 300px; /* Adjusted height */
`;

const Form = styled.form`
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px; /* Added padding for spacing */
`;

const Title = styled.h1`
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.input`
  background-color: #eee;
  border: none;
  margin: 8px 0;
  padding: 10px 10px 10px; /* Reduced padding for a smaller input */
  font-size: 13px;
  border-radius: 8px;
  width: calc(100% - 60px); /* Smaller width */
`;

const Button = styled.button`
  background-color: #60396e;
  color: #fff;
  font-size: 12px;
  padding: 10px 30px; /* Adjusted padding for a smaller button */
  border-radius: 8px;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URI;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/api/forgot-password`, { email });
      alert("If the email exists, a reset link has been sent.");
      navigate("/login");
    } catch (error) {
      console.error("Error sending reset link:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Parent>
      <Container>
        <Title>Forgot Password</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          <Button>Reset</Button>
        </Form>
      </Container>
    </Parent>
  );
};

export default ForgotPassword;
