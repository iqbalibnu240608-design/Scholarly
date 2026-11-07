import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-content-wrapper">
        <Navbar />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
