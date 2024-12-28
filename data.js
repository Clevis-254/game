import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    Password: {
        type: String,
        required: true,
        lowercase: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
    UserType: {
        type: String,
        enum: ['user', 'admin'],  // Only allows 'user' or 'admin'
        default: 'user',          // Default value is 'user'
    },
});

export default mongoose.model('User', userSchema);
