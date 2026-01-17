import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Check, X, Clock, Save, Loader } from 'lucide-react';

const AttendanceRegister = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]); // Fetched from config
  const [currentTerm, setCurrentTerm] = useState('');
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' | 'absent' | 'late' }
  const [loading, setLoading] = useState(true);

  // 1. Fetch School Config (Classes & Term)
  useEffect(() => {
    const fetchConfig = async () => {
      const docRef = doc(db, "settings", "schoolConfig");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setClasses(data.classes || []);
        setCurrentTerm(data.currentTerm || 'Unknown Term');
        setSelectedClass(data.classes[0] || ''); // Select first class by default
      }
    };
    fetchConfig();
  }, []);

  // 2. Fetch Students for Selected Class
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    
    const q = query(collection(db, "users"), where("classAssigned", "==", selectedClass), where("role", "==", "student"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedClass]);

  // 3. Toggle Status
  const markStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  // 4. Save Attendance
  const handleSave = async () => {
    try {
      // We create a unique ID for the day: "Class_Date"
      // But actually, we want individual records or a batch. 
      // Let's save a single document for the whole class for that day.
      const docId = `${selectedClass}_${selectedDate}`;
      
      await setDoc(doc(db, "attendance", docId), {
        date: selectedDate,
        class: selectedClass,
        term: currentTerm, // <--- THIS SAVES THE HISTORY
        records: attendance, // The map of student IDs to status
        markedBy: localStorage.getItem('userName'),
        updatedAt: serverTimestamp()
      });
      alert(`Attendance for ${selectedClass} saved successfully!`);
    } catch (err) {
      console.error(err);
      alert("Error saving attendance.");
    }
  };

  return (
    <div className="animate-fade-in-up pb-20">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance Register</h2>
          <p className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded w-fit mt-1">
             Active Session: {currentTerm}
          </p>
        </div>

        <div className="flex gap-4">
           <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Class</label>
             <select 
               className="border p-2 rounded-lg font-bold"
               value={selectedClass}
               onChange={(e) => setSelectedClass(e.target.value)}
             >
               {classes.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
             <input 
               type="date" 
               className="border p-2 rounded-lg font-bold"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
             />
           </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4 text-center">Present</th>
              <th className="p-4 text-center">Absent</th>
              <th className="p-4 text-center">Late</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {loading ? <tr><td colSpan="4" className="p-8 text-center">Loading...</td></tr> : 
              students.map(student => {
                const status = attendance[student.id]; // undefined, 'present', 'absent', 'late'
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-700">{student.name}</td>
                    
                    {/* PRESENT */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => markStatus(student.id, 'present')}
                        className={`p-2 rounded-lg transition ${status === 'present' ? 'bg-green-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-300 hover:bg-green-100'}`}
                      >
                        <Check size={20} />
                      </button>
                    </td>

                    {/* ABSENT */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => markStatus(student.id, 'absent')}
                        className={`p-2 rounded-lg transition ${status === 'absent' ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-300 hover:bg-red-100'}`}
                      >
                        <X size={20} />
                      </button>
                    </td>

                    {/* LATE */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => markStatus(student.id, 'late')}
                        className={`p-2 rounded-lg transition ${status === 'late' ? 'bg-orange-400 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-300 hover:bg-orange-100'}`}
                      >
                        <Clock size={20} />
                      </button>
                    </td>
                  </tr>
                )
              })
             }
          </tbody>
        </table>
      </div>

      {/* SAVE FOOTER */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t flex justify-end">
         <button 
           onClick={handleSave}
           className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg"
         >
           <Save size={20}/> Save Attendance
         </button>
      </div>

    </div>
  );
};

export default AttendanceRegister;