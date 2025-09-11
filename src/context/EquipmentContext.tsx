// EquipmentContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { equipmentService } from "@/services/equipmentService";

export interface Equipment {
  id: string;
  name: string;
  purchaseDate: string;
  equipmentCondition: "Excellent" | "Good" | "Fair" | "Poor";
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  imageUrl?: string;
}

export interface EquipmentFormData {
  name: string;
  purchaseDate: string;
  equipmentCondition: "Excellent" | "Good" | "Fair" | "Poor";
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  imageFile?: File;
}

interface EquipmentContextType {
  equipments: Equipment[];
  addEquipment: (data: EquipmentFormData) => Promise<void>;
  updateEquipment: (id: string, data: EquipmentFormData) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider = ({ children }: { children: ReactNode }) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const equipmentsData = await equipmentService.getAllEquipments();
        console.log("Fetched Equipments:", equipmentsData);
        setEquipments(equipmentsData);
      } catch (error) {
        console.error("Error fetching equipments:", error);
      }
    };

    fetchEquipments();
  }, []);

  const addEquipment = async (data: EquipmentFormData) => {
    try {
      const newEquipment = await equipmentService.addEquipment({
        ...data,
        equipmentPhoto: data.imageFile,
      });
      setEquipments((prev) => [...prev, newEquipment]);
    } catch (error) {
      console.error("Error adding equipment:", error);
      throw error;
    }
  };

  // EquipmentContext.tsx
  const updateEquipment = async (id: string, data: EquipmentFormData) => {
    if (!id || id.trim() === "") {
      throw new Error("Invalid equipment ID");
    }
    try {
      const updatedEquipment = await equipmentService.updateEquipment(id, {
        ...data,
        equipmentPhoto: data.imageFile,
      });
      setEquipments((prev) =>
        prev.map((eq) => (eq.id === id ? updatedEquipment : eq))
      );
    } catch (error) {
      console.error("Error updating equipment:", error);
      throw error;
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!id || id.trim() === "") {
      throw new Error("Invalid equipment ID");
    }
    try {
      await equipmentService.deleteEquipment(id);
      setEquipments((prev) => prev.filter((eq) => eq.id !== id));
    } catch (error) {
      console.error("Error deleting equipment:", error);
      throw error;
    }
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