"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const navigate = useNavigate();

 const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
console.log("login work");
      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });

        // ✅ THE FIX: Access the token directly from the response data
        localStorage.setItem("token", data.token);

        // (Recommended) Also save the user details if you need them elsewhere
        localStorage.setItem("user", JSON.stringify(data.data));

        navigate("/Dashboard");
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      console.error("Login Error:", err);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-extrabold mb-2 text-gray-900 text-center">
          DS Energize Admin Panel
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your details to login.
        </p>

        {message && (
          <div
            className={`p-3 mb-4 rounded-md text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Identifier input */}
          <div className="mb-4">
            <label
              htmlFor="identifier"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="admin@DSEnergize.io"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                required
              />
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex justify-between items-center text-sm mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                name="remember-me"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-blue-600 hover:underline">
              Recover password
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
