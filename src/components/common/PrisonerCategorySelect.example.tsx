import { useState } from 'react';
import { PrisonerCategorySelect } from './PrisonerCategorySelect';

/**
 * Example usage of PrisonerCategorySelect component
 * This component fetches prisoner categories from /api/system-administration/prisoner-categories/
 */
export function PrisonerCategorySelectExample() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  return (
    <div className="space-y-6 p-6 max-w-md">
      <div>
        <h2 className="text-2xl font-bold mb-4">Prisoner Category Select</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a prisoner category from the dropdown. The component fetches data from the API
          and supports search functionality.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Prisoner Category
          </label>
          <PrisonerCategorySelect
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            placeholder="Select prisoner category..."
          />
        </div>

        {selectedCategory && (
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm font-medium">Selected Category ID:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {selectedCategory}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Component Props</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li><code>value</code>: Current selected category ID (string)</li>
          <li><code>onValueChange</code>: Callback when selection changes</li>
          <li><code>placeholder</code>: Placeholder text (default: "Select prisoner category...")</li>
          <li><code>disabled</code>: Disable the select (default: false)</li>
          <li><code>className</code>: Additional CSS classes</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">API Endpoint</h3>
        <p className="text-sm text-muted-foreground">
          <code className="bg-muted px-2 py-1 rounded">
            GET /api/system-administration/prisoner-categories/
          </code>
        </p>
        <p className="text-xs text-muted-foreground">
          Supports search and ordering query parameters
        </p>
      </div>
    </div>
  );
}

/**
 * Example: Using in a form with React Hook Form
 */
export function PrisonerCategoryFormExample() {
  const [formData, setFormData] = useState({
    prisonerName: '',
    categoryId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Form Integration Example</h2>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Prisoner Name
        </label>
        <input
          type="text"
          value={formData.prisonerName}
          onChange={(e) => setFormData({ ...formData, prisonerName: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter prisoner name"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Category <span className="text-red-500">*</span>
        </label>
        <PrisonerCategorySelect
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        disabled={!formData.categoryId}
      >
        Submit
      </button>
    </form>
  );
}
