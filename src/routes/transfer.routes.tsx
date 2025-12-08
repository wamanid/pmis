import { RouteObject } from 'react-router-dom';
import TransferScreen from '../components/transfer/TransferScreen';
import TransferList from '../components/transfer/TransferList';
import TransferInOutBulkScreen from '../components/transfer/TransferInOutBulkScreen';

export const transferRoutes: RouteObject[] = [
  {
    path: '/transfer-management/TransferScreen',
    element: <TransferScreen />,
  },
  {
    path: '/transfer-management/TransferInOut',
    element: <TransferList />,
  },
  {
    path: '/transfer-management/TransferInOutBulk',
    element: <TransferInOutBulkScreen />,
  },
];