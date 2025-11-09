import React, { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { TreatmentPlan, Medication, TreatmentReminder } from '../types';
import { Pill, Plus, X, Calendar, FileText, Bell, AlertCircle } from 'lucide-react';
import { DatePicker } from './ui/date-picker';

interface TreatmentPlanManagerProps {
	recordId: string;
	doctorName: string;
	treatmentPlan?: TreatmentPlan;
	onSave: (treatmentPlan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'>) => void;
	onUpdate?: (treatmentPlan: TreatmentPlan) => void;
	readOnly?: boolean;
	hideCard?: boolean; // Ẩn Card wrapper khi dùng trong Dialog
}

const commonMedications = [
	{ name: 'Paracetamol', dosage: '500mg', unit: 'viên' },
	{ name: 'Amoxicillin', dosage: '500mg', unit: 'viên' },
	{ name: 'Ibuprofen', dosage: '400mg', unit: 'viên' },
	{ name: 'Cefuroxime', dosage: '250mg', unit: 'viên' },
	{ name: 'Azithromycin', dosage: '500mg', unit: 'viên' },
	{ name: 'Omeprazole', dosage: '20mg', unit: 'viên' },
	{ name: 'Metformin', dosage: '500mg', unit: 'viên' },
	{ name: 'Amlodipine', dosage: '5mg', unit: 'viên' },
	{ name: 'Atorvastatin', dosage: '20mg', unit: 'viên' },
	{ name: 'Losartan', dosage: '50mg', unit: 'viên' },
];

const frequencyOptions = [
	'1 lần/ngày',
	'2 lần/ngày',
	'3 lần/ngày',
	'4 lần/ngày',
	'Sau ăn',
	'Trước ăn',
	'Khi đau',
	'Theo chỉ định',
];

const durationOptions = [
	'3 ngày',
	'5 ngày',
	'7 ngày',
	'10 ngày',
	'14 ngày',
	'21 ngày',
	'30 ngày',
	'Theo chỉ định',
];

export function TreatmentPlanManager({
	recordId,
	doctorName,
	treatmentPlan,
	onSave,
	onUpdate,
	readOnly = false,
	hideCard = false,
}: TreatmentPlanManagerProps) {
	const [showDialog, setShowDialog] = useState(false);
	const [medications, setMedications] = useState<Medication[]>(
		treatmentPlan?.medications || [],
	);
	const [instructions, setInstructions] = useState(
		treatmentPlan?.instructions || '',
	);
	const [followUpDate, setFollowUpDate] = useState(
		treatmentPlan?.followUpDate || '',
	);
	const [followUpInstructions, setFollowUpInstructions] = useState(
		treatmentPlan?.followUpInstructions || '',
	);
	const [notes, setNotes] = useState(treatmentPlan?.notes || '');
	const [reminders, setReminders] = useState<TreatmentReminder[]>(
		treatmentPlan?.reminders || [],
	);

	// Sync state when treatmentPlan changes
	useEffect(() => {
		if (treatmentPlan) {
			setMedications(treatmentPlan.medications);
			setInstructions(treatmentPlan.instructions || '');
			setFollowUpDate(treatmentPlan.followUpDate || '');
			setFollowUpInstructions(treatmentPlan.followUpInstructions || '');
			setNotes(treatmentPlan.notes || '');
			setReminders(treatmentPlan.reminders || []);
		} else {
			setMedications([]);
			setInstructions('');
			setFollowUpDate('');
			setFollowUpInstructions('');
			setNotes('');
			setReminders([]);
		}
	}, [treatmentPlan]);

	const addMedication = () => {
		const newMedication: Medication = {
			id: `med_${Date.now()}`,
			name: '',
			dosage: '',
			frequency: '',
			duration: '',
			quantity: 1,
			unit: 'viên',
			instructions: '',
		};
		setMedications([...medications, newMedication]);
	};

	const removeMedication = (id: string) => {
		setMedications(medications.filter((med) => med.id !== id));
	};

	const updateMedication = (id: string, updates: Partial<Medication>) => {
		setMedications(
			medications.map((med) =>
				med.id === id ? { ...med, ...updates } : med,
			),
		);
	};

	const handleSave = () => {
		if (medications.length === 0) {
			toast.error('Vui lòng thêm ít nhất một loại thuốc');
			return;
		}

		// Validate medications
		for (const med of medications) {
			if (!med.name || !med.dosage || !med.frequency || !med.duration) {
				toast.error('Vui lòng điền đầy đủ thông tin cho tất cả thuốc');
				return;
			}
		}

		// Validate reminders
		for (const reminder of reminders) {
			if (!reminder.title) {
				toast.error('Vui lòng điền tiêu đề cho tất cả nhắc nhở');
				return;
			}
			if (reminder.type === 'vital_sign' && !reminder.field) {
				toast.error('Vui lòng chọn chỉ số sức khỏe cho nhắc nhở loại "Chỉ số sức khỏe"');
				return;
			}
		}

		const planData: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'> = {
			recordId,
			medications,
			instructions: instructions || undefined,
			followUpDate: followUpDate || undefined,
			followUpInstructions: followUpInstructions || undefined,
			notes: notes || undefined,
			status: treatmentPlan?.status || 'active',
			updatedAt: new Date().toISOString(),
			reminders: reminders.length > 0 ? reminders : undefined,
		};

		if (treatmentPlan && onUpdate) {
			onUpdate({ ...treatmentPlan, ...planData });
		} else {
			onSave(planData);
		}

		toast.success('Đã lưu phác đồ điều trị');
		setShowDialog(false);
	};

	const handleOpenDialog = () => {
		if (treatmentPlan) {
			setMedications(treatmentPlan.medications);
			setInstructions(treatmentPlan.instructions || '');
			setFollowUpDate(treatmentPlan.followUpDate || '');
			setFollowUpInstructions(treatmentPlan.followUpInstructions || '');
			setNotes(treatmentPlan.notes || '');
			setReminders(treatmentPlan.reminders || []);
		}
		setShowDialog(true);
	};

	// Always render if not readOnly, or if treatmentPlan exists
	if (readOnly && !treatmentPlan) {
		return null;
	}

	// Content when treatmentPlan exists
	const treatmentPlanContent = treatmentPlan ? (
		<div className="space-y-4">
			{/* Medications */}
			<div>
				<Label className="mb-2 block">Thuốc điều trị</Label>
				<div className="space-y-3">
					{treatmentPlan.medications.map((med) => (
									<div
										key={med.id}
										className="p-3 border rounded-lg bg-gray-50"
									>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="font-medium">{med.name}</div>
												<div className="text-sm text-gray-600 mt-1">
													<span className="font-medium">Liều lượng:</span>{' '}
													{med.dosage} - <span className="font-medium">Tần suất:</span>{' '}
													{med.frequency} - <span className="font-medium">Thời gian:</span>{' '}
													{med.duration}
												</div>
												<div className="text-sm text-gray-600">
													<span className="font-medium">Số lượng:</span> {med.quantity}{' '}
													{med.unit}
												</div>
												{med.instructions && (
													<div className="text-sm text-gray-600 mt-1">
														<span className="font-medium">Ghi chú:</span>{' '}
														{med.instructions}
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Instructions */}
						{treatmentPlan.instructions && (
							<div>
								<Label className="mb-2 block">Hướng dẫn điều trị</Label>
								<div className="p-3 bg-gray-50 rounded-lg text-sm">
									{treatmentPlan.instructions}
								</div>
							</div>
						)}

						{/* Follow-up */}
						{treatmentPlan.followUpDate && (
							<div>
								<Label className="mb-2 block flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									Tái khám
								</Label>
								<div className="p-3 bg-blue-50 rounded-lg">
									<div className="text-sm font-medium">
										Ngày: {new Date(treatmentPlan.followUpDate).toLocaleDateString('vi-VN')}
									</div>
									{treatmentPlan.followUpInstructions && (
										<div className="text-sm text-gray-600 mt-1">
											{treatmentPlan.followUpInstructions}
										</div>
									)}
								</div>
							</div>
						)}

						{/* Notes */}
						{treatmentPlan.notes && (
							<div>
								<Label className="mb-2 block flex items-center gap-2">
									<FileText className="h-4 w-4" />
									Ghi chú
								</Label>
								<div className="p-3 bg-gray-50 rounded-lg text-sm">
									{treatmentPlan.notes}
								</div>
							</div>
						)}

			{!readOnly && !hideCard && (
				<Button onClick={handleOpenDialog} variant="outline" className="w-full">
					Chỉnh sửa phác đồ
				</Button>
			)}
		</div>
	) : null;

	if (hideCard) {
		// Form content cho Dialog - được dùng trong Dialog của DoctorWorkspace
		const formContent = (
			<div className="space-y-6">
				{/* Medications */}
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<Label>Thuốc điều trị</Label>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={addMedication}
						>
							<Plus className="h-4 w-4 mr-1" />
							Thêm thuốc
						</Button>
					</div>

					<div className="space-y-4">
						{medications.map((med, index) => (
							<Card key={med.id} className="p-4">
								<div className="flex justify-between items-start mb-3">
									<span className="font-medium text-sm">
										Thuốc {index + 1}
									</span>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										onClick={() => removeMedication(med.id)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Tên thuốc *</Label>
										<Select
											value={med.name}
											onValueChange={(value) =>
												updateMedication(med.id, { name: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Chọn hoặc nhập tên thuốc" />
											</SelectTrigger>
											<SelectContent>
												{commonMedications.map((commonMed) => (
													<SelectItem key={commonMed.name} value={commonMed.name}>
														{commonMed.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{!commonMedications.find((m) => m.name === med.name) && (
											<Input
												placeholder="Nhập tên thuốc"
												value={med.name}
												onChange={(e) =>
													updateMedication(med.id, { name: e.target.value })
												}
											/>
										)}
									</div>

									<div className="space-y-2">
										<Label>Liều lượng *</Label>
										<Input
											placeholder="vd: 500mg, 1 viên"
											value={med.dosage}
											onChange={(e) =>
												updateMedication(med.id, { dosage: e.target.value })
											}
										/>
									</div>

									<div className="space-y-2">
										<Label>Tần suất *</Label>
										<Select
											value={med.frequency}
											onValueChange={(value) =>
												updateMedication(med.id, { frequency: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Chọn tần suất" />
											</SelectTrigger>
											<SelectContent>
												{frequencyOptions.map((freq) => (
													<SelectItem key={freq} value={freq}>
														{freq}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Thời gian *</Label>
										<Select
											value={med.duration}
											onValueChange={(value) =>
												updateMedication(med.id, { duration: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Chọn thời gian" />
											</SelectTrigger>
											<SelectContent>
												{durationOptions.map((dur) => (
													<SelectItem key={dur} value={dur}>
														{dur}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Số lượng</Label>
										<Input
											type="number"
											min="1"
											value={med.quantity}
											onChange={(e) =>
												updateMedication(med.id, {
													quantity: parseInt(e.target.value, 10) || 1,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label>Đơn vị</Label>
										<Select
											value={med.unit}
											onValueChange={(value) =>
												updateMedication(med.id, { unit: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="viên">Viên</SelectItem>
												<SelectItem value="chai">Chai</SelectItem>
												<SelectItem value="tuýp">Tuýp</SelectItem>
												<SelectItem value="gói">Gói</SelectItem>
												<SelectItem value="lọ">Lọ</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="mt-4 space-y-2">
									<Label>Ghi chú thêm</Label>
									<Input
										placeholder="vd: Uống sau ăn, Không dùng với rượu"
										value={med.instructions || ''}
										onChange={(e) =>
											updateMedication(med.id, { instructions: e.target.value })
										}
									/>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* General Instructions */}
				<div className="space-y-2">
					<Label>Hướng dẫn điều trị chung</Label>
					<Textarea
						placeholder="Nhập hướng dẫn điều trị chung cho bệnh nhân..."
						value={instructions}
						onChange={(e) => setInstructions(e.target.value)}
						rows={3}
					/>
				</div>

				{/* Follow-up */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Ngày tái khám</Label>
						<DatePicker
							date={followUpDate}
							onStringChange={(date) => setFollowUpDate(date)}
							placeholder="Chọn ngày tái khám"
						/>
					</div>
					<div className="space-y-2">
						<Label>Hướng dẫn tái khám</Label>
						<Input
							placeholder="vd: Tái khám sau 7 ngày"
							value={followUpInstructions}
							onChange={(e) => setFollowUpInstructions(e.target.value)}
						/>
					</div>
				</div>

				{/* Notes */}
				<div className="space-y-2">
					<Label>Ghi chú</Label>
					<Textarea
						placeholder="Nhập ghi chú thêm về phác đồ điều trị..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={2}
					/>
				</div>

				{/* Reminders Configuration */}
				<div className="space-y-4 border-t pt-4">
					<div className="flex justify-between items-center">
						<Label className="flex items-center gap-2">
							<Bell className="h-4 w-4" />
							Nhắc nhở cho bệnh nhân
						</Label>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() => {
								const newReminder: TreatmentReminder = {
									id: `reminder_${Date.now()}`,
									type: 'vital_sign',
									title: '',
									description: '',
									field: '',
									frequency: 'daily',
									enabled: true,
									priority: 'medium',
								};
								setReminders([...reminders, newReminder]);
							}}
						>
							<Plus className="h-4 w-4 mr-1" />
							Thêm nhắc nhở
						</Button>
					</div>

					<div className="space-y-3">
						{reminders.map((reminder, index) => (
							<Card key={reminder.id} className="p-4">
								<div className="flex justify-between items-start mb-3">
									<span className="font-medium text-sm">
										Nhắc nhở {index + 1}
									</span>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										onClick={() => {
											setReminders(reminders.filter((r) => r.id !== reminder.id));
										}}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Loại nhắc nhở *</Label>
										<Select
											value={reminder.type}
											onValueChange={(value: TreatmentReminder['type']) => {
												const updated = reminders.map((r) =>
													r.id === reminder.id
														? { ...r, type: value }
														: r,
												);
												setReminders(updated);
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="vital_sign">Chỉ số sức khỏe</SelectItem>
												<SelectItem value="activity">Hoạt động</SelectItem>
												<SelectItem value="medication">Thuốc</SelectItem>
												<SelectItem value="diet">Khẩu phần ăn</SelectItem>
												<SelectItem value="exercise">Tập luyện</SelectItem>
												<SelectItem value="other">Khác</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{reminder.type === 'vital_sign' && (
										<div className="space-y-2">
											<Label>Chỉ số cần cập nhật *</Label>
											<Select
												value={reminder.field || ''}
												onValueChange={(value) => {
													const updated = reminders.map((r) =>
														r.id === reminder.id ? { ...r, field: value } : r,
													);
													setReminders(updated);
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Chọn chỉ số" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="temperature">Nhiệt độ</SelectItem>
													<SelectItem value="bloodPressure">Huyết áp</SelectItem>
													<SelectItem value="bloodSugar">Đường huyết</SelectItem>
													<SelectItem value="heartRate">Nhịp tim</SelectItem>
													<SelectItem value="weight">Cân nặng</SelectItem>
													<SelectItem value="oxygenSaturation">SpO2</SelectItem>
													<SelectItem value="painLevel">Mức độ đau</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}

									<div className="space-y-2">
										<Label>Tiêu đề nhắc nhở *</Label>
										<Input
											placeholder="Ví dụ: Cập nhật nhiệt độ, Ghi nhận khẩu phần ăn..."
											value={reminder.title}
											onChange={(e) => {
												const updated = reminders.map((r) =>
													r.id === reminder.id ? { ...r, title: e.target.value } : r,
												);
												setReminders(updated);
											}}
										/>
									</div>

									<div className="space-y-2">
										<Label>Mô tả</Label>
										<Textarea
											placeholder="Mô tả chi tiết về nhắc nhở..."
											value={reminder.description || ''}
											onChange={(e) => {
												const updated = reminders.map((r) =>
													r.id === reminder.id
														? { ...r, description: e.target.value }
														: r,
												);
												setReminders(updated);
											}}
											rows={2}
										/>
									</div>

									<div className="space-y-2">
										<Label>Tần suất</Label>
										<Select
											value={reminder.frequency || 'daily'}
											onValueChange={(value: 'daily' | 'weekly' | 'custom') => {
												const updated = reminders.map((r) =>
													r.id === reminder.id ? { ...r, frequency: value } : r,
												);
												setReminders(updated);
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="daily">Hàng ngày</SelectItem>
												<SelectItem value="weekly">Hàng tuần</SelectItem>
												<SelectItem value="custom">Tùy chỉnh</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Độ ưu tiên</Label>
										<Select
											value={reminder.priority || 'medium'}
											onValueChange={(value: 'low' | 'medium' | 'high') => {
												const updated = reminders.map((r) =>
													r.id === reminder.id ? { ...r, priority: value } : r,
												);
												setReminders(updated);
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">Thấp</SelectItem>
												<SelectItem value="medium">Trung bình</SelectItem>
												<SelectItem value="high">Cao</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={reminder.enabled}
											onChange={(e) => {
												const updated = reminders.map((r) =>
													r.id === reminder.id
														? { ...r, enabled: e.target.checked }
														: r,
												);
												setReminders(updated);
											}}
											className="rounded"
										/>
										<Label>Kích hoạt nhắc nhở</Label>
									</div>
								</div>
							</Card>
						))}

						{reminders.length === 0 && (
							<div className="text-center py-8 text-gray-500 text-sm">
								<Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
								<p>Chưa có nhắc nhở nào. Nhấn "Thêm nhắc nhở" để tạo mới.</p>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 justify-end">
					<Button
						variant="outline"
						onClick={() => {
							setShowDialog(false);
							if (onUpdate && treatmentPlan) {
								// Reset to original values
								setMedications(treatmentPlan.medications);
								setInstructions(treatmentPlan.instructions || '');
								setFollowUpDate(treatmentPlan.followUpDate || '');
								setFollowUpInstructions(treatmentPlan.followUpInstructions || '');
								setNotes(treatmentPlan.notes || '');
							} else {
								// Reset to empty
								setMedications([]);
								setInstructions('');
								setFollowUpDate('');
								setFollowUpInstructions('');
								setNotes('');
							}
						}}
					>
						Hủy
					</Button>
					<Button onClick={handleSave}>Lưu phác đồ</Button>
				</div>
			</div>
		);

		return (
			<>
				{treatmentPlan ? (
					<>
						{treatmentPlanContent}
						{!readOnly && (
							<Button onClick={handleOpenDialog} variant="outline" className="w-full mt-4">
								Chỉnh sửa phác đồ
							</Button>
						)}
					</>
				) : (
					!readOnly && formContent
				)}
				{/* Dialog for editing when treatmentPlan exists */}
				{treatmentPlan && (
					<Dialog open={showDialog} onOpenChange={setShowDialog}>
						<DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Chỉnh sửa phác đồ điều trị</DialogTitle>
								<DialogDescription>
									Cập nhật thông tin thuốc và hướng dẫn điều trị cho bệnh nhân
								</DialogDescription>
							</DialogHeader>
							{formContent}
						</DialogContent>
					</Dialog>
				)}
			</>
		);
	}

	return (
		<>
			{treatmentPlan ? (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<Pill className="h-4 w-4" />
							Phác đồ điều trị
						</CardTitle>
						<CardDescription>
							Tạo bởi: {treatmentPlan.createdBy} -{' '}
							{new Date(treatmentPlan.createdAt).toLocaleDateString('vi-VN')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{treatmentPlanContent}
					</CardContent>
				</Card>
			) : (
				!readOnly && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Pill className="h-4 w-4" />
								Phác đồ điều trị
							</CardTitle>
							<CardDescription>
								Tạo phác đồ điều trị cho bệnh nhân
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button onClick={handleOpenDialog} className="w-full">
								<Plus className="h-4 w-4 mr-2" />
								Tạo phác đồ điều trị
							</Button>
						</CardContent>
					</Card>
				)
			)}

			{/* Dialog for creating/editing treatment plan */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Tạo phác đồ điều trị</DialogTitle>
						<DialogDescription>
							Nhập thông tin thuốc và hướng dẫn điều trị cho bệnh nhân
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						{/* Medications */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<Label>Thuốc điều trị</Label>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={addMedication}
								>
									<Plus className="h-4 w-4 mr-1" />
									Thêm thuốc
								</Button>
							</div>

							<div className="space-y-4">
								{medications.map((med, index) => (
									<Card key={med.id} className="p-4">
										<div className="flex justify-between items-start mb-3">
											<span className="font-medium text-sm">
												Thuốc {index + 1}
											</span>
											<Button
												type="button"
												size="sm"
												variant="ghost"
												onClick={() => removeMedication(med.id)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>Tên thuốc *</Label>
												<Select
													value={med.name}
													onValueChange={(value) =>
														updateMedication(med.id, { name: value })
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Chọn hoặc nhập tên thuốc" />
													</SelectTrigger>
													<SelectContent>
														{commonMedications.map((commonMed) => (
															<SelectItem key={commonMed.name} value={commonMed.name}>
																{commonMed.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{!commonMedications.find((m) => m.name === med.name) && (
													<Input
														placeholder="Nhập tên thuốc"
														value={med.name}
														onChange={(e) =>
															updateMedication(med.id, { name: e.target.value })
														}
													/>
												)}
											</div>

											<div className="space-y-2">
												<Label>Liều lượng *</Label>
												<Input
													placeholder="vd: 500mg, 1 viên"
													value={med.dosage}
													onChange={(e) =>
														updateMedication(med.id, { dosage: e.target.value })
													}
												/>
											</div>

											<div className="space-y-2">
												<Label>Tần suất *</Label>
												<Select
													value={med.frequency}
													onValueChange={(value) =>
														updateMedication(med.id, { frequency: value })
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Chọn tần suất" />
													</SelectTrigger>
													<SelectContent>
														{frequencyOptions.map((freq) => (
															<SelectItem key={freq} value={freq}>
																{freq}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<Label>Thời gian *</Label>
												<Select
													value={med.duration}
													onValueChange={(value) =>
														updateMedication(med.id, { duration: value })
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Chọn thời gian" />
													</SelectTrigger>
													<SelectContent>
														{durationOptions.map((dur) => (
															<SelectItem key={dur} value={dur}>
																{dur}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<Label>Số lượng</Label>
												<Input
													type="number"
													min="1"
													value={med.quantity}
													onChange={(e) =>
														updateMedication(med.id, {
															quantity: parseInt(e.target.value, 10) || 1,
														})
													}
												/>
											</div>

											<div className="space-y-2">
												<Label>Đơn vị</Label>
												<Select
													value={med.unit}
													onValueChange={(value) =>
														updateMedication(med.id, { unit: value })
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="viên">Viên</SelectItem>
														<SelectItem value="chai">Chai</SelectItem>
														<SelectItem value="tuýp">Tuýp</SelectItem>
														<SelectItem value="gói">Gói</SelectItem>
														<SelectItem value="lọ">Lọ</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="mt-4 space-y-2">
											<Label>Ghi chú thêm</Label>
											<Input
												placeholder="vd: Uống sau ăn, Không dùng với rượu"
												value={med.instructions || ''}
												onChange={(e) =>
													updateMedication(med.id, { instructions: e.target.value })
												}
											/>
										</div>
									</Card>
								))}
							</div>
						</div>

						{/* General Instructions */}
						<div className="space-y-2">
							<Label>Hướng dẫn điều trị chung</Label>
							<Textarea
								placeholder="Nhập hướng dẫn điều trị chung cho bệnh nhân..."
								value={instructions}
								onChange={(e) => setInstructions(e.target.value)}
								rows={3}
							/>
						</div>

						{/* Follow-up */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Ngày tái khám</Label>
								<DatePicker
									date={followUpDate}
									onStringChange={(date) => setFollowUpDate(date)}
									placeholder="Chọn ngày tái khám"
								/>
							</div>
							<div className="space-y-2">
								<Label>Hướng dẫn tái khám</Label>
								<Input
									placeholder="vd: Tái khám sau 7 ngày"
									value={followUpInstructions}
									onChange={(e) => setFollowUpInstructions(e.target.value)}
								/>
							</div>
						</div>

						{/* Notes */}
						<div className="space-y-2">
							<Label>Ghi chú</Label>
							<Textarea
								placeholder="Nhập ghi chú thêm về phác đồ điều trị..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={2}
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-3 justify-end">
							<Button variant="outline" onClick={() => setShowDialog(false)}>
								Hủy
							</Button>
							<Button onClick={handleSave}>Lưu phác đồ</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

