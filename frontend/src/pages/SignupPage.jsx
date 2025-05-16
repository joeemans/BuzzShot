import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthBox from "../components/AuthBox";
import FormInput from "../components/FormInput";
import { useAuth } from "../contexts/AuthContext";

const backendUrl = "http://localhost:3000";
const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateSpaces = (str) => {
    return /\s/.test(str);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check for spaces in any field
    if (
      validateSpaces(form.username) ||
      validateSpaces(form.email) ||
      validateSpaces(form.password)
    ) {
      setError("Fields cannot contain any spaces.");
      return;
    }

    try {
      console.log("Form data:", form);
      console.log(`${backendUrl}/signup`);
      const response = await fetch(`${backendUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully registered
        console.log("User registered:", data);
        setError("");
        setUser(data.user);
        navigate("/home");
      } else {
        // Handle backend errors (e.g., username or email already exists)
        setError(data.error);
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <AuthBox title="Create Your BuzzShot Account">
      <form className="space-y-5 text-black" onSubmit={handleSubmit}>
        {error && <p className="text-center text-red-500">{error}</p>}

        <FormInput
          label="Username"
          type="text"
          value={form.username}
          placeholder="Enter your username"
          onChange={handleChange}
          name="username"
        />
        <FormInput
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          name="email"
        />
        <FormInput
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          name="password"
        />
        <FormInput
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          name="confirmPassword"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-700">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>

        <div className="mt-4 text-center">
          <p className="text-gray-700">Or sign up with:</p>
          <a
            href="http://localhost:3000/auth/google"
            className="mt-2 inline-block w-full rounded-lg bg-red-500 py-2 text-center font-medium text-white transition hover:bg-red-600"
          >
            Sign Up with Google
          </a>
        </div>
      </form>
    </AuthBox>
  );
};

export default Signup;
