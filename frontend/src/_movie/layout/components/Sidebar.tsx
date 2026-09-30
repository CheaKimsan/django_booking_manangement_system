import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_SECTIONS } from '../../constants/nav';
import { MOCK_USER } from '../../data/user.mock';

type SidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose }) => {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className={`dash-sidebar ${isOpen ? 'show' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-mark"><i className="bi bi-film" /></div>
        <div className="logo-text-wrap">
          <div className="logo-text">LEGEND<span>.</span></div>
          <div className="logo-sub">Admin Console</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="nav-section">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
              >
                <i className={`bi ${item.icon}`} />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badgeVariant === 'soft' ? 'soft' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{MOCK_USER.initials}</div>
          <div className="user-info">
            <div className="user-info-name">{MOCK_USER.name}</div>
            <div className="user-info-email">{MOCK_USER.email}</div>
          </div>
          <i className="bi bi-three-dots-vertical" style={{ color: 'var(--text-dim)' }} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;