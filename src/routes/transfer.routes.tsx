import { RouteObject } from 'react-router-dom';
import TransferScreen from '../components/transfer/TransferScreen';
import TransferInOutBulkScreen from '../components/transfer/TransferInOutBulkScreen';
import TransferRequestScreen from '../components/transfer/TransferRequestScreen';


export const transferRoutes: RouteObject[] = [
  {
    path: '/transfer/TransferScreen',
    element: <TransferScreen />,
  },
  {
    path: '/transfer/TransferRequestScreen',
    element: <TransferRequestScreen />,
  },
  {
    path: '/transfer/TransferInOutBulk',
    element: <TransferInOutBulkScreen />,
  },
];