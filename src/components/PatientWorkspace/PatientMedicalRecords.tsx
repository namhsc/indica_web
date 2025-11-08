import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';
import { MedicalRecord } from '../../types';
import { FileText, Calendar, User, Stethoscope, Eye } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../PaginationControls';

interface PatientMedicalRecordsProps {
	records: MedicalRecord[];
}

const statusLabels = {
	PENDING_CHECKIN: 'Chờ check-in',
	PENDING_EXAMINATION: 'Chờ khám',
	IN_EXAMINATION: 'Đang khám',
	WAITING_TESTS: 'Chờ xét nghiệm',
	WAITING_DOCTOR_REVIEW: 'Chờ bác sĩ xem xét',
	COMPLETED_EXAMINATION: 'Hoàn thành khám',
	RETURNED: 'Đã trả',
};

const statusColors = {
	PENDING_CHECKIN: 'bg-yellow-100 text-yellow-800',
	PENDING_EXAMINATION: 'bg-blue-100 text-blue-800',
	IN_EXAMINATION: 'bg-purple-100 text-purple-800',
	WAITING_TESTS: 'bg-orange-100 text-orange-800',
	WAITING_DOCTOR_REVIEW: 'bg-indigo-100 text-indigo-800',
	COMPLETED_EXAMINATION: 'bg-green-100 text-green-800',
	RETURNED: 'bg-gray-100 text-gray-800',
};

export function PatientMedicalRecords({ records }: PatientMedicalRecordsProps) {
	const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
	const [showDetailDialog, setShowDetailDialog] = useState(false);

	const [itemsPerPage, setItemsPerPage] = useState(10);
	const {
		currentPage,
		totalPages,
		paginatedData: paginatedRecords,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination({
		data: records.sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		}),
		itemsPerPage,
	});

	const handleViewRecord = (record: MedicalRecord) => {
		setSelectedRecord(record);
		setShowDetailDialog(true);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('vi-VN');
	};

	if (records.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-12 text-gray-500">
						<FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
						<p>Bạn chưa có hồ sơ y tế nào</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-xl font-semibold">Hồ sơ y tế của tôi</h3>
				<p className="text-sm text-gray-600">Xem lịch sử khám bệnh và hồ sơ y tế</p>
			</div>

			<div className="space-y-4">
				{paginatedRecords.map((record) => (
					<Card
						key={record.id}
						className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-md transition-shadow"
						onClick={() => handleViewRecord(record)}
					>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<CardTitle className="flex items-center gap-2">
										<FileText className="h-5 w-5 text-green-600" />
										{record.receiveCode}
									</CardTitle>
									<CardDescription className="mt-2">
										<div className="flex items-center gap-4 flex-wrap">
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-gray-400" />
												<span className="text-sm">
													{formatDate(record.createdAt)}
												</span>
											</div>
											{record.assignedDoctor && (
												<div className="flex items-center gap-2">
													<Stethoscope className="h-4 w-4 text-gray-400" />
													<span className="text-sm">
														{record.assignedDoctor.name}
													</span>
												</div>
											)}
										</div>
									</CardDescription>
								</div>
								<Badge className={statusColors[record.status]}>
									{statusLabels[record.status]}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div>
									<span className="text-sm font-medium text-gray-600">Lý do khám:</span>
									<p className="text-sm mt-1">{record.reason || 'Không có'}</p>
								</div>
								<div>
									<span className="text-sm font-medium text-gray-600">Dịch vụ:</span>
									<div className="flex flex-wrap gap-2 mt-1">
										{record.requestedServices.map((service, index) => (
											<Badge key={index} variant="outline" className="text-xs">
												{service}
											</Badge>
										))}
									</div>
								</div>
								{record.diagnosis && (
									<div>
										<span className="text-sm font-medium text-gray-600">Chẩn đoán:</span>
										<p className="text-sm mt-1">{record.diagnosis}</p>
									</div>
								)}
								<div className="pt-2">
									<Badge variant="outline" className="flex items-center gap-1 w-fit">
										<Eye className="h-3 w-3" />
										Nhấn để xem chi tiết
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
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

			{/* Record Detail Dialog */}
			<Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Chi tiết hồ sơ y tế - {selectedRecord?.receiveCode}
						</DialogTitle>
					</DialogHeader>
					{selectedRecord && (
						<div className="space-y-6">
							{/* Patient Info */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<User className="h-4 w-4" />
										Thông tin bệnh nhân
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<span className="text-sm text-gray-600">Họ và tên:</span>
											<p className="font-medium">{selectedRecord.patient.fullName}</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">Số điện thoại:</span>
											<p>{selectedRecord.patient.phoneNumber}</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">Ngày sinh:</span>
											<p>
												{new Date(selectedRecord.patient.dateOfBirth).toLocaleDateString(
													'vi-VN'
												)}
											</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">Giới tính:</span>
											<p>
												{selectedRecord.patient.gender === 'male'
													? 'Nam'
													: selectedRecord.patient.gender === 'female'
													? 'Nữ'
													: 'Khác'}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Visit Info */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Thông tin khám bệnh
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div>
											<span className="text-sm text-gray-600">Ngày khám:</span>
											<p>{formatDate(selectedRecord.createdAt)}</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">Lý do khám:</span>
											<p>{selectedRecord.reason || 'Không có'}</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">Dịch vụ:</span>
											<div className="flex flex-wrap gap-2 mt-1">
												{selectedRecord.requestedServices.map((service, index) => (
													<Badge key={index} variant="outline">
														{service}
													</Badge>
												))}
											</div>
										</div>
										{selectedRecord.assignedDoctor && (
											<div>
												<span className="text-sm text-gray-600">Bác sĩ:</span>
												<p>
													{selectedRecord.assignedDoctor.name} -{' '}
													{selectedRecord.assignedDoctor.specialty}
												</p>
											</div>
										)}
										<div>
											<span className="text-sm text-gray-600">Trạng thái:</span>
											<Badge className={statusColors[selectedRecord.status]}>
												{statusLabels[selectedRecord.status]}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Diagnosis */}
							{selectedRecord.diagnosis && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base flex items-center gap-2">
											<Stethoscope className="h-4 w-4" />
											Chẩn đoán
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p>{selectedRecord.diagnosis}</p>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

