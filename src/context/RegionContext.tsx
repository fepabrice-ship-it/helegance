import React, { createContext, useContext, useState, useEffect } from "react";

export type Region = "CM" | "CG" | "OTHER";

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  isLoading: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<Region>("CM");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectRegion = async () => {
      // 1. Check localStorage first
      const saved = localStorage.getItem("tatoo_pinterest_region");
      if (saved) {
        setRegionState(saved as Region);
        setIsLoading(false);
        return;
      }

      // 2. Automatic detection via IP
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        if (data.country_code === "CM") {
          setRegion("CM");
        } else if (data.country_code === "CG") {
          setRegion("CG");
        } else {
          setRegion("OTHER");
        }
      } catch (err) {
        console.error("Geolocation error:", err);
        setRegion("CM"); // Fallback to Cameroon
      } finally {
        setIsLoading(false);
      }
    };

    detectRegion();
  }, []);

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    localStorage.setItem("tatoo_pinterest_region", newRegion);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, isLoading }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
};
