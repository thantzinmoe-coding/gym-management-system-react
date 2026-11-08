import { trainerService } from "@/services/trainerService";
import { AvatarFallbackProps } from "@radix-ui/react-avatar";
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
  avatarUrl?: string;
  status?: string;
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
  /** True until the first trainer fetch finishes (and while a later one runs). */
  loading: boolean;
  addTrainer: (trainer: Omit<Trainer, "id">) => void;
  updateTrainer: (id: string, trainer: Partial<Trainer>) => void;
  removeTrainer: (id: string) => void;
  getAvailableTrainers: () => Promise<void>;
  getAllTrainers: () => Promise<void>;
  getActiveTrainers: () => Promise<void>;
}

const TrainerContext = createContext<TrainerContextType | undefined>(undefined);

export const useTrainers = () => {
  const context = useContext(TrainerContext);
  if (!context) throw new Error("useTrainers must be used within a TrainerProvider");
  return context;
};

export const TrainerProvider = ({ children }: { children: ReactNode }) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  // Runs one of the three list fetches, tracking `loading`. Errors still reach the caller.
  const load = async (fetchList: () => Promise<{ data: Trainer[] }>) => {
    setLoading(true);
    try {
      const result = await fetchList();
      setTrainers(result.data);
    } finally {
      setLoading(false);
    }
  };


  const getAvailableTrainers = () => load(() => trainerService.getAllAvailableTrainers());

  const getActiveTrainers = () => load(() => trainerService.getAllActiveTrainers());

  const getAllTrainers = () => load(() => trainerService.getAllTrainers());

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
    <TrainerContext.Provider value={{ trainers, loading, addTrainer, updateTrainer, removeTrainer, getAvailableTrainers, getAllTrainers, getActiveTrainers }}>
      {children}
    </TrainerContext.Provider>
  );
};
