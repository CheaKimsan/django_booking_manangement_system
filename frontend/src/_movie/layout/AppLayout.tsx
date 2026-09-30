import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { useSidebar } from './core/useSidebar';

// Page meta lookup — keyed by route prefix
const PAGE_META: Record<
  string,
  {
    title: string;
    subtitle?: string;
    breadcrumb?: { label: string }[];
  }
> = {
  '/dashboard': {
    title: 'Dashboard Overview',
    subtitle: "Welcome back, here's what's happening today.",
    breadcrumb: [{ label: 'Home' }, { label: 'Dashboard' }],
  },
  '/movies': {
    title: 'Movie Library',
    subtitle: 'Manage your catalogue and showtimes.',
    breadcrumb: [{ label: 'Home' }, { label: 'Movies' }],
  },
  '/bookings': {
    title: 'Bookings',
    subtitle: 'All customer reservations.',
    breadcrumb: [{ label: 'Home' }, { label: 'Bookings' }],
  },
};

const AppLayout: React.FC = () => {
  const { isOpen, isCollapsed, toggle, close, toggleCollapse } = useSidebar();
  const { pathname } = useLocation();

  const metaKey = Object.keys(PAGE_META).find((key) => pathname.startsWith(key));
  const meta = metaKey ? PAGE_META[metaKey] : { title: 'Dashboard' };

  React.useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <div className={`dash-root ${isCollapsed ? 'is-collapsed' : ''}`}>
      <Sidebar isOpen={isOpen} isCollapsed={isCollapsed} onClose={close} />

      <div
        className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      <div className="dash-main">
        <Header
          meta={meta}
          isCollapsed={isCollapsed}
          onMenuClick={toggle}
          onCollapseClick={toggleCollapse}
        />

        <main className="dash-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;