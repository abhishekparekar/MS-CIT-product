import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/DashboardHeader';
import '../styles/global.css';
import '../styles/dashboard.css';

const franchiseMenuItems = [
  { label: 'Dashboard', path: '/franchise/dashboard', icon: 'dashboard' },
  { label: 'Application Form', path: '/franchise/application-form', icon: 'form' },
  { label: 'Coaching', path: '/franchise/coaching', icon: 'coaching' },
  { label: 'Fees', path: '/franchise/fees', icon: 'fees' },
  { label: 'Messages', path: '/franchise/messages', icon: 'message' },
  {
    label: 'Forms', icon: 'form', subItems: [
      { label: 'Exam Form', path: '/franchise/forms/exam' },
      { label: 'Hall Ticket Form', path: '/franchise/forms/hall-ticket' }, // Recently added
      { label: 'Certificate Form', path: '/franchise/forms/certificate' },
      { label: 'Marksheet Form', path: '/franchise/forms/marksheet' },
      { label: 'ID Form', path: '/franchise/forms/id' }
    ]
  },
  {
    label: 'Downloads', icon: 'download', subItems: [
      { label: 'Hall Ticket', path: '/franchise/downloads/hall-ticket' },
      { label: 'Certificate Download', path: '/franchise/downloads/certificate' },
      { label: 'Marksheet Download', path: '/franchise/downloads/marksheet' },
      { label: 'ID Download', path: '/franchise/downloads/id' }
    ]
  },
  {
    label: 'Students', icon: 'student', subItems: [
      { label: 'Approved Students', path: '/franchise/students/approved' }, // Recently added
      { label: 'Passed Students', path: '/franchise/students/passed' },
      { label: 'Certificates', path: '/franchise/students/certificates' },
      { label: 'Results', path: '/franchise/students/results' }
    ]
  }
];

const FranchiseLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <div className="franchise-layout">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        menuItems={franchiseMenuItems}
        userRole="franchise"
      />
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header title="Franchise Dashboard" onMenuClick={toggleSidebar} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default FranchiseLayout;
