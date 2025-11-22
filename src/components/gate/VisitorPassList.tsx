import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface VisitorPass {
  id: string;
  prisoner_name: string;
  visitor_name: string;
  suspended_by_username: string;
  visitor_tag_number: string;
  valid_from: string;
  valid_until: string;
  purpose: string;
  issue_date: string;
  is_suspended: boolean;
  suspended_date: string;
  suspended_reason: string;
  is_valid: boolean;
  prisoner: string;
  visitor: string;
  suspended_by: number;
}

interface VisitorPassListProps {
  onEdit: (pass: VisitorPass) => void;
  onView: (pass: VisitorPass) => void;
}

export default function VisitorPassList({ onEdit, onView }: VisitorPassListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data
  const [visitorPasses, setVisitorPasses] = useState<VisitorPass[]>([
    {
      id: '1',
      prisoner_name: 'John Doe',
      visitor_name: 'Jane Smith',
      suspended_by_username: '',
      visitor_tag_number: 'VT-2024-001',
      valid_from: '2024-01-01T08:00:00Z',
      valid_until: '2024-12-31T17:00:00Z',
      purpose: 'Family visit',
      issue_date: '2024-01-01T08:00:00Z',
      is_suspended: false,
      suspended_date: '',
      suspended_reason: '',
      is_valid: true,
      prisoner: 'prisoner-uuid-1',
      visitor: 'visitor-uuid-1',
      suspended_by: 0
    },
    {
      id: '2',
      prisoner_name: 'Michael Brown',
      visitor_name: 'Sarah Johnson',
      suspended_by_username: 'admin_user',
      visitor_tag_number: 'VT-2024-002',
      valid_from: '2024-02-15T08:00:00Z',
      valid_until: '2024-08-15T17:00:00Z',
      purpose: 'Legal consultation',
      issue_date: '2024-02-15T08:00:00Z',
      is_suspended: true,
      suspended_date: '2024-06-01T10:00:00Z',
      suspended_reason: 'Security concerns',
      is_valid: false,
      prisoner: 'prisoner-uuid-2',
      visitor: 'visitor-uuid-2',
      suspended_by: 101
    },
    {
      id: '3',
      prisoner_name: 'Robert Wilson',
      visitor_name: 'Emily Davis',
      suspended_by_username: '',
      visitor_tag_number: 'VT-2024-003',
      valid_from: '2024-03-10T08:00:00Z',
      valid_until: '2024-09-10T17:00:00Z',
      purpose: 'Religious counseling',
      issue_date: '2024-03-10T08:00:00Z',
      is_suspended: false,
      suspended_date: '',
      suspended_reason: '',
      is_valid: true,
      prisoner: 'prisoner-uuid-3',
      visitor: 'visitor-uuid-3',
      suspended_by: 0
    }
  ]);

  // Filter data
  const filteredData = visitorPasses.filter(pass => 
    pass.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pass.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pass.visitor_tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pass.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this visitor pass?')) {
      setVisitorPasses(visitorPasses.filter(pass => pass.id !== id));
      toast.success('Visitor pass deleted successfully');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (pass: VisitorPass) => {
    if (pass.is_suspended) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Suspended
        </Badge>
      );
    }
    
    const now = new Date();
    const validFrom = new Date(pass.valid_from);
    const validUntil = new Date(pass.valid_until);
    
    if (now < validFrom) {
      return (
        <Badge variant="outline" className="gap-1">
          <ShieldAlert className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    
    if (now > validUntil) {
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    
    return (
      <Badge className="gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Visitor Passes</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner, visitor, tag..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 w-80"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag Number</TableHead>
                <TableHead>Prisoner</TableHead>
                <TableHead>Visitor</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No visitor passes found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((pass) => (
                  <TableRow key={pass.id}>
                    <TableCell>{pass.visitor_tag_number}</TableCell>
                    <TableCell>{pass.prisoner_name}</TableCell>
                    <TableCell>{pass.visitor_name}</TableCell>
                    <TableCell>{formatDate(pass.valid_from)}</TableCell>
                    <TableCell>{formatDate(pass.valid_until)}</TableCell>
                    <TableCell className="max-w-xs truncate">{pass.purpose}</TableCell>
                    <TableCell>{getStatusBadge(pass)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(pass)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(pass)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(pass.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    style={currentPage === page ? { backgroundColor: '#650000' } : {}}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
