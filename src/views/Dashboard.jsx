import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// --- COMPONENTS ---
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';
import Customers from './Customers';
import Transactions from './Transactions';
import ManageUsers from './ManageUsers';
import TeacherGradebook from './TeacherGradebook';
import StudentResults from './StudentResults';
import SchoolConfig from './SchoolConfig';        
import AttendanceRegister from './AttendanceRegister'; 

// --- ICONS ---
import { Users, DollarSign, TrendingUp, CreditCard, BookOpen, ClipboardCheck, Menu, Lock, Eye, Calendar, LogOut } from 'lucide-react';

const Dashboard = () => {
  
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- 1. IDENTITY LOGIC ---
  const realRole = localStorage.getItem('userRole') || 'student'; 
  const simulatedId = localStorage.getItem('simulatedId');
  const simulatedRole = localStorage.getItem('simulatedRole');
  const simulatedName = localStorage.getItem('simulatedName');

  // This is the "Base Role" (Who you are logged in as physically)
  const baseRole = simulatedRole || realRole;
  
  const userName = simulatedName || localStorage.getItem('userName') || 'User';
  const userTitle = simulatedId ? `Viewing as ${simulatedRole}` : (localStorage.getItem('userTitle') || baseRole);

  // --- 2. VIEW LOGIC (The Switcher) ---
  // We initialize the view based on the logged-in user
  const [viewRole, setViewRole] = useState(baseRole); 

  // --- 3. DISPLAY HELPERS (FIXED) ---
  // These now listen to 'viewRole', so the buttons actually work!
  const isStudentView = viewRole === 'student';
  const isTeacherView = viewRole === 'teacher';
  const isAdminView = viewRole === 'admin';

  // --- DATA STATE ---
  const [stats, setStats] = useState({ revenue: 0, customers: 0, pending: 0, profit: 0 });
  const [recentTxns, setRecentTxns] = useState([]);

  // --- 4. FETCH ADMIN DATA ---
  useEffect(() => {
    // Only fetch finance data if we are ACTUALLY an admin (security check)
    if (realRole !== 'admin') return; 

    const unsubTxns = onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snapshot) => {
        let rev = 0; let exp = 0; let pend = 0;
        const txns = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            txns.push({id: doc.id, ...d});
            if(d.type === 'income') { 
              rev += Number(d.amount); 
              if(d.status === 'Pending') pend += Number(d.amount); 
            } else { 
              exp += Number(d.amount); 
            }
        });
        setStats(prev => ({ ...prev, revenue: rev, pending: pend, profit: rev - exp }));
        setRecentTxns(txns.slice(0, 5));
    });

    const unsubCust = onSnapshot(collection(db, "customers"), snap => setStats(prev => ({...prev, customers: snap.size})));
    return () => { unsubTxns(); unsubCust(); };
  }, [realRole]);

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${isStudentView ? 'bg-purple-900 flex-row-reverse' : 'bg-gray-50 flex-row'}`}>
      
      {/* 1. SIDEBAR */}
      {/* We pass 'viewRole' so the sidebar menu changes when you toggle the buttons */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isInverse={isStudentView} 
        userRole={viewRole} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        
        {/* HEADER */}
        <header className={`flex justify-between items-center p-4 md:px-8 z-20 shadow-sm transition-colors duration-300 ${isStudentView ? 'bg-white/10 backdrop-blur-md text-white' : 'bg-white text-gray-800'}`}>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 rounded-lg ${isStudentView ? 'hover:bg-white/20' : 'hover:bg-gray-100'}`}>
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-xl md:text-2xl font-bold capitalize">Welcome, {userName}</h2>
              <div className={`text-sm ${isStudentView ? 'text-purple-200' : 'text-gray-500'} flex items-center gap-2`}>
                <span className="font-medium">{userTitle}</span>
                
                {/* PREVIEW INDICATOR */}
                {realRole === 'admin' && viewRole !== 'admin' && (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                    <Eye size={10}/> Previewing {viewRole}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-3">
             
             {/* GOD MODE SWITCHER (Visible ONLY if you are REAL ADMIN) */}
             {realRole === 'admin' && !simulatedId && (
               <div className={`hidden md:flex rounded-lg p-1 gap-1 text-xs font-bold shadow-inner ${isStudentView ? 'bg-black/20' : 'bg-gray-100'}`}>
                  <button onClick={() => setViewRole('admin')} className={`px-3 py-1 rounded transition ${viewRole === 'admin' ? 'bg-white text-gray-800 shadow' : 'opacity-50 hover:opacity-100'}`}>Admin</button>
                  <button onClick={() => setViewRole('teacher')} className={`px-3 py-1 rounded transition ${viewRole === 'teacher' ? 'bg-white text-gray-800 shadow' : 'opacity-50 hover:opacity-100'}`}>Teacher</button>
                  <button onClick={() => setViewRole('student')} className={`px-3 py-1 rounded transition ${viewRole === 'student' ? 'bg-white text-gray-800 shadow' : 'opacity-50 hover:opacity-100'}`}>Student</button>
               </div>
             )}
             
             {/* EXIT SIMULATION (If viewing a specific user) */}
             {simulatedId && (
                <button onClick={() => {
                   localStorage.removeItem('simulatedId');
                   localStorage.removeItem('simulatedRole');
                   localStorage.removeItem('simulatedName');
                   window.location.reload();
                }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-xs shadow-lg animate-pulse flex items-center gap-1">
                  <LogOut size={14} /> EXIT
                </button>
             )}
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
           <div className={`transition-all duration-300 ${isStudentView ? 'text-white' : 'text-gray-800'}`}>
             
             {/* --- DASHBOARD HOME --- */}
             {activePage === 'dashboard' && (
               <div className="animate-fade-in-up">
                 
                 {isAdminView && (
                   <>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Revenue" value={`₦${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
                        <StatCard title="Active Students" value={stats.customers} icon={Users} color="bg-purple-500" />
                        <StatCard title="Pending Fees" value={`₦${stats.pending.toLocaleString()}`} icon={CreditCard} color="bg-orange-500" />
                        <StatCard title="Net Profit" value={`₦${stats.profit.toLocaleString()}`} icon={TrendingUp} color="bg-blue-500" />
                     </div>
                     <RecentTransactions transactions={recentTxns} />
                   </>
                 )}

                 {isTeacherView && (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <StatCard title="My Students" value="34" icon={Users} color="bg-purple-500" />
                      <StatCard title="Assignments" value="12" icon={BookOpen} color="bg-blue-500" />
                      <StatCard title="Attendance" value="92%" icon={ClipboardCheck} color="bg-green-500" />
                      
                      <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl shadow-sm border mt-4">
  <h3 className="font-bold text-gray-700 mb-4">Quick Actions</h3>
  
  {/* UPDATED CONTAINER: 
      1. grid-cols-1: Forces 1 item per row on mobile (Vertical Stack)
      2. md:grid-cols-3: Forces 3 items per row on laptop (Horizontal)
  */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <button 
      onClick={() => setActivePage('grading')} 
      className="bg-blue-50 text-blue-600 px-4 py-6 rounded-xl font-bold text-sm hover:bg-blue-100 flex flex-col items-center justify-center gap-2 transition w-full"
    >
        <BookOpen size={24}/> 
        <span>Grading Book</span>
    </button>

    <button 
      onClick={() => setActivePage('attendance')} 
      className="bg-green-50 text-green-600 px-4 py-6 rounded-xl font-bold text-sm hover:bg-green-100 flex flex-col items-center justify-center gap-2 transition w-full"
    >
        <Calendar size={24}/> 
        <span>Mark Attendance</span>
    </button>

    <button 
      onClick={() => setActivePage('my-students')} 
      className="bg-purple-50 text-purple-600 px-4 py-6 rounded-xl font-bold text-sm hover:bg-purple-100 flex flex-col items-center justify-center gap-2 transition w-full"
    >
        <Users size={24}/> 
        <span>My Class List</span>
    </button>
    
  </div>
</div>
                   </div>
                 )}

                 {isStudentView && (
                   <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-white/10 border border-white/20 backdrop-blur-lg p-6 rounded-xl">
                        <h3 className="text-purple-200 text-sm">Attendance</h3>
                        <p className="text-3xl font-bold text-white mt-2">95%</p>
                      </div>
                      <div className="bg-white/10 border border-white/20 backdrop-blur-lg p-6 rounded-xl">
                          <h3 className="text-purple-200 text-sm">Next Exam</h3>
                          <p className="text-3xl font-bold text-white mt-2">Mathematics</p>
                      </div>
                    </div>
                    <StudentResults />
                   </>
                 )}
               </div>
             )}

             {/* --- PAGE ACCESS CONTROL --- */}
             {/* Note: We use viewRole to determine if we SHOW the component, 
                 but in a real app you might want 'realRole' for strict security. 
                 For UI switching, viewRole is fine. */}
             
             {activePage === 'transactions' && (
               isAdminView ? <Transactions /> : <div className="text-center mt-10"><Lock className="mx-auto mb-2"/> Access Restricted</div>
             )}

             {(activePage === 'customers' || activePage === 'my-students') && (
                (isAdminView || isTeacherView) ? <Customers /> : <div className="text-center mt-10">Restricted</div>
             )}

             {activePage === 'staff' && (
                isAdminView ? <ManageUsers /> : <div className="text-center mt-10">Restricted Area</div>
             )}

             {activePage === 'grading' && (
                (isTeacherView || isAdminView) ? <TeacherGradebook /> : <div className="text-center mt-10">Restricted Area</div>
             )}

             {activePage === 'attendance' && (
                (isTeacherView || isAdminView) ? <AttendanceRegister /> : <div className="text-center mt-10">Restricted Area</div>
             )}

             {activePage === 'config' && (
                isAdminView ? <SchoolConfig /> : <div className="text-center mt-10">Restricted Area</div>
             )}

           </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;