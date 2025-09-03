/**
 * Formats a date string (YYYY-MM-DD) into a more readable format in Spanish.
 * Example: '2025-09-04' => 'jueves, 4 de septiembre'
 * The component using it has a 'capitalize' className, so we don't need to capitalize here.
 * @param dateString The date string in 'YYYY-MM-DD' format.
 * @returns A formatted date string.
 */
export const getFormattedDate = (dateString: string): string => {
  // Use T00:00:00 to ensure the date is parsed in the local timezone,
  // preventing off-by-one day errors when the user's timezone is west of UTC.
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date); // Example: "jueves, 4 de septiembre"
};
