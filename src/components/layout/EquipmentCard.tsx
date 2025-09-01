import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Calendar, Wrench } from "lucide-react";

export interface Equipment {
  id: string;
  name: string;
  purchaseDate: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  imageUrl?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onDelete: (id: string) => void;
  onEdit: (equipment: Equipment) => void;
}

export const EquipmentCard = ({ equipment, onDelete, onEdit }: EquipmentCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getConditionVariant = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      case "fair":
        return "outline";
      case "poor":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="h-48 w-full max-w-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {equipment.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(equipment)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(equipment.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Equipment Image */}
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
          {equipment.imageUrl && !imageError ? (
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Wrench className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Equipment Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Condition:</span>
            <Badge variant={getConditionVariant(equipment.condition)}>
              {equipment.condition}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className="text-muted-foreground">Purchased:</span>
              <span>{new Date(equipment.purchaseDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Wrench className="h-3 w-3" />
              <span className="text-muted-foreground">Last Maintenance:</span>
              <span>{new Date(equipment.lastMaintenanceDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className="text-muted-foreground">Next Maintenance:</span>
              <span className="font-medium">
                {new Date(equipment.nextMaintenanceDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};