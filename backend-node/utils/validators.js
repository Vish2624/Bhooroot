// ============================================================
// utils/validators.js — Reusable Validation Rules
// ============================================================

const { body, query } = require('express-validator');

// ─── Auth Validators ──────────────────────────────────────
const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').isMobilePhone('any', { strictMode: false }).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Product Validators ───────────────────────────────────
const createProductValidators = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

const updateProductValidators = [
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
];

// ─── Order Validators ─────────────────────────────────────
const createOrderValidators = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
];

// ─── Query Validators ─────────────────────────────────────
const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

const productFilterValidators = [
  ...paginationValidators,
  query('sort').optional().isIn(['price-asc', 'price-desc', 'rating', 'name']).withMessage('Invalid sort option'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
];

// ─── ID Validators ────────────────────────────────────────
const mongoIdValidator = (paramName = 'id') =>
  body(paramName).isMongoId().withMessage(`Invalid ${paramName}`);

module.exports = {
  registerValidators,
  loginValidators,
  createProductValidators,
  updateProductValidators,
  createOrderValidators,
  paginationValidators,
  productFilterValidators,
  mongoIdValidator,
};
