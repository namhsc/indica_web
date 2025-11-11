import { useState, useMemo, useEffect } from 'react';

interface UsePaginationProps<T> {
	data: T[];
	itemsPerPage?: number;
}

export function usePagination<T>({
	data,
	itemsPerPage = 10,
}: UsePaginationProps<T>) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(data.length / itemsPerPage);

	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return data.slice(startIndex, endIndex);
	}, [data, currentPage, itemsPerPage]);

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const nextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const previousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const goToFirstPage = () => {
		setCurrentPage(1);
	};

	const goToLastPage = () => {
		setCurrentPage(totalPages);
	};

	// Reset to page 1 when data changes
	useEffect(() => {
		setCurrentPage(1);
	}, [data.length]);

	return {
		currentPage,
		totalPages,
		paginatedData,
		itemsPerPage,
		totalItems: data.length,
		startIndex: (currentPage - 1) * itemsPerPage + 1,
		endIndex: Math.min(currentPage * itemsPerPage, data.length),
		goToPage,
		nextPage,
		previousPage,
		goToFirstPage,
		goToLastPage,
	};
}
