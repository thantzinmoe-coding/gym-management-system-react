import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Equipment {
  id: string;
  name: string;
  purchaseDate: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  imageUrl?: string;
}

export interface EquipmentFormData {
  name: string;
  purchaseDate: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  imageFile?: File;
}

interface EquipmentContextType {
  equipments: Equipment[];
  addEquipment: (data: EquipmentFormData) => void;
  updateEquipment: (id: string, data: EquipmentFormData) => void;
  deleteEquipment: (id: string) => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

const initialEquipments: Equipment[] = [
  {
    id: "1",
    name: "Treadmill Pro X1",
    purchaseDate: "2023-01-15",
    condition: "Excellent",
    lastMaintenanceDate: "2024-01-10",
    nextMaintenanceDate: "2024-04-10",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Weight Bench Deluxe",
    purchaseDate: "2023-03-20",
    condition: "Good",
    lastMaintenanceDate: "2024-02-01",
    nextMaintenanceDate: "2024-05-01",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
  },
];

export const EquipmentProvider = ({ children }: { children: ReactNode }) => {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);

  const addEquipment = (data: EquipmentFormData) => {
    const newEquipment: Equipment = {
      id: Date.now().toString(),
      ...data,
      imageUrl: data.imageFile ? URL.createObjectURL(data.imageFile) : undefined,
    };
    setEquipments((prev) => [...prev, newEquipment]);
  };

  const updateEquipment = (id: string, data: EquipmentFormData) => {
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === id
          ? {
              ...eq,
              ...data,
              imageUrl: data.imageFile
                ? URL.createObjectURL(data.imageFile)
                : eq.imageUrl,
            }
          : eq
      )
    );
  };

  const deleteEquipment = (id: string) => {
    setEquipments((prev) => prev.filter((eq) => eq.id !== id));
  };

  return (
    <EquipmentContext.Provider
      value={{ equipments, addEquipment, updateEquipment, deleteEquipment }}
    >
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipments = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error("useEquipments must be used within EquipmentProvider");
  }
  return context;
};
