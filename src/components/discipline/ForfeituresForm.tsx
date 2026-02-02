import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ForfeituresFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function ForfeituresForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: ForfeituresFormProps) {
  const [formData, setFormData] = useState({
    forfeiture_difference: "",
    forfeiture_type: "",
    forfeiture_current_value: "",
    forfeiture_new_value: "",
    due_date: "",
    disciplinary_punishment_instituted: "",
  });

  const [punishments, setPunishments] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchPunishments();
  }, [data]);

  const fetchPunishments = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/disciplinary-management/api/punishments-instituted/');
      // const data = await response.json();
      // setPunishments(data.results);
      
      setPunishments([
        { id: "pun-1", punishment_name: "Solitary Confinement" },
        { id: "pun-2", punishment_name: "Loss of Privileges" },
      ]);
    } catch (error) {
      console.error("Error fetching punishments:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDifference = () => {
    const current = parseFloat(formData.forfeiture_current_value) || 0;
    const newValue = parseFloat(formData.forfeiture_new_value) || 0;
    const difference = (current - newValue).toFixed(2);
    setFormData((prev) => ({ ...prev, forfeiture_difference: difference }));
  };

  useEffect(() => {
    if (formData.forfeiture_current_value && formData.forfeiture_new_value) {
      calculateDifference();
    }
  }, [formData.forfeiture_current_value, formData.forfeiture_new_value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isViewMode) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Disciplinary Punishment */}
        <div className="space-y-2">
          <Label htmlFor="disciplinary_punishment_instituted">
            Punishment Instituted *
          </Label>
          <Select
            value={formData.disciplinary_punishment_instituted}
            onValueChange={(value) =>
              handleChange("disciplinary_punishment_instituted", value)
            }
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select punishment" />
            </SelectTrigger>
            <SelectContent>
              {punishments.map((punishment) => (
                <SelectItem key={punishment.id} value={punishment.id}>
                  {punishment.punishment_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Forfeiture Type */}
        <div className="space-y-2">
          <Label htmlFor="forfeiture_type">Forfeiture Type *</Label>
          <Select
            value={formData.forfeiture_type}
            onValueChange={(value) => handleChange("forfeiture_type", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select forfeiture type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Earnings Deduction">Earnings Deduction</SelectItem>
              <SelectItem value="Property Seizure">Property Seizure</SelectItem>
              <SelectItem value="Savings Forfeiture">Savings Forfeiture</SelectItem>
              <SelectItem value="Allowance Deduction">Allowance Deduction</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Value */}
        <div className="space-y-2">
          <Label htmlFor="forfeiture_current_value">Current Value *</Label>
          <Input
            id="forfeiture_current_value"
            type="number"
            step="0.01"
            value={formData.forfeiture_current_value}
            onChange={(e) =>
              handleChange("forfeiture_current_value", e.target.value)
            }
            disabled={isViewMode}
            placeholder="Enter current value"
          />
        </div>

        {/* New Value */}
        <div className="space-y-2">
          <Label htmlFor="forfeiture_new_value">New Value *</Label>
          <Input
            id="forfeiture_new_value"
            type="number"
            step="0.01"
            value={formData.forfeiture_new_value}
            onChange={(e) => handleChange("forfeiture_new_value", e.target.value)}
            disabled={isViewMode}
            placeholder="Enter new value after forfeiture"
          />
        </div>

        {/* Difference (auto-calculated) */}
        <div className="space-y-2">
          <Label htmlFor="forfeiture_difference">Forfeiture Amount</Label>
          <Input
            id="forfeiture_difference"
            type="number"
            step="0.01"
            value={formData.forfeiture_difference}
            disabled
            className="bg-gray-50"
            placeholder="Automatically calculated"
          />
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            type="datetime-local"
            value={formData.due_date ? formData.due_date.slice(0, 16) : ""}
            onChange={(e) => handleChange("due_date", e.target.value)}
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="mb-3">Forfeiture Summary</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">Current Value</div>
            <div className="text-xl">
              ${parseFloat(formData.forfeiture_current_value || "0").toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Forfeited Amount</div>
            <div className="text-xl text-red-600">
              -${parseFloat(formData.forfeiture_difference || "0").toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">New Value</div>
            <div className="text-xl">
              ${parseFloat(formData.forfeiture_new_value || "0").toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Forfeiture</Button>
        </div>
      )}

      {isViewMode && (
        <div className="flex justify-end">
          <Button type="button" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
}
