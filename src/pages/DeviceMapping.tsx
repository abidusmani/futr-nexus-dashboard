"use client";

import React, { useState, useEffect } from "react";
import { MdDeleteForever } from "react-icons/md";
import { API_BASE_URL } from '@/lib/api';

type DeviceType =
  | "Inverter"
  | "WeatherSensor"
  | "Meter";

// Type for model options fetched from the /deviceLebel API
export type ModelOption = {
  _id: string;
  modelName: string;
  modelMake: string;
  modelType: string;
};

// Updated Form state type for each row
export type DeviceMappingForm = {
  imei: string;
  sid: string;
  type: DeviceType;
  name: string;
  acLoad: string;
  dcLoad: string;
  modelId: string; // <-- NEW: To store the selected model's ID
  modelOptions: ModelOption[]; // <-- NEW: To store the dropdown options for this row
};

// API payload type for a single device mapping
export type DeviceMappingPayload = {
  imei: string;
  sid: number;
  type: string;
  name: string;
  modelId: string; // <-- NEW
  acLoad?: number; // <-- Optional
  dcLoad?: number; // <-- Optional
};

// Type for plant options fetched from the search API
export type PlantOption = {
  plantId: string;
  plantName: string;
};

// Helper function to fetch models
const fetchModels = async (modelType: DeviceType, token: string | null) => {
  if (!token) throw new Error("No token provided");
  
  const response = await fetch(
    `${API_BASE_URL}/deviceMapping/deviceLebel?modelType=${modelType}`,
    {
      headers: { "Authorization": `Bearer ${token}` }
    }
  );
  if (!response.ok) throw new Error(`Failed to fetch models for ${modelType}`);
  const models: ModelOption[] = await response.json();
  return models;
};


