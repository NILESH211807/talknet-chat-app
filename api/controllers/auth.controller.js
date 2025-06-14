const userModel = require('../models/user.model');
const { validationResult } = require('express-validator');


function formatName(name) {
    return name.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\b\w/g, (char) => char.toLocaleUpperCase());
}

function formatUsername(username) {
    username = username.replace(/\s+/g, '').replace(/^\s+|\s+$/g, '');
    if (username.charAt(0) !== '@') {
        username = '@' + username;
    }
    // Remove all non-alphanumeric characters except for "@" and ensure it's only letters/numbers
    username = username.replace(/[^a-zA-Z0-9@]/g, '');
    // Format: Make the first letter after "@" lowercase
    username = username.replace(/\b\w/g, (char) => char.toLocaleLowerCase());
    return username;
}


// signup 
module.exports.signup = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const formattedUsername = formatUsername(username);
        let user = await userModel.findOne({ $or: [{ username: formattedUsername }, { email }] });

        if (user) {
            let matched = '';

            if (user.username == formattedUsername) {
                matched = 'username';
            } else if (user.email == email) {
                matched = 'email';
            }

            if (matched) {
                return res.status(400).json({
                    success: false,
                    message: `${matched.charAt(0).toUpperCase() + matched.slice(1)} already exists`
                });
            }
        }

        const newUser = new userModel({
            name: formatName(name),
            username: formattedUsername,
            email,
            password
        });

        await newUser.save();

        const token = newUser.generateToken();

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return res.status(200).json({
            success: true, message: 'Account created successfully',
            data: {
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                token
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};



// login
module.exports.login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {

        const { email, username, password } = req.body;

        if (!email && !username) {
            return res.status(400).json({
                success: false, message: 'Email or username is required'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false, message: 'Password is required'
            });
        }

        const formattedUsername = username ? formatUsername(username) : null;

        const user = await userModel.findOne({
            $or: [
                { username: formattedUsername }, { email }
            ]
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false, message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false, message: 'Invalid credentials'
            });
        }

        const token = user.generateToken();

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return res.status(200).json({
            success: true, message: 'Login successful',
            data: {
                name: user.name,
                username: user.username,
                email: user.email,
                token
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }

}