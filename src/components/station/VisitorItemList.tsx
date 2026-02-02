import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DataTable } from '../common/DataTable';
import type { DataTableColumn } from '../common/DataTable.types';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

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
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  CheckCircle,
  XCircle,
  Clock,
  Image
} from 'lucide-react';
import VisitorItemForm from './VisitorItemForm';
import {Visitor} from "../../services/stationServices/visitorsServices/VisitorsService";
import {
  addVisitorItem, 
  deleteVisitorItem,
  fetchVisitorItem,
  getItemCategories, 
  getItemStatuses, 
  getStationItems, 
  getUnits, 
  Item, 
  ItemCategory, 
  ItemStatus,
  StationItem,
  StationItems, 
  Unit, 
  updateVisitorItem, 
  VisitorItem, 
  VISITOR_ITEM_API_ENDPOINTS
} from "../../services/stationServices/visitorsServices/visitorItem";
import {handleResponseError} from "../../services/stationServices/utils";

interface VisitorListProps {
  visitors: Visitor[];
  items: VisitorItem[];
  setItems: React.Dispatch<React.SetStateAction<VisitorItem[]>>;
}

// interface VisitorItem {
//   id: string;
//   visitor_name: string;
//   item_name: string;
//   category_name: string;
//   quantity: number;
//   currency: string;
//   amount: string;
//   bag_no: string;
//   is_allowed: boolean;
//   photo: string;
//   remarks: string;
//   is_collected: boolean;
//   for_prisoner: boolean;
//   visitor: string;
//   item_category: string;
//   item: string;
//   measurement_unit: string;
//   item_status: string;
// }

// Mock data
// const mockVisitorItems: VisitorItem[] = [
//   {
//     id: '1',
//     visitor_name: 'Sarah Doe',
//     item_name: 'Rice',
//     category_name: 'Food Items',
//     quantity: 5,
//     currency: 'UGX',
//     amount: '25000',
//     bag_no: 'BAG-001',
//     is_allowed: true,
//     photo: '',
//     remarks: 'White rice, sealed package',
//     is_collected: false,
//     for_prisoner: true,
//     visitor: 'visitor-1',
//     item_category: 'cat-1',
//     item: 'item-1',
//     measurement_unit: 'unit-1',
//     item_status: 'status-1'
//   },
//   {
//     id: '2',
//     visitor_name: 'Michael Johnson',
//     item_name: 'T-Shirt',
//     category_name: 'Clothing',
//     quantity: 2,
//     currency: 'UGX',
//     amount: '40000',
//     bag_no: 'BAG-002',
//     is_allowed: true,
//     photo: '',
//     remarks: 'Blue and white t-shirts',
//     is_collected: true,
//     for_prisoner: true,
//     visitor: 'visitor-2',
//     item_category: 'cat-2',
//     item: 'item-4',
//     measurement_unit: 'unit-4',
//     item_status: 'status-4'
//   },
//   {
//     id: '3',
//     visitor_name: 'Emily Davis',
//     item_name: 'Soap',
//     category_name: 'Personal Care',
//     quantity: 3,
//     currency: 'UGX',
//     amount: '15000',
//     bag_no: 'BAG-003',
//     is_allowed: true,
//     photo: '',
//     remarks: 'Bathing soap',
//     is_collected: false,
//     for_prisoner: true,
//     visitor: 'visitor-3',
//     item_category: 'cat-3',
//     item: 'item-6',
//     measurement_unit: 'unit-6',
//     item_status: 'status-2'
//   },
//   {
//     id: '4',
//     visitor_name: 'Lisa Thompson',
//     item_name: 'Radio',
//     category_name: 'Electronics',
//     quantity: 1,
//     currency: 'UGX',
//     amount: '150000',
//     bag_no: 'BAG-004',
//     is_allowed: false,
//     photo: '',
//     remarks: 'Small FM radio - not allowed',
//     is_collected: false,
//     for_prisoner: true,
//     visitor: 'visitor-4',
//     item_category: 'cat-5',
//     item: 'item-10',
//     measurement_unit: 'unit-4',
//     item_status: 'status-3'
//   },
//   {
//     id: '5',
//     visitor_name: 'Maria Garcia',
//     item_name: 'Bible',
//     category_name: 'Books & Magazines',
//     quantity: 1,
//     currency: 'UGX',
//     amount: '20000',
//     bag_no: 'BAG-005',
//     is_allowed: true,
//     photo: '',
//     remarks: 'NIV Bible',
//     is_collected: true,
//     for_prisoner: true,
//     visitor: 'visitor-5',
//     item_category: 'cat-4',
//     item: 'item-8',
//     measurement_unit: 'unit-4',
//     item_status: 'status-4'
//   }
// ];

