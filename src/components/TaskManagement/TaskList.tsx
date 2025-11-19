import React, { useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
	CheckCircle2,
	Clock,
	AlertCircle,
	XCircle,
	Calendar,
	Tag,
	User,
	Clock4,
	Flag,
	Trash2,
} from 'lucide-react';
import {
	format,
	isPast,
	isToday,
	isTomorrow,
	differenceInDays,
	startOfDay,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'motion/react';

interface TaskListProps {
	tasks: Task[];
	onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
	onDeleteTask: (taskId: string) => void;
	onAcceptTask?: (taskId: string) => void;
	onRejectTask?: (taskId: string, reason?: string) => void;
	onCompleteTask: (taskId: string) => void;
	filter?: {
		status?: TaskStatus;
		type?: TaskType;
		priority?: TaskPriority;
		overdue?: boolean;
	};
}

const priorityColors: Record<TaskPriority, string> = {
	low: 'bg-gray-50 text-gray-600 border-gray-300',
	medium: 'bg-blue-50 text-blue-700 border-blue-300',
	high: 'bg-orange-50 text-orange-700 border-orange-400',
	urgent: 'bg-red-50 text-red-700 border-red-500',
};

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
	low: <Flag className="h-3 w-3" />,
	medium: <Flag className="h-3 w-3" />,
	high: <Flag className="h-3 w-3" />,
	urgent: <AlertCircle className="h-3 w-3" />,
};

const statusColors: Record<TaskStatus, string> = {
	pending: 'bg-yellow-100 text-yellow-700',
	in_progress: 'bg-blue-100 text-blue-700',
	completed: 'bg-green-100 text-green-700',
	cancelled: 'bg-gray-100 text-gray-700',
	rejected: 'bg-red-100 text-red-700',
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
	pending: <Clock className="h-4 w-4" />,
	in_progress: <Clock4 className="h-4 w-4" />,
	completed: <CheckCircle2 className="h-4 w-4" />,
	cancelled: <XCircle className="h-4 w-4" />,
	rejected: <XCircle className="h-4 w-4" />,
};

