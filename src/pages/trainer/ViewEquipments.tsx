import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { useEquipments, Equipment } from "@/context/EquipmentContext"; // Import the context

export default function ViewEquipments() {
    const { equipments } = useEquipments(); // Access equipments from the context
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading delay (remove this in production)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer); // Cleanup the timer
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">View Equipments</h1>

            {loading ? (
                <Card className="p-12 text-center">
                    <div className="space-y-4">
                        <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                            <h3 className="text-lg font-medium">Loading equipment...</h3>
                        </div>
                    </div>
                </Card>
            ) : equipments.length === 0 ? (
                <Card className="p-12 text-center">
                    <h3 className="text-lg font-medium">No equipment available</h3>
                    <p className="text-muted-foreground">Ask admin to add some equipment.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {equipments.map((eq) => (
                        <Card key={eq.id}>
                            <CardHeader>
                                <CardTitle>{eq.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Condition: {eq.equipmentCondition}</p>
                                <p>Purchase: {eq.purchaseDate}</p>
                                <p>Next Maintenance: {eq.nextMaintenanceDate}</p>
                                {eq.imageUrl && (
                                    <img
                                        src={eq.imageUrl}
                                        alt={eq.name}
                                        className="mt-2 w-full h-40 object-cover rounded"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}