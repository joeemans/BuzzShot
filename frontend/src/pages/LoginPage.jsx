import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthBox from "../components/AuthBox";
import FormInput from "../components/FormInput";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const backendUrl = "http://localhost:3000";
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // include cookies in the request (required for session management)
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setError(""); //clear error message
        console.log("Login successful:", data);
        setUser(data.returnUser);
        navigate("/home");
      } else {
        console.error("Login failed:", data);
        setError(data?.message || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred while trying to log in.");
    }
  };

  return (
    <AuthBox title="Welcome Back to BuzzShot">
      <form className="space-y-5 text-black" onSubmit={handleSubmit}>
        {error && <p className="text-center text-red-500">{error}</p>}
        <FormInput
          label="Email"
          type="email"
          value={form.email}
          placeholder="Enter your email"
          onChange={handleChange}
          name="email"
        />
        <FormInput
          label="Password"
          type="password"
          value={form.password}
          placeholder="Enter your password"
          onChange={handleChange}
          name="password"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Log In
        </button>
        <p className="text-center text-sm text-gray-700">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </AuthBox>
  );
};

export default LoginPage;