const DeviceMapping: React.FC = () => {
  const [plantQuery, setPlantQuery] = useState("");
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize with an empty array; the useEffect will populate it.
  const [mappings, setMappings] = useState<DeviceMappingForm[]>([]);

  const deviceTypes: DeviceType[] = [
    "Inverter",
    "WeatherSensor",
    "Meter",
  ];

  // Effect to fetch plants based on the search query
  useEffect(() => {
    if (selectedPlant && plantQuery === selectedPlant.plantName) {
      setPlantOptions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      if (plantQuery.trim()) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("You are not logged in. Please log in and try again.");
            return;
          }

          const response = await fetch(
            `${API_BASE_URL}/plants?search=${encodeURIComponent(plantQuery)}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (!response.ok) throw new Error("Network response was not ok");

          const results = await response.json();
          setPlantOptions(results.data || []);

        } catch (error) {
          console.error("Failed to fetch plants:", error);
          setPlantOptions([]);
        }
      } else {
        setPlantOptions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [plantQuery, selectedPlant]);


  // Fetches model options for a specific mapping row based on its type
  const fetchModelOptions = async (index: number, modelType: DeviceType) => {
    try {
      const token = localStorage.getItem("token");
      const models = await fetchModels(modelType, token);
      
      const updated = [...mappings];
      updated[index].modelOptions = models;
      updated[index].modelId = ""; // Reset model selection
      setMappings(updated);

    } catch (error) {
      console.error("Error fetching device models:", error);
      // Set empty options for that row on failure
      const updated = [...mappings];
      updated[index].modelOptions = [];
      updated[index].modelId = "";
      setMappings(updated);
    }
  };

  // Function to reset the form to its initial state (one row with models)
  const resetFormToInitial = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Fetch models for the default "Inverter" type
      const initialModels = await fetchModels("Inverter", token);
      setMappings([{
        imei: "", sid: "", type: "Inverter", name: "", acLoad: "", dcLoad: "", modelId: "", modelOptions: initialModels
      }]);
    } catch (error) {
      console.error("Failed to reset form with initial models:", error);
      // Fallback to empty
      setMappings([{
        imei: "", sid: "", type: "Inverter", name: "", acLoad: "", dcLoad: "", modelId: "", modelOptions: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // On component mount, load the initial form state
  useEffect(() => {
    resetFormToInitial();
  }, []); // Runs once on mount

  // Map frontend device type identifiers to backend-expected names
    const mapDeviceTypeToBackend = (type: DeviceType) => {
      switch (type) {
        case "Inverter":
          return "Inverter";
        case "Meter":
          return "Meter";
        case "WeatherSensor":
          return "WeatherSensor";
        default:
          return type;
      }
    };

  const handleMappingChange = (
    index: number,
    field: keyof DeviceMappingForm,
    value: string,
  ) => {
    const updated = [...mappings];
    // We use 'as any' here because TypeScript can't infer the dynamic key
    (updated[index] as any)[field] = value;

    // If the device type changed, fetch new models for that row
    if (field === "type") {
      fetchModelOptions(index, value as DeviceType);
    }
    
    setMappings(updated);
  };

  const addMapping = () => {
    const newIndex = mappings.length;
    const newMapping: DeviceMappingForm = {
      imei: "", sid: "", type: "Inverter", name: "", acLoad: "", dcLoad: "", modelId: "", modelOptions: []
    };
    
    // Add to state first
    setMappings([...mappings, newMapping]);
    
    // Then fetch default models for the new row
    fetchModelOptions(newIndex, newMapping.type);
  };

  const removeMapping = (index: number) => {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(updated);
  };

  // Handler for the final form submission
  const handleSubmit = async () => {
    if (!selectedPlant) {
      alert("Please search and select a plant.");
      return;
    }

    // --- NEW VALIDATION ---
    for (const m of mappings) {
      if (!m.imei || !m.sid || !m.type || !m.modelId) {
        alert("Please fill in all required fields (*) for all devices, including selecting a device model.");
        return;
      }
      if (isNaN(parseInt(m.sid, 10))) {
         alert(`Invalid Slave ID: ${m.sid}. Please enter a number.`);
         return;
      }
    }
    // --- END VALIDATION ---

    const cleanedMappings: DeviceMappingPayload[] = mappings.map((m) => {
      // Start with the base payload
      const payload: DeviceMappingPayload = {
        imei: m.imei.trim(),
        sid: parseInt(m.sid, 10),
        type: mapDeviceTypeToBackend(m.type),
        name: m.name.trim() || "", // Send empty string if no name
        modelId: m.modelId, // <-- ADDED
      };

      // Conditionally add AC/DC load only if they have a value
      if (m.acLoad) {
        payload.acLoad = parseFloat(m.acLoad);
      }
      if (m.dcLoad) {
        payload.dcLoad = parseFloat(m.dcLoad);
      }
      
      return payload;
    });

    // ✅ THE FIX: Change to 'plantId'
    const finalPayload = {
      plantId: selectedPlant.plantId,
      mappings: cleanedMappings,
    };

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/deviceMapping`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to save mapping");
      }

      alert("Device mapping saved successfully!");

      // Reset form on success
      resetFormToInitial();
      setSelectedPlant(null);
      setPlantQuery("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Error: ${errorMessage}`);
      console.error("Error saving device mapping:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Device Mapping
      </h2>

      {/* Plant Search Section */}
      <div className="mb-6 border p-4 rounded-lg bg-white shadow-md">
        <p className="text-xl font-semibold mb-3 text-gray-700">
          Step 1: Select a Plant
        </p>
        <div className="relative">
          <input
            type="text"
            value={plantQuery}
            onChange={(e) => {
              setPlantQuery(e.target.value);
              setSelectedPlant(null);
            }}
            placeholder="Type to search for a plant..."
            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          {plantOptions.length > 0 && (
            <ul className="absolute w-full bg-white border rounded-md shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
              {plantOptions.map((plant) => (
                <li
                  key={plant.plantId}
                  onClick={() => {
                    setSelectedPlant(plant);
                    setPlantQuery(plant.plantName);
                    setPlantOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {plant.plantName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Device Mappings Section */}
      <div className="mb-6 border p-4 rounded-lg bg-white shadow-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-semibold text-gray-700">
            Step 2: Add Devices
          </p>
          <button
            onClick={addMapping}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md transition-colors disabled:bg-gray-400"
            disabled={isLoading}
          >
            + Add Device
          </button>
        </div>

        {mappings.map((mapping, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-500 bg-blue-50 p-4 mb-4 rounded-r-lg relative"
          >
            <span className="absolute -top-2 left-3 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full shadow">
              {mapping.type.charAt(0).toUpperCase() + mapping.type.slice(1)}
            </span>
            
            {/* --- UPDATED GRID (4 COLS) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              {/* IMEI */}
              <div>
                <label className="text-sm font-medium text-gray-600">IMEI *</label>
                <input
                  type="text"
                  value={mapping.imei}
                  onChange={(e) => handleMappingChange(index, "imei", e.target.value)}
                  placeholder="Enter IMEI"
                  className="w-full border rounded-md px-2 py-1 mt-1"
                  disabled={isLoading}
                />
              </div>

              {/* Slave ID */}
              <div>
                <label className="text-sm font-medium text-gray-600">Slave ID *</label>
                <input
                  type="text"
                  value={mapping.sid}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      handleMappingChange(index, "sid", value);
                    }
                  }}
                  placeholder="e.g., 1"
                  className="w-full border rounded-md px-2 py-1 mt-1"
                  disabled={isLoading}
                />
              </div>

              {/* Device Type */}
              <div>
                <label className="text-sm font-medium text-gray-600">Device Type *</label>
                <select
                  value={mapping.type}
                  onChange={(e) => handleMappingChange(index, "type", e.target.value as DeviceType)}
                  onFocus={() => {
                    // If options are empty when user focuses the type select, proactively load models for this type
                    if (mapping.modelOptions.length === 0) {
                      // fire-and-forget
                      fetchModelOptions(index, mapping.type).catch((err) => console.error(err));
                    }
                  }}
                  className="w-full border rounded-md px-2 py-1 mt-1 bg-white"
                  disabled={isLoading}
                >
                  {deviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- NEW: Device Model --- */}
              <div>
                <label className="text-sm font-medium text-gray-600">Device Model *</label>
                <select
                  value={mapping.modelId}
                  onChange={(e) => handleMappingChange(index, "modelId", e.target.value)}
                  onFocus={() => {
                    // If model options are empty when the user focuses the model select, fetch them for the current type
                    if (mapping.modelOptions.length === 0) {
                      fetchModelOptions(index, mapping.type).catch((err) => console.error(err));
                    }
                  }}
                  className="w-full border rounded-md px-2 py-1 mt-1 bg-white"
                  disabled={isLoading || mapping.modelOptions.length === 0}
                >
                  <option value="">
                    {mapping.modelOptions.length === 0 ? (isLoading ? "Loading..." : "Select type") : "Select a model"}
                  </option>
                  {mapping.modelOptions.map((model) => (
                    <option key={model._id} value={model._id}>
                      {model.modelName} 
                    </option>
                  ))}
                </select>
              </div>

              {/* Block Name */}
              <div>
                <label className="text-sm font-medium text-gray-600">Block Name</label>
                <input
                  type="text"
                  value={mapping.name}
                  onChange={(e) => handleMappingChange(index, "name", e.target.value)}
                  placeholder="e.g., Inverter A"
                  className="w-full border rounded-md px-2 py-1 mt-1"
                  disabled={isLoading}
                />
              </div>

              {/* AC Load */}
              <div>
                <label className="text-sm font-medium text-gray-600">AC Load (kW)</label>
                <input
                  type="text"
                  value={mapping.acLoad}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      handleMappingChange(index, "acLoad", value);
                    }
                  }}
                  placeholder="e.g., 150.5"
                  className="w-full border rounded-md px-2 py-1 mt-1"
                  disabled={isLoading}
                />
              </div>

              {/* DC Load */}
              <div>
                <label className="text-sm font-medium text-gray-600">DC Load (kW)</label>
                <input
                  type="text"
                  value={mapping.dcLoad}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      handleMappingChange(index, "dcLoad", value);
                    }
                  }}
                  placeholder="e.g., 175.2"
                  className="w-full border rounded-md px-2 py-1 mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {mappings.length > 1 && (
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                onClick={() => removeMapping(index)}
                title="Remove Device"
                disabled={isLoading}
              >
                <MdDeleteForever className="h-6 w-6" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg text-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading || !selectedPlant || mappings.length === 0}
        >
          {isLoading ? "Submitting..." : "Submit Mapping"}
        </button>
      </div>
    </div>
  );
};

export default DeviceMapping;