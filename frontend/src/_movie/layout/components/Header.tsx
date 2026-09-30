import React, { useEffect, useRef, useState } from 'react';
import type { RouteHandle } from '../../types/layout';
import {MOCK_NOTIFICATIONS} from "../../data/notification.mock";
import {useAuth} from "../../../app/modules/auth/AuthContext";

type HeaderProps = {
  meta: RouteHandle;
  isCollapsed: boolean;
  onMenuClick: () => void;
  onCollapseClick: () => void;
};

// Tiny hook for closing dropdowns when clicking outside
function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

const Header: React.FC<HeaderProps> = ({
  meta,
  isCollapsed,
  onMenuClick,
  onCollapseClick,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => setShowNotifications(false));
  useClickOutside(userRef, () => setShowUserMenu(false));

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  const {logout,user} = useAuth();
  // ⌘K / Ctrl+K opens search
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="dash-topbar">
      {/* Left cluster: toggles + title */}
      <button
        className="icon-btn mobile-only"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <i className="bi bi-list" />
      </button>

      <button
        className="icon-btn desktop-only"
        onClick={onCollapseClick}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i className={`bi ${isCollapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'}`} />
      </button>

      <div className="topbar-title-wrap">
        {meta.breadcrumb && (
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            {meta.breadcrumb.map((c, i) => {
              const isLast = i === meta.breadcrumb!.length - 1;
              return (
                <React.Fragment key={i}>
                  {i > 0 && <span className="breadcrumb-sep">/</span>}
                  <span className={`breadcrumb-item ${isLast ? 'current' : ''}`}>
                    {c.label}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="page-title">{meta.title ?? 'Dashboard'}</h1>
        {meta.subtitle && <p className="page-title-sub">{meta.subtitle}</p>}
      </div>

      {/* Center: search */}
      <div className="search-wrap">
        <i className="bi bi-search search-icon" />
        <input
          ref={searchRef}
          type="text"
          className="search-input"
          placeholder="Search movies, bookings, users..."
          aria-label="Search"
        />
        <span className="kbd">⌘K</span>
      </div>

      {/* Page-specific actions slot */}
      {meta.actions && <div className="topbar-actions">{meta.actions}</div>}

      {/* Notifications */}
      <div className="dropdown-wrap" ref={notifRef}>
        <button
          className={`icon-btn ${showNotifications ? 'is-active' : ''}`}
          onClick={() => {
            setShowNotifications((v) => !v);
            setShowUserMenu(false);
          }}
          aria-label="Notifications"
          aria-expanded={showNotifications}
        >
          <i className="bi bi-bell" />
          {unreadCount > 0 && <span className="dot" />}
        </button>

        {showNotifications && (
          <div className="dropdown-panel notif-panel">
            <div className="dropdown-head">
              <span className="dropdown-title">Notifications</span>
              <span className="dropdown-pill">{unreadCount} new</span>
            </div>

            <div className="notif-list">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${n.unread ? 'unread' : ''}`}
                >
                  <span className="notif-dot" />
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-desc">{n.description}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dropdown-foot">
              <button className="dropdown-link">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="dropdown-wrap" ref={userRef}>
        <button
          className={`user-chip ${showUserMenu ? 'is-active' : ''}`}
          onClick={() => {
            setShowUserMenu((v) => !v);
            setShowNotifications(false);
          }}
          aria-label="User menu"
          aria-expanded={showUserMenu}
        >
          <span className="user-chip-avatar">AD</span>
          <span className="user-chip-info">
            <span className="user-chip-name"></span>
              {
                  user?.username
              }
            <span className="user-chip-role">{user?.role}</span>
          </span>
          <i className="bi bi-chevron-down user-chip-caret" />
        </button>

        {showUserMenu && (
          <div className="dropdown-panel user-panel">
            <div className="user-panel-head">
              <span className="user-chip-avatar lg">AD</span>
              <div>
                <div className="user-panel-name">{user?.username}</div>
                <div className="user-panel-email">{user?.email}</div>
              </div>
            </div>

            <div className="dropdown-divider" />

            <button className="dropdown-item">
              <i className="bi bi-person" /> My Profile
            </button>
            <button className="dropdown-item">
              <i className="bi bi-gear" /> Account Settings
            </button>
            <button className="dropdown-item">
              <i className="bi bi-question-circle" /> Help & Support
            </button>

            <div className="dropdown-divider" />

            <button className="dropdown-item danger" onClick={logout}>
              <i className="bi bi-box-arrow-right" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;