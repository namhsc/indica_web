import React, { useEffect, useState } from 'react';
import { TaskReminder as TaskReminderType, Task } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface TaskReminderProps {
	reminders: TaskReminderType[];
	tasks: Task[];
	onMarkSent: (reminderId: string) => void;
	onDismiss: (reminderId: string) => void;
}

export function TaskReminder({
	reminders,
	tasks,
	onMarkSent,
	onDismiss,
}: TaskReminderProps) {
	const [visibleReminders, setVisibleReminders] = useState<string[]>([]);

	useEffect(() => {
		// Show reminders that haven't been dismissed
		const activeReminderIds = reminders
			.filter((r) => !r.sent && visibleReminders.includes(r.id))
			.map((r) => r.id);

		// Add new reminders
		const newReminders = reminders
			.filter((r) => !r.sent && !visibleReminders.includes(r.id))
			.map((r) => r.id);

		if (newReminders.length > 0) {
			setVisibleReminders((prev) => [...prev, ...newReminders]);
		}
	}, [reminders, visibleReminders]);

	const activeReminders = reminders.filter(
		(r) => !r.sent && visibleReminders.includes(r.id),
	);

	if (activeReminders.length === 0) {
		return null;
	}

	const handleDismiss = (reminderId: string) => {
		setVisibleReminders((prev) => prev.filter((id) => id !== reminderId));
		onDismiss(reminderId);
	};

	const handleMarkAsDone = (reminderId: string) => {
		onMarkSent(reminderId);
		setVisibleReminders((prev) => prev.filter((id) => id !== reminderId));
	};

	return (
		<div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
			<AnimatePresence>
				{activeReminders.map((reminder) => {
					const task = tasks.find((t) => t.id === reminder.taskId);
					if (!task) return null;

					return (
						<motion.div
							key={reminder.id}
							initial={{ opacity: 0, y: -20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.95 }}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						>
							<Card className="shadow-lg border-l-4 border-l-blue-500">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-2">
											<Bell className="h-5 w-5 text-blue-500" />
											<CardTitle className="text-base">Nhắc nhở công việc</CardTitle>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() => handleDismiss(reminder.id)}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="space-y-3">
										<div>
											<p className="font-semibold text-lg">{task.title}</p>
											{task.description && (
												<p className="text-sm text-gray-600 mt-1">
													{task.description}
												</p>
											)}
										</div>

										{task.dueDate && (
											<div className="text-sm text-gray-500">
												Hạn chót:{' '}
												{format(new Date(task.dueDate), 'dd/MM/yyyy HH:mm', {
													locale: vi,
												})}
											</div>
										)}

										<div className="flex gap-2">
											<Button
												size="sm"
												onClick={() => handleMarkAsDone(reminder.id)}
												className="flex-1"
											>
												<CheckCircle2 className="h-4 w-4 mr-2" />
												Đã xem
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleDismiss(reminder.id)}
											>
												Đóng
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);
}

