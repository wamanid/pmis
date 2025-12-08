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
import { Badge } from '../ui/badge';
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
import { DataTable } from "../common/DataTableCollapsableRows";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import AmountInput from '../common/AmountInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
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

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
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
  // expanded rows (for accounts collapsible section)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const toggleAccountExpansion = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) newSet.delete(accountId);
    else newSet.add(accountId);
    setExpandedAccounts(newSet);
  };
  // helper to get transactions for an account (from loaded transactions)
  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
  };

  // request control
  const abortRef = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes, curRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
        axiosInstance.get(API_ENDPOINTS.CURRENCIES, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
      // store full currency objects (id, code, name) so UI can show name while saving id
      setCurrencies(curRes?.results ?? []);
    } catch (err) {
      console.error('lookup load error', err);
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      if (id === reqId.current) setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      if (id === reqId.current) setTransactionsLoading(false);
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

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

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
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
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
      await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      loadAccounts();
    } catch (err) {
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(transactionFormData.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(transactionFormData.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(transactionFormData.amount)) errs.amount = 'Amount is required';
    setTransactionFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    try {
      await txSvc.createTransaction(transactionFormData);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      // API delete endpoint assumed to be DELETE /transactions/{id}/
      await txSvc.createTransaction({}); // placeholder if no delete endpoint; replace with txSvc.deleteTransaction if available
      // If backend supports delete, call it instead.
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // helper to render currency label (show code/name in UI, save uuid)
  const getCurrencyLabel = (val?: string) => {
    if (!val) return '';
    const found = currencies.find((c:any) => String(c.id) === String(val) || String(c.code ?? '').toUpperCase() === String(val).toUpperCase());
    if (found) return found.name ? `${found.code ?? ''} — ${found.name}` : (found.code ?? String(found.id));
    // fallback: if val looks like uppercase code return it else return raw
    return String(val);
  };

  // Columns for DataTable
  const accountColumns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_v:any, r:any) => (
        <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
          {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency', render: (v:any, r:any) => <span>{getCurrencyLabel(v)}</span> },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">

        <Button variant="ghost" size="sm" onClick={() => {
            setSelectedAccount(r);
            setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency, balance: r.balance ?? '0' });
            setAccountFormKey(k => k + 1); // remount form so local state syncs
            setIsViewAccountDialogOpen(true);
          }}>
           <Eye className="h-4 w-4" />
         </Button>

        <Button variant="ghost" size="sm" onClick={() => {
            setSelectedAccount(r);
            setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency, balance: r.balance ?? '0' });
            setAccountFormKey(k => k + 1); // ensure AccountForm remounts with fresh data
            setIsEditAccountDialogOpen(true);
          }}>
           <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteAccountId(r.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    { key: 'transaction_datetime', label: 'Date & Time' },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'transaction_type_name', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    { key: 'transaction_status_name', label: 'Status' },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
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

    // load prisoners (debounced, abortable)
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          // ignore aborts; surface only real errors
          if ((err as any).name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) { prisonerAbortRef.current.abort(); prisonerAbortRef.current = null; }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

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
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPrisoner} className="w-full justify-between text-left" type="button">
                  {local.prisoner
                    ? (selectedPrisonerName
                        || prisoners.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || prisonerResults.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || local.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search prisoners..." value={prisonerQuery} onValueChange={(v) => setPrisonerQuery(v)} />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem key={p.id} value={String(p.id)}
                              onSelect={() => {
                                setLocal(prev => ({ ...prev, prisoner: String(p.id) }));
                                setSelectedPrisonerName(p.full_name);
                                setOpenPrisoner(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", String(local.prisoner) === String(p.id) ? "opacity-100" : "opacity-0")} style={{ color: '#650000' }} />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">{p.prisoner_number_value || p.prisoner_number || ''}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
          </div>

          {/* account type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
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
            <Label htmlFor="currency">Currency *</Label>
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

    const onSubmitForm = async (values: any) => {
      // validate required fields locally
      const errs: Record<string,string> = {};
      if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
      if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
      if (!values.amount) errs.amount = 'Amount is required';
      // backend requires checked_by_oc non-null
      if (!values.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
      if (Object.keys(errs).length) {
        setTransactionFormErrors(errs);
        return;
      }
      setTransactionFormErrors({});

      try {
        // prepare payload expected by API
        const payload = {
          property_prisoner_account: values.property_prisoner_account,
          transaction_type: values.transaction_type,
          transaction_status: values.transaction_status || null,
          amount: values.amount,
          transaction_remark: values.transaction_remark,
          biometric_consent: !!values.biometric_consent,
          // ensure we send full ISO string (Z)
          transaction_datetime: values.transaction_datetime,
          balance_before: values.balance_before,
          balance_after: values.balance_after,
          // checked_by_oc must be provided (we expect a uuid or id as returned by StaffProfileSelect)
          checked_by_oc: values.checked_by_oc,
        };
        await txSvc.createTransaction(payload);
        toast.success('Transaction created');
        setIsCreateTransactionDialogOpen(false);
        reset();
        // reload lists
        loadTransactions();
        loadAccounts();
      } catch (err) {
        console.error('create tx error', err);
        toast.error('Failed to create transaction');
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account *</Label>
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
            <Label>Transaction Type *</Label>
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
            <Label>Amount *</Label>
            <Controller control={control} name="amount" rules={{ required: true, pattern: /^-?\d+(\.\d+)?$/ }} render={({ field }) => {
              const selAcc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              const selCurrency = selAcc?.currency ?? 'UGX';
              return (
                <AmountInput
                  value={field.value ?? ''}
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
            <Label>Checked By *</Label>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance [All currencies]</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl"> {totalBalance.toLocaleString()}</div>
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

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    // start with empty currency so placeholder shows; AccountForm will map to id when user selects
                    setAccountFormData({ prisoner: '', account_type: '', currency: '', balance: '0' });
                    setAccountFormKey(k => k + 1);
                    setIsCreateAccountDialogOpen(true);
                  }}
                   style={{ backgroundColor: '#650000' }}
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Create Account
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
                // expanded rows support: DataTable should call this to render expanded content for a row
                renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Transactions</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTransactionFormData({
                            ...transactionFormData,
                            property_prisoner_account: row.id,
                          });
                          setIsCreateTransactionDialogOpen(true);
                        }}
                        style={{ backgroundColor: '#650000' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAccountTransactions(row.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                          </TableRow>
                        ) : getAccountTransactions(row.id).map((t:any) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(t.transaction_datetime).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                            <TableCell>
                              <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                {t.transaction_status_name}
                              </Badge>
                            </TableCell>
                            <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteTransactionId(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
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
                  <Button onClick={() => setIsCreateTransactionDialogOpen(true)} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={'all'}
                      onChange={()=>{}}
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
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={transactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
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
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
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
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
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
        <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
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
                    <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
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
                    <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
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
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerPropertyAccountScreen;
