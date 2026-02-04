import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge, badgeVariants } from '../ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTable";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import AmountInput from '../common/AmountInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import CustomPrisonerSearch from '../common/CustomPrisonerSearch';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  numericValidation
} from '../../utils/validation';
import { useForm, Controller } from 'react-hook-form';
import ConfirmDialog from '../common/ConfirmDialog';
import DateTime, { formatDateTime } from '../common/DateTime';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
  CURRENCIES: '/system-administration/currencies/',
  STAFF: '/auth/staff-profiles/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<any[]>([]);
  const [staffProfilesError, setStaffProfilesError] = useState<string | null>(null);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [txFilterType, setTxFilterType] = useState<string>('all');
  const [txFilterStatus, setTxFilterStatus] = useState<string>('all');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  // force remount AccountForm to reset its internal state when opening create/edit
  const [accountFormKey, setAccountFormKey] = useState(0);
  // force DataTable remount to trigger refetch after CRUD operations
  const [accountsTableKey, setAccountsTableKey] = useState(0);
  const [transactionsTableKey, setTransactionsTableKey] = useState(0);
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});

  // request control (no shared abort controller — rely on reqId to ignore stale responses)
  const reqId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // utility to deep clone safely
  const deepClone = (v: any) => {
    try { return (globalThis as any).structuredClone ? (globalThis as any).structuredClone(v) : JSON.parse(JSON.stringify(v)); }
    catch { try { return JSON.parse(JSON.stringify(v)); } catch { return v; } }
  };

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    // include transaction filters automatically when on transactions tab
    ...(activeTab === 'transactions' ? {
      transaction_type: txFilterType && txFilterType !== 'all' ? txFilterType : undefined,
      transaction_status: txFilterStatus && txFilterStatus !== 'all' ? txFilterStatus : undefined,
    } : {}),
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab, txFilterType, txFilterStatus]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes, curRes, staffRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
        axiosInstance.get(API_ENDPOINTS.CURRENCIES, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        // staff profiles is optional - catch network errors to avoid blocking UI
        axiosInstance.get(API_ENDPOINTS.STAFF, { params: { page_size: 200 }}).then(r => r.data).catch(err => { throw err; }),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
      // store full currency objects (id, code, name) so UI can show name while saving id
      setCurrencies(curRes?.results ?? []);
      // staff
      if (staffRes && staffRes.results) {
        setStaffProfiles(staffRes.results);
        setStaffProfilesError(null);
      } else {
        setStaffProfiles([]);
      }
    } catch (err:any) {
      console.error('lookup load error', err);
      // if staff fetch failed, set error but let UI continue
      if (String(err?.config?.url || '').includes(API_ENDPOINTS.STAFF)) {
        setStaffProfilesError('Failed to load staff list');
        setStaffProfiles([]);
      }
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    setAccountsLoading(true);
    try {
      console.debug('loadAccounts request', baseParams(opts));
      const data = await accountsSvc.listAccounts(baseParams(opts));
      console.debug('loadAccounts response', data);
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      console.debug('loadAccounts error', err);
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    setTransactionsLoading(true);
    try {
      console.debug('loadTransactions request', baseParams(opts));
      const data = await txSvc.listTransactions(baseParams(opts));
      console.debug('loadTransactions response', data);
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      console.debug('loadTransactions error', err);
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups and data load
  useEffect(() => { 
    loadLookups();
    // Load both accounts and transactions on mount since Accounts tab displays transaction statistics
    loadAccounts();
    loadTransactions();
  }, [loadLookups, loadAccounts, loadTransactions]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();
    const balanceValue = String(accountFormData.balance ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    // numericValidation pattern expects digits; adjust message accordingly
    if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // validate arbitrary form data shape (used by handlers that accept local-submitted data)
  const validateAccountData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!String(data.prisoner ?? '').trim()) errs.prisoner = 'Prisoner is required';
    if (!String(data.account_type ?? '').trim()) errs.account_type = 'Account type is required';
    if (!String(data.currency ?? '').trim()) errs.currency = 'Currency is required';
    const bal = String(data.balance ?? '').trim();
    if (!bal || !/^-?\d+(\.\d+)?$/.test(bal)) errs.balance = 'Balance must be a number';
    return errs;
  };

  const handleCreateAccount = async (dataOrEvent: any) => {
    // if called from old signature, fallback
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.createAccount({
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account created');
      // Reload accounts first to ensure table updates
      await loadAccounts();
      // Also reload transactions to update stats cards
      await loadTransactions();
      // Force DataTable remount to trigger refetch
      setAccountsTableKey(prev => prev + 1);
      setTransactionsTableKey(prev => prev + 1);
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
      setAccountFormErrors({});
      // Force form remount
      setAccountFormKey(prev => prev + 1);
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  // small wrapper to ensure success shows green background + white text and to centralize debug
  const StatusBadge: React.FC<{ status?: string | null; className?:string }> = ({ status, className }) => {
    const variant = getStatusVariant(status);
    // debug: uncomment if you need to see mapping in console
    // console.debug('StatusBadge', { status, variant });
    // Force the green bg for success in case styles are being overridden elsewhere
    const forceSuccess = variant === 'success' ? 'bg-green-500 text-white hover:bg-green-600' : '';
    return (
      <Badge variant={variant} className={cn(forceSuccess, className)}>
        {status || 'N/A'}
      </Badge>
    );
  };

  const getStatusVariant = (status?: string | null): BadgeVariant => {
    const sRaw = status ?? '';
    const s = String(sRaw).toLowerCase().trim();
    if (!s || s === 'n/a' || s === 'unknown') return 'outline';

    // Use the badge variants that match your theme / existing visuals.
    if (/(pending|awaiting|waiting)/i.test(s)) return 'secondary';
    if (/(approved|completed|success|paid|settled|done)/i.test(s)) return 'default';
    if (/(failed|rejected|declined|error|cancelled|canceled)/i.test(s)) return 'destructive';
    if (/(processing|in[_\s-]?progress|on[-\s]?going|ongoing)/i.test(s)) return 'info';
    if (/(hold|on[_\s-]?hold|warning)/i.test(s)) return 'warning';

    // fallback
    console.debug('getStatusVariant: unknown status string, falling back to outline', { status: sRaw });
    return 'outline';
  };

  const handleUpdateAccount = async (dataOrEvent: any) => {
    if (!selectedAccount) return;
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      const res = await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      console.debug('updateAccount response', res);
      toast.success('Account updated');
      // Reload both accounts and transactions to update table and stats
      await loadAccounts();
      await loadTransactions();
      // Force DataTable remount to trigger refetch
      setAccountsTableKey(prev => prev + 1);
      setTransactionsTableKey(prev => prev + 1);
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
      setAccountFormErrors({});
    } catch (err) {
      console.debug('updateAccount error', err);
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      console.debug('deleteAccount success', deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      // Reload both accounts and transactions to update table and stats
      await loadAccounts();
      await loadTransactions();
      // Force DataTable remount to trigger refetch
      setAccountsTableKey(prev => prev + 1);
      setTransactionsTableKey(prev => prev + 1);
    } catch (err) {
      console.debug('deleteAccount error', err);
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(data.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(data.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(data.amount)) errs.amount = 'Amount is required';
    if (!data.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
    return errs;
  };

  const handleCreateTransaction = async (values: any) => {
    const errs = validateTransactionData(values);
    if (Object.keys(errs).length) {
      setTransactionFormErrors(errs);
      return;
    }
    setTransactionFormErrors({});
    try {
      const res = await txSvc.createTransaction(values);
      console.debug('createTransaction response', res);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      // authoritative reload
      await loadTransactions();
      await loadAccounts();
      // Force DataTable remount to trigger refetch
      setTransactionsTableKey(prev => prev + 1);
      setAccountsTableKey(prev => prev + 1);
    } catch (err) {
      console.debug('createTransaction error', err);
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  // add update transaction handler
  const handleUpdateTransaction = async (dataOrEvent: any) => {
    // dataOrEvent is provided by TransactionForm (react-hook-form)
    const values = dataOrEvent && dataOrEvent.property_prisoner_account ? dataOrEvent : transactionFormData;
    const errs: Record<string,string> = {};
    if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
    if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
    if (!values.amount) errs.amount = 'Amount is required';
    if (!values.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
    if (Object.keys(errs).length) {
      setTransactionFormErrors(errs);
      return;
    }
    if (!selectedTransaction) return;
    try {
      const payload = {
        property_prisoner_account: values.property_prisoner_account,
        transaction_type: values.transaction_type,
        transaction_status: values.transaction_status || null,
        amount: values.amount,
        transaction_remark: values.transaction_remark,
        biometric_consent: !!values.biometric_consent,
        transaction_datetime: values.transaction_datetime,
        balance_before: values.balance_before,
        balance_after: values.balance_after,
        checked_by_oc: values.checked_by_oc,
      };
      const res = (typeof txSvc.updateTransaction === 'function')
        ? await txSvc.updateTransaction(selectedTransaction.id, payload)
        : (await axiosInstance.patch(`${API_ENDPOINTS.TRANSACTIONS}${selectedTransaction.id}/`, payload)).data;
      console.debug('updateTransaction response', res);
      toast.success('Transaction updated');
      setIsEditTransactionDialogOpen(false);
      setSelectedTransaction(null);
      // authoritative reloads
      await loadTransactions();
      await loadAccounts();
      // Force DataTable remount to trigger refetch
      setTransactionsTableKey(prev => prev + 1);
      setAccountsTableKey(prev => prev + 1);
    } catch (err) {
      console.debug('updateTransaction error', err);
      console.error('update tx error', err);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      if (typeof txSvc.deleteTransaction === 'function') {
        await txSvc.deleteTransaction(deleteTransactionId);
      } else {
        await axiosInstance.delete(`${API_ENDPOINTS.TRANSACTIONS}${deleteTransactionId}/`);
      }
      console.debug('deleteTransaction success', deleteTransactionId);
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      // authoritative reloads
      await loadTransactions();
      await loadAccounts();
      // Force DataTable remount to trigger refetch
      setTransactionsTableKey(prev => prev + 1);
      setAccountsTableKey(prev => prev + 1);
    } catch (err) {
      console.debug('deleteTransaction error', err);
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  
  // Helper to get currency text color for visual differentiation (Option B - text only)
  const getCurrencyColor = (currencyCode: string) => {
    const code = String(currencyCode).toUpperCase();
    const colorMap: Record<string, string> = {
      USD: '#166534',    // Green - US Dollar
      US: '#166534',     // Green - US (alternative)
      EUR: '#1e40af',    // Blue - Euro
      EURO: '#1e40af',   // Blue - Euro (alternative)
      GBP: '#6b21a8',    // Purple - British Pound
      UGX: '#9a3412',    // Orange - Uganda Shilling
      UGANDA: '#9a3412', // Orange - Uganda (alternative)
      KES: '#991b1b',    // Red - Kenyan Shilling
      KENYA: '#991b1b',  // Red - Kenya (alternative)
      TZS: '#155e75',    // Cyan - Tanzanian Shilling
      TANZANIA: '#155e75', // Cyan - Tanzania (alternative)
      RWF: '#3f6212',    // Lime - Rwandan Franc
      RWANDA: '#3f6212', // Lime - Rwanda (alternative)
    };
    return colorMap[code] || '#374151'; // Gray fallback
  };
  
  // Calculate balance per currency for multi-currency display
  const balanceByCurrency = useMemo(() => {
    const grouped: Record<string, { total: number; symbol: string; name: string }> = {};
    accounts.forEach(acc => {
      const currencyKey = acc.currency_name || acc.currency || 'Unknown';
      const symbol = acc.currency_symbol || '';
      const name = acc.currency_name || '';
      const balance = parseFloat(acc.balance || '0') || 0;
      
      if (!grouped[currencyKey]) {
        grouped[currencyKey] = { total: 0, symbol, name };
      }
      grouped[currencyKey].total += balance;
    });
    return grouped;
  }, [accounts]);
  
  // Format balance display for card (show top 3 currencies or primary)
  const formattedBalance = useMemo(() => {
    const entries = Object.entries(balanceByCurrency);
    if (entries.length === 0) return '0';
    if (entries.length === 1) {
      const [_, data] = entries[0];
      return `${data.symbol || ''} ${data.total.toLocaleString()}`;
    }
    // Show top 3 currencies by total value
    return entries
      .sort(([_, a], [__, b]) => b.total - a.total)
      .slice(0, 3)
      .map(([_, data]) => `${data.symbol || ''} ${data.total.toLocaleString()}`)
      .join(' | ');
  }, [balanceByCurrency]);
  
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;
  
  // Calculate transaction value per currency
  const transactionValueByCurrency = useMemo(() => {
    const grouped: Record<string, { total: number; symbol: string }> = {};
    transactions.forEach(tx => {
      const currencyKey = tx.currency_name || tx.currency || 'Unknown';
      const symbol = tx.currency_symbol || '';
      const amount = parseFloat(tx.amount || '0') || 0;
      
      if (!grouped[currencyKey]) {
        grouped[currencyKey] = { total: 0, symbol };
      }
      grouped[currencyKey].total += amount;
    });
    return grouped;
  }, [transactions]);
  
  const formattedTransactionValue = useMemo(() => {
    const entries = Object.entries(transactionValueByCurrency);
    if (entries.length === 0) return '0';
    if (entries.length === 1) {
      const [_, data] = entries[0];
      return `${data.symbol || ''} ${Math.abs(data.total).toLocaleString()}`;
    }
    return entries
      .sort(([_, a], [__, b]) => Math.abs(b.total) - Math.abs(a.total))
      .slice(0, 3)
      .map(([_, data]) => `${data.symbol || ''} ${Math.abs(data.total).toLocaleString()}`)
      .join(' | ');
  }, [transactionValueByCurrency]);

  // helper to render currency label (show code/name in UI, save uuid)
  const getCurrencyLabel = (val?: string) => {
    if (!val) return '';
    const found = currencies.find((c:any) => String(c.id) === String(val) || String(c.code ?? '').toUpperCase() === String(val).toUpperCase());
    if (found) return found.name ? `${found.code ?? ''} — ${found.name}` : (found.code ?? String(found.id));
    // fallback: if val looks like uppercase code return it else return raw
    return String(val);
  };

  // helper to render checked_by name using staffProfiles fallback to API name
  const getCheckedByName = (val?: string | number, fallbackName?: string) => {
    if (!val && !fallbackName) return '';
    const found = staffProfiles.find((s:any) => String(s.id) === String(val) || String(s.user)?.toLowerCase() === String(val)?.toLowerCase() || String(s.id) === String(fallbackName));
    if (found) return found.full_name ?? found.name ?? String(found.id);
    return fallbackName ?? String(val ?? '');
  };

  // Columns for DataTable
  const accountColumns = [
    { 
      key: 'prisoner_name', 
      label: 'Prisoner',
      render: (v: any, r: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{v}</span>
          {r.prisoner_number && <span className="text-xs text-gray-500">{r.prisoner_number}</span>}
        </div>
      )
    },
    { 
      key: 'account_type_name', 
      label: 'Account Type',
      render: (v: any) => <Badge variant="outline" className="font-normal">{v}</Badge>
    },
    { 
      key: 'currency_name', 
      label: 'Currency', 
      render: (_v: any, r: any) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{r.currency_symbol || r.currency_name}</span>
          <span className="text-xs text-gray-500">{r.currency_name}</span>
        </div>
      )
    },
    { 
      key: 'balance', 
      label: 'Balance', 
      render: (v: any, r: any) => {
        const balance = parseFloat(r.balance || '0');
        const isNegative = balance < 0;
        return (
          <div className="flex items-center gap-1">
            <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
              {r.currency_symbol || ''} {Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {isNegative && <Badge variant="destructive" className="text-xs">Overdrawn</Badge>}
          </div>
        );
      }
    },
    {
      key: 'created_datetime',
      label: 'Registered',
      render: (v: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-gray-400" />
          <DateTime value={v} format="dMY" />
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (v: any) => (
        <Badge variant={v ? 'default' : 'secondary'}>
          {v ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => {
            setSelectedAccount(r);
            setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency, balance: r.balance ?? '0' });
            setAccountFormKey(k => k + 1);
            setIsViewAccountDialogOpen(true);
          }}>
           <Eye className="h-4 w-4" />
         </Button>

        <Button variant="ghost" size="sm" onClick={() => {
            const copy = deepClone(r);
            setSelectedAccount(copy);
            setAccountFormData({ prisoner: copy.prisoner, account_type: copy.account_type, currency: copy.currency, balance: copy.balance ?? '0' });
            setAccountFormKey(k => k + 1);
            setIsEditAccountDialogOpen(true);
          }}>
           <Pencil className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setDeleteAccountId(r.id); }}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    {
      key: "transaction_datetime",
      label: "Date & Time",
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <DateTime value={value} format="dMYT" />
        </div>
      ),
    },
    { 
      key: 'prisoner_name', 
      label: 'Prisoner',
      render: (v: any, r: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{v}</span>
          {r.prisoner_number && <span className="text-xs text-gray-500">{r.prisoner_number}</span>}
        </div>
      )
    },
    {
      key: "account_type_name",
      label: "Account Type",
      render: (value: any) => (
        <Badge variant="outline" className="font-normal">{value}</Badge>
      ),
    },
    {
      key: "transaction_type_name",
      label: "Type",
      render: (value: any, r: any) => (
        <div className="flex items-center gap-2">
          <Badge variant={r.is_credit ? 'default' : 'secondary'}>
            {r.is_credit ? '📥 Credit' : '📤 Debit'}
          </Badge>
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      render: (v: any, r: any) => {
        const amount = parseFloat(r.amount || '0');
        const isPositive = amount >= 0;
        return (
          <div className="flex flex-col">
            <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{r.currency_symbol || ''} {Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-500">{r.currency_name || ''}</span>
          </div>
        );
      }
    },
    {
      key: 'balance_before',
      label: 'Balance Before',
      render: (v: any, r: any) => (
        <span className="text-sm text-gray-600">
          {r.currency_symbol || ''} {parseFloat(v || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'balance_after',
      label: 'Balance After',
      render: (v: any, r: any) => {
        const balance = parseFloat(v || '0');
        return (
          <span className={`text-sm font-medium ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {r.currency_symbol || ''} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
    },
    {
      key: "transaction_status_name",
      label: "Status",
      render: (value: any) => (
        <Badge variant={getStatusVariant(value)}>{value}</Badge>
      ),
    },
    { 
      key: 'biometric_consent', 
      label: 'Verified',
      render: (v: any) => (
        <div className="flex items-center gap-1">
          {v ? (
            <Badge variant="default">✓ Biometric</Badge>
          ) : (
            <Badge variant="outline">Manual</Badge>
          )}
        </div>
      )
    },
    { 
      key: 'checked_by_name', 
      label: 'Checked By',
      render: (v: any) => (
        <span className="text-sm">{v || <span className="text-gray-400">Not checked</span>}</span>
      )
    },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate text-sm">{v || <span className="text-gray-400">-</span>}</div> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v:any, r:any) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => {
            const copy = deepClone(r);
            setSelectedTransaction(copy);
            // populate form data for editing (use cloned values)
            setTransactionFormData({
              property_prisoner_account: copy.property_prisoner_account,
              transaction_type: copy.transaction_type,
              transaction_status: copy.transaction_status,
              amount: copy.amount,
              transaction_remark: copy.transaction_remark,
              biometric_consent: copy.biometric_consent,
              checked_by_oc: copy.checked_by_oc ?? '',
              transaction_datetime: copy.transaction_datetime ?? new Date().toISOString(),
              balance_before: copy.balance_before ?? '',
              balance_after: copy.balance_after ?? '',
            });
            setIsEditTransactionDialogOpen(true);
          }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setDeleteTransactionId(r.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
        </div>
      )
    },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (dataOrEvent: any) => void; isEdit: boolean }) => {
    // local form state to avoid re-rendering parent on every keypress (prevents caret loss)
    const [local, setLocal] = useState({
      prisoner: accountFormData.prisoner || '',
      account_type: accountFormData.account_type || '',
      // keep empty default so placeholder renders; will map to uuid when currencies load
      currency: accountFormData.currency ?? '',
      balance: accountFormData.balance ?? '0',
    });
    // Sync prisoner, account_type and balance from parent when accountFormData changes (used when opening edit/view).
    // Do not overwrite currency here (currency mapping effect handles id lookup).
    useEffect(() => {
      setLocal(prev => ({
        prisoner: accountFormData.prisoner ?? prev.prisoner,
        account_type: accountFormData.account_type ?? prev.account_type,
        currency: prev.currency,
        balance: accountFormData.balance ?? prev.balance,
      }));
    // only run when parent-provided values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountFormData.prisoner, accountFormData.account_type, accountFormData.balance]);

    // Compute the Select value deterministically:
    // prefer local.currency (user edits). If empty, map accountFormData.currency (which may be code or id)
    // to the currency UUID from currencies list so Select always has a matching option value.
    const selectedCurrencyId = useMemo(() => {
      if (local.currency) return String(local.currency);
      const parentCur = accountFormData.currency;
      if (!parentCur) return '';
      if (!currencies || currencies.length === 0) return String(parentCur);
      const found = currencies.find((x:any) =>
        String(x.id) === String(parentCur) ||
        String(x.code ?? '').toUpperCase() === String(parentCur).toUpperCase()
      );
      return found ? String(found.id) : String(parentCur);
    }, [local.currency, accountFormData.currency, currencies]);

    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');
    const [balanceEditable, setBalanceEditable] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    // removed local prisoner search — using CustomPrisonerSearch (reusable) which handles searching/fetching

    const validateLocal = () => {
      const e: Record<string,string> = {};
      if (!String(local.prisoner || '').trim()) e.prisoner = 'Prisoner is required';
      if (!String(local.account_type || '').trim()) e.account_type = 'Account type is required';
      // balance must be numeric (allow negative and decimals). empty -> treat as 0
      if (!String(local.balance || '').trim() || !/^-?\d+(\.\d+)?$/.test(String(local.balance).trim())) e.balance = 'Balance must be a number';
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const submit = (ev?: React.FormEvent) => {
      ev?.preventDefault();
      if (!validateLocal()) return;
      onSubmit({
        prisoner: String(local.prisoner),
        account_type: String(local.account_type),
        currency: String(local.currency),
        balance: String(local.balance || '0'),
      });
    };

    return (
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* prisoner picker (same UI as before) */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner <span className="text-red-500">*</span></Label>
            <CustomPrisonerSearch
              value={local.prisoner || null}
              onChange={(val) => setLocal(prev => ({ ...prev, prisoner: String(val ?? '') }))}
              onSelectItem={(item:any) => {
                setSelectedPrisonerName(item.full_name ?? item.name ?? '');
                setLocal(prev => ({ ...prev, prisoner: String(item.id) }));
              }}
              placeholder="Search prisoner..."
              pageSize={50}
              initialItems={prisoners}
            />
            {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
          </div>

          {/* account type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type <span className="text-red-500">*</span></Label>
            <Select value={local.account_type} onValueChange={(v)=> setLocal(prev => ({ ...prev, account_type: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2"><Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} /></div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase())).map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.account_type && <div className="text-red-600 text-sm">{errors.account_type}</div>}
          </div>

          {/* Currency (searchable select) */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency <span className="text-red-500">*</span></Label>
            <Select value={selectedCurrencyId} onValueChange={(v)=> setLocal(prev => ({ ...prev, currency: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                </div>
                {(currencies || []).filter((c:any) => {
                  const code = (c.code ?? '').toString();
                  const name = (c.name ?? '').toString();
                  return !currencyQuery || code.toLowerCase().includes(currencyQuery.toLowerCase()) || name.toLowerCase().includes(currencyQuery.toLowerCase());
                }).map((c:any) => {
                  const id = String(c.id);
                  const label = c.name ? `${c.code ?? ''} — ${c.name}` : (c.code ?? id);
                  return <SelectItem key={id} value={id}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            {errors.currency && <div className="text-red-600 text-sm mt-1">{errors.currency}</div>}
          </div>

          {/* Balance (disabled by default, toggle to enable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance">Balance</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit balance" checked={balanceEditable} onChange={(e) => setBalanceEditable(e.target.checked)} />
                Edit
              </label>
            </div>
            <AmountInput
              id="balance"
              currency={local.currency}
              className="disabled:opacity-25 input-invalid file:text-foreground dark:bg-input/30 w-full min-w-0 rounded-md px-3 py-1 bg-input-background transition-[color,box-shadow] outline-none"
              value={local.balance}
              onChange={(v) => setLocal(prev => ({ ...prev, balance: v }))}
              placeholder="0"
              disabled={!balanceEditable}
            />
            {errors.balance && <div className="text-red-600 text-sm mt-1">{errors.balance}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateAccountDialogOpen(false); setIsEditAccountDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>{isEdit ? 'Update' : 'Create'} Account</Button>
        </DialogFooter>
      </form>
    );
  };

  // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
      mode: "onTouched",
      defaultValues: {
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        // keep transaction_datetime as full ISO string (backend expects Z)
        transaction_datetime: new Date().toISOString(),
        balance_before: '',
        balance_after: '',
        checked_by_oc: transactionFormData.checked_by_oc ?? '',
      }
    });

    // keep balance_before in sync when account changes
    const selectedAccountId = watch('property_prisoner_account');
    const amountValue = watch('amount');
    useEffect(() => {
      if (!selectedAccountId) {
        setValue('balance_before', '');
        setValue('balance_after', '');
        return;
      }
      const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
      const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
      setValue('balance_before', String(before));
      const amountNum = parseFloat(String(amountValue || '0')) || 0;
      setValue('balance_after', String(before + amountNum));
    }, [selectedAccountId, amountValue, accounts, setValue]);

    // datetime editing state: disabled by default, value in form is ISO string
    const [dtEditable, setDtEditable] = useState(false);
    // maintain local datetime-local string for editing UI
    const currentIso = watch('transaction_datetime') || new Date().toISOString();
    const isoToLocal = (iso:string) => {
      try {
        const d = new Date(iso);
        // datetime-local expects "YYYY-MM-DDTHH:mm"
        return d.toISOString().slice(0,16);
      } catch { return ''; }
    };
    const [localDt, setLocalDt] = useState(isoToLocal(currentIso));
    // keep localDt synced when form value changes externally (but not while editing)
    useEffect(() => {
      if (!dtEditable) setLocalDt(isoToLocal(currentIso));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIso, dtEditable]);

    // Reset form values whenever transactionFormData changes (ensures useForm fields use updated cloned data)
    useEffect(() => {
      try { reset({
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        transaction_datetime: transactionFormData.transaction_datetime || new Date().toISOString(),
        balance_before: transactionFormData.balance_before || '',
        balance_after: transactionFormData.balance_after || '',
        checked_by_oc: transactionFormData.checked_by_oc ?? '',
      }); } catch (e) { /* ignore */ }
    }, [transactionFormData, reset]);

    const onSubmitForm = async (values: any) => {
      // delegate create/update to parent handler passed via props.onSubmit
      try {
        await onSubmit(values);
        // if parent didn't close/reset, ensure local form resets for create case
        if (!isEdit) reset();
      } catch (err) {
        // parent shows toast; keep error here for debug
        console.error('Transaction submit error', err);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account <span className="text-red-500">*</span></Label>
            <Controller control={control} name="property_prisoner_account" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input placeholder="Filter accounts..." onChange={() => {}} />
                  </div>
                  {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          {/* Display selected account currency (read-only, not submitted) */}
          <div className="space-y-2">
            <Label>Account Currency</Label>
            <Input value={(() => {
              const acc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              return acc ? getCurrencyLabel(acc.currency) : '';
            })()} disabled />
          </div>

          <div className="space-y-2">
            <Label>Transaction Type <span className="text-red-500">*</span></Label>
            <Controller control={control} name="transaction_type" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                <SelectContent>
                  {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller control={control} name="transaction_status" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Amount <span className="text-red-500">*</span></Label>
            <Controller control={control} name="amount" rules={{ required: true, pattern: /^-?\d+(\.\d+)?$/ }} render={({ field }) => {
              const selAcc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              const selCurrency = selAcc?.currency ?? 'UGX';
              return (
                <AmountInput
                  value={field.value ?? ''}
                  className="disabled:opacity-25 input-invalid file:text-foreground dark:bg-input/30 w-full min-w-0 rounded-md px-3 py-1 bg-input-background transition-[color,box-shadow] outline-none"
                  onChange={(v) => field.onChange(v)}
                  currency={selCurrency}
                  placeholder="Enter amount"
                />
              );
            }} />
            {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Transaction Date & Time</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit transaction datetime" checked={dtEditable} onChange={(e) => {
                  const next = e.target.checked;
                  setDtEditable(next);
                  // if disabling, write back current localDt as ISO to form (keeps sync)
                  if (!next) {
                    const iso = new Date(localDt).toISOString();
                    setValue('transaction_datetime', iso);
                  }
                }} />
                Edit
              </label>
            </div>
            {!dtEditable ? (
              // display-only formatted local datetime (not editable)
              <Input type="text" value={localDt ? localDt.replace('T', ' ') : ''} disabled />
            ) : (
              <input
                type="datetime-local"
                className="w-full rounded-md px-3 py-1"
                value={localDt}
                onChange={(e) => {
                  setLocalDt(e.target.value);
                  // convert to ISO Z and set form value for submission
                  const iso = new Date(e.target.value).toISOString();
                  setValue('transaction_datetime', iso);
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Balance Before</Label>
            <Input type="text" {...register('balance_before')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Balance After</Label>
            <Input type="text" {...register('balance_after')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Checked By <span className="text-red-500">*</span></Label>
            <Controller control={control} name="checked_by_oc" rules={{ required: true }} render={({ field }) => (
              <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
            )} />
            {formState.errors.checked_by_oc && <div className="text-red-600 text-sm">Checked By is required</div>}
            {transactionFormErrors.checked_by_oc && <div className="text-red-600 text-sm">{transactionFormErrors.checked_by_oc}</div>}
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register('transaction_remark')} rows={3} />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Controller control={control} name="biometric_consent" render={({ field }) => (
              <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
            )} />
            <Label className="cursor-pointer">Biometric Consent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
        </DialogFooter>
      </form>
    );
  };

  // update transactionColumns Checked By render to use helper
  // find the column object for checked_by_name and replace its render:
  const updatedTransactionColumns = transactionColumns.map(col => {
    // if col.key === 'checked_by_name') {
    //   // prefer API-provided checked_by_name (v). fallback to staff lookup (checked_by_oc) or fallback value
    //   return { ...col, render: (v:any, r:any) => <span>{v || getCheckedByName(r.checked_by_oc, r.checked_by_name)}</span> };
    // }
    if (col.key === 'checked_by_name') {
      // prefer API-provided checked_by_name (v). fallback to staff lookup (checked_by_oc) or fallback value
      return { ...col, render: (v:any, r:any) => <span>{v || getCheckedByName(r.checked_by_oc, r.checked_by_name)}</span> };
    }
    return col;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base ">Total Balance (All Currencies)</CardTitle>
                <DollarSign className="h-5 w-5" style={{ color: '#650000' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#650000' }}>{formattedBalance}</div>
                {Object.keys(balanceByCurrency).length > 3 && (
                  <p className="text-sm text-gray-600 mt-2">+{Object.keys(balanceByCurrency).length - 3} more currencies</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Create Account Button */}
          <div className="flex justify-end">
            <Button onClick={() => {
                // reset account form to blank defaults for Create
                setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
                setIsCreateAccountDialogOpen(true);
              }} style={{ backgroundColor: '#650000' }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                key={accountsTableKey}
                url="/property-management/prisoner-accounts/"
                title="Accounts"
                columns={accountColumns}
                config={{
                  grouping: {
                    groupBy: 'prisoner_name',
                    defaultExpanded: false,
                    renderGroupHeader: (groupValue: string, items: any[]) => {
                      const firstItem = items[0];
                      
                      // Calculate balance per currency - use currency_symbol as key for proper color mapping
                      const balancesByCurrency: Record<string, { total: number; symbol: string; code: string }> = {};
                      items.forEach(item => {
                        const currencySymbol = item.currency_symbol || 'Unknown';
                        const balance = parseFloat(item.balance || '0') || 0;
                        
                        if (!balancesByCurrency[currencySymbol]) {
                          balancesByCurrency[currencySymbol] = { total: 0, symbol: currencySymbol, code: currencySymbol };
                        }
                        balancesByCurrency[currencySymbol].total += balance;
                      });
                      
                      return (
                        <div className="flex items-center justify-between py-2 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-base">{groupValue || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Total Balance</div>
                              <div className="font-semibold flex flex-wrap gap-3">
                                {Object.values(balancesByCurrency).map((c, idx) => {
                                  const code = c.code; // Already using currency_symbol directly
                                  const color = getCurrencyColor(code);
                                  return (
                                    <span key={idx}>
                                      <span style={{ color, fontWeight: '600' }}>{code}</span>{' '}
                                      <span>{c.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Accounts</div>
                              <div className="font-semibold">{items.length}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Currencies</div>
                              <div className="text-sm">
                                {Object.keys(balancesByCurrency).map((currSymbol, idx) => {
                                  const color = getCurrencyColor(currSymbol);
                                  return (
                                    <span key={idx}>
                                      <span style={{ color, fontWeight: '500' }}>{currSymbol}</span>
                                      {idx < Object.keys(balancesByCurrency).length - 1 ? ', ' : ''}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Pre-populate with first account or default if single account
                                  const accountToUse = items.length === 1 ? items[0].id : '';
                                  setTransactionFormData({
                                    property_prisoner_account: accountToUse,
                                    transaction_type: '',
                                    transaction_status: '',
                                    amount: '',
                                    transaction_remark: '',
                                    biometric_consent: false,
                                    checked_by_oc: 0,
                                  });
                                  setIsCreateTransactionDialogOpen(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                 Transaction
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  },
                  expandable: {
                    isExpanded: (row: any) => expandedAccounts.has(row.id),
                    onToggle: (row: any) => toggleAccountExpansion(row.id),
                    renderExpandedRow: (row: any) => {
                      const accountTransactions = getAccountTransactions(row.id);
                      
                      if (accountTransactions.length === 0) {
                        return (
                          <div className="p-6 text-center text-gray-500 bg-gray-50">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No transactions found for this account</p>
                          </div>
                        );
                      }

                      return (
                        <div className="p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Recent Transactions ({accountTransactions.length})</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setActiveTab('transactions');
                                // Optional: could set a filter for this account
                              }}
                              className="text-xs"
                            >
                              View All Transactions →
                            </Button>
                          </div>
                          <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 border-b">
                                <tr>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600">Date & Time</th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600">Type</th>
                                  <th className="text-right py-2 px-3 font-medium text-gray-600">Amount</th>
                                  <th className="text-right py-2 px-3 font-medium text-gray-600">Balance After</th>
                                  <th className="text-center py-2 px-3 font-medium text-gray-600">Status</th>
                                  <th className="text-center py-2 px-3 font-medium text-gray-600">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {accountTransactions.slice(0, 5).map((tx) => {
                                  const amount = parseFloat(tx.amount || '0');
                                  const isPositive = amount >= 0;
                                  const balanceAfter = parseFloat(tx.balance_after || '0');
                                  const currencyColor = getCurrencyColor(tx.currency_symbol || '');

                                  return (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                      <td className="py-2 px-3">
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <Calendar className="h-3 w-3" />
                                          <DateTime value={tx.transaction_datetime} format="dMYT" />
                                        </div>
                                      </td>
                                      <td className="py-2 px-3">
                                        <div className="flex items-center gap-1">
                                          <Badge variant={tx.is_credit ? 'default' : 'secondary'} className="text-xs">
                                            {tx.is_credit ? '📥' : '📤'}
                                          </Badge>
                                          <span className="text-xs">{tx.transaction_type_name}</span>
                                        </div>
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                          {isPositive ? '+' : ''}
                                          <span style={{ color: currencyColor }}>{tx.currency_symbol}</span>{' '}
                                          {Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        <span className={`text-sm font-medium ${balanceAfter < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                          <span style={{ color: currencyColor }}>{tx.currency_symbol}</span>{' '}
                                          {balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <Badge variant={getStatusVariant(tx.transaction_status_name)} className="text-xs">
                                          {tx.transaction_status_name}
                                        </Badge>
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedTransaction(deepClone(tx));
                                            setIsViewTransactionDialogOpen(true);
                                          }}
                                          className="h-7 w-7 p-0"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            {accountTransactions.length > 5 && (
                              <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 border-t">
                                Showing 5 of {accountTransactions.length} transactions
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base" >Total Value (All Currencies)</CardTitle>
                <DollarSign className="h-5 w-5" style={{ color: '#650000' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: '#650000' }}>{formattedTransactionValue}</div>
                {Object.keys(transactionValueByCurrency).length > 3 && (
                  <p className="text-sm text-gray-600 mt-2">+{Object.keys(transactionValueByCurrency).length - 3} more currencies</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => {
                      // reset transaction form to blank defaults for Create
                      setTransactionFormData({
                        property_prisoner_account: '',
                        transaction_type: '',
                        transaction_status: '',
                        amount: '',
                        transaction_remark: '',
                        biometric_consent: false,
                        checked_by_oc: '',
                      });
                      setIsCreateTransactionDialogOpen(true);
                    }} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="mb-3">Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={txFilterType}
                      labelField="label"
                      onChange={(v) => {
                        setTxFilterType(v ?? 'all');
                        setPage(1);
                        // baseParams now includes txFilterType so loadTransactions will be triggered by effects
                      }}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="mb-3">Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={txFilterStatus}
                      labelField="label"
                      onChange={(v) => {
                        setTxFilterStatus(v ?? 'all');
                        setPage(1);
                        // baseParams now includes txFilterStatus so loadTransactions will be triggered by effects
                      }}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                key={transactionsTableKey}
                url="/property-management/transactions/"
                title="Transactions"
                columns={updatedTransactionColumns}
                config={{
                  grouping: {
                    groupBy: 'prisoner_name',
                    defaultExpanded: false,
                    renderGroupHeader: (groupValue: string, items: any[]) => {
                      const firstItem = items[0];
                      
                      // Calculate totals per currency
                      const currencyTotals: Record<string, { credits: number; debits: number; symbol: string; code: string }> = {};
                      items.forEach(item => {
                        const currencyCode = item.currency_name || 'Unknown';
                        const symbol = item.currency_symbol || '';
                        const amount = parseFloat(item.amount || '0') || 0;
                        
                        if (!currencyTotals[currencyCode]) {
                          currencyTotals[currencyCode] = { credits: 0, debits: 0, symbol, code: currencyCode };
                        }
                        
                        if (item.is_credit) {
                          currencyTotals[currencyCode].credits += amount;
                        } else {
                          currencyTotals[currencyCode].debits += Math.abs(amount);
                        }
                      });
                      
                      // Format for display - show all currencies if 3 or less, otherwise show top 3 by total value
                      const currencyEntries = Object.values(currencyTotals);
                      const displayCurrencies = currencyEntries.length <= 3 
                        ? currencyEntries
                        : currencyEntries.sort((a, b) => (b.credits + b.debits) - (a.credits + a.debits)).slice(0, 3);
                      
                      const creditsDisplay = displayCurrencies
                        .map(c => `${c.symbol} ${c.credits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                        .join(' | ');
                      
                      const debitsDisplay = displayCurrencies
                        .map(c => `${c.symbol} ${c.debits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                        .join(' | ');
                      
                      const netDisplay = displayCurrencies
                        .map(c => {
                          const net = c.credits - c.debits;
                          return `${c.symbol} ${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        })
                        .join(' | ');
                      
                      const moreCurrencies = currencyEntries.length > 3 ? ` (+${currencyEntries.length - 3} more)` : '';
                      
                      return (
                        <div className="flex items-center justify-between py-2 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-base">{groupValue || 'Unknown'}</span>
                              {moreCurrencies && <span className="text-xs text-gray-500">{moreCurrencies}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Credits</div>
                              <div className="font-semibold text-green-600">+{creditsDisplay}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Debits</div>
                              <div className="font-semibold text-red-600">-{debitsDisplay}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Net Amount</div>
                              <div className="font-semibold text-gray-700">{netDisplay}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Transactions</div>
                              <div className="font-semibold">{items.length}</div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{getCurrencyLabel(selectedAccount.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>Update transaction information</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleUpdateTransaction} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className='mb-4'>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    {/* <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge> */}
                    <Badge variant={getStatusVariant(selectedTransaction.transaction_status_name)}>
                      {selectedTransaction.transaction_status_name || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p><DateTime value={selectedTransaction.transaction_datetime} format="dMY" /></p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <ConfirmDialog
        open={!!deleteAccountId}
        onOpenChange={(o) => { if (!o) { setDeleteAccountId(null); setSelectedAccount(null); } }}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        details={selectedAccount ? (
          <div>
            <div><strong>Prisoner:</strong> {selectedAccount.prisoner_name}</div>
            <div><strong>Account Type:</strong> {selectedAccount.account_type_name}</div>
          </div>
        ) : null}
        confirmLabel="Delete"
               cancelLabel="Cancel"
        onConfirm={async () => {
          await handleDeleteAccount();
        }}
      />

      <ConfirmDialog
        open={!!deleteTransactionId}
        onOpenChange={(o) => { if (!o) { setDeleteTransactionId(null); setSelectedTransaction(null); } }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        details={selectedTransaction ? (
          <div>
            <div><strong>Prisoner:</strong> {selectedTransaction.prisoner_name}</div>
            <div><strong>Amount:</strong> {parseFloat(selectedTransaction.amount).toLocaleString()}</div>
            <div><strong>Date:</strong> {new Date(selectedTransaction.transaction_datetime).toLocaleString()}</div>
          </div>
        ) : null}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          await handleDeleteTransaction();
        }}
      />
    </div>
  );
};

export default PrisonerPropertyAccountScreen;

// helper to safely get length of previous arrays (used in optimistic fallbacks)
function prevLengthSafe(arr:any[]) { try { return Array.isArray(arr) ? arr.length : 0; } catch { return 0; } }
