import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole | UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: React.PropsWithChildren<RoleGuardProps>) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Không có quyền truy cập</AlertTitle>
        <AlertDescription>
          Bạn không có quyền truy cập chức năng này. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
