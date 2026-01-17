import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Trophy, AlertCircle, Quote } from 'lucide-react';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine who we are looking at (Real ID or Simulated ID)
  const studentId = localStorage.getItem('simulatedId') || localStorage.getItem('userId');

  useEffect(() => {
    const fetchGrades = async () => {
      if (!studentId) return;

      try {
        // Query grades where studentId matches current user
        const q = query(
          collection(db, "grades"), 
          where("studentId", "==", studentId),
          orderBy("date", "desc") // Show newest first
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(data);
      } catch (error) {
        console.error("Error loading results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId]);

  if (loading) return <div className="text-purple-200 animate-pulse">Loading your report card...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Trophy className="text-yellow-400" /> Academic Results
      </h2>

      {results.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl text-center text-purple-200">
          No grades have been published yet. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((grade) => (
            <div key={grade.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-xl transition hover:bg-white/15 group">
              
              {/* Top Row: Subject & Score */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{grade.subject}</h3>
                  <p className="text-xs text-purple-300 uppercase tracking-wider">{grade.term || 'Term 1'}</p>
                </div>
                <div className={`text-2xl font-black ${grade.score >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {grade.score}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full ${grade.score >= 50 ? 'bg-green-500' : 'bg-red-500'}`} 
                  style={{ width: `${grade.score}%` }}
                ></div>
              </div>

              {/* Teacher Feedback Section */}
              <div className="bg-black/20 p-3 rounded-lg flex gap-3 items-start">
                 <Quote size={16} className="text-purple-300 shrink-0 mt-1" />
                 <div>
                   <p className="text-sm text-purple-100 italic">"{grade.feedback}"</p>
                   <p className="text-xs text-purple-400 mt-1 text-right font-medium">- {grade.teacherName}</p>
                 </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResults;