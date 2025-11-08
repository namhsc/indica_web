import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Notification } from '../../types';
import { Bell, CheckCircle, Info, AlertCircle, AlertTriangle } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../PaginationControls';

interface PatientNotificationsProps {
	notifications: Notification[];
	onUpdateNotification: (notificationId: string, updates: Partial<Notification>) => void;
}

const notificationTypeIcons = {
	info: Info,
	success: CheckCircle,
	warning: AlertTriangle,
	error: AlertCircle,
};

const notificationTypeColors = {
	info: 'bg-blue-100 text-blue-800',
	success: 'bg-green-100 text-green-800',
	warning: 'bg-yellow-100 text-yellow-800',
	error: 'bg-red-100 text-red-800',
};

export function PatientNotifications({
	notifications,
	onUpdateNotification,
}: PatientNotificationsProps) {
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const {
		currentPage,
		totalPages,
		paginatedData: paginatedNotifications,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination({
		data: notifications.sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		}),
		itemsPerPage,
	});

	const handleMarkAsRead = (notificationId: string) => {
		onUpdateNotification(notificationId, { read: true });
	};

	const handleMarkAllAsRead = () => {
		notifications
			.filter((n) => !n.read)
			.forEach((n) => onUpdateNotification(n.id, { read: true }));
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('vi-VN');
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	if (notifications.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-12 text-gray-500">
						<Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
						<p>Bạn chưa có thông báo nào</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold">Thông báo</h3>
					<p className="text-sm text-gray-600">
						{unreadCount > 0
							? `Bạn có ${unreadCount} thông báo chưa đọc`
							: 'Tất cả thông báo đã được đọc'}
					</p>
				</div>
				{unreadCount > 0 && (
					<Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
						Đánh dấu tất cả đã đọc
					</Button>
				)}
			</div>

			<div className="space-y-4">
				{paginatedNotifications.map((notification) => {
					const Icon = notificationTypeIcons[notification.type];
					return (
						<Card
							key={notification.id}
							className={`border-l-4 ${
								notification.read
									? 'border-l-gray-300 bg-gray-50/50'
									: 'border-l-blue-500 bg-white'
							}`}
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-3 flex-1">
										<div
											className={`p-2 rounded-lg ${
												notificationTypeColors[notification.type]
											}`}
										>
											<Icon className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<CardTitle className="text-base flex items-center gap-2">
												{notification.title}
												{!notification.read && (
													<Badge variant="outline" className="text-xs">
														Mới
													</Badge>
												)}
											</CardTitle>
											<CardDescription className="mt-1">
												{formatDate(notification.createdAt)}
											</CardDescription>
										</div>
									</div>
									{!notification.read && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleMarkAsRead(notification.id)}
										>
											Đánh dấu đã đọc
										</Button>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm">{notification.message}</p>
							</CardContent>
						</Card>
					);
				})}
				<PaginationControls
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					startIndex={startIndex}
					endIndex={endIndex}
					onPageChange={goToPage}
					onItemsPerPageChange={setItemsPerPage}
				/>
			</div>
		</div>
	);
}

