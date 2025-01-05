import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email!`,
        },
    },
    Password: {
        type: String,
        required: true,
        // Remove lowercase: true for passwords since they should be case-sensitive
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
    resetToken: {
        type: String,  // Store the reset token
    },
    resetTokenExpiration: {
        type: Date,  // Store the expiration date/time of the reset token
    },
});

// Add pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('Password')) return next();

    try {
        // Generate a salt with 10 rounds
        const salt = await bcrypt.genSalt(10);
        // Hash the password using the salt
        this.Password = await bcrypt.hash(this.Password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.Password);
    } catch (error) {
        throw error;
    }
};

export default mongoose.model('User', userSchema);