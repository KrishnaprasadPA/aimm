import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

// Styled components
const Parent = styled.div`
  background-color: #c9d6ff;
  background: linear-gradient(to right, #d8b4d4, #60396e);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  font-family: "Montserrat", sans-serif;
`;

const Container = styled.div`
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 400px; /* Adjusted width for a smaller container */
  max-width: 100%;
  min-height: 350px; /* Adjusted height */
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
  text-align: center; /* Center-aligns the title horizontally */
  margin-bottom: 20px; /* Adds spacing below the title */
`;

const InputWrapper = styled.div`
  position: relative;
  width: calc(100% - 60px); /* Smaller width */
`;

const Input = styled.input`
  background-color: #eee;
  border: none;
  margin: 8px 0;
  padding: 10px; /* Reduced padding for a smaller input */
  font-size: 13px;
  border-radius: 8px;
  width: calc(100% - 30px); /* Adjusted for eye icon */
`;

const EyeIcon = styled.span`
  position: absolute;
  top: calc(50% - 10px);
  right: 10px;
  cursor: pointer;
`;

const Button = styled.button`
  background-color: #60396e;
  color: #fff;
  font-size: 12px;
  padding: 10px 30px; /* Adjusted padding for a smaller button */
  border-radius: 8px;
  font-weight: bold;
`;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States to toggle visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return; // Prevent API call if passwords don't match
    }

    try {
      await axios.post("http://localhost/reset-password", { password });
      alert("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Parent>
      <Container>
        <Form onSubmit={handleSubmit}>
          <Title>Reset Password</Title>

          {/* Password Input */}
          <InputWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <EyeIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </EyeIcon>
          </InputWrapper>

          {/* Confirm Password Input */}
          <InputWrapper>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <EyeIcon
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </EyeIcon>
          </InputWrapper>

          {/* Submit Button */}
          <Button type="submit">Reset Password</Button>
        </Form>
      </Container>
    </Parent>
  );
};

export default ResetPassword;
