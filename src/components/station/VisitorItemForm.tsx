import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Check, ChevronsUpDown, AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import {
  Item,
  ItemCategories,
  ItemCategory, ItemStatus,
  ItemStatuses,
  StationItem, Unit
} from "../../services/stationServices/visitorsServices/visitorItem";
import {Visitor} from "../../services/stationServices/visitorsServices/VisitorsService";
import {fileToBinaryString} from "../../services/stationServices/utils";

interface VisitorItem {
  id?: string;
  visitor_name?: string;
  item_name?: string;
  category_name?: string;
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
}

// Mock data for dropdowns
const mockVisitors = [
  { id: 'visitor-1', name: 'Sarah Doe', id_number: 'CM123456789' },
  { id: 'visitor-2', name: 'Michael Johnson', id_number: 'CM987654321' },
  { id: 'visitor-3', name: 'Emily Davis', id_number: 'CM456789123' },
  { id: 'visitor-4', name: 'Lisa Thompson', id_number: 'CM789123456' },
  { id: 'visitor-5', name: 'Maria Garcia', id_number: 'CM321654987' }
];

const mockItemCategories = [
  { id: 'cat-1', name: 'Food Items' },
  { id: 'cat-2', name: 'Clothing' },
  { id: 'cat-3', name: 'Personal Care' },
  { id: 'cat-4', name: 'Books & Magazines' },
  { id: 'cat-5', name: 'Electronics' },
  { id: 'cat-6', name: 'Medicine' }
];

const mockItems = [
  { id: 'item-1', name: 'Rice', category_id: 'cat-1' },
  { id: 'item-2', name: 'Beans', category_id: 'cat-1' },
  { id: 'item-3', name: 'Sugar', category_id: 'cat-1' },
  { id: 'item-4', name: 'T-Shirt', category_id: 'cat-2' },
  { id: 'item-5', name: 'Trousers', category_id: 'cat-2' },
  { id: 'item-6', name: 'Soap', category_id: 'cat-3' },
  { id: 'item-7', name: 'Toothpaste', category_id: 'cat-3' },
  { id: 'item-8', name: 'Bible', category_id: 'cat-4' },
  { id: 'item-9', name: 'Novel', category_id: 'cat-4' },
  { id: 'item-10', name: 'Radio', category_id: 'cat-5' }
];

const mockMeasurementUnits = [
  { id: 'unit-1', name: 'Kilograms (Kg)' },
  { id: 'unit-2', name: 'Grams (g)' },
  { id: 'unit-3', name: 'Liters (L)' },
  { id: 'unit-4', name: 'Pieces (Pcs)' },
  { id: 'unit-5', name: 'Pairs' },
  { id: 'unit-6', name: 'Packets' },
  { id: 'unit-7', name: 'Bottles' }
];

const mockItemStatuses = [
  { id: 'status-1', name: 'Pending Inspection', color: 'yellow' },
  { id: 'status-2', name: 'Approved', color: 'green' },
  { id: 'status-3', name: 'Rejected', color: 'red' },
  { id: 'status-4', name: 'Collected', color: 'blue' },
  { id: 'status-5', name: 'Stored', color: 'gray' }
];

const mockCurrencies = [
  { code: 'UGX', name: 'Uganda Shillings (UGX)' },
  { code: 'USD', name: 'US Dollars (USD)' },
  { code: 'EUR', name: 'Euros (EUR)' },
  { code: 'GBP', name: 'British Pounds (GBP)' }
];

