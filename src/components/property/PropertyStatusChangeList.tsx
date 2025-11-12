import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner@2.0.3';
import { 
  ChevronLeft, 
  ChevronRight,
  Package,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface StatusChange {
  id: string;
  property_item_name: string;
  prisoner_name: string;
  prisoner_number: string;
  property_status_name: string;
  previous_status_name: string;
  property_bag_number: string;
  date_of_status_change: string;
  reason_for_status_change: string;
  destination: string;
  property: string;
  property_status: string;
}

interface PropertyStatusChangeListProps {
  className?: string;
}

const PropertyStatusChangeList: React.FC<PropertyStatusChangeListProps> = ({ className }) => {
  const [statusChanges, setStatusChanges] = useState<StatusChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Mock data - Replace with actual API calls
  const mockStatusChanges: StatusChange[] = [
    {
      id: '1',
      property_item_name: 'Mobile Phone',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR001',
      property_status_name: 'Released',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG001',
      date_of_status_change: '2025-10-28',
      reason_for_status_change: 'Prisoner released on bail',
      destination: 'Next of Kin',
      property: '1',
      property_status: '2'
    },
    {
      id: '2',
      property_item_name: 'Wallet',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR002',
      property_status_name: 'Confiscated',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG002',
      date_of_status_change: '2025-10-29',
      reason_for_status_change: 'Found to contain prohibited items',
      destination: 'Evidence Room',
      property: '2',
      property_status: '3'
    },
    {
      id: '3',
      property_item_name: 'Watch',
      prisoner_name: 'Mike Johnson',
      prisoner_number: 'PR003',
      property_status_name: 'Transferred',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG003',
      date_of_status_change: '2025-10-30',
      reason_for_status_change: 'Prisoner transferred to another facility',
      destination: 'Central Prison',
      property: '3',
      property_status: '6'
    },
    {
      id: '4',
      property_item_name: 'Laptop',
      prisoner_name: 'Sarah Williams',
      prisoner_number: 'PR004',
      property_status_name: 'In Storage',
      previous_status_name: 'Received',
      property_bag_number: 'BAG004',
      date_of_status_change: '2025-10-31',
      reason_for_status_change: 'Initial storage upon admission',
      destination: 'Storage Facility A',
      property: '4',
      property_status: '1'
    },
    {
      id: '5',
      property_item_name: 'Jewelry',
      prisoner_name: 'David Brown',
      prisoner_number: 'PR005',
      property_status_name: 'Released',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG005',
      date_of_status_change: '2025-11-01',
      reason_for_status_change: 'Case dismissed, prisoner discharged',
      destination: 'Prisoner',
      property: '5',
      property_status: '2'
    },
    {
      id: '6',
      property_item_name: 'Cash',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR006',
      property_status_name: 'In Storage',
      previous_status_name: 'Received',
      property_bag_number: 'BAG006',
      date_of_status_change: '2025-10-27',
      reason_for_status_change: 'Deposited upon admission',
      destination: 'Safe Vault',
      property: '6',
      property_status: '1'
    },
    {
      id: '7',
      property_item_name: 'Car Keys',
      prisoner_name: 'Robert Taylor',
      prisoner_number: 'PR007',
      property_status_name: 'Released',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG007',
      date_of_status_change: '2025-10-26',
      reason_for_status_change: 'Released to family member',
      destination: 'Family',
      property: '7',
      property_status: '2'
    },
    {
      id: '8',
      property_item_name: 'Glasses',
      prisoner_name: 'Lisa Anderson',
      prisoner_number: 'PR008',
      property_status_name: 'Destroyed',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG008',
      date_of_status_change: '2025-10-25',
      reason_for_status_change: 'Damaged beyond repair',
      destination: 'N/A',
      property: '8',
      property_status: '4'
    },
    {
      id: '9',
      property_item_name: 'ID Card',
      prisoner_name: 'James Wilson',
      prisoner_number: 'PR009',
      property_status_name: 'Transferred',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG009',
      date_of_status_change: '2025-10-24',
      reason_for_status_change: 'Prisoner moved to different block',
      destination: 'Block B Storage',
      property: '9',
      property_status: '6'
    },
    {
      id: '10',
      property_item_name: 'Belt',
      prisoner_name: 'Maria Garcia',
      prisoner_number: 'PR010',
      property_status_name: 'Confiscated',
      previous_status_name: 'In Storage',
      property_bag_number: 'BAG010',
      date_of_status_change: '2025-10-23',
      reason_for_status_change: 'Safety concerns - potential weapon',
      destination: 'Confiscated Items Room',
      property: '10',
      property_status: '3'
    }
  ];

  useEffect(() => {
    fetchStatusChanges(1);
  }, []);

  const fetchStatusChanges = async (page: number) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/property-management/status-changes/?page=${page}`);
      // const data = await response.json();
      // setStatusChanges(data.results);
      // setTotalCount(data.count);
      // setNextPage(data.next);
      // setPreviousPage(data.previous);
      // setTotalPages(Math.ceil(data.count / itemsPerPage));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = mockStatusChanges.slice(startIndex, endIndex);

      setStatusChanges(paginatedData);
      setTotalCount(mockStatusChanges.length);
      setTotalPages(Math.ceil(mockStatusChanges.length / itemsPerPage));
      setNextPage(page < Math.ceil(mockStatusChanges.length / itemsPerPage) ? `page=${page + 1}` : null);
      setPreviousPage(page > 1 ? `page=${page - 1}` : null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching status changes:', error);
      toast.error('Failed to load status changes');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchStatusChanges(newPage);
    }
  };

  const handleRefresh = () => {
    fetchStatusChanges(currentPage);
    toast.success('Data refreshed');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'released':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in storage':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confiscated':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'destroyed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'lost':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'transferred':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="border-b-2" style={{ borderColor: '#650000' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            <Package className="h-6 w-6" />
            Property Status Changes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              style={{ borderColor: '#650000' }}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : statusChanges.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No status changes found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#650000' }}>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Property Item</TableHead>
                    <TableHead className="text-white">Prisoner</TableHead>
                    <TableHead className="text-white">Bag Number</TableHead>
                    <TableHead className="text-white">Previous Status</TableHead>
                    <TableHead className="text-white">New Status</TableHead>
                    <TableHead className="text-white">Destination</TableHead>
                    <TableHead className="text-white">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusChanges.map((change) => (
                    <TableRow key={change.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {format(new Date(change.date_of_status_change), 'dd MMM yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" style={{ color: '#650000' }} />
                          <span>{change.property_item_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span>{change.prisoner_name}</span>
                            <span className="text-xs text-gray-500">{change.prisoner_number}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300">
                          {change.property_bag_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(change.previous_status_name)}>
                          {change.previous_status_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(change.property_status_name)}>
                          {change.property_status_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{change.destination || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={change.reason_for_status_change}>
                            {change.reason_for_status_change}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!previousPage || loading}
                  style={{ borderColor: '#650000' }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          style={
                            currentPage === page
                              ? { backgroundColor: '#650000' }
                              : { borderColor: '#650000' }
                          }
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!nextPage || loading}
                  style={{ borderColor: '#650000' }}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyStatusChangeList;
