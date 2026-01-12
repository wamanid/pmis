import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import WitnessesForm from "./WitnessesForm";

interface Witness {
  id: string;
  witness_type_name: string;
  witness_name: string;
  external_witness: string;
  cross_examination: string;
  cross_examination_document: string;
  description: string;
  disciplinary_proceedings: string;
  witness_type: string;
  prisoner_witness: string;
  staff_witness: string;
}

export default function WitnessesList() {
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [filteredWitnesses, setFilteredWitnesses] = useState<Witness[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWitness, setSelectedWitness] = useState<Witness | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWitnesses();
  }, []);

  useEffect(() => {
    filterWitnesses();
  }, [searchTerm, witnesses]);

  const fetchWitnesses = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockData: Witness[] = [
        {
          id: "1",
          witness_type_name: "Staff",
          witness_name: "Officer Brown",
          external_witness: "",
          cross_examination: "Testified about prisoner behavior",
          cross_examination_document: "cross-exam-001.pdf",
          description: "Primary witness to the incident",
          disciplinary_proceedings: "proc-1",
          witness_type: "type-1",
          prisoner_witness: "",
          staff_witness: "staff-1",
        },
        {
          id: "2",
          witness_type_name: "Prisoner",
          witness_name: "Michael Johnson",
          external_witness: "",
          cross_examination: "Corroborated the account",
          cross_examination_document: "cross-exam-002.pdf",
          description: "Witnessed the altercation",
          disciplinary_proceedings: "proc-2",
          witness_type: "type-2",
          prisoner_witness: "prisoner-3",
          staff_witness: "",
        },
        {
          id: "3",
          witness_type_name: "External",
          witness_name: "Dr. Sarah Miller",
          external_witness: "Medical Professional",
          cross_examination: "Provided medical evidence",
          cross_examination_document: "cross-exam-003.pdf",
          description: "External medical witness",
          disciplinary_proceedings: "proc-1",
          witness_type: "type-3",
          prisoner_witness: "",
          staff_witness: "",
        },
      ];
      setWitnesses(mockData);
    } catch (error) {
      console.error("Error fetching witnesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterWitnesses = () => {
    if (!searchTerm) {
      setFilteredWitnesses(witnesses);
      return;
    }

    const filtered = witnesses.filter(
      (witness) =>
        witness.witness_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        witness.witness_type_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWitnesses(filtered);
  };

  const handleAdd = () => {
    setSelectedWitness(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (witness: Witness) => {
    setSelectedWitness(witness);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (witness: Witness) => {
    setSelectedWitness(witness);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this witness record?")) {
      try {
        setWitnesses(witnesses.filter((witness) => witness.id !== id));
      } catch (error) {
        console.error("Error deleting witness:", error);
      }
    }
  };

  const handleSave = async (data: Partial<Witness>) => {
    try {
      if (selectedWitness) {
        setWitnesses(
          witnesses.map((witness) =>
            witness.id === selectedWitness.id ? { ...witness, ...data } : witness
          )
        );
      } else {
        const newWitness = { id: Date.now().toString(), ...data } as Witness;
        setWitnesses([...witnesses, newWitness]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving witness:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Witnesses</h1>
        <p className="text-muted-foreground">
          Manage witness records for disciplinary proceedings
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by witness name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Witness
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Witnesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{witnesses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Staff Witnesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {witnesses.filter(w => w.witness_type_name === "Staff").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Prisoner Witnesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {witnesses.filter(w => w.witness_type_name === "Prisoner").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">External Witnesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {witnesses.filter(w => w.witness_type_name === "External").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-white font-bold">Witness Name</TableHead>
                  <TableHead className="text-white font-bold">Witness Type</TableHead>
                  <TableHead className="text-white font-bold">Description</TableHead>
                  <TableHead className="text-white font-bold">Cross Examination</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredWitnesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No witnesses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWitnesses.map((witness) => (
                    <TableRow key={witness.id}>
                      <TableCell>{witness.witness_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#06B6D4]">{witness.witness_type_name}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{witness.description}</TableCell>
                      <TableCell className="max-w-xs truncate">{witness.cross_examination}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(witness)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(witness)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(witness.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[1400px] max-h-[90vh] overflow-y-auto resize">
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? "View Witness Details"
                : selectedWitness
                ? "Edit Witness"
                : "Add New Witness"}
            </DialogTitle>
          </DialogHeader>
          <WitnessesForm
            data={selectedWitness}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isViewMode={isViewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
