import React, { useState } from 'react';
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
import { Badge } from './ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from './ui/dialog';
import { Staff, UserRole, Gender, Specialty } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	CheckCircle2,
	XCircle,
	Users,
	Download,
	Upload,
	Filter,
	ChevronsUpDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { motion } from 'motion/react';
import { DatePicker } from './ui/date-picker';
import { Checkbox } from './ui/checkbox';
import administrativeData from '../administrative.json';

interface AdministrativeProvince {
	ID: string;
	NAME: string;
	WARDS?: Array<{
		ID: string;
		TEN: string;
		SORT_ORDER: string;
	}>;
}

interface StaffManagementProps {
	staff: Staff[];
	specialties: Specialty[];
	onCreate: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onUpdate: (id: string, staff: Partial<Staff>) => void;
	onDelete: (id: string) => void;
}

const roleLabels: Record<UserRole, string> = {
	super_admin: 'Super Admin',
	admin: 'Quản trị viên',
	doctor: 'Bác sĩ',
	nurse: 'Điều dưỡng',
	receptionist: 'Lễ tân',
	patient: 'Khách hàng',
};

const roleColors: Record<UserRole, string> = {
	super_admin: 'bg-red-100 text-red-800',
	admin: 'bg-purple-100 text-purple-800',
	doctor: 'bg-blue-100 text-blue-800',
	nurse: 'bg-green-100 text-green-800',
	receptionist: 'bg-orange-100 text-orange-800',
	patient: 'bg-gray-100 text-gray-800',
};

const genderLabels: Record<Gender, string> = {
	male: 'Nam',
	female: 'Nữ',
};

// Load administrative data once
const provinces = (administrativeData as AdministrativeProvince[]).filter(
	(p) => p.ID !== '-1',
);

