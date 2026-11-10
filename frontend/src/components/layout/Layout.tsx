import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top on page transition
  useEffect(() => {
    if (contentWrapperRef.current) {
      contentWrapperRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [location.pathname]);

  return (
    <div
      className="app-container bg-[#f1f5f9] h-screen h-[100dvh] w-full max-w-full overflow-hidden flex"
      style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', width: '100%', overflow: 'hidden' }}
    >
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div
        ref={contentWrapperRef}
        className="app-content-wrapper bg-[#f1f5f9] h-screen h-[100dvh] flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-w-0"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#f1f5f9',
        }}
      >
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main
          className="app-main-content bg-[#f1f5f9] p-3 sm:p-5 lg:p-6 w-full max-w-full overflow-x-hidden flex-1"
          style={{
            flex: 1,
            maxWidth: '1540px',
            overflowX: 'hidden',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#f1f5f9',
          }}
        >
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default Layout;
