import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
	LayoutDashboard,
	UserPlus,
	Stethoscope,
	FlaskConical,
	FolderCheck,
	FolderOpen,
	Menu,
	X,
} from 'lucide-react';
import { UserRole } from '../../types/auth';
import logo from '@/assets/images/logo.svg';
import { UserProfile } from '../UserProfile';
import { Button } from '../ui/button';

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
	onToggleSidebar: () => void;
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
		label: 'Khách hàng',
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
		label: 'Trả khách hàng',
		icon: FolderCheck,
		roles: ['admin', 'receptionist'],
	},
];

export function AppSidebar({
	isOpen,
	activeTab,
	onTabChange,
	onToggleSidebar,
	userRole,
}: AppSidebarProps) {
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
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					className="fixed lg:sticky top-0 left-0 h-screen lg:h-full w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 shadow-lg z-30 flex flex-col"
				>
					{/* Logo và tên phòng khám */}
					<div className="p-4 border-b border-gray-200/50 flex-shrink-0">
						{/* Nút toggle sidebar cho mobile */}
						<div className="flex items-center justify-between mb-3 lg:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={onToggleSidebar}
								className="ml-auto"
							>
								{isOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</Button>
						</div>
						<div className="flex flex-col items-center gap-3">
							<div>
								<img
									src={logo}
									alt="Indica Clinic Logo"
									className="h-16 w-16 max-w-[100%] max-h-[100%] object-contain"
								/>
							</div>
							<div className="text-center">
								<h1 className="text-lg font-semibold">Phòng khám Indica</h1>
							</div>
						</div>
					</div>

					{/* Navigation menu - flex-1 để chiếm không gian còn lại */}
					<nav className="p-4 space-y-2 flex-1 overflow-y-auto">
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
                    ${
											isActive
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

					{/* Thông tin tài khoản ở dưới cùng */}
					<div className="p-4 border-t border-gray-200/50 flex-shrink-0">
						<UserProfile />
					</div>
				</motion.aside>
			)}
		</AnimatePresence>
	);
}
