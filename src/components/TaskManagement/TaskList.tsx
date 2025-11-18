import React, { useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
	MoreVertical,
	Edit,
	Trash2,
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'motion/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
	low: 'bg-gray-100 text-gray-700',
	medium: 'bg-blue-100 text-blue-700',
	high: 'bg-orange-100 text-orange-700',
	urgent: 'bg-red-100 text-red-700',
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
					dueDate < now &&
					t.status !== 'completed' &&
					t.status !== 'cancelled'
				);
			});
		}

		return result;
	}, [tasks, filter]);

	const getDueDateLabel = (dueDate?: string) => {
		if (!dueDate) return null;

		const date = new Date(dueDate);
		if (isToday(date)) return 'Hôm nay';
		if (isTomorrow(date)) return 'Ngày mai';
		if (isPast(date)) return 'Đã quá hạn';

		return format(date, 'dd/MM/yyyy', { locale: vi });
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
					urgent: 'border-l-red-500',
					high: 'border-l-orange-500',
					medium: 'border-l-blue-500',
					low: 'border-l-gray-400',
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
							<CardContent className="p-5">
								<div className="flex items-start justify-between gap-4">
									{/* Checkbox để đánh dấu hoàn thành nhanh */}
									{task.status !== 'completed' && (
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 mt-0.5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0"
											onClick={() => onCompleteTask(task.id)}
										>
											<CheckCircle2 className="h-4 w-4 text-gray-400 hover:text-green-600" />
										</Button>
									)}
									{task.status === 'completed' && (
										<div className="h-6 w-6 mt-0.5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
											<CheckCircle2 className="h-4 w-4 text-white" />
										</div>
									)}

									<div className="flex-1 space-y-3">
										{/* Header */}
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<h3
													className={`font-semibold text-lg ${
														task.status === 'completed'
															? 'line-through text-gray-500'
															: 'text-gray-900'
													}`}
												>
													{task.title}
												</h3>
												{task.description && (
													<p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
														{task.description}
													</p>
												)}
											</div>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 hover:bg-gray-100"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{task.status !== 'completed' && (
														<DropdownMenuItem
															onClick={() => onCompleteTask(task.id)}
														>
															<CheckCircle2 className="h-4 w-4 mr-2" />
															Đánh dấu hoàn thành
														</DropdownMenuItem>
													)}
													{task.type === 'assigned' &&
														task.status === 'pending' &&
														onAcceptTask && (
															<>
																<DropdownMenuItem
																	onClick={() => onAcceptTask(task.id)}
																>
																	<CheckCircle2 className="h-4 w-4 mr-2" />
																	Chấp nhận
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() =>
																		onRejectTask?.(task.id, 'Từ chối công việc')
																	}
																	className="text-red-600"
																>
																	<XCircle className="h-4 w-4 mr-2" />
																	Từ chối
																</DropdownMenuItem>
															</>
														)}
													<DropdownMenuItem
														onClick={() => onDeleteTask(task.id)}
														className="text-red-600"
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Xóa
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										{/* Metadata Row 1: Status, Priority, Type */}
										<div className="flex flex-wrap items-center gap-2">
											{/* Status */}
											<Badge
												variant="outline"
												className={`${statusColors[task.status]} border-0 shadow-sm`}
											>
												{statusIcons[task.status]}
												<span className="ml-1.5 font-medium">
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

											{/* Priority */}
											<Badge
												variant="outline"
												className={`${priorityColors[task.priority]} border-0 shadow-sm`}
											>
												{priorityIcons[task.priority]}
												<span className="ml-1.5 font-medium">
													{task.priority === 'urgent'
														? 'Khẩn cấp'
														: task.priority === 'high'
															? 'Cao'
															: task.priority === 'medium'
																? 'Trung bình'
																: 'Thấp'}
												</span>
											</Badge>

											{/* Type */}
											{task.type === 'assigned' && task.assignedBy && (
												<Badge
													variant="outline"
													className="bg-purple-100 text-purple-700 border-0 shadow-sm"
												>
													<User className="h-3 w-3 mr-1.5" />
													<span className="font-medium">
														Từ {task.assignedBy.name}
													</span>
												</Badge>
											)}

											{/* Category */}
											{task.category && (
												<Badge
													variant="outline"
													className="bg-gray-100 text-gray-700 border-0 shadow-sm"
												>
													<Tag className="h-3 w-3 mr-1.5" />
													<span className="font-medium">{task.category}</span>
												</Badge>
											)}
										</div>

										{/* Due date and time - Highlighted */}
										{task.dueDate && (
											<div
												className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
													isOverdue
														? 'bg-red-50 border border-red-200'
														: isToday(new Date(task.dueDate))
															? 'bg-orange-50 border border-orange-200'
															: 'bg-blue-50 border border-blue-200'
												}`}
											>
												<Calendar
													className={`h-4 w-4 ${
														isOverdue
															? 'text-red-600'
															: isToday(new Date(task.dueDate))
																? 'text-orange-600'
																: 'text-blue-600'
													}`}
												/>
												<span
													className={`font-medium ${
														getDueDateColor(task.dueDate, task.status)
													}`}
												>
													{getDueDateLabel(task.dueDate)}
												</span>
												{task.dueTime && (
													<span
														className={`font-semibold ${
															isOverdue
																? 'text-red-600'
																: isToday(new Date(task.dueDate))
																	? 'text-orange-600'
																	: 'text-blue-600'
														}`}
													>
														• {task.dueTime}
													</span>
												)}
											</div>
										)}

										{/* Tags */}
										{task.tags && task.tags.length > 0 && (
											<div className="flex flex-wrap gap-1.5">
												{task.tags.map((tag, idx) => (
													<Badge
														key={idx}
														variant="outline"
														className="text-xs bg-gray-50 text-gray-600 border-gray-200"
													>
														{tag}
													</Badge>
												))}
											</div>
										)}

										{/* Rejection reason */}
										{task.status === 'rejected' && task.rejectionReason && (
											<div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
												<strong>Lý do từ chối:</strong> {task.rejectionReason}
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

