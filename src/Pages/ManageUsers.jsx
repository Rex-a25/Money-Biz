import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Save, MessageSquare, CheckCircle, Calculator, Search } from 'lucide-react';

const GradingBook = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('JSS 1');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);

  // Message Modal State
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [message, setMessage] = useState("");

  // 1. Fetch Students
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("classAssigned", "==", selectedClass)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedClass]);

  // 2. Helper: Calculate Grade
  const calculateGrade = (total) => {
    if (total >= 70) return 'A';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 45) return 'D';
    return 'F';
  };

  // 3. Handle Input Change
  const handleScoreChange = (studentId, field, value) => {
    const val = parseFloat(value) || 0;

    setGrades(prev => {
      const studentGrades = prev[studentId] || { test: 0, assignment: 0, exam: 0 };
      const updatedStudent = { ...studentGrades, [field]: val };

      updatedStudent.total = updatedStudent.test + updatedStudent.assignment + updatedStudent.exam;
      updatedStudent.grade = calculateGrade(updatedStudent.total);

      return { ...prev, [studentId]: updatedStudent };
    });
  };

  // 4. Save Grade
  const handleSaveGrade = async (studentId) => {
    if (!grades[studentId]) return;

    try {
      const gradeId = `${studentId}_${selectedSubject}`;
      await setDoc(doc(db, "grades", gradeId), {
        studentId,
        studentName: students.find(s => s.id === studentId).name,
        class: selectedClass,
        subject: selectedSubject,
        ...grades[studentId],
        updatedAt: serverTimestamp()
      });
      alert("Grade Saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving grade.");
    }
  };

  // 5. Send Message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await setDoc(doc(db, "remarks", `${currentStudent.id}_${Date.now()}`), {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        teacherName: localStorage.getItem('userName'),
        message: message,
        createdAt: serverTimestamp(),
        read: false
      });
      setIsMessageOpen(false);
      setMessage("");
      alert(`Message sent to ${currentStudent.name}`);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="animate-fade-in-up pb-20">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Grading Book</h2>
          <p className="text-gray-500 text-sm">Input scores and remarks for your students.</p>
        </div>

        <div className="flex gap-3">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Class</label>
            <select
              className="block w-32 border p-2 rounded-lg font-bold text-gray-700 bg-gray-50"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="JSS 1">JSS 1</option>
              <option value="JSS 2">JSS 2</option>
              <option value="SSS 1">SSS 1</option>
              <option value="SSS 2">SSS 2</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
            <select
              className="block w-40 border p-2 rounded-lg font-bold text-gray-700 bg-gray-50"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Physics">Physics</option>
              <option value="Business">Business</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4 w-24">Test (20)</th>
              <th className="p-4 w-24">Assg (10)</th>
              <th className="p-4 w-24">Exam (70)</th>
              <th className="p-4 w-20">Total</th>
              <th className="p-4 w-16">Grade</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center">Loading Class List...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">No students found in {selectedClass}.</td></tr>
            ) : (
              students.map((student) => {
                const g = grades[student.id] || { test: 0, assignment: 0, exam: 0, total: 0, grade: '-' };

                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-700">{student.name}</td>

                    <td className="p-4">
                      <input type="number" className="w-16 border rounded p-1 text-center"
                        placeholder="0" max="20"
                        onChange={(e) => handleScoreChange(student.id, 'test', e.target.value)}
                      />
                    </td>
                    <td className="p-4">
                      <input type="number" className="w-16 border rounded p-1 text-center"
                        placeholder="0" max="10"
                        onChange={(e) => handleScoreChange(student.id, 'assignment', e.target.value)}
                      />
                    </td>
                    <td className="p-4">
                      <input type="number" className="w-16 border rounded p-1 text-center"
                        placeholder="0" max="70"
                        onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                      />
                    </td>

                    <td className="p-4 font-bold text-blue-600">{g.total}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${g.grade === 'A' ? 'bg-green-100 text-green-700' :
                          g.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {g.grade}
                      </span>
                    </td>

                    <td className="p-4 flex gap-2 justify-center">
                      <button onClick={() => handleSaveGrade(student.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <Save size={18} />
                      </button>
                      <button onClick={() => { setCurrentStudent(student); setIsMessageOpen(true); }} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100">
                        <MessageSquare size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isMessageOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold mb-2">Message {currentStudent?.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Send a report remark or private note to the student/parent.</p>

            <textarea
              className="w-full border p-3 rounded-xl h-32 outline-none focus:border-purple-500"
              placeholder="e.g. Needs to improve in Algebra."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setIsMessageOpen(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSendMessage} className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Send Note</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GradingBook; 