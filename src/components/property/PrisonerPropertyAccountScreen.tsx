import React, { useState } from 'react';
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
import { toast } from 'sonner@2.0.3';
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

// Mock data
const mockPrisoners = [
  { id: '1', full_name: 'John Doe', prisoner_number: 'P001' },
  { id: '2', full_name: 'Jane Smith', prisoner_number: 'P002' },
  { id: '3', full_name: 'Bob Johnson', prisoner_number: 'P003' },
];

const mockAccountTypes = [
  { id: '1', name: 'Personal Account' },
  { id: '2', name: 'Welfare Account' },
  { id: '3', name: 'Work Account' },
];

const mockTransactionTypes = [
  { id: '1', name: 'Deposit' },
  { id: '2', name: 'Withdrawal' },
  { id: '3', name: 'Transfer' },
];

const mockTransactionStatuses = [
  { id: '1', name: 'Pending' },
  { id: '2', name: 'Approved' },
  { id: '3', name: 'Rejected' },
];

const mockAccounts: Account[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    account_type_name: 'Personal Account',
    currency: 'UGX',
    balance: '500000',
    prisoner: '1',
    account_type: '1',
  },
  {
    id: '2',
    prisoner_name: 'Jane Smith',
    account_type_name: 'Welfare Account',
    currency: 'UGX',
    balance: '350000',
    prisoner: '2',
    account_type: '2',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    account_type_name: 'Personal Account',
    transaction_type_name: 'Deposit',
    transaction_status_name: 'Approved',
    checked_by_name: 'Admin User',
    amount: '100000',
    transaction_datetime: '2025-10-25T10:30:00Z',
    transaction_remark: 'Monthly allowance',
    biometric_consent: true,
    balance_before: '400000',
    balance_after: '500000',
    property_prisoner_account: '1',
    transaction_type: '1',
    transaction_status: '2',
    checked_by_oc: 1,
  },
  {
    id: '2',
    prisoner_name: 'John Doe',
    account_type_name: 'Personal Account',
    transaction_type_name: 'Withdrawal',
    transaction_status_name: 'Approved',
    checked_by_name: 'Admin User',
    amount: '-50000',
    transaction_datetime: '2025-10-26T14:20:00Z',
    transaction_remark: 'Canteen purchase',
    biometric_consent: true,
    balance_before: '500000',
    balance_after: '450000',
    property_prisoner_account: '1',
    transaction_type: '2',
    transaction_status: '2',
    checked_by_oc: 1,
  },
];

const PrisonerPropertyAccountScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Transaction tab filters
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');
  const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);

  // Account dialogs
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Transaction dialogs
  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAccountForTransaction, setSelectedAccountForTransaction] = useState<string | null>(null);

  // Delete dialogs
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // Account form data
  const [accountFormData, setAccountFormData] = useState({
    prisoner: '',
    account_type: '',
    currency: 'UGX',
  });

  // Transaction form data
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });

  // Toggle account expansion
  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  // Get transactions for an account
  const getAccountTransactions = (accountId: string): Transaction[] => {
    return mockTransactions.filter(t => t.property_prisoner_account === accountId);
  };

  // Account CRUD operations
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const prisoner = mockPrisoners.find(p => p.id === accountFormData.prisoner);
    const accountType = mockAccountTypes.find(at => at.id === accountFormData.account_type);
    
    const newAccount: Account = {
      id: (accounts.length + 1).toString(),
      prisoner_name: prisoner?.full_name || '',
      account_type_name: accountType?.name || '',
      currency: accountFormData.currency,
      balance: '0',
      prisoner: accountFormData.prisoner,
      account_type: accountFormData.account_type,
    };
    
    setAccounts([...accounts, newAccount]);
    setIsCreateAccountDialogOpen(false);
    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
    toast.success('Account created successfully');
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAccount) {
      const prisoner = mockPrisoners.find(p => p.id === accountFormData.prisoner);
      const accountType = mockAccountTypes.find(at => at.id === accountFormData.account_type);
      
      const updatedAccounts = accounts.map(acc =>
        acc.id === selectedAccount.id
          ? {
              ...acc,
              prisoner_name: prisoner?.full_name || acc.prisoner_name,
              account_type_name: accountType?.name || acc.account_type_name,
              currency: accountFormData.currency,
              prisoner: accountFormData.prisoner,
              account_type: accountFormData.account_type,
            }
          : acc
      );
      setAccounts(updatedAccounts);
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      toast.success('Account updated successfully');
    }
  };

  const handleDeleteAccount = () => {
    if (deleteAccountId) {
      setAccounts(accounts.filter(acc => acc.id !== deleteAccountId));
      setDeleteAccountId(null);
      toast.success('Account deleted successfully');
    }
  };

  // Transaction CRUD operations
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const account = accounts.find(a => a.id === transactionFormData.property_prisoner_account);
    const transactionType = mockTransactionTypes.find(tt => tt.id === transactionFormData.transaction_type);
    const transactionStatus = mockTransactionStatuses.find(ts => ts.id === transactionFormData.transaction_status);
    
    const newTransaction: Transaction = {
      id: (mockTransactions.length + 1).toString(),
      prisoner_name: account?.prisoner_name || '',
      account_type_name: account?.account_type_name || '',
      transaction_type_name: transactionType?.name || '',
      transaction_status_name: transactionStatus?.name || '',
      checked_by_name: 'Current User',
      amount: transactionFormData.amount,
      transaction_datetime: new Date().toISOString(),
      transaction_remark: transactionFormData.transaction_remark,
      biometric_consent: transactionFormData.biometric_consent,
      balance_before: account?.balance || '0',
      balance_after: (parseFloat(account?.balance || '0') + parseFloat(transactionFormData.amount)).toString(),
      property_prisoner_account: transactionFormData.property_prisoner_account,
      transaction_type: transactionFormData.transaction_type,
      transaction_status: transactionFormData.transaction_status,
      checked_by_oc: transactionFormData.checked_by_oc,
    };
    
    mockTransactions.push(newTransaction);
    setIsCreateTransactionDialogOpen(false);
    setTransactionFormData({
      property_prisoner_account: '',
      transaction_type: '',
      transaction_status: '',
      amount: '',
      transaction_remark: '',
      biometric_consent: false,
      checked_by_oc: 0,
    });
    toast.success('Transaction created successfully');
  };

  const handleDeleteTransaction = () => {
    if (deleteTransactionId) {
      const index = mockTransactions.findIndex(t => t.id === deleteTransactionId);
      if (index > -1) {
        mockTransactions.splice(index, 1);
      }
      setDeleteTransactionId(null);
      toast.success('Transaction deleted successfully');
    }
  };

  // Pagination for accounts
  const filteredAccounts = accounts.filter(acc =>
    acc.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter and pagination for transactions tab
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.prisoner_name.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.account_type_name.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.transaction_remark.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.checked_by_name.toLowerCase().includes(transactionSearchTerm.toLowerCase());
    
    const matchesType = transactionTypeFilter === 'all' || transaction.transaction_type === transactionTypeFilter;
    const matchesStatus = transactionStatusFilter === 'all' || transaction.transaction_status === transactionStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalTransactionPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (transactionCurrentPage - 1) * itemsPerPage,
    transactionCurrentPage * itemsPerPage
  );

  // Calculate statistics
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  const totalTransactions = mockTransactions.length;
  const pendingTransactions = mockTransactions.filter(t => t.transaction_status_name === 'Pending').length;

  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [openAccountType, setOpenAccountType] = useState(false);
    const [openCurrency, setOpenCurrency] = useState(false);

    const currencies = ['UGX', 'USD', 'EUR', 'GBP'];

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Prisoner Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPrisoner}
                  className="w-full justify-between"
                  type="button"
                >
                  {accountFormData.prisoner
                    ? mockPrisoners.find((p) => p.id === accountFormData.prisoner)?.full_name + 
                      ' (' + mockPrisoners.find((p) => p.id === accountFormData.prisoner)?.prisoner_number + ')'
                    : "Select prisoner..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search prisoner..." />
                  <CommandList>
                    <CommandEmpty>No prisoner found.</CommandEmpty>
                    <CommandGroup>
                      {mockPrisoners.map((prisoner) => (
                        <CommandItem
                          key={prisoner.id}
                          value={prisoner.full_name + ' ' + prisoner.prisoner_number}
                          onSelect={() => {
                            setAccountFormData({...accountFormData, prisoner: prisoner.id});
                            setOpenPrisoner(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              accountFormData.prisoner === prisoner.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {prisoner.full_name} ({prisoner.prisoner_number})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Account Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Popover open={openAccountType} onOpenChange={setOpenAccountType}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAccountType}
                  className="w-full justify-between"
                  type="button"
                >
                  {accountFormData.account_type
                    ? mockAccountTypes.find((t) => t.id === accountFormData.account_type)?.name
                    : "Select account type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search account type..." />
                  <CommandList>
                    <CommandEmpty>No account type found.</CommandEmpty>
                    <CommandGroup>
                      {mockAccountTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.name}
                          onSelect={() => {
                            setAccountFormData({...accountFormData, account_type: type.id});
                            setOpenAccountType(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              accountFormData.account_type === type.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Currency Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Popover open={openCurrency} onOpenChange={setOpenCurrency}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCurrency}
                  className="w-full justify-between"
                  type="button"
                >
                  {accountFormData.currency || "Select currency..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search currency..." />
                  <CommandList>
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup>
                      {currencies.map((currency) => (
                        <CommandItem
                          key={currency}
                          value={currency}
                          onSelect={() => {
                            setAccountFormData({...accountFormData, currency});
                            setOpenCurrency(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              accountFormData.currency === currency ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {currency}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateAccountDialogOpen(false);
            setIsEditAccountDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Account
          </Button>
        </DialogFooter>
      </form>
    );
  };

  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const [openAccount, setOpenAccount] = useState(false);
    const [openTransactionType, setOpenTransactionType] = useState(false);
    const [openTransactionStatus, setOpenTransactionStatus] = useState(false);

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="property_prisoner_account">Account *</Label>
            <Popover open={openAccount} onOpenChange={setOpenAccount}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAccount}
                  className="w-full justify-between"
                  type="button"
                >
                  {transactionFormData.property_prisoner_account
                    ? accounts.find((a) => a.id === transactionFormData.property_prisoner_account)?.prisoner_name + 
                      ' - ' + accounts.find((a) => a.id === transactionFormData.property_prisoner_account)?.account_type_name
                    : "Select account..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search account..." />
                  <CommandList>
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                      {accounts.map((account) => (
                        <CommandItem
                          key={account.id}
                          value={account.prisoner_name + ' ' + account.account_type_name}
                          onSelect={() => {
                            setTransactionFormData({...transactionFormData, property_prisoner_account: account.id});
                            setOpenAccount(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              transactionFormData.property_prisoner_account === account.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {account.prisoner_name} - {account.account_type_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Transaction Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="transaction_type">Transaction Type *</Label>
            <Popover open={openTransactionType} onOpenChange={setOpenTransactionType}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTransactionType}
                  className="w-full justify-between"
                  type="button"
                >
                  {transactionFormData.transaction_type
                    ? mockTransactionTypes.find((t) => t.id === transactionFormData.transaction_type)?.name
                    : "Select transaction type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search transaction type..." />
                  <CommandList>
                    <CommandEmpty>No transaction type found.</CommandEmpty>
                    <CommandGroup>
                      {mockTransactionTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.name}
                          onSelect={() => {
                            setTransactionFormData({...transactionFormData, transaction_type: type.id});
                            setOpenTransactionType(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              transactionFormData.transaction_type === type.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Transaction Status Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="transaction_status">Status *</Label>
            <Popover open={openTransactionStatus} onOpenChange={setOpenTransactionStatus}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTransactionStatus}
                  className="w-full justify-between"
                  type="button"
                >
                  {transactionFormData.transaction_status
                    ? mockTransactionStatuses.find((s) => s.id === transactionFormData.transaction_status)?.name
                    : "Select status..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search status..." />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {mockTransactionStatuses.map((status) => (
                        <CommandItem
                          key={status.id}
                          value={status.name}
                          onSelect={() => {
                            setTransactionFormData({...transactionFormData, transaction_status: status.id});
                            setOpenTransactionStatus(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              transactionFormData.transaction_status === status.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {status.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={transactionFormData.amount}
              onChange={(e) => setTransactionFormData({...transactionFormData, amount: e.target.value})}
              placeholder="Enter amount (positive for deposit, negative for withdrawal)"
              required
            />
          </div>

          {/* Biometric Consent */}
          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Checkbox
              id="biometric_consent"
              checked={transactionFormData.biometric_consent}
              onCheckedChange={(checked) => setTransactionFormData({...transactionFormData, biometric_consent: checked as boolean})}
            />
            <Label htmlFor="biometric_consent" className="cursor-pointer">
              Biometric Consent
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_remark">Remarks</Label>
          <Textarea
            id="transaction_remark"
            value={transactionFormData.transaction_remark}
            onChange={(e) => setTransactionFormData({...transactionFormData, transaction_remark: e.target.value})}
            placeholder="Enter transaction remarks"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateTransactionDialogOpen(false);
            setIsEditTransactionDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Transaction
          </Button>
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

      <Tabs defaultValue="accounts" className="space-y-6">
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
                <CardTitle className="text-sm">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {totalBalance.toLocaleString()}</div>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setIsCreateAccountDialogOpen(true)}
                  style={{ backgroundColor: '#650000' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#650000' }}>
                    <TableHead className="text-white"></TableHead>
                    <TableHead className="text-white">Prisoner Name</TableHead>
                    <TableHead className="text-white">Account Type</TableHead>
                    <TableHead className="text-white">Currency</TableHead>
                    <TableHead className="text-right text-white">Balance</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.map((account) => (
                    <React.Fragment key={account.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAccountExpansion(account.id)}
                          >
                            {expandedAccounts.has(account.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{account.prisoner_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.account_type_name}</Badge>
                        </TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell className="text-right">
                          {parseFloat(account.balance).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setIsViewAccountDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setAccountFormData({
                                  prisoner: account.prisoner,
                                  account_type: account.account_type,
                                  currency: account.currency,
                                });
                                setIsEditAccountDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteAccountId(account.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Transactions Row */}
                      {expandedAccounts.has(account.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Transactions</h3>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAccountForTransaction(account.id);
                                    setTransactionFormData({
                                      ...transactionFormData,
                                      property_prisoner_account: account.id,
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
                                  {getAccountTransactions(account.id).length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={7} className="text-center text-gray-500">
                                        No transactions found
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    getAccountTransactions(account.id).map((transaction) => (
                                      <TableRow key={transaction.id}>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {new Date(transaction.transaction_datetime).toLocaleString()}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{transaction.transaction_type_name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <span className={parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {parseFloat(transaction.amount) >= 0 ? '+' : ''}{parseFloat(transaction.amount).toLocaleString()}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <Badge 
                                            variant={
                                              transaction.transaction_status_name === 'Approved' 
                                                ? 'default' 
                                                : transaction.transaction_status_name === 'Pending'
                                                ? 'secondary'
                                                : 'destructive'
                                            }
                                          >
                                            {transaction.transaction_status_name}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>{parseFloat(transaction.balance_after).toLocaleString()}</TableCell>
                                        <TableCell className="max-w-xs truncate">{transaction.transaction_remark}</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setIsViewTransactionDialogOpen(true);
                                              }}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setDeleteTransactionId(transaction.id)}
                                            >
                                              <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Statistics Cards */}
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
                <div className="text-2xl">
                  {mockTransactions.filter(t => t.transaction_status_name === 'Approved').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  UGX {mockTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => {
                        setTransactionSearchTerm(e.target.value);
                        setTransactionCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => setIsCreateTransactionDialogOpen(true)}
                    style={{ backgroundColor: '#650000' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="transactionTypeFilter">Transaction Type</Label>
                    <select
                      id="transactionTypeFilter"
                      value={transactionTypeFilter}
                      onChange={(e) => {
                        setTransactionTypeFilter(e.target.value);
                        setTransactionCurrentPage(1);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Types</option>
                      {mockTransactionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="transactionStatusFilter">Status</Label>
                    <select
                      id="transactionStatusFilter"
                      value={transactionStatusFilter}
                      onChange={(e) => {
                        setTransactionStatusFilter(e.target.value);
                        setTransactionCurrentPage(1);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Statuses</option>
                      {mockTransactionStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Prisoner</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Checked By</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(transaction.transaction_datetime).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.prisoner_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.account_type_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.transaction_type_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {parseFloat(transaction.amount) >= 0 ? '+' : ''}{parseFloat(transaction.amount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.transaction_status_name === 'Approved' 
                                ? 'default' 
                                : transaction.transaction_status_name === 'Pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {transaction.transaction_status_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{parseFloat(transaction.balance_after).toLocaleString()}</TableCell>
                        <TableCell>{transaction.checked_by_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.transaction_remark || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setIsViewTransactionDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTransactionId(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalTransactionPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {((transactionCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(transactionCurrentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransactionCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={transactionCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        Page {transactionCurrentPage} of {totalTransactionPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransactionCurrentPage(prev => Math.min(totalTransactionPages, prev + 1))}
                      disabled={transactionCurrentPage === totalTransactionPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>Add a new prisoner account</DialogDescription>
          </DialogHeader>
          <AccountForm onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update account information</DialogDescription>
          </DialogHeader>
          <AccountForm onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Account Dialog */}
      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
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
                  <p>{selectedAccount.currency}</p>
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

      {/* Create Transaction Dialog */}
      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>Add a new transaction</DialogDescription>
          </DialogHeader>
          <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
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
                  <Badge 
                    variant={
                      selectedTransaction.transaction_status_name === 'Approved' 
                        ? 'default' 
                        : selectedTransaction.transaction_status_name === 'Pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
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

      {/* Delete Account Confirmation */}
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

      {/* Delete Transaction Confirmation */}
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
