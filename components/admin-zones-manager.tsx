"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Pencil, Trash2, MapPin } from "lucide-react";
import type { DeliveryZone } from "@/lib/types";

interface AdminZonesManagerProps {
  initialZones: DeliveryZone[];
}

export function AdminZonesManager({ initialZones }: AdminZonesManagerProps) {
  console.log(initialZones);
  const [zones, setZones] = useState<DeliveryZone[]>(initialZones);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    postal_codes: "",
    city: "",
    delivery_fee: "",
    min_order_amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const zoneData = {
      postal_codes: formData.postal_codes,
      city: formData.city,
      delivery_fee: parseFloat(formData.delivery_fee),
      min_order_amount: parseFloat(formData.min_order_amount),
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/zones/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(zoneData),
        });

        if (res.ok) {
          const updated = await res.json();
          setZones(zones.map((z) => (z.id === editingId ? updated : z)));
          setEditingId(null);
        }
      } else {
        const res = await fetch("/api/zones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(zoneData),
        });

        if (res.ok) {
          const newZone = await res.json();
          setZones([...zones, newZone]);
          setIsAdding(false);
        }
      }

      setFormData({
        postal_codes: "",
        city: "",
        delivery_fee: "",
        min_order_amount: "",
      });
    } catch (error) {
      console.error("Error saving zone:", error);
    }
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingId(zone.id);
    setFormData({
      postal_codes: zone.postal_codes,
      city: zone.city,
      delivery_fee: zone.delivery_fee.toString(),
      min_order_amount: zone.min_order_amount.toString(),
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery zone?")) return;

    try {
      const res = await fetch(`/api/zones/${id}`, { method: "DELETE" });
      if (res.ok) {
        setZones(zones.filter((z) => z.id !== id));
      }
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      postal_codes: "",
      city: "",
      delivery_fee: "",
      min_order_amount: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            Total zones:{" "}
            <span className="font-medium text-foreground">{zones.length}</span>
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Zone
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Zone" : "Add New Zone"}</CardTitle>
            <CardDescription>
              {editingId
                ? "Update delivery zone information"
                : "Create a new delivery zone"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_codes">Postal Code</Label>
                  <Input
                    id="postal_codes"
                    value={formData.postal_codes}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_codes: e.target.value })
                    }
                    placeholder="1201"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Geneva"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_fee">Delivery Fee (CHF)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    step="0.01"
                    value={formData.delivery_fee}
                    onChange={(e) =>
                      setFormData({ ...formData, delivery_fee: e.target.value })
                    }
                    placeholder="5.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_amount">
                    Min Order Amount (CHF)
                  </Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_order_amount: e.target.value,
                      })
                    }
                    placeholder="20.00"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update Zone" : "Create Zone"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {zone.canton}
                  </CardTitle>
                  <CardDescription>{zone.city}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(zone)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(zone.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee:</span>
                  <span className="font-medium">
                    CHF {zone.delivery_fee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min Order:</span>
                  <span className="font-medium">
                    CHF {zone.min_order_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {zones.length === 0 && !isAdding && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No delivery zones yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first delivery zone to start accepting orders
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add First Zone
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
