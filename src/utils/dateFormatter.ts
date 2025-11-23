import { format, type Locale } from 'date-fns';
import { enUS, hi as hiIN } from 'date-fns/locale';

// Kannada locale is not available in date-fns, so we'll use English as fallback
// You can create a custom locale if needed
const locales: Record<string, Locale> = {
    en: enUS,
    hi: hiIN,
    kn: enUS // Fallback to English for Kannada
};

/**
 * Format a date according to the specified locale
 * @param date - The date to format
 * @param locale - The locale code (en, hi, kn)
 * @param formatString - The format string (default: 'PPP' for long date)
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | number,
    locale: string = 'en',
    formatString: string = 'PPP'
): string {
    const dateLocale = locales[locale] || locales.en;
    return format(date, formatString, { locale: dateLocale });
}

/**
 * Format a date and time according to the specified locale
 * @param date - The date to format
 * @param locale - The locale code (en, hi, kn)
 * @returns Formatted date and time string
 */
export function formatDateTime(
    date: Date | number,
    locale: string = 'en'
): string {
    return formatDate(date, locale, 'PPPp');
}

/**
 * Format a relative time (e.g., "2 hours ago")
 * @param date - The date to format
 * @param locale - The locale code (en, hi, kn)
 * @returns Relative time string
 */
export function formatRelativeTime(
    date: Date | number,
    locale: string = 'en'
): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return locale === 'hi' ? 'अभी' : locale === 'kn' ? 'ಇದೀಗ' : 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        if (locale === 'hi') return `${diffInMinutes} मिनट पहले`;
        if (locale === 'kn') return `${diffInMinutes} ನಿಮಿಷಗಳ ಹಿಂದೆ`;
        return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        if (locale === 'hi') return `${diffInHours} घंटे पहले`;
        if (locale === 'kn') return `${diffInHours} ಗಂಟೆಗಳ ಹಿಂದೆ`;
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        if (locale === 'hi') return `${diffInDays} दिन पहले`;
        if (locale === 'kn') return `${diffInDays} ದಿನಗಳ ಹಿಂದೆ`;
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return formatDate(date, locale, 'PP');
}

/**
 * Format a short date (e.g., "Nov 23, 2025")
 * @param date - The date to format
 * @param locale - The locale code (en, hi, kn)
 * @returns Short formatted date string
 */
export function formatShortDate(
    date: Date | number,
    locale: string = 'en'
): string {
    return formatDate(date, locale, 'PP');
}

/**
 * Format time only (e.g., "3:30 PM")
 * @param date - The date to format
 * @param locale - The locale code (en, hi, kn)
 * @returns Formatted time string
 */
export function formatTime(
    date: Date | number,
    locale: string = 'en'
): string {
    return formatDate(date, locale, 'p');
}
