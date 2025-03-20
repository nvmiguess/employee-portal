// Whitelist configuration
const ALLOWED_EMAIL_DOMAINS = [
  // Add your allowed domains here
  'example.com',
  'company.com'
];

const ALLOWED_EMAIL_ADDRESSES = [
  // Add specific email addresses here
  'user1@gmail.com',
  'user2@outlook.com'
];

export function isEmailAllowed(email: string): { allowed: boolean; reason?: string } {
  if (!email) {
    return { allowed: false, reason: 'No email provided' };
  }

  // Check if the exact email is in the whitelist
  if (ALLOWED_EMAIL_ADDRESSES.includes(email.toLowerCase())) {
    return { allowed: true };
  }

  // Check if the email domain is in the whitelist
  const domain = email.split('@')[1]?.toLowerCase();
  if (ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return { allowed: true };
  }

  return { 
    allowed: false, 
    reason: 'This email domain is not authorized. Please use your company email address.'
  };
}

// Function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 