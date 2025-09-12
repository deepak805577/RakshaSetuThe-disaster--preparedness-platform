import mongoose, { Schema, Document } from 'mongoose';

// 3D Coordinate interface for spatial positioning
interface I3DCoordinate {
  x: number;
  y: number;
  z?: number; // Optional for 2D scenarios
}

// Evacuation route step interface
interface IEvacuationStep {
  stepNumber: number;
  location: I3DCoordinate;
  instruction: string;
  estimatedTime: number; // seconds
  hazards: string[]; // potential hazards at this step
  checkpoints: string[]; // validation checkpoints
  alternatives?: I3DCoordinate[]; // alternative routes
}

// Building layout interface for 3D visualization
interface IBuildingLayout {
  floors: Array<{
    floorNumber: number;
    floorPlan: string; // URL to floor plan image/3D model
    rooms: Array<{
      roomId: string;
      name: string;
      type: 'classroom' | 'laboratory' | 'library' | 'cafeteria' | 'auditorium' | 'office' | 'restroom' | 'stairwell' | 'exit';
      capacity: number;
      coordinates: I3DCoordinate;
      dimensions: {
        width: number;
        height: number;
        length: number;
      };
      exits: Array<{
        exitId: string;
        coordinates: I3DCoordinate;
        width: number;
        isEmergencyExit: boolean;
        leadsTo: string; // room ID or 'outside'
      }>;
      hazards: string[];
    }>;
    evacuationRoutes: Array<{
      routeId: string;
      from: I3DCoordinate;
      to: I3DCoordinate;
      steps: IEvacuationStep[];
      estimatedTime: number;
      capacity: number;
      priority: 'primary' | 'secondary' | 'emergency';
    }>;
  }>;
  assemblyPoints: Array<{
    pointId: string;
    name: string;
    coordinates: I3DCoordinate;
    capacity: number;
    safetyRadius: number; // meters
    type: 'primary' | 'secondary' | 'emergency';
  }>;
  emergencyEquipment: Array<{
    equipmentId: string;
    type: 'fire_extinguisher' | 'fire_alarm' | 'emergency_light' | 'first_aid' | 'aed' | 'megaphone';
    location: I3DCoordinate;
    status: 'functional' | 'maintenance' | 'damaged';
    lastInspected: Date;
  }>;
}

// Participant performance tracking
interface IParticipantPerformance {
  userId: string;
  userName: string;
  role: 'student' | 'teacher' | 'staff';
  startPosition: I3DCoordinate;
  targetPosition: I3DCoordinate;
  actualPath: Array<{
    timestamp: Date;
    position: I3DCoordinate;
    action: string;
  }>;
  completionTime: number; // seconds
  mistakes: Array<{
    timestamp: Date;
    position: I3DCoordinate;
    mistake: string;
    severity: 'minor' | 'major' | 'critical';
  }>;
  score: number; // 0-100
  achievements: string[];
  feedback: string[];
}

