export function getLanguageShortForm(languages: string[]): string {
    // Remove duplicates and case sensitivity
    const uniqueLanguages = Array.from(new Set(
        languages.map(lang => lang.toLowerCase())
    )).map(lang => {
        // Convert back to proper case
        return lang.charAt(0).toUpperCase() + lang.slice(1);
    });

    if (uniqueLanguages.length === 0) return '';
    if (uniqueLanguages.length === 1) return uniqueLanguages[0];
    if (uniqueLanguages.length > 3) return 'MULTI';

    // Get first 3 letters of each language and join with +
    return uniqueLanguages
        .map(lang => lang.slice(0, 3))
        .join('+');
}

// Example usage:
// getLanguageShortForm(['Hindi', 'hindi', 'Bengali']) => 'Hin+Ben'
// getLanguageShortForm(['Hindi', 'Bengali', 'English']) => 'Hin+Ben+Eng'
// getLanguageShortForm(['Hindi', 'Bengali', 'English', 'Tamil']) => 'MULTI' 