export function StaffManagement({
	staff,
	specialties = [],
	onCreate,
	onUpdate,
	onDelete,
}: StaffManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [showDialog, setShowDialog] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [provinceOpen, setProvinceOpen] = useState(false);
	const [wardOpen, setWardOpen] = useState(false);
	const [specialtyOpen, setSpecialtyOpen] = useState(false);
	const [provinceSearch, setProvinceSearch] = useState('');
	const [wardSearch, setWardSearch] = useState('');
	const [specialtySearch, setSpecialtySearch] = useState('');

	const [formData, setFormData] = useState({
		fullName: '',
		code: '',
		email: '',
		phoneNumber: '',
		dateOfBirth: '',
		gender: '' as Gender,
		role: '' as UserRole,
		specialty: '',
		address: '',
		province: '',
		provinceId: '',
		district: '',
		districtId: '',
		detailedAddress: '',
		isActive: true,
	});

	const selectedProvince = provinces.find(
		(p) => p.ID === formData.provinceId || p.NAME === formData.province,
	);

	const wards = selectedProvince?.WARDS?.filter((w) => w.ID !== '-1') || [];

	// Filter provinces based on search
	const filteredProvinces = provinces.filter((province) =>
		province.NAME.toLowerCase().includes(provinceSearch.toLowerCase()),
	);

	// Filter wards based on search
	const filteredWards = wards.filter((ward) =>
		ward.TEN.toLowerCase().includes(wardSearch.toLowerCase()),
	);

	// Filter specialties based on search
	const activeSpecialties = specialties.filter((s) => s.isActive);
	const filteredSpecialties = activeSpecialties.filter((specialty) =>
		specialty.name.toLowerCase().includes(specialtySearch.toLowerCase()),
	);

	const filteredStaff = staff.filter((s) => {
		const matchesSearch =
			s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.phoneNumber.includes(searchTerm);

		const matchesRole = roleFilter === 'all' || s.role === roleFilter;

		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && s.isActive) ||
			(statusFilter === 'inactive' && !s.isActive);

		return matchesSearch && matchesRole && matchesStatus;
	});

	const {
		itemsPerPage,
		currentPage,
		totalPages,
		paginatedData,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination({
		data: filteredStaff,
		itemsPerPage: 10,
	});

	const handleOpenDialog = (staffMember?: Staff) => {
		if (staffMember) {
			setEditingStaff(staffMember);
			// Tìm province và district ID từ tên
			const provinceMatch = provinces.find(
				(p) => p.NAME === staffMember.province,
			);
			const districtMatch = provinceMatch?.WARDS?.find(
				(w) => w.TEN === staffMember.district,
			);

			setFormData({
				fullName: staffMember.fullName,
				code: staffMember.code || '',
				email: staffMember.email || '',
				phoneNumber: staffMember.phoneNumber,
				dateOfBirth: staffMember.dateOfBirth || '',
				gender: staffMember.gender || '',
				role: staffMember.role || '',
				specialty: staffMember.specialty || '',
				address: staffMember.address || '',
				province: staffMember.province || '',
				provinceId: provinceMatch?.ID || '',
				district: staffMember.district || '',
				districtId: districtMatch?.ID || '',
				detailedAddress: staffMember.detailedAddress || '',
				isActive: staffMember.isActive,
			});
		} else {
			setEditingStaff(null);
			setFormData({
				fullName: '',
				code: '',
				email: '',
				phoneNumber: '',
				dateOfBirth: '',
				gender: '',
				role: '',
				specialty: '',
				address: '',
				province: '',
				provinceId: '',
				district: '',
				districtId: '',
				detailedAddress: '',
				isActive: true,
			});
		}
		setProvinceSearch('');
		setWardSearch('');
		setSpecialtySearch('');
		setProvinceOpen(false);
		setWardOpen(false);
		setSpecialtyOpen(false);
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingStaff(null);
	};

	const handleSubmit = () => {
		if (!formData.fullName || !formData.phoneNumber) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		if (!formData.gender) {
			toast.error('Vui lòng chọn giới tính');
			return;
		}

		if (!formData.role) {
			toast.error('Vui lòng chọn vai trò');
			return;
		}

		const selectedProvinceName = provinces.find(
			(p) => p.ID === formData.provinceId,
		)?.NAME;
		const selectedDistrictName = wards.find(
			(w) => w.ID === formData.districtId,
		)?.TEN;

		const staffData = {
			fullName: formData.fullName,
			code: formData.code || undefined,
			email: formData.email || undefined,
			phoneNumber: formData.phoneNumber,
			dateOfBirth: formData.dateOfBirth || undefined,
			gender: formData.gender,
			role: formData.role,
			specialty: formData.specialty?.trim() || undefined,
			address: formData.address || undefined,
			province: selectedProvinceName || undefined,
			district: selectedDistrictName || undefined,
			detailedAddress: formData.detailedAddress?.trim() || undefined,
			isActive: formData.isActive,
		};

		if (editingStaff) {
			onUpdate(editingStaff.id, staffData);
			toast.success('Cập nhật nhân viên thành công');
		} else {
			onCreate(staffData);
			toast.success('Tạo nhân viên thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
			onDelete(id);
			toast.success('Xóa nhân viên thành công');
		}
	};

	const handleToggleSelect = (id: string) => {
		const newSelected = new Set(selectedItems);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedItems(newSelected);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedItems(new Set(paginatedData.map((item) => item.id)));
		} else {
			setSelectedItems(new Set());
		}
	};

	const handleDeleteSelected = () => {
		if (selectedItems.size === 0) {
			toast.error('Vui lòng chọn ít nhất một mục để xóa');
			return;
		}

		if (
			confirm(
				`Bạn có chắc chắn muốn xóa ${selectedItems.size} nhân viên đã chọn?`,
			)
		) {
			selectedItems.forEach((id) => {
				onDelete(id);
			});
			setSelectedItems(new Set());
			toast.success(`Đã xóa ${selectedItems.size} nhân viên thành công`);
		}
	};

	const isAllSelected =
		paginatedData.length > 0 &&
		paginatedData.every((item) => selectedItems.has(item.id));
	const isIndeterminate =
		selectedItems.size > 0 && selectedItems.size < paginatedData.length;

	// Export to Excel
	const handleExport = () => {
		try {
			// Chuẩn bị dữ liệu để export
			const exportData = filteredStaff.map((s) => ({
				'Mã nhân viên': s.code || '',
				'Họ tên': s.fullName,
				'Vai trò': roleLabels[s.role],
				'Chuyên khoa': s.specialty || '',
				'Điện thoại': s.phoneNumber,
				Email: s.email || '',
				'Ngày sinh': s.dateOfBirth || '',
				'Giới tính': genderLabels[s.gender],
				'Tỉnh/Thành phố': s.province || '',
				'Xã/Phường/Quận/Huyện': s.district || '',
				'Địa chỉ chi tiết': s.detailedAddress || '',
				'Địa chỉ': s.address || '',
				'Trạng thái': s.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
			}));

			// Tạo workbook và worksheet
			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Nhân viên');

			// Đặt độ rộng cột
			const colWidths = [
				{ wch: 15 }, // Mã nhân viên
				{ wch: 25 }, // Họ tên
				{ wch: 15 }, // Vai trò
				{ wch: 20 }, // Chuyên khoa
				{ wch: 15 }, // Điện thoại
				{ wch: 25 }, // Email
				{ wch: 12 }, // Ngày sinh
				{ wch: 10 }, // Giới tính
				{ wch: 20 }, // Tỉnh/Thành phố
				{ wch: 25 }, // Xã/Phường/Quận/Huyện
				{ wch: 30 }, // Địa chỉ chi tiết
				{ wch: 30 }, // Địa chỉ
				{ wch: 15 }, // Trạng thái
			];
			ws['!cols'] = colWidths;

			// Xuất file
			const fileName = `Danh_sach_nhan_vien_${
				new Date().toISOString().split('T')[0]
			}.xlsx`;
			XLSX.writeFile(wb, fileName);
			toast.success(`Đã xuất ${exportData.length} nhân viên ra file Excel`);
		} catch (error) {
			console.error('Lỗi khi xuất file Excel:', error);
			toast.error('Có lỗi xảy ra khi xuất file Excel');
		}
	};

	// Import from Excel
	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Kiểm tra định dạng file
		const validExtensions = [
			'.xlsx',
			'.xls',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
		];
		const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
		const isValidFile =
			validExtensions.includes(fileExtension) ||
			validExtensions.includes(file.type);

		if (!isValidFile) {
			toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];
				const jsonData = XLSX.utils.sheet_to_json(worksheet, {
					header: 1,
					defval: '',
				}) as any[][];

				if (jsonData.length < 2) {
					toast.error('File Excel không có dữ liệu hoặc thiếu header');
					return;
				}

				// Lấy header (dòng đầu tiên)
				const headers = jsonData[0].map((h: any) =>
					String(h).toLowerCase().trim(),
				);

				// Mapping header tiếng Việt sang field name
				const headerMap: Record<string, keyof Staff> = {
					'mã nhân viên': 'code',
					'họ tên': 'fullName',
					'vai trò': 'role',
					'chuyên khoa': 'specialty',
					'điện thoại': 'phoneNumber',
					email: 'email',
					'ngày sinh': 'dateOfBirth',
					'giới tính': 'gender',
					'tỉnh/thành phố': 'province',
					tỉnh: 'province',
					'thành phố': 'province',
					'xã/phường/quận/huyện': 'district',
					xã: 'district',
					phường: 'district',
					quận: 'district',
					huyện: 'district',
					'địa chỉ chi tiết': 'detailedAddress',
					'địa chỉ': 'address',
					'trạng thái': 'isActive',
				};

				// Tìm index của các cột cần thiết
				const fieldIndexes: Record<string, number> = {};
				headers.forEach((header, index) => {
					const field = headerMap[header];
					if (field) {
						fieldIndexes[field] = index;
					}
				});

				// Kiểm tra các trường bắt buộc
				if (!fieldIndexes['fullName'] || !fieldIndexes['phoneNumber']) {
					toast.error(
						'File Excel thiếu các cột bắt buộc: Họ tên và Điện thoại',
					);
					return;
				}

				// Xử lý dữ liệu từ dòng 2 trở đi
				let successCount = 0;
				let errorCount = 0;
				const errors: string[] = [];

				for (let i = 1; i < jsonData.length; i++) {
					const row = jsonData[i];
					if (!row || row.every((cell) => !cell)) continue; // Bỏ qua dòng trống

					try {
						// Lấy giá trị từ các cột
						const fullName =
							row[fieldIndexes['fullName']]?.toString().trim() || '';
						const phoneNumber =
							row[fieldIndexes['phoneNumber']]?.toString().trim() || '';

						if (!fullName || !phoneNumber) {
							errorCount++;
							errors.push(`Dòng ${i + 1}: Thiếu Họ tên hoặc Điện thoại`);
							continue;
						}

						// Xử lý vai trò
						const roleText = row[fieldIndexes['role']]?.toString().trim() || '';
						let role: UserRole = 'receptionist';
						if (roleText) {
							const roleLower = roleText.toLowerCase();
							if (
								roleLower.includes('quản trị') ||
								roleLower.includes('admin')
							) {
								role = 'admin';
							} else if (
								roleLower.includes('bác sĩ') ||
								roleLower.includes('doctor')
							) {
								role = 'doctor';
							} else if (
								roleLower.includes('điều dưỡng') ||
								roleLower.includes('nurse')
							) {
								role = 'nurse';
							} else if (
								roleLower.includes('lễ tân') ||
								roleLower.includes('receptionist')
							) {
								role = 'receptionist';
							}
						}

						// Xử lý giới tính
						const genderText =
							row[fieldIndexes['gender']]?.toString().trim() || '';
						let gender: Gender = 'male';
						if (genderText) {
							const genderLower = genderText.toLowerCase();
							if (
								genderLower.includes('nữ') ||
								genderLower.includes('female')
							) {
								gender = 'female';
							}
						}

						// Xử lý trạng thái
						const statusText =
							row[fieldIndexes['isActive']]?.toString().trim() || '';
						let isActive = true;
						if (statusText) {
							const statusLower = statusText.toLowerCase();
							isActive =
								statusLower.includes('hoạt động') ||
								statusLower.includes('active') ||
								statusLower === '1' ||
								statusLower === 'true';
						}

						// Xử lý ngày sinh
						let dateOfBirth = '';
						const dobValue = row[fieldIndexes['dateOfBirth']];
						if (dobValue) {
							if (typeof dobValue === 'number') {
								// Excel date serial number
								try {
									const excelDate = XLSX.SSF.parse_date_code(dobValue);
									if (excelDate) {
										dateOfBirth = `${excelDate.y}-${String(
											excelDate.m,
										).padStart(2, '0')}-${String(excelDate.d).padStart(
											2,
											'0',
										)}`;
									}
								} catch {
									// Nếu không parse được, giữ nguyên giá trị
									dateOfBirth = dobValue.toString().trim();
								}
							} else {
								dateOfBirth = dobValue.toString().trim();
							}
						}

						const staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> = {
							fullName,
							phoneNumber,
							code: row[fieldIndexes['code']]?.toString().trim() || undefined,
							email: row[fieldIndexes['email']]?.toString().trim() || undefined,
							dateOfBirth: dateOfBirth || undefined,
							gender,
							role,
							specialty:
								row[fieldIndexes['specialty']]?.toString().trim() || undefined,
							province:
								row[fieldIndexes['province']]?.toString().trim() || undefined,
							district:
								row[fieldIndexes['district']]?.toString().trim() || undefined,
							detailedAddress:
								row[fieldIndexes['detailedAddress']]?.toString().trim() ||
								undefined,
							address:
								row[fieldIndexes['address']]?.toString().trim() || undefined,
							isActive,
						};

						onCreate(staffData);
						successCount++;
					} catch (error) {
						errorCount++;
						errors.push(
							`Dòng ${i + 1}: ${
								error instanceof Error ? error.message : 'Lỗi không xác định'
							}`,
						);
					}
				}

				// Reset input file
				event.target.value = '';

				if (successCount > 0) {
					toast.success(
						`Đã import thành công ${successCount} nhân viên${
							errorCount > 0 ? `, ${errorCount} lỗi` : ''
						}`,
					);
				}

				if (errorCount > 0 && errors.length > 0) {
					console.error('Các lỗi khi import:', errors);
					if (errors.length <= 10) {
						toast.error(`Lỗi: ${errors.join('; ')}`);
					} else {
						toast.error(
							`Có ${errors.length} lỗi. Vui lòng kiểm tra console để xem chi tiết.`,
						);
					}
				}
			} catch (error) {
				console.error('Lỗi khi đọc file Excel:', error);
				toast.error('Có lỗi xảy ra khi đọc file Excel');
				event.target.value = '';
			}
		};

		reader.readAsArrayBuffer(file);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Quản lý Nhân viên
						</div>
						<p className="text-gray-600 mt-1">
							Quản lý danh sách nhân viên phòng khám
						</p>
					</h2>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
						<span className="text-sm text-gray-600 font-medium">Tổng:</span>
						<span className="text-sm ml-1 font-medium">{totalItems}</span>
					</div>
					{selectedItems.size > 0 && (
						<Button
							onClick={handleDeleteSelected}
							variant="destructive"
							className="bg-delete-btn hover:bg-red-700 text-white border-red-600"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Xóa ({selectedItems.size})
						</Button>
					)}
					<motion.div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={handleExport}
							className="border-gray-200 hover:bg-gray-50"
						>
							<Download className="h-4 w-4 mr-2" />
							Xuất Excel
						</Button>
						<label>
							<input
								type="file"
								accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
								onChange={handleImport}
								className="hidden"
							/>
							<Button
								variant="outline"
								asChild
								className="border-gray-200 hover:bg-gray-50 cursor-pointer"
							>
								<span>
									<Upload className="h-4 w-4 mr-2" />
									Nhập Excel
								</span>
							</Button>
						</label>
						<Button
							onClick={() => handleOpenDialog()}
							className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
						>
							<Plus className="h-4 w-4 mr-2" />
							Thêm nhân viên
						</Button>
					</motion.div>
				</div>
			</div>

			<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm theo tên, mã, email, số điện thoại..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div className="w-full md:w-64 relative">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
							<Select value={roleFilter} onValueChange={setRoleFilter}>
								<SelectTrigger className="pl-10 border-gray-200">
									<SelectValue placeholder="Vai trò" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả vai trò</SelectItem>
									<SelectItem value="admin">Quản trị viên</SelectItem>
									<SelectItem value="doctor">Bác sĩ</SelectItem>
									<SelectItem value="nurse">Điều dưỡng</SelectItem>
									<SelectItem value="receptionist">Lễ tân</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="w-full md:w-64 relative">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="pl-10 border-gray-200">
									<SelectValue placeholder="Lọc theo trạng thái" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả trạng thái</SelectItem>
									<SelectItem value="active">Đang hoạt động</SelectItem>
									<SelectItem value="inactive">Ngừng hoạt động</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Table */}
					<div className="rounded-xl border border-gray-200 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-50/80 hover:bg-gray-50">
									<TableHead className="w-12">
										<Checkbox
											checked={isAllSelected}
											onCheckedChange={handleSelectAll}
											ref={(el) => {
												if (el) {
													el.indeterminate = isIndeterminate;
												}
											}}
										/>
									</TableHead>
									<TableHead className="w-16 text-center">STT</TableHead>
									<TableHead>Mã</TableHead>
									<TableHead>Họ tên</TableHead>
									<TableHead>Vai trò</TableHead>
									<TableHead>Chuyên khoa</TableHead>
									<TableHead>Điện thoại</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell colSpan={10} className="text-center py-12">
											<div className="flex flex-col items-center gap-3 text-gray-500">
												<Users className="h-12 w-12 text-gray-300" />
												<p>Không tìm thấy nhân viên nào</p>
												<Button
													onClick={() => handleOpenDialog()}
													variant="outline"
													className="mt-2"
												>
													<Plus className="h-4 w-4 mr-2" />
													Thêm nhân viên mới
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((staffMember, index) => (
										<motion.tr
											key={staffMember.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											className="hover:bg-gray-50/80 transition-colors border-b border-gray-200"
										>
											<TableCell>
												<Checkbox
													checked={selectedItems.has(staffMember.id)}
													onCheckedChange={() =>
														handleToggleSelect(staffMember.id)
													}
												/>
											</TableCell>
											<TableCell className="text-center text-gray-500">
												{startIndex + index}
											</TableCell>
											<TableCell>
												{staffMember.code ? (
													<span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
														{staffMember.code}
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell className="font-medium">
												{staffMember.fullName}
											</TableCell>
											<TableCell>
												<Badge className={roleColors[staffMember.role]}>
													{roleLabels[staffMember.role]}
												</Badge>
											</TableCell>
											<TableCell className="text-gray-600">
												{staffMember.specialty || '-'}
											</TableCell>
											<TableCell className="text-gray-600">
												{staffMember.phoneNumber}
											</TableCell>
											<TableCell className="text-gray-600">
												{staffMember.email || '-'}
											</TableCell>
											<TableCell>
												{staffMember.isActive ? (
													<Badge className="bg-green-100 text-green-800 border-0">
														<CheckCircle2 className="h-3 w-3 mr-1" />
														Hoạt động
													</Badge>
												) : (
													<Badge className="bg-red-100 text-red-800 border-0">
														<XCircle className="h-3 w-3 mr-1" />
														Ngừng hoạt động
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleOpenDialog(staffMember)}
														className="hover:bg-blue-50 hover:text-blue-600"
													>
														<Edit className="h-4 w-4 mr-1" />
														Sửa
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(staffMember.id)}
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
													>
														<Trash2 className="h-4 w-4 mr-1" />
														Xóa
													</Button>
												</div>
											</TableCell>
										</motion.tr>
									))
								)}
							</TableBody>
						</Table>
					</div>

					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						itemsPerPage={itemsPerPage}
						startIndex={startIndex}
						endIndex={endIndex}
						onPageChange={goToPage}
					/>
				</CardContent>
			</Card>

			{/* Dialog */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-none">
					<div className="overflow-y-auto max-h-[95vh]">
						<div className="p-6">
							<DialogHeader>
								<DialogTitle>
									{editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
								</DialogTitle>
								<DialogDescription>
									{editingStaff
										? 'Cập nhật thông tin nhân viên'
										: 'Điền thông tin để tạo nhân viên mới'}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 mt-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="fullName">
											Họ tên <span className="text-red-500">*</span>
										</Label>
										<Input
											id="fullName"
											value={formData.fullName}
											onChange={(e) =>
												setFormData({ ...formData, fullName: e.target.value })
											}
											placeholder="Nhập họ tên"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="code">Mã nhân viên</Label>
										<Input
											id="code"
											value={formData.code}
											onChange={(e) =>
												setFormData({ ...formData, code: e.target.value })
											}
											placeholder="Nhập mã nhân viên"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="phoneNumber">
											Điện thoại <span className="text-red-500">*</span>
										</Label>
										<Input
											id="phoneNumber"
											value={formData.phoneNumber}
											onChange={(e) =>
												setFormData({
													...formData,
													phoneNumber: e.target.value,
												})
											}
											placeholder="Nhập số điện thoại"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
											placeholder="Nhập email"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="dateOfBirth">Ngày sinh</Label>
										<DatePicker
											date={formData.dateOfBirth}
											onStringChange={(date) =>
												setFormData({
													...formData,
													dateOfBirth: date,
												})
											}
											placeholder="dd/mm/yyyy"
											minDate={new Date('1900-01-01')}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="gender">Giới tính</Label>
										<Select
											value={formData.gender || undefined}
											onValueChange={(value) =>
												setFormData({ ...formData, gender: value as Gender })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Chọn giới tính" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Nam</SelectItem>
												<SelectItem value="female">Nữ</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="province">Tỉnh/Thành phố</Label>
										<Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													aria-expanded={provinceOpen}
													className="w-full justify-between border-gray-300 focus:border-blue-500"
												>
													{formData.provinceId && selectedProvince
														? selectedProvince.NAME
														: 'Chọn tỉnh/thành phố...'}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className="w-[400px] p-0 !h-[80px] !max-h-[80px]"
												style={{
													height: '280px',
													maxHeight: '280px',
													overflow: 'hidden',
												}}
												align="start"
											>
												<Command className="h-full flex flex-col overflow-hidden">
													<CommandInput
														placeholder="Tìm kiếm tỉnh/thành phố..."
														value={provinceSearch}
														onValueChange={setProvinceSearch}
													/>
													<CommandList
														className="!max-h-[50px] flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
														style={{
															scrollbarWidth: 'thin',
															scrollbarColor: '#cbd5e1 #f1f5f9',
															maxHeight: '50px !important',
															height: '50px',
															overflowY: 'auto',
														}}
													>
														<CommandEmpty>
															Không tìm thấy tỉnh/thành phố.
														</CommandEmpty>
														<CommandGroup>
															{filteredProvinces.map((province) => (
																<CommandItem
																	key={province.ID}
																	value={province.NAME}
																	className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
																	onSelect={() => {
																		setFormData({
																			...formData,
																			provinceId: province.ID,
																			province: province.NAME,
																			districtId: '',
																			district: '',
																		});
																		setProvinceOpen(false);
																		setProvinceSearch('');
																	}}
																>
																	{province.NAME}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</div>
									<div className="space-y-2">
										<Label htmlFor="district">Xã/Phường</Label>
										<Popover open={wardOpen} onOpenChange={setWardOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													aria-expanded={wardOpen}
													disabled={!formData.provinceId}
													className="w-full justify-between border-gray-300 focus:border-blue-500 disabled:opacity-50"
												>
													{formData.districtId && selectedProvince
														? selectedProvince.WARDS?.find(
																(w) => w.ID === formData.districtId,
														  )?.TEN || 'Chọn xã/phường...'
														: 'Chọn xã/phường...'}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className="w-[400px] p-0 !h-[80px] !max-h-[80px]"
												style={{
													height: '280px',
													maxHeight: '280px',
													overflow: 'hidden',
												}}
												align="start"
											>
												<Command className="h-full flex flex-col overflow-hidden">
													<CommandInput
														placeholder="Tìm kiếm xã/phường..."
														value={wardSearch}
														onValueChange={setWardSearch}
													/>
													<CommandList
														className="!max-h-[50px] flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
														style={{
															scrollbarWidth: 'thin',
															scrollbarColor: '#cbd5e1 #f1f5f9',
															maxHeight: '50px !important',
															height: '50px',
															overflowY: 'auto',
														}}
													>
														<CommandEmpty>
															Không tìm thấy xã/phường.
														</CommandEmpty>
														<CommandGroup>
															{filteredWards.map((ward) => (
																<CommandItem
																	key={ward.ID}
																	value={ward.TEN}
																	className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
																	onSelect={() => {
																		setFormData({
																			...formData,
																			districtId: ward.ID,
																			district: ward.TEN,
																		});
																		setWardOpen(false);
																		setWardSearch('');
																	}}
																>
																	{ward.TEN}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="detailedAddress">Địa chỉ chi tiết</Label>
									<Textarea
										id="detailedAddress"
										value={formData.detailedAddress}
										onChange={(e) =>
											setFormData({
												...formData,
												detailedAddress: e.target.value,
											})
										}
										placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, v.v.)"
										rows={2}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="role">
										Vai trò <span className="text-red-500">*</span>
									</Label>
									<Select
										value={formData.role || undefined}
										onValueChange={(value) =>
											setFormData({ ...formData, role: value as UserRole })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn vai trò" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">Quản trị viên</SelectItem>
											<SelectItem value="doctor">Bác sĩ</SelectItem>
											<SelectItem value="nurse">Điều dưỡng</SelectItem>
											<SelectItem value="receptionist">Lễ tân</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{formData.role === 'doctor' && (
									<div className="space-y-2">
										<Label htmlFor="specialty">Chuyên khoa</Label>
										<Popover
											open={specialtyOpen}
											onOpenChange={setSpecialtyOpen}
										>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													aria-expanded={specialtyOpen}
													className="w-full justify-between border-gray-300 focus:border-blue-500"
												>
													{formData.specialty || 'Chọn chuyên khoa...'}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className="w-[400px] p-0 !h-[80px] !max-h-[80px]"
												style={{
													height: '280px',
													maxHeight: '280px',
													overflow: 'hidden',
												}}
												align="start"
											>
												<Command className="h-full flex flex-col overflow-hidden">
													<CommandInput
														placeholder="Tìm kiếm chuyên khoa..."
														value={specialtySearch}
														onValueChange={setSpecialtySearch}
													/>
													<CommandList
														className="!max-h-[50px] flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
														style={{
															scrollbarWidth: 'thin',
															scrollbarColor: '#cbd5e1 #f1f5f9',
															maxHeight: '50px !important',
															height: '50px',
															overflowY: 'auto',
														}}
													>
														<CommandEmpty>
															Không tìm thấy chuyên khoa.
														</CommandEmpty>
														<CommandGroup>
															{filteredSpecialties.map((specialty) => (
																<CommandItem
																	key={specialty.id}
																	value={specialty.name}
																	className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
																	onSelect={() => {
																		setFormData({
																			...formData,
																			specialty: specialty.name,
																		});
																		setSpecialtyOpen(false);
																		setSpecialtySearch('');
																	}}
																>
																	{specialty.name}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</div>
								)}
								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="isActive"
										checked={formData.isActive}
										onChange={(e) =>
											setFormData({ ...formData, isActive: e.target.checked })
										}
										className="rounded"
									/>
									<Label htmlFor="isActive">Đang hoạt động</Label>
								</div>
								<div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-6">
									<Button variant="outline" onClick={handleCloseDialog}>
										Hủy
									</Button>
									<Button
										onClick={handleSubmit}
										className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
									>
										{editingStaff ? 'Cập nhật' : 'Tạo mới'}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