export function TaskList({
	tasks,
	onUpdateTask,
	onDeleteTask,
	onAcceptTask,
	onRejectTask,
	onCompleteTask,
	filter,
}: TaskListProps) {
	const filteredTasks = useMemo(() => {
		let result = [...tasks];

		if (filter?.status) {
			result = result.filter((t) => t.status === filter.status);
		}

		if (filter?.type) {
			result = result.filter((t) => t.type === filter.type);
		}

		if (filter?.priority) {
			result = result.filter((t) => t.priority === filter.priority);
		}

		if (filter?.overdue) {
			const now = new Date();
			result = result.filter((t) => {
				if (!t.dueDate) return false;
				const dueDate = new Date(t.dueDate);
				return (
					dueDate < now && t.status !== 'completed' && t.status !== 'cancelled'
				);
			});
		}

		return result;
	}, [tasks, filter]);

	const getDueDateLabel = (dueDate?: string) => {
		if (!dueDate) return null;

		const date = new Date(dueDate);
		const absoluteDate = format(date, 'dd/MM/yyyy', { locale: vi });

		if (isToday(date)) return `Hôm nay (${absoluteDate})`;
		if (isTomorrow(date)) return `Ngày mai (${absoluteDate})`;

		const today = startOfDay(new Date());
		const dueDateStart = startOfDay(date);
		const daysDiff = differenceInDays(dueDateStart, today);

		if (isPast(date)) {
			const daysOverdue = Math.abs(daysDiff);
			if (daysOverdue === 0) return `Đã quá hạn (${absoluteDate})`;
			return `Quá hạn ${daysOverdue} ngày (${absoluteDate})`;
		}

		if (daysDiff > 0) {
			return `${daysDiff} ngày nữa (${absoluteDate})`;
		}

		return absoluteDate;
	};

	const getDueDateColor = (dueDate?: string, status?: TaskStatus) => {
		if (!dueDate || status === 'completed' || status === 'cancelled')
			return 'text-gray-500';

		const date = new Date(dueDate);
		if (isPast(date)) return 'text-red-600 font-semibold';
		if (isToday(date)) return 'text-orange-600 font-semibold';
		if (isTomorrow(date)) return 'text-yellow-600';

		return 'text-gray-600';
	};

	if (filteredTasks.length === 0) {
		return (
			<Card className="bg-white border-gray-100 shadow-sm">
				<CardContent className="p-12 text-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
						className="space-y-4"
					>
						<div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
							<Clock className="h-10 w-10 text-blue-500" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Không có công việc nào
							</h3>
							<p className="text-gray-500 text-sm">
								Bạn có thể tạo công việc mới thông qua Trợ lý AI
							</p>
						</div>
					</motion.div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-3">
			{filteredTasks.map((task) => {
				const isOverdue =
					task.dueDate &&
					isPast(new Date(task.dueDate)) &&
					task.status !== 'completed' &&
					task.status !== 'cancelled';

				const priorityBorderColors: Record<TaskPriority, string> = {
					urgent: 'border-l-red-600',
					high: 'border-l-orange-500',
					medium: 'border-l-blue-500',
					low: 'border-l-gray-300',
				};

				return (
					<motion.div
						key={task.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
					>
						<Card
							className={`transition-all hover:shadow-lg border-l-4 ${
								priorityBorderColors[task.priority]
							} ${
								isOverdue
									? 'border-red-300 bg-gradient-to-r from-red-50/50 to-white'
									: 'bg-white'
							} ${
								task.status === 'completed'
									? 'opacity-75 bg-gray-50'
									: 'shadow-sm'
							}`}
						>
							<CardContent className="p-4">
								{/* Header: Title + Actions */}
								<div className="flex items-start justify-between gap-3 mb-3">
									<div className="flex items-start gap-3 flex-1 min-w-0">
										{/* Checkbox */}
										{task.status !== 'completed' && (
											<Button
												variant="ghost"
												size="icon"
												className="h-5 w-5 mt-0.5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0"
												onClick={() => onCompleteTask(task.id)}
											>
												<CheckCircle2 className="h-3 w-3 text-gray-400 hover:text-green-600" />
											</Button>
										)}
										{task.status === 'completed' && (
											<div className="h-5 w-5 mt-0.5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
												<CheckCircle2 className="h-3 w-3 text-white" />
											</div>
										)}

										{/* Title */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<h3
													className={`font-semibold text-base ${
														task.status === 'completed'
															? 'line-through text-gray-500'
															: 'text-gray-900'
													}`}
												>
													{task.title}
												</h3>
												{task.type === 'assigned' && task.assignedBy && (
													<Badge
														variant="outline"
														className="bg-purple-100 text-purple-700 border-0 shadow-sm text-xs"
													>
														<User className="h-3 w-3 mr-1" />
														<span>Từ {task.assignedBy.name}</span>
													</Badge>
												)}
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex items-center gap-2 flex-shrink-0">
										{task.status !== 'completed' && (
											<Button
												size="sm"
												onClick={() => onCompleteTask(task.id)}
												className="h-8 px-3 text-xs font-medium rounded-md border shadow-sm hover:shadow-md transition-all"
												style={{
													backgroundColor: '#22c55e',
													color: '#ffffff',
													borderColor: '#22c55e',
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor = '#16a34a';
													e.currentTarget.style.borderColor = '#16a34a';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = '#22c55e';
													e.currentTarget.style.borderColor = '#22c55e';
												}}
											>
												<CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
												Hoàn thành
											</Button>
										)}
										{task.type === 'assigned' &&
											task.status === 'pending' &&
											onRejectTask && (
												<Button
													size="sm"
													onClick={() =>
														onRejectTask?.(task.id, 'Từ chối công việc')
													}
													className="h-8 px-3 text-xs font-medium rounded-md border shadow-sm hover:shadow-md transition-all"
													style={{
														backgroundColor: '#fed7aa',
														color: '#c2410c',
														borderColor: '#fb923c',
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = '#fdba74';
														e.currentTarget.style.borderColor = '#f97316';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = '#fed7aa';
														e.currentTarget.style.borderColor = '#fb923c';
													}}
												>
													<XCircle className="h-3.5 w-3.5 mr-1.5" />
													Từ chối
												</Button>
											)}
										<Button
											size="sm"
											onClick={() => onDeleteTask(task.id)}
											className="h-8 px-3 text-xs font-medium rounded-md border shadow-sm hover:shadow-md transition-all"
											style={{
												backgroundColor: '#fee2e2',
												color: '#dc2626',
												borderColor: '#ef4444',
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = '#fecaca';
												e.currentTarget.style.borderColor = '#dc2626';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = '#fee2e2';
												e.currentTarget.style.borderColor = '#ef4444';
											}}
										>
											<Trash2 className="h-3.5 w-3.5 mr-1.5" />
											Xóa
										</Button>
									</div>
								</div>

								{/* Description */}
								{task.description && (
									<p className="text-sm text-gray-600 mb-3 leading-relaxed">
										{task.description}
									</p>
								)}

								{/* Main Info: Status, Priority, Due Date */}
								<div className="flex flex-wrap items-center gap-2 mb-2">
									<Badge
										variant="outline"
										className={`${
											statusColors[task.status]
										} border-0 shadow-sm text-xs`}
									>
										{statusIcons[task.status]}
										<span className="ml-1">
											{task.status === 'in_progress'
												? 'Đang làm'
												: task.status === 'pending'
												? 'Chờ xử lý'
												: task.status === 'completed'
												? 'Hoàn thành'
												: task.status === 'rejected'
												? 'Đã từ chối'
												: 'Đã hủy'}
										</span>
									</Badge>

									<Badge
										variant="outline"
										className={`${
											priorityColors[task.priority]
										} shadow-sm text-xs`}
									>
										{priorityIcons[task.priority]}
										<span className="ml-1">
											{task.priority === 'urgent'
												? 'Khẩn cấp'
												: task.priority === 'high'
												? 'Cao'
												: task.priority === 'medium'
												? 'Trung bình'
												: 'Thấp'}
										</span>
									</Badge>

									{task.dueDate && (
										<div
											className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
												isOverdue
													? 'bg-red-50 text-red-700 border border-red-200'
													: isToday(new Date(task.dueDate))
													? 'bg-orange-50 text-orange-700 border border-orange-200'
													: 'bg-blue-50 text-blue-700 border border-blue-200'
											}`}
										>
											<Calendar
												className={`h-3 w-3 ${
													isOverdue
														? 'text-red-600'
														: isToday(new Date(task.dueDate))
														? 'text-orange-600'
														: 'text-blue-600'
												}`}
											/>
											<span className="font-medium">
												{getDueDateLabel(task.dueDate)}
											</span>
											{task.dueTime && (
												<span className="font-semibold">{task.dueTime}</span>
											)}
										</div>
									)}
								</div>

								{/* Rejection reason */}
								{task.status === 'rejected' && task.rejectionReason && (
									<div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded">
										<strong>Lý do từ chối:</strong> {task.rejectionReason}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}
