import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import SearchableSelect from '../common/SearchableSelect';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Check, ChevronsUpDown, AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import {
  Item,
  ItemCategories,
  ItemCategory, ItemStatus,
  ItemStatuses,
  StationItem, Unit,
  VISITOR_ITEM_API_ENDPOINTS
} from "../../services/stationServices/visitorsServices/visitorItem";
import {Visitor} from "../../services/stationServices/visitorsServices/VisitorsService";
import {fileToBinaryString} from "../../services/stationServices/utils";
import axiosInstance from "../../services/axiosInstance";

// NOTE: API endpoints now centralized in service files (VISITOR_ITEM_API_ENDPOINTS imported above)

interface VisitorItem {
  id?: string;
  visitor_name?: string;
  item_name?: string;
  category_name?: string;
  measurement_unit_name?: string;
  currency_name?: string;
  item_status_name?: string;
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

interface VisitorItemFormProps {
  item?: VisitorItem | null;
  onSubmit: (data: VisitorItem) => void;
  onCancel: () => void;
  itemStatuses: ItemStatus[];
  itemsX: StationItem[];
  itemCategories: ItemCategory[];
  units: Unit[];
  visitors: Visitor[];
  loading: boolean;
  isEditing?: boolean;
}

export default function VisitorItemForm({ item, onSubmit, onCancel, itemStatuses, itemsX, itemCategories, units, visitors, loading, isEditing }: VisitorItemFormProps) {
  // Paginated fetch callbacks for dropdowns
  const fetchVisitorsPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_ITEM_API_ENDPOINTS.STATION_VISITORS, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      // Map visitors to include searchable full name display
      const visitorsWithDisplay = (res.data?.results ?? []).map((v: any) => ({
        ...v,
        full_name_display: `${v.first_name} ${v.last_name || ''} (${v.id_number})`
      }));
      return {
        items: visitorsWithDisplay,
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        // Request was cancelled (user typed quickly, navigated away, etc.) - this is expected
        return { items: [], count: 0, next: null };
      }
      toast.error('Failed to load visitors');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchItemCategoriesPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_ITEM_API_ENDPOINTS.ITEM_CATEGORIES, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      toast.error('Failed to load item categories');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchItemsPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; item_category?: string; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const params: any = { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 };
      if (opts.item_category) params.category = opts.item_category;
      const res = await axiosInstance.get(VISITOR_ITEM_API_ENDPOINTS.ITEMS, {
        params,
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      toast.error('Failed to load items');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchUnitsPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_ITEM_API_ENDPOINTS.UNITS, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      toast.error('Failed to load units');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchItemStatusesPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_ITEM_API_ENDPOINTS.ITEM_STATUSES, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      toast.error('Failed to load item statuses');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchCurrenciesPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_ITEM_API_ENDPOINTS.CURRENCIES, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      toast.error('Failed to load currencies');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const [formData, setFormData] = useState<Item>(() => {
    // Initialize with item values if editing, prevents timing issues
    if (item && isEditing) {
      return {
        quantity: item.quantity || 1,
        currency: item.currency || '',
        amount: item.amount || '0',
        bag_no: item.bag_no || '',
        photo: item.photo || '',
        remarks: item.remarks || '',
        is_collected: item.is_collected ?? false,
        for_prisoner: item.for_prisoner ?? true,
        visitor: item.visitor || '',
        item_category: item.item_category || '',
        item: item.item || '',
        measurement_unit: item.measurement_unit || '',
        item_status: item.item_status || '',
        is_active: true,
        deleted_datetime: null,
        deleted_by: null,
      };
    }
    // Default empty form
    return {
      quantity: 1,
      currency: '',
      amount: '0',
      bag_no: '',
      photo: '',
      remarks: '',
      is_collected: false,
      for_prisoner: true,
      visitor: '',
      item_category: '',
      item: '',
      measurement_unit: '',
      item_status: '',
      is_active: true,
      deleted_datetime: null,
      deleted_by: null,
    };
  });

  const [photoPreview, setPhotoPreview] = useState<string>(() => item?.photo || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Force remount of SearchableSelect components when switching between add/edit
  const [selectsKey, setSelectsKey] = useState(0);

  // Combobox states
  const [visitorOpen, setVisitorOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    if (item) {
      // When editing, item has the ID fields we need (visitor, item_category, item, etc.)
      setFormData({
        quantity: item.quantity || 1,
        currency: item.currency || '',
        amount: item.amount || '0',
        bag_no: item.bag_no || '',
        deleted_by: null,
        deleted_datetime: null,
        is_active: true,
        photo: item.photo || '',
        remarks: item.remarks || '',
        is_collected: item.is_collected ?? false,
        for_prisoner: item.for_prisoner ?? true,
        visitor: item.visitor || '',
        item_category: item.item_category || '',
        item: item.item || '',
        measurement_unit: item.measurement_unit || '',
        item_status: item.item_status || '',
      });
      if (item.photo) {
        setPhotoPreview(item.photo);
      }
      // Force remount of SearchableSelect components
      setSelectsKey(k => k + 1);
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.visitor) newErrors.visitor = 'Visitor is required';
    if (!formData.item_category) newErrors.item_category = 'Item category is required';
    if (!formData.item) newErrors.item = 'Item is required';
    if (!formData.measurement_unit) newErrors.measurement_unit = 'Measurement unit is required';
    if (!formData.item_status) newErrors.item_status = 'Item status is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // TODO: Handle photo file upload
    // const formDataToSubmit = new FormData();
    // if (photoFile) {
    //   formDataToSubmit.append('photo', photoFile);
    // }

    onSubmit(formData as any);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      const binaryString = await fileToBinaryString(file);
      setFormData(prev => ({ ...prev, photo: binaryString }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Photo uploaded successfully");
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData(prev => ({ ...prev, photo: '' }));
  };

  // Filter items based on selected category
  const filteredItems = formData.item_category
    ? itemsX.filter(i => i.category === formData.item_category)
    : itemsX;

  const selectedVisitor = visitors.find(v => v.id === formData.visitor);
  const selectedCategory = itemCategories.find(c => c.id === formData.item_category);
  const selectedItem = itemsX.find(i => i.id === formData.item);
  const selectedUnit = units.find(u => u.id === formData.measurement_unit);
  const selectedStatus = itemStatuses.find(s => s.id === formData.item_status);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Visitor Selection */}
          <div className="space-y-2">
            <Label>
              Visitor <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              key={`visitor-${selectsKey}-${item?.id || 'new'}`}
              value={formData.visitor}
              onChange={(val) => {
                if (!isEditing) {
                  setFormData(prev => ({ ...prev, visitor: String(val ?? "") }));
                  setErrors(prev => ({ ...prev, visitor: '' }));
                }
              }}
              fetchPaginated={fetchVisitorsPaginated}
              idField="id"
              labelField="full_name_display"
              placeholder={isEditing ? "Visitor (cannot be changed)" : "Select visitor..."}
              pageSize={50}
              minQueryLength={0}
              className={`${errors.visitor ? 'border-red-500' : ''} ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
              initialItem={item && isEditing ? {
                id: item.visitor,
                full_name_display: item.visitor_name || 'Unknown Visitor'
              } as any : undefined}
            />
            {errors.visitor && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.visitor}
              </p>
            )}
          </div>

          {/* Item Category */}
          <div className="space-y-2">
            <Label>
              Item Category <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              key={`category-${selectsKey}-${item?.id || 'new'}`}
              value={formData.item_category}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, item_category: String(val ?? ""), item: "" }));
                setErrors(prev => ({ ...prev, item_category: '' }));
              }}
              fetchPaginated={fetchItemCategoriesPaginated}
              idField="id"
              labelField="name"
              placeholder="Select category..."
              pageSize={50}
              minQueryLength={0}
              className={errors.item_category ? 'border-red-500' : ''}
              initialItem={item && isEditing && item.category_name ? {
                id: item.item_category,
                name: item.category_name
              } as any : undefined}
            />
            {errors.item_category && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.item_category}
              </p>
            )}
          </div>

          {/* Item */}
          <div className="space-y-2">
            <Label>
              Item <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              key={`item-${selectsKey}-${item?.id || 'new'}`}
              value={formData.item}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, item: String(val ?? "") }));
                setErrors(prev => ({ ...prev, item: '' }));
              }}
              fetchPaginated={(opts, signal) => {
                if (!formData.item_category) {
                  return Promise.resolve({ items: [], count: 0, next: null });
                }
                return fetchItemsPaginated({ ...opts, item_category: formData.item_category }, signal);
              }}
              idField="id"
              labelField="name"
              placeholder={formData.item_category ? "Select item..." : "Select category first..."}
              pageSize={50}
              minQueryLength={0}
              className={errors.item ? 'border-red-500' : ''}
              initialItem={item && isEditing && item.item_name ? {
                id: item.item,
                name: item.item_name
              } as any : undefined}
            />
            {errors.item && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.item}
              </p>
            )}
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }));
                  setErrors(prev => ({ ...prev, quantity: '' }));
                }}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.quantity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Unit <span className="text-red-500">*</span>
              </Label>
              <SearchableSelect
                key={`unit-${selectsKey}-${item?.id || 'new'}`}
                value={formData.measurement_unit}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, measurement_unit: String(val ?? "") }));
                  setErrors(prev => ({ ...prev, measurement_unit: '' }));
                }}
                fetchPaginated={fetchUnitsPaginated}
                idField="id"
                labelField="name"
                placeholder="Select unit..."
                pageSize={50}
                minQueryLength={0}
                className={errors.measurement_unit ? 'border-red-500' : ''}
                initialItem={item && isEditing && item.measurement_unit_name ? {
                  id: item.measurement_unit,
                  name: item.measurement_unit_name
                } as any : undefined}
              />
              {errors.measurement_unit && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.measurement_unit}
                </p>
              )}
            </div>
          </div>

          {/* Currency and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Currency
              </Label>
              <SearchableSelect
                key={`currency-${selectsKey}-${item?.id || 'new'}`}
                value={formData.currency}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, currency: String(val ?? "") }));
                  setErrors(prev => ({ ...prev, currency: '' }));
                }}
                fetchPaginated={fetchCurrenciesPaginated}
                idField="id"
                labelField="name"
                placeholder="Select currency..."
                pageSize={50}
                minQueryLength={0}
                className={errors.currency ? 'border-red-500' : ''}
                initialItem={item && isEditing && item.currency ? {
                  id: item.currency,
                  name: item.currency_name || item.currency
                } as any : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, amount: e.target.value }));
                  setErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={errors.amount ? 'border-red-500' : ''}
              />
            </div>
          </div>

          {/* Bag Number */}
          <div className="space-y-2">
            <Label htmlFor="bag_no">Bag Number</Label>
            <Input
              id="bag_no"
              value={formData.bag_no}
              onChange={(e) => setFormData(prev => ({ ...prev, bag_no: e.target.value }))}
              placeholder="e.g., BAG-001"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Item Status */}
          <div className="space-y-2">
            <Label>
              Item Status <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              key={`status-${selectsKey}-${item?.id || 'new'}`}
              value={formData.item_status}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, item_status: String(val ?? "") }));
                setErrors(prev => ({ ...prev, item_status: '' }));
              }}
              fetchPaginated={fetchItemStatusesPaginated}
              idField="id"
              labelField="name"
              placeholder="Select status..."
              pageSize={50}
              minQueryLength={0}
              className={errors.item_status ? 'border-red-500' : ''}
              initialItem={item && isEditing && item.item_status_name ? {
                id: item.item_status,
                name: item.item_status_name
              } as any : undefined}
            />
            {errors.item_status && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.item_status}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Item Photo</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Item preview"
                    className="max-h-48 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Click to upload item photo
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Additional notes or remarks"
              rows={3}
            />
          </div>

          {/* Switches */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">

            {/*<div className="flex items-center justify-between">*/}
            {/*  <div className="space-y-0.5">*/}
            {/*    <Label htmlFor="is_allowed">Item Allowed</Label>*/}
            {/*    <p className="text-sm text-muted-foreground">*/}
            {/*      Item is allowed to be brought in*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*  <Switch*/}
            {/*    id="is_allowed"*/}
            {/*    checked={formData.is_allowed}*/}
            {/*    onCheckedChange={(checked) => setFormData({ ...formData, is_allowed: checked })}*/}
            {/*  />*/}
            {/*</div>*/}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="for_prisoner">For Prisoner</Label>
                <p className="text-sm text-muted-foreground">
                  Item is intended for a prisoner
                </p>
              </div>
              <Switch
                id="for_prisoner"
                checked={formData.for_prisoner}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, for_prisoner: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_collected">Collected</Label>
                <p className="text-sm text-muted-foreground">
                  Item has been collected
                </p>
              </div>
              <Switch
                id="is_collected"
                checked={formData.is_collected}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_collected: checked }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" style={{ backgroundColor: '#650000' }} className="hover:opacity-90" disabled={loading}>
          {item?.id ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}
