import { useState, useCallback } from 'react';

export interface TreatmentProgressData {
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
}

export function useTreatmentProgress() {
	const [treatmentProgress, setTreatmentProgress] = useState<
		Record<string, any[]>
	>({});

	const handleAddTreatmentProgress = useCallback(
		(progress: TreatmentProgressData) => {
			// If medicationId is provided, store as medication-specific progress
			// Otherwise, store as daily update (general progress for the day)
			const key = progress.medicationId
				? `${progress.treatmentPlanId}_${progress.medicationId}`
				: `${progress.treatmentPlanId}_daily_${progress.date}`;

			setTreatmentProgress((prev) => {
				const existingProgress = prev[key] || [];

				// Check if progress for this date already exists
				const existingIndex = existingProgress.findIndex(
					(p) => p.date === progress.date,
				);

				const newProgress = {
					id: `progress_${Date.now()}`,
					...progress,
					createdAt: new Date().toISOString(),
				};

				if (existingIndex >= 0) {
					// Update existing progress
					existingProgress[existingIndex] = newProgress;
				} else {
					// Add new progress
					existingProgress.push(newProgress);
				}

				return {
					...prev,
					[key]: existingProgress,
				};
			});
		},
		[],
	);

	return {
		treatmentProgress,
		handleAddTreatmentProgress,
	};
}

