import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useEquipments, Equipment, EquipmentFormData } from "@/context/EquipmentContext";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Cookies from "js-cookie";

interface EquipmentFormProps {
  equipment?: Equipment;
  onCancel: () => void;
}

export const EquipmentForm = ({ equipment, onCancel }: EquipmentFormProps) => {
  const { addEquipment, updateEquipment } = useEquipments();
  const [formData, setFormData] = useState({
    name: equipment.name,
    purchaseDate: equipment.purchaseDate,
    equipmentCondition: equipment.equipmentCondition,
    lastMaintenanceDate: equipment.lastMaintenanceDate,
    nextMaintenanceDate: equipment.nextMaintenanceDate,
    imageFile: undefined as File | undefined,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(equipment.imageUrl || null);

  useEffect(() => {
    const loadImage = async () => {
      if (equipment?.imageUrl) {
        try {
          const token = Cookies.get("token");
          const response = await fetch(equipment.imageUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const blob = await response.blob();
            setPreviewUrl(URL.createObjectURL(blob));
          }
        } catch (err) {
          console.error("Failed to load equipment image:", err);
        }
      }
    };

    loadImage();
  }, [equipment?.imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      setPreviewUrl(URL.createObjectURL(file)); // show preview immediately
    }
  };


  const navigate = useNavigate(); // Initialize useNavigate

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
      // imageFile is already inside formData
    };

    if (equipment) {
      updateEquipment(equipment.id, data);
    } else {
      addEquipment(data);
    }

    onCancel();
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
                  className="hidden"
                  onChange={handleFileChange}
                />

                {imagePreview && (
                  <div className="mb-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Equipment Preview"
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                        <span>No Image</span>
                      </div>
                    )}

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