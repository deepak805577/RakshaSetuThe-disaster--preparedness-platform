import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Extend Express Request type to include files property
interface FileUploadRequest extends Request {
  files?: any;
}

// Rate limiting configurations for different endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 API requests per minute
  message: 'API rate limit exceeded, please slow down your requests.',
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 upload requests per hour
  message: 'Upload limit exceeded, please try again later.',
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// MongoDB injection prevention - Custom implementation to avoid compatibility issues
export const mongoSanitizeConfig = (req: Request, res: Response, next: NextFunction) => {
  // Function to recursively sanitize an object
  const sanitize = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
      for (const key in sanitized) {
        if (/^\$/.test(key)) {
          delete sanitized[key];
          console.warn(`Potential NoSQL injection attempt blocked: ${key}`);
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = sanitize(sanitized[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize body only (query and params are read-only in newer Express)
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  // Check query and params for injection attempts without modifying them
  const checkForInjection = (obj: any): boolean => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (/^\$/.test(key)) {
          console.warn(`NoSQL injection attempt detected in request: ${key}`);
          return true;
        }
        if (typeof obj[key] === 'object') {
          if (checkForInjection(obj[key])) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  if (checkForInjection(req.query) || checkForInjection(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request parameters'
    });
  }
  
  next();
};

// XSS Protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Only sanitize request body (query and params are read-only in newer Express)
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // For query and params, we just check for XSS patterns without modifying
  const checkForXSS = (obj: any): boolean => {
    if (typeof obj === 'string') {
      if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(obj) ||
          /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi.test(obj) ||
          /javascript:/gi.test(obj) ||
          /on\w+\s*=/gi.test(obj)) {
        return true;
      }
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (checkForXSS(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (checkForXSS(req.query) || checkForXSS(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Potential XSS attack detected in request'
    });
  }
  
  next();
};

// Helper function to sanitize objects recursively
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Remove dangerous HTML/JS patterns
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  } else if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

// Audit logging middleware
interface AuditLog {
  timestamp: Date;
  userId?: string;
  ip: string;
  method: string;
  path: string;
  statusCode?: number;
  userAgent?: string;
  action: string;
  details?: any;
}

const auditLogPath = path.join(__dirname, '../../logs/audit.log');

// Ensure logs directory exists
const logsDir = path.dirname(auditLogPath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const auditLogger = (action: string, includeBody: boolean = false) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Capture original send function
    const originalSend = res.send;
    
    res.send = function(data): Response {
      res.locals.responseData = data;
      
      const auditLog: AuditLog = {
        timestamp: new Date(),
        userId: req.user?.id,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent'),
        action,
        details: {
          duration: Date.now() - startTime,
          query: req.query,
          params: req.params,
        }
      };
      
      if (includeBody && req.body) {
        // Don't log sensitive fields
        const { password, ...safeBody } = req.body;
        auditLog.details.body = safeBody;
      }
      
      // Write to audit log file
      fs.appendFile(
        auditLogPath,
        JSON.stringify(auditLog) + '\n',
        (err) => {
          if (err) {
            console.error('Failed to write audit log:', err);
          }
        }
      );
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// File upload security middleware
export const fileUploadSecurity = (req: FileUploadRequest, res: Response, next: NextFunction) => {
  if (!req.files) {
    return next();
  }
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/json',
    'text/csv',
  ];
  
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  
  const files = Array.isArray(req.files) ? req.files : [req.files];
  
  for (const file of files) {
    // Check file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`
      });
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: `File too large: ${file.name}. Maximum size: ${maxFileSize / 1024 / 1024}MB`
      });
    }
    
    // Check for malicious file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.dll'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (dangerousExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `Dangerous file type detected: ${fileExtension}`
      });
    }
  }
  
  next();
};

// CSRF Protection token generator
export const generateCSRFToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// CSRF Protection middleware
export const csrfProtection = (req: Request & { session?: any }, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};

// SQL Injection Prevention (for any SQL queries if used)
export const sqlInjectionPrevention = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
    /(--|\||;|\/\*|\*\/)/g,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
  ];
  
  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Check all request inputs
  const inputs = [
    ...Object.values(req.body || {}),
    ...Object.values(req.query || {}),
    ...Object.values(req.params || {}),
  ];
  
  for (const input of inputs) {
    if (checkForSQLInjection(input)) {
      console.warn(`Potential SQL injection attempt from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected'
      });
    }
  }
  
  next();
};

// IP Whitelist/Blacklist middleware
const blacklistedIPs: Set<string> = new Set();
const whitelistedIPs: Set<string> = new Set();

export const ipFilter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || '';
  
  // Check whitelist first (if not empty)
  if (whitelistedIPs.size > 0 && !whitelistedIPs.has(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Check blacklist
  if (blacklistedIPs.has(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Add IP to blacklist
export const blacklistIP = (ip: string) => {
  blacklistedIPs.add(ip);
  console.log(`IP ${ip} has been blacklisted`);
};

// Remove IP from blacklist
export const unblacklistIP = (ip: string) => {
  blacklistedIPs.delete(ip);
  console.log(`IP ${ip} has been removed from blacklist`);
};

// Session security configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const, // CSRF protection
  },
  name: 'sessionId', // Don't use default name
};

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map((detail: any) => detail.message)
      });
    }
    
    next();
  };
};

// Export all security middlewares as a combined middleware
export const securityMiddleware = [
  helmetConfig,
  mongoSanitizeConfig,
  xssProtection,
  generalLimiter,
];

export default {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  helmetConfig,
  mongoSanitizeConfig,
  xssProtection,
  auditLogger,
  fileUploadSecurity,
  csrfProtection,
  sqlInjectionPrevention,
  ipFilter,
  blacklistIP,
  unblacklistIP,
  sessionConfig,
  validateRequest,
  securityMiddleware,
};
