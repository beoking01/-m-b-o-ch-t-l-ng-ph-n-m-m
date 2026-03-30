// src/utils/date.ts
// Helper to format a date as dd/mm/yyyy

export type DateInput = string | number | Date | null | undefined;

/**
 * Format a date-like value to dd/mm/yyyy.
 * - Uses UTC by default to avoid timezone off-by-one issues with ISO strings (e.g., 2027-03-10T00:00:00.000Z).
 * - Returns a placeholder when the input cannot be parsed.
 */
export function formatDateDDMMYYYY(
    input: DateInput,
    options: { useUTC?: boolean; placeholder?: string } = {}
): string {
    const { useUTC = true, placeholder = '-' } = options;

    if (input === null || input === undefined || input === '') return placeholder;

    const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
    if (isNaN(date.getTime())) return placeholder;

    const day = useUTC ? date.getUTCDate() : date.getDate();
    const month = (useUTC ? date.getUTCMonth() : date.getMonth()) + 1;
    const year = useUTC ? date.getUTCFullYear() : date.getFullYear();

    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yyyy = String(year);

    return `${dd}/${mm}/${yyyy}`;
}

/**
 * Try to parse a date safely. Returns Date or null.
 */
export function toDate(input: DateInput): Date | null {
    if (input === null || input === undefined || input === '') return null;
    const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
    return isNaN(date.getTime()) ? null : date;
}

// Example usage:
// import { formatDateDDMMYYYY } from '@/utils/date';
// const formatted = formatDateDDMMYYYY('2027-03-10T00:00:00.000Z'); // "10/03/2027"
