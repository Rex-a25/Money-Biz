import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Trash2, Briefcase, GraduationCap, Eye, Search, UserPlus } from 'lucide-react'; // <--- Added Search Icon

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState('teachers'); 
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'teacher', classAssigned: '' });
  const [loading, setLoading] = useState(false);
  
  // NEW: Search State
  const [searchTerm, setSearchTerm] = useState(''); 

  // 1. Fetch Users
  useEffect(() => {
    const roleToFetch = activeTab === 'teachers' ? 'teacher' : 'student';
    const q = query(collection(db, "users"), where("role", "==", roleToFetch));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });

    return () => unsubscribe();
  }, [activeTab]);

  // 2. Add New User
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        name: formData.name,
        email: formData.email,
        role: activeTab === 'teachers' ? 'teacher' : 'student',
        classAssigned: formData.classAssigned || 'Unassigned',
        schoolName: 'My School', 
        createdAt: serverTimestamp(),
        status: 'pending' 
      });
      alert("User invited successfully!");
      setFormData({ name: '', email: '', role: 'teacher', classAssigned: '' });
    } catch (err) {
      console.error(err);
      alert("Error adding user.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete User
  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert(`${userName} has been removed.`);
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user.");
      }
    }
  };

  // 4. View Portal
  const handleViewPortal = (user) => {
    if(window.confirm(`View Dashboard as ${user.name}?`)) {
      localStorage.setItem('simulatedId', user.id); 
      localStorage.setItem('simulatedRole', user.role);
      localStorage.setItem('simulatedName', user.name);
      window.location.reload();
    }
  };

  // NEW: Filter Logic
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Staff & Students</h2>
          <p className="text-gray-500 text-sm">Create accounts or view specific user portals.</p>
        </div>
        
        <div className="bg-white p-1 rounded-xl border flex shadow-sm">
           <button onClick={() => setActiveTab('teachers')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'teachers' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>Teachers</button>
           <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'students' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>Students</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: ADD FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            {activeTab === 'teachers' ? <Briefcase size={20}/> : <GraduationCap size={20}/>}
            Add New {activeTab === 'teachers' ? 'Teacher' : 'Student'}
          </h3>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <input required className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Email (For Login)</label>
              <input required type="email" className="w-full border p-2 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. john@school.com" />
            </div>

            <div>
               <label className="text-xs font-bold text-gray-400 uppercase">{activeTab === 'teachers' ? 'Class Master For' : 'Assign to Class'}</label>
               <select className="w-full border p-2 rounded-lg bg-white" value={formData.classAssigned} onChange={e => setFormData({...formData, classAssigned: e.target.value})}>
                 <option value="">Select Class...</option>
                 <option value="JSS 1">JSS 1</option>
                 <option value="JSS 2">JSS 2</option>
                 <option value="JSS 3">JSS 3</option>
                 <option value="SSS 1">SSS 1</option>
                 <option value="SSS 2">SSS 2</option>
                 <option value="SSS 3">SSS 3</option>
               </select>
            </div>

            <button disabled={loading} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
              <UserPlus size={18} /> {loading ? "Saving..." : "Add to Database"}
            </button>
          </form>
        </div>

        {/* RIGHT: LIST WITH SEARCH BAR */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
           
           {/* SEARCH BAR HEADER */}
           <div className="p-4 border-b flex items-center gap-3 bg-gray-50/50">
              <Search className="text-gray-400" size={20} />
              <input 
                type="text"
                className="bg-transparent outline-none w-full text-sm font-medium text-gray-700 placeholder-gray-400"
                placeholder={`Search ${activeTab} by name or email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           {/* COLUMN HEADERS */}
           <div className="p-4 border-b bg-gray-50 font-bold text-gray-500 text-xs uppercase flex justify-between">
              <span>User Details</span>
              <span>Actions</span>
           </div>

           {/* SCROLLABLE LIST */}
           <div className="divide-y overflow-y-auto max-h-[500px]">
             {filteredUsers.map(user => (
               <div key={user.id} className="p-4 flex justify-between items-center hover:bg-gray-50 group transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="text-xs text-purple-600 font-bold mt-1 md:hidden">{user.classAssigned}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <span className="hidden md:inline-block bg-gray-100 px-3 py-1 rounded text-xs font-bold text-gray-600 mr-2">
                       {user.classAssigned || 'N/A'}
                     </span>

                     {/* VIEW PORTAL BUTTON */}
                     <button 
                       onClick={() => handleViewPortal(user)}
                       className="text-blue-500 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition"
                       title="View Dashboard"
                     >
                       <Eye size={18} />
                     </button>

                     {/* DELETE BUTTON */}
                     <button 
                       onClick={() => handleDelete(user.id, user.name)}
                       className="text-gray-300 hover:text-white hover:bg-red-500 p-2 rounded-lg transition"
                       title="Delete User"
                     >
                       <Trash2 size={18}/>
                     </button>
                  </div>
               </div>
             ))}
             
             {filteredUsers.length === 0 && (
                <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                  <Search size={40} className="mb-2 opacity-20"/>
                  <p>No matches found.</p>
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ManageUsers;