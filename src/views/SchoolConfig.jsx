import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Plus, Trash2, Settings } from 'lucide-react';

const SchoolConfig = () => {
  const [config, setConfig] = useState({
    classes: ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'], // Defaults
    subjects: ['Mathematics', 'English', 'Physics', 'Biology'],
    currentTerm: 'First Term 2025/2026'
  });
  
  const [newClass, setNewClass] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Settings on Load
  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "schoolConfig");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // 2. Save Settings
  const saveConfig = async (newConfig) => {
    setConfig(newConfig);
    await setDoc(doc(db, "settings", "schoolConfig"), newConfig);
  };

  // Handlers
  const addClass = () => {
    if(newClass && !config.classes.includes(newClass)) {
      saveConfig({ ...config, classes: [...config.classes, newClass] });
      setNewClass('');
    }
  };

  const removeClass = (cls) => {
    saveConfig({ ...config, classes: config.classes.filter(c => c !== cls) });
  };

  const addSubject = () => {
    if(newSubject && !config.subjects.includes(newSubject)) {
      saveConfig({ ...config, subjects: [...config.subjects, newSubject] });
      setNewSubject('');
    }
  };

  const removeSubject = (subj) => {
    saveConfig({ ...config, subjects: config.subjects.filter(s => s !== subj) });
  };

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="bg-purple-900 text-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
           <Settings /> School Configuration
        </h2>
        <p className="opacity-80">Manage classes, subjects, and academic terms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- 1. MANAGE CLASSES --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">Active Classes</h3>
          <div className="flex gap-2 mb-4">
            <input 
              className="border p-2 rounded-lg w-full" 
              placeholder="e.g. Primary 1" 
              value={newClass}
              onChange={e => setNewClass(e.target.value)}
            />
            <button onClick={addClass} className="bg-green-600 text-white p-2 rounded-lg"><Plus/></button>
          </div>
          <div className="space-y-2">
            {config.classes.map(c => (
              <div key={c} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span>{c}</span>
                <button onClick={() => removeClass(c)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* --- 2. MANAGE SUBJECTS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">School Subjects</h3>
          <div className="flex gap-2 mb-4">
            <input 
              className="border p-2 rounded-lg w-full" 
              placeholder="e.g. Chemistry" 
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
            />
            <button onClick={addSubject} className="bg-green-600 text-white p-2 rounded-lg"><Plus/></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.subjects.map(s => (
              <span key={s} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                {s}
                <button onClick={() => removeSubject(s)} className="text-blue-300 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* --- 3. TERM MANAGEMENT (THE RESET BUTTON) --- */}
        <div className="col-span-1 md:col-span-2 bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
           <h3 className="font-bold text-yellow-800 mb-2">Current Academic Session</h3>
           <p className="text-sm text-yellow-700 mb-4">
             Changing this creates a "Fresh Page" for attendance and grades. Old data is saved under the previous name.
           </p>
           <div className="flex gap-4 items-center">
              <input 
                className="border border-yellow-300 p-3 rounded-xl w-full font-bold text-gray-700"
                value={config.currentTerm}
                onChange={(e) => saveConfig({...config, currentTerm: e.target.value})}
              />
              <button className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-700 shrink-0">
                 Update Term
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SchoolConfig;