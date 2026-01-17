
import React, { useState } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

const AddCustomerModal = ({ isOpen, onClose, onCustomerAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active' // Default status
  });

  if (!isOpen) return null; // Don't show anything if closed

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Firebase
      await addDoc(collection(db, "customers"), {
        ...formData,
        createdAt: serverTimestamp(),
        lastPaid: "Never", // Default for new customer
        balance: 0 // Default balance
      });

      // 2. Refresh the list and close modal
      onCustomerAdded(); 
      onClose();
      // Reset form
      setFormData({ name: '', email: '', phone: '', status: 'Active' });
      
    } catch (error) {
      console.error("Error adding customer: ", error);
      alert("Error adding customer. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop (Dark overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Add New Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g. Chioma Adebayo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              type="tel" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g. 08012345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="customer@example.com"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition shadow-lg shadow-purple-200 flex justify-center items-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
              <span>Save Customer</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;