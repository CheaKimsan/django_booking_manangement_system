export type NavItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  badgeVariant?: 'solid' | 'soft';
};

export type NavSection = {
  title: string;
  items: NavItem[];
};