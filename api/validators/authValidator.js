const { body } = require('express-validator');

exports.signup = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Name must be between 3 to 50 characters'),
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Username must be between 3 to 50 characters"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is invalid"),
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6, max: 20 })
        .withMessage("Password must be between 6 to 20 characters")
];


exports.login = [
    body("email")
        .trim()
        .optional()
        .isEmail().withMessage("Email is invalid"),
    body("username")
        .trim()
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage("Username must be between 3 to 50 characters"),
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6, max: 20 })
        .withMessage("Password must be between 6 to 20 characters")
]