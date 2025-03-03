import axios from "axios";

let brandNamesCache = null;

export const fetchCarBrands = async () => {
  if (brandNamesCache) {
    return brandNamesCache;
  }

  const apiKey = "5472a624f2msh8a769bd70fc49b8p1db964jsnde9b3903b131";
  if (!apiKey || apiKey.includes("your-api-key")) {
    console.error("Invalid API key");
    return [];
  }

  const options = {
    method: "GET",
    url: "https://cars-encyclo.p.rapidapi.com/api/vehicles/brand-names",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "cars-encyclo.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log("API Response:", response.status);

    // Cache the results
    brandNamesCache = response.data;
    return response.data;
  } catch (error) {
    console.error("Error fetching car brands:", error);
    return [];
  }
};

export const fetchCarModels = async (brandName) => {
  if (!brandName) return [];

  const formattedBrand = brandName.trim();

  console.log(`Fetching models for brand: "${formattedBrand}"`);

  const options = {
    method: "GET",
    url: "https://cars-encyclo.p.rapidapi.com/api/vehicles/models",
    params: { brand: formattedBrand },
    headers: {
      "x-rapidapi-key": "5472a624f2msh8a769bd70fc49b8p1db964jsnde9b3903b131",
      "x-rapidapi-host": "cars-encyclo.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log("API Response:", response.status, typeof response.data);

    if (
      response.data &&
      response.data.models &&
      Array.isArray(response.data.models)
    ) {
      const modelNames = [
        ...new Set(response.data.models.map((item) => item.model)),
      ];
      console.log(
        `Found ${modelNames.length} unique models for ${formattedBrand}`
      );
      return modelNames;
    } else {
      console.log(`No models found in API response for ${formattedBrand}`);
      return [];
    }
  } catch (error) {
    console.error(
      `Error fetching models for ${formattedBrand}:`,
      error.response ? error.response.data : error.message
    );
    return [];
  }
};
