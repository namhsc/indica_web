'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerProps {
	date?: Date | string;
	onDateChange?: (date: Date | undefined) => void;
	onStringChange?: (date: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	minDate?: Date;
}

export function DatePicker({
	date,
	onDateChange,
	onStringChange,
	placeholder = 'Chọn ngày...',
	disabled = false,
	className,
	minDate,
}: DatePickerProps) {
	// Convert string to Date if needed
	const dateValue = React.useMemo(() => {
		if (!date) return undefined;
		if (date instanceof Date) return date;
		if (typeof date === 'string') {
			const parsed = new Date(date);
			return isNaN(parsed.getTime()) ? undefined : parsed;
		}
		return undefined;
	}, [date]);

	const handleDateChange = (selectedDate: Date | undefined) => {
		if (onDateChange) {
			onDateChange(selectedDate);
		}
		if (onStringChange) {
			onStringChange(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled}
					className={cn(
						'w-full justify-start text-left font-normal',
						!dateValue && 'text-muted-foreground',
						className,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{dateValue ? (
						format(dateValue, 'dd/MM/yyyy', { locale: vi })
					) : (
						<span>{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={dateValue}
					onSelect={handleDateChange}
					locale={vi}
					initialFocus
					disabled={minDate ? (date) => date < minDate : undefined}
				/>
			</PopoverContent>
		</Popover>
	);
}
