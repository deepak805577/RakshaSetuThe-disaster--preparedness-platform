import mongoose, { Schema, Document } from 'mongoose';
import { IDrillSession, IDrillStep } from '../types';

interface IDrillSessionDocument extends Omit<IDrillSession, '_id'>, Document {}

const DrillStepSchema = new Schema<IDrillStep>({
  stepNumber: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    required: [true, 'Step description is required'],
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionTime: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String,
    trim: true
  }
}, { _id: false });

const DrillSessionSchema = new Schema<IDrillSessionDocument>({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  drillType: {
    type: String,
    enum: ['evacuation', 'fire', 'earthquake', 'flood'],
    required: [true, 'Drill type is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date
  },
  steps: [DrillStepSchema],
  totalTime: {
    type: Number,
    min: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
DrillSessionSchema.index({ userId: 1, drillType: 1 });
DrillSessionSchema.index({ startTime: -1 });
DrillSessionSchema.index({ isCompleted: 1 });

// Virtual for completion percentage
DrillSessionSchema.virtual('completionPercentage').get(function(this: IDrillSessionDocument) {
  if (this.steps.length === 0) return 0;
  const completedSteps = this.steps.filter(step => step.isCompleted).length;
  return Math.round((completedSteps / this.steps.length) * 100);
});

// Update endTime and totalTime when drill is completed
DrillSessionSchema.pre('save', function(next) {
  if (this.isModified('isCompleted') && this.isCompleted && !this.endTime) {
    this.endTime = new Date();
    this.totalTime = Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  next();
});

export default mongoose.model<IDrillSessionDocument>('DrillSession', DrillSessionSchema);
