import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
  PlusCircle,
  X,
  Trash2
} from 'lucide-react';

interface Client {
  id: number;
  username: string;
  name: string;
  email: string;
  btc_balance: number;
  usdt_balance?: number;
  eth_balance?: number;
  btc_address?: string;
  eth_address?: string;
  usdt_address?: string;
}

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Simple state for wallet inputs: { clientId: { btc_address: '', eth_address: '', usdt_address: '' } }
  const [walletInputs, setWalletInputs] = useState<Record<number, { btc_address: string, eth_address: string, usdt_address: string }>>({});

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [txForm, setTxForm] = useState({
    type: 'deposit',
    amount: '',
    currency: 'BTC',
    source: '',
    status: 'Confirmed',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchClients();
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions?isAdmin=true');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setClients(data);
          
          // Initialize wallet inputs
          const initialWallets: Record<number, { btc_address: string, eth_address: string, usdt_address: string }> = {};
          data.forEach((c: Client) => {
            if (c && c.id !== undefined) {
              initialWallets[c.id] = {
                btc_address: c.btc_address || '',
                eth_address: c.eth_address || '',
                usdt_address: c.usdt_address || '',
              };
            }
          });
          setWalletInputs(initialWallets);
        } else {
          console.error('Expected array of clients, got:', data);
          setClients([]);
        }
      } else {
        console.error('Failed to fetch clients:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWalletChange = (clientId: number, field: string, value: string) => {
    setWalletInputs(prev => ({
      ...prev,
      [clientId]: {
        ...(prev[clientId] || { btc_address: '', eth_address: '', usdt_address: '' }),
        [field]: value
      }
    }));
  };

  const saveWallets = async (clientId: number) => {
    const wallets = walletInputs[clientId];
    if (!wallets) return;

    try {
      const response = await fetch(`/api/users/${clientId}/wallets`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallets)
      });

      if (response.ok) {
        alert('Wallets updated successfully');
        fetchClients();
      } else {
        alert('Failed to update wallets');
      }
    } catch (error) {
      console.error('Error saving wallets:', error);
      alert('Error saving wallets');
    }
  };

  const openTxModal = (clientId: number) => {
    setSelectedClientId(clientId);
    setTxForm({
      type: 'deposit',
      amount: '',
      currency: 'BTC',
      source: '',
      status: 'Confirmed',
      date: new Date().toISOString().split('T')[0]
    });
    setIsTxModalOpen(true);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedClientId,
          type: txForm.type,
          amount: parseFloat(txForm.amount),
          currency: txForm.currency,
          source: txForm.source,
          status: txForm.status,
          created_at: new Date(txForm.date).toISOString()
        })
      });

      if (response.ok) {
        alert('Transaction created successfully');
        setIsTxModalOpen(false);
        fetchClients(); // Refresh balances if needed
      } else {
        alert('Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error creating transaction');
    }
  };

  const handleConfirmTransaction = async (txId: number) => {
    try {
      const response = await fetch(`/api/transactions/${txId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Confirmed' })
      });
      if (response.ok) {
        alert('Transaction confirmed successfully');
        fetchTransactions();
        fetchClients(); // Update balances
      } else {
        alert('Failed to confirm transaction');
      }
    } catch (error) {
      console.error('Error confirming transaction:', error);
      alert('Error confirming transaction');
    }
  };

  const handleRejectTransaction = async (txId: number) => {
    try {
      const response = await fetch(`/api/transactions/${txId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });
      if (response.ok) {
        alert('Transaction rejected successfully');
        fetchTransactions();
        fetchClients(); // Update balances
      } else {
        alert('Failed to reject transaction');
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Error rejecting transaction');
    }
  };

  const handleDeleteTransaction = async (txId: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`/api/transactions/${txId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Transaction deleted successfully');
        fetchTransactions();
        fetchClients(); // Update balances
      } else {
        alert('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };

  if (loading && (!Array.isArray(clients) || clients.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-500 h-8 w-8" />
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 hidden sm:inline-block">Welcome, {user?.name}</span>
          <button onClick={() => { fetchClients(); fetchTransactions(); }} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors border border-red-900/30 text-sm font-medium">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="mb-6 flex items-center gap-2">
          <Users className="text-blue-600 h-6 w-6" />
          <h2 className="text-2xl font-bold text-slate-900">Clients Management</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Balances</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Wallet Addresses</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(clients) && clients.map(client => client ? (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{client.name || 'Unknown'}</div>
                      <div className="text-sm text-slate-500">{client.email || 'No email'}</div>
                      <div className="text-xs text-slate-400 mt-1">@{client.username || 'unknown'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex justify-between max-w-[120px]">
                        <span className="font-medium">BTC:</span> 
                        <span>{client.btc_balance || 0}</span>
                      </div>
                      <div className="flex justify-between max-w-[120px]">
                        <span className="font-medium">ETH:</span> 
                        <span>{client.eth_balance || 0}</span>
                      </div>
                      <div className="flex justify-between max-w-[120px]">
                        <span className="font-medium">USDT:</span> 
                        <span>{client.usdt_balance || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-3 min-w-[250px]">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">BTC Address</label>
                          <input 
                            type="text" 
                            className="w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={walletInputs[client.id]?.btc_address || ''}
                            onChange={(e) => handleWalletChange(client.id, 'btc_address', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">ETH Address</label>
                          <input 
                            type="text" 
                            className="w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={walletInputs[client.id]?.eth_address || ''}
                            onChange={(e) => handleWalletChange(client.id, 'eth_address', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">USDT Address</label>
                          <input 
                            type="text" 
                            className="w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={walletInputs[client.id]?.usdt_address || ''}
                            onChange={(e) => handleWalletChange(client.id, 'usdt_address', e.target.value)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex flex-col gap-2 items-end">
                        <button 
                          onClick={() => saveWallets(client.id)}
                          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm w-full max-w-[160px]"
                        >
                          <Save size={16} /> Save Wallets
                        </button>
                        <button 
                          onClick={() => openTxModal(client.id)}
                          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm w-full max-w-[160px]"
                        >
                          <PlusCircle size={16} /> Add Tx
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null)}
                {(!Array.isArray(clients) || clients.length === 0) && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-900">No clients found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 mb-6 flex items-center gap-2">
          <RefreshCw className="text-blue-600 h-6 w-6" />
          <h2 className="text-2xl font-bold text-slate-900">Transactions Management</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(transactions) && transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{tx.client_name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">@{tx.client_username || 'unknown'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 capitalize">
                      {tx.type}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {tx.amount} {tx.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {tx.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleConfirmTransaction(tx.id)}
                              className="inline-flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium shadow-sm"
                            >
                              <ShieldCheck size={14} /> Confirm
                            </button>
                            <button 
                              onClick={() => handleRejectTransaction(tx.id)}
                              className="inline-flex items-center justify-center gap-1 bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 transition-colors text-xs font-medium shadow-sm"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="inline-flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium shadow-sm"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!Array.isArray(transactions) || transactions.length === 0) && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <p className="text-lg font-medium text-slate-900">No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Create Transaction</h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    value={txForm.type}
                    onChange={(e) => setTxForm({...txForm, type: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select 
                    value={txForm.currency}
                    onChange={(e) => setTxForm({...txForm, currency: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                    <option value="SOL">SOL</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={txForm.amount}
                  onChange={(e) => setTxForm({...txForm, amount: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source / Destination</label>
                <input 
                  type="text" 
                  value={txForm.source}
                  onChange={(e) => setTxForm({...txForm, source: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. External Wallet, Bank Transfer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={txForm.status}
                    onChange={(e) => setTxForm({...txForm, status: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({...txForm, date: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
