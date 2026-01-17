import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, X, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTxn, setEditTxn] = useState(null); 

  // Add Form State
  const [formData, setFormData] = useState({
    type: 'income', customerId: '', customerName: '', description: '', amount: '', status: 'Completed', date: new Date().toISOString().split('T')[0], note: '' 
  });

  // --- HELPER: FIX "INVALID DATE" ---
  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (dateVal.seconds) {
      return new Date(dateVal.seconds * 1000).toDateString();
    }
    return new Date(dateVal).toDateString();
  };

  // --- HELPER: GET DATE STRING FOR INPUT (YYYY-MM-DD) ---
  const getInputDate = (dateVal) => {
    if (!dateVal) return new Date().toISOString().split('T')[0];
    const d = dateVal.seconds ? new Date(dateVal.seconds * 1000) : new Date(dateVal);
    return d.toISOString().split('T')[0];
  };

  // 1. Fetch Data
  useEffect(() => {
    const unsubTxns = onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubCust = onSnapshot(query(collection(db, "customers"), orderBy("name", "asc")), (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubTxns(); unsubCust(); };
  }, []);

  // 2. Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === 'income' && !formData.customerId) return alert("Select a customer");
    
    const finalName = formData.type === 'income' ? formData.customerName : formData.description;
    await addDoc(collection(db, "transactions"), {
      ...formData,
      name: finalName,
      amount: parseFloat(formData.amount),
      createdAt: serverTimestamp(),
      date: new Date(formData.date) 
    });
    setIsAddModalOpen(false);
    setFormData({ type: 'income', customerId: '', customerName: '', description: '', amount: '', status: 'Completed', date: new Date().toISOString().split('T')[0], note: '' });
  };

  // 3. Handle Status & Date Update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editTxn) return;

    const txnRef = doc(db, "transactions", editTxn.id);
    await updateDoc(txnRef, {
      status: editTxn.status,
      note: editTxn.note || "",
      date: new Date(editTxn.date) 
    });
    setEditTxn(null);
  };

  // 4. Handle Customer Select (THIS WAS MISSING)
  const handleCustomerSelect = (e) => {
    const selectedId = e.target.value;
    const selectedCustomer = customers.find(c => c.id === selectedId);
    
    if (selectedCustomer) {
      setFormData({
        ...formData,
        customerId: selectedId,
        customerName: selectedCustomer.name
      });
    }
  };

  const filteredTransactions = transactions.filter(t => (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <Plus size={20} /> Add New
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">Description</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status & Note</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${txn.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {txn.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800 block">{txn.name}</span>
                      <span className="text-xs text-gray-400">{txn.type === 'income' ? 'Sale' : 'Expense'}</span>
                    </div>
                  </div>
                </td>
                
                <td className="p-4 text-gray-500 text-sm">{formatDate(txn.date)}</td>
                
                <td className="p-4">
                  <div 
                    onClick={() => setEditTxn({...txn, date: getInputDate(txn.date)})} 
                    className={`cursor-pointer inline-flex flex-col items-start`}
                  >
                    <span className={`px-2 py-1 text-xs rounded-full font-bold flex items-center gap-1 border ${
                      txn.status === 'Completed' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse'
                    }`}>
                      {txn.status === 'Completed' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                      {txn.status}
                    </span>
                    {txn.note && <span className="text-xs text-gray-400 mt-1 max-w-[150px] truncate">"{txn.note}"</span>}
                  </div>
                </td>

                <td className={`p-4 text-right font-bold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === 'income' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
             <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">New Transaction</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X size={24} className="text-gray-400 hover:text-red-500"/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${formData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Income</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Expense</button>
              </div>

              {formData.type === 'income' ? (
                <select required className="w-full border p-2 rounded-lg" value={formData.customerId} onChange={handleCustomerSelect}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input type="text" required placeholder="Description (e.g. Fuel)" className="w-full border p-2 rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              )}
              <input type="number" required placeholder="Amount" className="w-full border p-2 rounded-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              <div className="flex gap-2">
                <input type="date" required className="w-full border p-2 rounded-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <select className="w-full border p-2 rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <textarea placeholder="Note" className="w-full border p-2 rounded-lg text-sm h-16" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* --- UPDATE MODAL --- */}
      {editTxn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold mb-2">Update Payment</h3>
            <p className="text-gray-500 text-sm mb-4">Did you receive payment for <b>{editTxn.name}</b>?</p>
            
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  value={editTxn.status}
                  onChange={(e) => setEditTxn({...editTxn, status: e.target.value})}
                >
                  <option value="Pending">⚠️ Pending (Not Paid)</option>
                  <option value="Completed">✅ Completed (Paid)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Received / Updated</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  value={editTxn.date} 
                  onChange={(e) => setEditTxn({...editTxn, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note / Reason</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm h-24"
                  placeholder="e.g. Paid cash today..."
                  value={editTxn.note || ''}
                  onChange={(e) => setEditTxn({...editTxn, note: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditTxn(null)} className="flex-1 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;