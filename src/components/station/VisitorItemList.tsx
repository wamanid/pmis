import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import VisitorItemForm from './VisitorItemForm';

interface VisitorItem {
  id: string;
  visitor_name: string;
  item_name: string;
  category_name: string;
  quantity: number;
  currency: string;
  amount: string;
  bag_no: string;
  is_allowed: boolean;
  photo: string;
  remarks: string;
  is_collected: boolean;
  for_prisoner: boolean;
  visitor: string;
  item_category: string;
  item: string;
  measurement_unit: string;
  item_status: string;
}

// Mock data
const mockVisitorItems: VisitorItem[] = [
  {
    id: '1',
    visitor_name: 'Sarah Doe',
    item_name: 'Rice',
    category_name: 'Food Items',
    quantity: 5,
    currency: 'UGX',
    amount: '25000',
    bag_no: 'BAG-001',
    is_allowed: true,
    photo: '',
    remarks: 'White rice, sealed package',
    is_collected: false,
    for_prisoner: true,
    visitor: 'visitor-1',
    item_category: 'cat-1',
    item: 'item-1',
    measurement_unit: 'unit-1',
    item_status: 'status-1'
  },
  {
    id: '2',
    visitor_name: 'Michael Johnson',
    item_name: 'T-Shirt',
    category_name: 'Clothing',
    quantity: 2,
    currency: 'UGX',
    amount: '40000',
    bag_no: 'BAG-002',
    is_allowed: true,
    photo: '',
    remarks: 'Blue and white t-shirts',
    is_collected: true,
    for_prisoner: true,
    visitor: 'visitor-2',
    item_category: 'cat-2',
    item: 'item-4',
    measurement_unit: 'unit-4',
    item_status: 'status-4'
  },
  {
    id: '3',
    visitor_name: 'Emily Davis',
    item_name: 'Soap',
    category_name: 'Personal Care',
    quantity: 3,
    currency: 'UGX',
    amount: '15000',
    bag_no: 'BAG-003',
    is_allowed: true,
    photo: '',
    remarks: 'Bathing soap',
    is_collected: false,
    for_prisoner: true,
    visitor: 'visitor-3',
    item_category: 'cat-3',
    item: 'item-6',
    measurement_unit: 'unit-6',
    item_status: 'status-2'
  },
  {
    id: '4',
    visitor_name: 'Lisa Thompson',
    item_name: 'Radio',
    category_name: 'Electronics',
    quantity: 1,
    currency: 'UGX',
    amount: '150000',
    bag_no: 'BAG-004',
    is_allowed: false,
    photo: '',
    remarks: 'Small FM radio - not allowed',
    is_collected: false,
    for_prisoner: true,
    visitor: 'visitor-4',
    item_category: 'cat-5',
    item: 'item-10',
    measurement_unit: 'unit-4',
    item_status: 'status-3'
  },
  {
    id: '5',
    visitor_name: 'Maria Garcia',
    item_name: 'Bible',
    category_name: 'Books & Magazines',
    quantity: 1,
    currency: 'UGX',
    amount: '20000',
    bag_no: 'BAG-005',
    is_allowed: true,
    photo: '',
    remarks: 'NIV Bible',
    is_collected: true,
    for_prisoner: true,
    visitor: 'visitor-5',
    item_category: 'cat-4',
    item: 'item-8',
    measurement_unit: 'unit-4',
    item_status: 'status-4'
  }
];

export default function VisitorItemList() {
  const [items, setItems] = useState<VisitorItem[]>(mockVisitorItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisitorItem | null>(null);
  const [viewingItem, setViewingItem] = useState<VisitorItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<VisitorItem | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCollected, setFilterCollected] = useState<string>('all');

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = searchQuery
      ? item.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bag_no.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = filterCategory === 'all' || item.category_name === filterCategory;
    const matchesCollected = 
      filterCollected === 'all' || 
      (filterCollected === 'collected' && item.is_collected) ||
      (filterCollected === 'pending' && !item.is_collected);

    return matchesSearch && matchesCategory && matchesCollected;
  });

  const handleSubmit = async (data: VisitorItem) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingItem) {
        // Update existing item
        setItems(items.map((item) => (item.id === editingItem.id ? { ...data, id: item.id } : item)));
        toast.success('Item updated successfully');
      } else {
        // Add new item
        const newItem = { ...data, id: String(Date.now()) };
        setItems([newItem, ...items]);
        toast.success('Item added successfully');
      }

      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: VisitorItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: VisitorItem) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setItems(items.filter((item) => item.id !== deleteItem.id));
      toast.success('Item deleted successfully');
      setDeleteItem(null);
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (item: VisitorItem) => {
    if (!item.is_allowed) {
      return <Badge variant="destructive">Not Allowed</Badge>;
    }
    if (item.is_collected) {
      return <Badge className="bg-blue-600">Collected</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const uniqueCategories = Array.from(new Set(mockVisitorItems.map(i => i.category_name)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="flex items-center gap-2">
            <Package className="h-6 w-6" style={{ color: '#650000' }} />
            Visitor Items
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage items brought by visitors
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingItem(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#650000' }} className="hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
            <div className="flex-1 overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle style={{ color: '#650000' }}>
                  {editingItem ? 'Edit Visitor Item' : 'Add Visitor Item'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? 'Update visitor item information'
                    : 'Add a new item brought by a visitor'}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                <VisitorItemForm
                  item={editingItem}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingItem(null);
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by visitor, item, category, or bag number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Collection Status Filter */}
            <div>
              <Select value={filterCollected} onValueChange={setFilterCollected}>
                <SelectTrigger>
                  <SelectValue placeholder="Collection Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="pending">Pending Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Bag No.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No visitor items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p>{item.visitor_name}</p>
                          {item.for_prisoner && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              For Prisoner
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category_name}</Badge>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.currency} {parseFloat(item.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{item.bag_no || '-'}</TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(item)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            title="Edit item"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteItem(item)}
                            title="Delete item"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Item Details</DialogTitle>
          </DialogHeader>

          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Visitor</p>
                  <p>{viewingItem.visitor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Item</p>
                  <p>{viewingItem.item_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p>{viewingItem.category_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p>{viewingItem.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p>
                    {viewingItem.currency} {parseFloat(viewingItem.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bag Number</p>
                  <p>{viewingItem.bag_no || '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {viewingItem.is_allowed ? (
                    <Badge className="bg-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Allowed
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Allowed
                    </Badge>
                  )}
                  {viewingItem.is_collected ? (
                    <Badge className="bg-blue-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Collected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending Collection
                    </Badge>
                  )}
                  {viewingItem.for_prisoner && (
                    <Badge variant="outline">For Prisoner</Badge>
                  )}
                </div>
              </div>

              {viewingItem.remarks && (
                <div>
                  <p className="text-sm text-muted-foreground">Remarks</p>
                  <p className="mt-1">{viewingItem.remarks}</p>
                </div>
              )}

              {viewingItem.photo && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Photo</p>
                  <img
                    src={viewingItem.photo}
                    alt="Item"
                    className="max-h-64 rounded border"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingItem && (
              <Button
                style={{ backgroundColor: '#650000' }}
                className="hover:opacity-90"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(viewingItem);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Visitor Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
              {deleteItem && (
                <div className="mt-2 p-3 bg-muted rounded">
                  <p>
                    <strong>Item:</strong> {deleteItem.item_name}
                  </p>
                  <p>
                    <strong>Visitor:</strong> {deleteItem.visitor_name}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
