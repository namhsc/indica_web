import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Stethoscope, 
  FlaskConical, 
  FolderCheck, 
  FolderOpen
} from 'lucide-react';
import { UserRole } from '../../types/auth';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

interface AppSidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole | undefined;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'ai',
    label: 'Trợ lý AI',
    icon: LayoutDashboard,
    roles: ['admin', 'receptionist', 'doctor', 'nurse'],
  },
  {
    id: 'records',
    label: 'Hồ sơ',
    icon: FolderOpen,
    roles: ['admin', 'receptionist', 'doctor', 'nurse'],
  },
  {
    id: 'doctor',
    label: 'Bác sĩ',
    icon: Stethoscope,
    roles: ['admin', 'doctor'],
  },
  {
    id: 'nurse',
    label: 'Điều dưỡng',
    icon: FlaskConical,
    roles: ['admin', 'nurse'],
  },
  {
    id: 'return',
    label: 'Trả hồ sơ',
    icon: FolderCheck,
    roles: ['admin', 'receptionist'],
  },
];

export function AppSidebar({ isOpen, activeTab, onTabChange, userRole }: AppSidebarProps) {
  const canAccessItem = (item: NavigationItem): boolean => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  };

  const accessibleItems = navigationItems.filter(canAccessItem);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed lg:sticky top-[65px] left-0 h-[calc(100vh-65px)] w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 shadow-lg z-30 overflow-y-auto"
        >
          <nav className="p-4 space-y-2">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onTabChange(item.id);
                    if (window.innerWidth < 1024) {
                      // Close sidebar on mobile after selection
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-700 hover:bg-gray-100/80'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

