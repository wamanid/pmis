import { RouteObject } from 'react-router-dom';
import TransferScreen from '../components/transfer/TransferScreen';
import TransferInOutBulkScreen from '../components/transfer/TransferInOutBulkScreen';
import TransferRequestScreen from '../components/transfer/TransferRequestScreen';


export const transferRoutes: RouteObject[] = [
  {
    path: '/transfer-management/TransferScreen',
    element: <TransferScreen />,
  },
  {
    path: '/transfer-management/TransferRequestScreen',
    element: <TransferRequestScreen />,
  },
  {
    path: '/transfer-management/TransferInOutBulk',
    element: <TransferInOutBulkScreen />,
  },
];