import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/DashboardHeader';
import '../styles/global.css';
import '../styles/dashboard.css';

const adminMenuItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Affiliation List', path: '/admin/students/affiliation-list' },
  { label: 'Approved Affiliation', path: '/admin/students/approved-affiliation' },
 { label: 'Approved Students', path: '/admin/students/approved' },
  { label: 'Franchise Fees', path: '/admin/franchise-fees', icon: 'franchise-fees' },
  { label: 'Franchise student Fees', path: '/admin/franchise-student-fees', icon: 'franchise-student-fees' },
  { label: 'Messages', path: '/admin/messages', icon: 'message' },
  { label: 'Gallery Upload', path: '/admin/gallery-upload', icon: 'upload' },
  {
    label: 'Forms', icon: 'form', subItems: [
      { label: 'Exam Form', path: '/admin/forms/exam' },
      { label: 'Certificate Form', path: '/admin/forms/certificate' },
      { label: 'Marksheet Form', path: '/admin/forms/marksheet' }
    ]
  },
  {
    label: 'Downloads', icon: 'download', subItems: [
      { label: 'Hall Ticket', path: '/admin/downloads/hall-ticket' },
      { label: 'Certificate Download', path: '/admin/downloads/certificate' },
      { label: 'Marksheet Download', path: '/admin/downloads/marksheet' }
    ]
  },
  {
    label: 'Management', icon: 'Management', subItems: [
      { label: 'Payments', path: '/admin/students/payments' },
      { label: 'Results', path: '/admin/students/results' }
    ]
  }
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <div className="admin-layout">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        menuItems={adminMenuItems}
        userRole="Admin"
      />
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header title="Admin Dashboard" onMenuClick={toggleSidebar} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
