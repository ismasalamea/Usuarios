import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ''
    },
    position: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