export interface IVirtualDrill {
  schoolId: string;
  title: string;
  description: string;
  drillType: 'fire' | 'earthquake' | 'flood' | 'lockdown' | 'chemical' | 'bomb_threat' | 'medical_emergency';
  scenario: {
    title: string;
    description: string;
    disasterDetails: {
      intensity: 'low' | 'medium' | 'high' | 'critical';
      location: I3DCoordinate; // epicenter/origin of disaster
      affectedAreas: string[]; // room IDs or area names
      timeOfDay: string; // HH:MM format
      weatherConditions?: string;
      specialCircumstances?: string[];
    };
    objectives: string[];
    successCriteria: Array<{
      criterion: string;
      weight: number; // percentage of total score
      measurementType: 'time' | 'accuracy' | 'compliance' | 'safety';
    }>;
  };
  buildingLayout: IBuildingLayout;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: {
    estimated: number; // minutes
    maximum: number; // maximum allowed time
    phases: Array<{
      phase: string;
      duration: number; // seconds
      description: string;
    }>;
  };
  participants: {
    maximum: number;
    minimum: number;
    roles: Array<{
      role: 'student' | 'teacher' | 'staff' | 'warden';
      count: number;
      responsibilities: string[];
    }>;
    current: Array<{
      userId: string;
      role: 'student' | 'teacher' | 'staff' | 'warden';
      status: 'joined' | 'ready' | 'in_progress' | 'completed' | 'disconnected';
      joinedAt: Date;
    }>;
  };
  realTimeFeatures: {
    voiceChat: boolean;
    textChat: boolean;
    videoStreaming: boolean;
    locationSharing: boolean;
    collaborativeActions: boolean;
    mentorGuidance: boolean;
  };
  gamification: {
    pointsSystem: {
      basePoints: number;
      bonusPoints: Array<{
        condition: string;
        points: number;
      }>;
      penaltyPoints: Array<{
        condition: string;
        points: number;
      }>;
    };
    achievements: Array<{
      achievementId: string;
      name: string;
      description: string;
      condition: string;
      icon: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
    leaderboard: boolean;
    teamChallenges: Array<{
      challengeId: string;
      name: string;
      description: string;
      teamSize: number;
      objective: string;
    }>;
  };
  analytics: {
    totalSessions: number;
    averageScore: number;
    averageTime: number;
    completionRate: number;
    commonMistakes: Array<{
      mistake: string;
      frequency: number;
      impact: 'minor' | 'major' | 'critical';
    }>;
    performanceMetrics: {
      responseTime: number; // average seconds to start moving
      evacuationTime: number; // average time to reach assembly point
      complianceRate: number; // percentage following proper procedures
      safetyIncidents: number;
    };
  };
  accessibility: {
    disabilitySupport: Array<{
      disability: 'mobility' | 'visual' | 'hearing' | 'cognitive';
      accommodations: string[];
      alternativeRoutes: string[];
    }>;
    languageSupport: Array<{
      language: 'en' | 'hi' | 'pa';
      audioInstructions: string; // URL to audio file
      visualCues: string[]; // visual instruction elements
    }>;
    assistiveTechnology: {
      screenReader: boolean;
      voiceCommands: boolean;
      largeText: boolean;
      highContrast: boolean;
    };
  };
  weather: {
    conditions: 'sunny' | 'rainy' | 'stormy' | 'foggy' | 'windy';
    temperature: number; // Celsius
    visibility: number; // meters
    impact: string[]; // how weather affects evacuation
  };
  validation: {
    expertReview: {
      reviewedBy: string;
      reviewDate: Date;
      comments: string;
      approved: boolean;
    };
    safetyChecks: Array<{
      checkType: string;
      status: 'passed' | 'failed' | 'pending';
      comments: string;
    }>;
    complianceStandards: string[]; // NDMA, local fire department standards
  };
  scheduling: {
    availableSlots: Array<{
      startTime: Date;
      endTime: Date;
      maxParticipants: number;
      bookedParticipants: number;
    }>;
    recurringSchedule: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      daysOfWeek?: number[]; // 0-6, Sunday-Saturday
      time: string; // HH:MM format
    };
  };
  isActive: boolean;
  version: string;
  createdBy: string;
  approvedBy?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Session tracking for real-time drills
export interface IDrillSession {
  drillId: string;
  sessionId: string;
  schoolId: string;
  status: 'scheduled' | 'starting' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  participants: IParticipantPerformance[];
  startTime: Date;
  endTime?: Date;
  actualDuration: number; // seconds
  instructor: {
    userId: string;
    name: string;
    role: 'teacher' | 'admin' | 'safety_officer';
  };
  realTimeData: {
    currentPhase: string;
    phaseStartTime: Date;
    participantPositions: Array<{
      userId: string;
      position: I3DCoordinate;
      lastUpdate: Date;
    }>;
    emergencyOverrides: Array<{
      timestamp: Date;
      override: string;
      reason: string;
      issuedBy: string;
    }>;
    communications: Array<{
      timestamp: Date;
      from: string;
      to: string | 'all';
      message: string;
      type: 'text' | 'voice' | 'emergency';
    }>;
  };
  results: {
    overallScore: number;
    individualScores: Array<{
      userId: string;
      score: number;
      rank: number;
    }>;
    teamScores?: Array<{
      teamId: string;
      members: string[];
      score: number;
      rank: number;
    }>;
    achievements: Array<{
      userId: string;
      achievementIds: string[];
    }>;
    improvements: Array<{
      userId: string;
      areas: string[];
      recommendations: string[];
    }>;
  };
  feedback: Array<{
    userId: string;
    rating: number; // 1-5
    comment: string;
    categories: Array<{
      category: string;
      rating: number;
    }>;
  }>;
  recordedData: {
    videoRecording?: string; // URL to recording
    audioRecording?: string; // URL to audio
    pathRecording: Array<{
      userId: string;
      pathData: string; // JSON string of path coordinates
    }>;
    eventLog: Array<{
      timestamp: Date;
      event: string;
      details: any;
    }>;
  };
  certificate: {
    generated: boolean;
    certificateUrl?: string;
    issuedAt?: Date;
    validUntil?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface IVirtualDrillDocument extends IVirtualDrill, Document {
  calculateDifficulty(): string;
  generateScenario(): Promise<any>;
  validateSafety(): Promise<boolean>;
  getOptimalRoutes(): Promise<IEvacuationStep[][]>;
}

interface IDrillSessionDocument extends IDrillSession, Document {
  calculateOverallScore(): Promise<number>;
  generateCertificate(userId: string): Promise<string>;
  getPerformanceAnalytics(): Promise<any>;
  updateParticipantPosition(userId: string, position: I3DCoordinate): Promise<void>;
}

const VirtualDrillSchema = new Schema<IVirtualDrillDocument>({
  schoolId: {
    type: String,
    required: [true, 'School ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Drill title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  drillType: {
    type: String,
    enum: ['fire', 'earthquake', 'flood', 'lockdown', 'chemical', 'bomb_threat', 'medical_emergency'],
    required: [true, 'Drill type is required']
  },
  scenario: {
    title: String,
    description: String,
    disasterDetails: {
      intensity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      location: {
        x: Number,
        y: Number,
        z: Number
      },
      affectedAreas: [String],
      timeOfDay: String,
      weatherConditions: String,
      specialCircumstances: [String]
    },
    objectives: [String],
    successCriteria: [{
      criterion: String,
      weight: {
        type: Number,
        min: 0,
        max: 100
      },
      measurementType: {
        type: String,
        enum: ['time', 'accuracy', 'compliance', 'safety']
      }
    }]
  },
  buildingLayout: {
    floors: [{
      floorNumber: Number,
      floorPlan: String,
      rooms: [{
        roomId: String,
        name: String,
        type: {
          type: String,
          enum: ['classroom', 'laboratory', 'library', 'cafeteria', 'auditorium', 'office', 'restroom', 'stairwell', 'exit']
        },
        capacity: Number,
        coordinates: {
          x: Number,
          y: Number,
          z: Number
        },
        dimensions: {
          width: Number,
          height: Number,
          length: Number
        },
        exits: [{
          exitId: String,
          coordinates: {
            x: Number,
            y: Number,
            z: Number
          },
          width: Number,
          isEmergencyExit: Boolean,
          leadsTo: String
        }],
        hazards: [String]
      }],
      evacuationRoutes: [{
        routeId: String,
        from: {
          x: Number,
          y: Number,
          z: Number
        },
        to: {
          x: Number,
          y: Number,
          z: Number
        },
        steps: [{
          stepNumber: Number,
          location: {
            x: Number,
            y: Number,
            z: Number
          },
          instruction: String,
          estimatedTime: Number,
          hazards: [String],
          checkpoints: [String],
          alternatives: [{
            x: Number,
            y: Number,
            z: Number
          }]
        }],
        estimatedTime: Number,
        capacity: Number,
        priority: {
          type: String,
          enum: ['primary', 'secondary', 'emergency']
        }
      }]
    }],
    assemblyPoints: [{
      pointId: String,
      name: String,
      coordinates: {
        x: Number,
        y: Number,
        z: Number
      },
      capacity: Number,
      safetyRadius: Number,
      type: {
        type: String,
        enum: ['primary', 'secondary', 'emergency']
      }
    }],
    emergencyEquipment: [{
      equipmentId: String,
      type: {
        type: String,
        enum: ['fire_extinguisher', 'fire_alarm', 'emergency_light', 'first_aid', 'aed', 'megaphone']
      },
      location: {
        x: Number,
        y: Number,
        z: Number
      },
      status: {
        type: String,
        enum: ['functional', 'maintenance', 'damaged'],
        default: 'functional'
      },
      lastInspected: Date
    }]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  duration: {
    estimated: {
      type: Number,
      required: true,
      min: 1
    },
    maximum: {
      type: Number,
      required: true,
      min: 1
    },
    phases: [{
      phase: String,
      duration: Number,
      description: String
    }]
  },
  participants: {
    maximum: {
      type: Number,
      required: true,
      min: 1,
      max: 1000
    },
    minimum: {
      type: Number,
      required: true,
      min: 1
    },
    roles: [{
      role: {
        type: String,
        enum: ['student', 'teacher', 'staff', 'warden']
      },
      count: Number,
      responsibilities: [String]
    }],
    current: [{
      userId: String,
      role: String,
      status: {
        type: String,
        enum: ['joined', 'ready', 'in_progress', 'completed', 'disconnected'],
        default: 'joined'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  realTimeFeatures: {
    voiceChat: {
      type: Boolean,
      default: false
    },
    textChat: {
      type: Boolean,
      default: true
    },
    videoStreaming: {
      type: Boolean,
      default: false
    },
    locationSharing: {
      type: Boolean,
      default: true
    },
    collaborativeActions: {
      type: Boolean,
      default: true
    },
    mentorGuidance: {
      type: Boolean,
      default: true
    }
  },
  gamification: {
    pointsSystem: {
      basePoints: {
        type: Number,
        default: 100
      },
      bonusPoints: [{
        condition: String,
        points: Number
      }],
      penaltyPoints: [{
        condition: String,
        points: Number
      }]
    },
    achievements: [{
      achievementId: String,
      name: String,
      description: String,
      condition: String,
      icon: String,
      rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary']
      }
    }],
    leaderboard: {
      type: Boolean,
      default: true
    },
    teamChallenges: [{
      challengeId: String,
      name: String,
      description: String,
      teamSize: Number,
      objective: String
    }]
  },
  analytics: {
    totalSessions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    commonMistakes: [{
      mistake: String,
      frequency: Number,
      impact: {
        type: String,
        enum: ['minor', 'major', 'critical']
      }
    }],
    performanceMetrics: {
      responseTime: {
        type: Number,
        default: 0
      },
      evacuationTime: {
        type: Number,
        default: 0
      },
      complianceRate: {
        type: Number,
        default: 0
      },
      safetyIncidents: {
        type: Number,
        default: 0
      }
    }
  },
  accessibility: {
    disabilitySupport: [{
      disability: {
        type: String,
        enum: ['mobility', 'visual', 'hearing', 'cognitive']
      },
      accommodations: [String],
      alternativeRoutes: [String]
    }],
    languageSupport: [{
      language: {
        type: String,
        enum: ['en', 'hi', 'pa']
      },
      audioInstructions: String,
      visualCues: [String]
    }],
    assistiveTechnology: {
      screenReader: {
        type: Boolean,
        default: false
      },
      voiceCommands: {
        type: Boolean,
        default: false
      },
      largeText: {
        type: Boolean,
        default: false
      },
      highContrast: {
        type: Boolean,
        default: false
      }
    }
  },
  weather: {
    conditions: {
      type: String,
      enum: ['sunny', 'rainy', 'stormy', 'foggy', 'windy'],
      default: 'sunny'
    },
    temperature: {
      type: Number,
      default: 25
    },
    visibility: {
      type: Number,
      default: 1000
    },
    impact: [String]
  },
  validation: {
    expertReview: {
      reviewedBy: String,
      reviewDate: Date,
      comments: String,
      approved: {
        type: Boolean,
        default: false
      }
    },
    safetyChecks: [{
      checkType: String,
      status: {
        type: String,
        enum: ['passed', 'failed', 'pending']
      },
      comments: String
    }],
    complianceStandards: [String]
  },
  scheduling: {
    availableSlots: [{
      startTime: Date,
      endTime: Date,
      maxParticipants: Number,
      bookedParticipants: {
        type: Number,
        default: 0
      }
    }],
    recurringSchedule: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      daysOfWeek: [Number],
      time: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  createdBy: {
    type: String,
    required: true
  },
  approvedBy: String,
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
VirtualDrillSchema.index({ schoolId: 1, drillType: 1 });
VirtualDrillSchema.index({ difficulty: 1, isActive: 1 });
VirtualDrillSchema.index({ 'validation.expertReview.approved': 1 });
VirtualDrillSchema.index({ tags: 1 });

// Virtual for total evacuation time
VirtualDrillSchema.virtual('totalEvacuationTime').get(function(this: IVirtualDrillDocument) {
  return this.duration.estimated * 60; // convert minutes to seconds
});

// Methods
VirtualDrillSchema.methods.calculateDifficulty = function(): string {
  let score = 0;
  
  // Factors affecting difficulty
  if (this.participants.maximum > 100) score += 20;
  if (this.buildingLayout.floors.length > 2) score += 15;
  if (this.scenario.disasterDetails.intensity === 'high' || this.scenario.disasterDetails.intensity === 'critical') score += 25;
  if (this.duration.maximum < 10) score += 20; // tight time constraints
  
  if (score >= 60) return 'expert';
  if (score >= 40) return 'advanced';
  if (score >= 20) return 'intermediate';
  return 'beginner';
};

VirtualDrillSchema.methods.validateSafety = async function(): Promise<boolean> {
  // Check if evacuation routes are safe and accessible
  const routes = this.buildingLayout.floors.flatMap(floor => floor.evacuationRoutes);
  const assemblyPoints = this.buildingLayout.assemblyPoints;
  
  // Basic validation
  return routes.length > 0 && assemblyPoints.length > 0;
};

VirtualDrillSchema.methods.getOptimalRoutes = async function(): Promise<IEvacuationStep[][]> {
  // Calculate optimal evacuation routes based on capacity and time
  const routes = this.buildingLayout.floors.flatMap(floor => 
    floor.evacuationRoutes.map(route => route.steps)
  );
  
  // Sort by estimated time and capacity
  return routes.sort((a, b) => {
    const timeA = a.reduce((sum, step) => sum + step.estimatedTime, 0);
    const timeB = b.reduce((sum, step) => sum + step.estimatedTime, 0);
    return timeA - timeB;
  });
};

// Drill Session Schema
const DrillSessionSchema = new Schema<IDrillSessionDocument>({
  drillId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  schoolId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'starting', 'in_progress', 'paused', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  participants: [{
    userId: String,
    userName: String,
    role: {
      type: String,
      enum: ['student', 'teacher', 'staff']
    },
    startPosition: {
      x: Number,
      y: Number,
      z: Number
    },
    targetPosition: {
      x: Number,
      y: Number,
      z: Number
    },
    actualPath: [{
      timestamp: Date,
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      action: String
    }],
    completionTime: {
      type: Number,
      default: 0
    },
    mistakes: [{
      timestamp: Date,
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      mistake: String,
      severity: {
        type: String,
        enum: ['minor', 'major', 'critical']
      }
    }],
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    achievements: [String],
    feedback: [String]
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  actualDuration: {
    type: Number,
    default: 0
  },
  instructor: {
    userId: String,
    name: String,
    role: {
      type: String,
      enum: ['teacher', 'admin', 'safety_officer']
    }
  },
  realTimeData: {
    currentPhase: String,
    phaseStartTime: Date,
    participantPositions: [{
      userId: String,
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      lastUpdate: {
        type: Date,
        default: Date.now
      }
    }],
    emergencyOverrides: [{
      timestamp: Date,
      override: String,
      reason: String,
      issuedBy: String
    }],
    communications: [{
      timestamp: Date,
      from: String,
      to: String,
      message: String,
      type: {
        type: String,
        enum: ['text', 'voice', 'emergency']
      }
    }]
  },
  results: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    individualScores: [{
      userId: String,
      score: Number,
      rank: Number
    }],
    teamScores: [{
      teamId: String,
      members: [String],
      score: Number,
      rank: Number
    }],
    achievements: [{
      userId: String,
      achievementIds: [String]
    }],
    improvements: [{
      userId: String,
      areas: [String],
      recommendations: [String]
    }]
  },
  feedback: [{
    userId: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    categories: [{
      category: String,
      rating: Number
    }]
  }],
  recordedData: {
    videoRecording: String,
    audioRecording: String,
    pathRecording: [{
      userId: String,
      pathData: String
    }],
    eventLog: [{
      timestamp: Date,
      event: String,
      details: Schema.Types.Mixed
    }]
  },
  certificate: {
    generated: {
      type: Boolean,
      default: false
    },
    certificateUrl: String,
    issuedAt: Date,
    validUntil: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for drill sessions
DrillSessionSchema.index({ drillId: 1, startTime: -1 });
DrillSessionSchema.index({ schoolId: 1, status: 1 });
DrillSessionSchema.index({ 'instructor.userId': 1 });

// Methods for drill session
DrillSessionSchema.methods.calculateOverallScore = async function(): Promise<number> {
  const participantScores = this.participants.map(p => p.score).filter(score => score > 0);
  if (participantScores.length === 0) return 0;
  
  const average = participantScores.reduce((sum, score) => sum + score, 0) / participantScores.length;
  this.results.overallScore = Math.round(average);
  return this.results.overallScore;
};

DrillSessionSchema.methods.updateParticipantPosition = async function(userId: string, position: I3DCoordinate): Promise<void> {
  const participantIndex = this.realTimeData.participantPositions.findIndex(p => p.userId === userId);
  
  if (participantIndex >= 0) {
    this.realTimeData.participantPositions[participantIndex].position = position;
    this.realTimeData.participantPositions[participantIndex].lastUpdate = new Date();
  } else {
    this.realTimeData.participantPositions.push({
      userId,
      position,
      lastUpdate: new Date()
    });
  }
  
  await this.save();
};

export const VirtualDrill = mongoose.model<IVirtualDrillDocument>('VirtualDrill', VirtualDrillSchema);
export const DrillSession = mongoose.model<IDrillSessionDocument>('DrillSession', DrillSessionSchema);
