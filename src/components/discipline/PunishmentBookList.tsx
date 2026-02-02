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
import PunishmentBookForm from "./PunishmentBookForm";

interface PunishmentBook {
  id: string;
  prisoner_name: string;
  staff_name: string;
  staff_force_number: string;
  staff_rank: string;
  medic_directions: string;
  prisoner: string;
  staff_authority: string;
}

export default function PunishmentBookList() {
  const [punishmentBooks, setPunishmentBooks] = useState<PunishmentBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<PunishmentBook[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<PunishmentBook | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPunishmentBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, punishmentBooks]);

  const fetchPunishmentBooks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/disciplinary-management/api/punishment-books/');
      // const data = await response.json();
      // setPunishmentBooks(data.results);
      
      // Mock data
      const mockData: PunishmentBook[] = [
        {
          id: "1",
          prisoner_name: "John Doe",
          staff_name: "Officer Smith",
          staff_force_number: "PF12345",
          staff_rank: "Sergeant",
          medic_directions: "No special medical requirements",
          prisoner: "prisoner-1",
          staff_authority: "staff-1",
        },
        {
          id: "2",
          prisoner_name: "Jane Wilson",
          staff_name: "Officer Johnson",
          staff_force_number: "PF67890",
          staff_rank: "Lieutenant",
          medic_directions: "Monitor blood pressure daily",
          prisoner: "prisoner-2",
          staff_authority: "staff-2",
        },
      ];
      setPunishmentBooks(mockData);
    } catch (error) {
      console.error("Error fetching punishment books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    if (!searchTerm) {
      setFilteredBooks(punishmentBooks);
      return;
    }

    const filtered = punishmentBooks.filter(
      (book) =>
        book.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.staff_force_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleAdd = () => {
    setSelectedBook(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (book: PunishmentBook) => {
    setSelectedBook(book);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (book: PunishmentBook) => {
    setSelectedBook(book);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this punishment book?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/disciplinary-management/api/punishment-books/${id}/`, {
        //   method: 'DELETE',
        // });
        setPunishmentBooks(punishmentBooks.filter((book) => book.id !== id));
      } catch (error) {
        console.error("Error deleting punishment book:", error);
      }
    }
  };

  const handleSave = async (data: Partial<PunishmentBook>) => {
    try {
      if (selectedBook) {
        // Update existing
        // TODO: Replace with actual API call
        // await fetch(`/api/disciplinary-management/api/punishment-books/${selectedBook.id}/`, {
        //   method: 'PUT',
        //   body: JSON.stringify(data),
        // });
        setPunishmentBooks(
          punishmentBooks.map((book) =>
            book.id === selectedBook.id ? { ...book, ...data } : book
          )
        );
      } else {
        // Create new
        // TODO: Replace with actual API call
        // const response = await fetch('/api/disciplinary-management/api/punishment-books/', {
        //   method: 'POST',
        //   body: JSON.stringify(data),
        // });
        const newBook = { id: Date.now().toString(), ...data } as PunishmentBook;
        setPunishmentBooks([...punishmentBooks, newBook]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving punishment book:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Punishment Books</h1>
        <p className="text-muted-foreground">
          Manage punishment book records and track disciplinary actions
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by prisoner name, staff name, or force number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Punishment Book
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{punishmentBooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredBooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{punishmentBooks.length}</div>
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
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Staff Name</TableHead>
                  <TableHead className="text-white font-bold">Force Number</TableHead>
                  <TableHead className="text-white font-bold">Rank</TableHead>
                  <TableHead className="text-white font-bold">Medic Directions</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No punishment books found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>{book.prisoner_name}</TableCell>
                      <TableCell>{book.staff_name}</TableCell>
                      <TableCell>{book.staff_force_number}</TableCell>
                      <TableCell>{book.staff_rank}</TableCell>
                      <TableCell className="max-w-xs truncate">{book.medic_directions}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(book)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(book)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(book.id)}
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
                ? "View Punishment Book"
                : selectedBook
                ? "Edit Punishment Book"
                : "Add Punishment Book"}
            </DialogTitle>
          </DialogHeader>
          <PunishmentBookForm
            data={selectedBook}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isViewMode={isViewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
