import React from 'react';
import { LayoutDashboard, Users, CreditCard, BookOpen, GraduationCap, ClipboardCheck, LogOut, X } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Sidebar = ({ activePage, setActivePage, isInverse = false, userRole = 'admin', isOpen, onClose }) => {
  
  // Define Menus
  const adminMenu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'customers', label: 'All Students', icon: Users },
    { id: 'staff', label: 'Manage Staff', icon: BookOpen }
  ];

  const teacherMenu = [
    { id: 'dashboard', label: 'Class Overview', icon: LayoutDashboard },
    { id: 'my-students', label: 'My Students', icon: Users },
    { id: 'grading', label: 'Grading Book', icon: GraduationCap },
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'My Portal', icon: LayoutDashboard },
    { id: 'grades', label: 'My Results', icon: GraduationCap },
  ];

  let currentMenu = adminMenu;
  if (userRole === 'teacher') currentMenu = teacherMenu;
  if (userRole === 'student') currentMenu = studentMenu;

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <>
      {/* MOBILE OVERLAY (Click to close) */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`
          fixed md:static inset-y-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isInverse ? 'bg-white order-2 md:border-l' : 'bg-white order-1 md:border-r'} 
          border-gray-200 flex flex-col shadow-2xl md:shadow-none
          ${isInverse && isOpen ? 'right-0 left-auto' : 'left-0 right-auto'} 
        `}
      >
        {/* LOGO AREA */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <h1 className={`text-2xl font-extrabold ${isInverse ? 'text-purple-700' : 'text-gray-800'}`}>
            Biz<span className="text-purple-600">Pilot</span>
          </h1>
          {/* Close Button (Mobile Only) */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-2">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); onClose(); }} // Close sidebar on mobile when clicked
              className={`
                w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition relative
                ${activePage === item.id 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
              `}
            >
              {activePage === item.id && (
                <span className={`absolute top-0 bottom-0 w-1 bg-purple-600 ${isInverse ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'}`} />
              )}
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* FOOTER: ROLE INFO & LOGOUT */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className={`p-3 rounded-xl ${isInverse ? 'bg-purple-50' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500 text-center font-bold capitalize">
              {userRole} Account
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;