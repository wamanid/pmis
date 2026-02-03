import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ProceedingsFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function ProceedingsForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: ProceedingsFormProps) {
  const [formData, setFormData] = useState({
    plea_type_name: "",
    offence_name: "",
    adjudicating_officer_name: "",
    adjudicating_officer_force_number: "",
    adjudicating_officer_rank: "",
    hearing_date: "",
    wish_to_appeal: false,
    description: "",
    evidence: "",
    award: "",
    ruling: "",
    judgment: "",
    brief_facts: "",
    mitigation: "",
    document: "",
    punishment_book: "",
    plea_type: "",
    disciplinary_offence: "",
    adjudicating_officer: "",
  });

  const [punishmentBooks, setPunishmentBooks] = useState<any[]>([]);
  const [pleaTypes, setPleaTypes] = useState<any[]>([]);
  const [offences, setOffences] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchDropdownData();
  }, [data]);

  const fetchDropdownData = async () => {
    try {
      // TODO: Replace with actual API calls
      setPunishmentBooks([
        { id: "pb-1", prisoner_name: "John Doe" },
        { id: "pb-2", prisoner_name: "Jane Wilson" },
      ]);
      
      setPleaTypes([
        { id: "plea-1", name: "Guilty" },
        { id: "plea-2", name: "Not Guilty" },
        { id: "plea-3", name: "No Contest" },
      ]);
      
      setOffences([
        { id: "off-1", name: "Insubordination" },
        { id: "off-2", name: "Fighting" },
        { id: "off-3", name: "Theft" },
      ]);
      
      setOfficers([
        { id: "staff-1", name: "Captain Smith", force_number: "PF99999", rank: "Captain" },
        { id: "staff-2", name: "Lieutenant Jones", force_number: "PF88888", rank: "Lieutenant" },
      ]);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
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
        offence_name: offence.name,
      }));
    }
  };

  const handlePleaTypeChange = (value: string) => {
    const pleaType = pleaTypes.find((p) => p.id === value);
    if (pleaType) {
      setFormData((prev) => ({
        ...prev,
        plea_type: value,
        plea_type_name: pleaType.name,
      }));
    }
  };

  const handleOfficerChange = (value: string) => {
    const officer = officers.find((o) => o.id === value);
    if (officer) {
      setFormData((prev) => ({
        ...prev,
        adjudicating_officer: value,
        adjudicating_officer_name: officer.name,
        adjudicating_officer_force_number: officer.force_number,
        adjudicating_officer_rank: officer.rank,
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
        {/* Punishment Book */}
        <div className="space-y-2">
          <Label htmlFor="punishment_book">Punishment Book *</Label>
          <Select
            value={formData.punishment_book}
            onValueChange={(value) => handleChange("punishment_book", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select punishment book" />
            </SelectTrigger>
            <SelectContent>
              {punishmentBooks.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.prisoner_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        {/* Plea Type */}
        <div className="space-y-2">
          <Label htmlFor="plea_type">Plea Type *</Label>
          <Select
            value={formData.plea_type}
            onValueChange={handlePleaTypeChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select plea type" />
            </SelectTrigger>
            <SelectContent>
              {pleaTypes.map((pleaType) => (
                <SelectItem key={pleaType.id} value={pleaType.id}>
                  {pleaType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Adjudicating Officer */}
        <div className="space-y-2">
          <Label htmlFor="adjudicating_officer">Adjudicating Officer *</Label>
          <Select
            value={formData.adjudicating_officer}
            onValueChange={handleOfficerChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select officer" />
            </SelectTrigger>
            <SelectContent>
              {officers.map((officer) => (
                <SelectItem key={officer.id} value={officer.id}>
                  {officer.name} ({officer.force_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hearing Date */}
        <div className="space-y-2">
          <Label htmlFor="hearing_date">Hearing Date *</Label>
          <Input
            id="hearing_date"
            type="datetime-local"
            value={formData.hearing_date ? formData.hearing_date.slice(0, 16) : ""}
            onChange={(e) => handleChange("hearing_date", e.target.value)}
            disabled={isViewMode}
          />
        </div>

        {/* Document */}
        <div className="space-y-2">
          <Label htmlFor="document">Document Reference</Label>
          <Input
            id="document"
            value={formData.document}
            onChange={(e) => handleChange("document", e.target.value)}
            disabled={isViewMode}
            placeholder="Document filename or reference"
          />
        </div>
      </div>

      {/* Brief Facts */}
      <div className="space-y-2">
        <Label htmlFor="brief_facts">Brief Facts *</Label>
        <Textarea
          id="brief_facts"
          value={formData.brief_facts}
          onChange={(e) => handleChange("brief_facts", e.target.value)}
          disabled={isViewMode}
          rows={3}
          placeholder="Brief summary of facts..."
        />
      </div>

      {/* Evidence */}
      <div className="space-y-2">
        <Label htmlFor="evidence">Evidence</Label>
        <Textarea
          id="evidence"
          value={formData.evidence}
          onChange={(e) => handleChange("evidence", e.target.value)}
          disabled={isViewMode}
          rows={3}
          placeholder="Details of evidence presented..."
        />
      </div>

      {/* Mitigation */}
      <div className="space-y-2">
        <Label htmlFor="mitigation">Mitigation</Label>
        <Textarea
          id="mitigation"
          value={formData.mitigation}
          onChange={(e) => handleChange("mitigation", e.target.value)}
          disabled={isViewMode}
          rows={3}
          placeholder="Mitigating circumstances..."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Ruling */}
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="ruling">Ruling</Label>
          <Textarea
            id="ruling"
            value={formData.ruling}
            onChange={(e) => handleChange("ruling", e.target.value)}
            disabled={isViewMode}
            rows={2}
            placeholder="Ruling decision..."
          />
        </div>

        {/* Judgment */}
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="judgment">Judgment</Label>
          <Textarea
            id="judgment"
            value={formData.judgment}
            onChange={(e) => handleChange("judgment", e.target.value)}
            disabled={isViewMode}
            rows={2}
            placeholder="Judgment details..."
          />
        </div>

        {/* Award */}
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="award">Award</Label>
          <Textarea
            id="award"
            value={formData.award}
            onChange={(e) => handleChange("award", e.target.value)}
            disabled={isViewMode}
            rows={2}
            placeholder="Punishment awarded..."
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={isViewMode}
          rows={3}
          placeholder="Additional description or notes..."
        />
      </div>

      {/* Wish to Appeal */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="wish_to_appeal"
          checked={formData.wish_to_appeal}
          onCheckedChange={(checked) => handleChange("wish_to_appeal", checked)}
          disabled={isViewMode}
        />
        <Label htmlFor="wish_to_appeal" className="cursor-pointer">
          Prisoner wishes to appeal
        </Label>
      </div>

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Proceeding</Button>
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
