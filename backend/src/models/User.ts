import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../types';

interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  hasPermission(permission: string): boolean;
  getFullProfile(): Promise<IUserDocument>;
  updateStreaks(): void;
}

const UserSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'parent'],
    required: [true, 'Role is required'],
    default: 'student'
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  school: {
    type: String,
    trim: true
  },
  grade: {
    type: Number,
    min: [1, 'Grade must be between 1-12'],
    max: [12, 'Grade must be between 1-12']
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  badges: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profile: {
    avatar: String,
    district: {
      type: String,
      enum: [
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
        'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
        'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
        'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
      ]
    },
    emergencyContact: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ school: 1, grade: 1 });
UserSchema.index({ points: -1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET || 'default_secret',
    { 
      expiresIn: '7d'
    }
  );
};

// Virtual for user level based on points
UserSchema.virtual('level').get(function(this: IUserDocument) {
  const points = this.points || 0;
  if (points < 100) return 'Beginner';
  if (points < 500) return 'Intermediate';
  if (points < 1000) return 'Advanced';
  return 'Expert';
});

// Virtual for completed modules count
UserSchema.virtual('completedModulesCount', {
  ref: 'UserProgress',
  localField: '_id',
  foreignField: 'userId',
  count: true,
  match: { status: 'completed' }
});

const User = mongoose.model<IUserDocument>('User', UserSchema);
export { IUser } from '../types';
export default User;
