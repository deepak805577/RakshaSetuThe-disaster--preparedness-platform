import mongoose, { Schema, Document } from 'mongoose';
import { IEmergencyContact } from '../types';

interface IEmergencyContactDocument extends Omit<IEmergencyContact, '_id'>, Document {}

const EmergencyContactSchema = new Schema<IEmergencyContactDocument>({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    enum: [
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
      'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
      'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
      'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
    ]
  },
  type: {
    type: String,
    enum: ['police', 'fire', 'medical', 'disaster_management', 'school_admin'],
    required: [true, 'Contact type is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
EmergencyContactSchema.index({ district: 1, type: 1 });
EmergencyContactSchema.index({ isActive: 1 });

export default mongoose.model<IEmergencyContactDocument>('EmergencyContact', EmergencyContactSchema);
