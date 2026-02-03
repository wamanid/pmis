import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent } from '../ui/card';
import { Search, Plus, Edit, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CourtDocumentForm from './CourtDocumentForm';
import { getCourtattendance, getcourtdocuments } from '../../services/courtService';

interface CourtDocumentRecord {
  id: string;
  court_attendance_details: string;
  description: string;
  document: string;
  court_attendance: string;
}



let mockCourtAttendanceRecords:any = [];

export default function CourtDocumentList() {
  const [documents, setDocuments] = useState<CourtDocumentRecord[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<CourtDocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CourtDocumentRecord | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourtAttendance, setFilterCourtAttendance] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, filterCourtAttendance]);

  const fetchDocuments = async () => {
    setLoading(true);


    try {
     
    //load attendance records
      getCourtattendance().then((data) => {
       // alert(JSON.stringify(data));
          mockCourtAttendanceRecords = data.results;
        }).catch((error) => {
          alert(error);
        });

        getcourtdocuments().then((data) => {
       // alert(JSON.stringify(data));
          setDocuments(data.results);
        }).catch((error) => {
          alert(error);
        });
    } catch (error) {
      toast.error('Failed to fetch court documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.court_attendance_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply court attendance filter
    if (filterCourtAttendance) {
      filtered = filtered.filter(doc => doc.court_attendance === filterCourtAttendance);
    }

    setFilteredDocuments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCourtAttendance('');
  };

  const handleEdit = (document: CourtDocumentRecord) => {
    setEditingDocument(document);
    setShowForm(true);
  };

  const handleViewDocument = (document: CourtDocumentRecord) => {
    toast.info(`Opening document: ${document.document}`);
    // In real app, this would open the PDF in a new window/tab
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDocument(null);
  };

  const handleFormSuccess = () => {
    fetchDocuments();
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl" style={{ color: '#650000' }}>Court Attendance Documents</h2>
          <p className="text-gray-600 mt-1">Manage court attendance documents and files</p>
        </div>
        <Button
          onClick={() => {
            setEditingDocument(null);
            setShowForm(true);
          }}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by description or document name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Court Attendance Filter */}
            <div className="space-y-2">
              <Label htmlFor="court_attendance_filter">Court Attendance Record</Label>
              <Select
                value={filterCourtAttendance}
                onValueChange={setFilterCourtAttendance}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All records" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  {mockCourtAttendanceRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                    {record.court_name}-{record.criminal_case_number}-{record.prisoner_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white">Court Attendance Details</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">Document</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : currentDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentDocuments.map((document) => (
                    <TableRow key={document.id} className="hover:bg-gray-50">
                      <TableCell>{document.court_attendance_details}</TableCell>
                      <TableCell>
                        <div className="max-w-md truncate" title={document.description}>
                          {document.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-600" />

                          <span className="text-sm">
                            <a href='{document.document}' target="_blank" rel="noopener noreferrer">
                           download</a>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(document)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filteredDocuments.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDocuments.length)} of {filteredDocuments.length} documents
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CourtDocumentForm
        open={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editData={editingDocument}
      />
    </div>
  );
}
