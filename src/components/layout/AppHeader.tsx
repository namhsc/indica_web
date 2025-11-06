import React from 'react';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';

interface AppHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function AppHeader({ sidebarOpen, onToggleSidebar }: AppHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-600 hidden md:block">
              {new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

