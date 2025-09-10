import { gymPackageService } from "@/services/gymPackageService";
import { createContext, useContext, useState, ReactNode } from "react";

export interface Schedule {
  id?: number,
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
  gymPackageType: "PERSONAL" | "GROUP";
  trainerId?: string;
  trainerName?: string;
  startDate?: string;
  endDate?: string;
  schedules?: Schedule[];
  status?: "ACTIVE" | "INACTIVE";
}

interface PackageContextType {
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  getAllGymPackages: () => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const usePackages = () => {
  const context = useContext(PackageContext);
  if (!context) throw new Error("usePackages must be used within a PackageProvider");
  return context;
};

export const PackageProvider = ({ children }: { children: ReactNode }) => {

  const [packages, setPackages] = useState<Package[]>([]);

  const getAllGymPackages = async () => {
    try {
      const response = await gymPackageService.getAllGymPackages();
      console.log(response.data);
      setPackages(response.data);
    } catch (err) {
      console.error('Failed to fetch gym packages', err);
    }

  }

  return (
    <PackageContext.Provider value={{ packages, setPackages, getAllGymPackages }}>
      {children}
    </PackageContext.Provider>
  );
};
