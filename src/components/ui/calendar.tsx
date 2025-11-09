'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from './utils';
import { buttonVariants } from './button';

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn('p-3 bg-white', className)}
			classNames={{
				months: 'flex flex-col sm:flex-row gap-2',
				month: 'flex flex-col gap-4',
				caption: 'flex justify-center pt-1 relative items-center w-full mb-2',
				caption_label: 'text-sm font-semibold text-gray-800',
				nav: 'flex items-center gap-1',
				nav_button: cn(
					'h-7 w-7 rounded-md flex items-center justify-center transition-colors',
				),
				nav_button_previous:
					'absolute left-1 bg-blue-600 text-white hover:bg-blue-700',
				nav_button_next:
					'absolute right-1 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
				table: 'w-full border-collapse',
				head_row: 'flex mb-1',
				head_cell:
					'text-gray-700 rounded-md w-9 h-9 font-normal text-xs flex items-center justify-center',
				row: 'flex w-full mt-1',
				cell: cn(
					'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-9 h-9',
					props.mode === 'range'
						? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md'
						: '',
				),
				day: cn(
					'h-9 w-9 p-0 font-normal rounded-full flex items-center justify-center transition-colors',
					'hover:bg-gray-100',
					'aria-selected:opacity-100',
					'text-gray-800',
				),
				day_range_start:
					'day-range-start aria-selected:bg-blue-600 aria-selected:text-white',
				day_range_end:
					'day-range-end aria-selected:bg-blue-600 aria-selected:text-white',
				day_selected:
					'bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-full',
				day_today: 'text-gray-800 font-medium',
				day_outside:
					'text-gray-400 aria-selected:text-gray-400 aria-selected:bg-transparent',
				day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed',
				day_range_middle:
					'aria-selected:bg-blue-100 aria-selected:text-blue-600',
				day_hidden: 'invisible',
				...classNames,
			}}
			components={{
				IconLeft: ({ className, ...props }) => (
					<ChevronLeft className={cn('h-4 w-4', className)} {...props} />
				),
				IconRight: ({ className, ...props }) => (
					<ChevronRight className={cn('h-4 w-4', className)} {...props} />
				),
			}}
			{...props}
		/>
	);
}

export { Calendar };
