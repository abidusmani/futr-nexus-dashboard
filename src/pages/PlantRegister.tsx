import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { BsToggle2On, BsToggle2Off } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const PlantRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    plantName: "",
    plantOwner: "",
    dcCapacity: "",
    acCapacity: "",
    inverters: "",
    smbs: "",
    modules: "",
    inverterTransformer: "",
    projectType: "",
    plantStartTime: "06:00:00",
    plantEndTime: "18:00:00",
    isActive: true,
    isSchedule: false, // Added new state field
    latitude: "",
    longitude: "",
    loggers: [""],
  });

  const [suggestions, setSuggestions] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "plantOwner") {
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(
        setTimeout(() => {
          fetchUserSuggestions(value);
        }, 300)
      );
    }
  };

  const fetchUserSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/search/userSearch?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('User search failed');
      }
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (err) {
      console.error("User search failed:", err);
      // toast.error('Failed to fetch user suggestions.');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setForm((prev) => ({ ...prev, plantOwner: name }));
    setSuggestions([]);
  };

  const handleLoggerChange = (index, value) => {
    const newLoggers = [...form.loggers];
    newLoggers[index] = value;
    setForm((prev) => ({ ...prev, loggers: newLoggers }));
  };

  const addLoggerField = () => {
    setForm((prev) => ({ ...prev, loggers: [...prev.loggers, ""] }));
  };

  const removeLoggerField = (index) => {
    const newLoggers = [...form.loggers];
    newLoggers.splice(index, 1);
    setForm((prev) => ({ ...prev, loggers: newLoggers }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = [
      "plantName",
      "plantOwner",
      "dcCapacity",
      "inverters",
      "smbs",
      "modules",
      "inverterTransformer",
      "projectType",
    ];

    for (let field of requiredFields) {
      if (!form[field]?.toString().trim()) {
        toast.error(`${field} is required`);
        setIsSubmitting(false);
        return;
      }
    }
    
    // Check if the loggers array is empty or contains only empty strings
    if (form.loggers.length > 0 && form.loggers.every(logger => logger.trim() === '')) {
      toast.error("At least one logger is required if added");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/plants/plantRegistration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          dcCapacity: Number(form.dcCapacity),
          acCapacity: Number(form.acCapacity) || 0,
          inverters: Number(form.inverters),
          smbs: Number(form.smbs),
          modules: Number(form.modules),
          latitude: Number(form.latitude) || undefined,
          longitude: Number(form.longitude) || undefined,
          isSchedule: form.isSchedule, // Pass the new field to the API
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      toast.success("Plant registered successfully!");
      navigate("/dashboard/plants");
    } catch (err) {
      console.error("API Error:", err);
      toast.error(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center py-6 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-2xl bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6">Add New Plant</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="plantName" className="font-semibold text-gray-700 mb-1">
                Name of Plant*
              </label>
              <input
                id="plantName"
                name="plantName"
                type="text"
                placeholder="Name of Plant"
                value={form.plantName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="plantOwner" className="font-semibold text-gray-700 mb-1">
                Plant Owner*
              </label>
              <div className="relative">
                <input
                  id="plantOwner"
                  name="plantOwner"
                  type="text"
                  placeholder="Plant Owner"
                  value={form.plantOwner}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((user) => (
                      <li
                        key={user._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(user.name)}
                      >
                        {user.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="dcCapacity" className="font-semibold text-gray-700 mb-1">
                DC Capacity (kWp)*
              </label>
              <input
                id="dcCapacity"
                name="dcCapacity"
                type="number"
                placeholder="DC Capacity (kWp)"
                value={form.dcCapacity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="acCapacity" className="font-semibold text-gray-700 mb-1">
                AC Capacity (kW)
              </label>
              <input
                id="acCapacity"
                name="acCapacity"
                type="number"
                placeholder="AC Capacity (kW)"
                value={form.acCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="inverters" className="font-semibold text-gray-700 mb-1">
                Number of Inverters*
              </label>
              <input
                id="inverters"
                name="inverters"
                type="number"
                placeholder="Number of Inverters"
                value={form.inverters}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="smbs" className="font-semibold text-gray-700 mb-1">
                Number of SMBs*
              </label>
              <input
                id="smbs"
                name="smbs"
                type="number"
                placeholder="Number of SMBs"
                value={form.smbs}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="modules" className="font-semibold text-gray-700 mb-1">
                Number of Modules*
              </label>
              <input
                id="modules"
                name="modules"
                type="number"
                placeholder="Number of Modules"
                value={form.modules}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="inverterTransformer" className="font-semibold text-gray-700 mb-1">
                Inverter Transformer*
              </label>
              <input
                id="inverterTransformer"
                name="inverterTransformer"
                type="text"
                placeholder="Inverter Transformer"
                value={form.inverterTransformer}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="projectType" className="font-semibold text-gray-700 mb-1">
              Project Type*
            </label>
            <input
              id="projectType"
              name="projectType"
              type="text"
              placeholder="Project Type"
              value={form.projectType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="plantStartTime" className="font-semibold text-gray-700 mb-1">
                Plant Start Time
              </label>
              <input
                id="plantStartTime"
                name="plantStartTime"
                type="time"
                value={form.plantStartTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="plantEndTime" className="font-semibold text-gray-700 mb-1">
                Plant End Time
              </label>
              <input
                id="plantEndTime"
                name="plantEndTime"
                type="time"
                value={form.plantEndTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="latitude" className="font-semibold text-gray-700 mb-1">
                Latitude
              </label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="Latitude"
                value={form.latitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="longitude" className="font-semibold text-gray-700 mb-1">
                Longitude
              </label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="Longitude"
                value={form.longitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="font-semibold text-gray-700 mb-1">
              Loggers
            </label>
            {form.loggers.map((logger, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder={`Logger ${index + 1}`}
                  value={logger}
                  onChange={(e) => handleLoggerChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.loggers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLoggerField(index)}
                    className="p-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLoggerField}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-green-500 text-white hover:bg-green-600 transition"
            >
              Add Logger
            </button>
          </div>
          {/* <div className="flex items-center space-x-2">
            {form.isActive ? (
              <BsToggle2On
                onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                color="green"
                size={30}
                cursor="pointer"
              />
            ) : (
              <BsToggle2Off
                onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                color="gray"
                size={30}
                cursor="pointer"
              />
            )}
            <label className="text-sm font-semibold text-gray-700">
              Is Active
            </label>
          </div> */}
          {/* New isSchedule field */}
          <div className="flex items-center space-x-2">
            {form.isSchedule ? (
              <BsToggle2On
                onClick={() => setForm((prev) => ({ ...prev, isSchedule: !prev.isSchedule }))}
                color="green"
                size={30}
                cursor="pointer"
              />
            ) : (
              <BsToggle2Off
                onClick={() => setForm((prev) => ({ ...prev, isSchedule: !prev.isSchedule }))}
                color="gray"
                size={30}
                cursor="pointer"
              />
            )}
            <label className="text-sm font-semibold text-gray-700">
              Is Scheduled
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 mt-6 font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlantRegister;
