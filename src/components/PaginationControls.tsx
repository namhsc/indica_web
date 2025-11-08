import React from 'react';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
} from './ui/pagination';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	startIndex: number;
	endIndex: number;
	onPageChange: (page: number) => void;
	onItemsPerPageChange?: (itemsPerPage: number) => void;
	itemsPerPageOptions?: number[];
}

export function PaginationControls({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	startIndex,
	endIndex,
	onPageChange,
	onItemsPerPageChange,
	itemsPerPageOptions = [10, 20, 50, 100],
}: PaginationControlsProps) {
	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			// Show all pages if total pages is less than max visible
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage <= 3) {
				// Near the beginning
				for (let i = 2; i <= 4; i++) {
					pages.push(i);
				}
				pages.push('ellipsis');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				// Near the end
				pages.push('ellipsis');
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// In the middle
				pages.push('ellipsis');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('ellipsis');
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (totalPages === 0) {
		return null;
	}

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
			<div className="flex items-center gap-2 text-sm text-gray-600">
				<span>
					Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems} mục
				</span>
				{onItemsPerPageChange && (
					<div className="flex items-center gap-2">
						<span>|</span>
						<span>Số mục/trang:</span>
						<Select
							value={itemsPerPage.toString()}
							onValueChange={(value) =>
								onItemsPerPageChange(parseInt(value, 10))
							}
						>
							<SelectTrigger className="w-20 h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{itemsPerPageOptions.map((option) => (
									<SelectItem key={option} value={option.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (currentPage > 1) {
									onPageChange(currentPage - 1);
								}
							}}
							className={
								currentPage === 1
									? 'pointer-events-none opacity-50'
									: 'cursor-pointer'
							}
						/>
					</PaginationItem>

					{getPageNumbers().map((page, index) => {
						if (page === 'ellipsis') {
							return (
								<PaginationItem key={`ellipsis-${index}`}>
									<PaginationEllipsis />
								</PaginationItem>
							);
						}

						return (
							<PaginationItem key={page}>
								<PaginationLink
									href="#"
									onClick={(e) => {
										e.preventDefault();
										onPageChange(page);
									}}
									isActive={currentPage === page}
									className="cursor-pointer"
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						);
					})}

					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (currentPage < totalPages) {
									onPageChange(currentPage + 1);
								}
							}}
							className={
								currentPage === totalPages
									? 'pointer-events-none opacity-50'
									: 'cursor-pointer'
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

