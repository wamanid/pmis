import { RouteObject } from 'react-router-dom';
import TransferScreen from '../components/transfer/TransferScreen';
import TransferInOutBulkScreen from '../components/transfer/TransferInOutBulkScreen';
import TransferRequestScreen from '../components/transfer/TransferRequestScreen';
import { TransferOverview } from '../components/transfer/TransferOverview-new';


export const transferRoutes: RouteObject[] = [
  {
    path: '/transfer/TransferOverview-new',
    element: <TransferOverview />,
  },
    {
    path: '/transfer/TransferScreen',
    element: <TransferScreen />,
  },
  {
    path: '/transfer/TransferRequestScreen',
    element: <TransferRequestScreen />,
  },
  {
    path: '/transfer/TransferInOutBulkScreen',
    element: <TransferInOutBulkScreen />,
  },
];