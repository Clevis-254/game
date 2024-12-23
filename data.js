import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    FirstName: {
        type : String,
        required : true,
        lowercase: true,
    },
    LastName: {
        type : String,
        required : true,
        lowercase: true,
    },
    email: {
        type : String,
        required : true,
        lowercase: true,
    },
    Password: {
        type : String,
        required : true,
        lowercase: true,
    },
    createdAt : {
        type : Date,
        default : () => Date.now(),
        immutable : true,
    },
});

export default mongoose.model('User', userSchema);
