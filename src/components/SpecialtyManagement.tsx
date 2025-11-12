import React from 'react';
import { CategoryManagement } from './CategoryManagement';
import { Specialty } from '../types';
import { Stethoscope } from 'lucide-react';

interface SpecialtyManagementProps {
	specialties: Specialty[];
	onCreate: (specialty: Omit<Specialty, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onUpdate: (id: string, specialty: Partial<Specialty>) => void;
	onDelete: (id: string) => void;
}

export function SpecialtyManagement({
	specialties,
	onCreate,
	onUpdate,
	onDelete,
}: SpecialtyManagementProps) {
	return (
		<CategoryManagement
			title="Quản lý Chuyên khoa"
			icon={<Stethoscope className="h-5 w-5" />}
			categories={specialties}
			onCreate={onCreate}
			onUpdate={onUpdate}
			onDelete={onDelete}
		/>
	);
}

