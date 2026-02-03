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
import AppealsForm from "./AppealsForm";

interface Appeal {
  id: string;
  offence_details: string;
  appeal_date: string;
  appeal_details: string;
  appeal_outcome: string;
  disciplinary_offence: string;
}

export default function AppealsList() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, []);

  useEffect(() => {
    filterAppeals();
  }, [searchTerm, appeals]);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockData: Appeal[] = [
        {
          id: "1",
          offence_details: "Insubordination - Refused to follow orders",
          appeal_date: "2025-11-25T10:00:00Z",
          appeal_details: "Prisoner claims misunderstanding of orders",
          appeal_outcome: "Pending",
          disciplinary_offence: "off-1",
        },
        {
          id: "2",
          offence_details: "Fighting - Physical altercation in recreation yard",
          appeal_date: "2025-11-20T14:00:00Z",
          appeal_details: "Prisoner claims self-defense",
          appeal_outcome: "Denied",
          disciplinary_offence: "off-2",
        },
        {
          id: "3",
          offence_details: "Theft - Unauthorized possession of property",
          appeal_date: "2025-11-18T09:00:00Z",
          appeal_details: "Prisoner disputes ownership claim",
          appeal_outcome: "Approved - Punishment Reduced",
          disciplinary_offence: "off-3",
        },
      ];
      setAppeals(mockData);
    } catch (error) {
      console.error("Error fetching appeals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppeals = () => {
    if (!searchTerm) {
      setFilteredAppeals(appeals);
      return;
    }

    const filtered = appeals.filter(
      (appeal) =>
        appeal.offence_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appeal.appeal_outcome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAppeals(filtered);
  };

  const handleAdd = () => {
    setSelectedAppeal(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this appeal record?")) {
      try {
        setAppeals(appeals.filter((appeal) => appeal.id !== id));
      } catch (error) {
        console.error("Error deleting appeal:", error);
      }
    }
  };

  const handleSave = async (data: Partial<Appeal>) => {
    try {
      if (selectedAppeal) {
        setAppeals(
          appeals.map((appeal) =>
            appeal.id === selectedAppeal.id ? { ...appeal, ...data } : appeal
          )
        );
      } else {
        const newAppeal = { id: Date.now().toString(), ...data } as Appeal;
        setAppeals([...appeals, newAppeal]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving appeal:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOutcomeBadge = (outcome: string) => {
    if (outcome.includes("Approved") || outcome.includes("Reduced")) {
      return <Badge className="bg-[#34D399]">{outcome}</Badge>;
    } else if (outcome === "Pending") {
      return <Badge className="bg-[#EF4444]">{outcome}</Badge>;
    } else if (outcome === "Denied") {
      return <Badge variant="destructive">{outcome}</Badge>;
    } else {
      return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Appeals</h1>
        <p className="text-muted-foreground">
          Manage disciplinary decision appeals and review outcomes
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by offence details or outcome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Appeal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Appeals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{appeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {appeals.filter(a => a.appeal_outcome === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {appeals.filter(a => a.appeal_outcome.includes("Approved")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {appeals.filter(a => a.appeal_outcome === "Denied").length}
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
                  <TableHead className="text-white font-bold">Offence Details</TableHead>
                  <TableHead className="text-white font-bold">Appeal Date</TableHead>
                  <TableHead className="text-white font-bold">Appeal Details</TableHead>
                  <TableHead className="text-white font-bold">Outcome</TableHead>
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
                ) : filteredAppeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No appeals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppeals.map((appeal) => (
                    <TableRow key={appeal.id}>
                      <TableCell className="max-w-xs truncate">{appeal.offence_details}</TableCell>
                      <TableCell>{formatDate(appeal.appeal_date)}</TableCell>
                      <TableCell className="max-w-xs truncate">{appeal.appeal_details}</TableCell>
                      <TableCell>{getOutcomeBadge(appeal.appeal_outcome)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(appeal)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(appeal)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(appeal.id)}
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
                ? "View Appeal Details"
                : selectedAppeal
                ? "Edit Appeal"
                : "Add New Appeal"}
            </DialogTitle>
          </DialogHeader>
          <AppealsForm
            data={selectedAppeal}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isViewMode={isViewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
