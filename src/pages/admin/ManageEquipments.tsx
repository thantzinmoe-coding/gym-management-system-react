import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings } from "lucide-react";
import { EquipmentCard } from "@/components/layout/EquipmentCard";
import { EquipmentForm } from "@/components/layout/EquipmentForm";
import { toast } from "sonner";
import { useEquipments, Equipment, EquipmentFormData } from "@/context/EquipmentContext";

export default function ManageEquipments() {
  const { equipments, addEquipment, updateEquipment, deleteEquipment } = useEquipments();
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>();

  const handleAddEquipment = () => {
    setEditingEquipment(undefined);
    setShowForm(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowForm(true);
  };

  const handleDeleteEquipment = (id: string) => {
    deleteEquipment(id);
    toast.success("Equipment deleted successfully");
  };

  const handleFormSubmit = (data: EquipmentFormData) => {
    if (editingEquipment) {
      updateEquipment(editingEquipment.id, data);
      toast.success("Equipment updated successfully");
    } else {
      addEquipment(data);
      toast.success("Equipment added successfully");
    }
    setShowForm(false);
    setEditingEquipment(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEquipment(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-black" />
              <div>
                <h1 className="text-3xl font-bold text-black">Manage Equipment</h1>
                <p className="text-muted-foreground">
                  Add, edit, and manage gym equipment
                </p>
              </div>
            </div>
            <Button onClick={handleAddEquipment} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipments.filter(
                  (eq) =>
                    new Date(eq.nextMaintenanceDate) <=
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Poor Condition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipments.filter((eq) => eq.equipmentCondition === "Poor").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Equipment</h2>
            <div className="text-sm text-muted-foreground">{equipments.length} items</div>
          </div>

          {equipments.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No equipment found</h3>
                  <p className="text-muted-foreground">
                    Get started by adding your first piece of equipment.
                  </p>
                </div>
                <Button onClick={handleAddEquipment} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Equipment
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {equipments.map((equipment) => (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  onEdit={handleEditEquipment} // Passed the handleEditEquipment function
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <EquipmentForm
          equipment={editingEquipment}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}