export default function VisitorItemForm({ item, onSubmit, onCancel, itemStatuses, itemsX, itemCategories, units, visitors, loading }: VisitorItemFormProps) {
  const [formData, setFormData] = useState<Item>({
    quantity: 1,
    currency: 'UGX',
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
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Combobox states
  const [visitorOpen, setVisitorOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        quantity: item.quantity || 1,
        currency: item.currency || 'UGX',
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
    if (!formData.currency) newErrors.currency = 'Currency is required';
    if (!formData.amount || parseFloat(formData.amount) < 0) newErrors.amount = 'Amount must be 0 or greater';

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

    onSubmit(formData);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      const binaryString = await fileToBinaryString(file);
      setFormData({ ...formData, photo: binaryString });

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
    setFormData({ ...formData, photo: '' });
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
  const selectedCurrency = mockCurrencies.find(c => c.code === formData.currency);

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
            <Popover open={visitorOpen} onOpenChange={setVisitorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={visitorOpen}
                  className={`w-full justify-between ${errors.visitor ? 'border-red-500' : ''}`}
                >
                  {selectedVisitor
                    ? `${selectedVisitor.first_name} (${selectedVisitor.id_number})`
                    : 'Select visitor...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search visitor..." />
                  <CommandList>
                    <CommandEmpty>No visitor found.</CommandEmpty>
                    <CommandGroup>
                      {visitors.map((visitor) => (
                        <CommandItem
                          key={visitor.id}
                          value={`${visitor.first_name} ${visitor.last_name} ${visitor.id_number}`}
                          onSelect={() => {
                            setFormData({ ...formData, visitor: visitor.id });
                            setVisitorOpen(false);
                            setErrors({ ...errors, visitor: '' });
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.visitor === visitor.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {visitor.first_name} {visitor.last_name} ({visitor.id_number})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className={`w-full justify-between ${errors.item_category ? 'border-red-500' : ''}`}
                >
                  {selectedCategory ? selectedCategory.name : 'Select category...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search category..." />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {itemCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            setFormData({ ...formData, item_category: category.id, item: '' });
                            setCategoryOpen(false);
                            setErrors({ ...errors, item_category: '' });
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.item_category === category.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            <Popover open={itemOpen} onOpenChange={setItemOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={itemOpen}
                  disabled={!formData.item_category}
                  className={`w-full justify-between ${errors.item ? 'border-red-500' : ''}`}
                >
                  {selectedItem ? selectedItem.name : 'Select item...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search item..." />
                  <CommandList>
                    <CommandEmpty>No item found.</CommandEmpty>
                    <CommandGroup>
                      {filteredItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => {
                            setFormData({ ...formData, item: item.id });
                            setItemOpen(false);
                            setErrors({ ...errors, item: '' });
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.item === item.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 });
                  setErrors({ ...errors, quantity: '' });
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
              <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={unitOpen}
                    className={`w-full justify-between ${errors.measurement_unit ? 'border-red-500' : ''}`}
                  >
                    {selectedUnit ? selectedUnit.name : 'Select unit...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search unit..." />
                    <CommandList>
                      <CommandEmpty>No unit found.</CommandEmpty>
                      <CommandGroup>
                        {units.map((unit) => (
                          <CommandItem
                            key={unit.id}
                            value={unit.name}
                            onSelect={() => {
                              setFormData({ ...formData, measurement_unit: unit.id });
                              setUnitOpen(false);
                              setErrors({ ...errors, measurement_unit: '' });
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.measurement_unit === unit.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {unit.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                Currency <span className="text-red-500">*</span>
              </Label>
              <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={currencyOpen}
                    className={`w-full justify-between ${errors.currency ? 'border-red-500' : ''}`}
                  >
                    {selectedCurrency ? selectedCurrency.name : 'Select currency...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {mockCurrencies.map((currency) => (
                          <CommandItem
                            key={currency.code}
                            value={currency.name}
                            onSelect={() => {
                              setFormData({ ...formData, currency: currency.code });
                              setCurrencyOpen(false);
                              setErrors({ ...errors, currency: '' });
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.currency === currency.code ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {currency.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.currency && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currency}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  setErrors({ ...errors, amount: '' });
                }}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Bag Number */}
          <div className="space-y-2">
            <Label htmlFor="bag_no">Bag Number</Label>
            <Input
              id="bag_no"
              value={formData.bag_no}
              onChange={(e) => setFormData({ ...formData, bag_no: e.target.value })}
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
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={statusOpen}
                  className={`w-full justify-between ${errors.item_status ? 'border-red-500' : ''}`}
                >
                  {selectedStatus ? selectedStatus.name : 'Select status...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search status..." />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {itemStatuses.map((status) => (
                        <CommandItem
                          key={status.id}
                          value={status.name}
                          onSelect={() => {
                            setFormData({ ...formData, item_status: status.id });
                            setStatusOpen(false);
                            setErrors({ ...errors, item_status: '' });
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.item_status === status.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {status.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
                onCheckedChange={(checked) => setFormData({ ...formData, for_prisoner: checked })}
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
                onCheckedChange={(checked) => setFormData({ ...formData, is_collected: checked })}
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
