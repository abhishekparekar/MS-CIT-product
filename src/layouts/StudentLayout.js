import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/DashboardHeader'; // Reuse the generic Header
import '../styles/global.css';
import '../styles/dashboard.css';

const studentMenuItems = [
  { label: 'Dashboard', path: '/student/dashboard', icon: 'dashboard' },
    { label: 'Profile', path: '/student/profile', icon: 'profile' },
  { label: 'Receipt', path: '/student/receipt', icon: 'receipt' },
    { label: 'Exam', path: '/student/exam', icon: 'exam' },

];

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <div className="student-layout">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        menuItems={studentMenuItems}
        userRole="student"
      />
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header title="Student Dashboard" onMenuClick={toggleSidebar} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
