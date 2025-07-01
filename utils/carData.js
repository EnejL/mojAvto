// Hardcoded car data
const carData = {
  "carBrands": {
    "Acura": [
      "ILX", "TLX", "RLX", "MDX", "RDX", "ZDX", "NSX", "Integra", "Legend", "Vigor", "CL", "TL", "RL", "SLX", "RSX"
    ],
    "Alfa Romeo": [
      "Giulia", "Stelvio", "4C", "Giulietta", "MiTo", "159", "156", "147", "GTV", "Spider", "Brera", "GT", "166", "Tonale"
    ],
    "Aston Martin": [
      "DB11", "DBS", "Vantage", "DBX", "Rapide", "Vanquish", "DB9", "V8 Vantage", "V12 Vantage", "One-77", "Vulcan", "Valkyrie"
    ],
    "Audi": [
      "A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "e-tron", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "TT", "S3", "S4", "S5", "S6", "S7", "S8", "SQ5", "SQ7", "SQ8"
    ],
    "Bentley": [
      "Continental GT", "Continental Flying Spur", "Bentayga", "Mulsanne", "Azure", "Arnage", "Brooklands", "Continental R", "Turbo R"
    ],
    "BMW": [
      "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z3", "Z4", "Z8", "i3", "i4", "i7", "i8", "iX", "M2", "M3", "M4", "M5", "M6", "M8", "X3 M", "X4 M", "X5 M", "X6 M"
    ],
    "Buick": [
      "Encore", "Encore GX", "Envision", "Enclave", "LaCrosse", "Regal", "Verano", "Lucerne", "Park Avenue", "Century", "LeSabre", "Riviera", "Skylark", "Electra"
    ],
    "Cadillac": [
      "ATS", "CTS", "XTS", "CT4", "CT5", "CT6", "XT4", "XT5", "XT6", "Escalade", "SRX", "CTS-V", "ATS-V", "ELR", "XLR", "STS", "DTS", "DeVille", "Eldorado", "Seville"
    ],
    "Chevrolet": [
      "Spark", "Sonic", "Cruze", "Malibu", "Impala", "Camaro", "Corvette", "Trax", "Equinox", "Blazer", "Traverse", "Tahoe", "Suburban", "Colorado", "Silverado", "Volt", "Bolt EV", "Bolt EUV", "Aveo", "Cobalt", "HHR", "Monte Carlo", "Astro", "Express", "Avalanche"
    ],
    "Chrysler": [
      "300", "Pacifica", "Voyager", "PT Cruiser", "Sebring", "Concorde", "LHS", "Town & Country", "Aspen", "Crossfire"
    ],
    "Citroen": [
      "C1", "C3", "C4", "C5", "C6", "C-Crosser", "DS3", "DS4", "DS5", "Berlingo", "Picasso", "Xsara", "Saxo", "2CV", "Jumper", "Jumpy"
    ],
    "Dodge": [
      "Charger", "Challenger", "Durango", "Journey", "Grand Caravan", "Dart", "Avenger", "Caliber", "Magnum", "Neon", "Stratus", "Intrepid", "Viper", "Ram 1500", "Ram 2500", "Ram 3500"
    ],
    "Ferrari": [
      "488", "F8", "SF90", "Roma", "Portofino", "812", "LaFerrari", "California", "458", "599", "612", "F430", "360", "355", "348", "328", "308", "Testarossa", "F40", "F50", "Enzo"
    ],
    "Fiat": [
      "500", "500X", "500L", "Panda", "Punto", "Tipo", "Doblo", "Freemont", "Bravo", "Stilo", "Marea", "Barchetta", "Coupe", "Multipla"
    ],
    "Ford": [
      "Fiesta", "Focus", "Fusion", "Mustang", "Taurus", "EcoSport", "Escape", "Edge", "Explorer", "Expedition", "F-150", "F-250", "F-350", "Ranger", "Bronco", "Maverick", "Transit", "E-Series", "Crown Victoria", "Thunderbird", "GT", "Flex", "C-Max"
    ],
    "Genesis": [
      "G70", "G80", "G90", "GV60", "GV70", "GV80", "Coupe", "Sedan"
    ],
    "GMC": [
      "Terrain", "Acadia", "Yukon", "Yukon XL", "Canyon", "Sierra 1500", "Sierra 2500HD", "Sierra 3500HD", "Savana", "Envoy", "Jimmy", "Safari"
    ],
    "Honda": [
      "Civic", "Accord", "Insight", "CR-V", "HR-V", "Pilot", "Passport", "Ridgeline", "Odyssey", "Fit", "Clarity", "S2000", "Element", "Del Sol", "Prelude", "CRX", "NSX"
    ],
    "Hyundai": [
      "Accent", "Elantra", "Sonata", "Azera", "Genesis", "Veloster", "Kona", "Tucson", "Santa Fe", "Palisade", "Venue", "Ioniq", "Nexo", "Equus", "Entourage", "Veracruz", "Santa Cruz"
    ],
    "Infiniti": [
      "Q50", "Q60", "Q70", "QX30", "QX50", "QX60", "QX70", "QX80", "G35", "G37", "M35", "M45", "FX35", "FX45", "EX35", "JX35"
    ],
    "Jaguar": [
      "XE", "XF", "XJ", "F-PACE", "E-PACE", "I-PACE", "F-TYPE", "XK", "S-TYPE", "X-TYPE", "XJS", "XJ8", "XJR", "XKR"
    ],
    "Jeep": [
      "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Renegade", "Patriot", "Liberty", "Commander", "Grand Wagoneer", "Wagoneer"
    ],
    "Kia": [
      "Rio", "Forte", "Optima", "K5", "Stinger", "Soul", "Seltos", "Sportage", "Sorento", "Telluride", "Sedona", "Carnival", "Niro", "EV6", "Spectra", "Magentis", "Amanti", "Borrego"
    ],
    "Lamborghini": [
      "Huracán", "Aventador", "Urus", "Gallardo", "Murciélago", "Diablo", "Countach", "Jalpa", "Silhouette", "Espada", "Miura"
    ],
    "Land Rover": [
      "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque", "Discovery", "Discovery Sport", "Defender", "Freelander", "LR2", "LR3", "LR4"
    ],
    "Lexus": [
      "IS", "ES", "GS", "LS", "RC", "LC", "UX", "NX", "RX", "GX", "LX", "CT", "HS", "SC", "LFA", "GS F", "RC F", "LS F"
    ],
    "Lincoln": [
      "MKZ", "Continental", "Corsair", "Nautilus", "Aviator", "Navigator", "MKC", "MKX", "MKS", "MKT", "Town Car", "Mark VIII", "LS", "Blackwood", "Mark LT"
    ],
    "Maserati": [
      "Ghibli", "Quattroporte", "Levante", "GranTurismo", "GranCabrio", "MC20", "3200 GT", "Coupe", "Spyder"
    ],
    "Mazda": [
      "Mazda2", "Mazda3", "Mazda6", "MX-5 Miata", "CX-3", "CX-30", "CX-5", "CX-9", "CX-50", "RX-7", "RX-8", "Tribute", "B-Series", "MPV", "Millenia", "Protegé", "626"
    ],
    "McLaren": [
      "570S", "720S", "765LT", "Artura", "GT", "P1", "650S", "540C", "600LT", "Senna", "Speedtail", "Elva"
    ],
    "Mercedes-Benz": [
      "A-Class", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "S-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "SL", "SLC", "AMG GT", "EQC", "EQS", "EQE", "Metris", "Sprinter", "SLK", "ML", "GL", "GLK", "R-Class", "Maybach"
    ],
    "Mini": [
      "Cooper", "Cooper S", "John Cooper Works", "Clubman", "Countryman", "Paceman", "Roadster", "Coupe", "Convertible"
    ],
    "Mitsubishi": [
      "Mirage", "Lancer", "Eclipse Cross", "Outlander", "Outlander Sport", "Pajero", "Montero", "Galant", "Diamante", "3000GT", "Eclipse", "Endeavor", "Raider", "i-MiEV"
    ],
    "Nissan": [
      "Versa", "Sentra", "Altima", "Maxima", "370Z", "GT-R", "Kicks", "Rogue", "Murano", "Pathfinder", "Armada", "Titan", "Frontier", "NV200", "Leaf", "Ariya", "Juke", "Quest", "Xterra", "Cube", "350Z", "240SX"
    ],
    "Peugeot": [
      "108", "208", "308", "508", "2008", "3008", "5008", "Partner", "Expert", "Boxer", "RCZ", "407", "406", "307", "206", "106"
    ],
    "Porsche": [
      "911", "718 Boxster", "718 Cayman", "Panamera", "Cayenne", "Macan", "Taycan", "928", "944", "968", "Boxster", "Cayman", "Carrera GT"
    ],
    "Ram": [
      "1500", "2500", "3500", "4500", "5500", "ProMaster", "ProMaster City"
    ],
    "Renault": [
      "Clio", "Megane", "Laguna", "Latitude", "Scenic", "Espace", "Captur", "Kadjar", "Koleos", "Talisman", "Twingo", "Zoe", "Kangoo", "Master"
    ],
    "Rolls-Royce": [
      "Ghost", "Wraith", "Dawn", "Cullinan", "Phantom", "Silver Seraph", "Silver Shadow", "Corniche", "Park Ward"
    ],
    "Saab": [
      "9-3", "9-5", "9-7X", "900", "9000", "99", "96", "95", "93", "92"
    ],
    "Subaru": [
      "Impreza", "Legacy", "Outback", "Forester", "Crosstrek", "Ascent", "WRX", "WRX STI", "BRZ", "Tribeca", "Baja", "SVX"
    ],
    "Tesla": [
      "Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Roadster", "Semi"
    ],
    "Toyota": [
      "Corolla", "Camry", "Avalon", "Prius", "Yaris", "C-HR", "RAV4", "Highlander", "4Runner", "Sequoia", "Land Cruiser", "Tacoma", "Tundra", "Sienna", "Supra", "86", "Mirai", "Venza", "Matrix", "Celica", "MR2", "Tercel", "Echo", "Solara", "FJ Cruiser"
    ],
    "Volkswagen": [
      "Jetta", "Passat", "Arteon", "Golf", "GTI", "Golf R", "Beetle", "Atlas", "Tiguan", "Touareg", "ID.4", "e-Golf", "CC", "Eos", "Phaeton", "Routan", "Eurovan"
    ],
    "Volvo": [
      "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C30", "C70", "S40", "S70", "S80", "V40", "V50", "V70", "XC70", "240", "740", "850", "960"
    ]
  }
};

export const fetchCarBrands = async () => {
  try {
    const brands = Object.keys(carData.carBrands).sort();
    return brands;
  } catch (error) {
    console.error("Error fetching car brands:", error);
    return [];
  }
};

export const fetchCarModels = async (brandName) => {
  if (!brandName) return [];

  try {
    const formattedBrand = brandName.trim();
    console.log(`Fetching models for brand: "${formattedBrand}"`);
    
    const models = carData.carBrands[formattedBrand] || [];
    console.log(`Found ${models.length} models for ${formattedBrand}`);
    
    return models;
  } catch (error) {
    console.error(`Error fetching models for ${brandName}:`, error);
    return [];
  }
};
