import React, { useState, useMemo, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
} from './ui/dialog';
import { Customer, Gender } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	User,
	Phone,
	Mail,
	MapPin,
	ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { DatePicker } from './ui/date-picker';
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

interface CustomerManagementProps {
	customers: Customer[];
	onCreate: (customer: Omit<Customer, 'id'>) => void;
	onUpdate: (id: string, customer: Partial<Customer>) => void;
	onDelete: (id: string) => void;
}

const genderLabels: Record<Gender, string> = {
	male: 'Nam',
	female: 'Nữ',
};

const provinces = (administrativeData as AdministrativeProvince[]).filter(
	(p) => p.ID !== '-1',
);

export function CustomerManagement({
	customers = [],
	onCreate,
	onUpdate,
	onDelete,
}: CustomerManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [showDialog, setShowDialog] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [provinceOpen, setProvinceOpen] = useState(false);
	const [wardOpen, setWardOpen] = useState(false);
	const [provinceSearch, setProvinceSearch] = useState('');
	const [wardSearch, setWardSearch] = useState('');

	const [formData, setFormData] = useState({
		fullName: '',
		phoneNumber: '',
		dateOfBirth: '',
		gender: '' as Gender,
		email: '',
		address: '',
		addressDetail: '',
		provinceId: '',
		wardId: '',
		customerId: '',
		cccdNumber: '',
		insurance: '',
	});

	const selectedProvince = useMemo(() => {
		return provinces.find((p) => p.ID === formData.provinceId);
	}, [formData.provinceId]);

	const wards = useMemo(() => {
		if (!selectedProvince || !selectedProvince.WARDS) return [];
		return selectedProvince.WARDS.filter((w) => w.ID !== '-1');
	}, [selectedProvince]);

	const filteredProvinces = useMemo(() => {
		return provinces.filter((province) =>
			province.NAME.toLowerCase().includes(provinceSearch.toLowerCase()),
		);
	}, [provinceSearch]);

	const filteredWards = useMemo(() => {
		return wards.filter((ward) =>
			ward.TEN.toLowerCase().includes(wardSearch.toLowerCase()),
		);
	}, [wards, wardSearch]);

	const filteredCustomers = useMemo(() => {
		return customers.filter((c) => {
			const matchesSearch =
				c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.phoneNumber.includes(searchTerm) ||
				c.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.cccdNumber?.includes(searchTerm);
			return matchesSearch;
		});
	}, [customers, searchTerm]);

	const {
		itemsPerPage,
		currentPage,
		totalPages,
		paginatedData,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination(filteredCustomers, 10);

	const handleOpenDialog = (customer?: Customer) => {
		if (customer) {
			setEditingCustomer(customer);
			// Parse address to get province and ward
			const addressParts = customer.address?.split(', ') || [];
			let provinceId = '';
			let wardId = '';
			let addressDetail = '';

			// Try to find province
			for (const province of provinces) {
				if (addressParts.includes(province.NAME)) {
					provinceId = province.ID;
					break;
				}
			}

			// Try to find ward
			if (provinceId) {
				const selectedProv = provinces.find((p) => p.ID === provinceId);
				if (selectedProv?.WARDS) {
					for (const ward of selectedProv.WARDS) {
						if (addressParts.includes(ward.TEN)) {
							wardId = ward.ID;
							break;
						}
					}
				}
			}

			// Address detail is the first part
			if (addressParts.length > 0) {
				addressDetail = addressParts[0];
			}

			setFormData({
				fullName: customer.fullName,
				phoneNumber: customer.phoneNumber,
				dateOfBirth: customer.dateOfBirth,
				gender: customer.gender,
				email: customer.email || '',
				address: customer.address || '',
				addressDetail,
				provinceId,
				wardId,
				customerId: customer.customerId || '',
				cccdNumber: customer.cccdNumber || '',
				insurance: customer.insurance || '',
			});
		} else {
			setEditingCustomer(null);
			setFormData({
				fullName: '',
				phoneNumber: '',
				dateOfBirth: '',
				gender: '' as Gender,
				email: '',
				address: '',
				addressDetail: '',
				provinceId: '',
				wardId: '',
				customerId: '',
				cccdNumber: '',
				insurance: '',
			});
		}
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingCustomer(null);
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

		// Build address
		const addressParts: string[] = [];
		if (formData.addressDetail) {
			addressParts.push(formData.addressDetail);
		}
		if (selectedProvince) {
			const selectedWard = selectedProvince.WARDS?.find(
				(w) => w.ID === formData.wardId,
			);
			if (selectedWard) {
				addressParts.push(selectedWard.TEN);
			}
			addressParts.push(selectedProvince.NAME);
		}

		const fullAddress =
			addressParts.length > 0 ? addressParts.join(', ') : formData.address;

		const customerData: Omit<Customer, 'id'> = {
			fullName: formData.fullName,
			phoneNumber: formData.phoneNumber,
			dateOfBirth: formData.dateOfBirth || '',
			gender: formData.gender,
			email: formData.email || undefined,
			address: fullAddress || undefined,
			customerId: formData.customerId || undefined,
			cccdNumber: formData.cccdNumber || undefined,
			insurance: formData.insurance || undefined,
		};

		if (editingCustomer) {
			onUpdate(editingCustomer.id, customerData);
			toast.success('Cập nhật khách hàng thành công');
		} else {
			onCreate(customerData);
			toast.success('Tạo khách hàng thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
			onDelete(id);
			toast.success('Xóa khách hàng thành công');
		}
	};

	useEffect(() => {
		console.log('CustomerManagement rendered', { customersCount: customers.length });
	}, [customers.length]);

	return (
		<div className="space-y-6" data-testid="customer-management">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl flex items-center gap-2">
								<User className="h-6 w-6" />
								Quản lý Khách hàng
							</CardTitle>
							<p className="text-sm text-gray-600 mt-1">
								Quản lý thông tin khách hàng của phòng khám
							</p>
						</div>
						<Button onClick={() => handleOpenDialog()}>
							<Plus className="h-4 w-4 mr-2" />
							Thêm khách hàng
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{/* Debug info */}
					<div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-800">
							📊 Tổng số khách hàng: <strong>{customers.length}</strong>
						</p>
					</div>
					{customers.length === 0 && (
						<div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<p className="text-sm text-yellow-800">
								⚠️ Chưa có dữ liệu khách hàng. Vui lòng thêm khách hàng mới.
							</p>
						</div>
					)}

					{/* Search */}
					<div className="mb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm theo tên, số điện thoại, mã khách hàng, email, CCCD..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Mã KH</TableHead>
									<TableHead>Họ tên</TableHead>
									<TableHead>Số điện thoại</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Ngày sinh</TableHead>
									<TableHead>Giới tính</TableHead>
									<TableHead>Địa chỉ</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="text-center py-8">
											<p className="text-gray-500">Không có dữ liệu</p>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((customer) => (
										<TableRow key={customer.id}>
											<TableCell className="font-medium">
												{customer.customerId || '-'}
											</TableCell>
											<TableCell>{customer.fullName}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Phone className="h-4 w-4 text-gray-400" />
													{customer.phoneNumber}
												</div>
											</TableCell>
											<TableCell>
												{customer.email ? (
													<div className="flex items-center gap-2">
														<Mail className="h-4 w-4 text-gray-400" />
														{customer.email}
													</div>
												) : (
													'-'
												)}
											</TableCell>
											<TableCell>
												{customer.dateOfBirth
													? new Date(customer.dateOfBirth).toLocaleDateString(
															'vi-VN',
													  )
													: '-'}
											</TableCell>
											<TableCell>
												{genderLabels[customer.gender]}
											</TableCell>
											<TableCell>
												{customer.address ? (
													<div className="flex items-center gap-2 max-w-xs truncate">
														<MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
														<span className="truncate">{customer.address}</span>
													</div>
												) : (
													'-'
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleOpenDialog(customer)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDelete(customer.id)}
													>
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{paginatedData.length > 0 && (
						<div className="mt-4">
							<PaginationControls
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={goToPage}
								startIndex={startIndex}
								endIndex={endIndex}
								totalItems={totalItems}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dialog */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						{/* Thông tin cá nhân */}
						<div>
							<h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>
										Họ và tên <span className="text-red-500">*</span>
									</Label>
									<Input
										value={formData.fullName}
										onChange={(e) =>
											setFormData({ ...formData, fullName: e.target.value })
										}
										placeholder="Nhập họ tên"
									/>
								</div>

								<div className="space-y-2">
									<Label>
										Số điện thoại <span className="text-red-500">*</span>
									</Label>
									<Input
										value={formData.phoneNumber}
										onChange={(e) =>
											setFormData({ ...formData, phoneNumber: e.target.value })
										}
										placeholder="Nhập số điện thoại"
									/>
								</div>

								<div className="space-y-2">
									<Label>Ngày sinh</Label>
									<DatePicker
										date={formData.dateOfBirth}
										onStringChange={(date) =>
											setFormData({ ...formData, dateOfBirth: date })
										}
										placeholder="Chọn ngày sinh"
									/>
								</div>

								<div className="space-y-2">
									<Label>
										Giới tính <span className="text-red-500">*</span>
									</Label>
									<Select
										value={formData.gender}
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

								<div className="space-y-2">
									<Label>Email</Label>
									<Input
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										placeholder="Nhập email"
									/>
								</div>

								<div className="space-y-2">
									<Label>Mã khách hàng</Label>
									<Input
										value={formData.customerId}
										onChange={(e) =>
											setFormData({ ...formData, customerId: e.target.value })
										}
										placeholder="Mã khách hàng"
									/>
								</div>

								<div className="space-y-2">
									<Label>Số CCCD/CMND</Label>
									<Input
										value={formData.cccdNumber}
										onChange={(e) =>
											setFormData({ ...formData, cccdNumber: e.target.value })
										}
										placeholder="Số CCCD/CMND"
									/>
								</div>

								<div className="space-y-2">
									<Label>Bảo hiểm y tế</Label>
									<Input
										value={formData.insurance}
										onChange={(e) =>
											setFormData({ ...formData, insurance: e.target.value })
										}
										placeholder="Mã thẻ BHYT"
									/>
								</div>
							</div>
						</div>

						{/* Địa chỉ */}
						<div>
							<h3 className="text-lg font-semibold mb-4">Địa chỉ</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Tỉnh/Thành phố</Label>
									<Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={provinceOpen}
												className="w-full justify-between"
											>
												{formData.provinceId && selectedProvince
													? selectedProvince.NAME
													: 'Chọn tỉnh/thành phố...'}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0" align="start">
											<Command>
												<CommandInput
													placeholder="Tìm kiếm tỉnh/thành phố..."
													value={provinceSearch}
													onValueChange={setProvinceSearch}
												/>
												<CommandList>
													<CommandEmpty>
														Không tìm thấy tỉnh/thành phố.
													</CommandEmpty>
													<CommandGroup>
														{filteredProvinces.map((province) => (
															<CommandItem
																key={province.ID}
																value={province.NAME}
																onSelect={() => {
																	setFormData({
																		...formData,
																		provinceId: province.ID,
																		wardId: '',
																	});
																	setProvinceOpen(false);
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
									<Label>Xã/Phường</Label>
									<Popover open={wardOpen} onOpenChange={setWardOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={wardOpen}
												disabled={!formData.provinceId}
												className="w-full justify-between"
											>
												{formData.wardId && selectedProvince
													? selectedProvince.WARDS?.find(
															(w) => w.ID === formData.wardId,
													  )?.TEN || 'Chọn xã/phường...'
													: 'Chọn xã/phường...'}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0" align="start">
											<Command>
												<CommandInput
													placeholder="Tìm kiếm xã/phường..."
													value={wardSearch}
													onValueChange={setWardSearch}
												/>
												<CommandList>
													<CommandEmpty>Không tìm thấy xã/phường.</CommandEmpty>
													<CommandGroup>
														{filteredWards.map((ward) => (
															<CommandItem
																key={ward.ID}
																value={ward.TEN}
																onSelect={() => {
																	setFormData({
																		...formData,
																		wardId: ward.ID,
																	});
																	setWardOpen(false);
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

								<div className="md:col-span-2 space-y-2">
									<Label>Địa chỉ chi tiết</Label>
									<Input
										value={formData.addressDetail}
										onChange={(e) =>
											setFormData({
												...formData,
												addressDetail: e.target.value,
											})
										}
										placeholder="Ví dụ: 123 Đường ABC"
									/>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button variant="outline" onClick={handleCloseDialog}>
								Hủy
							</Button>
							<Button onClick={handleSubmit}>
								{editingCustomer ? 'Cập nhật' : 'Tạo mới'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

