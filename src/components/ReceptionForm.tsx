import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command';
import { toast } from 'sonner@2.0.3';
import { QRCodeSVG } from 'qrcode.react';
import { MedicalRecord, Gender } from '../types';
import { mockDoctors, mockExaminationPackages } from '../lib/mockData';
import { mockExistingPatients } from '../lib/mockPatients';
import administrativeData from '../administrative.json';
import {
	UserPlus,
	QrCode,
	Camera,
	CreditCard,
	Calendar,
	Upload,
	Users,
	Keyboard,
	Zap,
	CheckCircle2,
	Search,
	Clock,
	User,
	Phone,
	MapPin,
	Hash,
	Shield,
	Download,
	X,
	Sparkles,
	ChevronsUpDown,
	Copy,
	Check,
} from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import { motion, AnimatePresence } from 'motion/react';

interface ReceptionFormProps {
	onSubmit: (
		record: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => void;
	onClose?: () => void;
}

type ExaminationType = 'specialty' | 'doctor' | 'package';

export function ReceptionForm({ onSubmit, onClose }: ReceptionFormProps) {
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [formData, setFormData] = useState({
		fullName: '',
		phoneNumber: '',
		dateOfBirth: '',
		gender: '' as Gender,
		address: '',
		addressDetail: '',
		provinceId: '',
		wardId: '',
		customerId: '',
		cccdNumber: '',
		insurance: '',
		reason: '',
		examinationType: 'specialty' as ExaminationType, // Loại khám mặc định: 'specialty' | 'doctor' | 'package'
		selectedPackage: '', // ID của gói khám đã chọn (chỉ được chọn 1 gói)
		assignedDoctorId: '',
		specialty: '',
	});

	// Administrative data states
	const [provinceOpen, setProvinceOpen] = useState(false);
	const [wardOpen, setWardOpen] = useState(false);
	const [provinceSearch, setProvinceSearch] = useState('');
	const [wardSearch, setWardSearch] = useState('');
	const [specialtyOpen, setSpecialtyOpen] = useState(false);
	const [specialtySearch, setSpecialtySearch] = useState('');

	// Validation errors state
	const [errors, setErrors] = useState<Record<string, boolean>>({});

	// Danh sách chuyên khoa đầy đủ cho bệnh viện đa khoa
	const allSpecialties = [
		'Nội khoa',
		'Ngoại khoa',
		'Tim mạch',
		'Nhi khoa',
		'Sản phụ khoa',
		'Tai mũi họng',
		'Mắt',
		'Da liễu',
		'Thần kinh',
		'Tâm thần',
		'Chấn thương chỉnh hình',
		'Ung bướu',
		'Hồi sức cấp cứu',
		'Gây mê hồi sức',
		'Xét nghiệm',
		'Chẩn đoán hình ảnh',
		'Y học cổ truyền',
		'Dinh dưỡng',
		'Vật lý trị liệu',
		'Phục hồi chức năng',
		'Răng hàm mặt',
		'Tiết niệu',
		'Tiêu hóa',
		'Hô hấp',
		'Nội tiết',
		'Dị ứng miễn dịch',
		'Huyết học',
		'Lão khoa',
		'Y học thể thao',
		'Y học gia đình',
		'Thận học',
		'Gan mật',
		'Dịch tễ học',
		'Y tế công cộng',
		'Giải phẫu bệnh',
		'Vi sinh',
		'Hóa sinh',
		'Huyết học truyền máu',
		'Giải phẫu',
		'Sinh lý bệnh',
	];

	// Filter administrative data
	const provinces = useMemo(() => {
		return (administrativeData as any[]).filter(
			(p) =>
				p.ID !== '-1' &&
				p.NAME.toLowerCase().includes(provinceSearch.toLowerCase()),
		);
	}, [provinceSearch]);

	const selectedProvince = useMemo(() => {
		return (administrativeData as any[]).find(
			(p) => p.ID === formData.provinceId,
		);
	}, [formData.provinceId]);

	const wards = useMemo(() => {
		if (!selectedProvince || !selectedProvince.WARDS) return [];
		return selectedProvince.WARDS.filter(
			(w: any) =>
				w.ID !== '-1' && w.TEN.toLowerCase().includes(wardSearch.toLowerCase()),
		);
	}, [selectedProvince, wardSearch]);

	const filteredSpecialties = useMemo(() => {
		return allSpecialties.filter((s) =>
			s.toLowerCase().includes(specialtySearch.toLowerCase()),
		);
	}, [specialtySearch]);

	// Filter doctors by selected specialty
	const availableDoctors = useMemo(() => {
		if (!formData.specialty) {
			return mockDoctors;
		}
		return mockDoctors.filter(
			(doctor) => doctor.specialty === formData.specialty,
		);
	}, [formData.specialty]);

	// Autocomplete states
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<typeof mockExistingPatients>(
		[],
	);
	const [searchTerm, setSearchTerm] = useState('');

	// QR/Scanning states
	const [isScanning, setIsScanning] = useState(false);
	const [scanningType, setScanningType] = useState<
		'qr' | 'face' | 'insurance' | null
	>(null);

	// Self check-in
	const [showQRPortal, setShowQRPortal] = useState(false);
	const [portalUrl, setPortalUrl] = useState('');
	const [copied, setCopied] = useState(false);

	// Group import
	const [excelFile, setExcelFile] = useState<File | null>(null);
	const [groupRecords, setGroupRecords] = useState<any[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Search patient handler
	useEffect(() => {
		if (searchTerm.length >= 2) {
			const filtered = mockExistingPatients.filter(
				(p) =>
					p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.phoneNumber.includes(searchTerm) ||
					p.customerId.toLowerCase().includes(searchTerm.toLowerCase()),
			);
			setSuggestions(filtered);
			setShowSuggestions(filtered.length > 0);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [searchTerm]);

	const handleSelectPatient = (patient: (typeof mockExistingPatients)[0]) => {
		setFormData({
			...formData,
			fullName: patient.fullName,
			phoneNumber: patient.phoneNumber,
			dateOfBirth: patient.dateOfBirth,
			gender: patient.gender,
			address: patient.address,
			addressDetail: '',
			provinceId: '',
			wardId: '',
			customerId: patient.customerId,
			cccdNumber: patient.cccdNumber || '',
			insurance: patient.insurance || '',
		});
		setSearchTerm(patient.fullName);
		setShowSuggestions(false);
		toast.success(`Đã load thông tin của ${patient.fullName}`);
	};

	const handleSelectPackage = (packageId: string) => {
		setFormData({
			...formData,
			// Nếu chọn lại gói đã chọn thì bỏ chọn, nếu chọn gói khác thì thay thế
			selectedPackage: formData.selectedPackage === packageId ? '' : packageId,
		});
		if (errors.selectedPackage) {
			setErrors({ ...errors, selectedPackage: false });
		}
	};

	// Chuyển đổi gói khám đã chọn thành danh sách dịch vụ con
	const getServicesFromPackage = (packageId: string): string[] => {
		if (!packageId) return [];
		const pkg = mockExaminationPackages.find((p) => p.id === packageId);
		return pkg ? pkg.services : [];
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Reset errors
		const newErrors: Record<string, boolean> = {};

		// Validation các trường bắt buộc
		if (!formData.fullName) newErrors.fullName = true;
		if (!formData.phoneNumber) newErrors.phoneNumber = true;
		if (!formData.dateOfBirth) newErrors.dateOfBirth = true;
		if (!formData.gender) newErrors.gender = true;
		if (!formData.cccdNumber) newErrors.cccdNumber = true;
		if (!formData.provinceId) newErrors.provinceId = true;
		if (!formData.wardId) newErrors.wardId = true;
		if (!formData.examinationType) newErrors.examinationType = true;
		if (!formData.reason) newErrors.reason = true;

		// Validation theo loại khám
		if (formData.examinationType === 'package' && !formData.selectedPackage) {
			newErrors.selectedPackage = true;
		}
		if (formData.examinationType === 'specialty' && !formData.specialty) {
			newErrors.specialty = true;
		}
		if (formData.examinationType === 'doctor' && !formData.assignedDoctorId) {
			newErrors.assignedDoctorId = true;
		}

		// Set errors và hiển thị thông báo nếu có lỗi
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		// Clear errors nếu validation thành công
		setErrors({});

		// Build full address from components
		const addressParts: string[] = [];
		if (formData.addressDetail) addressParts.push(formData.addressDetail);
		if (formData.wardId && selectedProvince) {
			const selectedWard = selectedProvince.WARDS?.find(
				(w: any) => w.ID === formData.wardId,
			);
			if (selectedWard) addressParts.push(selectedWard.TEN);
		}
		if (selectedProvince) addressParts.push(selectedProvince.NAME);
		const fullAddress =
			addressParts.length > 0 ? addressParts.join(', ') : formData.address;

		// Xác định bác sĩ và dịch vụ theo loại khám
		let assignedDoctor:
			| { id: string; name: string; specialty: string }
			| undefined;
		let requestedServices: string[] = [];

		if (formData.examinationType === 'package') {
			requestedServices = getServicesFromPackage(formData.selectedPackage);
			// Có thể tự động gán bác sĩ dựa trên gói khám nếu cần
		} else if (formData.examinationType === 'specialty') {
			// Khám chuyên khoa - có thể có hoặc không có bác sĩ cụ thể
			requestedServices = [`Khám ${formData.specialty}`];
			if (formData.assignedDoctorId) {
				const doctor = mockDoctors.find(
					(d) => d.id === formData.assignedDoctorId,
				);
				if (doctor) {
					assignedDoctor = {
						id: doctor.id,
						name: doctor.name,
						specialty: doctor.specialty,
					};
				}
			}
		} else if (formData.examinationType === 'doctor') {
			// Khám theo bác sĩ
			const doctor = mockDoctors.find(
				(d) => d.id === formData.assignedDoctorId,
			);
			if (doctor) {
				assignedDoctor = {
					id: doctor.id,
					name: doctor.name,
					specialty: doctor.specialty,
				};
				requestedServices = [`Khám ${doctor.specialty}`];
			}
		}

		onSubmit({
			patient: {
				id: formData.customerId || `patient_${Date.now()}`,
				fullName: formData.fullName,
				phoneNumber: formData.phoneNumber,
				dateOfBirth: formData.dateOfBirth,
				gender: formData.gender,
				address: fullAddress,
				customerId: formData.customerId,
				cccdNumber: formData.cccdNumber,
				insurance: formData.insurance,
			},
			requestedServices,
			assignedDoctor,
			status: 'PENDING_EXAMINATION',
			diagnosis: undefined,
			reason: formData.reason,
			paymentStatus: 'pending',
		});

		// Reset form sau khi submit thành công
		setFormData({
			fullName: '',
			phoneNumber: '',
			dateOfBirth: '',
			gender: '' as Gender,
			address: '',
			addressDetail: '',
			provinceId: '',
			wardId: '',
			customerId: '',
			cccdNumber: '',
			insurance: '',
			reason: '',
			examinationType: 'specialty' as ExaminationType,
			selectedPackage: '',
			assignedDoctorId: '',
			specialty: '',
		});
		setErrors({});
		setSearchTerm('');
		setShowSuggestions(false);

		toast.success('Tiếp nhận khách hàng thành công!');
	};

	// Helper function to parse address and fill address fields
	const parseAndFillAddress = (address: string) => {
		// Parse address string to extract province, ward, and detail
		// Format: "Số nhà Đường, Phường/Xã, Tỉnh/Thành phố" (2 cấp: Tỉnh và Xã/Phường)
		const addressParts = address.split(',').map((part) => part.trim());

		let provinceId = '';
		let wardId = '';
		let addressDetail = '';

		// Map common province abbreviations to full names
		const provinceMap: Record<string, string> = {
			'tp.hcm': 'Thành phố Hồ Chí Minh',
			hcm: 'Thành phố Hồ Chí Minh',
			'tp hcm': 'Thành phố Hồ Chí Minh',
			'hà nội': 'Thành phố Hà Nội',
			hn: 'Thành phố Hà Nội',
			'đà nẵng': 'Thành phố Đà Nẵng',
			dn: 'Thành phố Đà Nẵng',
		};

		// Find province from administrative data
		if (addressParts.length >= 2) {
			const provinceName = addressParts[addressParts.length - 1]; // Last part is province
			const normalizedProvinceName = provinceName.toLowerCase().trim();

			// Try mapped name first, then original name
			const searchProvinceName =
				provinceMap[normalizedProvinceName] || provinceName;

			const foundProvince = (administrativeData as any[]).find((p) => {
				const pName = p.NAME.toLowerCase();
				const searchName = searchProvinceName.toLowerCase();

				return (
					pName === searchName ||
					pName.includes(searchName) ||
					searchName.includes(pName) ||
					// Handle abbreviations like "TP.HCM" -> "Thành phố Hồ Chí Minh"
					(normalizedProvinceName.includes('hcm') &&
						pName.includes('hồ chí minh')) ||
					(normalizedProvinceName.includes('hn') && pName.includes('hà nội')) ||
					(normalizedProvinceName.includes('dn') && pName.includes('đà nẵng'))
				);
			});

			if (foundProvince) {
				provinceId = foundProvince.ID;

				// Find ward from province
				// Format: "Số nhà Đường, Phường/Xã, Tỉnh/Thành phố" (3 parts)
				if (addressParts.length >= 2 && foundProvince.WARDS) {
					// Ward is always second from last (or second from start if 3 parts)
					const wardName = addressParts[addressParts.length - 2].trim();
					const normalizedWardName = wardName.toLowerCase().trim();

					// WARDS only contain Phường/Xã, not Quận/Huyện
					if (wardName) {
						// Remove common prefixes like "Xã", "Phường"
						const wardNameWithoutPrefix = normalizedWardName
							.replace(/^(xã|phường)\s+/i, '')
							.trim();

						// Try multiple matching strategies
						let foundWard = foundProvince.WARDS.find((w: any) => {
							if (w.ID === '-1') return false; // Skip placeholder
							const wName = w.TEN.toLowerCase().trim();

							// Exact match (case-insensitive)
							if (wName === normalizedWardName) return true;

							// Match without prefix
							if (wName === wardNameWithoutPrefix) return true;

							// Match with prefix removed from both
							const wNameWithoutPrefix = wName
								.replace(/^(phường|xã)\s+/i, '')
								.trim();
							if (wNameWithoutPrefix === wardNameWithoutPrefix) return true;

							// Exact match with prefix - normalize both
							const normalizedWardWithPrefix = normalizedWardName.replace(
								/\s+/g,
								' ',
							);
							const wNameNormalized = wName.replace(/\s+/g, ' ');
							if (wNameNormalized === normalizedWardWithPrefix) return true;

							// Contains match - more strict
							if (normalizedWardName.length > 3) {
								if (
									wName.includes(normalizedWardName) ||
									normalizedWardName.includes(wName)
								) {
									return true;
								}
							}
							if (wardNameWithoutPrefix.length > 3) {
								if (
									wName.includes(wardNameWithoutPrefix) ||
									wardNameWithoutPrefix.includes(wName)
								) {
									return true;
								}
							}

							// Handle "Phường X", "Xã Y" - exact match with prefix
							if (
								normalizedWardName.startsWith('phường ') ||
								normalizedWardName.startsWith('xã ')
							) {
								if (wName === normalizedWardName) return true;
							}

							return false;
						});

						// If not found, try fuzzy matching with first word
						if (!foundWard && wardNameWithoutPrefix) {
							const firstWord = wardNameWithoutPrefix.split(/\s+/)[0];
							if (firstWord.length > 2) {
								foundWard = foundProvince.WARDS.find((w: any) => {
									if (w.ID === '-1') return false;
									const wName = w.TEN.toLowerCase();
									const wNameWithoutPrefix = wName
										.replace(/^(phường|xã)\s+/i, '')
										.trim();
									return (
										wNameWithoutPrefix.startsWith(firstWord) ||
										firstWord.startsWith(wNameWithoutPrefix.split(/\s+/)[0])
									);
								});
							}
						}

						if (foundWard) {
							wardId = foundWard.ID;
						}
					}
				}
			}
		}

		// Extract address detail (first part: số nhà và tên đường)
		if (addressParts.length > 0) {
			addressDetail = addressParts[0];
		}

		return { provinceId, wardId, addressDetail };
	};

	// QR CCCD Handler
	const handleStartQRScan = () => {
		setIsScanning(true);
		setScanningType('qr');
		setTimeout(() => {
			// Mock QR scan success - Random patient from database
			const randomPatient =
				mockExistingPatients[
					Math.floor(Math.random() * mockExistingPatients.length)
				];
			const { provinceId, wardId, addressDetail } = parseAndFillAddress(
				randomPatient.address,
			);
			setFormData({
				...formData,
				fullName: randomPatient.fullName,
				phoneNumber: randomPatient.phoneNumber,
				dateOfBirth: randomPatient.dateOfBirth,
				gender: randomPatient.gender,
				address: randomPatient.address,
				addressDetail,
				provinceId,
				wardId,
				customerId: randomPatient.customerId,
				cccdNumber: randomPatient.cccdNumber || '',
				insurance: randomPatient.insurance,
			});
			setIsScanning(false);
			setScanningType(null);
			setSearchTerm(randomPatient.fullName);
			toast.success(
				`✅ Quét CCCD thành công! Nhận diện: ${randomPatient.fullName}`,
			);
		}, 2000);
	};

	// Self Check-in Handler
	const handleGenerateQRPortal = () => {
		const url = `https://indica-clinic.com/check-in/${Math.random()
			.toString(36)
			.substring(7)}`;
		setPortalUrl(url);
		setShowQRPortal(true);
		setCopied(false);
		toast.success('QR Code đã được tạo! Khách hàng có thể quét để tự nhập.');
	};

	// Copy URL Handler
	const handleCopyUrl = async () => {
		if (portalUrl) {
			try {
				await navigator.clipboard.writeText(portalUrl);
				setCopied(true);
				toast.success('Đã sao chép URL vào clipboard!');
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				toast.error('Không thể sao chép URL');
			}
		}
	};

	// Face Recognition Handler
	const handleStartFaceRecognition = () => {
		setIsScanning(true);
		setScanningType('face');
		setTimeout(() => {
			const randomPatient =
				mockExistingPatients[
					Math.floor(Math.random() * mockExistingPatients.length)
				];
			const { provinceId, wardId, addressDetail } = parseAndFillAddress(
				randomPatient.address,
			);
			setFormData({
				...formData,
				fullName: randomPatient.fullName,
				phoneNumber: randomPatient.phoneNumber,
				dateOfBirth: randomPatient.dateOfBirth,
				gender: randomPatient.gender,
				address: randomPatient.address,
				addressDetail,
				provinceId,
				wardId,
				customerId: randomPatient.customerId,
				cccdNumber: randomPatient.cccdNumber || '',
				insurance: randomPatient.insurance,
			});
			setIsScanning(false);
			setScanningType(null);
			setSearchTerm(randomPatient.fullName);
			toast.success(
				`✅ Nhận diện khuôn mặt thành công! ${randomPatient.fullName} - Đã khám ${randomPatient.visitCount} lần`,
			);
		}, 3000);
	};

	// Insurance Card Handler
	const handleScanInsurance = () => {
		setIsScanning(true);
		setScanningType('insurance');
		setTimeout(() => {
			// Mock scan insurance - Find patient with insurance or random one
			const patientsWithInsurance = mockExistingPatients.filter(
				(p) => p.insurance,
			);
			const randomPatient =
				patientsWithInsurance.length > 0
					? patientsWithInsurance[
							Math.floor(Math.random() * patientsWithInsurance.length)
					  ]
					: mockExistingPatients[
							Math.floor(Math.random() * mockExistingPatients.length)
					  ];

			const { provinceId, wardId, addressDetail } = parseAndFillAddress(
				randomPatient.address,
			);
			setFormData({
				...formData,
				fullName: randomPatient.fullName,
				phoneNumber: randomPatient.phoneNumber,
				dateOfBirth: randomPatient.dateOfBirth,
				gender: randomPatient.gender,
				address: randomPatient.address,
				addressDetail,
				provinceId,
				wardId,
				customerId: randomPatient.customerId,
				cccdNumber: randomPatient.cccdNumber || '',
				insurance: randomPatient.insurance,
			});
			setIsScanning(false);
			setScanningType(null);
			setSearchTerm(randomPatient.fullName);
			toast.success(
				`✅ Quét thẻ BHYT thành công! Nhận diện: ${randomPatient.fullName}`,
			);
		}, 2000);
	};

	// Group Import Handler
	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setExcelFile(file);
			// Mock parse Excel
			const mockRecords = [
				{
					fullName: 'Nguyễn A',
					phoneNumber: '0901111111',
					service: 'Khám tổng quát',
				},
				{
					fullName: 'Trần B',
					phoneNumber: '0902222222',
					service: 'Xét nghiệm máu',
				},
				{ fullName: 'Lê C', phoneNumber: '0903333333', service: 'Siêu âm' },
			];
			setGroupRecords(mockRecords);
			toast.success(`Đã load ${mockRecords.length} hồ sơ từ file Excel`);
		}
	};

	const handleSubmitGroupRecords = () => {
		groupRecords.forEach((record, index) => {
			setTimeout(() => {
				const doctor = mockDoctors[index % mockDoctors.length];
				onSubmit({
					patient: {
						id: `GROUP${Date.now()}${index}`,
						fullName: record.fullName,
						phoneNumber: record.phoneNumber,
						dateOfBirth: '',
						gender: 'male',
						address: '',
						customerId: `GROUP${Date.now()}${index}`,
						cccdNumber: '',
						insurance: '',
					},
					requestedServices: [record.service], // Giữ nguyên cho group import
					assignedDoctor: {
						id: doctor.id,
						name: doctor.name,
						specialty: doctor.specialty,
					},
					status: 'PENDING_EXAMINATION',
					diagnosis: undefined,
					reason: 'Khám đoàn',
					paymentStatus: 'pending',
				});
			}, index * 100);
		});
		toast.success(`Đã tiếp nhận ${groupRecords.length} hồ sơ!`);
		setExcelFile(null);
		setGroupRecords([]);
	};

	// Download Excel Template
	const handleDownloadTemplate = () => {
		// Tạo dữ liệu mẫu cho file Excel dựa trên các trường trong form
		// Các trường bắt buộc: Họ và tên, Số điện thoại, Ngày sinh, Giới tính, Số CCCD, Tỉnh/Thành phố, Xã/Phường, Dịch vụ/Lý do khám
		// Các trường tùy chọn: Địa chỉ chi tiết, Bảo hiểm y tế
		const templateData = [
			[
				'Họ và tên *',
				'Số điện thoại *',
				'Ngày sinh * (YYYY-MM-DD)',
				'Giới tính * (Nam/Nữ)',
				'Số CCCD *',
				'Tỉnh/Thành phố *',
				'Xã/Phường *',
				'Địa chỉ chi tiết',
				'Bảo hiểm y tế',
				'Dịch vụ/Lý do khám *',
			],
			[
				'Nguyễn Văn A',
				'0901234567',
				'1990-01-15',
				'Nam',
				'001234567890',
				'Hà Nội',
				'Phường Láng Thượng',
				'123 Đường Láng',
				'BH123456789',
				'Khám tổng quát',
			],
			[
				'Trần Thị B',
				'0902345678',
				'1995-05-20',
				'Nữ',
				'001234567891',
				'TP. Hồ Chí Minh',
				'Phường Bến Nghé',
				'456 Đường Nguyễn Huệ',
				'',
				'Xét nghiệm máu',
			],
			[
				'Lê Văn C',
				'0903456789',
				'1988-12-10',
				'Nam',
				'001234567892',
				'Đà Nẵng',
				'Phường Hải Châu',
				'789 Đường Trần Phú',
				'BH987654321',
				'Siêu âm',
			],
		];

		// Chuyển đổi sang CSV format với BOM để hỗ trợ UTF-8
		const csvContent =
			'\uFEFF' +
			templateData
				.map((row) => row.map((cell) => `"${cell}"`).join(','))
				.join('\n');

		// Tạo blob và download
		const blob = new Blob([csvContent], {
			type: 'text/csv;charset=utf-8;',
		});
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', 'Mau_Import_Khach_Hang.csv');
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		toast.success('Đã tải file mẫu thành công!');
	};

	return (
		<div className="space-y-4">
			{/* Header với tiêu đề và các button */}
			<div className="flex items-center justify-between pb-4 border-b border-gray-200">
				<h2 className="text-2xl font-semibold text-gray-900">
					Tiếp nhận khách hàng
				</h2>
				<div className="flex gap-2 flex-wrap">
					<Button
						type="button"
						variant="outline"
						onClick={handleStartQRScan}
						disabled={isScanning}
						className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isScanning && scanningType === 'qr' ? (
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Infinity,
									ease: 'linear',
								}}
							>
								<QrCode className="h-4 w-4" />
							</motion.div>
						) : (
							<QrCode className="h-4 w-4" />
						)}
						Quét CCCD
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleScanInsurance}
						disabled={isScanning}
						className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isScanning && scanningType === 'insurance' ? (
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Infinity,
									ease: 'linear',
								}}
							>
								<CreditCard className="h-4 w-4" />
							</motion.div>
						) : (
							<CreditCard className="h-4 w-4" />
						)}
						Quét BHYT
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleStartFaceRecognition}
						disabled={isScanning}
						className="gap-2 border-pink-300 text-pink-700 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isScanning && scanningType === 'face' ? (
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Infinity,
									ease: 'linear',
								}}
							>
								<Camera className="h-4 w-4" />
							</motion.div>
						) : (
							<Camera className="h-4 w-4" />
						)}
						Nhận diện mặt
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleGenerateQRPortal}
						className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
					>
						<Sparkles className="h-4 w-4" />
						Khách tự nhập
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => setShowImportDialog(true)}
						className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
					>
						<Upload className="h-4 w-4" />
						Import Excel
					</Button>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Self Check-in Dialog */}
				<Dialog open={showQRPortal} onOpenChange={setShowQRPortal}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Khách hàng tự check-in</DialogTitle>
							<DialogDescription>
								Khách hàng quét mã QR này để tự nhập thông tin
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="w-full h-48 bg-white rounded-xl flex items-center justify-center p-4 border-2 border-gray-200">
								{portalUrl ? (
									<QRCodeSVG
										value={portalUrl}
										size={180}
										level="H"
										includeMargin={true}
										className="w-full h-full"
									/>
								) : (
									<QrCode className="h-32 w-32 text-gray-400" />
								)}
							</div>
							<code className="block text-xs bg-gray-100 p-3 rounded break-all">
								{portalUrl}
							</code>
							<div className="flex gap-2">
								<Button
									variant="outline"
									onClick={() => setShowQRPortal(false)}
									className="flex-1"
								>
									Đóng
								</Button>
								<Button variant="outline" size="sm" className="flex-1">
									<Download className="h-4 w-4 mr-2" />
									Tải QR Code
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label htmlFor="fullName">Họ và tên *</Label>
						<Input
							id="fullName"
							value={formData.fullName}
							onChange={(e) => {
								setFormData({ ...formData, fullName: e.target.value });
								if (errors.fullName) {
									setErrors({ ...errors, fullName: false });
								}
							}}
							placeholder="Nhập họ tên"
							className={`border-gray-300 focus:border-blue-500 ${
								errors.fullName ? 'border-red-500 bg-red-50' : ''
							}`}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phoneNumber">Số điện thoại *</Label>
						<div className="relative">
							<Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								id="phoneNumber"
								value={formData.phoneNumber}
								onChange={(e) => {
									setFormData({
										...formData,
										phoneNumber: e.target.value,
									});
									if (errors.phoneNumber) {
										setErrors({ ...errors, phoneNumber: false });
									}
								}}
								placeholder="Nhập số điện thoại"
								className={`pl-10 border-gray-300 focus:border-blue-500 ${
									errors.phoneNumber ? 'border-red-500 bg-red-50' : ''
								}`}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="dateOfBirth">Ngày sinh *</Label>
						<DatePicker
							date={formData.dateOfBirth}
							onStringChange={(date) => {
								setFormData({
									...formData,
									dateOfBirth: date,
								});
								if (errors.dateOfBirth) {
									setErrors({ ...errors, dateOfBirth: false });
								}
							}}
							placeholder="Chọn ngày sinh"
							className={`${
								errors.dateOfBirth ? 'border-red-500 bg-red-50' : ''
							}`}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="gender">Giới tính *</Label>
						<Select
							value={formData.gender}
							onValueChange={(value) => {
								setFormData({ ...formData, gender: value as Gender });
								if (errors.gender) {
									setErrors({ ...errors, gender: false });
								}
							}}
						>
							<SelectTrigger
								className={`border-gray-300 ${
									errors.gender ? 'border-red-500 bg-red-50' : ''
								}`}
							>
								<SelectValue placeholder="Chọn giới tính" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Nam</SelectItem>
								<SelectItem value="female">Nữ</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="cccdNumber">Số căn cước công dân *</Label>
						<div className="relative">
							<Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								id="cccdNumber"
								value={formData.cccdNumber}
								onChange={(e) => {
									setFormData({
										...formData,
										cccdNumber: e.target.value,
									});
									if (errors.cccdNumber) {
										setErrors({ ...errors, cccdNumber: false });
									}
								}}
								placeholder="Nhập số CCCD"
								className={`pl-10 border-gray-300 focus:border-blue-500 ${
									errors.cccdNumber ? 'border-red-500 bg-red-50' : ''
								}`}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="insurance">Bảo hiểm y tế</Label>
						<div className="relative">
							<Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								id="insurance"
								value={formData.insurance}
								onChange={(e) =>
									setFormData({
										...formData,
										insurance: e.target.value,
									})
								}
								placeholder="Mã thẻ BHYT"
								className="pl-10 border-gray-300 focus:border-blue-500"
							/>
						</div>
					</div>

					{/* Tỉnh/Thành phố */}
					<div className="space-y-2">
						<Label>Tỉnh/Thành phố *</Label>
						<Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={provinceOpen}
									className={`w-full justify-between border-gray-300 focus:border-blue-500 ${
										errors.provinceId ? 'border-red-500 bg-red-50' : ''
									}`}
								>
									{formData.provinceId && selectedProvince
										? selectedProvince.NAME
										: 'Chọn tỉnh/thành phố...'}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-[400px] p-0 !h-[80px] !max-h-[80px] "
								style={{
									height: '280px',
									maxheight: '280px',
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
										<CommandEmpty>Không tìm thấy tỉnh/thành phố.</CommandEmpty>
										<CommandGroup>
											{provinces.map((province) => (
												<CommandItem
													key={province.ID}
													value={province.NAME}
													className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
													onSelect={() => {
														setFormData({
															...formData,
															provinceId: province.ID,
															wardId: '', // Reset ward when province changes
														});
														if (errors.provinceId) {
															setErrors({ ...errors, provinceId: false });
														}
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

					{/* Xã/Phường */}
					<div className="space-y-2">
						<Label>Xã/Phường *</Label>
						<Popover open={wardOpen} onOpenChange={setWardOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={wardOpen}
									disabled={!formData.provinceId}
									className={`w-full justify-between border-gray-300 focus:border-blue-500 disabled:opacity-50 ${
										errors.wardId ? 'border-red-500 bg-red-50' : ''
									}`}
								>
									{formData.wardId && selectedProvince
										? selectedProvince.WARDS?.find(
												(w: any) => w.ID === formData.wardId,
										  )?.TEN || 'Chọn xã/phường...'
										: 'Chọn xã/phường...'}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-[400px] p-0 !h-[80px] !max-h-[80px]"
								style={{
									height: '280px',
									maxheight: '280px',
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
										<CommandEmpty>Không tìm thấy xã/phường.</CommandEmpty>
										<CommandGroup>
											{wards.map((ward: any) => (
												<CommandItem
													key={ward.ID}
													value={ward.TEN}
													className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
													onSelect={() => {
														setFormData({
															...formData,
															wardId: ward.ID,
														});
														if (errors.wardId) {
															setErrors({ ...errors, wardId: false });
														}
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

					{/* Địa chỉ chi tiết */}
					<div className="space-y-2">
						<Label htmlFor="addressDetail">Địa chỉ chi tiết</Label>
						<Input
							id="addressDetail"
							value={formData.addressDetail}
							onChange={(e) =>
								setFormData({
									...formData,
									addressDetail: e.target.value,
								})
							}
							placeholder="Ví dụ: 123 Đường ABC"
							className="border-gray-300 focus:border-blue-500"
						/>
					</div>
				</div>

				{/* Chọn loại khám */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2">
						Loại khám *
						{formData.fullName && searchTerm && !formData.examinationType && (
							<Badge variant="destructive" className="animate-pulse">
								Chưa chọn
							</Badge>
						)}
					</Label>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{/* Khám chuyên khoa */}
						<button
							type="button"
							onClick={() => {
								setFormData({
									...formData,
									examinationType: 'specialty',
									selectedPackage: '',
									assignedDoctorId: '',
								});
								if (errors.examinationType) {
									setErrors({ ...errors, examinationType: false });
								}
							}}
							className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
								formData.examinationType === 'specialty'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: errors.examinationType
									? 'border-red-500 bg-red-50'
									: 'border-gray-200 hover:border-gray-300 bg-white'
							}`}
						>
							<div className="flex items-center gap-3">
								{formData.examinationType === 'specialty' ? (
									<CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
								) : (
									<div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300" />
								)}
								<div>
									<div className="font-medium">Khám chuyên khoa</div>
									<div className="text-xs text-gray-600 mt-1">
										Chọn chuyên khoa để khám
									</div>
								</div>
							</div>
						</button>

						{/* Khám theo bác sĩ */}
						<button
							type="button"
							onClick={() => {
								setFormData({
									...formData,
									examinationType: 'doctor',
									selectedPackage: '',
									specialty: '',
								});
								if (errors.examinationType) {
									setErrors({ ...errors, examinationType: false });
								}
							}}
							className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
								formData.examinationType === 'doctor'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: errors.examinationType
									? 'border-red-500 bg-red-50'
									: 'border-gray-200 hover:border-gray-300 bg-white'
							}`}
						>
							<div className="flex items-center gap-3">
								{formData.examinationType === 'doctor' ? (
									<CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
								) : (
									<div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300" />
								)}
								<div>
									<div className="font-medium">Khám theo bác sĩ</div>
									<div className="text-xs text-gray-600 mt-1">
										Chọn bác sĩ cụ thể
									</div>
								</div>
							</div>
						</button>

						{/* Khám theo gói */}
						<button
							type="button"
							onClick={() => {
								setFormData({
									...formData,
									examinationType: 'package',
									specialty: '',
									assignedDoctorId: '',
								});
								if (errors.examinationType) {
									setErrors({ ...errors, examinationType: false });
								}
							}}
							className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
								formData.examinationType === 'package'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: errors.examinationType
									? 'border-red-500 bg-red-50'
									: 'border-gray-200 hover:border-gray-300 bg-white'
							}`}
						>
							<div className="flex items-center gap-3">
								{formData.examinationType === 'package' ? (
									<CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
								) : (
									<div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300" />
								)}
								<div>
									<div className="font-medium">Khám theo gói</div>
									<div className="text-xs text-gray-600 mt-1">
										Chọn gói khám có sẵn
									</div>
								</div>
							</div>
						</button>
					</div>
				</div>

				{/* Hiển thị form theo loại khám đã chọn */}
				{formData.examinationType === 'package' && (
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							Chọn gói khám *
							{!formData.selectedPackage && (
								<Badge variant="destructive" className="animate-pulse">
									Chưa chọn
								</Badge>
							)}
						</Label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{mockExaminationPackages.map((pkg) => {
								const isSelected = formData.selectedPackage === pkg.id;
								return (
									<button
										key={pkg.id}
										type="button"
										onClick={() => handleSelectPackage(pkg.id)}
										className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
											isSelected
												? 'border-blue-500 bg-blue-50 text-blue-700'
												: errors.selectedPackage
												? 'border-red-500 bg-red-50'
												: 'border-gray-200 hover:border-gray-300 bg-white'
										}`}
									>
										<div className="flex items-start gap-3">
											{isSelected ? (
												<CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
											) : (
												<div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full border-2 border-gray-300" />
											)}
											<div className="flex-1">
												<div className="font-medium mb-1">{pkg.name}</div>
												{pkg.description && (
													<div className="text-xs text-gray-600 mb-2">
														{pkg.description}
													</div>
												)}
												<div className="flex flex-wrap gap-1 mt-2">
													{pkg.services.map((service, idx) => (
														<Badge
															key={idx}
															variant="outline"
															className="text-xs"
														>
															{service}
														</Badge>
													))}
												</div>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}

				{formData.examinationType === 'specialty' && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="specialty" className="flex items-center gap-2">
								Chọn chuyên khoa *
								{!formData.specialty ? (
									<Badge variant="destructive" className="animate-pulse">
										Chưa chọn
									</Badge>
								) : (
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700 border-green-300"
									>
										Đã chọn
									</Badge>
								)}
							</Label>
							<Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={specialtyOpen}
										className={`w-full justify-between border-gray-300 focus:border-blue-500 ${
											errors.specialty ? 'border-red-500 bg-red-50' : ''
										}`}
									>
										{formData.specialty || 'Chọn chuyên khoa...'}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-[400px] p-0 !h-[80px] !max-h-[80px]"
									style={{
										height: '280px',
										maxheight: '280px',
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
											<CommandEmpty>Không tìm thấy chuyên khoa.</CommandEmpty>
											<CommandGroup>
												{filteredSpecialties.map((specialty) => (
													<CommandItem
														key={specialty}
														value={specialty}
														className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
														onSelect={() => {
															setFormData({
																...formData,
																specialty: specialty,
																assignedDoctorId: '', // Reset doctor when specialty changes
															});
															if (errors.specialty) {
																setErrors({ ...errors, specialty: false });
															}
															setSpecialtyOpen(false);
															setSpecialtySearch('');
														}}
													>
														{specialty}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="assignedDoctorId"
								className="flex items-center gap-2"
							>
								Bác sĩ phụ trách
								<Badge variant="outline" className="text-gray-600">
									Tùy chọn
								</Badge>
							</Label>
							<Select
								value={formData.assignedDoctorId}
								onValueChange={(value) =>
									setFormData({ ...formData, assignedDoctorId: value })
								}
								disabled={!formData.specialty}
							>
								<SelectTrigger className="border-gray-300">
									<SelectValue
										placeholder={
											formData.specialty
												? 'Chọn bác sĩ hoặc để hệ thống tự phân công'
												: 'Vui lòng chọn chuyên khoa trước'
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{availableDoctors.length > 0 ? (
										availableDoctors.map((doctor) => (
											<SelectItem key={doctor.id} value={doctor.id}>
												{doctor.name} - {doctor.specialty}
											</SelectItem>
										))
									) : (
										<SelectItem value="" disabled>
											Không có bác sĩ nào cho chuyên khoa này
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				{formData.examinationType === 'doctor' && (
					<div className="space-y-2">
						<Label
							htmlFor="assignedDoctorId"
							className="flex items-center gap-2"
						>
							Chọn bác sĩ *
							{!formData.assignedDoctorId && (
								<Badge variant="destructive" className="animate-pulse">
									Chưa chọn
								</Badge>
							)}
						</Label>
						<Select
							value={formData.assignedDoctorId}
							onValueChange={(value) => {
								setFormData({ ...formData, assignedDoctorId: value });
								if (errors.assignedDoctorId) {
									setErrors({ ...errors, assignedDoctorId: false });
								}
							}}
						>
							<SelectTrigger
								className={`border-gray-300 ${
									errors.assignedDoctorId ? 'border-red-500 bg-red-50' : ''
								}`}
							>
								<SelectValue placeholder="Chọn bác sĩ..." />
							</SelectTrigger>
							<SelectContent>
								{mockDoctors.map((doctor) => (
									<SelectItem key={doctor.id} value={doctor.id}>
										{doctor.name} - {doctor.specialty}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="reason">Lý do khám *</Label>
					<Textarea
						id="reason"
						value={formData.reason}
						onChange={(e) => {
							setFormData({ ...formData, reason: e.target.value });
							if (errors.reason) {
								setErrors({ ...errors, reason: false });
							}
						}}
						placeholder="Nhập lý do khám bệnh..."
						className={`border-gray-300 focus:border-blue-500 resize-none ${
							errors.reason ? 'border-red-500 bg-red-50' : ''
						}`}
						rows={3}
					/>
				</div>

				<div className="flex gap-2 justify-end">
					{onClose && (
						<Button type="button" variant="outline" size="sm" onClick={onClose}>
							Đóng
						</Button>
					)}
					<Button
						type="submit"
						size="sm"
						className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
					>
						<UserPlus className="h-4 w-4 mr-2" />
						Tiếp nhận khách hàng
					</Button>
				</div>
			</form>

			{/* Self Check-in Dialog */}
			<Dialog open={showQRPortal} onOpenChange={setShowQRPortal}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Khách hàng tự check-in</DialogTitle>
						<DialogDescription>
							Khách hàng quét mã QR này để tự nhập thông tin
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="w-full h-48 bg-white rounded-xl flex items-center justify-center p-4 border-2 border-gray-200">
							{portalUrl ? (
								<QRCodeSVG
									value={portalUrl}
									size={180}
									level="H"
									includeMargin={true}
									className="w-full h-full"
								/>
							) : (
								<QrCode className="h-32 w-32 text-gray-400" />
							)}
						</div>
						<div className="flex items-center gap-2">
							<code className="flex-1 text-xs bg-gray-100 p-3 rounded break-all">
								{portalUrl}
							</code>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleCopyUrl}
								className="shrink-0"
								title="Sao chép URL"
							>
								{copied ? (
									<Check className="h-4 w-4 text-green-600" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => setShowQRPortal(false)}
								className="flex-1"
							>
								Đóng
							</Button>
							<Button variant="outline" size="sm" className="flex-1">
								<Download className="h-4 w-4 mr-2" />
								Tải QR Code
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Import Excel Dialog */}
			<Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
				<DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Nhập hàng loạt (Khám đoàn)</DialogTitle>
						<DialogDescription>
							Upload file Excel chứa danh sách khách hàng
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-6 py-4">
						{!excelFile ? (
							<div className="space-y-4">
								<div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
									<input
										ref={fileInputRef}
										type="file"
										accept=".xlsx,.xls,.csv"
										onChange={handleFileUpload}
										className="hidden"
									/>
									<Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-600 mb-4">
										Kéo thả file Excel hoặc click để chọn
									</p>
									<div className="flex gap-2 justify-center">
										<Button
											onClick={() => fileInputRef.current?.click()}
											variant="outline"
										>
											<Upload className="h-4 w-4 mr-2" />
											Chọn file Excel
										</Button>
										<Button
											onClick={handleDownloadTemplate}
											variant="outline"
											className="border-blue-300 text-blue-700 hover:bg-blue-50"
										>
											<Download className="h-4 w-4 mr-2" />
											Tải file mẫu
										</Button>
									</div>
								</div>
								<div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
									<p className="font-medium mb-1 text-gray-700">
										Thông tin file:
									</p>
									<ul className="list-disc list-inside space-y-1">
										<li>Định dạng chấp nhận: .xlsx, .xls, .csv</li>
										<li>Kích thước tối đa: 10 MB</li>
									</ul>
								</div>
							</div>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="space-y-4"
							>
								<div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
									<div className="flex items-center gap-3">
										<CheckCircle2 className="h-6 w-6 text-green-600" />
										<div className="flex-1">
											<p className="text-sm mb-1">{excelFile.name}</p>
											<p className="text-xs text-gray-600">
												Đã load {groupRecords.length} hồ sơ
											</p>
										</div>
										<button
											onClick={() => {
												setExcelFile(null);
												setGroupRecords([]);
											}}
											className="text-gray-400 hover:text-gray-600"
										>
											<X className="h-5 w-5" />
										</button>
									</div>
								</div>

								<div className="border border-gray-200 rounded-xl overflow-hidden">
									<div className="bg-gray-50 p-3 border-b border-gray-200">
										<h4 className="text-sm">Danh sách hồ sơ</h4>
									</div>
									<div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
										{groupRecords.map((record, index) => (
											<div
												key={index}
												className="p-3 flex items-center gap-3 hover:bg-gray-50"
											>
												<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">
													{index + 1}
												</div>
												<div className="flex-1">
													<p className="text-sm">{record.fullName}</p>
													<p className="text-xs text-gray-600">
														{record.phoneNumber} • {record.service}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										variant="outline"
										onClick={() => {
											setExcelFile(null);
											setGroupRecords([]);
											setShowImportDialog(false);
										}}
										className="flex-1"
									>
										<X className="h-4 w-4 mr-2" />
										Hủy
									</Button>
									<Button
										onClick={() => {
											handleSubmitGroupRecords();
											setExcelFile(null);
											setGroupRecords([]);
											setShowImportDialog(false);
										}}
										className="flex-1 bg-gradient-to-r from-gray-700 to-slate-700"
									>
										<Zap className="h-4 w-4 mr-2" />
										Tiếp nhận {groupRecords.length} hồ sơ
									</Button>
								</div>
							</motion.div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
