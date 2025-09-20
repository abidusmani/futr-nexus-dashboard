// import { selectPlant } from './../lib/RMS/report/query-model/dropdownContent';
import api from "./axiosInstance";
// import { DeviceMapping, PlantOption } from '@/app/deviceMapping/DeviceMappingForm'; // Adjust path as needed


async function plantRegistration(formdata: any) {
  try {
    const response = await api.post("/plants/plantRegistration", formdata);
    return response.data;
  } catch (error) {
    console.error("plant not registered:", error);
    throw error;
  }
}


// utils/api.ts or where your axios instance is
async function userSearch(query: string) {
  try {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data.results; // should return array of users
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

// async function deviceMappingSave(plantName: string, mappings: DeviceMapping[]) {
//   try {
//     const response = await api.post("/deviceMapping", { plantName, mappings });
//     return response.data;
//   } catch (error) {
//     console.error("Error saving device mapping:", error);
//     throw error;
//   }
// }

async function selectPlant(query: string): Promise<PlantOption[]> {
  try {
    const response = await api.get(`/search/plantSearch?q=${encodeURIComponent(query)}`);
    console.log("Response from plant search:", response.data);

    const results = response.data.results;

    if (!Array.isArray(results)) {
      throw new Error('Invalid plant list format from server');
    }

    return results;
  } catch (error) {
    console.error('Error fetching plant details:', error);
    return [];
  }
}



export {  plantRegistration, userSearch , selectPlant };