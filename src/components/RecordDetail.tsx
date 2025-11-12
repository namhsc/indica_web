import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
	MedicalRecord,
	TestOrder,
	TreatmentPlan,
	RecordStatus,
} from '../types';
import { User, Stethoscope, FileText, Calendar, Phone } from 'lucide-react';
import { TreatmentPlanManager } from './TreatmentPlanManager';

interface RecordDetailProps {
	record: MedicalRecord | null;
	testOrders: TestOrder[];
	treatmentPlans: TreatmentPlan[];
	onClose: () => void;
}

const statusLabels: Record<RecordStatus, string> = {
	PENDING_CHECKIN: 'Chưa check-in',
	PENDING_EXAMINATION: 'Chờ khám',
	IN_EXAMINATION: 'Đang khám',
	COMPLETED_EXAMINATION: 'Hoàn thành',
};

const statusColors: Record<RecordStatus, string> = {
	PENDING_CHECKIN: 'bg-yellow-100 text-yellow-800',
	PENDING_EXAMINATION: 'bg-yellow-100 text-yellow-800',
	IN_EXAMINATION: 'bg-blue-100 text-blue-800',
	COMPLETED_EXAMINATION: 'bg-green-100 text-green-800',
};

export function RecordDetail({
	record,
	testOrders,
	treatmentPlans,
	onClose,
}: RecordDetailProps) {
	if (!record) return null;

	const recordTestOrders = testOrders.filter((t) => t.recordId === record.id);
	const recordTreatmentPlan = treatmentPlans.find(
		(tp) => tp.recordId === record.id,
	);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<Dialog open={!!record} onOpenChange={onClose}>
			<DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[95vh] overflow-hidden p-0 gap-0">
				{/* Header */}
				<div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
					<div className="mb-3">
						<DialogTitle className="text-xl font-semibold text-gray-800">
							Chi tiết khách hàng
						</DialogTitle>
					</div>
					<div className="flex items-center gap-4 flex-wrap">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">Mã khách hàng:</span>
							<Badge
								variant="outline"
								className="font-mono text-sm px-2 py-0.5"
							>
								{record.receiveCode}
							</Badge>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">Trạng thái:</span>
							<Badge className={statusColors[record.status] + ' font-medium'}>
								{statusLabels[record.status]}
							</Badge>
						</div>
					</div>
				</div>

				<div className="overflow-y-auto max-h-[calc(95vh-100px)] px-6 py-4 space-y-4">
					{/* Patient Info */}
					<Card className="border shadow-sm">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base font-semibold">
								<div className="p-1.5 bg-blue-100 rounded-md">
									<User className="h-4 w-4 text-blue-600" />
								</div>
								Thông tin Khách hàng
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-1">
									<div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
										Họ và tên
									</div>
									<div className="text-sm font-medium text-gray-900">
										{record.patient.fullName}
									</div>
								</div>
								<div className="space-y-1">
									<div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
										<Phone className="h-3 w-3" />
										Số điện thoại
									</div>
									<div className="text-sm font-medium text-gray-900">
										{record.patient.phoneNumber}
									</div>
								</div>
								<div className="space-y-1">
									<div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
										Ngày sinh
									</div>
									<div className="text-sm font-medium text-gray-900">
										{new Date(record.patient.dateOfBirth).toLocaleDateString(
											'vi-VN',
										)}
									</div>
								</div>
								<div className="space-y-1">
									<div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
										Giới tính
									</div>
									<div className="text-sm font-medium text-gray-900">
										{record.patient.gender === 'male'
											? 'Nam'
											: record.patient.gender === 'female'
											? 'Nữ'
											: 'Khác'}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Medical Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Stethoscope className="h-4 w-4" />
								Thông tin khám bệnh
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{record.status !== 'PENDING_CHECKIN' && (
								<div>
									<div className="text-sm text-gray-600">Bác sĩ phụ trách</div>
									<div>
										{record.assignedDoctor ? (
											<>
												{record.assignedDoctor.name} -{' '}
												{record.assignedDoctor.specialty}
											</>
										) : (
											<span className="text-gray-400">Chưa gán</span>
										)}
									</div>
								</div>
							)}
							<div>
								<div className="text-sm text-gray-600">Lý do khám</div>
								<div>{record.reason || 'Không có'}</div>
							</div>
							{record.diagnosis && record.status !== 'IN_EXAMINATION' && (
								<div>
									<div className="text-sm text-gray-600">Chẩn đoán</div>
									<div className="mt-1 p-3 bg-gray-50 rounded-lg">
										{record.diagnosis}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Treatment Plan */}
					{recordTreatmentPlan && (
						<TreatmentPlanManager
							recordId={record.id}
							doctorName={record.assignedDoctor?.name || 'Bác sĩ'}
							treatmentPlan={recordTreatmentPlan}
							onSave={() => {}}
							readOnly={true}
						/>
					)}

					{/* Test Orders */}
					{recordTestOrders.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<FileText className="h-4 w-4" />
									Xét nghiệm / Hình ảnh ({recordTestOrders.length})
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{recordTestOrders.map((test) => (
										<div key={test.id} className="p-3 border rounded-lg">
											<div className="flex justify-between items-start">
												<div>
													<div>{test.testName}</div>
													<div className="text-sm text-gray-600">
														Chỉ định bởi: {test.orderedBy}
													</div>
													{test.results && (
														<div className="mt-2 space-y-1">
															{test.results.values &&
																Object.entries(test.results.values).map(
																	([key, value]) => (
																		<div key={key} className="text-sm">
																			<span className="text-gray-600">
																				{key}:
																			</span>{' '}
																			{value}
																		</div>
																	),
																)}
															{test.results.notes && (
																<div className="text-sm text-gray-600">
																	Ghi chú: {test.results.notes}
																</div>
															)}
														</div>
													)}
												</div>
												<Badge
													className={
														test.status === 'completed' ||
														test.status === 'reviewed'
															? 'bg-green-100 text-green-800'
															: 'bg-yellow-100 text-yellow-800'
													}
												>
													{test.status === 'pending' && 'Chờ thực hiện'}
													{test.status === 'in_progress' && 'Đang thực hiện'}
													{test.status === 'completed' && 'Hoàn thành'}
													{test.status === 'reviewed' && 'Đã duyệt'}
												</Badge>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Timeline */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Calendar className="h-4 w-4" />
								Thời gian
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div>
								<div className="text-sm text-gray-600">Cập nhật</div>
								<div className="text-sm">{formatDate(record.updatedAt)}</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
}
