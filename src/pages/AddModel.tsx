"use client";

import React, { useState } from "react";
import { 
  FaDownload, 
  FaUpload 
} from "react-icons/fa";
import { 
  IoMdAddCircleOutline 
} from "react-icons/io";
import { 
  MdDeleteForever 
} from "react-icons/md";
// Import your API base URL
import { API_BASE_URL } from '@/lib/api';

// Type for a single parameter row
type ParameterRow = {
  id: string; // To use as a stable React key
  name: string;
  dataType: string;
  multiplicationFactor: string;
  offset: string;
  registerAddress: string; // Still in state, but we will omit from payload
  futrosKey: string;
};

// Type for the backend-expected parameter payload
type BackendParameter = {
  sourceName: string;
  futrOSKey: string;
  dataType: string;
  multiplicationFactor: number;
  offset: number;
};

// Data type options for the dropdown
const dataTypeOptions = [
  "32int",
  "16int",
  "String",
  "Float",
  "Boolean"
];

// Model type options for the dropdown
const modelTypeOptions = [
  "Inverter",
  "Meter",
  "WeatherSensor"
];

// Function to get the initial state for one row
const createInitialParameter = (): ParameterRow => ({
  id: crypto.randomUUID(),
  name: "",
  dataType: dataTypeOptions[0], // Default to "32int"
  multiplicationFactor: "1",
  offset: "0",
  registerAddress: "",
  futrosKey: "",
});

const AddModelDevice: React.FC = () => {
  // State for the top-level model details
  const [modelName, setModelName] = useState("");
  const [deviceMake, setDeviceMake] = useState("");
  const [modelType, setModelType] = useState(modelTypeOptions[0]); // Default to first
  const [isLoading, setIsLoading] = useState(false); // <-- NEW
  
  // State for the dynamic parameter rows
  const [parameters, setParameters] = useState<ParameterRow[]>([
    createInitialParameter(),
  ]);

  /**
   * Handles changes in a specific parameter row's input field
   */
  const handleParameterChange = (
    index: number,
    field: keyof ParameterRow,
    value: string
  ) => {
    const updatedParameters = [...parameters];
    // We use 'as any' because TypeScript can't infer the dynamic key
    (updatedParameters[index] as any)[field] = value;
    setParameters(updatedParameters);
  };

  /**
   * Adds a new, empty parameter row
   */
  const addParameterRow = () => {
    setParameters([
      ...parameters,
      createInitialParameter(),
    ]);
  };

  /**
   * Removes a parameter row at a specific index
   */
  const removeParameterRow = (index: number) => {
    // Prevent removing the last row
    if (parameters.length <= 1) return;
    
    const updatedParameters = parameters.filter((_, i) => i !== index);
    setParameters(updatedParameters);
  };

  /**
   * Resets the form to its initial state
   */
  const resetForm = () => {
    setModelName("");
    setDeviceMake("");
    setModelType(modelTypeOptions[0]);
    setParameters([createInitialParameter()]);
  };

  /**
   * Handles the final form submission to the backend
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!modelName || !deviceMake) {
      alert("Please fill in Model Name and Device Make.");
      return;
    }
    
    if (parameters.some(p => !p.name || !p.futrosKey)) {
      alert("Please fill in at least the Name and FutrOS Key for all parameters.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Transform frontend state to backend payload
      const formattedParameters: BackendParameter[] = parameters.map(row => ({
        sourceName: row.name,
        futrOSKey: row.futrosKey,
        dataType: row.dataType,
        // Convert to number, default to 0 if empty/invalid
        multiplicationFactor: parseFloat(row.multiplicationFactor) || 0,
        offset: parseFloat(row.offset) || 0,
      }));

      // 2. Create the final payload
      const finalPayload = {
        modelName,
        modelMake: deviceMake, // Map frontend 'deviceMake' to backend 'modelMake'
        modelType,
        parameters: formattedParameters,
      };

      // 3. Get token and make API call
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/deviceMapping/deviceLebel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to create model");
      }

      // 4. Handle success
      alert("Device Model created successfully!");
      resetForm(); // Reset the form

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Error: ${errorMessage}`);
      console.error("Error creating device model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Add Model Device
        </h2>
        <div className="flex items-center gap-3">
          <button 
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50"
            disabled={isLoading}
          >
            <FaDownload />
            Sample CSV
          </button>
          <button 
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50"
            disabled={isLoading}
          >
            <FaUpload />
            Upload CSV
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Update"}
          </button>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white p-6 shadow-md rounded-lg">
        {/* Model Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Model Name *
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Model Name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Device Make *
            </label>
            <input
              type="text"
              value={deviceMake}
              onChange={(e) => setDeviceMake(e.target.value)}
              placeholder="Device Make"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Model Type *
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              disabled={isLoading}
            >
              {modelTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parameters Section */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Parameters
        </h3>
        
        {/* This div handles the horizontal scrolling */}
        <div className="overflow-x-auto">
          {/* We set a min-width to force scrolling if needed */}
          <table className="w-full min-w-[1200px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">S.No.</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Data Type</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Multiplication Factor</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Offset</th>
                {/* As per your schema, Register Address is not sent.
                   If you need it, add it back to the BackendParameter type and handleSubmit
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Register Address</th>
                */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">FutrOS Key</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Action</th>
              </tr>
            </thead>
            
            {/* Table Body - Dynamic Rows */}
            <tbody className="bg-white divide-y divide-gray-200">
              {parameters.map((row, index) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-50"
                      disabled={isLoading}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.dataType}
                      onChange={(e) => handleParameterChange(index, "dataType", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 bg-white disabled:bg-gray-50"
                      disabled={isLoading}
                    >
                      {dataTypeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="1"
                      value={row.multiplicationFactor}
                      onChange={(e) => handleParameterChange(index, "multiplicationFactor", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-50"
                      disabled={isLoading}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="0"
                      value={row.offset}
                      onChange={(e) => handleParameterChange(index, "offset", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-50"
                      disabled={isLoading}
                    />
                  </td>
                  {/*
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Register Address"
                      value={row.registerAddress}
                      onChange={(e) => handleParameterChange(index, "registerAddress", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-50"
                      disabled={isLoading}
                    />
                  </td>
                  */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="FutrOS Key"
                      value={row.futrosKey}
                      onChange={(e) => handleParameterChange(index, "futrosKey", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-50"
                      disabled={isLoading}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addParameterRow}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        title="Add new row"
                        disabled={isLoading}
                      >
                        <IoMdAddCircleOutline className="h-6 w-6" />
                      </button>
                      {parameters.length > 1 && (
                        <button
                          onClick={() => removeParameterRow(index)}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          title="Remove row"
                          disabled={isLoading}
                        >
                          <MdDeleteForever className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddModelDevice;