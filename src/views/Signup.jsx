import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDocs, query, collection, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building, Loader, ArrowRight, Key, CheckCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', schoolName: '', email: '', password: '', 
    licenseCode: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('student'); // 'owner' or 'student'
  const navigate = useNavigate();

  const VALID_CODE = "BIZ-OWNER-2026"; 

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanEmail = formData.email.trim();

      // --- PATH A: SCHOOL OWNER SIGNUP ---
      if (mode === 'owner') {
        if (formData.licenseCode !== VALID_CODE) throw new Error("Invalid License Code.");
        
        // 1. Create Auth
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: formData.name });

        // 2. Create Admin Doc
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: formData.name,
          email: cleanEmail,
          schoolName: formData.schoolName,
          role: 'admin',
          createdAt: serverTimestamp()
        });

        localStorage.setItem('userRole', 'admin');
        navigate('/dashboard');
      } 
      
      // --- PATH B: STUDENT/TEACHER ACTIVATION ---
      else {
        // 1. Check if Admin has pre-registered this email
        const q = query(collection(db, "users"), where("email", "==", cleanEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("This email has not been registered by the school admin yet.");
        }

        // 2. Found the invite! Get the doc reference (it currently has a random ID)
        const inviteDoc = querySnapshot.docs[0];
        const inviteData = inviteDoc.data();

        // 3. Create real Auth Account
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: inviteData.name });

        // 4. Migrate data to the REAL User ID doc
        // We create a new doc with the correct UID, copy the role/class info, and delete the old invite doc
        await setDoc(doc(db, "users", user.uid), {
          ...inviteData,
          uid: user.uid,
          activatedAt: serverTimestamp()
        });
        
        // Optional: Delete the old "invite" doc to keep DB clean
        // await deleteDoc(inviteDoc.ref); 

        localStorage.setItem('userRole', inviteData.role);
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = "Account already exists. Please Login.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl animate-fade-in-up">
        
        {/* Toggle Mode */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => setMode('student')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${mode === 'student' ? 'bg-white text-purple-600 shadow' : 'text-gray-500'}`}
          >
            Staff / Student
          </button>
          <button 
            type="button"
            onClick={() => setMode('owner')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${mode === 'owner' ? 'bg-white text-purple-600 shadow' : 'text-gray-500'}`}
          >
            School Owner
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {mode === 'owner' ? 'Create School' : 'Activate Account'}
          </h1>
          <p className="text-gray-500 text-sm">
            {mode === 'owner' ? 'Enter license code to start.' : 'Enter the email your admin gave you.'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Fields vary by mode */}
          {mode === 'owner' && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
               <input type="text" required className="w-full border p-3 rounded-xl outline-none" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
             </div>
          )}
          
          {mode === 'owner' && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
               <input type="text" required className="w-full border p-3 rounded-xl outline-none" placeholder="Grace High" value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} />
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="name@school.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          {mode === 'owner' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" required className="w-full pl-10 pr-4 py-3 border border-purple-200 bg-purple-50 rounded-xl outline-none text-purple-700 font-mono" placeholder="XXXX-XXXX" value={formData.licenseCode} onChange={(e) => setFormData({...formData, licenseCode: e.target.value})} />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4">
            {loading ? <Loader className="animate-spin" /> : (mode === 'owner' ? 'Create School' : 'Activate Account')}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
           Already active? <Link to="/login" className="text-purple-600 font-bold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;