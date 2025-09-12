import { Router } from 'express';
const expressValidator = require('express-validator');
const { body, query, param } = expressValidator;
import schoolController from '../controllers/schoolController';
import { protect } from '../middleware/auth';

const router = Router();

// Validation middleware
const schoolRegistrationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('School name must be between 2 and 200 characters'),
  body('type')
    .isIn(['primary', 'secondary', 'higher_secondary', 'college', 'university'])
    .withMessage('Invalid school type'),
  body('board')
    .isIn(['PSEB', 'CBSE', 'ICSE', 'Other'])
    .withMessage('Invalid board type'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.district')
    .isIn([
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
      'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
      'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
      'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
    ])
    .withMessage('Invalid Punjab district'),
  body('address.pincode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Pincode must be 6 digits'),
  body('contact.phone')
    .isMobilePhone('en-IN')
    .withMessage('Invalid Indian phone number'),
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('administration.principal.name')
    .trim()
    .notEmpty()
    .withMessage('Principal name is required'),
  body('administration.principal.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Principal email is required'),
  body('administration.principal.phone')
    .isMobilePhone('en-IN')
    .withMessage('Invalid principal phone number'),
  body('infrastructure.totalStudents')
    .isInt({ min: 1 })
    .withMessage('Total students must be at least 1'),
  body('infrastructure.totalTeachers')
    .isInt({ min: 1 })
    .withMessage('Total teachers must be at least 1'),
  body('infrastructure.buildingFloors')
    .isInt({ min: 1 })
    .withMessage('Building floors must be at least 1'),
  body('infrastructure.evacuationRoutes')
    .isInt({ min: 1 })
    .withMessage('At least 1 evacuation route is required'),
  body('infrastructure.assemblyPoints')
    .isInt({ min: 1 })
    .withMessage('At least 1 assembly point is required')
];

const schoolUpdateValidation = [
  body('contact.phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Invalid Indian phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('infrastructure.totalStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total students must be at least 1'),
  body('infrastructure.totalTeachers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total teachers must be at least 1'),
  body('preparedness.drillFrequency')
    .optional()
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid drill frequency'),
  body('preparedness.equipmentStatus')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid equipment status'),
  body('preparedness.staffTrainingLevel')
    .optional()
    .isIn(['basic', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid staff training level')
];

const documentUploadValidation = [
  body('type')
    .isIn(['registration', 'noc', 'building_plan', 'safety_certificate'])
    .withMessage('Invalid document type'),
  body('url')
    .isURL()
    .withMessage('Invalid document URL')
];

const coordinatesValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn([
      'name', 'createdAt', 'preparedness.overallScore', 
      'infrastructure.totalStudents', 'address.district'
    ])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc')
];

// Public routes
router.post('/register', schoolRegistrationValidation, schoolController.registerSchool);
router.get('/', paginationValidation, schoolController.getSchools);
router.get('/stats/district', schoolController.getDistrictStats);
router.get('/nearby', coordinatesValidation, schoolController.findNearbySchools);
router.get('/:id', param('id').isMongoId().withMessage('Invalid school ID'), schoolController.getSchoolById);

// Protected routes
router.use(protect); // All routes below require authentication

// School admin routes
router.put('/:id', 
  param('id').isMongoId().withMessage('Invalid school ID'),
  schoolUpdateValidation, 
  schoolController.updateSchool
);

router.post('/:id/documents',
  param('id').isMongoId().withMessage('Invalid school ID'),
  documentUploadValidation,
  schoolController.uploadDocuments
);

router.get('/:id/analytics',
  param('id').isMongoId().withMessage('Invalid school ID'),
  schoolController.getSchoolAnalytics
);

// Admin only routes
router.post('/:id/verify',
  param('id').isMongoId().withMessage('Invalid school ID'),
  schoolController.verifySchool
);

export default router;
