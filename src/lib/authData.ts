import { User } from '../types/auth';

// Mock users for demo
export const mockUsers: (User & { password: string })[] = [
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
    fullName: 'Nguyễn Văn Quản',
    role: 'admin',
    email: 'admin@hospital.com',
  },
  {
    id: 'rec1',
    username: 'letan',
    password: 'letan123',
    fullName: 'Nguyễn Thị Lan',
    role: 'receptionist',
    email: 'lan.nguyen@hospital.com',
  },
  {
    id: 'doc1',
    username: 'bsan',
    password: 'bs123',
    fullName: 'BS. Nguyễn Văn An',
    role: 'doctor',
    email: 'an.nguyen@hospital.com',
    specialty: 'Nội khoa',
  },
  {
    id: 'tech1',
    username: 'ktv',
    password: 'ktv123',
    fullName: 'KTV. Nguyễn Thị Hoa',
    role: 'technician',
    email: 'hoa.nguyen@hospital.com',
  },
];

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};
