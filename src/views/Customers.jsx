import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Search, Plus, Trash2, User, Mail, GraduationCap } from 'lucide-react';

const Customers = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. CHECK ROLE
  const userRole = localStorage.getItem('userRole'); 
  const isAdmin = userRole === 'admin';

  // 2. Fetch Students
  useEffect(() => {
    // Ideally, if it's a teacher, we would filter by their assigned class:
    // const q = isAdmin ? collection(db, "users") : query(collection(db, "users"), where("class", "==", "JSS 1"));
    
    // For now, we fetch all students so the teacher can see the school directory
    const q = query(collection(db, "users"), where("role", "==", "student"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // 3. Delete (Admin Only)
  const handleDelete = async (id) => {
    if (!isAdmin) return; 
    if (window.confirm("Are you sure you want to expel this student?")) {
      await deleteDoc(doc(db, "users", id));
    }
  };

  // Filter Search
  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "All Students" : "My Class List"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isAdmin ? "Manage school enrollment." : "View details of your pupils."}
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search pupil..." 
              className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* HIDE BUTTON IF NOT ADMIN */}
          {isAdmin && (
            <button className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-purple-700 shadow-md transition transform active:scale-95">
              <Plus size={18} /> <span className="hidden md:inline">Add Student</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4 hidden md:table-cell">Class</th>
              <th className="p-4 hidden md:table-cell">Guardian Email</th>
              <th className="p-4 hidden md:table-cell">Status</th>
              {isAdmin && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading directory...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">No students found.</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                        {student.name?.charAt(0) || <User size={18}/>}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500 md:hidden">{student.classAssigned || 'No Class'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                      {student.classAssigned || 'Unassigned'}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-gray-500 text-sm">{student.email}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div> Active
                    </span>
                  </td>
                  
                  {/* HIDE ACTIONS IF NOT ADMIN */}
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;