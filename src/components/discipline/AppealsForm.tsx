import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AppealsFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function AppealsForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: AppealsFormProps) {
  const [formData, setFormData] = useState({
    offence_details: "",
    appeal_date: "",
    appeal_details: "",
    appeal_outcome: "",
    disciplinary_offence: "",
  });

  const [offences, setOffences] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchOffences();
  }, [data]);

  const fetchOffences = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/disciplinary-management/api/offences/');
      // const data = await response.json();
      // setOffences(data.results);
      
      setOffences([
        { id: "off-1", name: "Insubordination", details: "Refusal to follow orders" },
        { id: "off-2", name: "Fighting", details: "Physical altercation" },
        { id: "off-3", name: "Theft", details: "Unauthorized possession" },
      ]);
    } catch (error) {
      console.error("Error fetching offences:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOffenceChange = (value: string) => {
    const offence = offences.find((o) => o.id === value);
    if (offence) {
      setFormData((prev) => ({
        ...prev,
        disciplinary_offence: value,
        offence_details: `${offence.name} - ${offence.details}`,
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
        {/* Disciplinary Offence */}
        <div className="space-y-2">
          <Label htmlFor="disciplinary_offence">Disciplinary Offence *</Label>
          <Select
            value={formData.disciplinary_offence}
            onValueChange={handleOffenceChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select offence" />
            </SelectTrigger>
            <SelectContent>
              {offences.map((offence) => (
                <SelectItem key={offence.id} value={offence.id}>
                  {offence.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Appeal Date */}
        <div className="space-y-2">
          <Label htmlFor="appeal_date">Appeal Date *</Label>
          <Input
            id="appeal_date"
            type="datetime-local"
            value={formData.appeal_date ? formData.appeal_date.slice(0, 16) : ""}
            onChange={(e) => handleChange("appeal_date", e.target.value)}
            disabled={isViewMode}
          />
        </div>

        {/* Appeal Outcome */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="appeal_outcome">Appeal Outcome</Label>
          <Select
            value={formData.appeal_outcome}
            onValueChange={(value) => handleChange("appeal_outcome", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Approved - Punishment Reduced">Approved - Punishment Reduced</SelectItem>
              <SelectItem value="Approved - Punishment Overturned">Approved - Punishment Overturned</SelectItem>
              <SelectItem value="Denied">Denied</SelectItem>
              <SelectItem value="Partially Approved">Partially Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Offence Details */}
      <div className="space-y-2">
        <Label htmlFor="offence_details">Offence Details *</Label>
        <Textarea
          id="offence_details"
          value={formData.offence_details}
          onChange={(e) => handleChange("offence_details", e.target.value)}
          disabled={isViewMode}
          rows={3}
          placeholder="Detailed description of the offence..."
        />
      </div>

      {/* Appeal Details */}
      <div className="space-y-2">
        <Label htmlFor="appeal_details">Appeal Details *</Label>
        <Textarea
          id="appeal_details"
          value={formData.appeal_details}
          onChange={(e) => handleChange("appeal_details", e.target.value)}
          disabled={isViewMode}
          rows={5}
          placeholder="Grounds for appeal, arguments, and supporting information..."
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="mb-2 text-blue-900">Appeal Process Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Appeals must be filed within the specified timeframe after the disciplinary decision</li>
          <li>• All appeal details and supporting evidence should be thoroughly documented</li>
          <li>• Appeal outcomes are reviewed by a higher authority</li>
          <li>• Prisoners have the right to present their case during the appeal hearing</li>
        </ul>
      </div>

      {/* Summary Card */}
      {formData.appeal_outcome && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="mb-3">Appeal Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`px-3 py-1 rounded ${
                formData.appeal_outcome.includes("Approved") 
                  ? "bg-green-100 text-green-800" 
                  : formData.appeal_outcome === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {formData.appeal_outcome}
              </span>
            </div>
            {formData.appeal_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filed On:</span>
                <span>
                  {new Date(formData.appeal_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Appeal</Button>
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
