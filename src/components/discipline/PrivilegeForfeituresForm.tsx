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

interface PrivilegeForfeituresFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function PrivilegeForfeituresForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: PrivilegeForfeituresFormProps) {
  const [formData, setFormData] = useState({
    privilege_name: "",
    duration: 0,
    punishment_instituted: "",
    privilege: "",
  });

  const [punishments, setPunishments] = useState<any[]>([]);
  const [privileges, setPrivileges] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchDropdownData();
  }, [data]);

  const fetchDropdownData = async () => {
    try {
      // TODO: Replace with actual API calls
      setPunishments([
        { id: "pun-1", punishment_name: "Solitary Confinement" },
        { id: "pun-2", punishment_name: "Loss of Privileges" },
      ]);
      
      setPrivileges([
        { id: "priv-1", name: "Recreation Time" },
        { id: "priv-2", name: "Visitation Rights" },
        { id: "priv-3", name: "Library Access" },
        { id: "priv-4", name: "Canteen Privileges" },
        { id: "priv-5", name: "Television Access" },
        { id: "priv-6", name: "Outdoor Activities" },
      ]);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrivilegeChange = (value: string) => {
    const privilege = privileges.find((p) => p.id === value);
    if (privilege) {
      setFormData((prev) => ({
        ...prev,
        privilege: value,
        privilege_name: privilege.name,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isViewMode) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Punishment Instituted */}
        <div className="space-y-2">
          <Label htmlFor="punishment_instituted">Punishment Instituted *</Label>
          <Select
            value={formData.punishment_instituted}
            onValueChange={(value) => handleChange("punishment_instituted", value)}
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

        {/* Privilege */}
        <div className="space-y-2">
          <Label htmlFor="privilege">Privilege *</Label>
          <Select
            value={formData.privilege}
            onValueChange={handlePrivilegeChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select privilege to forfeit" />
            </SelectTrigger>
            <SelectContent>
              {privileges.map((privilege) => (
                <SelectItem key={privilege.id} value={privilege.id}>
                  {privilege.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (days) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleChange("duration", parseInt(e.target.value) || 0)}
            disabled={isViewMode}
            placeholder="Enter duration in days"
            min="1"
          />
        </div>

        {/* Privilege Name (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="privilege_name">Privilege Name</Label>
          <Input
            id="privilege_name"
            value={formData.privilege_name}
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="mb-2 text-blue-900">Privilege Forfeiture Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Duration is measured in calendar days</li>
          <li>• The forfeiture period begins from the punishment start date</li>
          <li>• Multiple privileges can be forfeited for a single punishment</li>
          <li>• Duration must be greater than 0</li>
        </ul>
      </div>

      {/* Summary Card */}
      {formData.privilege_name && formData.duration > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="mb-3">Forfeiture Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Privilege:</span>
              <span>{formData.privilege_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="text-xl text-red-600">
                {formData.duration} {formData.duration === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Privilege Forfeiture</Button>
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
