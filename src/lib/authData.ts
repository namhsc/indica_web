import { User } from '../types/auth';

// Mock users for demo
export const mockUsers: (User & { password: string })[] = [
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin',
    fullName: 'Nguyễn Văn Quản',
    role: 'admin',
    email: 'admin@gmail.com',
  },
  {
    id: 'rec1',
    username: 'letan',
    password: 'letan',
    fullName: 'Nguyễn Thị Lan',
    role: 'receptionist',
    email: 'letan@gmail.com',
  },
  {
    id: 'doc1',
    username: 'bacsi',
    password: 'bacsi',
    fullName: 'BS. Nguyễn Văn An',
    role: 'doctor',
    email: 'bacsi@gmail.com',
    specialty: 'Nội khoa',
  },
  {
    id: 'tech1',
    username: 'dieuduong',
    password: 'dieuduong',
    fullName: 'Nguyễn Thị Hoa',
    role: 'nurse',
    email: 'dieuduong@gmail.com',
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
