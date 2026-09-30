import { useEffect, useState } from 'react';

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );

  useEffect(() => {
    const onResize = () => window.innerWidth >= 992 && setIsOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleCollapse = () =>
    setIsCollapsed((v) => {
      const next = !v;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });

  return {
    isOpen,
    isCollapsed,
    toggle: () => setIsOpen((v) => !v),
    close: () => setIsOpen(false),
    toggleCollapse,
  };
}