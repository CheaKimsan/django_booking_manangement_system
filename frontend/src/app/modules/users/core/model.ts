export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'THEATER_MANAGER' ;
  profile_picture: string | null;
  phone_number: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}