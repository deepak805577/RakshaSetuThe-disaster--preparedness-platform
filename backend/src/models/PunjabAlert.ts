import mongoose, { Schema, Document } from 'mongoose';
import { IPunjabAlert } from '../types';

interface IPunjabAlertDocument extends Omit<IPunjabAlert, '_id'>, Document {}

const PunjabAlertSchema = new Schema<IPunjabAlertDocument>({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Alert severity is required'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['weather', 'earthquake', 'flood', 'fire', 'health', 'security'],
    required: [true, 'Alert type is required']
  },
  affectedDistricts: [{
    type: String,
    enum: [
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
      'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
      'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
      'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
    ],
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  validUntil: {
    type: Date,
    required: [true, 'Alert expiry date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Valid until date must be in the future'
    }
  },
  actionRequired: {
    type: String,
    trim: true,
    maxlength: [1000, 'Action required cannot be more than 1000 characters']
  },
  contactInfo: {
    type: String,
    trim: true,
    maxlength: [500, 'Contact info cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
PunjabAlertSchema.index({ isActive: 1, validUntil: 1 });
PunjabAlertSchema.index({ affectedDistricts: 1 });
PunjabAlertSchema.index({ severity: 1, type: 1 });
PunjabAlertSchema.index({ createdAt: -1 });

// Automatically deactivate expired alerts
PunjabAlertSchema.pre('save', function(next) {
  if (this.validUntil <= new Date()) {
    this.isActive = false;
  }
  next();
});

export default mongoose.model<IPunjabAlertDocument>('PunjabAlert', PunjabAlertSchema);
