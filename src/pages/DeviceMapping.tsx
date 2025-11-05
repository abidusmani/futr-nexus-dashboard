"use client";

import React, { useState, useEffect } from "react";
import { MdDeleteForever } from "react-icons/md";
import { API_BASE_URL } from '@/lib/api';

type DeviceType =
  | "Inverter"
  | "WeatherSensor"
  | "Meter";

// Form state type
export type DeviceMappingForm = {
  imei: string;
  sid: string;
  type: DeviceType;
  name: string;
  acLoad: string;
  dcLoad: string;
};

// API payload type for a single device
export type DeviceMappingPayload = {
  imei: string;
  sid: number;
  // Use string here because backend expects formatted type names (e.g. 'Inverter', 'Meter', 'WeatherSensor')
  type: string;
  name: string;
  acLoad: number; 
  dcLoad: number; 
};

// Type for plant options fetched from the search API
export type PlantOption = {
  plantId: string;
  plantName: string;
};

const DeviceMapping: React.FC = () => {
  const [plantQuery, setPlantQuery] = useState("");
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mappings, setMappings] = useState<DeviceMappingForm[]>([
    { imei: "", sid: "", type: "Inverter", name: "", acLoad: "", dcLoad: "" },
  ]);

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

  // Map frontend device type identifiers to backend-expected names
    const mapDeviceTypeToBackend = (type: DeviceType) => {
      switch (type) {
        case "Inverter":
          return "Inverter";
        case "Meter":
          return "Meter";
        case "WeatherSensor":
          return "WeatherSensor";
        // For any other DeviceType (shouldn't occur), return the raw value
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
    updated[index] = { ...updated[index], [field]: value };
    setMappings(updated);
  };

  const addMapping = () => {
    setMappings([
      ...mappings,
      { imei: "", sid: "", type: "Inverter", name: "", acLoad: "", dcLoad: "" },
    ]);
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
    // ... your other validation logic ...

    const cleanedMappings: DeviceMappingPayload[] = mappings.map((m) => ({
      imei: m.imei.trim(),
      sid: parseInt(m.sid, 10),
      // convert frontend type into backend expected name
      type: mapDeviceTypeToBackend(m.type),
      name: m.name.trim(),
      acLoad: m.acLoad ? parseFloat(m.acLoad) : 0,
      dcLoad: m.dcLoad ? parseFloat(m.dcLoad) : 0,
    }));

    // ✅ THE FIX: Change 'plantId' to 'plantName' to match the backend's requirement
    const finalPayload = {
      plantName: selectedPlant.plantName,
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
      setMappings([{ imei: "", sid: "", type: "Inverter", name: "", acLoad: "", dcLoad: "" }]);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
          disabled={isLoading || !selectedPlant}
        >
          {isLoading ? "Submitting..." : "Submit Mapping"}
        </button>
      </div>
    </div>
  );
};

export default DeviceMapping;