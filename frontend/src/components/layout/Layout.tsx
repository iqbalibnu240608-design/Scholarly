import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
          className="app-main-content bg-[#f1f5f9]"
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1540px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#f1f5f9',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
