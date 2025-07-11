/**
 * Security configuration for the application
 */

// Environment validation
const validateEnvironment = () => {
  const requiredEnvVars = ['REACT_APP_API_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate environment on module load
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

// Security configuration
export const securityConfig = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  
  // File upload restrictions
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  
  // Content Security Policy headers (for production)
  cspDirectives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
  
  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
};

// File validation utility
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > securityConfig.maxFileSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${securityConfig.maxFileSize / (1024 * 1024)}MB`
    };
  }
  
  // Check file type
  if (!securityConfig.allowedFileTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${securityConfig.allowedFileTypes.join(', ')}`
    };
  }
  
  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,           // Path traversal
    /[<>:"\\|?*]/,    // Invalid filename characters
    /^\./,            // Hidden files
    /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i  // Executable files
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        isValid: false,
        error: 'File name contains suspicious characters or patterns'
      };
    }
  }
  
  return { isValid: true };
};

// Sanitise user input
export const sanitiseInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
};

// Generate secure headers for API requests
export const getSecureHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...securityConfig.securityHeaders
  };
};

export default securityConfig;
