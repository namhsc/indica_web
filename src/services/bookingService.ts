import { API_ENDPOINTS, apiRequest } from './api';

// Types for Frontend Form Data
interface PersonalHistory {
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
}

export interface BookingFormData {
	// I. THÔNG TIN CÁ NHÂN
	fullName: string;
	gender: 'male' | 'female' | '';
	yearOfBirth: string;
	cccdNumber: string;
	cccdIssueDate: string;
	cccdIssuePlace: string;
	permanentAddress: string;
	currentAddress: string;
	workplace: string;
	department: string;
	reason: string;
	phoneNumber: string;

	// II. DỊCH VỤ KHÁM
	selectedServices: string[];

	// III. TIỀN SỬ GIA ĐÌNH
	familyHasDisease: 'yes' | 'no' | '';
	familyDiseaseName: string;

	// IV. TIỀN SỬ BẢN THÂN
	personalHistory: PersonalHistory;

	// V. CÂU HỎI KHÁC
	currentTreatment: 'yes' | 'no' | '';
	currentMedications: string;
	hasPregnancyHistory: 'yes' | 'no' | '';
	pregnancyHistory: string;
}

// Type for Backend DTO
export interface BookingRequestDTO {
	// I. THÔNG TIN CÁ NHÂN
	fullName: string;
	gender: 'MALE' | 'FEMALE';
	yearOfBirth: number;
	cccdNumber: string;
	cccdIssueDate: string; // Format: YYYY-MM-DD
	cccdIssuePlace: string;
	permanentAddress: string;
	currentAddress: string;
	workplace: string;
	department: string;
	reason: string;
	phoneNumber: string;

	// II. DỊCH VỤ KHÁM
	serviceIds: number[];

	// III. TIỀN SỬ GIA ĐÌNH
	familyHistory: boolean;
	familyHistoryDetail?: string;

	// IV. TIỀN SỬ BẢN THÂN
	diseaseInjury5Years: boolean;
	neurologicalDisease: boolean;
	eyeDisease: boolean;
	earDisease: boolean;
	heartDisease: boolean;
	heartSurgery: boolean;
	hypertension: boolean;
	dyspnea: boolean;
	lungDisease: boolean;
	kidneyDisease: boolean;
	alcoholAddiction: boolean;
	diabetes: boolean;
	mentalIllness: boolean;
	lossOfConsciousness: boolean;
	fainting: boolean;
	digestiveDisease: boolean;
	sleepDisorder: boolean;
	stroke: boolean;
	spineDisease: boolean;
	regularAlcohol: boolean;
	drugUse: boolean;
	otherDisease: boolean;
	otherDiseaseDetail?: string;

	// V. CÂU HỎI KHÁC
	treatment: boolean;
	treatmentDetail?: string;
	pregnancy: boolean;
	pregnancyDetail?: string;
}

export interface BookingResponseDTO {
	id: number;
	fullName: string;
	gender: string;
	yearOfBirth: number;
	phoneNumber: string;
	status: string;
	createdAt: string;
	// ... other fields as needed
}

/**
 * Transform frontend form data to backend DTO format
 */
