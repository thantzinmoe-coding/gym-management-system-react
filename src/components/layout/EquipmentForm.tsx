import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useEquipments, Equipment, EquipmentFormData } from "@/context/EquipmentContext";

interface EquipmentFormProps {
  equipment?: Equipment;
  onCancel: () => void;
}

export const EquipmentForm = ({ equipment, onCancel }: EquipmentFormProps) => {
  const { addEquipment, updateEquipment } = useEquipments();
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: equipment?.name || "",
    purchaseDate: equipment?.purchaseDate || "",
    equipmentCondition: equipment?.equipmentCondition || "Good",
    lastMaintenanceDate: equipment?.lastMaintenanceDate || "",
    nextMaintenanceDate: equipment?.nextMaintenanceDate || "",
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(equipment?.imageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      imageFile: selectedImage || undefined,
    };
    if (equipment) {
      updateEquipment(equipment.id, data);
    } else {
      addEquipment(data);
    }
  };

  const handleInputChange = (field: keyof EquipmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {equipment ? "Edit Equipment" : "Add Equipment"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Equipment Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter equipment name"
                required
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                required
              />
              
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={formData.equipmentCondition}
                onValueChange={(value) => handleInputChange("equipmentCondition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Last Maintenance Date */}
            <div className="space-y-2">
              <Label htmlFor="lastMaintenanceDate" >Last Maintenance Date</Label>
              <Input
                id="lastMaintenanceDate"
                type="date"
                value={formData.lastMaintenanceDate}
                onChange={(e) => handleInputChange("lastMaintenanceDate", e.target.value)}
                required
              />
            </div>

            {/* Next Maintenance Date */}
            <div className="space-y-2">
              <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
              <Input
                id="nextMaintenanceDate"
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => handleInputChange("nextMaintenanceDate", e.target.value)}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Equipment Image</Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBrowseClick}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {equipment ? "Update" : "Add"} Equipment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};