import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningPath {
  title: string;
  description: string;
  gradeLevel: {
    min: number; // 1-12 for school, 13+ for college
    max: number;
  };
  curriculum: 'PSEB' | 'CBSE' | 'ICSE' | 'University';
  language: 'en' | 'hi' | 'pa'; // English, Hindi, Punjabi
  category: 'natural_disasters' | 'man_made_disasters' | 'emergency_response' | 'first_aid' | 'preparedness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[]; // Array of module IDs
  modules: Array<{
    moduleId: string;
    order: number;
    isRequired: boolean;
    unlockCriteria?: {
      minScore?: number;
      completedModules?: string[];
      timeRestriction?: Date;
    };
  }>;
  assessments: Array<{
    type: 'quiz' | 'practical' | 'project' | 'drill';
    moduleId: string;
    passingScore: number;
    maxAttempts: number;
    timeLimit?: number; // in minutes
  }>;
  rewards: {
    completionPoints: number;
    certificates: string[];
    badges: string[];
    unlocks: string[]; // unlocked learning paths or features
  };
  regional: {
    applicableDistricts: string[]; // Punjab districts
    hazardSpecific: string[]; // specific hazards for the region
    localContext: {
      culturalReferences: string[];
      languageVariations: Record<string, string>; // language code to text mapping
      localAuthorities: string[]; // local emergency contacts
    };
  };
  multimedia: {
    videos: Array<{
      title: string;
      url: string;
      duration: number; // in seconds
      language: string;
      subtitles: string[]; // available subtitle languages
    }>;
    animations: Array<{
      title: string;
      url: string;
      interactiveElements: boolean;
    }>;
    infographics: Array<{
      title: string;
      url: string;
      downloadable: boolean;
    }>;
    audioNarrations: Array<{
      language: string;
      url: string;
      speed: 'normal' | 'slow' | 'fast';
    }>;
  };
  accessibility: {
    highContrast: boolean;
    largeFonts: boolean;
    audioDescriptions: boolean;
    signLanguage: boolean;
    brailleSupport: boolean;
  };
  analytics: {
    totalEnrollments: number;
    completionRate: number;
    averageScore: number;
    averageTime: number; // in minutes
    dropoffPoints: Array<{
      moduleId: string;
      percentage: number;
    }>;
    feedback: Array<{
      rating: number;
      comment: string;
      userId: string;
      createdAt: Date;
    }>;
  };
  scheduling: {
    recommendedDuration: number; // in days
    dailyTimeCommitment: number; // in minutes
    flexiblePacing: boolean;
    deadlines: Array<{
      moduleId: string;
      deadline: Date;
      type: 'soft' | 'hard';
    }>;
  };
  collaboration: {
    allowGroupWork: boolean;
    peerReviews: boolean;
    discussions: boolean;
    mentorSupport: boolean;
  };
  offline: {
    isDownloadable: boolean;
    offlineModules: string[];
    syncRequired: boolean;
    storageSize: number; // in MB
  };
  compliance: {
    ndmaApproved: boolean;
    stateApproved: boolean;
    lastReviewed: Date;
    reviewers: Array<{
      name: string;
      designation: string;
      organization: string;
      reviewDate: Date;
    }>;
  };
  isActive: boolean;
  version: string;
  lastUpdated: Date;
  createdBy: string;
  approvedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ILearningPathDocument extends ILearningPath, Document {
  calculateCompletionRate(): Promise<number>;
  getNextModule(userId: string): Promise<string | null>;
  checkPrerequisites(userId: string): Promise<boolean>;
  generateCertificate(userId: string): Promise<string>;
}

const LearningPathSchema = new Schema<ILearningPathDocument>({
  title: {
    type: String,
    required: [true, 'Learning path title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  gradeLevel: {
    min: {
      type: Number,
      required: [true, 'Minimum grade level is required'],
      min: [1, 'Minimum grade level must be at least 1'],
      max: [20, 'Maximum grade level cannot exceed 20']
    },
    max: {
      type: Number,
      required: [true, 'Maximum grade level is required'],
      min: [1, 'Maximum grade level must be at least 1'],
      max: [20, 'Maximum grade level cannot exceed 20']
    }
  },
  curriculum: {
    type: String,
    enum: ['PSEB', 'CBSE', 'ICSE', 'University'],
    required: [true, 'Curriculum is required']
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'pa'],
    required: [true, 'Language is required'],
    default: 'en'
  },
  category: {
    type: String,
    enum: ['natural_disasters', 'man_made_disasters', 'emergency_response', 'first_aid', 'preparedness'],
    required: [true, 'Category is required']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Difficulty level is required']
  },
  prerequisites: [String],
  modules: [{
    moduleId: {
      type: String,
      required: [true, 'Module ID is required']
    },
    order: {
      type: Number,
      required: [true, 'Module order is required']
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    unlockCriteria: {
      minScore: {
        type: Number,
        min: 0,
        max: 100
      },
      completedModules: [String],
      timeRestriction: Date
    }
  }],
  assessments: [{
    type: {
      type: String,
      enum: ['quiz', 'practical', 'project', 'drill'],
      required: [true, 'Assessment type is required']
    },
    moduleId: {
      type: String,
      required: [true, 'Module ID is required']
    },
    passingScore: {
      type: Number,
      required: [true, 'Passing score is required'],
      min: 0,
      max: 100
    },
    maxAttempts: {
      type: Number,
      required: [true, 'Max attempts is required'],
      min: 1,
      default: 3
    },
    timeLimit: {
      type: Number,
      min: 1
    }
  }],
  rewards: {
    completionPoints: {
      type: Number,
      required: [true, 'Completion points are required'],
      min: 0,
      default: 100
    },
    certificates: [String],
    badges: [String],
    unlocks: [String]
  },
  regional: {
    applicableDistricts: [{
      type: String,
      enum: [
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
        'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
        'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
        'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
      ]
    }],
    hazardSpecific: [String],
    localContext: {
      culturalReferences: [String],
      languageVariations: {
        type: Map,
        of: String
      },
      localAuthorities: [String]
    }
  },
  multimedia: {
    videos: [{
      title: String,
      url: String,
      duration: Number,
      language: String,
      subtitles: [String]
    }],
    animations: [{
      title: String,
      url: String,
      interactiveElements: {
        type: Boolean,
        default: false
      }
    }],
    infographics: [{
      title: String,
      url: String,
      downloadable: {
        type: Boolean,
        default: true
      }
    }],
    audioNarrations: [{
      language: String,
      url: String,
      speed: {
        type: String,
        enum: ['normal', 'slow', 'fast'],
        default: 'normal'
      }
    }]
  },
  accessibility: {
    highContrast: {
      type: Boolean,
      default: false
    },
    largeFonts: {
      type: Boolean,
      default: false
    },
    audioDescriptions: {
      type: Boolean,
      default: false
    },
    signLanguage: {
      type: Boolean,
      default: false
    },
    brailleSupport: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTime: {
      type: Number,
      default: 0
    },
    dropoffPoints: [{
      moduleId: String,
      percentage: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    feedback: [{
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      comment: String,
      userId: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  scheduling: {
    recommendedDuration: {
      type: Number,
      required: [true, 'Recommended duration is required'],
      min: 1
    },
    dailyTimeCommitment: {
      type: Number,
      required: [true, 'Daily time commitment is required'],
      min: 5
    },
    flexiblePacing: {
      type: Boolean,
      default: true
    },
    deadlines: [{
      moduleId: String,
      deadline: Date,
      type: {
        type: String,
        enum: ['soft', 'hard'],
        default: 'soft'
      }
    }]
  },
  collaboration: {
    allowGroupWork: {
      type: Boolean,
      default: false
    },
    peerReviews: {
      type: Boolean,
      default: false
    },
    discussions: {
      type: Boolean,
      default: true
    },
    mentorSupport: {
      type: Boolean,
      default: false
    }
  },
  offline: {
    isDownloadable: {
      type: Boolean,
      default: false
    },
    offlineModules: [String],
    syncRequired: {
      type: Boolean,
      default: false
    },
    storageSize: {
      type: Number,
      default: 0
    }
  },
  compliance: {
    ndmaApproved: {
      type: Boolean,
      default: false
    },
    stateApproved: {
      type: Boolean,
      default: false
    },
    lastReviewed: Date,
    reviewers: [{
      name: String,
      designation: String,
      organization: String,
      reviewDate: Date
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    default: '1.0.0'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: [true, 'Creator is required']
  },
  approvedBy: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
LearningPathSchema.index({ curriculum: 1, 'gradeLevel.min': 1, 'gradeLevel.max': 1 });
LearningPathSchema.index({ category: 1, difficulty: 1 });
LearningPathSchema.index({ language: 1, isActive: 1 });
LearningPathSchema.index({ 'regional.applicableDistricts': 1 });
LearningPathSchema.index({ 'compliance.ndmaApproved': 1, 'compliance.stateApproved': 1 });

// Virtual for total modules count
LearningPathSchema.virtual('totalModules').get(function(this: ILearningPathDocument) {
  return this.modules.length;
});

// Virtual for required modules count
LearningPathSchema.virtual('requiredModules').get(function(this: ILearningPathDocument) {
  return this.modules.filter(module => module.isRequired).length;
});

// Method to calculate completion rate
LearningPathSchema.methods.calculateCompletionRate = async function(): Promise<number> {
  // This would typically involve querying user progress
  // For now, return the stored value
  return this.analytics.completionRate;
};

// Method to get next module for a user
LearningPathSchema.methods.getNextModule = async function(userId: string): Promise<string | null> {
  // Implementation would involve checking user progress
  // and returning the next available module
  const sortedModules = this.modules.sort((a, b) => a.order - b.order);
  return sortedModules.length > 0 ? sortedModules[0].moduleId : null;
};

// Method to check prerequisites
LearningPathSchema.methods.checkPrerequisites = async function(userId: string): Promise<boolean> {
  // Implementation would check if user has completed prerequisite modules
  return this.prerequisites.length === 0; // For now, return true if no prerequisites
};

// Method to generate certificate
LearningPathSchema.methods.generateCertificate = async function(userId: string): Promise<string> {
  // Implementation would generate a certificate URL or ID
  return `certificate_${this._id}_${userId}_${Date.now()}`;
};

// Update analytics on save
LearningPathSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Validate grade level range
LearningPathSchema.pre('save', function(next) {
  if (this.gradeLevel.min > this.gradeLevel.max) {
    throw new Error('Minimum grade level cannot be greater than maximum grade level');
  }
  next();
});

export default mongoose.model<ILearningPathDocument>('LearningPath', LearningPathSchema);
