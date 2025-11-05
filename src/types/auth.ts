export type UserRole = 'admin' | 'receptionist' | 'doctor' | 'technician';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  avatar?: string;
  specialty?: string; // For doctors
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}
