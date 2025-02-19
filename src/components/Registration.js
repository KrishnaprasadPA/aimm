import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

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
  width: 900px; /* Increased width for the form */
  max-width: 100%;
  min-height: 600px;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90%;
`;

const Title = styled.h1`
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center; /* Center the title */
  width: 100%; /* Ensure it takes full width */
`;

const Input = styled.input`
  background-color: #eee;
  border: none;
  margin: 8px 0;
  padding: 10px 15px;
  font-size: 13px;
  border-radius: 8px;
  width: 80%; /* Width is set to 80% of the container */
  max-width: 550px; /* Optional: max-width for the input */
  outline: none;
  text-align: left; /* Align text to the left */
  box-sizing: border-box; /* Ensure padding doesn't affect width */
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

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 10px;
`;

const CheckboxLabel = styled.label`
  margin-bottom: 5px;
  font-size: 14px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const apiUrl = process.env.REACT_APP_API_URI;

const Registration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    fullName: "",
    preferredName: "",
    email: "",
    userId: "",
    password: "",
    confirmPassword: "",
    selectedCategory: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value, // Directly update selectedCategory
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const userData = {
    //   fullName: formValues.fullName,
    //   preferredName: formValues.preferredName,
    //   email: formValues.email,
    //   userId: formValues.userId,
    //   password: formValues.password,
    //   confirmPassword: formValues.confirmPassword,
    //   selectedCategories: formValues.selectedCategories,
    // };

    // Mapping selected categories to match backend
    const levelMapping = {
      research_agencies: "1",
      us_government: "2",
      mexico_government: "2",
      ngos: "2",
      suppliers: "3",
      individual_users: "4",
      large_institutional_users: "4",
      other_concerned_user: "5",
    };

    // You need to map the selected categories to level
    const level = levelMapping[formValues.selectedCategory];

    if (formValues.password !== formValues.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const dataToSend = {
      name: formValues.fullName,
      username: formValues.preferredName,
      user_id: formValues.userId,
      email: formValues.email,
      password: formValues.password,
      level: level,
      level_description: formValues.selectedCategory, // Description for the categories
    };

    try {
      const response = await axios.post(`${apiUrl}/api/register`, dataToSend);
      console.log(response.data); // Handle successful registration
      alert(response.data.message);
      navigate("/login"); // Navigate to the login page after successful registration
    } catch (error) {
      console.error("Error during registration: ", error);
      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <Parent>
      <Container>
        <Form onSubmit={handleSubmit}>
          <Title>{t("user_registration")}</Title>

          <Input
            type="text"
            name="fullName"
            value={formValues.fullName}
            onChange={handleChange}
            placeholder={t("full_name")}
            required
          />
          <Input
            type="text"
            name="preferredName"
            value={formValues.preferredName}
            onChange={handleChange}
            placeholder={t("preferred_name")}
            required
          />
          <Input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder={t("email")}
            required
          />
          <Input
            type="text"
            name="userId"
            value={formValues.userId}
            onChange={handleChange}
            placeholder={t("user_id")}
            required
          />
          <Input
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            placeholder={t("password")}
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            value={formValues.confirmPassword}
            onChange={handleChange}
            placeholder={t("confirm_password")}
            required
          />

          <CheckboxContainer>
            <p>{t("engagement_question")}</p>
            {[
              "research_agencies",
              "us_government",
              "mexico_government",
              "ngos",
              "suppliers",
              "individual_users",
              "large_institutional_users",
              "other_concerned_user",
            ].map((category, idx) => (
              <CheckboxLabel key={idx}>
                <input
                  type="radio"
                  name="selectedCategory"
                  value={category}
                  checked={formValues.selectedCategory === category}
                  onChange={handleChange}
                  required
                />
                {t(category)}
              </CheckboxLabel>
            ))}
          </CheckboxContainer>

          <Button type="submit">{t("register")}</Button>
        </Form>
      </Container>
    </Parent>
  );
};

export default Registration;
