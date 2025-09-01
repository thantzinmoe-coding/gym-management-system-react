import { createContext, useContext, useState, ReactNode } from "react";

export interface Trainer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string[];
  experience?: number;
  rating?: number;
  totalClients?: number;
  bio?: string;
  certifications?: string[];
  availability?: "available" | "busy" | "unavailable";
  status?: "Active" | "Inactive";
  packages: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    type: string;
  }>;
}

interface TrainerContextType {
  trainers: Trainer[];
  addTrainer: (trainer: Omit<Trainer, "id">) => void;
  updateTrainer: (id: string, trainer: Partial<Trainer>) => void;
  removeTrainer: (id: string) => void;
}

const TrainerContext = createContext<TrainerContextType | undefined>(undefined);

export const useTrainers = () => {
  const context = useContext(TrainerContext);
  if (!context) throw new Error("useTrainers must be used within a TrainerProvider");
  return context;
};

export const TrainerProvider = ({ children }: { children: ReactNode }) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const addTrainer = (newTrainer: Omit<Trainer, "id">) => {
    const trainer: Trainer = { ...newTrainer, id: Date.now().toString() };
    setTrainers(prev => [...prev, trainer]);
  };

  const updateTrainer = (id: string, updatedTrainer: Partial<Trainer>) => {
    setTrainers(prev => prev.map(t => t.id === id ? { ...t, ...updatedTrainer } : t));
  };

  const removeTrainer = (id: string) => {
    setTrainers(prev => prev.filter(t => t.id !== id));
  };

  return (
    <TrainerContext.Provider value={{ trainers, addTrainer, updateTrainer, removeTrainer }}>
      {children}
    </TrainerContext.Provider>
  );
};
