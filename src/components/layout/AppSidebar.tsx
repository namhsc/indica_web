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
	User,
	Calendar,
	Pill,
	FileText,
	Bell,
	Package,
	Users,
	Settings,
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
	children?: NavigationItem[];
	badge?: number;
}

interface AppSidebarProps {
	isOpen: boolean;
	activeTab: string;
	onTabChange: (tab: string) => void;
	onToggleSidebar: () => void;
	userRole: UserRole | undefined;
	unreadNotificationsCount?: number;
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
	{
		id: 'services',
		label: 'Quản lý Dịch vụ',
		icon: Settings,
		roles: ['admin'],
	},
	{
		id: 'service-packages',
		label: 'Quản lý Gói dịch vụ',
		icon: Package,
		roles: ['admin'],
	},
	{
		id: 'staff',
		label: 'Quản lý Nhân viên',
		icon: Users,
		roles: ['admin'],
	},
	{
		id: 'medications',
		label: 'Danh mục Thuốc',
		icon: Pill,
		roles: ['admin'],
	},
	// Patient menu items - displayed directly without parent menu
	{
		id: 'ai',
		label: 'Trợ lý AI',
		icon: LayoutDashboard,
		roles: ['patient'],
	},
	{
		id: 'patient-treatment',
		label: 'Phác đồ điều trị',
		icon: Pill,
		roles: ['patient'],
	},
];

export function AppSidebar({
	isOpen,
	activeTab,
	onTabChange,
	onToggleSidebar,
	userRole,
	unreadNotificationsCount = 0,
}: AppSidebarProps) {
	const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
		new Set(),
	);

	const canAccessItem = (item: NavigationItem): boolean => {
		if (!userRole) return false;
		return item.roles.includes(userRole);
	};

	const accessibleItems = navigationItems.filter(canAccessItem);

	const toggleExpand = (itemId: string) => {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(itemId)) {
			newExpanded.delete(itemId);
		} else {
			newExpanded.add(itemId);
		}
		setExpandedItems(newExpanded);
	};

	const isItemActive = (item: NavigationItem): boolean => {
		if (activeTab === item.id) return true;
		if (item.children) {
			return item.children.some((child) => activeTab === child.id);
		}
		return false;
	};

	const isChildActive = (child: NavigationItem): boolean => {
		return activeTab === child.id;
	};

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
							const isActive = isItemActive(item);
							const isExpanded = expandedItems.has(item.id);
							const hasChildren = item.children && item.children.length > 0;
							// Show badge for notifications
							const showBadge =
								item.id === 'patient-notifications' &&
								unreadNotificationsCount > 0;

							return (
								<div key={item.id} className="space-y-1">
									<motion.button
										whileHover={{ scale: 1.02, x: 4 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => {
											if (hasChildren) {
												toggleExpand(item.id);
											} else {
												onTabChange(item.id);
											}
											if (window.innerWidth < 1024) {
												// Close sidebar on mobile after selection
											}
										}}
										className={`
                      w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                      ${
												isActive
													? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
													: 'text-gray-700 hover:bg-gray-100/80'
											}
                    `}
									>
										<div className="flex items-center gap-3 flex-1">
											<Icon className="h-5 w-5 flex-shrink-0" />
											<span className="text-sm">{item.label}</span>
										</div>
										<div className="flex items-center gap-2">
											{showBadge && (
												<span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
													{unreadNotificationsCount}
												</span>
											)}
											{hasChildren && (
												<motion.div
													animate={{ rotate: isExpanded ? 90 : 0 }}
													transition={{ duration: 0.2 }}
												>
													<X className="h-4 w-4 rotate-45" />
												</motion.div>
											)}
										</div>
									</motion.button>

									{/* Children menu */}
									{hasChildren && isExpanded && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.2 }}
											className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2"
										>
											{item.children
												?.filter((child) => canAccessItem(child))
												.map((child) => {
													const ChildIcon = child.icon;
													const childIsActive = isChildActive(child);
													const childShowBadge =
														child.id === 'patient-notifications' &&
														unreadNotificationsCount > 0;

													return (
														<motion.button
															key={child.id}
															whileHover={{ scale: 1.02, x: 4 }}
															whileTap={{ scale: 0.98 }}
															onClick={() => {
																onTabChange(child.id);
																if (window.innerWidth < 1024) {
																	// Close sidebar on mobile after selection
																}
															}}
															className={`
                                w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm
                                ${
																	childIsActive
																		? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'
																		: 'text-gray-600 hover:bg-gray-100/80'
																}
                              `}
														>
															<ChildIcon className="h-4 w-4 flex-shrink-0" />
															<span className="flex-1 text-left">
																{child.label}
															</span>
															{(child.badge && child.badge > 0) ||
															childShowBadge ? (
																<span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
																	{childShowBadge
																		? unreadNotificationsCount
																		: child.badge}
																</span>
															) : null}
														</motion.button>
													);
												})}
										</motion.div>
									)}
								</div>
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
