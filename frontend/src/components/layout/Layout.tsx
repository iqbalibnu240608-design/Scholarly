import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  return (
    <div
      className="app-container bg-[#f1f5f9] min-h-screen"
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', width: '100%' }}
    >
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div
        className="app-content-wrapper bg-[#f1f5f9] min-h-screen"
        style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: '100vh', backgroundColor: '#f1f5f9' }}
      >
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main
          className="app-main-content bg-[#f1f5f9] p-3 sm:p-5 lg:p-6"
          style={{
            flex: 1,
            maxWidth: '1540px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#f1f5f9',
          }}
        >
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default Layout;
