import { useState, useEffect, useCallback, useMemo } from 'react';
import {
	Task,
	TaskStatus,
	TaskPriority,
	TaskType,
	TaskStats,
	TaskHistory,
	TaskReminder,
} from '../types';
import { UserRole } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
import { generateMockTasks } from '../lib/mockData';

interface UseTaskManagementProps {
	userId: string;
	userName: string;
	userRole: UserRole;
}

const STORAGE_KEY = 'indica_tasks';
const HISTORY_STORAGE_KEY = 'indica_task_history';
const REMINDERS_STORAGE_KEY = 'indica_task_reminders';

export function useTaskManagement({
	userId,
	userName,
	userRole,
}: UseTaskManagementProps) {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [history, setHistory] = useState<TaskHistory[]>([]);
	const [reminders, setReminders] = useState<TaskReminder[]>([]);

	// Load data - chỉ sử dụng mock data
	useEffect(() => {
		// Chỉ sử dụng mock data, không load từ localStorage
		const mockTasks = generateMockTasks(userId, userName, userRole);
		setTasks(mockTasks);

		// Clear localStorage để đảm bảo chỉ hiển thị mock data
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(HISTORY_STORAGE_KEY);
		localStorage.removeItem(REMINDERS_STORAGE_KEY);

		// Khởi tạo history và reminders rỗng
		setHistory([]);
		setReminders([]);
	}, [userId, userName, userRole]);

	// Không lưu vào localStorage - chỉ sử dụng mock data
	// useEffect(() => {
	// 	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	// }, [tasks]);

	// useEffect(() => {
	// 	localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
	// }, [history]);

	// useEffect(() => {
	// 	localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
	// }, [reminders]);

	// Add history entry
	const addHistory = useCallback(
		(
			taskId: string,
			action: TaskHistory['action'],
			changes?: Record<string, { old: any; new: any }>,
			note?: string,
		) => {
			const historyEntry: TaskHistory = {
				id: uuidv4(),
				taskId,
				action,
				userId,
				userName,
				changes,
				timestamp: new Date().toISOString(),
				note,
			};
			setHistory((prev) => [historyEntry, ...prev]);
		},
		[userId, userName],
	);

	// Create task
	const createTask = useCallback(
		(
			taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
				status?: TaskStatus;
			},
		) => {
			const now = new Date().toISOString();
			const newTask: Task = {
				...taskData,
				id: uuidv4(),
				status: taskData.status || 'pending',
				createdAt: now,
				updatedAt: now,
			};

			setTasks((prev) => [newTask, ...prev]);
			addHistory(newTask.id, 'created', undefined, 'Tạo công việc mới');

			// Create reminder if enabled
			if (
				newTask.reminderEnabled &&
				newTask.reminderDate &&
				newTask.reminderTime
			) {
				const reminder: TaskReminder = {
					id: uuidv4(),
					taskId: newTask.id,
					reminderDate: newTask.reminderDate,
					reminderTime: newTask.reminderTime,
					message: `Nhắc nhở: ${newTask.title}`,
					sent: false,
					createdAt: now,
				};
				setReminders((prev) => [reminder, ...prev]);
			}

			return newTask;
		},
		[addHistory],
	);

	// Update task
	const updateTask = useCallback(
		(taskId: string, updates: Partial<Task>) => {
			setTasks((prev) => {
				const task = prev.find((t) => t.id === taskId);
				if (!task) return prev;

				const changes: Record<string, { old: any; new: any }> = {};
				Object.keys(updates).forEach((key) => {
					if (task[key as keyof Task] !== updates[key as keyof Task]) {
						changes[key] = {
							old: task[key as keyof Task],
							new: updates[key as keyof Task],
						};
					}
				});

				const updatedTask: Task = {
					...task,
					...updates,
					updatedAt: new Date().toISOString(),
				};

				if (updates.status === 'completed') {
					updatedTask.completedAt = new Date().toISOString();
				}

				if (updates.status === 'rejected') {
					updatedTask.rejectedAt = new Date().toISOString();
				}

				const action = updates.status ? 'status_changed' : 'updated';
				addHistory(
					taskId,
					action,
					Object.keys(changes).length > 0 ? changes : undefined,
				);

				return prev.map((t) => (t.id === taskId ? updatedTask : t));
			});
		},
		[addHistory],
	);

	// Delete task
	const deleteTask = useCallback(
		(taskId: string) => {
			setTasks((prev) => prev.filter((t) => t.id !== taskId));
			setReminders((prev) => prev.filter((r) => r.taskId !== taskId));
			addHistory(taskId, 'updated', undefined, 'Xóa công việc');
		},
		[addHistory],
	);

	// Accept assigned task
	const acceptTask = useCallback(
		(taskId: string) => {
			updateTask(taskId, { status: 'pending' });
			addHistory(
				taskId,
				'accepted',
				undefined,
				'Chấp nhận công việc được giao',
			);
		},
		[updateTask, addHistory],
	);

	// Reject assigned task
	const rejectTask = useCallback(
		(taskId: string, reason?: string) => {
			updateTask(taskId, {
				status: 'rejected',
				rejectionReason: reason,
			});
			addHistory(
				taskId,
				'rejected',
				undefined,
				reason || 'Từ chối công việc được giao',
			);
		},
		[updateTask, addHistory],
	);

	// Complete task
	const completeTask = useCallback(
		(taskId: string) => {
			updateTask(taskId, { status: 'completed' });
			addHistory(taskId, 'completed', undefined, 'Hoàn thành công việc');
		},
		[updateTask, addHistory],
	);

	// Get user tasks
	const getUserTasks = useCallback(
		(filter?: {
			status?: TaskStatus | TaskStatus[];
			type?: TaskType;
			priority?: TaskPriority;
			overdue?: boolean;
		}) => {
			let filtered = tasks.filter((t) => t.assignedTo.id === userId);

			if (filter?.status) {
				if (Array.isArray(filter.status)) {
					filtered = filtered.filter((t) => filter.status!.includes(t.status));
				} else {
					filtered = filtered.filter((t) => t.status === filter.status);
				}
			}

			if (filter?.type) {
				filtered = filtered.filter((t) => t.type === filter.type);
			}

			if (filter?.priority) {
				filtered = filtered.filter((t) => t.priority === filter.priority);
			}

			if (filter?.overdue) {
				const now = new Date();
				filtered = filtered.filter((t) => {
					if (!t.dueDate) return false;
					const dueDate = new Date(t.dueDate);
					return (
						dueDate < now &&
						t.status !== 'completed' &&
						t.status !== 'cancelled'
					);
				});
			}

			// Sort by priority and due date
			return filtered.sort((a, b) => {
				const priorityOrder: Record<TaskPriority, number> = {
					urgent: 4,
					high: 3,
					medium: 2,
					low: 1,
				};

				const priorityDiff =
					priorityOrder[b.priority] - priorityOrder[a.priority];
				if (priorityDiff !== 0) return priorityDiff;

				if (a.dueDate && b.dueDate) {
					return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
				}

				if (a.dueDate) return -1;
				if (b.dueDate) return 1;

				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			});
		},
		[tasks, userId],
	);

	// Get task stats
	const getStats = useCallback((): TaskStats => {
		const userTasks = tasks.filter((t) => t.assignedTo.id === userId);
		const now = new Date();

		return {
			total: userTasks.length,
			pending: userTasks.filter((t) => t.status === 'pending').length,
			inProgress: userTasks.filter((t) => t.status === 'in_progress').length,
			completed: userTasks.filter((t) => t.status === 'completed').length,
			overdue: userTasks.filter((t) => {
				if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled')
					return false;
				return new Date(t.dueDate) < now;
			}).length,
			highPriority: userTasks.filter(
				(t) => t.priority === 'high' || t.priority === 'urgent',
			).length,
			assigned: userTasks.filter((t) => t.type === 'assigned').length,
			personal: userTasks.filter((t) => t.type === 'personal').length,
		};
	}, [tasks, userId]);

	// Get today's reminders
	const getTodayReminders = useCallback(() => {
		const today = new Date().toISOString().split('T')[0];
		const now = new Date();
		const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
			.getMinutes()
			.toString()
			.padStart(2, '0')}`;

		return reminders.filter((r) => {
			if (r.sent) return false;
			if (r.reminderDate !== today) return false;

			const task = tasks.find((t) => t.id === r.taskId);
			if (!task || task.status === 'completed' || task.status === 'cancelled')
				return false;

			// Check if reminder time has passed
			return r.reminderTime <= currentTime;
		});
	}, [reminders, tasks]);

	// Mark reminder as sent
	const markReminderSent = useCallback((reminderId: string) => {
		setReminders((prev) =>
			prev.map((r) =>
				r.id === reminderId
					? { ...r, sent: true, sentAt: new Date().toISOString() }
					: r,
			),
		);
	}, []);

	// Get task history
	const getTaskHistory = useCallback(
		(taskId: string) => {
			return history
				.filter((h) => h.taskId === taskId)
				.sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				);
		},
		[history],
	);

	return {
		tasks,
		history,
		reminders,
		createTask,
		updateTask,
		deleteTask,
		acceptTask,
		rejectTask,
		completeTask,
		getUserTasks,
		getStats,
		getTodayReminders,
		markReminderSent,
		getTaskHistory,
	};
}
