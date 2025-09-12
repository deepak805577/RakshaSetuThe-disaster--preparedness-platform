import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../types';

export interface IFamilyRelationship extends Document {
  parent: mongoose.Types.ObjectId | IUser;
  children: mongoose.Types.ObjectId[] | IUser[];
  relationshipType: 'parent' | 'guardian' | 'family_member';
  isVerified: boolean;
  verificationCode: string;
  verificationCodeExpires: Date;
  isVerificationCodeValid(): boolean;
  permissions: {
    viewProgress: boolean;
    receiveNotifications: boolean;
    manageAccount: boolean;
    accessEmergencyInfo: boolean;
  };
  emergencyContact: {
    phone: string;
    alternatePhone?: string;
    email: string;
    address: string;
  };
  notifications: {
    achievements: boolean;
    drillReminders: boolean;
    emergencyAlerts: boolean;
    progressReports: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const familyRelationshipSchema = new Schema<IFamilyRelationship>({
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  relationshipType: {
    type: String,
    enum: ['parent', 'guardian', 'family_member'],
    default: 'parent',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    required: false
  },
  verificationCodeExpires: {
    type: Date,
    required: false
  },
  permissions: {
    viewProgress: {
      type: Boolean,
      default: true
    },
    receiveNotifications: {
      type: Boolean,
      default: true
    },
    manageAccount: {
      type: Boolean,
      default: false
    },
    accessEmergencyInfo: {
      type: Boolean,
      default: true
    }
  },
  emergencyContact: {
    phone: {
      type: String,
      required: true
    },
    alternatePhone: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  notifications: {
    achievements: {
      type: Boolean,
      default: true
    },
    drillReminders: {
      type: Boolean,
      default: true
    },
    emergencyAlerts: {
      type: Boolean,
      default: true
    },
    progressReports: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
familyRelationshipSchema.index({ parent: 1 });
familyRelationshipSchema.index({ children: 1 });
familyRelationshipSchema.index({ 'parent': 1, 'children': 1 }, { unique: true });
familyRelationshipSchema.index({ verificationCode: 1 });

// Pre-save middleware to generate verification code
familyRelationshipSchema.pre('save', function(next) {
  if (!this.isVerified && !this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

// Method to check if verification code is valid
familyRelationshipSchema.methods.isVerificationCodeValid = function() {
  return this.verificationCode && 
         this.verificationCodeExpires && 
         this.verificationCodeExpires > new Date();
};

// Method to regenerate verification code
familyRelationshipSchema.methods.regenerateVerificationCode = function() {
  this.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.verificationCode;
};

export default mongoose.model<IFamilyRelationship>('FamilyRelationship', familyRelationshipSchema);
