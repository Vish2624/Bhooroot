// ============================================================
// config/swagger.js — Swagger/OpenAPI Documentation
// ============================================================

const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Uhazvumart API',
    description: 'REST API for Uhazvumart Agro Store',
    version: '1.0.0',
    contact: {
      name: 'Uhazvumart Support',
      email: 'support@uhazvumart.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server',
    },
    {
      url: 'https://api.uhazvumart.com',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'vendor', 'admin'] },
          isVerified: { type: 'boolean' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          stock: { type: 'number' },
          rating: { type: 'number', minimum: 0, maximum: 5 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          items: { type: 'array' },
          totalPrice: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          errors: { type: 'array' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        responses: {
          '200': { description: 'API is running' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products with filters',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Items per page (max 100)',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category',
          },
          {
            name: 'q',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search query',
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number' },
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number' },
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['price-asc', 'price-desc', 'rating', 'name'] },
          },
        ],
        responses: {
          '200': { description: 'List of products' },
        },
      },
    },
  },
};

module.exports = swaggerDoc;
