import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { Search, Save, MessageSquare, CheckCircle } from 'lucide-react';

const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History"];

const TeacherGradebook = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [grades, setGrades] = useState({}); // Stores local input state
  const [feedback, setFeedback] = useState({}); // Stores local feedback state

  // Fetch only Students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const querySnapshot = await getDocs(q);
        const studentList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Handle Input Changes
  const handleScoreChange = (id, val) => setGrades(prev => ({ ...prev, [id]: val }));
  const handleFeedbackChange = (id, val) => setFeedback(prev => ({ ...prev, [id]: val }));

  // Save to Firebase
  const handleSave = async (student) => {
    const score = grades[student.id];
    const message = feedback[student.id];

    if (!score) return alert("Please enter a score");

    try {
      await addDoc(collection(db, "grades"), {
        studentId: student.id,
        studentName: student.name,
        subject: selectedSubject,
        score: Number(score),
        feedback: message || "No feedback provided",
        teacherName: localStorage.getItem('userName') || "Teacher",
        date: serverTimestamp(),
        term: "First Term" // You can make this dynamic later
      });
      alert(`Saved Grade for ${student.name}!`);
      // Clear inputs (optional)
      setGrades(prev => ({ ...prev, [student.id]: '' }));
      setFeedback(prev => ({ ...prev, [student.id]: '' }));
    } catch (err) {
      console.error(err);
      alert("Error saving grade");
    }
  };

  if (loading) return <div className="p-4">Loading Class List...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Class Gradebook</h2>
          <p className="text-sm text-gray-500">Enter scores and feedback for your students</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">Subject:</span>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Student Name</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Score (0-100)</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Feedback / Message</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                
                {/* Name */}
                <td className="p-4">
                  <div className="font-bold text-gray-800">{student.name || "Unknown"}</div>
                  <div className="text-xs text-gray-400">{student.email}</div>
                </td>

                {/* Score Input */}
                <td className="p-4 w-32">
                  <input 
                    type="number" 
                    max="100"
                    placeholder="0"
                    value={grades[student.id] || ''}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-center font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </td>

                {/* Feedback Input */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-gray-400"/>
                    <input 
                      type="text" 
                      placeholder="e.g. Excellent work on the essay..."
                      value={feedback[student.id] || ''}
                      onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </td>

                {/* Save Button */}
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleSave(student)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ml-auto transition shadow-sm active:scale-95"
                  >
                    <Save size={16} /> Save
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="p-8 text-center text-gray-500">No students found in the database.</div>
        )}
      </div>
    </div>
  );
};

export default TeacherGradebook;