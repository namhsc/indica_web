import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { LogOut, User, Shield, ChevronDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const roleLabels = {
  admin: 'Quản trị viên',
  receptionist: 'Lễ tân',
  doctor: 'Bác sĩ',
  nurse: 'Điều dưỡng',
};

const roleGradients = {
  admin: 'from-red-500 to-orange-500',
  receptionist: 'from-blue-500 to-cyan-500',
  doctor: 'from-emerald-500 to-teal-500',
  nurse: 'from-violet-500 to-purple-500',
};

const roleIcons = {
  admin: '👑',
  receptionist: '🏥',
  doctor: '👨‍⚕️',
  nurse: '🔬',
};

export function UserProfile() {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/50 transition-all">
            <Avatar className={`h-9 w-9 bg-gradient-to-br ${roleGradients[user.role]} shadow-lg`}>
              <AvatarFallback className="bg-transparent text-white">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm">{user.fullName}</div>
              <div className="text-xs text-gray-600">{roleLabels[user.role]}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-lg border-gray-200">
          <DropdownMenuLabel className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className={`h-12 w-12 bg-gradient-to-br ${roleGradients[user.role]} shadow-lg ring-2 ring-white`}>
                <AvatarFallback className="bg-transparent text-white text-lg">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{roleIcons[user.role]}</span>
                  <span className="text-sm">{user.fullName}</span>
                </div>
                <Badge className={`bg-gradient-to-r ${roleGradients[user.role]} text-white border-0 shadow-sm`}>
                  {roleLabels[user.role]}
                </Badge>
                {user.specialty && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <span>Chuyên khoa:</span>
                    <span className="text-gray-900">{user.specialty}</span>
                  </div>
                )}
                <div className="text-xs text-gray-600">{user.email}</div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
            <User className="h-4 w-4 mr-2 text-gray-600" />
            Thông tin cá nhân
          </DropdownMenuItem>
          {user.role === 'admin' && (
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
              <Shield className="h-4 w-4 mr-2 text-gray-600" />
              Quản lý hệ thống
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
            >
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
