const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(value.includes('password')) {
                throw new Error('Password cannot contain \'password\' in it');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }], avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('userTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
    const user = this;
    const newObj = user.toObject();
    delete newObj.password;
    delete newObj.tokens;
    delete newObj.avatar;
    return newObj;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = await jwt.sign({id: user._id}, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.statics.findUser = async (email, password) => {
    const user =  await User.findOne({email});
    if (!user) {
        throw new Error('Unable to login');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error('Unbale to login');
    }
    return user;
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
})

const User = mongoose.model('User', userSchema);



module.exports = User;