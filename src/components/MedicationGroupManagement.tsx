import React from 'react';
import { CategoryManagement } from './CategoryManagement';
import { MedicationGroup } from '../types';
import { Pill } from 'lucide-react';

interface MedicationGroupManagementProps {
	medicationGroups: MedicationGroup[];
	onCreate: (medicationGroup: Omit<MedicationGroup, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onUpdate: (id: string, medicationGroup: Partial<MedicationGroup>) => void;
	onDelete: (id: string) => void;
}

export function MedicationGroupManagement({
	medicationGroups,
	onCreate,
	onUpdate,
	onDelete,
}: MedicationGroupManagementProps) {
	return (
		<CategoryManagement
			title="Quản lý Nhóm thuốc"
			icon={<Pill className="h-5 w-5" />}
			categories={medicationGroups}
			onCreate={onCreate}
			onUpdate={onUpdate}
			onDelete={onDelete}
		/>
	);
}

