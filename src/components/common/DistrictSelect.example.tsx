import { useState } from 'react';
import { RegionSelect } from './RegionSelect';
import { DistrictSelect } from './DistrictSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

/**
 * Example usage of the DistrictSelect component
 * 
 * This file demonstrates how to use the DistrictSelect component
 * in different scenarios, especially with RegionSelect.
 */

// Example 1: Basic usage with Region and District
export function BasicDistrictSelectExample() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Clear district when region changes
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedDistrict(''); // Reset district when region changes
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Region & District Selection</CardTitle>
        <CardDescription>
          Select a region first, then choose a district from that region
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="region">Region *</Label>
          <RegionSelect
            value={selectedRegion}
            onValueChange={handleRegionChange}
            placeholder="Select a region..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <DistrictSelect
            value={selectedDistrict}
            onValueChange={setSelectedDistrict}
            regionId={selectedRegion}
            placeholder="Select a district..."
          />
          {!selectedRegion && (
            <p className="text-xs text-muted-foreground">
              Please select a region first
            </p>
          )}
        </div>

        {selectedRegion && selectedDistrict && (
          <div className="p-4 bg-muted rounded-md space-y-1">
            <p className="text-sm font-medium">Selected:</p>
            <p className="text-sm text-muted-foreground">
              Region ID: <code className="font-mono">{selectedRegion}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              District ID: <code className="font-mono">{selectedDistrict}</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 2: Form integration with validation
export function FormDistrictSelectExample() {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    district: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegionChange = (value: string) => {
    setFormData({ ...formData, region: value, district: '' });
    setErrors({ ...errors, region: '', district: '' });
  };

  const handleDistrictChange = (value: string) => {
    setFormData({ ...formData, district: value });
    setErrors({ ...errors, district: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.district) newErrors.district = 'District is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Form</CardTitle>
        <CardDescription>
          Form with region and district selection and validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="Enter name..."
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <RegionSelect
              value={formData.region}
              onValueChange={handleRegionChange}
              placeholder="Select region..."
            />
            {errors.region && (
              <p className="text-xs text-red-600">{errors.region}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <DistrictSelect
              value={formData.district}
              onValueChange={handleDistrictChange}
              regionId={formData.region}
              placeholder="Select district..."
            />
            {errors.district && (
              <p className="text-xs text-red-600">{errors.district}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter address..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Submit
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

// Example 3: Multiple district selections
export function MultipleDistrictSelectExample() {
  const [region1, setRegion1] = useState<string>('');
  const [district1, setDistrict1] = useState<string>('');
  const [region2, setRegion2] = useState<string>('');
  const [district2, setDistrict2] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multiple Location Selection</CardTitle>
        <CardDescription>
          Select primary and secondary locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Primary Location</h3>
          <div className="space-y-2">
            <Label>Region</Label>
            <RegionSelect
              value={region1}
              onValueChange={(value) => {
                setRegion1(value);
                setDistrict1('');
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <DistrictSelect
              value={district1}
              onValueChange={setDistrict1}
              regionId={region1}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Secondary Location</h3>
          <div className="space-y-2">
            <Label>Region</Label>
            <RegionSelect
              value={region2}
              onValueChange={(value) => {
                setRegion2(value);
                setDistrict2('');
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <DistrictSelect
              value={district2}
              onValueChange={setDistrict2}
              regionId={region2}
            />
          </div>
        </div>

        {(district1 || district2) && (
          <div className="p-4 bg-muted rounded-md space-y-2">
            <p className="text-sm font-medium">Selected Locations:</p>
            {district1 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Primary:</p>
                <p>Region: <code>{region1}</code></p>
                <p>District: <code>{district1}</code></p>
              </div>
            )}
            {district2 && (
              <div className="text-sm text-muted-foreground mt-2">
                <p className="font-medium">Secondary:</p>
                <p>Region: <code>{region2}</code></p>
                <p>District: <code>{district2}</code></p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 4: Disabled state
export function DisabledDistrictSelectExample() {
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disabled State</CardTitle>
        <CardDescription>
          Toggle the disabled state of the district selector
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
          <Label htmlFor="disable-toggle">Disable selectors</Label>
        </div>

        <div className="space-y-2">
          <Label>Region</Label>
          <RegionSelect
            value={region}
            onValueChange={(value) => {
              setRegion(value);
              setDistrict('');
            }}
            disabled={isDisabled}
          />
        </div>

        <div className="space-y-2">
          <Label>District</Label>
          <DistrictSelect
            value={district}
            onValueChange={setDistrict}
            regionId={region}
            disabled={isDisabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Example 5: All examples in one demo page
export function DistrictSelectDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">DistrictSelect Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          Interactive examples showing the DistrictSelect component with RegionSelect integration.
        </p>
      </div>

      <BasicDistrictSelectExample />
      <FormDistrictSelectExample />
      <MultipleDistrictSelectExample />
      <DisabledDistrictSelectExample />
    </div>
  );
}
