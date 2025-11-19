import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { motion } from 'motion/react';
import { Task, TaskStatus, TaskType, TaskPriority } from '../../types';
import { TaskList } from './TaskList';
import { TaskReminder } from './TaskReminder';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
	ListTodo,
	CheckCircle2,
	Clock,
	AlertCircle,
	Sparkles,
	Filter,
	X,
	Bell,
} from 'lucide-react';
import { toast } from 'sonner';

interface TaskManagementProps {
	taskManagement: ReturnType<
		typeof import('../../hooks/useTaskManagement').useTaskManagement
	>;
	onClose?: () => void;
}

export function TaskManagement({
	taskManagement,
	onClose,
}: TaskManagementProps) {
	const [selectedFilter, setSelectedFilter] = useState<{
		status?: TaskStatus | TaskStatus[];
		type?: TaskType;
		priority?: TaskPriority;
		overdue?: boolean;
	}>({});

	const {
		tasks,
		reminders,
		updateTask,
		deleteTask,
		acceptTask,
		rejectTask,
		completeTask,
		getUserTasks,
		getStats,
		getTodayReminders,
		markReminderSent,
	} = taskManagement;

	const stats = useMemo(() => getStats(), [getStats, tasks]);

	// Lọc công việc theo filter
	const filteredTasks = useMemo(() => {
		let tasks = getUserTasks(selectedFilter);

		// Sắp xếp theo ưu tiên (urgent > high > medium > low)
		const priorityOrder: Record<TaskPriority, number> = {
			urgent: 4,
			high: 3,
			medium: 2,
			low: 1,
		};

		return tasks.sort((a, b) => {
			// Ưu tiên theo mức độ ưu tiên
			const priorityDiff =
				priorityOrder[b.priority] - priorityOrder[a.priority];
			if (priorityDiff !== 0) return priorityDiff;

			// Sau đó theo thời gian (nếu có)
			if (a.dueTime && b.dueTime) {
				return a.dueTime.localeCompare(b.dueTime);
			}
			if (a.dueTime) return -1;
			if (b.dueTime) return 1;

			// Cuối cùng theo ngày tạo
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [getUserTasks, selectedFilter]);

	const userTasks = filteredTasks;
	const todayReminders = useMemo(
		() => getTodayReminders(),
		[getTodayReminders, reminders, tasks],
	);

	const handleCompleteTask = useCallback(
		(taskId: string) => {
			completeTask(taskId);
			toast.success('Đã đánh dấu hoàn thành!');
		},
		[completeTask],
	);

	const handleAcceptTask = useCallback(
		(taskId: string) => {
			acceptTask(taskId);
			toast.success('Đã chấp nhận công việc!');
		},
		[acceptTask],
	);

	const handleRejectTask = useCallback(
		(taskId: string, reason?: string) => {
			rejectTask(taskId, reason);
			toast.success('Đã từ chối công việc!');
		},
		[rejectTask],
	);

	const handleDeleteTask = useCallback(
		(taskId: string) => {
			if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
				deleteTask(taskId);
				toast.success('Đã xóa công việc!');
			}
		},
		[deleteTask],
	);

	return (
		<div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
			{/* Reminders */}
			<TaskReminder
				reminders={reminders}
				tasks={tasks}
				onMarkSent={markReminderSent}
				onDismiss={markReminderSent}
			/>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: 'spring', stiffness: 200, damping: 20 }}
				className="h-full flex flex-col"
			>
				<div className="h-full flex flex-col space-y-4">
					{/* Top công việc với bộ lọc */}
					<Card className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 border-0 shadow-lg">
						<CardContent className="p-5">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
										<ListTodo className="h-6 w-6 text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-2xl text-white">
											Danh sách công việc
										</h3>
										<p className="text-sm text-white">
											Lọc công việc theo trạng thái, ưu tiên và loại
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{((selectedFilter.status &&
										(Array.isArray(selectedFilter.status)
											? selectedFilter.status.length > 0
											: true)) ||
										selectedFilter.priority ||
										selectedFilter.overdue ||
										selectedFilter.type) && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setSelectedFilter({})}
											className="h-7 text-xs bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
										>
											<X className="h-3 w-3 mr-1" />
											Xóa bộ lọc
										</Button>
									)}
									<Badge
										variant="secondary"
										className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-base px-3 py-1"
									>
										{filteredTasks.length} công việc
									</Badge>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Button
									variant={
										(Array.isArray(selectedFilter.status) &&
											selectedFilter.status.includes('pending')) ||
										selectedFilter.status === 'pending'
											? 'default'
											: 'outline'
									}
									size="sm"
									onClick={() =>
										setSelectedFilter((prev) => {
											const currentStatuses = Array.isArray(prev.status)
												? prev.status
												: prev.status
												? [prev.status]
												: [];

											if (currentStatuses.includes('pending')) {
												// Bỏ chọn 'pending'
												const newStatuses = currentStatuses.filter(
													(s) => s !== 'pending',
												);
												return {
													...prev,
													status:
														newStatuses.length === 0
															? undefined
															: newStatuses.length === 1
															? newStatuses[0]
															: newStatuses,
												};
											} else {
												// Thêm 'pending'
												const newStatuses = [...currentStatuses, 'pending'];
												return {
													...prev,
													status:
														newStatuses.length === 1
															? newStatuses[0]
															: newStatuses,
												};
											}
										})
									}
									className={
										(Array.isArray(selectedFilter.status) &&
											selectedFilter.status.includes('pending')) ||
										selectedFilter.status === 'pending'
											? 'bg-white text-yellow-600 hover:bg-white/90 shadow-md'
											: 'bg-white/10 text-white border-yellow-400/60 hover:bg-yellow-400/20 backdrop-blur-sm'
									}
								>
									<Clock className="h-4 w-4 mr-1" />
									Chờ xử lý
								</Button>
								<Button
									variant={
										selectedFilter.priority === 'high' ? 'default' : 'outline'
									}
									size="sm"
									onClick={() =>
										setSelectedFilter((prev) => ({
											...prev,
											priority: prev.priority === 'high' ? undefined : 'high',
										}))
									}
									className={
										selectedFilter.priority === 'high'
											? 'bg-white text-orange-600 hover:bg-white/90 shadow-md'
											: 'bg-white/10 text-white border-orange-400/60 hover:bg-orange-400/20 backdrop-blur-sm'
									}
								>
									<AlertCircle className="h-8 w-8 mr-1" />
									Ưu tiên cao
								</Button>
								<Button
									variant={selectedFilter.overdue ? 'default' : 'outline'}
									size="sm"
									onClick={() =>
										setSelectedFilter((prev) => ({
											...prev,
											overdue: !prev.overdue,
										}))
									}
									className={
										selectedFilter.overdue
											? 'bg-white text-red-600 hover:bg-white/90 shadow-md'
											: 'bg-white/10 text-white border-red-400/60 hover:bg-red-400/20 backdrop-blur-sm'
									}
								>
									<AlertCircle className="h-8 w-8 mr-1" />
									Quá hạn
								</Button>
								<Button
									variant={
										selectedFilter.type === 'assigned' ? 'default' : 'outline'
									}
									size="sm"
									onClick={() =>
										setSelectedFilter((prev) => ({
											...prev,
											type: prev.type === 'assigned' ? undefined : 'assigned',
										}))
									}
									className={
										selectedFilter.type === 'assigned'
											? 'bg-white text-purple-600 hover:bg-white/90 shadow-md'
											: 'bg-white/10 text-white border-purple-400/60 hover:bg-purple-400/20 backdrop-blur-sm'
									}
								>
									<Bell className="h-8 w-8 mr-1" />
									Được giao
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Stats Cards Grid - 4 cards trên 1 dòng */}
					<div className="flex gap-3">
						<motion.div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-1">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-gray-500 mb-1">Tổng số</p>
									<p className="text-xl font-bold text-gray-900">
										{stats.total}
									</p>
								</div>
								<div className="p-1.5 rounded-lg">
									<ListTodo className="h-8 w-8 text-blue-600" />
								</div>
							</div>
						</motion.div>

						<motion.div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-1">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-gray-500 mb-1">Chờ xử lý</p>
									<p className="text-xl font-bold text-yellow-600">
										{stats.pending}
									</p>
								</div>
								<div className="p-1.5 rounded-lg">
									<Clock className="h-8 w-8 text-yellow-600" />
								</div>
							</div>
						</motion.div>

						<motion.div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-1">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-gray-500 mb-1">Đã hoàn thành</p>
									<p className="text-xl font-bold text-green-600">
										{stats.completed}
									</p>
								</div>
								<div className="p-1.5 rounded-lg">
									<CheckCircle2 className="h-8 w-8 text-green-600" />
								</div>
							</div>
						</motion.div>

						<motion.div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-1">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-gray-500 mb-1">Quá hạn</p>
									<p className="text-xl font-bold text-red-600">
										{stats.overdue}
									</p>
								</div>
								<div className="p-1.5 rounded-lg">
									<AlertCircle className="h-8 w-8 text-red-600" />
								</div>
							</div>
						</motion.div>
					</div>

					{/* Task List */}
					<div className="flex-1 overflow-y-auto min-h-0">
						<TaskList
							tasks={userTasks}
							onUpdateTask={updateTask}
							onDeleteTask={handleDeleteTask}
							onAcceptTask={handleAcceptTask}
							onRejectTask={handleRejectTask}
							onCompleteTask={handleCompleteTask}
							filter={selectedFilter}
						/>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