export function transformBookingData(
	formData: BookingFormData
): BookingRequestDTO {
	// Parse date from dd/mm/yyyy to yyyy-mm-dd
	const parseDateToISO = (dateString: string): string => {
		const [day, month, year] = dateString.split('/');
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	};

	// Convert service IDs from string to number
	const serviceIds = formData.selectedServices.map((id) => {
		// If services are stored as "hp_test", "thinprep_test", map them to IDs
		const serviceIdMap: Record<string, number> = {
			hp_test: 1,
			thinprep_test: 2,
		};
		return serviceIdMap[id] || parseInt(id);
	});

	const dto: BookingRequestDTO = {
		// I. THÔNG TIN CÁ NHÂN
		fullName: formData.fullName,
		gender: formData.gender === 'male' ? 'MALE' : 'FEMALE',
		yearOfBirth: parseInt(formData.yearOfBirth),
		cccdNumber: formData.cccdNumber,
		cccdIssueDate: parseDateToISO(formData.cccdIssueDate),
		cccdIssuePlace: formData.cccdIssuePlace,
		permanentAddress: formData.permanentAddress,
		currentAddress: formData.currentAddress,
		workplace: formData.workplace,
		department: formData.department,
		reason: formData.reason,
		phoneNumber: formData.phoneNumber,

		// II. DỊCH VỤ KHÁM
		serviceIds: serviceIds,

		// III. TIỀN SỬ GIA ĐÌNH
		familyHistory: formData.familyHasDisease === 'yes',
		familyHistoryDetail:
			formData.familyHasDisease === 'yes'
				? formData.familyDiseaseName
				: undefined,

		// IV. TIỀN SỬ BẢN THÂN
		diseaseInjury5Years: formData.personalHistory.diseaseInjury5Years === 'yes',
		neurologicalDisease: formData.personalHistory.neurologicalDisease === 'yes',
		eyeDisease: formData.personalHistory.eyeDisease === 'yes',
		earDisease: formData.personalHistory.earDisease === 'yes',
		heartDisease: formData.personalHistory.heartDisease === 'yes',
		heartSurgery: formData.personalHistory.heartSurgery === 'yes',
		hypertension: formData.personalHistory.hypertension === 'yes',
		dyspnea: formData.personalHistory.dyspnea === 'yes',
		lungDisease: formData.personalHistory.lungDisease === 'yes',
		kidneyDisease: formData.personalHistory.kidneyDisease === 'yes',
		alcoholAddiction: formData.personalHistory.alcoholAddiction === 'yes',
		diabetes: formData.personalHistory.diabetes === 'yes',
		mentalIllness: formData.personalHistory.mentalIllness === 'yes',
		lossOfConsciousness: formData.personalHistory.lossOfConsciousness === 'yes',
		fainting: formData.personalHistory.fainting === 'yes',
		digestiveDisease: formData.personalHistory.digestiveDisease === 'yes',
		sleepDisorder: formData.personalHistory.sleepDisorder === 'yes',
		stroke: formData.personalHistory.stroke === 'yes',
		spineDisease: formData.personalHistory.spineDisease === 'yes',
		regularAlcohol: formData.personalHistory.regularAlcohol === 'yes',
		drugUse: formData.personalHistory.drugUse === 'yes',
		otherDisease: formData.personalHistory.otherDisease === 'yes',
		otherDiseaseDetail:
			formData.personalHistory.otherDisease === 'yes'
				? formData.personalHistory.otherDiseaseName
				: undefined,

		// V. CÂU HỎI KHÁC
		treatment: formData.currentTreatment === 'yes',
		treatmentDetail:
			formData.currentTreatment === 'yes'
				? formData.currentMedications
				: undefined,
		pregnancy: formData.hasPregnancyHistory === 'yes',
		pregnancyDetail:
			formData.hasPregnancyHistory === 'yes'
				? formData.pregnancyHistory
				: undefined,
	};

	return dto;
}

/**
 * Create a new booking
 */
export async function createBooking(
	formData: BookingFormData
): Promise<BookingResponseDTO> {
	const bookingDTO = transformBookingData(formData);

	return apiRequest<BookingResponseDTO>(API_ENDPOINTS.BOOKINGS, {
		method: 'POST',
		body: JSON.stringify(bookingDTO),
	});
}

/**
 * Get booking by ID
 */
export async function getBookingById(
	id: number
): Promise<BookingResponseDTO> {
	return apiRequest<BookingResponseDTO>(`${API_ENDPOINTS.BOOKINGS}/${id}`, {
		method: 'GET',
	});
}

/**
 * Get all bookings
 */
export async function getAllBookings(): Promise<BookingResponseDTO[]> {
	return apiRequest<BookingResponseDTO[]>(API_ENDPOINTS.BOOKINGS, {
		method: 'GET',
	});
}

/**
 * Get bookings by phone number
 */
export async function getBookingsByPhoneNumber(
	phoneNumber: string
): Promise<BookingResponseDTO[]> {
	return apiRequest<BookingResponseDTO[]>(
		`${API_ENDPOINTS.BOOKINGS}/phone/${phoneNumber}`,
		{
			method: 'GET',
		}
	);
}
