import type { ReactNode } from 'react';

export type RouteHandle = {
  title?: string;
  subtitle?: string;
  breadcrumb?: { label: string; path?: string }[];
  actions?: ReactNode;
};