// This is a temporary file for the new PropertyForm component
// It will be merged into PrisonerPropertyScreen.tsx

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { DialogFooter } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '../ui/utils';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';

// This component needs to be integrated into PrisonerPropertyScreen.tsx
// Replace the existing PropertyForm component with this structure

const PropertyFormNew = ({ 
  onSubmit, 
  isEdit,
  // For create mode - multiple items
  prisonerInfo,
  setPrisonerInfo,
  visitorInfo,
  setVisitorInfo,
  propertyItems,
  handleAddPropertyItem,
  handleRemovePropertyItem,
  handleUpdatePropertyItem,
  // For edit mode - single item
  formData,
  setFormData,
  // Shared data
  mockPrisoners,
  visitors,
  isLoadingVisitors,
  mockPropertyTypes,
  mockPropertyCategories,
  mockPropertyItems,
  mockMeasurementUnits,
  mockPropertyBags,
  mockPropertyStatuses,
  mockNextOfKin,
  setIsCreateDialogOpen,
  setIsEditDialogOpen
}: any) => {
  const [openPrisoner, setOpenPrisoner] = useState(false);
  const [openVisitor, setOpenVisitor] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isEdit ? (
        <>
          {/* CREATE MODE - Multiple Items */}
          
          {/* Prisoner Information Section */}
          <Card className="border-2" style={{ borderColor: '#650000' }}>
            <div className="p-4">
              <h3 className="mb-4" style={{ color: '#650000' }}>Prisoner Information</h3>
              <div className="space-y-2">
                <Label htmlFor="prisoner">Prisoner *</Label>
                <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPrisoner}
                      className="w-full justify-between"
                      type="button"
                    >
                      {prisonerInfo.prisoner ? (
                        (() => {
                          const prisoner = mockPrisoners.find((p: any) => p.id === prisonerInfo.prisoner);
                          return prisoner ? (
                            <div className="flex items-center gap-2">
                              <span>{prisoner.full_name}</span>
                              <span className="text-gray-500">({prisoner.prisoner_number})</span>
                            </div>
                          ) : "Select prisoner...";
                        })()
                      ) : "Select prisoner..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search prisoner..." />
                      <CommandList>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {mockPrisoners.map((prisoner: any) => (
                            <CommandItem
                              key={prisoner.id}
                              value={prisoner.full_name + ' ' + prisoner.prisoner_number}
                              onSelect={() => {
                                setPrisonerInfo({...prisonerInfo, prisoner: prisoner.id});
                                setOpenPrisoner(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  prisonerInfo.prisoner === prisoner.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{prisoner.full_name}</span>
                                <span className="text-xs text-gray-500">Prisoner Number: {prisoner.prisoner_number}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {prisonerInfo.prisoner && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Prisoner Number:</span>
                        <span className="ml-2">{mockPrisoners.find((p: any) => p.id === prisonerInfo.prisoner)?.prisoner_number}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Full Name:</span>
                        <span className="ml-2">{mockPrisoners.find((p: any) => p.id === prisonerInfo.prisoner)?.full_name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Visitor Information Section */}
          <Card className="border-2" style={{ borderColor: '#650000' }}>
            <div className="p-4">
              <h3 className="mb-4" style={{ color: '#650000' }}>Visitor Information</h3>
              <div className="space-y-2">
                <Label htmlFor="visitor">Visitor</Label>
                <Popover open={openVisitor} onOpenChange={setOpenVisitor}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openVisitor}
                      className="w-full justify-between"
                      type="button"
                      disabled={isLoadingVisitors}
                    >
                      {visitorInfo.visitor ? (
                        (() => {
                          const visitor = visitors.find((v: any) => v.id === visitorInfo.visitor);
                          return visitor ? `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim() : "Select visitor...";
                        })()
                      ) : "Select visitor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search by name, ID, or phone..." />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingVisitors ? "Loading visitors..." : "No visitor found."}
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              setVisitorInfo({...visitorInfo, visitor: ''});
                              setOpenVisitor(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                visitorInfo.visitor === '' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            None
                          </CommandItem>
                          {visitors.map((visitor: any) => {
                            const fullName = `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim();
                            const searchValue = `${fullName} ${visitor.id_number} ${visitor.phone_number}`;
                            return (
                              <CommandItem
                                key={visitor.id}
                                value={searchValue}
                                onSelect={() => {
                                  setVisitorInfo({...visitorInfo, visitor: visitor.id});
                                  setOpenVisitor(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    visitorInfo.visitor === visitor.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{fullName}</span>
                                  <span className="text-xs text-gray-500">
                                    ID: {visitor.id_number} | Phone: {visitor.phone_number}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {visitorInfo.visitor && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Visitor Name:</span>
                        <span className="ml-2">
                          {(() => {
                            const visitor = visitors.find((v: any) => v.id === visitorInfo.visitor);
                            return visitor ? `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim() : '';
                          })()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone Number:</span>
                        <span className="ml-2">{visitors.find((v: any) => v.id === visitorInfo.visitor)?.phone_number}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">ID Number:</span>
                        <span className="ml-2">{visitors.find((v: any) => v.id === visitorInfo.visitor)?.id_number}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Property Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 style={{ color: '#650000' }}>Property Items</h3>
              <Button
                type="button"
                onClick={handleAddPropertyItem}
                size="sm"
                style={{ backgroundColor: '#650000' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {propertyItems.map((item: any, index: number) => (
              <PropertyItemFields
                key={item.id}
                item={item}
                index={index}
                propertyItems={propertyItems}
                handleUpdatePropertyItem={handleUpdatePropertyItem}
                handleRemovePropertyItem={handleRemovePropertyItem}
                mockPropertyTypes={mockPropertyTypes}
                mockPropertyCategories={mockPropertyCategories}
                mockPropertyItems={mockPropertyItems}
                mockMeasurementUnits={mockMeasurementUnits}
                mockPropertyBags={mockPropertyBags}
                mockPropertyStatuses={mockPropertyStatuses}
                mockNextOfKin={mockNextOfKin}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* EDIT MODE - Single Item (existing form fields) */}
          <EditModeForm
            formData={formData}
            setFormData={setFormData}
            mockPrisoners={mockPrisoners}
            visitors={visitors}
            isLoadingVisitors={isLoadingVisitors}
            mockPropertyTypes={mockPropertyTypes}
            mockPropertyCategories={mockPropertyCategories}
            mockPropertyItems={mockPropertyItems}
            mockMeasurementUnits={mockMeasurementUnits}
            mockPropertyBags={mockPropertyBags}
            mockPropertyStatuses={mockPropertyStatuses}
            mockNextOfKin={mockNextOfKin}
          />
        </>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
        }}>
          Cancel
        </Button>
        <Button type="submit" style={{ backgroundColor: '#650000' }}>
          {isEdit ? 'Update' : 'Create'} {isEdit ? 'Property' : `${propertyItems?.length || 1} ${(propertyItems?.length || 1) > 1 ? 'Properties' : 'Property'}`}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Component for individual property item fields in create mode
const PropertyItemFields = ({ item, index, propertyItems, handleUpdatePropertyItem, handleRemovePropertyItem, ...mockData }: any) => {
  const [openStates, setOpenStates] = useState({
    propertyType: false,
    propertyCategory: false,
    propertyItem: false,
    measurementUnit: false,
    propertyBag: false,
    propertyStatus: false,
    nextOfKin: false
  });

  const toggleOpen = (field: string) => {
    setOpenStates((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  return (
    <Card className="p-4 relative">
      {propertyItems.length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => handleRemovePropertyItem(item.id)}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      )}

      <h4 className="mb-4 text-gray-700">Item #{index + 1}</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type *</Label>
          <Popover open={openStates.propertyType} onOpenChange={() => toggleOpen('propertyType')}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                {item.property_type
                  ? mockData.mockPropertyTypes.find((t: any) => t.id === item.property_type)?.name
                  : "Select property type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No type found.</CommandEmpty>
                  <CommandGroup>
                    {mockData.mockPropertyTypes.map((type: any) => (
                      <CommandItem
                        key={type.id}
                        value={type.name}
                        onSelect={() => {
                          handleUpdatePropertyItem(item.id, 'property_type', type.id);
                          toggleOpen('propertyType');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", item.property_type === type.id ? "opacity-100" : "opacity-0")} />
                        {type.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Property Category */}
        <div className="space-y-2">
          <Label>Property Category *</Label>
          <Popover open={openStates.propertyCategory} onOpenChange={() => toggleOpen('propertyCategory')}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                {item.property_category
                  ? mockData.mockPropertyCategories.find((c: any) => c.id === item.property_category)?.name
                  : "Select category..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {mockData.mockPropertyCategories.map((category: any) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => {
                          handleUpdatePropertyItem(item.id, 'property_category', category.id);
                          toggleOpen('propertyCategory');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", item.property_category === category.id ? "opacity-100" : "opacity-0")} />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Property Item */}
        <div className="space-y-2">
          <Label>Property Item *</Label>
          <Popover open={openStates.propertyItem} onOpenChange={() => toggleOpen('propertyItem')}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                {item.property_item
                  ? mockData.mockPropertyItems.find((i: any) => i.id === item.property_item)?.name
                  : "Select item..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No item found.</CommandEmpty>
                  <CommandGroup>
                    {mockData.mockPropertyItems.map((propertyItem: any) => (
                      <CommandItem
                        key={propertyItem.id}
                        value={propertyItem.name}
                        onSelect={() => {
                          handleUpdatePropertyItem(item.id, 'property_item', propertyItem.id);
                          toggleOpen('propertyItem');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", item.property_item === propertyItem.id ? "opacity-100" : "opacity-0")} />
                        {propertyItem.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Measurement Unit */}
        <div className="space-y-2">
          <Label>Measurement Unit</Label>
          <Popover open={openStates.measurementUnit} onOpenChange={() => toggleOpen('measurementUnit')}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                {item.measurement_unit
                  ? mockData.mockMeasurementUnits.find((u: any) => u.id === item.measurement_unit)?.name
                  : "Select unit..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No unit found.</CommandEmpty>
                  <CommandGroup>
                    {mockData.mockMeasurementUnits.map((unit: any) => (
                      <CommandItem
                        key={unit.id}
                        value={unit.name}
                        onSelect={() => {
                          handleUpdatePropertyItem(item.id, 'measurement_unit', unit.id);
                          toggleOpen('measurementUnit');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", item.measurement_unit === unit.id ? "opacity-100" : "opacity-0")} />
                        {unit.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label>Quantity *</Label>
          <Input
            type="text"
            value={item.quantity}
            onChange={(e) => handleUpdatePropertyItem(item.id, 'quantity', e.target.value)}
            placeholder="Enter quantity"
            required
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label>Amount (UGX)</Label>
          <Input
            type="number"
            value={item.amount}
            onChange={(e) => handleUpdatePropertyItem(item.id, 'amount', e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        {/* Property Bag */}
        <div className="space-y-2">
          <Label>Property Bag *</Label>
          <Popover open={openStates.propertyBag} onOpenChange={() => toggleOpen('propertyBag')}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                {item.property_bag
                  ? mockData.mockPropertyBags.find((b: any) => b.id === item.property_bag)?.bag_number
                  : "Select bag..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No bag found.</CommandEmpty>
                  <CommandGroup>
                    {mockData.mockPropertyBags.map((bag: any) => (
                      <CommandItem
                        key={bag.id}
                        value={bag.bag_number}
                        onSelect={() => {
                          handleUpdatePropertyItem(item.id, 'property_bag', bag.id);
                          toggleOpen('propertyBag');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", item.property_bag === bag.id ? "opacity-100" : "opacity-0")} />
                        {bag.bag_number}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Property Status */}
        <div className="space-y-2">
          <Label>Property Status *</Label>
          <Popover open={openStates.propertyStatus} onOpenChange={() => toggleOpen('propertyStatus')}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                {item.property_status
                  ? mockData.mockPropertyStatuses.find((s: any) => s.id === item.property_status)?.name
                  : "Select status..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>
                  <CommandGroup>
                    {mockData.mockPropertyStatuses.map((status: any) => (
                      <CommandItem
                        key={status.id}
                        value={status.name}
                        onSelect={() => {
                          handleUpdatePropertyItem(item.id, 'property_status', status.id);
                          toggleOpen('propertyStatus');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", item.property_status === status.id ? "opacity-100" : "opacity-0")} />
                        {status.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Next of Kin */}
        <div className="space-y-2">
          <Label>Next of Kin</Label>
          <Popover open={openStates.nextOfKin} onOpenChange={() => toggleOpen('nextOfKin')}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                {item.next_of_kin && item.next_of_kin !== 'none'
                  ? mockData.mockNextOfKin.find((nok: any) => nok.id === item.next_of_kin)?.full_name + ' (' + mockData.mockNextOfKin.find((nok: any) => nok.id === item.next_of_kin)?.relationship + ')'
                  : "Select next of kin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No next of kin found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        handleUpdatePropertyItem(item.id, 'next_of_kin', 'none');
                        toggleOpen('nextOfKin');
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", item.next_of_kin === 'none' ? "opacity-100" : "opacity-0")} />
                      None
                    </CommandItem>
                    {mockData.mockNextOfKin.map((nok: any) => (
                      <CommandItem
                        key={nok.id}
                        value={nok.full_name + ' ' + nok.relationship}
                        onSelect={() => {
                          handleUpdatePropertyItem(item.id, 'next_of_kin', nok.id);
                          toggleOpen('nextOfKin');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", item.next_of_kin === nok.id ? "opacity-100" : "opacity-0")} />
                        {nok.full_name} ({nok.relationship})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label>Destination</Label>
          <Input
            type="text"
            value={item.destination}
            onChange={(e) => handleUpdatePropertyItem(item.id, 'destination', e.target.value)}
            placeholder="Enter destination"
          />
        </div>

        {/* Note */}
        <div className="space-y-2 md:col-span-2">
          <Label>Notes</Label>
          <Textarea
            value={item.note}
            onChange={(e) => handleUpdatePropertyItem(item.id, 'note', e.target.value)}
            placeholder="Enter any additional notes"
            rows={2}
          />
        </div>
      </div>
    </Card>
  );
};

// Edit mode form component (existing single-item form)
const EditModeForm = ({ formData, setFormData, ...mockData }: any) => {
  // This component should contain all the existing form fields from the original PropertyForm
  // For now, this is a placeholder - the actual implementation will be in the main file
  return <div>Edit mode form fields go here</div>;
};

export default PropertyFormNew;