export default function VisitorItemList({ visitors, items, setItems }: VisitorListProps) {
  // DataTable reload trigger - increment when data changes
  const [reloadKey, setReloadKey] = useState(0);

  // useFilterRefresh triggers DataTable reload when global filters change
  useFilterRefresh(() => {
    setReloadKey(prev => prev + 1);
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisitorItem | null>(null);
  const [viewingItem, setViewingItem] = useState<VisitorItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<VisitorItem | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Photo viewing state
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');

  const [itemsX, setItemsX] = useState<StationItem[]>([])
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([])
  const [itemStatuses, setItemStatuses] = useState<ItemStatus[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  const handleSubmit = async (data: Item) => {
    setLoading(true);
    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingItem) {
        // Update existing item
        const newItem = { ...data, id: editingItem.id };
        if (newItem.photo === "" || newItem.photo?.startsWith("https://")){
          delete newItem.photo;
        }

        const response = await updateVisitorItem(newItem, editingItem.id)
        if (handleResponseError(response)) return
        const visitorItem = response as VisitorItem;
        setItems(items.map((item) => (item.id === visitorItem.id ? { ...data, id: item.id } : item)));
        setReloadKey(prev => prev + 1); // Trigger DataTable reload
        toast.success('Item updated successfully');
      }
      else {
        // Add new item
        const newItem = { ...data, id: String(Date.now()) };
        if (newItem.photo === ""){
          delete newItem.photo;
        }

        const response = await addVisitorItem(newItem)
        if (handleResponseError(response)) return
        const visitorItem = response as VisitorItem;
        setItems([visitorItem, ...items])
        setReloadKey(prev => prev + 1); // Trigger DataTable reload
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

  const handleEdit = async (item: VisitorItem) => {
    // Prevent editing collected items
    if (item.is_collected) {
      toast.error('Cannot edit collected items. Item has already been collected by the prisoner.');
      return;
    }
    
    try {
      // Option B: Fetch fresh visitor item data from API
      const freshItem = await fetchVisitorItem(item.id);
      if (handleResponseError(freshItem)) return;
      setEditingItem(freshItem as VisitorItem);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch visitor item details:', error);
      toast.error('Failed to load item details. Please try again.');
    }
  };

  const handleView = (item: VisitorItem) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    
    // Prevent deleting collected items
    if (deleteItem.is_collected) {
      toast.error('Cannot delete collected items. Item has already been collected by the prisoner.');
      setDeleteItem(null);
      return;
    }

    setLoading(true);

    const response = await deleteVisitorItem(deleteItem.id)
    if (handleResponseError(response)) return;
    setItems(items.filter((item) => item.id !== deleteItem.id));
    setReloadKey(prev => prev + 1); // Trigger DataTable reload
    toast.success('Item deleted successfully');
    setDeleteItem(null);
    setLoading(false);
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

  // DataTable columns definition
  const columns: DataTableColumn[] = [
    {
      key: 'visitor_name',
      label: 'Visitor',
      sortable: true,
      render: (value: any, row: VisitorItem) => (
        <div>
          <p>{row.visitor_name}</p>
          {row.for_prisoner && (
            <Badge 
              variant={row.is_collected ? "default" : "outline"} 
              className={`mt-1 text-xs ${row.is_collected ? 'bg-green-600 text-white' : ''}`}
            >
              For Prisoner
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'item_name',
      label: 'Item',
      sortable: true,
    },
    {
      key: 'category_name',
      label: 'Category',
      sortable: true,
      render: (value: any) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (value: any, row: VisitorItem) => (
        <span>{value} {row.measurement_unit_name || ''}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Value',
      sortable: true,
      render: (value: any, row: VisitorItem) => {
        const amount = parseFloat(row.amount || '0');
        const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        const currency = row.currency_symbol || row.currency_name || '';
        return currency ? `${currency} ${formattedAmount}` : formattedAmount;
      },
    },
    {
      key: 'item_status_name',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value: any, row: VisitorItem) => {
        if (!row.is_allowed) {
          return <Badge variant="destructive">Not Allowed</Badge>;
        }
        if (row.is_collected) {
          return <Badge className="bg-green-600">Collected</Badge>;
        }
        return <Badge variant="secondary" className="bg-yellow-500">Pending</Badge>;
      },
    },
    {
      key: 'bag_no',
      label: 'Bag No.',
      sortable: true,
      render: (value: any) => value || '-',
    },
    {
      key: 'created_datetime',
      label: 'Registered',
      sortable: true,
      render: (value: any) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: VisitorItem) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            title={row.is_collected ? "Cannot edit collected items" : "Edit item"}
            disabled={row.is_collected}
            className={row.is_collected ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteItem(row)}
            title={row.is_collected ? "Cannot delete collected items" : "Delete item"}
            disabled={row.is_collected}
            className={row.is_collected ? "opacity-50 cursor-not-allowed text-gray-400" : "text-red-600 hover:text-red-700"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {row.photo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedPhotoUrl(row.photo); setIsPhotoDialogOpen(true); }}
              title="View photo"
            >
              <Image className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // API integration

  function handleServerError (response: any) {
    if ('error' in response){
          setIsDialogOpen(false);
          toast.error(response.error);
          return true
    }
    return false
  }

  function handleEmptyList (data: any, msg: string) {
    if (!data.length){
          setIsDialogOpen(false);
          toast.error(msg);
          return true
    }
    return false
  }

  function populateList(response: any, msg: string, setData: any) {
    if (handleServerError(response)) return
    if ("results" in response) {
      const data = response.results
      if(handleEmptyList(data, msg)) return
      setData(data)
    }
  }

  // Load dropdown data in parallel (non-blocking) when dialog opens
  useEffect(() => {
    if (isDialogOpen){
      if (!visitors){
        setIsDialogOpen(false);
        toast.error("There are no visitors");
        return;
      }

      // Load all data in parallel instead of sequentially
      Promise.all([
        getItemCategories().then(r => populateList(r, "There are no item categories", setItemCategories)),
        getStationItems().then(r => populateList(r, "There are no items", setItemsX)),
        getItemStatuses().then(r => populateList(r, "There are no item statuses", setItemStatuses)),
        getUnits().then(r => populateList(r, "There are no units", setUnits)),
      ]).catch(error => {
        if (!error?.response) {
          toast.error('Failed to load some dropdown data. Please try again.');
        }
      });
    }
  }, [isDialogOpen, visitors]);


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
          <DialogContent className="max-w-[95vw] w-[10vw] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
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
                  itemStatuses={itemStatuses}
                  itemsX={itemsX}
                  itemCategories={itemCategories}
                  units={units}
                  visitors={visitors}
                  loading={loading}
                  isEditing={!!editingItem}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* DataTable with built-in search, pagination, and export */}
      <DataTable
        key={reloadKey}
        url={VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS}
        title="Visitor Items"
        columns={columns}
        config={{
          search: true,
          export: {
            pdf: true,
            csv: true,
            print: true,
          },
          lengthMenu: [10, 50, 100],
          pagination: true,
          summary: true,
        }}
      />

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
                    {parseFloat(viewingItem.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {viewingItem.currency}
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
                  {/*{viewingItem.is_allowed ? (*/}
                  {/*  <Badge className="bg-green-600 flex items-center gap-1">*/}
                  {/*    <CheckCircle className="h-3 w-3" />*/}
                  {/*    Allowed*/}
                  {/*  </Badge>*/}
                  {/*) : (*/}
                  {/*  <Badge variant="destructive" className="flex items-center gap-1">*/}
                  {/*    <XCircle className="h-3 w-3" />*/}
                  {/*    Not Allowed*/}
                  {/*  </Badge>*/}
                  {/*)}*/}
                  {viewingItem.is_collected ? (
                    // <Badge className="bg-blue-600 flex items-center gap-1">
                    <Badge>
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPhotoUrl(viewingItem.photo);
                      setIsPhotoDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Image className="h-4 w-4" />
                    View Item Photo
                  </Button>
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

      {/* Photo Viewing Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Item Photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {selectedPhotoUrl ? (
              <img 
                src={selectedPhotoUrl} 
                alt="Item photo" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <p className="text-muted-foreground">No photo available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
