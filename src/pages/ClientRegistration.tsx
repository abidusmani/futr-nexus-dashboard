import React, { useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { BsToggle2Off, BsToggle2On } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const ClientRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { name, email, mobile, password, role, isActive } = formData;

    if (!name || !email || !mobile || !password || !role) {
      toast.error("All fields are required");
      setIsSubmitting(false);
      return;
    }

    const dataToSend = {
      name,
      email,
      mobile,
      password,
      role,
      isActive,
    };

    try {
      const response = await fetch("https://os.dsenergize.com/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      toast.success("Client registered successfully!");
      navigate("/Dashboard");
    } catch (error) {
      console.error("API Error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center py-6 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-2xl bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-center">
          <span className="text-green-600">User</span> Registration
        </h2>
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="name" className="font-semibold text-gray-700 mb-1">
                User Name*
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Steve Mark"
                value={formData.name}
                onChange={handleOnChangeForm}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="font-semibold text-gray-700 mb-1">
                Email*
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g., stevemark@gmail.com"
                value={formData.email}
                onChange={handleOnChangeForm}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="mobile" className="font-semibold text-gray-700 mb-1">
                Mobile No*
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="e.g., 9876543210"
                value={formData.mobile}
                onChange={handleOnChangeForm}
                required
                pattern="[0-9]{10,15}"
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="font-semibold text-gray-700 mb-1">
                Password*
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleOnChangeForm}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer mt-1"
              >
                {showPassword ? "Hide" : "Show"} Password
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="role" className="font-semibold text-gray-700 mb-1">
                Role*
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleOnChangeForm}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 mt-auto pb-2">
              {formData.isActive ? (
                <BsToggle2On
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  color="green"
                  size={30}
                  cursor="pointer"
                />
              ) : (
                <BsToggle2Off
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  color="gray"
                  size={30}
                  cursor="pointer"
                />
              )}
              <label className="text-sm font-semibold text-gray-700">
                Active User
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 mt-6 font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ClientRegister;
