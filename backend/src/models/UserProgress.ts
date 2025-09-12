import mongoose, { Schema, Document } from 'mongoose';
import { IUserProgress } from '../types';

interface IUserProgressDocument extends Omit<IUserProgress, '_id'>, Document {}

const UserProgressSchema = new Schema<IUserProgressDocument>({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  moduleId: {
    type: String,
    required: [true, 'Module ID is required']
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient queries
UserProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
UserProgressSchema.index({ status: 1 });
UserProgressSchema.index({ completedAt: -1 });

// Update completedAt when status changes to completed
UserProgressSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.model<IUserProgressDocument>('UserProgress', UserProgressSchema);
