import mongoose, { Schema, Document } from 'mongoose';
import { IBadge } from '../types';

interface IBadgeDocument extends Omit<IBadge, '_id'>, Document {}

const BadgeSchema = new Schema<IBadgeDocument>({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    trim: true
  },
  icon: {
    type: String,
    required: [true, 'Badge icon is required']
  },
  criteria: {
    type: String,
    required: [true, 'Badge criteria is required'],
    trim: true
  },
  points: {
    type: Number,
    required: [true, 'Badge points are required'],
    min: 0
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    required: [true, 'Badge rarity is required'],
    default: 'common'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  earnedAt: {
    type: Date
  },
  title: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better performance
BadgeSchema.index({ rarity: 1 });
BadgeSchema.index({ points: -1 });

export default mongoose.model<IBadgeDocument>('Badge', BadgeSchema);
