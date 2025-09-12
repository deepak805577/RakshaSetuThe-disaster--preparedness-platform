import mongoose, { Schema, Document } from 'mongoose';

// Punjab Districts enum
const PUNJAB_DISTRICTS = [
  'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
  'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
  'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
  'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
];

export interface ISchool {
  name: string;
  code: string; // Unique school identifier
  type: 'primary' | 'secondary' | 'higher_secondary' | 'college' | 'university';
  board: 'PSEB' | 'CBSE' | 'ICSE' | 'Other';
  address: {
    street: string;
    city: string;
    district: typeof PUNJAB_DISTRICTS[number];
    pincode: string;
    state: 'Punjab';
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  administration: {
    principal: {
      name: string;
      email: string;
      phone: string;
    };
    disasterCoordinator?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  infrastructure: {
    totalStudents: number;
    totalTeachers: number;
    totalStaff: number;
    buildingFloors: number;
    hasBasement: boolean;
    evacuationRoutes: number;
    assemblyPoints: number;
    hasPlayground: boolean;
    campusArea?: number; // in sqft
    buildingAge?: number; // years
  };
  hazardProfile: {
    floodRisk: 'low' | 'medium' | 'high' | 'critical';
    earthquakeRisk: 'low' | 'medium' | 'high' | 'critical';
    fireRisk: 'low' | 'medium' | 'high' | 'critical';
    cycloneRisk: 'low' | 'medium' | 'high' | 'critical';
    industrialRisk: 'low' | 'medium' | 'high' | 'critical';
    lastAssessment?: Date;
  };
  preparedness: {
    overallScore: number; // 0-100
    lastDrillDate?: Date;
    drillFrequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    equipmentStatus: 'excellent' | 'good' | 'fair' | 'poor';
    staffTrainingLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    studentParticipation: number; // percentage
  };
  verification: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: Date;
    documents: Array<{
      type: 'registration' | 'noc' | 'building_plan' | 'safety_certificate';
      url: string;
      uploadedAt: Date;
    }>;
  };
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    isActive: boolean;
    expiresAt?: Date;
    features: string[];
  };
  settings: {
    language: 'en' | 'hi' | 'pa'; // English, Hindi, Punjabi
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    emergencyProtocols: {
      lockdownProcedure: boolean;
      evacuationProcedure: boolean;
      communicationTree: boolean;
    };
  };
  analytics: {
    totalDrillsCompleted: number;
    averageDrillScore: number;
    studentEngagement: number;
    parentEngagement: number;
    lastActiveDate: Date;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ISchoolDocument extends ISchool, Document {
  calculatePreparednessScore(): Promise<number>;
  getHazardLevel(): string;
  scheduleNextDrill(): Date;
}

const SchoolSchema = new Schema<ISchoolDocument>({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    maxlength: [200, 'School name cannot exceed 200 characters']
  },
  code: {
    type: String,
    required: [true, 'School code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2}\d{4}[A-Z]{2}$/, 'School code format: PB1234AB']
  },
  type: {
    type: String,
    enum: ['primary', 'secondary', 'higher_secondary', 'college', 'university'],
    required: [true, 'School type is required']
  },
  board: {
    type: String,
    enum: ['PSEB', 'CBSE', 'ICSE', 'Other'],
    default: 'PSEB'
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    district: {
      type: String,
      enum: PUNJAB_DISTRICTS,
      required: [true, 'District is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Pincode must be 6 digits']
    },
    state: {
      type: String,
      default: 'Punjab',
      immutable: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    }
  },
  administration: {
    principal: {
      name: {
        type: String,
        required: [true, 'Principal name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Principal email is required'],
        lowercase: true
      },
      phone: {
        type: String,
        required: [true, 'Principal phone is required'],
        match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
      }
    },
    disasterCoordinator: {
      name: String,
      email: String,
      phone: String
    }
  },
  infrastructure: {
    totalStudents: {
      type: Number,
      required: [true, 'Total students count is required'],
      min: [1, 'At least 1 student required']
    },
    totalTeachers: {
      type: Number,
      required: [true, 'Total teachers count is required'],
      min: [1, 'At least 1 teacher required']
    },
    totalStaff: {
      type: Number,
      default: 0,
      min: [0, 'Staff count cannot be negative']
    },
    buildingFloors: {
      type: Number,
      required: [true, 'Building floors count is required'],
      min: [1, 'At least 1 floor required']
    },
    hasBasement: {
      type: Boolean,
      default: false
    },
    evacuationRoutes: {
      type: Number,
      required: [true, 'Evacuation routes count is required'],
      min: [1, 'At least 1 evacuation route required']
    },
    assemblyPoints: {
      type: Number,
      required: [true, 'Assembly points count is required'],
      min: [1, 'At least 1 assembly point required']
    },
    hasPlayground: {
      type: Boolean,
      default: false
    },
    campusArea: {
      type: Number,
      min: [0, 'Campus area cannot be negative']
    },
    buildingAge: {
      type: Number,
      min: [0, 'Building age cannot be negative']
    }
  },
  hazardProfile: {
    floodRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    earthquakeRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    fireRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    cycloneRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    industrialRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    lastAssessment: Date
  },
  preparedness: {
    overallScore: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    lastDrillDate: Date,
    drillFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    equipmentStatus: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'fair'
    },
    staffTrainingLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced', 'expert'],
      default: 'basic'
    },
    studentParticipation: {
      type: Number,
      default: 0,
      min: [0, 'Participation cannot be negative'],
      max: [100, 'Participation cannot exceed 100%']
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: String,
    verifiedAt: Date,
    documents: [{
      type: {
        type: String,
        enum: ['registration', 'noc', 'building_plan', 'safety_certificate']
      },
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: Date,
    features: [String]
  },
  settings: {
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    workingHours: {
      start: {
        type: String,
        default: '08:00'
      },
      end: {
        type: String,
        default: '16:00'
      }
    },
    emergencyProtocols: {
      lockdownProcedure: {
        type: Boolean,
        default: false
      },
      evacuationProcedure: {
        type: Boolean,
        default: false
      },
      communicationTree: {
        type: Boolean,
        default: false
      }
    }
  },
  analytics: {
    totalDrillsCompleted: {
      type: Number,
      default: 0
    },
    averageDrillScore: {
      type: Number,
      default: 0
    },
    studentEngagement: {
      type: Number,
      default: 0
    },
    parentEngagement: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
SchoolSchema.index({ code: 1 }, { unique: true });
SchoolSchema.index({ 'address.district': 1 });
SchoolSchema.index({ type: 1, board: 1 });
SchoolSchema.index({ 'verification.isVerified': 1 });
SchoolSchema.index({ 'subscription.isActive': 1 });
SchoolSchema.index({ 'preparedness.overallScore': -1 });

// Virtual for full address
SchoolSchema.virtual('fullAddress').get(function(this: ISchoolDocument) {
  return `${this.address.street}, ${this.address.city}, ${this.address.district}, Punjab - ${this.address.pincode}`;
});

// Virtual for total occupancy
SchoolSchema.virtual('totalOccupancy').get(function(this: ISchoolDocument) {
  return this.infrastructure.totalStudents + this.infrastructure.totalTeachers + this.infrastructure.totalStaff;
});

// Method to calculate preparedness score
SchoolSchema.methods.calculatePreparednessScore = async function(): Promise<number> {
  let score = 0;
  
  // Equipment status score (25%)
  const equipmentScores = { excellent: 25, good: 20, fair: 15, poor: 5 };
  score += equipmentScores[this.preparedness.equipmentStatus] || 0;
  
  // Staff training score (25%)
  const trainingScores = { expert: 25, advanced: 20, intermediate: 15, basic: 10 };
  score += trainingScores[this.preparedness.staffTrainingLevel] || 0;
  
  // Student participation score (25%)
  score += (this.preparedness.studentParticipation * 0.25);
  
  // Drill frequency score (25%)
  const frequencyScores = { weekly: 25, monthly: 20, quarterly: 15, yearly: 10 };
  score += frequencyScores[this.preparedness.drillFrequency] || 0;
  
  this.preparedness.overallScore = Math.round(score);
  return this.preparedness.overallScore;
};

// Method to get overall hazard level
SchoolSchema.methods.getHazardLevel = function(): string {
  const risks = [
    this.hazardProfile.floodRisk,
    this.hazardProfile.earthquakeRisk,
    this.hazardProfile.fireRisk,
    this.hazardProfile.cycloneRisk,
    this.hazardProfile.industrialRisk
  ];
  
  const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 };
  const maxRisk = Math.max(...risks.map(risk => riskLevels[risk] || 1));
  
  return Object.keys(riskLevels).find(key => riskLevels[key] === maxRisk) || 'low';
};

// Method to schedule next drill based on frequency
SchoolSchema.methods.scheduleNextDrill = function(): Date {
  const lastDrill = this.preparedness.lastDrillDate || new Date();
  const frequency = this.preparedness.drillFrequency;
  
  const nextDrill = new Date(lastDrill);
  
  switch (frequency) {
    case 'weekly':
      nextDrill.setDate(nextDrill.getDate() + 7);
      break;
    case 'monthly':
      nextDrill.setMonth(nextDrill.getMonth() + 1);
      break;
    case 'quarterly':
      nextDrill.setMonth(nextDrill.getMonth() + 3);
      break;
    case 'yearly':
      nextDrill.setFullYear(nextDrill.getFullYear() + 1);
      break;
  }
  
  return nextDrill;
};

// Update analytics on save
SchoolSchema.pre('save', function(next) {
  this.analytics.lastActiveDate = new Date();
  next();
});

export default mongoose.model<ISchoolDocument>('School', SchoolSchema);
