import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Calendar, Wrench } from "lucide-react";
import { useEquipments, Equipment } from "@/context/EquipmentContext";
import { parseISO, format } from 'date-fns'; // Import date-fns
import Cookies from "js-cookie";

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void; // ADDED: onEdit prop
}


export const EquipmentCard = ({ equipment, onEdit }: EquipmentCardProps) => { // ADDED: onEdit to props
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { deleteEquipment, updateEquipment } = useEquipments();

  const getConditionVariant = (condition: string) => {
    switch (condition?.toLowerCase()) {
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

  useEffect(() => {
    const loadImage = async () => {
      if (equipment.imageUrl) {
        try {
          const token = Cookies.get("token");
          console.log(token)
          const response = await fetch(equipment.imageUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const blob = await response.blob();
            setImageUrl(URL.createObjectURL(blob));
          } else {
            setImageError(true);
          }
        } catch (err) {
          console.error("Failed to load equipment image:", err);
          setImageError(true);
        }
      }
    };

    loadImage();
  }, [equipment.imageUrl]);

  const handleDelete = (id: string) => {
    deleteEquipment(id);
  };

  const handleEdit = (equipment: Equipment) => {
    console.log("Edit equipment:", equipment.id);
    onEdit(equipment); // Called the onEdit function
  };

  return (
    <Card className="h-full w-full max-w-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {equipment.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(equipment)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(equipment.id)}
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
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
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
            <Badge variant={getConditionVariant(equipment.equipmentCondition)}>
              {equipment.equipmentCondition}
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className="text-muted-foreground">Purchased:</span>
              <span>{format(parseISO(equipment.purchaseDate), 'MM/dd/yyyy')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Wrench className="h-3 w-3" />
              <span className="text-muted-foreground">Last Maintenance:</span>
              <span>{format(parseISO(equipment.lastMaintenanceDate), 'MM/dd/yyyy')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className="text-muted-foreground">Next Maintenance:</span>
              <span className="font-medium">
                {format(parseISO(equipment.nextMaintenanceDate), 'MM/dd/yyyy')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};