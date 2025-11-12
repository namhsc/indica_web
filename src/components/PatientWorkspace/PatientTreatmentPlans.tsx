import React, { useState, useMemo } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { TreatmentPlan, MedicalRecord } from '../../types';
import {
	Pill,
	Calendar,
	MessageSquare,
	CheckCircle,
	XCircle,
	Clock,
	Plus,
	Edit,
	Activity,
	Heart,
	Thermometer,
	Scale,
	Droplet,
	AlertCircle,
	Bell,
} from 'lucide-react';
import { TreatmentPlanManager } from '../TreatmentPlanManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DatePicker } from '../ui/date-picker';

interface PatientTreatmentPlansProps {
	treatmentPlans: TreatmentPlan[];
	records: MedicalRecord[];
	treatmentProgress?: Record<string, any[]>;
	onUpdateTreatmentPlan: (
		planId: string,
		updates: Partial<TreatmentPlan>,
	) => void;
	onAddTreatmentProgress: (progress: {
		treatmentPlanId: string;
		medicationId?: string;
		date: string;
		status?: 'taken' | 'missed' | 'skipped';
		notes?: string;
		patientFeedback?: string;
		vitalSigns?: {
			bloodPressure?: {
				systolic: number;
				diastolic: number;
				time?: string;
			};
			bloodSugar?: {
				value: number;
				type: 'fasting' | 'postprandial' | 'random';
				time?: string;
			};
			heartRate?: number;
			weight?: number;
			temperature?: number;
			oxygenSaturation?: number;
			painLevel?: number;
		};
	}) => void;
}

