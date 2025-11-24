import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Gender, MedicalRecord } from '../types';
import {
	Phone,
	MapPin,
	Calendar,
	User,
	ArrowLeft,
	Upload,
	FileText,
	Heart,
	Activity,
	ClipboardList,
	PenTool,
	Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command';
import { ChevronsUpDown } from 'lucide-react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './ui/accordion';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import administrativeData from '../administrative.json';
import { Dialog, DialogContent } from './ui/dialog';
import { Eye, CheckCircle2 } from 'lucide-react';
import hpTestImage from '../assets/services/hp_test.png';
import thinprepTestImage from '../assets/services/thinprep_test.png';
import {
	createBooking,
	type BookingFormData,
} from '../services/bookingService';
import * as validators from '../utils/bookingValidation';

interface CustomerBookingPageProps {
	onSubmit?: (
		record: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => void;
	onBack?: () => void;
}

// Interface cho form data đầy đủ
interface MedicalExaminationFormData {
	// I. THÔNG TIN HÀNH CHÍNH
	photo1: File | null;
	fullName: string;
	code: string;
	gender: Gender | '';
	yearOfBirth: string;
	age: string;
	cccdNumber: string;
	cccdIssueDate: string;
	cccdIssuePlace: string;
	permanentAddress: string;
	currentAddress: string;
	workplace: string;
	department: string;
	reason: string;
	phoneNumber: string;

	// II. TIỀN SỬ GIA ĐÌNH
	familyHasDisease: 'yes' | 'no' | '';
	familyDiseaseName: string;

	// III. TIỀN SỬ BẢN THÂN - 22 mục
	personalHistory: {
		diseaseInjury5Years: 'yes' | 'no' | '';
		neurologicalDisease: 'yes' | 'no' | '';
		eyeDisease: 'yes' | 'no' | '';
		earDisease: 'yes' | 'no' | '';
		heartDisease: 'yes' | 'no' | '';
		heartSurgery: 'yes' | 'no' | '';
		hypertension: 'yes' | 'no' | '';
		dyspnea: 'yes' | 'no' | '';
		lungDisease: 'yes' | 'no' | '';
		kidneyDisease: 'yes' | 'no' | '';
		alcoholAddiction: 'yes' | 'no' | '';
		diabetes: 'yes' | 'no' | '';
		mentalIllness: 'yes' | 'no' | '';
		lossOfConsciousness: 'yes' | 'no' | '';
		fainting: 'yes' | 'no' | '';
		digestiveDisease: 'yes' | 'no' | '';
		sleepDisorder: 'yes' | 'no' | '';
		stroke: 'yes' | 'no' | '';
		spineDisease: 'yes' | 'no' | '';
		regularAlcohol: 'yes' | 'no' | '';
		drugUse: 'yes' | 'no' | '';
		otherDisease: 'yes' | 'no' | '';
		otherDiseaseName: string;
	};

	// IV. CÂU HỎI KHÁC
	currentTreatment: 'yes' | 'no' | '';
	currentMedications: string;
	medicationDosage: string;
	hasPregnancyHistory: 'yes' | 'no' | '';
	pregnancyHistory: string;

	// V. CAM ĐOAN & CHỮ KÝ
	declarationDay: string;
	declarationMonth: string;
	declarationYear: string;
	signatureName: string;

	// II. DỊCH VỤ KHÁM
	selectedServices: string[];
}

export function CustomerBookingPage({
	onSubmit,
	onBack,
}: CustomerBookingPageProps) {
	const [formData, setFormData] = useState<MedicalExaminationFormData>({
		photo1: null,
		fullName: '',
		code: '',
		gender: '',
		yearOfBirth: '',
		age: '',
		cccdNumber: '',
		cccdIssueDate: '',
		cccdIssuePlace: '',
		permanentAddress: '',
		currentAddress: '',
		workplace: '',
		department: '',
		reason: '',
		phoneNumber: '',
		familyHasDisease: 'no',
		familyDiseaseName: '',
		personalHistory: {
			diseaseInjury5Years: 'no',
			neurologicalDisease: 'no',
			eyeDisease: 'no',
			earDisease: 'no',
			heartDisease: 'no',
			heartSurgery: 'no',
			hypertension: 'no',
			dyspnea: 'no',
			lungDisease: 'no',
			kidneyDisease: 'no',
			alcoholAddiction: 'no',
			diabetes: 'no',
			mentalIllness: 'no',
			lossOfConsciousness: 'no',
			fainting: 'no',
			digestiveDisease: 'no',
			sleepDisorder: 'no',
			stroke: 'no',
			spineDisease: 'no',
			regularAlcohol: 'no',
			drugUse: 'no',
			otherDisease: 'no',
			otherDiseaseName: '',
		},
		currentTreatment: 'no',
		currentMedications: '',
		medicationDosage: '',
		hasPregnancyHistory: 'no',
		pregnancyHistory: '',
		declarationDay: '',
		declarationMonth: '',
		declarationYear: '',
		signatureName: '',
		selectedServices: [],
	});

	const [errors, setErrors] = useState<Record<string, boolean>>({});
	const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
		{},
	);
	const [provinceOpen, setProvinceOpen] = useState(false);
	const [wardOpen, setWardOpen] = useState(false);
	const [provinceSearch, setProvinceSearch] = useState('');
	const [wardSearch, setWardSearch] = useState('');
	const [selectedProvinceId, setSelectedProvinceId] = useState('');
	const [selectedWardId, setSelectedWardId] = useState('');
	const dateInputRef = useRef<HTMLInputElement>(null);
	const [cursorPosition, setCursorPosition] = useState<number | null>(null);
	const [selectedImageDialog, setSelectedImageDialog] = useState<string | null>(
		null,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccessPage, setShowSuccessPage] = useState(false);
	const [bookingId, setBookingId] = useState<number | null>(null);

	// Danh sách dịch vụ test
	const testServices = [
		{
			id: 'hp_test',
			name: 'Xét nghiệm HP',
			image: hpTestImage,
		},
		{
			id: 'thinprep_test',
			name: 'Xét nghiệm ThinPrep',
			image: thinprepTestImage,
		},
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
			(p) => p.ID === selectedProvinceId,
		);
	}, [selectedProvinceId]);

	const wards = useMemo(() => {
		if (!selectedProvince || !selectedProvince.WARDS) return [];
		return selectedProvince.WARDS.filter(
			(w: any) =>
				w.ID !== '-1' && w.TEN.toLowerCase().includes(wardSearch.toLowerCase()),
		);
	}, [selectedProvince, wardSearch]);

	// Tính tuổi từ năm sinh
	const calculateAge = (year: string) => {
		if (!year) return '';
		const currentYear = new Date().getFullYear();
		const birthYear = parseInt(year);
		if (isNaN(birthYear)) return '';
		return (currentYear - birthYear).toString();
	};

	const handleYearOfBirthChange = (year: string) => {
		setFormData({
			...formData,
			yearOfBirth: year,
			age: calculateAge(year),
		});
	};

	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, photo1: file });
		}
	};

	// Di chuyển cursor khi cursorPosition thay đổi
	useEffect(() => {
		if (cursorPosition !== null && dateInputRef.current) {
			// Sử dụng requestAnimationFrame để đảm bảo DOM đã được render
			requestAnimationFrame(() => {
				setTimeout(() => {
					if (dateInputRef.current) {
						dateInputRef.current.setSelectionRange(
							cursorPosition,
							cursorPosition,
						);
						setCursorPosition(null); // Reset sau khi di chuyển
					}
				}, 0);
			});
		}
	}, [cursorPosition, formData.cccdIssueDate]);

	// Format ngày tự động với định dạng dd/mm/yyyy, chỉ hiển thị số và dấu "/"
	const formatDateInput = (value: string): string => {
		// Chỉ cho phép số
		const numbers = value.replace(/\D/g, '');

		// Giới hạn tối đa 8 số (ddmmyyyy)
		const limitedNumbers = numbers.slice(0, 8);

		if (limitedNumbers.length === 0) {
			return '';
		}

		// Format theo từng phần: dd/mm/yyyy
		if (limitedNumbers.length === 1) {
			// Chỉ có 1 số ngày
			return limitedNumbers;
		} else if (limitedNumbers.length === 2) {
			// Đủ 2 số ngày, hiển thị dấu "/"
			return `${limitedNumbers}/`;
		} else if (limitedNumbers.length === 3) {
			// Có ngày và 1 số tháng
			return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`;
		} else if (limitedNumbers.length === 4) {
			// Đủ 2 số ngày và 2 số tháng, hiển thị dấu "/" thứ 2
			return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}/`;
		} else {
			// Có ngày, tháng và năm
			return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(
				2,
				4,
			)}/${limitedNumbers.slice(4)}`;
		}
	};

	// Validate và chuyển đổi ngày dd/mm/yyyy sang Date object
	const parseDateString = (dateString: string): Date | null => {
		if (!dateString || dateString.length !== 10) return null;

		const parts = dateString.split('/');
		if (parts.length !== 3) return null;

		// Parse từng phần
		const dayStr = parts[0];
		const monthStr = parts[1];
		const yearStr = parts[2];

		// Phải có đủ số trong mỗi phần
		if (dayStr.length !== 2 || monthStr.length !== 2 || yearStr.length !== 4) {
			return null;
		}

		const day = parseInt(dayStr, 10);
		const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed
		const year = parseInt(yearStr, 10);

		if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

		const date = new Date(year, month, day);

		// Validate ngày hợp lệ
		if (
			date.getDate() !== day ||
			date.getMonth() !== month ||
			date.getFullYear() !== year
		) {
			return null;
		}

		return date;
	};

	const handleDateInputChange = (value: string) => {
		// Lấy tất cả số từ giá trị input (loại bỏ tất cả ký tự không phải số)
		const numbers = value.replace(/\D/g, '');

		// Nếu không có số nào, đặt về rỗng
		if (numbers.length === 0) {
			setFormData({ ...formData, cccdIssueDate: '' });
			setCursorPosition(0);
			return;
		}

		// Format lại với các số đã nhập
		const formatted = formatDateInput(numbers);

		setFormData({ ...formData, cccdIssueDate: formatted });

		// Clear errors khi user change input
		if (errors.cccdIssueDate) {
			setErrors({ ...errors, cccdIssueDate: false });
			setErrorMessages({ ...errorMessages, cccdIssueDate: '' });
		}

		// Tính toán vị trí cursor mong muốn
		let desiredCursorPosition = formatted.length;

		// Khi nhập đủ 2 số (ngày), di chuyển cursor sau dấu "/" đầu tiên
		if (numbers.length === 2) {
			desiredCursorPosition = 3; // Sau "dd/"
		}
		// Khi nhập đủ 4 số (ngày + tháng), di chuyển cursor sau dấu "/" thứ 2
		else if (numbers.length === 4) {
			desiredCursorPosition = 6; // Sau "dd/mm/"
		}
		// Nếu đã nhập đủ 8 số, giữ cursor ở cuối
		else if (numbers.length === 8) {
			desiredCursorPosition = formatted.length; // Cuối "dd/mm/yyyy"
		}
		// Nếu đang nhập, cursor ở vị trí tiếp theo (sau số vừa nhập)
		else {
			desiredCursorPosition = formatted.length;
		}

		// Set cursor position để useEffect sẽ di chuyển cursor
		setCursorPosition(desiredCursorPosition);
	};

	// Validate ngày cấp khi người dùng rời khỏi trường (onBlur)
	const handleDateInputBlur = () => {
		const validation = validators.validateCCCDIssueDate(formData.cccdIssueDate);
		setErrors((prevErrors) => ({
			...prevErrors,
			cccdIssueDate: !validation.isValid,
		}));
		setErrorMessages((prevMessages) => ({
			...prevMessages,
			cccdIssueDate: validation.isValid
				? ''
				: validation.message || 'Vui lòng kiểm tra lại ngày cấp',
		}));
	};

	// Validate các trường bắt buộc khi người dùng rời khỏi trường (onBlur)
	// Sử dụng functional updates để tránh stale closure
	const validateFieldOnBlur = (
		fieldName: string,
		value: string,
		validator: (val: string) => { isValid: boolean; message?: string },
	) => {
		const validation = validator(value);
		setErrors((prevErrors) => ({
			...prevErrors,
			[fieldName]: !validation.isValid,
		}));
		setErrorMessages((prevMessages) => ({
			...prevMessages,
			[fieldName]: validation.isValid ? '' : validation.message || '',
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Prevent double submission
		if (isSubmitting) return;

		// Reset errors
		const newErrors: Record<string, boolean> = {};
		const newErrorMessages: Record<string, string> = {};

		// I. THÔNG TIN CÁ NHÂN - Validate với validators
		const fullNameValidation = validators.validateFullName(formData.fullName);
		if (!fullNameValidation.isValid) {
			newErrors.fullName = true;
			newErrorMessages.fullName = fullNameValidation.message || '';
		}

		const genderValidation = validators.validateGender(formData.gender);
		if (!genderValidation.isValid) {
			newErrors.gender = true;
			newErrorMessages.gender = genderValidation.message || '';
		}

		const yearOfBirthValidation = validators.validateYearOfBirth(
			formData.yearOfBirth,
		);
		if (!yearOfBirthValidation.isValid) {
			newErrors.yearOfBirth = true;
			newErrorMessages.yearOfBirth = yearOfBirthValidation.message || '';
		}

		const cccdValidation = validators.validateCCCD(formData.cccdNumber);
		if (!cccdValidation.isValid) {
			newErrors.cccdNumber = true;
			newErrorMessages.cccdNumber = cccdValidation.message || '';
		}

		const cccdIssueDateValidation = validators.validateCCCDIssueDate(
			formData.cccdIssueDate,
		);
		if (!cccdIssueDateValidation.isValid) {
			newErrors.cccdIssueDate = true;
			newErrorMessages.cccdIssueDate = cccdIssueDateValidation.message || '';
		}

		const issuePlaceValidation = validators.validateIssuePlace(
			formData.cccdIssuePlace,
		);
		if (!issuePlaceValidation.isValid) {
			newErrors.cccdIssuePlace = true;
			newErrorMessages.cccdIssuePlace = issuePlaceValidation.message || '';
		}

		const permanentAddressValidation = validators.validatePermanentAddress(
			formData.permanentAddress,
		);
		if (!permanentAddressValidation.isValid) {
			newErrors.permanentAddress = true;
			newErrorMessages.permanentAddress =
				permanentAddressValidation.message || '';
		}

		const currentAddressValidation = validators.validateCurrentAddress(
			formData.currentAddress,
		);
		if (!currentAddressValidation.isValid) {
			newErrors.currentAddress = true;
			newErrorMessages.currentAddress = currentAddressValidation.message || '';
		}

		const workplaceValidation = validators.validateWorkplace(
			formData.workplace,
		);
		if (!workplaceValidation.isValid) {
			newErrors.workplace = true;
			newErrorMessages.workplace = workplaceValidation.message || '';
		}

		const departmentValidation = validators.validateDepartment(
			formData.department,
		);
		if (!departmentValidation.isValid) {
			newErrors.department = true;
			newErrorMessages.department = departmentValidation.message || '';
		}

		const reasonValidation = validators.validateReason(formData.reason);
		if (!reasonValidation.isValid) {
			newErrors.reason = true;
			newErrorMessages.reason = reasonValidation.message || '';
		}

		const phoneNumberValidation = validators.validatePhoneNumber(
			formData.phoneNumber,
		);
		if (!phoneNumberValidation.isValid) {
			newErrors.phoneNumber = true;
			newErrorMessages.phoneNumber = phoneNumberValidation.message || '';
		}

		// II. TIỀN SỬ GIA ĐÌNH
		const familyHistoryValidation = validators.validateFamilyHistory(
			formData.familyHasDisease,
		);
		if (!familyHistoryValidation.isValid) {
			newErrors.familyHasDisease = true;
			newErrorMessages.familyHasDisease = familyHistoryValidation.message || '';
		}

		if (formData.familyHasDisease === 'yes') {
			const familyDiseaseDetailValidation =
				validators.validateFamilyDiseaseDetail(formData.familyDiseaseName);
			if (!familyDiseaseDetailValidation.isValid) {
				newErrors.familyDiseaseName = true;
				newErrorMessages.familyDiseaseName =
					familyDiseaseDetailValidation.message || '';
			}
		}

		// III. TIỀN SỬ BẢN THÂN - Validate tất cả các trường
		const personalHistoryKeys: (keyof typeof formData.personalHistory)[] = [
			'diseaseInjury5Years',
			'neurologicalDisease',
			'eyeDisease',
			'earDisease',
			'heartDisease',
			'heartSurgery',
			'hypertension',
			'dyspnea',
			'lungDisease',
			'kidneyDisease',
			'alcoholAddiction',
			'diabetes',
			'mentalIllness',
			'lossOfConsciousness',
			'fainting',
			'digestiveDisease',
			'sleepDisorder',
			'stroke',
			'spineDisease',
			'regularAlcohol',
			'drugUse',
			'otherDisease',
		];

		personalHistoryKeys.forEach((key) => {
			const validation = validators.validatePersonalHistoryItem(
				formData.personalHistory[key] as string,
				String(key),
			);
			if (!validation.isValid) {
				newErrors[`personalHistory.${String(key)}`] = true;
				newErrorMessages[`personalHistory.${String(key)}`] =
					validation.message || '';
			}
		});

		if (formData.personalHistory.otherDisease === 'yes') {
			const otherDiseaseDetailValidation =
				validators.validateOtherDiseaseDetail(
					formData.personalHistory.otherDiseaseName,
				);
			if (!otherDiseaseDetailValidation.isValid) {
				newErrors.otherDiseaseName = true;
				newErrorMessages.otherDiseaseName =
					otherDiseaseDetailValidation.message || '';
			}
		}

		// IV. CÂU HỎI KHÁC
		const currentTreatmentValidation = validators.validateCurrentTreatment(
			formData.currentTreatment,
		);
		if (!currentTreatmentValidation.isValid) {
			newErrors.currentTreatment = true;
			newErrorMessages.currentTreatment =
				currentTreatmentValidation.message || '';
		}

		if (formData.currentTreatment === 'yes') {
			const medicationDetailValidation = validators.validateMedicationDetail(
				formData.currentMedications,
			);
			if (!medicationDetailValidation.isValid) {
				newErrors.currentMedications = true;
				newErrorMessages.currentMedications =
					medicationDetailValidation.message || '';
			}
		}

		const pregnancyHistoryValidation = validators.validatePregnancyHistory(
			formData.hasPregnancyHistory,
		);
		if (!pregnancyHistoryValidation.isValid) {
			newErrors.hasPregnancyHistory = true;
			newErrorMessages.hasPregnancyHistory =
				pregnancyHistoryValidation.message || '';
		}

		if (formData.hasPregnancyHistory === 'yes') {
			const pregnancyDetailValidation = validators.validatePregnancyDetail(
				formData.pregnancyHistory,
			);
			if (!pregnancyDetailValidation.isValid) {
				newErrors.pregnancyHistory = true;
				newErrorMessages.pregnancyHistory =
					pregnancyDetailValidation.message || '';
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			setErrorMessages(newErrorMessages);

			// Kiểm tra nếu có lỗi về ngày cấp, ưu tiên hiển thị thông báo về ngày cấp
			if (newErrors.cccdIssueDate && newErrorMessages.cccdIssueDate) {
				toast.error(
					'Vui lòng điền đầy đủ thông tin bắt buộc và kiểm tra lại ngày cấp',
				);
			} else {
				// Hiển thị lỗi đầu tiên tìm thấy
				const firstErrorMessage = Object.values(newErrorMessages)[0];
				toast.error(
					firstErrorMessage || 'Vui lòng điền đầy đủ thông tin bắt buộc',
				);
			}
			return;
		}

		// Start submission
		setIsSubmitting(true);

		try {
			// Prepare booking data for API
			const bookingData: BookingFormData = {
				// I. THÔNG TIN CÁ NHÂN
				fullName: formData.fullName,
				gender: formData.gender as 'male' | 'female',
				yearOfBirth: formData.yearOfBirth,
				cccdNumber: formData.cccdNumber,
				cccdIssueDate: formData.cccdIssueDate,
				cccdIssuePlace: formData.cccdIssuePlace,
				permanentAddress: formData.permanentAddress,
				currentAddress: formData.currentAddress,
				workplace: formData.workplace,
				department: formData.department,
				reason: formData.reason,
				phoneNumber: formData.phoneNumber,

				// II. DỊCH VỤ KHÁM
				selectedServices: formData.selectedServices,

				// III. TIỀN SỬ GIA ĐÌNH
				familyHasDisease: formData.familyHasDisease,
				familyDiseaseName: formData.familyDiseaseName,

				// IV. TIỀN SỬ BẢN THÂN
				personalHistory: formData.personalHistory,

				// V. CÂU HỎI KHÁC
				currentTreatment: formData.currentTreatment,
				currentMedications: formData.currentMedications,
				hasPregnancyHistory: formData.hasPregnancyHistory,
				pregnancyHistory: formData.pregnancyHistory,
			};

			// Call API to create booking
			const response = await createBooking(bookingData);

			// Save full form data to localStorage for reference (including photo)
			const examinationFormData = {
				...formData,
				bookingId: response.id,
				photo1: formData.photo1
					? {
							name: formData.photo1.name,
							size: formData.photo1.size,
							type: formData.photo1.type,
					  }
					: null,
			};

			const formDataId = `examination_form_${response.id}_${Date.now()}`;
			localStorage.setItem(formDataId, JSON.stringify(examinationFormData));

			// Save photo if exists
			if (formData.photo1) {
				const reader = new FileReader();
				reader.onloadend = () => {
					localStorage.setItem(`${formDataId}_photo1`, reader.result as string);
				};
				reader.readAsDataURL(formData.photo1);
			}

			// NOTE: Removed onSubmit callback to prevent auto-redirect after 3s
			// Success page will stay until user clicks "Quay về trang chủ"

			// Show success page
			setBookingId(response.id);
			setShowSuccessPage(true);
		} catch (error) {
			console.error('Booking submission error:', error);
			toast.error(
				error instanceof Error
					? `Đặt lịch thất bại: ${error.message}`
					: 'Đặt lịch thất bại. Vui lòng thử lại sau.',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const personalHistoryItems = [
		{
			key: 'diseaseInjury5Years',
			label: 'Có bệnh hay bị thương trong 5 năm qua',
		},
		{
			key: 'neurologicalDisease',
			label: 'Có bệnh thần kinh hay bị thương ở đầu',
		},
		{
			key: 'eyeDisease',
			label: 'Bệnh mắt hoặc giảm thị lực (trừ trường hợp đeo kính thuốc)',
		},
		{ key: 'earDisease', label: 'Bệnh ở tai, giảm sức nghe hoặc thăng bằng' },
		{
			key: 'heartDisease',
			label: 'Bệnh ở tim, hoặc nhồi máu cơ tim, các bệnh tim mạch khác',
		},
		{
			key: 'heartSurgery',
			label:
				'Phẫu thuật can thiệp tim - mạch (thay van, bắc cầu nối, tạo hình mạch, máy tạo nhịp, đặt slent mạch, ghép tim)',
		},
		{ key: 'hypertension', label: 'Tăng huyết áp' },
		{ key: 'dyspnea', label: 'Khó thở' },
		{
			key: 'lungDisease',
			label: 'Bệnh phổi, hen, khí phế thũng, viêm phế quản mạn tính',
		},
		{ key: 'kidneyDisease', label: 'Bệnh thận, lọc máu' },
		{ key: 'alcoholAddiction', label: 'Nghiện rượu, bia' },
		{
			key: 'diabetes',
			label: 'Đái tháo đường hoặc kiểm soát tăng đường huyết',
		},
		{ key: 'mentalIllness', label: 'Bệnh tâm thần' },
		{ key: 'lossOfConsciousness', label: 'Mất ý thức, rối loạn ý thức' },
		{ key: 'fainting', label: 'Ngất, chóng mặt' },
		{ key: 'digestiveDisease', label: 'Bệnh tiêu hóa' },
		{
			key: 'sleepDisorder',
			label: 'Rối loạn giấc ngủ, ngừng thở khi ngủ, ngủ rũ ban ngày, ngáy to',
		},
		{ key: 'stroke', label: 'Tai biến mạch máu não hoặc liệt' },
		{ key: 'spineDisease', label: 'Bệnh hoặc tổn thương cột sống' },
		{ key: 'regularAlcohol', label: 'Sử dụng rượu thường xuyên, liên tục' },
		{ key: 'drugUse', label: 'Sử dụng ma túy và chất gây nghiện' },
		{ key: 'otherDisease', label: 'Bệnh khác (ghi rõ)' },
	];

	// Success Page - Early return
	if (showSuccessPage) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-2 sm:px-4">
				<div className="max-w-4xl mx-auto">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex items-center justify-center min-h-[80vh]"
					>
						<Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm max-w-2xl w-full">
							<CardContent className="p-8 sm:p-12 text-center">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
									className="inline-block mb-6"
								>
									<CheckCircle2 className="h-20 w-20 sm:h-24 sm:w-24 text-green-500" />
								</motion.div>

								<motion.h1
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
								>
									Đặt lịch khám thành công!
								</motion.h1>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
									className="space-y-4 text-gray-700"
								>
									<p className="text-base sm:text-lg">
										Cảm ơn bạn đã đặt lịch khám tại phòng khám đa khoa Indica!
									</p>
									<p className="text-sm sm:text-base">
										Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận lịch khám.
									</p>
								</motion.div>

								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.6 }}
									className="mt-8 space-y-3"
								>
									{onBack && (
										<Button
											onClick={onBack}
											className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
											size="lg"
										>
											Quay về trang chủ
										</Button>
									)}
								</motion.div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-2 sm:px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-4 sm:mb-6"
				>
					{onBack && (
						<Button
							variant="ghost"
							onClick={onBack}
							className="mb-3 sm:mb-4"
							size="sm"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Button>
					)}
					<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardHeader className="p-4 sm:p-6">
							<div className="flex items-center gap-2 sm:gap-3">
								<div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
									<Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
								</div>
								<div className="flex-1">
									<CardTitle className="text-lg sm:text-2xl">
										Đặt lịch khám sức khỏe
									</CardTitle>
									<p className="text-xs sm:text-sm text-gray-600 mt-1">
										Vui lòng điền đầy đủ thông tin theo form khám sức khỏe
									</p>
								</div>
							</div>
						</CardHeader>
					</Card>
				</motion.div>

				{/* Form */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardContent className="p-4 sm:p-6">
							<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
								<Accordion
									type="multiple"
									defaultValue={[
										'section1',
										'section2',
										'section3',
										'section4',
										'section5',
									]}
									className="w-full"
								>
									{/* I. THÔNG TIN HÀNH CHÍNH */}
									<AccordionItem value="section1">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>I. THÔNG TIN CÁ NHÂN</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-4 sm:space-y-6 pt-2">
												{/* Thông tin cơ bản */}
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor="fullName">
															Họ và tên <span className="text-red-500">*</span>
														</Label>
														<div
															style={
																{
																	'--placeholder-transform': 'none',
																} as React.CSSProperties
															}
														>
															<Input
																id="fullName"
																value={formData.fullName}
																onChange={(e) => {
																	setFormData({
																		...formData,
																		fullName: e.target.value.toUpperCase(),
																	});
																	if (errors.fullName) {
																		setErrors({ ...errors, fullName: false });
																		setErrorMessages({
																			...errorMessages,
																			fullName: '',
																		});
																	}
																}}
																onBlur={(e) => {
																	validateFieldOnBlur(
																		'fullName',
																		e.target.value,
																		validators.validateFullName,
																	);
																}}
																placeholder="Nhập họ và tên"
																style={{
																	textTransform: 'uppercase',
																}}
																className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																	errors.fullName
																		? 'border-red-500 bg-red-50'
																		: ''
																}`}
															/>
															{errors.fullName && errorMessages.fullName && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.fullName}
																</p>
															)}
															<style>{`
																#fullName::placeholder {
																	text-transform: none !important;
																}
															`}</style>
														</div>
													</div>

													<div className="space-y-2">
														<Label>
															Giới tính <span className="text-red-500">*</span>
														</Label>
														<div
															className={`rounded-md p-2 ${
																errors.gender
																	? 'border-2 border-red-500 bg-red-50'
																	: ''
															}`}
														>
															<RadioGroup
																value={formData.gender}
																onValueChange={(value) => {
																	setFormData({
																		...formData,
																		gender: value as Gender,
																	});
																	// Validate ngay khi thay đổi
																	const validation =
																		validators.validateGender(value);
																	setErrors((prevErrors) => ({
																		...prevErrors,
																		gender: !validation.isValid,
																	}));
																	setErrorMessages((prevMessages) => ({
																		...prevMessages,
																		gender: validation.isValid
																			? ''
																			: validation.message || '',
																	}));
																}}
																className="flex flex-row gap-6"
															>
																<div className="flex items-center space-x-2">
																	<RadioGroupItem
																		value="male"
																		id="gender-male"
																	/>
																	<Label
																		htmlFor="gender-male"
																		className="cursor-pointer px-2"
																	>
																		Nam
																	</Label>
																</div>
																<div className="flex items-center space-x-2">
																	<RadioGroupItem
																		value="female"
																		id="gender-female"
																	/>
																	<Label
																		htmlFor="gender-female"
																		className="cursor-pointer px-2"
																	>
																		Nữ
																	</Label>
																</div>
															</RadioGroup>
														</div>
													</div>

													<div className="space-y-2">
														<Label htmlFor="phoneNumber">
															Số điện thoại{' '}
															<span className="text-red-500">*</span>
														</Label>
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
																		setErrors({
																			...errors,
																			phoneNumber: false,
																		});
																		setErrorMessages({
																			...errorMessages,
																			phoneNumber: '',
																		});
																	}
																}}
																onBlur={(e) => {
																	validateFieldOnBlur(
																		'phoneNumber',
																		e.target.value,
																		validators.validatePhoneNumber,
																	);
																}}
																placeholder="Nhập số điện thoại"
																className={`pl-10 border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																	errors.phoneNumber
																		? 'border-red-500 bg-red-50'
																		: ''
																}`}
															/>
														</div>
														{errors.phoneNumber &&
															errorMessages.phoneNumber && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.phoneNumber}
																</p>
															)}
													</div>

													<div className="space-y-2">
														<Label htmlFor="yearOfBirth">
															Năm sinh <span className="text-red-500">*</span>
														</Label>
														<Input
															id="yearOfBirth"
															type="number"
															value={formData.yearOfBirth}
															onChange={(e) => {
																handleYearOfBirthChange(e.target.value);
																if (errors.yearOfBirth) {
																	setErrors({ ...errors, yearOfBirth: false });
																	setErrorMessages({
																		...errorMessages,
																		yearOfBirth: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'yearOfBirth',
																	e.target.value,
																	validators.validateYearOfBirth,
																);
															}}
															placeholder="Nhập năm sinh"
															min="1900"
															max={new Date().getFullYear()}
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.yearOfBirth
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
														{errors.yearOfBirth &&
															errorMessages.yearOfBirth && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.yearOfBirth}
																</p>
															)}
													</div>

													<div className="space-y-2">
														<Label htmlFor="cccdNumber">
															Số CCCD/Hộ chiếu{' '}
															<span className="text-red-500">*</span>
														</Label>
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
																	setErrorMessages({
																		...errorMessages,
																		cccdNumber: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'cccdNumber',
																	e.target.value,
																	validators.validateCCCD,
																);
															}}
															placeholder="Nhập số CCCD/Hộ chiếu"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.cccdNumber
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
														{errors.cccdNumber && errorMessages.cccdNumber && (
															<p className="text-sm text-red-500 mt-1">
																{errorMessages.cccdNumber}
															</p>
														)}
													</div>

													<div className="space-y-2">
														<Label htmlFor="cccdIssueDate">
															Ngày cấp <span className="text-red-500">*</span>
														</Label>
														<Input
															ref={dateInputRef}
															id="cccdIssueDate"
															type="text"
															inputMode="numeric"
															value={formData.cccdIssueDate}
															onChange={(e) => {
																handleDateInputChange(e.target.value);
															}}
															onBlur={handleDateInputBlur}
															onPaste={(e) => {
																e.preventDefault();
																const pastedText =
																	e.clipboardData.getData('text');
																const numbers = pastedText
																	.replace(/\D/g, '')
																	.slice(0, 8);
																handleDateInputChange(numbers);
															}}
															placeholder="dd/mm/yyyy"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.cccdIssueDate
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
														{errors.cccdIssueDate &&
															errorMessages.cccdIssueDate && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.cccdIssueDate}
																</p>
															)}
													</div>

													<div className="space-y-2">
														<Label htmlFor="cccdIssuePlace">
															Nơi cấp <span className="text-red-500">*</span>
														</Label>
														<Input
															id="cccdIssuePlace"
															value={formData.cccdIssuePlace}
															onChange={(e) => {
																setFormData({
																	...formData,
																	cccdIssuePlace: e.target.value,
																});
																if (errors.cccdIssuePlace) {
																	setErrors({
																		...errors,
																		cccdIssuePlace: false,
																	});
																	setErrorMessages({
																		...errorMessages,
																		cccdIssuePlace: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'cccdIssuePlace',
																	e.target.value,
																	validators.validateIssuePlace,
																);
															}}
															placeholder="Nhập nơi cấp"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.cccdIssuePlace
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
														{errors.cccdIssuePlace &&
															errorMessages.cccdIssuePlace && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.cccdIssuePlace}
																</p>
															)}
													</div>

													<div className="space-y-2 sm:col-span-2">
														<Label htmlFor="permanentAddress">
															Hộ khẩu thường trú{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Textarea
															id="permanentAddress"
															value={formData.permanentAddress}
															onChange={(e) => {
																setFormData({
																	...formData,
																	permanentAddress: e.target.value,
																});
																if (errors.permanentAddress) {
																	setErrors({
																		...errors,
																		permanentAddress: false,
																	});
																	setErrorMessages({
																		...errorMessages,
																		permanentAddress: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'permanentAddress',
																	e.target.value,
																	validators.validatePermanentAddress,
																);
															}}
															placeholder="Nhập địa chỉ hộ khẩu thường trú"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.permanentAddress
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
															rows={2}
														/>
														{errors.permanentAddress &&
															errorMessages.permanentAddress && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.permanentAddress}
																</p>
															)}
													</div>

													<div className="space-y-2 sm:col-span-2">
														<Label htmlFor="currentAddress">
															Chỗ ở hiện tại{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Textarea
															id="currentAddress"
															value={formData.currentAddress}
															onChange={(e) => {
																setFormData({
																	...formData,
																	currentAddress: e.target.value,
																});
																if (errors.currentAddress) {
																	setErrors({
																		...errors,
																		currentAddress: false,
																	});
																	setErrorMessages({
																		...errorMessages,
																		currentAddress: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'currentAddress',
																	e.target.value,
																	validators.validateCurrentAddress,
																);
															}}
															placeholder="Nhập địa chỉ chỗ ở hiện tại"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.currentAddress
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
															rows={2}
														/>
														{errors.currentAddress &&
															errorMessages.currentAddress && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.currentAddress}
																</p>
															)}
													</div>

													<div className="space-y-2">
														<Label htmlFor="workplace">
															Nơi làm việc{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Input
															id="workplace"
															value={formData.workplace}
															onChange={(e) => {
																setFormData({
																	...formData,
																	workplace: e.target.value,
																});
																if (errors.workplace) {
																	setErrors({ ...errors, workplace: false });
																	setErrorMessages({
																		...errorMessages,
																		workplace: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'workplace',
																	e.target.value,
																	validators.validateWorkplace,
																);
															}}
															placeholder="Nhập nơi làm việc"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.workplace
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
														{errors.workplace && errorMessages.workplace && (
															<p className="text-sm text-red-500 mt-1">
																{errorMessages.workplace}
															</p>
														)}
													</div>

													<div className="space-y-2">
														<Label htmlFor="department">
															Bộ phận <span className="text-red-500">*</span>
														</Label>
														<Input
															id="department"
															value={formData.department}
															onChange={(e) => {
																setFormData({
																	...formData,
																	department: e.target.value,
																});
																if (errors.department) {
																	setErrors({ ...errors, department: false });
																	setErrorMessages({
																		...errorMessages,
																		department: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'department',
																	e.target.value,
																	validators.validateDepartment,
																);
															}}
															placeholder="Nhập bộ phận"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.department
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
														{errors.department && errorMessages.department && (
															<p className="text-sm text-red-500 mt-1">
																{errorMessages.department}
															</p>
														)}
													</div>

													<div className="space-y-2 sm:col-span-2">
														<Label htmlFor="reason">
															Lý do khám sức khỏe{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Textarea
															id="reason"
															value={formData.reason}
															onChange={(e) => {
																setFormData({
																	...formData,
																	reason: e.target.value,
																});
																if (errors.reason) {
																	setErrors({ ...errors, reason: false });
																	setErrorMessages({
																		...errorMessages,
																		reason: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'reason',
																	e.target.value,
																	validators.validateReason,
																);
															}}
															placeholder="Nhập lý do khám sức khỏe"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.reason ? 'border-red-500 bg-red-50' : ''
															}`}
															rows={3}
														/>
														{errors.reason && errorMessages.reason && (
															<p className="text-sm text-red-500 mt-1">
																{errorMessages.reason}
															</p>
														)}
													</div>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* II. DỊCH VỤ KHÁM */}
									<AccordionItem value="section2">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>II. DỊCH VỤ KHÁM</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-4 pt-2">
												<Label className="text-sm text-gray-600">
													Chọn dịch vụ khám bạn muốn đăng ký (có thể chọn
													nhiều):
												</Label>
												<div className="grid grid-cols-2 gap-4">
													{testServices.map((service) => (
														<Card
															key={service.id}
															className={`border-2 transition-all cursor-pointer ${
																formData.selectedServices.includes(service.id)
																	? 'border-blue-500 bg-blue-50'
																	: 'border-gray-200 hover:border-gray-300'
															}`}
															onClick={() => {
																const isSelected =
																	formData.selectedServices.includes(
																		service.id,
																	);
																if (isSelected) {
																	setFormData({
																		...formData,
																		selectedServices:
																			formData.selectedServices.filter(
																				(id) => id !== service.id,
																			),
																	});
																} else {
																	setFormData({
																		...formData,
																		selectedServices: [
																			...formData.selectedServices,
																			service.id,
																		],
																	});
																}
															}}
														>
															<CardContent className="p-3">
																<div className="flex flex-col gap-2">
																	<div className="relative aspect-square w-full group">
																		<img
																			src={service.image}
																			alt={service.name}
																			className={`w-full h-full object-cover rounded-md border-2 transition-all ${
																				formData.selectedServices.includes(
																					service.id,
																				)
																					? 'border-blue-500 ring-2 ring-blue-300 ring-offset-2 brightness-75 blur-sm'
																					: 'border-gray-200'
																			}`}
																		/>
																		{/* Overlay khi được chọn */}
																		{formData.selectedServices.includes(
																			service.id,
																		) && (
																			<div className="absolute inset-0 bg-blue-500/30 rounded-md flex items-center justify-center transition-all animate-in fade-in duration-200">
																				<CheckCircle2 className="h-16 w-16 text-blue-600 bg-white rounded-full shadow-xl animate-in zoom-in duration-200" />
																			</div>
																		)}
																	</div>
																	<div>
																		<Label
																			htmlFor={service.id}
																			className="font-semibold text-sm cursor-pointer block"
																		>
																			{service.name}
																		</Label>
																	</div>
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		className="w-full text-xs"
																		onClick={(e) => {
																			e.stopPropagation();
																			setSelectedImageDialog(service.image);
																		}}
																	>
																		<Eye className="h-3 w-3 mr-1" />
																		Xem chi tiết
																	</Button>
																</div>
															</CardContent>
														</Card>
													))}
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* III. TIỀN SỬ GIA ĐÌNH */}
									<AccordionItem value="section3">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>III. TIỀN SỬ GIA ĐÌNH</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-4 pt-2">
												<div className="space-y-2">
													<Label className="leading-loose">
														Có ai trong gia đình ông (bà) mắc một số trong các
														bệnh: Truyền nhiễm, tim mạch, đái tháo đường, lao,
														hen phế quản, ung thư, động kinh, rối loạn tâm thần,
														bệnh khác?
													</Label>
													<RadioGroup
														value={formData.familyHasDisease}
														onValueChange={(value) => {
															setFormData({
																...formData,
																familyHasDisease: value as 'yes' | 'no',
															});
															// Validate ngay khi thay đổi
															const validation =
																validators.validateFamilyHistory(value);
															setErrors((prevErrors) => ({
																...prevErrors,
																familyHasDisease: !validation.isValid,
															}));
															setErrorMessages((prevMessages) => ({
																...prevMessages,
																familyHasDisease: validation.isValid
																	? ''
																	: validation.message || '',
															}));
														}}
														className="flex flex-row gap-6"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="yes" id="family-yes" />
															<Label
																htmlFor="family-yes"
																className="cursor-pointer px-2"
															>
																Có
															</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="no" id="family-no" />
															<Label
																htmlFor="family-no"
																className="cursor-pointer px-2"
															>
																Không
															</Label>
														</div>
													</RadioGroup>
												</div>

												{formData.familyHasDisease === 'yes' && (
													<div className="space-y-2">
														<Label htmlFor="familyDiseaseName">
															Ghi rõ tên bệnh
														</Label>
														<Textarea
															id="familyDiseaseName"
															value={formData.familyDiseaseName}
															onChange={(e) => {
																setFormData({
																	...formData,
																	familyDiseaseName: e.target.value,
																});
																if (errors.familyDiseaseName) {
																	setErrors({
																		...errors,
																		familyDiseaseName: false,
																	});
																	setErrorMessages({
																		...errorMessages,
																		familyDiseaseName: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'familyDiseaseName',
																	e.target.value,
																	validators.validateFamilyDiseaseDetail,
																);
															}}
															placeholder="Nhập tên bệnh gia đình mắc phải"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.familyDiseaseName
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
															rows={3}
														/>
														{errors.familyDiseaseName &&
															errorMessages.familyDiseaseName && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.familyDiseaseName}
																</p>
															)}
													</div>
												)}
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* IV. TIỀN SỬ BẢN THÂN */}
									<AccordionItem value="section4">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>IV. TIỀN SỬ BẢN THÂN</span>
											</div>
										</AccordionTrigger>

										<AccordionContent>
											<div className="space-y-4 pt-2">
												{personalHistoryItems.map((item, index) => (
													<div key={item.key} className="space-y-2">
														<Label>
															{index + 1}. {item.label}
														</Label>
														<RadioGroup
															value={
																formData.personalHistory[
																	item.key as keyof typeof formData.personalHistory
																] as string
															}
															onValueChange={(value) => {
																setFormData({
																	...formData,
																	personalHistory: {
																		...formData.personalHistory,
																		[item.key]: value as 'yes' | 'no',
																	},
																});
																// Validate ngay khi thay đổi
																const validation =
																	validators.validatePersonalHistoryItem(
																		value,
																		item.key,
																	);
																const errorKey = `personalHistory.${String(
																	item.key,
																)}`;
																setErrors((prevErrors) => ({
																	...prevErrors,
																	[errorKey]: !validation.isValid,
																}));
																setErrorMessages((prevMessages) => ({
																	...prevMessages,
																	[errorKey]: validation.isValid
																		? ''
																		: validation.message || '',
																}));
															}}
															className="flex flex-row gap-6"
														>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="yes"
																	id={`${item.key}-yes`}
																/>
																<Label
																	htmlFor={`${item.key}-yes`}
																	className="cursor-pointer px-2"
																>
																	Có
																</Label>
															</div>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="no"
																	id={`${item.key}-no`}
																/>
																<Label
																	htmlFor={`${item.key}-no`}
																	className="cursor-pointer px-2"
																>
																	Không
																</Label>
															</div>
														</RadioGroup>
													</div>
												))}

												{formData.personalHistory.otherDisease === 'yes' && (
													<div className="space-y-2">
														<Label htmlFor="otherDiseaseName">
															Ghi rõ bệnh khác
														</Label>
														<Textarea
															id="otherDiseaseName"
															value={formData.personalHistory.otherDiseaseName}
															onChange={(e) => {
																setFormData({
																	...formData,
																	personalHistory: {
																		...formData.personalHistory,
																		otherDiseaseName: e.target.value,
																	},
																});
																if (errors.otherDiseaseName) {
																	setErrors({
																		...errors,
																		otherDiseaseName: false,
																	});
																	setErrorMessages({
																		...errorMessages,
																		otherDiseaseName: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'otherDiseaseName',
																	e.target.value,
																	validators.validateOtherDiseaseDetail,
																);
															}}
															placeholder="Nhập tên bệnh khác"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.otherDiseaseName
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
															rows={3}
														/>
														{errors.otherDiseaseName &&
															errorMessages.otherDiseaseName && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.otherDiseaseName}
																</p>
															)}
													</div>
												)}
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* V. CÂU HỎI KHÁC */}
									<AccordionItem value="section5">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>V. CÂU HỎI KHÁC</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-4 pt-2">
												<div className="space-y-2">
													<Label>
														a) Ông (bà) có đang điều trị bệnh gì không?
													</Label>
													<RadioGroup
														value={formData.currentTreatment}
														onValueChange={(value) => {
															setFormData({
																...formData,
																currentTreatment: value as 'yes' | 'no',
															});
															// Validate ngay khi thay đổi
															const validation =
																validators.validateCurrentTreatment(value);
															setErrors((prevErrors) => ({
																...prevErrors,
																currentTreatment: !validation.isValid,
															}));
															setErrorMessages((prevMessages) => ({
																...prevMessages,
																currentTreatment: validation.isValid
																	? ''
																	: validation.message || '',
															}));
														}}
														className="flex flex-row gap-6"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="yes" id="treatment-yes" />
															<Label
																htmlFor="treatment-yes"
																className="cursor-pointer px-2"
															>
																Có
															</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="no" id="treatment-no" />
															<Label
																htmlFor="treatment-no"
																className="cursor-pointer px-2"
															>
																Không
															</Label>
														</div>
													</RadioGroup>
												</div>

												{formData.currentTreatment === 'yes' && (
													<>
														<div className="space-y-2">
															<Label htmlFor="currentMedications">
																Liệt kê thuốc và liều lượng đang dùng
															</Label>
															<Textarea
																id="currentMedications"
																value={formData.currentMedications}
																onChange={(e) => {
																	setFormData({
																		...formData,
																		currentMedications: e.target.value,
																	});
																	if (errors.currentMedications) {
																		setErrors({
																			...errors,
																			currentMedications: false,
																		});
																		setErrorMessages({
																			...errorMessages,
																			currentMedications: '',
																		});
																	}
																}}
																onBlur={(e) => {
																	validateFieldOnBlur(
																		'currentMedications',
																		e.target.value,
																		validators.validateMedicationDetail,
																	);
																}}
																placeholder="Nhập tên các thuốc đang dùng"
																className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																	errors.currentMedications
																		? 'border-red-500 bg-red-50'
																		: ''
																}`}
																rows={3}
															/>
															{errors.currentMedications &&
																errorMessages.currentMedications && (
																	<p className="text-sm text-red-500 mt-1">
																		{errorMessages.currentMedications}
																	</p>
																)}
														</div>
													</>
												)}

												<div className="space-y-2">
													<Label>b) Tiền sử thai sản (Đối với phụ nữ)</Label>
													<RadioGroup
														value={formData.hasPregnancyHistory}
														onValueChange={(value) => {
															setFormData({
																...formData,
																hasPregnancyHistory: value as 'yes' | 'no',
															});
															// Validate ngay khi thay đổi
															const validation =
																validators.validatePregnancyHistory(value);
															setErrors((prevErrors) => ({
																...prevErrors,
																hasPregnancyHistory: !validation.isValid,
															}));
															setErrorMessages((prevMessages) => ({
																...prevMessages,
																hasPregnancyHistory: validation.isValid
																	? ''
																	: validation.message || '',
															}));
														}}
														className="flex flex-row gap-6"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="yes" id="pregnancy-yes" />
															<Label
																htmlFor="pregnancy-yes"
																className="cursor-pointer px-2"
															>
																Có
															</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="no" id="pregnancy-no" />
															<Label
																htmlFor="pregnancy-no"
																className="cursor-pointer px-2"
															>
																Không
															</Label>
														</div>
													</RadioGroup>
												</div>

												{formData.hasPregnancyHistory === 'yes' && (
													<div className="space-y-2">
														<Label htmlFor="pregnancyHistory">
															Mô tả tiền sử thai sản
														</Label>
														<Textarea
															id="pregnancyHistory"
															value={formData.pregnancyHistory}
															onChange={(e) => {
																setFormData({
																	...formData,
																	pregnancyHistory: e.target.value,
																});
																if (errors.pregnancyHistory) {
																	setErrors({
																		...errors,
																		pregnancyHistory: false,
																	});
																	setErrorMessages({
																		...errorMessages,
																		pregnancyHistory: '',
																	});
																}
															}}
															onBlur={(e) => {
																validateFieldOnBlur(
																	'pregnancyHistory',
																	e.target.value,
																	validators.validatePregnancyDetail,
																);
															}}
															placeholder="Mô tả tiền sử thai sản"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.pregnancyHistory
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
															rows={3}
														/>
														{errors.pregnancyHistory &&
															errorMessages.pregnancyHistory && (
																<p className="text-sm text-red-500 mt-1">
																	{errorMessages.pregnancyHistory}
																</p>
															)}
													</div>
												)}
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>

								{/* Submit Button */}
								<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
									<Button
										type="submit"
										disabled={isSubmitting}
										className={`w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg ${
											isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
										}`}
									>
										{isSubmitting ? (
											<>
												<Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
												Đang xử lý...
											</>
										) : (
											<>
												<Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
												Đặt lịch khám
											</>
										)}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</motion.div>

				{/* Dialog xem chi tiết ảnh */}
				<Dialog
					open={selectedImageDialog !== null}
					onOpenChange={(open) => {
						if (!open) setSelectedImageDialog(null);
					}}
				>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
						{selectedImageDialog && (
							<div>
								<img
									src={selectedImageDialog}
									alt="Chi tiết dịch vụ"
									className="w-full h-auto rounded-lg"
								/>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
