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
import { Search, Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import ProceedingsForm from "./ProceedingsForm";

interface Proceeding {
  id: string;
  plea_type_name: string;
  offence_name: string;
  adjudicating_officer_name: string;
  adjudicating_officer_force_number: string;
  adjudicating_officer_rank: string;
  hearing_date: string;
  wish_to_appeal: boolean;
  description: string;
  evidence: string;
  award: string;
  ruling: string;
  judgment: string;
  brief_facts: string;
  mitigation: string;
  document: string;
  punishment_book: string;
  plea_type: string;
  disciplinary_offence: string;
  adjudicating_officer: string;
}

export default function ProceedingsList() {
  const [proceedings, setProceedings] = useState<Proceeding[]>([]);
  const [filteredProceedings, setFilteredProceedings] = useState<Proceeding[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProceeding, setSelectedProceeding] = useState<Proceeding | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProceedings();
  }, []);

  useEffect(() => {
    filterProceedings();
  }, [searchTerm, proceedings]);

  const fetchProceedings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/disciplinary-management/api/proceedings/');
      // const data = await response.json();
      // setProceedings(data.results);
      
      // Mock data
      const mockData: Proceeding[] = [
        {
          id: "1",
          plea_type_name: "Guilty",
          offence_name: "Insubordination",
          adjudicating_officer_name: "Captain Smith",
          adjudicating_officer_force_number: "PF99999",
          adjudicating_officer_rank: "Captain",
          hearing_date: "2025-11-22T10:00:00Z",
          wish_to_appeal: false,
          description: "Formal disciplinary hearing conducted",
          evidence: "Witness statements and CCTV footage",
          award: "7 days solitary confinement",
          ruling: "Guilty as charged",
          judgment: "Standard punishment applied",
          brief_facts: "Prisoner refused direct order from officer",
          mitigation: "First offense, good prior behavior",
          document: "doc-001.pdf",
          punishment_book: "pb-1",
          plea_type: "plea-1",
          disciplinary_offence: "off-1",
          adjudicating_officer: "staff-1",
        },
        {
          id: "2",
          plea_type_name: "Not Guilty",
          offence_name: "Fighting",
          adjudicating_officer_name: "Lieutenant Jones",
          adjudicating_officer_force_number: "PF88888",
          adjudicating_officer_rank: "Lieutenant",
          hearing_date: "2025-11-23T14:00:00Z",
          wish_to_appeal: true,
          description: "Contested disciplinary hearing",
          evidence: "Multiple witness testimonies",
          award: "14 days loss of privileges",
          ruling: "Guilty after review of evidence",
          judgment: "Enhanced punishment due to severity",
          brief_facts: "Physical altercation in recreation yard",
          mitigation: "Claimed self-defense",
          document: "doc-002.pdf",
          punishment_book: "pb-2",
          plea_type: "plea-2",
          disciplinary_offence: "off-2",
          adjudicating_officer: "staff-2",
        },
      ];
      setProceedings(mockData);
    } catch (error) {
      console.error("Error fetching proceedings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProceedings = () => {
    if (!searchTerm) {
      setFilteredProceedings(proceedings);
      return;
    }

    const filtered = proceedings.filter(
      (proceeding) =>
        proceeding.offence_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proceeding.adjudicating_officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proceeding.plea_type_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProceedings(filtered);
  };

  const handleAdd = () => {
    setSelectedProceeding(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (proceeding: Proceeding) => {
    setSelectedProceeding(proceeding);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (proceeding: Proceeding) => {
    setSelectedProceeding(proceeding);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this proceeding record?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/disciplinary-management/api/proceedings/${id}/`, {
        //   method: 'DELETE',
        // });
        setProceedings(proceedings.filter((proceeding) => proceeding.id !== id));
      } catch (error) {
        console.error("Error deleting proceeding:", error);
      }
    }
  };

  const handleSave = async (data: Partial<Proceeding>) => {
    try {
      if (selectedProceeding) {
        // Update existing
        // TODO: Replace with actual API call
        setProceedings(
          proceedings.map((proceeding) =>
            proceeding.id === selectedProceeding.id ? { ...proceeding, ...data } : proceeding
          )
        );
      } else {
        // Create new
        // TODO: Replace with actual API call
        const newProceeding = { id: Date.now().toString(), ...data } as Proceeding;
        setProceedings([...proceedings, newProceeding]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving proceeding:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Disciplinary Proceedings</h1>
        <p className="text-muted-foreground">
          Manage formal disciplinary hearing proceedings and adjudications
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by offence, officer name, or plea type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Proceeding
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Proceedings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{proceedings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Appeals Requested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {proceedings.filter(p => p.wish_to_appeal).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {proceedings.filter(p => new Date(p.hearing_date).getMonth() === new Date().getMonth()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredProceedings.length}</div>
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
                  <TableHead className="text-white font-bold">Offence</TableHead>
                  <TableHead className="text-white font-bold">Hearing Date</TableHead>
                  <TableHead className="text-white font-bold">Adjudicating Officer</TableHead>
                  <TableHead className="text-white font-bold">Plea</TableHead>
                  <TableHead className="text-white font-bold">Ruling</TableHead>
                  <TableHead className="text-white font-bold">Appeal</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredProceedings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No proceedings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProceedings.map((proceeding) => (
                    <TableRow key={proceeding.id}>
                      <TableCell>
                        <Badge variant="destructive">{proceeding.offence_name}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(proceeding.hearing_date)}</TableCell>
                      <TableCell>
                        <div>
                          <div>{proceeding.adjudicating_officer_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {proceeding.adjudicating_officer_force_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={proceeding.plea_type_name === "Guilty" ? "default" : "secondary"}>
                          {proceeding.plea_type_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{proceeding.ruling}</TableCell>
                      <TableCell>
                        {proceeding.wish_to_appeal ? (
                          <Badge className="bg-[#EF4444]">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(proceeding)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(proceeding)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(proceeding.id)}
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
                ? "View Proceeding Details"
                : selectedProceeding
                ? "Edit Proceeding"
                : "Add New Proceeding"}
            </DialogTitle>
          </DialogHeader>
          <ProceedingsForm
            data={selectedProceeding}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isViewMode={isViewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
