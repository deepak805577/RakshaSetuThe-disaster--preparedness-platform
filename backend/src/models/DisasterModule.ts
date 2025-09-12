import mongoose, { Schema, Document } from 'mongoose';
import { IDisasterModule, IQuiz, IQuestion } from '../types';

interface IDisasterModuleDocument extends Omit<IDisasterModule, '_id'>, Document {}

const QuestionSchema = new Schema<IQuestion>({
  id: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  options: [{
    type: String,
    required: [true, 'Option is required']
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: 1,
    default: 10
  }
}, { _id: false });

const QuizSchema = new Schema<IQuiz>({
  questions: [QuestionSchema],
  passingScore: {
    type: Number,
    required: [true, 'Passing score is required'],
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number,
    min: 1,
    max: 120 // max 2 hours
  }
}, { _id: false });

const DisasterModuleSchema = new Schema<IDisasterModuleDocument>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'cyclone', 'drought', 'heatwave'],
    required: [true, 'Disaster type is required']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Difficulty level is required'],
    default: 'beginner'
  },
  content: {
    introduction: {
      type: String,
      required: [true, 'Introduction is required'],
      trim: true
    },
    keyPoints: [{
      type: String,
      required: true,
      trim: true
    }],
    preventionMeasures: [{
      type: String,
      required: true,
      trim: true
    }],
    duringDisaster: [{
      type: String,
      required: true,
      trim: true
    }],
    afterDisaster: [{
      type: String,
      required: true,
      trim: true
    }],
    images: [{
      type: String
    }],
    videos: [{
      id: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        required: true,
        trim: true
      },
      thumbnail: {
        type: String,
        trim: true
      },
      duration: {
        type: Number,
        required: true,
        min: 1
      },
      section: {
        type: String,
        required: true,
        enum: ['introduction', 'keyPoints', 'preventionMeasures', 'duringDisaster', 'afterDisaster'],
        trim: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  quiz: {
    type: QuizSchema,
    required: [true, 'Quiz is required']
  },
  completions: {
    type: Number,
    default: 0,
    min: 0
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
DisasterModuleSchema.index({ type: 1, difficulty: 1 });
DisasterModuleSchema.index({ completions: -1 });
DisasterModuleSchema.index({ ratings: -1 });

// Virtual for total quiz points
DisasterModuleSchema.virtual('totalQuizPoints').get(function(this: IDisasterModuleDocument) {
  return this.quiz.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual for estimated completion time
DisasterModuleSchema.virtual('estimatedTime').get(function(this: IDisasterModuleDocument) {
  const contentTime = Math.ceil(this.content.introduction.length / 200) + 
                      (this.content.keyPoints.length * 2) +
                      (this.content.preventionMeasures.length * 2) +
                      (this.content.duringDisaster.length * 2) +
                      (this.content.afterDisaster.length * 2);
  
  const quizTime = this.quiz.timeLimit || (this.quiz.questions.length * 2);
  
  return contentTime + quizTime;
});

export default mongoose.model<IDisasterModuleDocument>('DisasterModule', DisasterModuleSchema);
