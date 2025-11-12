import { useEffect } from 'react';

/**
 * Custom hook to automatically refetch data when filters change
 * 
 * @param refetchCallback - Function to call when filters change
 * @param dependencies - Optional dependencies array (like useEffect)
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [data, setData] = useState([]);
 * 
 *   const loadData = async () => {
 *     const response = await axiosInstance.get('/api/data');
 *     setData(response.data);
 *   };
 * 
 *   // Load data on mount and when filters change
 *   useFilterRefresh(loadData);
 * 
 *   return <div>{data.map(...)}</div>;
 * }
 * ```
 */
export function useFilterRefresh(
  refetchCallback: () => void | Promise<void>,
  dependencies: any[] = []
) {
  useEffect(() => {
    // Call on mount
    refetchCallback();

    // Listen for filter changes
    const handleFilterChange = () => {
      refetchCallback();
    };

    window.addEventListener('filterChanged', handleFilterChange);

    return () => {
      window.removeEventListener('filterChanged', handleFilterChange);
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
}
