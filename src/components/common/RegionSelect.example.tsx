import { useState } from 'react';
import { RegionSelect } from './RegionSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

/**
 * Example usage of the RegionSelect component
 * 
 * This file demonstrates how to use the RegionSelect component
 * in different scenarios.
 */

// Example 1: Basic usage with controlled state
export function BasicRegionSelectExample() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Region Select</CardTitle>
        <CardDescription>
          Simple region selector with controlled state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <RegionSelect
            value={selectedRegion}
            onValueChange={setSelectedRegion}
            placeholder="Select a region..."
          />
        </div>
        {selectedRegion && (
          <div className="text-sm text-muted-foreground">
            Selected Region ID: <code className="font-mono">{selectedRegion}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 2: Form integration
export function FormRegionSelectExample() {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(`Form submitted with region: ${formData.region}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Integration</CardTitle>
        <CardDescription>
          Region selector integrated in a form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter name..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <RegionSelect
              value={formData.region}
              onValueChange={(value) => setFormData({ ...formData, region: value })}
              placeholder="Select region..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            disabled={!formData.region}
          >
            Submit
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

// Example 3: Disabled state
export function DisabledRegionSelectExample() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disabled State</CardTitle>
        <CardDescription>
          Toggle the disabled state of the region selector
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="disable-toggle"
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="disable-toggle">Disable region selector</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region-disabled">Region</Label>
          <RegionSelect
            value={selectedRegion}
            onValueChange={setSelectedRegion}
            placeholder="Select a region..."
            disabled={isDisabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Example 4: Multiple selectors
export function MultipleRegionSelectExample() {
  const [primaryRegion, setPrimaryRegion] = useState<string>('');
  const [secondaryRegion, setSecondaryRegion] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multiple Region Selectors</CardTitle>
        <CardDescription>
          Use multiple region selectors in the same form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary-region">Primary Region</Label>
          <RegionSelect
            value={primaryRegion}
            onValueChange={setPrimaryRegion}
            placeholder="Select primary region..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-region">Secondary Region</Label>
          <RegionSelect
            value={secondaryRegion}
            onValueChange={setSecondaryRegion}
            placeholder="Select secondary region..."
          />
        </div>

        {(primaryRegion || secondaryRegion) && (
          <div className="p-4 bg-muted rounded-md space-y-1">
            <p className="text-sm font-medium">Selected Regions:</p>
            {primaryRegion && (
              <p className="text-sm text-muted-foreground">
                Primary: <code className="font-mono">{primaryRegion}</code>
              </p>
            )}
            {secondaryRegion && (
              <p className="text-sm text-muted-foreground">
                Secondary: <code className="font-mono">{secondaryRegion}</code>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 5: All examples in one demo page
export function RegionSelectDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">RegionSelect Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          Interactive examples showing the RegionSelect component with various configurations.
        </p>
      </div>

      <BasicRegionSelectExample />
      <FormRegionSelectExample />
      <DisabledRegionSelectExample />
      <MultipleRegionSelectExample />
    </div>
  );
}
