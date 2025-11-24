// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const API_ENDPOINTS = {
	BOOKINGS: `${API_BASE_URL}/api/bookings`,
};

// Generic API request function
export async function apiRequest<T>(
	url: string,
	options: RequestInit = {}
): Promise<T> {
	const defaultHeaders = {
		'Content-Type': 'application/json',
	};

	const config: RequestInit = {
		...options,
		headers: {
			...defaultHeaders,
			...options.headers,
		},
	};

	try {
		const response = await fetch(url, config);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || `HTTP error! status: ${response.status}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error('API request failed:', error);
		throw error;
	}
}
