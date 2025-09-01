import { createContext, useContext, useState, ReactNode } from "react";

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Package {
  id: number;
  name: string;
  price: number;
  duration: string;
  description: string;
  type: "personal" | "group";
  trainerId?: string;
  trainerName?: string;
  schedule?: Schedule[];
  status?: "Active" | "Inactive";
  isBooked?: boolean;
}

interface PackageContextType {
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const usePackages = () => {
  const context = useContext(PackageContext);
  if (!context) throw new Error("usePackages must be used within a PackageProvider");
  return context;
};

export const PackageProvider = ({ children }: { children: ReactNode }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  return (
    <PackageContext.Provider value={{ packages, setPackages }}>
      {children}
    </PackageContext.Provider>
  );
};
