import { useState } from 'react';
import { RegionSelect } from './RegionSelect';
import { DistrictSelect } from './DistrictSelect';
import { StationSelect } from './StationSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { StationDetail } from '../station/StationDetail';

/**
 * Example usage of the StationSelect component
 * 
 * This file demonstrates how to use the StationSelect component
 * in different scenarios, especially with RegionSelect and DistrictSelect.
 */

// Example 1: Basic usage with Region, District, and Station
export function BasicStationSelectExample() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<string>('');

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedDistrict('');
    setSelectedStation('');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedStation('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Selection</CardTitle>
        <CardDescription>
          Select region, district, and station in sequence
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
            onValueChange={handleDistrictChange}
            regionId={selectedRegion}
            placeholder="Select a district..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="station">Station *</Label>
          <StationSelect
            value={selectedStation}
            onValueChange={setSelectedStation}
            regionId={selectedRegion}
            districtId={selectedDistrict}
            placeholder="Select a station..."
          />
        </div>

        {selectedStation && (
          <div className="p-4 bg-muted rounded-md space-y-1">
            <p className="text-sm font-medium">Selected:</p>
            <p className="text-sm text-muted-foreground">
              Region: <code className="font-mono">{selectedRegion}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              District: <code className="font-mono">{selectedDistrict}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Station: <code className="font-mono">{selectedStation}</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 2: Station selection with filters
export function FilteredStationSelectExample() {
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [station, setStation] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtered Station Selection</CardTitle>
        <CardDescription>
          Station selector with region and district filters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Region</Label>
            <RegionSelect
              value={region}
              onValueChange={(value) => {
                setRegion(value);
                setDistrict('');
                setStation('');
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <DistrictSelect
              value={district}
              onValueChange={(value) => {
                setDistrict(value);
                setStation('');
              }}
              regionId={region}
            />
          </div>

          <div className="space-y-2">
            <Label>Station</Label>
            <StationSelect
              value={station}
              onValueChange={setStation}
              regionId={region}
              districtId={district}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Example 3: Station selection with detail view
export function StationWithDetailExample() {
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [station, setStation] = useState<string>('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Station Selection</CardTitle>
          <CardDescription>
            Select a station to view its details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <RegionSelect
                value={region}
                onValueChange={(value) => {
                  setRegion(value);
                  setDistrict('');
                  setStation('');
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>District</Label>
              <DistrictSelect
                value={district}
                onValueChange={(value) => {
                  setDistrict(value);
                  setStation('');
                }}
                regionId={region}
              />
            </div>

            <div className="space-y-2">
              <Label>Station</Label>
              <StationSelect
                value={station}
                onValueChange={setStation}
                regionId={region}
                districtId={district}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {station && (
        <StationDetail stationId={station} />
      )}
    </div>
  );
}

// Example 4: Form with station selection
export function StationFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    district: '',
    station: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegionChange = (value: string) => {
    setFormData({ ...formData, region: value, district: '', station: '' });
    setErrors({ ...errors, region: '', district: '', station: '' });
  };

  const handleDistrictChange = (value: string) => {
    setFormData({ ...formData, district: value, station: '' });
    setErrors({ ...errors, district: '', station: '' });
  };

  const handleStationChange = (value: string) => {
    setFormData({ ...formData, station: value });
    setErrors({ ...errors, station: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.station) newErrors.station = 'Station is required';

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
        <CardTitle>Station Assignment Form</CardTitle>
        <CardDescription>
          Form with complete location hierarchy
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
            />
            {errors.district && (
              <p className="text-xs text-red-600">{errors.district}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="station">Station *</Label>
            <StationSelect
              value={formData.station}
              onValueChange={handleStationChange}
              regionId={formData.region}
              districtId={formData.district}
            />
            {errors.station && (
              <p className="text-xs text-red-600">{errors.station}</p>
            )}
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
          >
            Submit
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

// Example 5: All examples in one demo page
export function StationSelectDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">StationSelect Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          Interactive examples showing the StationSelect component with various configurations.
        </p>
      </div>

      <BasicStationSelectExample />
      <FilteredStationSelectExample />
      <StationWithDetailExample />
      <StationFormExample />
    </div>
  );
}
