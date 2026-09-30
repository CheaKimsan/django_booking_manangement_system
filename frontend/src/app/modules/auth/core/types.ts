export type Role = 'ADMIN' | 'CUSTOMER' | 'THEATER_MANAGER';

// Matches what UserProfileSerializer returns
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone_number: string | null;
  address: string | null;
  profile_picture: string | null;
  date_of_birth: string | null;
  created_at: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface AuthContextState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  userProfile: () => Promise<void>;
}