// Utility function to format the date from Google Apps Script format
export const formatSensorDate = (dateString: string | undefined): string => {
  if (!dateString || dateString === 'N/A') return 'Unknown';
  
  // Handle different date formats
  let formattedDate: string;
  
  // Convert format from "2025-09-01_16:21:38" to "2025-09-01T16:21:38"
  if (dateString.includes('_')) {
    formattedDate = dateString.replace('_', 'T');
  } else {
    // If it's already in ISO format or another format, use as is
    formattedDate = dateString;
  }
  
  try {
    // First attempt: standard parsing
    let date = new Date(formattedDate);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // Second attempt: try alternative format
      const parts = dateString.split(/[_\s\-:]/g).filter(Boolean);
      if (parts.length >= 6) {
        // Assuming format like YYYY-MM-DD_HH:MM:SS or similar
        const [year, month, day, hour, minute, second] = parts;
        date = new Date(
          parseInt(year), 
          parseInt(month) - 1, // Month is 0-indexed in JavaScript
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        );
        if (!isNaN(date.getTime())) {
          return formatTimeAgo(date);
        }
      }
      
      // Third attempt: try to parse as MM/DD/YYYY format
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
          if (!isNaN(date.getTime())) {
            return formatTimeAgo(date);
          }
        }
      }
      
      console.error(`Failed to parse date: ${dateString}`);
      return 'Unknown'; // Return Unknown if all parsing fails
    }
    return formatTimeAgo(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown'; // Return Unknown if parsing fails
  }
};

// Helper function to format time in a user-friendly "X time ago" format
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Updated just now';
  } else if (diffMins < 60) {
    return `Updated ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `Updated ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `Updated ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    // For older dates, return the formatted date
    return `Updated on ${date.toLocaleDateString()}`;
  }
};