export function PatientTreatmentPlans({
	treatmentPlans,
	records,
	treatmentProgress = {},
	onUpdateTreatmentPlan,
	onAddTreatmentProgress,
}: PatientTreatmentPlansProps) {
	const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
	const [showDetailDialog, setShowDetailDialog] = useState(false);
	const [showProgressDialog, setShowProgressDialog] = useState(false);
	const [showDailyUpdateDialog, setShowDailyUpdateDialog] = useState(false);
	const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
	const [selectedMedication, setSelectedMedication] = useState<string>('');
	const [progressDate, setProgressDate] = useState('');
	const [progressStatus, setProgressStatus] = useState<
		'taken' | 'missed' | 'skipped'
	>('taken');
	const [progressNotes, setProgressNotes] = useState('');
	const [patientFeedback, setPatientFeedback] = useState('');
	const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

	// Vital signs state
	const [vitalSigns, setVitalSigns] = useState({
		bloodPressure: {
			systolic: '',
			diastolic: '',
			time: 'morning',
		},
		bloodSugar: {
			value: '',
			type: 'fasting' as 'fasting' | 'postprandial' | 'random',
			time: 'morning',
		},
		heartRate: '',
		weight: '',
		temperature: '',
		oxygenSaturation: '',
		painLevel: '',
	});

	// Get daily progress for a specific date (all medications combined)
	const getDailyProgress = (planId: string, date: string) => {
		// First, try to get the daily update entry (with vital signs)
		const dailyKey = `${planId}_daily_${date}`;
		const dailyProgress = treatmentProgress[dailyKey] || [];
		const dailyEntry = dailyProgress.find((p) => p.date === date);

		if (dailyEntry) {
			return dailyEntry;
		}

		// If no daily entry, try to find any progress entry for this date
		const allProgress: any[] = [];
		Object.keys(treatmentProgress).forEach((key) => {
			if (key.startsWith(`${planId}_`) && !key.includes('_daily_')) {
				const progress = treatmentProgress[key] || [];
				const dayProgress = progress.find((p) => p.date === date);
				if (dayProgress) {
					allProgress.push(dayProgress);
				}
			}
		});

		// Return the most complete progress entry (with vital signs if available)
		return allProgress.find((p) => p.vitalSigns) || allProgress[0] || null;
	};

	// Get progress for a specific medication
	const getMedicationProgress = (planId: string, medicationId: string) => {
		const key = `${planId}_${medicationId}`;
		return treatmentProgress[key] || [];
	};

	// Get progress status for a specific date
	const getProgressForDate = (
		planId: string,
		medicationId: string,
		date: string,
	) => {
		const progress = getMedicationProgress(planId, medicationId);
		return progress.find((p) => p.date === date);
	};

	if (treatmentPlans.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-12 text-gray-500">
						<Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
						<p>Bạn chưa có phác đồ điều trị nào</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const handleOpenDetailDialog = (plan: TreatmentPlan) => {
		setSelectedPlan(plan);
		setShowDetailDialog(true);
	};

	const handleOpenDailyUpdateDialog = (plan: TreatmentPlan, date?: string) => {
		setSelectedPlan(plan);
		setProgressDate(date || new Date().toISOString().split('T')[0]);

		// Load existing daily progress if available
		if (date) {
			const existingProgress = getDailyProgress(plan.id, date);
			if (existingProgress && existingProgress.vitalSigns) {
				const vs = existingProgress.vitalSigns;
				setVitalSigns({
					bloodPressure: {
						systolic: vs.bloodPressure?.systolic?.toString() || '',
						diastolic: vs.bloodPressure?.diastolic?.toString() || '',
						time: vs.bloodPressure?.time || 'morning',
					},
					bloodSugar: {
						value: vs.bloodSugar?.value?.toString() || '',
						type: vs.bloodSugar?.type || 'fasting',
						time: vs.bloodSugar?.time || 'morning',
					},
					heartRate: vs.heartRate?.toString() || '',
					weight: vs.weight?.toString() || '',
					temperature: vs.temperature?.toString() || '',
					oxygenSaturation: vs.oxygenSaturation?.toString() || '',
					painLevel: vs.painLevel?.toString() || '',
				});
				setProgressNotes(existingProgress.notes || '');
			} else {
				// Reset to defaults
				setVitalSigns({
					bloodPressure: { systolic: '', diastolic: '', time: 'morning' },
					bloodSugar: { value: '', type: 'fasting', time: 'morning' },
					heartRate: '',
					weight: '',
					temperature: '',
					oxygenSaturation: '',
					painLevel: '',
				});
				setProgressNotes('');
			}
		} else {
			// Reset to defaults
			setVitalSigns({
				bloodPressure: { systolic: '', diastolic: '', time: 'morning' },
				bloodSugar: { value: '', type: 'fasting', time: 'morning' },
				heartRate: '',
				weight: '',
				temperature: '',
				oxygenSaturation: '',
				painLevel: '',
			});
			setProgressNotes('');
		}

		setShowDailyUpdateDialog(true);
	};

	const handleOpenProgressDialog = (
		plan: TreatmentPlan,
		medicationId: string,
		date?: string,
	) => {
		setSelectedPlan(plan);
		setSelectedMedication(medicationId);
		setProgressDate(date || new Date().toISOString().split('T')[0]);

		// If editing existing progress, load it
		if (date) {
			const existingProgress = getProgressForDate(plan.id, medicationId, date);
			if (existingProgress) {
				setProgressStatus(existingProgress.status || 'taken');
				setProgressNotes(existingProgress.notes || '');
			} else {
				setProgressStatus('taken');
				setProgressNotes('');
			}
		} else {
			setProgressStatus('taken');
			setProgressNotes('');
		}

		setShowProgressDialog(true);
	};

	const handleOpenFeedbackDialog = (plan: TreatmentPlan) => {
		setSelectedPlan(plan);
		setPatientFeedback('');
		setShowFeedbackDialog(true);
	};

	const handleSaveDailyUpdate = () => {
		if (!selectedPlan || !progressDate) {
			toast.error('Vui lòng chọn ngày');
			return;
		}

		// Build vital signs object
		const vitalSignsData: any = {};

		if (
			vitalSigns.bloodPressure.systolic &&
			vitalSigns.bloodPressure.diastolic
		) {
			vitalSignsData.bloodPressure = {
				systolic: parseInt(vitalSigns.bloodPressure.systolic),
				diastolic: parseInt(vitalSigns.bloodPressure.diastolic),
				time: vitalSigns.bloodPressure.time,
			};
		}

		if (vitalSigns.bloodSugar.value) {
			vitalSignsData.bloodSugar = {
				value: parseFloat(vitalSigns.bloodSugar.value),
				type: vitalSigns.bloodSugar.type,
				time: vitalSigns.bloodSugar.time,
			};
		}

		if (vitalSigns.heartRate) {
			vitalSignsData.heartRate = parseInt(vitalSigns.heartRate);
		}

		if (vitalSigns.weight) {
			vitalSignsData.weight = parseFloat(vitalSigns.weight);
		}

		if (vitalSigns.temperature) {
			vitalSignsData.temperature = parseFloat(vitalSigns.temperature);
		}

		if (vitalSigns.oxygenSaturation) {
			vitalSignsData.oxygenSaturation = parseFloat(vitalSigns.oxygenSaturation);
		}

		if (vitalSigns.painLevel) {
			vitalSignsData.painLevel = parseInt(vitalSigns.painLevel);
		}

		// Create daily update entry (without medicationId for general daily update)
		onAddTreatmentProgress({
			treatmentPlanId: selectedPlan.id,
			date: progressDate,
			notes: progressNotes,
			vitalSigns:
				Object.keys(vitalSignsData).length > 0 ? vitalSignsData : undefined,
		});

		toast.success('Đã cập nhật tình hình sức khỏe hàng ngày');
		setShowDailyUpdateDialog(false);
		setSelectedPlan(null);
	};

	const handleSaveProgress = () => {
		if (!selectedPlan || !selectedMedication || !progressDate) {
			toast.error('Vui lòng điền đầy đủ thông tin');
			return;
		}

		onAddTreatmentProgress({
			treatmentPlanId: selectedPlan.id,
			medicationId: selectedMedication,
			date: progressDate,
			status: progressStatus,
			notes: progressNotes,
		});

		toast.success('Đã cập nhật tình hình điều trị');
		setShowProgressDialog(false);
		setSelectedPlan(null);
		setSelectedMedication('');
	};

	const handleSaveFeedback = () => {
		if (!selectedPlan || !patientFeedback.trim()) {
			toast.error('Vui lòng nhập phản hồi');
			return;
		}

		// Cập nhật phác đồ với phản hồi của Khách hàng
		const feedbackText = `[${new Date().toLocaleString(
			'vi-VN',
		)}] Phản hồi Khách hàng: ${patientFeedback}`;
		onUpdateTreatmentPlan(selectedPlan.id, {
			notes: selectedPlan.notes
				? `${selectedPlan.notes}\n\n${feedbackText}`
				: feedbackText,
		});

		toast.success('Đã gửi phản hồi cho bác sĩ');
		setShowFeedbackDialog(false);
		setSelectedPlan(null);
		setPatientFeedback('');
	};

	const togglePlanExpansion = (planId: string) => {
		const newExpanded = new Set(expandedPlans);
		if (newExpanded.has(planId)) {
			newExpanded.delete(planId);
		} else {
			newExpanded.add(planId);
		}
		setExpandedPlans(newExpanded);
	};

	const getStatusIcon = (status: 'active' | 'completed' | 'cancelled') => {
		switch (status) {
			case 'active':
				return <Clock className="h-4 w-4 text-blue-500" />;
			case 'completed':
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case 'cancelled':
				return <XCircle className="h-4 w-4 text-red-500" />;
		}
	};

	const getStatusLabel = (status: 'active' | 'completed' | 'cancelled') => {
		switch (status) {
			case 'active':
				return 'Đang điều trị';
			case 'completed':
				return 'Hoàn thành';
			case 'cancelled':
				return 'Đã hủy';
		}
	};

	const getProgressStatusIcon = (status?: 'taken' | 'missed' | 'skipped') => {
		if (!status) return null;
		switch (status) {
			case 'taken':
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case 'missed':
				return <XCircle className="h-4 w-4 text-red-500" />;
			case 'skipped':
				return <Clock className="h-4 w-4 text-yellow-500" />;
		}
	};

	const getProgressStatusLabel = (status?: 'taken' | 'missed' | 'skipped') => {
		if (!status) return 'Chưa cập nhật';
		switch (status) {
			case 'taken':
				return 'Đã uống';
			case 'missed':
				return 'Quên uống';
			case 'skipped':
				return 'Bỏ qua';
		}
	};

	// Get the first active treatment plan for quick update
	const activePlan = treatmentPlans.find((plan) => plan.status === 'active');

	// Get today's reminders that need response
	const todayReminders = useMemo(() => {
		if (!activePlan || !activePlan.reminders) return [];
		const today = new Date().toISOString().split('T')[0];
		return activePlan.reminders.filter((reminder) => {
			if (!reminder.enabled) return false;
			// Check if reminder needs response today
			const lastResponse = reminder.responses
				?.filter((r) => r.date === today)
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)[0];
			return !lastResponse || lastResponse.status === 'pending';
		});
	}, [activePlan]);

	const [showReminderDialog, setShowReminderDialog] = useState(false);
	const [selectedReminder, setSelectedReminder] = useState<any>(null);
	const [reminderResponse, setReminderResponse] = useState('');
	const [reminderValue, setReminderValue] = useState('');

	const handleOpenReminderDialog = (reminder: any) => {
		setSelectedReminder(reminder);
		setReminderResponse('');
		setReminderValue('');
		setShowReminderDialog(true);
	};

	const handleSaveReminderResponse = () => {
		if (!selectedReminder || !activePlan) return;

		const today = new Date().toISOString().split('T')[0];
		const response: {
			id: string;
			reminderId: string;
			date: string;
			status: 'completed' | 'pending' | 'skipped';
			response?: string;
			value?: any;
			createdAt: string;
		} = {
			id: `response_${Date.now()}`,
			reminderId: selectedReminder.id,
			date: today,
			status: (reminderValue || reminderResponse ? 'completed' : 'pending') as
				| 'completed'
				| 'pending'
				| 'skipped',
			response: reminderResponse || undefined,
			value:
				selectedReminder.type === 'vital_sign' && reminderValue
					? parseFloat(reminderValue)
					: undefined,
			createdAt: new Date().toISOString(),
		};

		// Update treatment plan with response
		const updatedReminders =
			activePlan.reminders?.map((r) => {
				if (r.id === selectedReminder.id) {
					return {
						...r,
						responses: [...(r.responses || []), response],
					};
				}
				return r;
			}) || [];

		onUpdateTreatmentPlan(activePlan.id, {
			reminders: updatedReminders,
		});

		toast.success('Đã gửi phản hồi nhắc nhở');
		setShowReminderDialog(false);
		setSelectedReminder(null);
		setReminderResponse('');
		setReminderValue('');
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-xl font-semibold">Phác đồ điều trị của tôi</h3>
				<p className="text-sm text-gray-600">
					Xem và cập nhật tình hình thực hiện điều trị theo phác đồ hàng ngày
				</p>
			</div>

			{/* Today's Reminders */}
			{todayReminders.length > 0 && (
				<div className="bg-yellow-50 border-l-4 border-l-yellow-500 rounded-lg p-4">
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-semibold text-yellow-900 flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Nhắc nhở hôm nay ({todayReminders.length})
						</h4>
					</div>
					<div className="space-y-2">
						{todayReminders.map((reminder) => {
							const priorityColor =
								reminder.priority === 'high'
									? 'border-red-300 bg-red-50'
									: reminder.priority === 'medium'
									? 'border-yellow-300 bg-yellow-50'
									: 'border-gray-300 bg-gray-50';

							return (
								<Card
									key={reminder.id}
									className={`border-l-4 ${priorityColor}`}
								>
									<CardContent className="p-4">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="font-medium text-sm text-gray-900 mb-1">
													{reminder.title}
												</div>
												{reminder.description && (
													<p className="text-xs text-gray-600 mb-2">
														{reminder.description}
													</p>
												)}
												<div className="flex items-center gap-2">
													{reminder.priority && (
														<Badge
															variant="outline"
															className={`text-xs ${
																reminder.priority === 'high'
																	? 'border-red-300 text-red-700'
																	: reminder.priority === 'medium'
																	? 'border-yellow-300 text-yellow-700'
																	: 'border-gray-300 text-gray-700'
															}`}
														>
															{reminder.priority === 'high'
																? 'Cao'
																: reminder.priority === 'medium'
																? 'Trung bình'
																: 'Thấp'}
														</Badge>
													)}
												</div>
											</div>
											<Button
												variant="default"
												size="sm"
												onClick={() => handleOpenReminderDialog(reminder)}
												className="flex items-center gap-2"
											>
												<MessageSquare className="h-4 w-4" />
												Phản hồi
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			<div className="space-y-4">
				{treatmentPlans.length === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<div className="text-center py-12 text-gray-500">
								<Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
								<p>Bạn chưa có phác đồ điều trị nào</p>
							</div>
						</CardContent>
					</Card>
				) : (
					treatmentPlans.map((plan) => {
						const record = records.find((r) => r.id === plan.recordId);
						const medicationCount = plan.medications.length;

						return (
							<Card
								key={plan.id}
								className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
								onClick={() => handleOpenDetailDialog(plan)}
							>
								<CardContent className="p-6">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-3">
											<div className="flex items-center gap-3">
												<Pill className="h-5 w-5 text-purple-600 flex-shrink-0" />
												<CardTitle className="text-lg">
													Phác đồ điều trị
												</CardTitle>
												<Badge
													variant="outline"
													className="flex items-center gap-1"
												>
													{getStatusIcon(plan.status)}
													{getStatusLabel(plan.status)}
												</Badge>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
												<div className="flex items-center gap-2">
													<span className="text-gray-600">Bác sĩ:</span>
													<strong>{plan.createdBy}</strong>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-gray-600">Ngày tạo:</span>
													<span>
														{new Date(plan.createdAt).toLocaleDateString(
															'vi-VN',
														)}
													</span>
												</div>
												{record && (
													<div className="flex items-center gap-2">
														<span className="text-gray-600">
															Mã khách hàng:
														</span>
														<strong>{record.receiveCode}</strong>
													</div>
												)}
												{plan.followUpDate && (
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-blue-500" />
														<span className="text-gray-600">Tái khám:</span>
														<span>
															{new Date(plan.followUpDate).toLocaleDateString(
																'vi-VN',
															)}
														</span>
													</div>
												)}
												<div className="flex items-center gap-2">
													<span className="text-gray-600">Số thuốc:</span>
													<strong>{medicationCount}</strong>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-2 flex-shrink-0">
											<Button
												variant="ghost"
												size="sm"
												className="flex items-center gap-2"
											>
												Xem chi tiết
												<Edit className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})
				)}
			</div>

			{/* Detail Dialog */}
			<Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
				<DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[95vh] overflow-y-auto">
					{selectedPlan &&
						(() => {
							const record = records.find(
								(r) => r.id === selectedPlan.recordId,
							);
							return (
								<>
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											<Pill className="h-5 w-5 text-purple-600" />
											Chi tiết phác đồ điều trị
										</DialogTitle>
										<DialogDescription>
											<div className="flex items-center gap-4 flex-wrap mt-2">
												<div className="flex items-center gap-2">
													<span className="text-sm">
														Bác sĩ: <strong>{selectedPlan.createdBy}</strong>
													</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-sm">
														Ngày tạo:{' '}
														{new Date(
															selectedPlan.createdAt,
														).toLocaleDateString('vi-VN')}
													</span>
												</div>
												{record && (
													<div className="flex items-center gap-2">
														<span className="text-sm">
															Mã khách hàng:{' '}
															<strong>{record.receiveCode}</strong>
														</span>
													</div>
												)}
												{selectedPlan.followUpDate && (
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-blue-500" />
														<span className="text-sm">
															Tái khám:{' '}
															{new Date(
																selectedPlan.followUpDate,
															).toLocaleDateString('vi-VN')}
														</span>
													</div>
												)}
												<Badge
													variant="outline"
													className="flex items-center gap-1"
												>
													{getStatusIcon(selectedPlan.status)}
													{getStatusLabel(selectedPlan.status)}
												</Badge>
											</div>
										</DialogDescription>
									</DialogHeader>

									<div className="space-y-6 mt-4">
										{/* Treatment Plan Details */}
										<div className="border rounded-lg p-4 bg-gray-50">
											<TreatmentPlanManager
												recordId={selectedPlan.recordId}
												doctorName={selectedPlan.createdBy}
												treatmentPlan={selectedPlan}
												onSave={() => {}}
												onUpdate={() => {}}
												readOnly={true}
											/>
										</div>

										{/* Instructions */}
										{selectedPlan.instructions && (
											<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
												<h4 className="font-semibold text-blue-900 mb-2">
													Hướng dẫn điều trị:
												</h4>
												<p className="text-sm text-blue-800">
													{selectedPlan.instructions}
												</p>
											</div>
										)}

										{/* Reminders */}
										{selectedPlan.reminders &&
											selectedPlan.reminders.filter((r) => r.enabled).length >
												0 && (
												<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
													<h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
														<AlertCircle className="h-4 w-4" />
														Nhắc nhở từ bác sĩ:
													</h4>
													<div className="space-y-2">
														{selectedPlan.reminders
															.filter((r) => r.enabled)
															.map((reminder) => (
																<div
																	key={reminder.id}
																	className="bg-white rounded-lg p-3 border border-yellow-200"
																>
																	<div className="flex items-start justify-between">
																		<div className="flex-1">
																			<div className="font-medium text-sm text-yellow-900">
																				{reminder.title}
																			</div>
																			{reminder.description && (
																				<p className="text-xs text-yellow-800 mt-1">
																					{reminder.description}
																				</p>
																			)}
																			<div className="flex items-center gap-2 mt-2">
																				{reminder.priority && (
																					<Badge
																						variant="outline"
																						className={`text-xs ${
																							reminder.priority === 'high'
																								? 'border-red-300 text-red-700'
																								: reminder.priority === 'medium'
																								? 'border-yellow-300 text-yellow-700'
																								: 'border-gray-300 text-gray-700'
																						}`}
																					>
																						{reminder.priority === 'high'
																							? 'Cao'
																							: reminder.priority === 'medium'
																							? 'Trung bình'
																							: 'Thấp'}
																					</Badge>
																				)}
																				{reminder.frequency && (
																					<Badge
																						variant="outline"
																						className="text-xs"
																					>
																						{reminder.frequency === 'daily'
																							? 'Hàng ngày'
																							: reminder.frequency === 'weekly'
																							? 'Hàng tuần'
																							: 'Tùy chỉnh'}
																					</Badge>
																				)}
																			</div>
																		</div>
																	</div>
																</div>
															))}
													</div>
												</div>
											)}

										{/* Daily Progress Tracking */}
										{selectedPlan.status === 'active' && (
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<h4 className="font-semibold">
														Theo dõi tình hình điều trị hàng ngày
													</h4>
													<Button
														variant="default"
														size="sm"
														onClick={() => {
															setShowDetailDialog(false);
															handleOpenDailyUpdateDialog(selectedPlan);
														}}
														className="flex items-center gap-2"
													>
														<Activity className="h-4 w-4" />
														Cập nhật hôm nay
													</Button>
												</div>

												<Tabs defaultValue="medications" className="mt-4">
													<TabsList>
														<TabsTrigger value="medications">Thuốc</TabsTrigger>
														<TabsTrigger value="vitals">
															Chỉ số sức khỏe
														</TabsTrigger>
													</TabsList>

													<TabsContent
														value="medications"
														className="space-y-4"
													>
														{selectedPlan.medications.map((medication) => {
															const progress = getMedicationProgress(
																selectedPlan.id,
																medication.id,
															);
															const progressCount = progress.length;

															return (
																<Card
																	key={medication.id}
																	className="border-l-2 border-l-blue-400"
																>
																	<CardHeader className="pb-3">
																		<div className="flex items-start justify-between">
																			<div className="flex-1">
																				<CardTitle className="text-base">
																					{medication.name}
																				</CardTitle>
																				<CardDescription className="mt-1">
																					{medication.dosage} -{' '}
																					{medication.frequency} -{' '}
																					{medication.duration}
																				</CardDescription>
																			</div>
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={() => {
																					setShowDetailDialog(false);
																					handleOpenProgressDialog(
																						selectedPlan,
																						medication.id,
																					);
																				}}
																				className="flex items-center gap-2"
																			>
																				<Plus className="h-4 w-4" />
																				Cập nhật
																			</Button>
																		</div>
																	</CardHeader>
																	<CardContent>
																		{/* Progress Summary */}
																		<div className="mb-4 p-3 bg-gray-50 rounded-lg">
																			<div className="flex items-center gap-4 text-sm">
																				<span className="text-gray-600">
																					Đã cập nhật:{' '}
																					<strong>{progressCount}</strong> lần
																				</span>
																				<span className="text-gray-600">
																					Đã uống:{' '}
																					<strong className="text-green-600">
																						{
																							progress.filter(
																								(p) => p.status === 'taken',
																							).length
																						}
																					</strong>
																				</span>
																				<span className="text-gray-600">
																					Quên:{' '}
																					<strong className="text-red-600">
																						{
																							progress.filter(
																								(p) => p.status === 'missed',
																							).length
																						}
																					</strong>
																				</span>
																			</div>
																		</div>

																		{/* Progress History */}
																		{progress.length > 0 && (
																			<div className="mt-4 space-y-2">
																				<Label className="text-sm font-semibold">
																					Lịch sử cập nhật:
																				</Label>
																				<div className="space-y-2 max-h-48 overflow-y-auto">
																					{progress
																						.sort(
																							(a, b) =>
																								new Date(b.date).getTime() -
																								new Date(a.date).getTime(),
																						)
																						.map((p) => (
																							<div
																								key={p.id}
																								className="flex items-start justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
																							>
																								<div className="flex-1">
																									<div className="flex items-center gap-2 mb-1">
																										{getProgressStatusIcon(
																											p.status,
																										)}
																										<span className="font-medium">
																											{getProgressStatusLabel(
																												p.status,
																											)}
																										</span>
																										<span className="text-sm text-gray-500">
																											-{' '}
																											{new Date(
																												p.date,
																											).toLocaleDateString(
																												'vi-VN',
																											)}
																										</span>
																									</div>
																									{p.notes && (
																										<p className="text-sm text-gray-600 ml-6">
																											{p.notes}
																										</p>
																									)}
																								</div>
																								<Button
																									variant="ghost"
																									size="sm"
																									onClick={() => {
																										setShowDetailDialog(false);
																										handleOpenProgressDialog(
																											selectedPlan,
																											medication.id,
																											p.date,
																										);
																									}}
																								>
																									<Edit className="h-4 w-4" />
																								</Button>
																							</div>
																						))}
																				</div>
																			</div>
																		)}
																	</CardContent>
																</Card>
															);
														})}
													</TabsContent>

													<TabsContent value="vitals" className="space-y-4">
														{(() => {
															const allDailyUpdates: any[] = [];
															Object.keys(treatmentProgress).forEach((key) => {
																if (
																	key.startsWith(`${selectedPlan.id}_daily_`)
																) {
																	const updates = treatmentProgress[key] || [];
																	updates.forEach((update: any) => {
																		if (update.vitalSigns) {
																			allDailyUpdates.push(update);
																		}
																	});
																}
															});

															if (allDailyUpdates.length === 0) {
																return (
																	<div className="text-center py-8 text-gray-500">
																		<Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
																		<p>Chưa có dữ liệu chỉ số sức khỏe</p>
																		<p className="text-sm mt-2">
																			Nhấn "Cập nhật hôm nay" để bắt đầu theo
																			dõi
																		</p>
																	</div>
																);
															}

															return (
																<div className="space-y-4">
																	{allDailyUpdates
																		.sort(
																			(a, b) =>
																				new Date(b.date).getTime() -
																				new Date(a.date).getTime(),
																		)
																		.map((dailyProgress) => {
																			const vs = dailyProgress.vitalSigns;
																			if (!vs) return null;

																			return (
																				<Card
																					key={dailyProgress.id}
																					className="border-l-2 border-l-green-400"
																				>
																					<CardHeader className="pb-3">
																						<CardTitle className="text-sm">
																							{new Date(
																								dailyProgress.date,
																							).toLocaleDateString('vi-VN', {
																								weekday: 'long',
																								day: '2-digit',
																								month: '2-digit',
																								year: 'numeric',
																							})}
																						</CardTitle>
																					</CardHeader>
																					<CardContent>
																						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
																							{vs.bloodPressure && (
																								<div className="flex items-center gap-2">
																									<Activity className="h-4 w-4 text-red-500" />
																									<div>
																										<div className="text-xs text-gray-500">
																											Huyết áp
																										</div>
																										<div className="font-semibold">
																											{
																												vs.bloodPressure
																													.systolic
																											}
																											/
																											{
																												vs.bloodPressure
																													.diastolic
																											}{' '}
																											mmHg
																										</div>
																									</div>
																								</div>
																							)}
																							{vs.bloodSugar && (
																								<div className="flex items-center gap-2">
																									<Droplet className="h-4 w-4 text-blue-500" />
																									<div>
																										<div className="text-xs text-gray-500">
																											Đường huyết
																										</div>
																										<div className="font-semibold">
																											{vs.bloodSugar.value}{' '}
																											{vs.bloodSugar.type ===
																											'fasting'
																												? 'mg/dL (đói)'
																												: vs.bloodSugar.type ===
																												  'postprandial'
																												? 'mg/dL (sau ăn)'
																												: 'mg/dL'}
																										</div>
																									</div>
																								</div>
																							)}
																							{vs.heartRate && (
																								<div className="flex items-center gap-2">
																									<Heart className="h-4 w-4 text-pink-500" />
																									<div>
																										<div className="text-xs text-gray-500">
																											Nhịp tim
																										</div>
																										<div className="font-semibold">
																											{vs.heartRate} bpm
																										</div>
																									</div>
																								</div>
																							)}
																							{vs.weight && (
																								<div className="flex items-center gap-2">
																									<Scale className="h-4 w-4 text-gray-500" />
																									<div>
																										<div className="text-xs text-gray-500">
																											Cân nặng
																										</div>
																										<div className="font-semibold">
																											{vs.weight} kg
																										</div>
																									</div>
																								</div>
																							)}
																							{vs.temperature && (
																								<div className="flex items-center gap-2">
																									<Thermometer className="h-4 w-4 text-orange-500" />
																									<div>
																										<div className="text-xs text-gray-500">
																											Nhiệt độ
																										</div>
																										<div className="font-semibold">
																											{vs.temperature} °C
																										</div>
																									</div>
																								</div>
																							)}
																							{vs.oxygenSaturation && (
																								<div className="flex items-center gap-2">
																									<Activity className="h-4 w-4 text-cyan-500" />
																									<div>
																										<div className="text-xs text-gray-500">
																											SpO2
																										</div>
																										<div className="font-semibold">
																											{vs.oxygenSaturation}%
																										</div>
																									</div>
																								</div>
																							)}
																							{vs.painLevel && (
																								<div className="flex items-center gap-2">
																									<AlertCircle className="h-4 w-4 text-yellow-500" />
																									<div>
																										<div className="text-xs text-gray-500">
																											Mức độ đau
																										</div>
																										<div className="font-semibold">
																											{vs.painLevel}/10
																										</div>
																									</div>
																								</div>
																							)}
																						</div>
																						{dailyProgress.notes && (
																							<div className="mt-3 pt-3 border-t">
																								<div className="text-xs text-gray-500 mb-1">
																									Ghi chú:
																								</div>
																								<div className="text-sm text-gray-700">
																									{dailyProgress.notes}
																								</div>
																							</div>
																						)}
																						<Button
																							variant="outline"
																							size="sm"
																							onClick={() => {
																								setShowDetailDialog(false);
																								handleOpenDailyUpdateDialog(
																									selectedPlan,
																									dailyProgress.date,
																								);
																							}}
																							className="mt-3"
																						>
																							<Edit className="h-4 w-4 mr-2" />
																							Chỉnh sửa
																						</Button>
																					</CardContent>
																				</Card>
																			);
																		})}
																</div>
															);
														})()}
													</TabsContent>
												</Tabs>
											</div>
										)}

										{/* Actions */}
										{selectedPlan.status === 'active' && (
											<div className="flex gap-2 pt-4 border-t">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setShowDetailDialog(false);
														handleOpenFeedbackDialog(selectedPlan);
													}}
													className="flex items-center gap-2"
												>
													<MessageSquare className="h-4 w-4" />
													Phản hồi bác sĩ
												</Button>
											</div>
										)}
									</div>
								</>
							);
						})()}
				</DialogContent>
			</Dialog>

			{/* Daily Update Dialog */}
			<Dialog
				open={showDailyUpdateDialog}
				onOpenChange={setShowDailyUpdateDialog}
			>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Cập nhật tình hình sức khỏe hàng ngày</DialogTitle>
						<DialogDescription>
							Nhập các chỉ số sức khỏe và tình hình điều trị của bạn
						</DialogDescription>
					</DialogHeader>
					{selectedPlan && (
						<div className="space-y-6">
							<div className="space-y-2">
								<Label>Ngày *</Label>
								<DatePicker
									date={progressDate}
									onStringChange={(date) => setProgressDate(date)}
									placeholder="Chọn ngày"
								/>
							</div>

							{/* Vital Signs */}
							<div className="space-y-4">
								<h4 className="font-semibold text-lg">Chỉ số sức khỏe</h4>

								{/* Blood Pressure */}
								<div className="grid grid-cols-3 gap-3">
									<div className="space-y-2">
										<Label>Huyết áp tâm thu (mmHg)</Label>
										<Input
											type="number"
											placeholder="120"
											value={vitalSigns.bloodPressure.systolic}
											onChange={(e) =>
												setVitalSigns({
													...vitalSigns,
													bloodPressure: {
														...vitalSigns.bloodPressure,
														systolic: e.target.value,
													},
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Huyết áp tâm trương (mmHg)</Label>
										<Input
											type="number"
											placeholder="80"
											value={vitalSigns.bloodPressure.diastolic}
											onChange={(e) =>
												setVitalSigns({
													...vitalSigns,
													bloodPressure: {
														...vitalSigns.bloodPressure,
														diastolic: e.target.value,
													},
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Thời gian đo</Label>
										<Select
											value={vitalSigns.bloodPressure.time}
											onValueChange={(value) =>
												setVitalSigns({
													...vitalSigns,
													bloodPressure: {
														...vitalSigns.bloodPressure,
														time: value,
													},
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="morning">Sáng</SelectItem>
												<SelectItem value="noon">Trưa</SelectItem>
												<SelectItem value="afternoon">Chiều</SelectItem>
												<SelectItem value="evening">Tối</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Blood Sugar */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label>Đường huyết (mg/dL)</Label>
										<Input
											type="number"
											step="0.1"
											placeholder="100"
											value={vitalSigns.bloodSugar.value}
											onChange={(e) =>
												setVitalSigns({
													...vitalSigns,
													bloodSugar: {
														...vitalSigns.bloodSugar,
														value: e.target.value,
													},
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Loại đo</Label>
										<Select
											value={vitalSigns.bloodSugar.type}
											onValueChange={(
												value: 'fasting' | 'postprandial' | 'random',
											) =>
												setVitalSigns({
													...vitalSigns,
													bloodSugar: {
														...vitalSigns.bloodSugar,
														type: value,
													},
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="fasting">Đo lúc đói</SelectItem>
												<SelectItem value="postprandial">Sau ăn</SelectItem>
												<SelectItem value="random">Ngẫu nhiên</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Heart Rate */}
								<div className="space-y-2">
									<Label>Nhịp tim (bpm)</Label>
									<Input
										type="number"
										placeholder="72"
										value={vitalSigns.heartRate}
										onChange={(e) =>
											setVitalSigns({
												...vitalSigns,
												heartRate: e.target.value,
											})
										}
									/>
								</div>

								{/* Weight and Temperature */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label>Cân nặng (kg)</Label>
										<Input
											type="number"
											step="0.1"
											placeholder="70"
											value={vitalSigns.weight}
											onChange={(e) =>
												setVitalSigns({
													...vitalSigns,
													weight: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Nhiệt độ (°C)</Label>
										<Input
											type="number"
											step="0.1"
											placeholder="36.5"
											value={vitalSigns.temperature}
											onChange={(e) =>
												setVitalSigns({
													...vitalSigns,
													temperature: e.target.value,
												})
											}
										/>
									</div>
								</div>

								{/* Oxygen Saturation and Pain Level */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label>SpO2 (%)</Label>
										<Input
											type="number"
											placeholder="98"
											value={vitalSigns.oxygenSaturation}
											onChange={(e) =>
												setVitalSigns({
													...vitalSigns,
													oxygenSaturation: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Mức độ đau (1-10)</Label>
										<Input
											type="number"
											min="1"
											max="10"
											placeholder="0"
											value={vitalSigns.painLevel}
											onChange={(e) =>
												setVitalSigns({
													...vitalSigns,
													painLevel: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>

							{/* Notes */}
							<div className="space-y-2">
								<Label>Ghi chú</Label>
								<Textarea
									value={progressNotes}
									onChange={(e) => setProgressNotes(e.target.value)}
									placeholder="Nhập ghi chú về tình hình sức khỏe, cảm nhận, tác dụng phụ, v.v..."
									rows={4}
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<Button onClick={handleSaveDailyUpdate} className="flex-1">
									Lưu cập nhật
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowDailyUpdateDialog(false)}
								>
									Hủy
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Progress Dialog */}
			<Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cập nhật tình hình uống thuốc</DialogTitle>
						<DialogDescription>
							Cập nhật tình hình thực hiện điều trị theo phác đồ
						</DialogDescription>
					</DialogHeader>
					{selectedPlan && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Thuốc</Label>
								<Input
									value={
										selectedPlan.medications.find(
											(m) => m.id === selectedMedication,
										)?.name || ''
									}
									disabled
								/>
							</div>
							<div className="space-y-2">
								<Label>Ngày *</Label>
								<DatePicker
									date={progressDate}
									onStringChange={(date) => setProgressDate(date)}
									placeholder="Chọn ngày"
								/>
							</div>
							<div className="space-y-2">
								<Label>Tình trạng *</Label>
								<Select
									value={progressStatus}
									onValueChange={(value: 'taken' | 'missed' | 'skipped') =>
										setProgressStatus(value)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="taken">Đã uống</SelectItem>
										<SelectItem value="missed">Quên uống</SelectItem>
										<SelectItem value="skipped">Bỏ qua</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Ghi chú</Label>
								<Textarea
									value={progressNotes}
									onChange={(e) => setProgressNotes(e.target.value)}
									placeholder="Nhập ghi chú về tình hình điều trị (ví dụ: tác dụng phụ, cảm nhận, v.v.)..."
									rows={3}
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<Button onClick={handleSaveProgress} className="flex-1">
									Lưu
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowProgressDialog(false)}
								>
									Hủy
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Reminder Response Dialog */}
			<Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5 text-yellow-600" />
							Phản hồi nhắc nhở
						</DialogTitle>
						<DialogDescription>
							{selectedReminder && (
								<div>
									<div className="font-medium text-sm mb-1">
										{selectedReminder.title}
									</div>
									{selectedReminder.description && (
										<p className="text-xs text-gray-600">
											{selectedReminder.description}
										</p>
									)}
								</div>
							)}
						</DialogDescription>
					</DialogHeader>
					{selectedReminder && (
						<div className="space-y-4 mt-4">
							{selectedReminder.type === 'vital_sign' &&
								selectedReminder.field && (
									<div className="space-y-2">
										<Label>
											{selectedReminder.field === 'temperature'
												? 'Nhiệt độ (°C)'
												: selectedReminder.field === 'bloodPressure'
												? 'Huyết áp (mmHg)'
												: selectedReminder.field === 'bloodSugar'
												? 'Đường huyết (mg/dL)'
												: selectedReminder.field === 'heartRate'
												? 'Nhịp tim (bpm)'
												: selectedReminder.field === 'weight'
												? 'Cân nặng (kg)'
												: selectedReminder.field === 'oxygenSaturation'
												? 'SpO2 (%)'
												: selectedReminder.field === 'painLevel'
												? 'Mức độ đau (1-10)'
												: 'Giá trị'}
											*
										</Label>
										<Input
											type="number"
											step="0.1"
											placeholder={
												selectedReminder.field === 'temperature'
													? '36.5'
													: selectedReminder.field === 'heartRate'
													? '72'
													: selectedReminder.field === 'weight'
													? '70'
													: selectedReminder.field === 'oxygenSaturation'
													? '98'
													: selectedReminder.field === 'painLevel'
													? '0'
													: ''
											}
											value={reminderValue}
											onChange={(e) => setReminderValue(e.target.value)}
										/>
									</div>
								)}

							<div className="space-y-2">
								<Label>
									{selectedReminder.type === 'vital_sign'
										? 'Ghi chú thêm'
										: 'Phản hồi'}
									{selectedReminder.type !== 'vital_sign' && '*'}
								</Label>
								<Textarea
									placeholder={
										selectedReminder.type === 'diet'
											? 'Ví dụ: Sáng: cháo, Trưa: cơm với thịt luộc, Tối: súp...'
											: selectedReminder.type === 'exercise'
											? 'Ví dụ: Đi bộ 30 phút, tập thể dục nhẹ...'
											: selectedReminder.type === 'activity'
											? 'Mô tả hoạt động đã thực hiện...'
											: 'Nhập phản hồi của bạn...'
									}
									value={reminderResponse}
									onChange={(e) => setReminderResponse(e.target.value)}
									rows={4}
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<Button
									variant="outline"
									onClick={() => {
										setShowReminderDialog(false);
										setSelectedReminder(null);
										setReminderResponse('');
										setReminderValue('');
									}}
								>
									Hủy
								</Button>
								<Button
									onClick={handleSaveReminderResponse}
									disabled={
										(selectedReminder.type === 'vital_sign' &&
											!reminderValue) ||
										(selectedReminder.type !== 'vital_sign' &&
											!reminderResponse.trim())
									}
									className="flex-1"
								>
									<CheckCircle className="h-4 w-4 mr-2" />
									Gửi phản hồi
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Feedback Dialog */}
			<Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Phản hồi với bác sĩ</DialogTitle>
						<DialogDescription>
							Gửi phản hồi về tình hình điều trị cho bác sĩ
						</DialogDescription>
					</DialogHeader>
					{selectedPlan && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Phản hồi *</Label>
								<Textarea
									value={patientFeedback}
									onChange={(e) => setPatientFeedback(e.target.value)}
									placeholder="Nhập phản hồi về tình hình điều trị, tác dụng phụ, cảm nhận, hoặc câu hỏi cho bác sĩ..."
									rows={5}
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<Button onClick={handleSaveFeedback} className="flex-1">
									Gửi phản hồi
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowFeedbackDialog(false)}
								>
									Hủy
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
