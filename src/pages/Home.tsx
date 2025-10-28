"use client";

import React, { useState, useEffect } from "react";
import { withApi } from '@/lib/api';
import PlantDetails from "./PlantDetails";

const HomePage = () => {
  // ... (Your existing state variables)
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);

  const rowsPerPage = 5;

  // A flag to force a re-fetch
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use a separate useEffect to handle fetching data based on both searchTerm and currentPage
  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      setError(null);
      try {
        // ... (Your API call logic)
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const url = withApi(`/plants?search=${encodeURIComponent(
          searchTerm
        )}&page=${currentPage}&limit=${rowsPerPage}`);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to parse error response." }));
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        }

        const result = await response.json();
        if (result.success) {
          setPlants(result.data);
          setTotalPages(Math.ceil(result.totalCount / rowsPerPage));
        } else {
          throw new Error(result.message || "Failed to fetch data");
        }
      } catch (e) {
        console.error("Error fetching plants:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [searchTerm, currentPage, refreshTrigger]); // Add refreshTrigger to the dependency array

  // This hook ensures that whenever the search term changes, the page resets to 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ... (The rest of your component remains the same)

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
  };

  const handleBackClick = () => {
    setSelectedPlant(null);
  };

  // New function to handle updates from the child component
  const handlePlantUpdate = () => {
    // Trigger a re-fetch of the plants list
    setRefreshTrigger((prev) => prev + 1);
    setSelectedPlant(null); // Return to the main list view
  };

  const renderPaginationButtons = () => {
    // ... (your existing pagination logic)
    const buttons = [];
    const pagesToShow = 6;
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 text-gray-600 hover:bg-blue-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="text-sm text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
            i === currentPage
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-600 hover:bg-blue-100"
          }`}
        >
          {i}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="text-sm text-gray-500">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 text-gray-600 hover:bg-blue-100"
        >
          {totalPages}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {selectedPlant ? (
          <PlantDetails
            selectedPlant={selectedPlant}
            onBackClick={handleBackClick}
            onUpdate={handlePlantUpdate} // Pass the new update handler
          />
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div className="relative w-full max-w-sm">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"
                />
              </div>
            </div>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Plant Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Project Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      DC Capacity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Modules
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-blue-600"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-red-600">
                        Error: {error}
                      </td>
                    </tr>
                  ) : plants.length > 0 ? (
                    plants.map((item, index) => (
                      <tr
                        key={item.plantId || index}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer"
                          onClick={() => handlePlantClick(item)}
                        >
                          {item.plantName 
  ? item.plantName.charAt(0).toUpperCase() + item.plantName.slice(1) 
  : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.projectType}
                        </td>
                        {/* ⚠️ FIX IS HERE ⚠️ */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {item.dcCapacity?.toString()}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {item.modules?.toString()}
</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-gray-500"
                      >
                        No plants found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left text-sm"></i>
                </button>
                <div className="flex space-x-1">
                  {renderPaginationButtons()}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-right text-sm"></i>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Go to</span>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const pageNumber = parseInt(e.target.value);
                    if (
                      !isNaN(pageNumber) &&
                      pageNumber >= 1 &&
                      pageNumber <= totalPages
                    ) {
                      setCurrentPage(pageNumber);
                    }
                  }}
                  className="w-16 px-3 py-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Page</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
