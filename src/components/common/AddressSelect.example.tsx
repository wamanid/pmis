/**
 * AddressSelect Component Usage Examples
 * 
 * This file demonstrates various ways to use the AddressSelect component
 * for hierarchical location selection.
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AddressSelect } from './AddressSelect';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// ============================================================================
// Example 1: Basic Usage with useState
// ============================================================================
export function BasicAddressExample() {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [parish, setParish] = useState('');
  const [village, setVillage] = useState('');

  const handleSubmit = () => {
    console.log('Address:', {
      region,
      district,
      county,
      subCounty,
      parish,
      village,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Address Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressSelect
          region={region}
          district={district}
          county={county}
          subCounty={subCounty}
          parish={parish}
          village={village}
          onRegionChange={setRegion}
          onDistrictChange={setDistrict}
          onCountyChange={setCounty}
          onSubCountyChange={setSubCounty}
          onParishChange={setParish}
          onVillageChange={setVillage}
        />
        <div className="mt-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 2: With React Hook Form
// ============================================================================
interface AddressFormData {
  region: string;
  district: string;
  county: string;
  sub_county: string;
  parish: string;
  village: string;
}

export function ReactHookFormAddressExample() {
  const { control, handleSubmit, watch, setValue } = useForm<AddressFormData>({
    defaultValues: {
      region: '',
      district: '',
      county: '',
      sub_county: '',
      parish: '',
      village: '',
    },
  });

  const region = watch('region');
  const district = watch('district');
  const county = watch('county');
  const subCounty = watch('sub_county');
  const parish = watch('parish');
  const village = watch('village');

  const onSubmit = (data: AddressFormData) => {
    console.log('Form submitted:', data);
    // All fields will contain IDs
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address with React Hook Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AddressSelect
            region={region}
            district={district}
            county={county}
            subCounty={subCounty}
            parish={parish}
            village={village}
            onRegionChange={(value) => setValue('region', value)}
            onDistrictChange={(value) => setValue('district', value)}
            onCountyChange={(value) => setValue('county', value)}
            onSubCountyChange={(value) => setValue('sub_county', value)}
            onParishChange={(value) => setValue('parish', value)}
            onVillageChange={(value) => setValue('village', value)}
          />
          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 3: With Controller (Alternative React Hook Form approach)
// ============================================================================
export function ControllerAddressExample() {
  const { control, handleSubmit } = useForm<AddressFormData>();

  const onSubmit = (data: AddressFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address with Controller</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <AddressSelect
                region={field.value}
                onRegionChange={field.onChange}
                // Note: You'd need to manage other fields separately
                // This is why the watch/setValue approach is recommended
              />
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 4: Custom Grid Layout
// ============================================================================
export function CustomLayoutAddressExample() {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [parish, setParish] = useState('');
  const [village, setVillage] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address with 3-Column Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressSelect
          region={region}
          district={district}
          county={county}
          subCounty={subCounty}
          parish={parish}
          village={village}
          onRegionChange={setRegion}
          onDistrictChange={setDistrict}
          onCountyChange={setCounty}
          onSubCountyChange={setSubCounty}
          onParishChange={setParish}
          onVillageChange={setVillage}
          gridCols={3}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 5: Without Labels
// ============================================================================
export function NoLabelsAddressExample() {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [parish, setParish] = useState('');
  const [village, setVillage] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address without Labels</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressSelect
          region={region}
          district={district}
          county={county}
          subCounty={subCounty}
          parish={parish}
          village={village}
          onRegionChange={setRegion}
          onDistrictChange={setDistrict}
          onCountyChange={setCounty}
          onSubCountyChange={setSubCounty}
          onParishChange={setParish}
          onVillageChange={setVillage}
          showLabels={false}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 6: Disabled State
// ============================================================================
export function DisabledAddressExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disabled Address Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressSelect
          region="some-region-id"
          district="some-district-id"
          disabled={true}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 7: Reverse Cascade Demo
// ============================================================================
export function ReverseCascadeExample() {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [parish, setParish] = useState('');
  const [village, setVillage] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reverse Cascade Demo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Try selecting a village first - watch how all parent fields automatically populate!
        </p>
      </CardHeader>
      <CardContent>
        <AddressSelect
          region={region}
          district={district}
          county={county}
          subCounty={subCounty}
          parish={parish}
          village={village}
          onRegionChange={setRegion}
          onDistrictChange={setDistrict}
          onCountyChange={setCounty}
          onSubCountyChange={setSubCounty}
          onParishChange={setParish}
          onVillageChange={setVillage}
          enableReverseCascade={true}
        />
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Selected Values:</h4>
          <div className="space-y-1 text-sm">
            <p>Region: {region || 'Not selected'}</p>
            <p>District: {district || 'Not selected'}</p>
            <p>County: {county || 'Not selected'}</p>
            <p>Sub-County: {subCounty || 'Not selected'}</p>
            <p>Parish: {parish || 'Not selected'}</p>
            <p>Village: {village || 'Not selected'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 8: Integration in PrisonerBioDataForm
// ============================================================================
export function PrisonerBioDataFormIntegration() {
  const { watch, setValue } = useForm();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Birth Place Address</h3>
      <AddressSelect
        region={watch('birth_place_region')}
        district={watch('birth_place_district')}
        county={watch('birth_place_county')}
        subCounty={watch('birth_place_sub_county')}
        parish={watch('birth_place_parish')}
        village={watch('birth_place_village')}
        onRegionChange={(value) => setValue('birth_place_region', value)}
        onDistrictChange={(value) => setValue('birth_place_district', value)}
        onCountyChange={(value) => setValue('birth_place_county', value)}
        onSubCountyChange={(value) => setValue('birth_place_sub_county', value)}
        onParishChange={(value) => setValue('birth_place_parish', value)}
        onVillageChange={(value) => setValue('birth_place_village', value)}
      />

      <h3 className="text-lg font-semibold">Home Address</h3>
      <AddressSelect
        region={watch('home_address_region')}
        district={watch('home_address_district')}
        county={watch('home_address_county')}
        subCounty={watch('home_address_sub_county')}
        parish={watch('home_address_parish')}
        village={watch('home_address_village')}
        onRegionChange={(value) => setValue('home_address_region', value)}
        onDistrictChange={(value) => setValue('home_address_district', value)}
        onCountyChange={(value) => setValue('home_address_county', value)}
        onSubCountyChange={(value) => setValue('home_address_sub_county', value)}
        onParishChange={(value) => setValue('home_address_parish', value)}
        onVillageChange={(value) => setValue('home_address_village', value)}
      />
    </div>
  );
}
