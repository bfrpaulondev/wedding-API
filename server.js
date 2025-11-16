// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const rsvpRoutes = require('./routes/rsvp.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// CORS liberado para dev
app.use(
  cors({
    origin: true, // reflete qualquer origin (http/https)
    credentials: true,
  }),
);

// Middlewares básicos
app.use(express.json());
app.use(morgan('dev'));

// Conexão MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wedding_rsvp';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });

// Swagger (OpenAPI 3)
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Wedding API',
      version: '1.0.0',
      description: 'API RESTful para gestão de RSVPs, usuários e admin.',
    },
    // URL relativa -> usa o mesmo host/protocolo do navegador (evita erro de scheme)
    servers: [
      {
        url: '/api',
        description: 'Dev local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
      schemas: {
        // --- RSVP ---
        Rsvp: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID do RSVP (MongoDB)',
            },
            name: {
              type: 'string',
              example: 'João Silva',
            },
            guests: {
              type: 'integer',
              minimum: 1,
              example: 2,
            },
            message: {
              type: 'string',
              nullable: true,
              example: 'Mal posso esperar pelo grande dia!',
            },
            dietary: {
              type: 'string',
              nullable: true,
              example: 'Vegetariano',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              example: 'PENDING',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['name', 'guests'],
        },

        // --- Admin Auth por código ---
        AdminLoginRequest: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'MEU-CODIGO-SECRETO' },
          },
          required: ['code'],
        },
        AdminLoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT para autenticação admin' },
          },
        },
        UpdateStatusRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
            },
          },
          required: ['status'],
        },

        // --- User / Auth (cadastro e login) ---
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'João Silva' },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@email.com',
            },
            role: {
              type: 'string',
              enum: ['GUEST', 'ADMIN'],
              example: 'GUEST',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'João Silva' },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@email.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'senha-super-secreta',
            },
          },
          required: ['name', 'email', 'password'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@email.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'senha-super-secreta',
            },
          },
          required: ['email', 'password'],
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT para autenticação',
            },
          },
        },

        // --- Erro genérico ---
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API (todas sob /api por causa do servers.url acima)
app.use('/api/auth', authRoutes);
app.use('/api/rsvps', rsvpRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handler de erros genérico
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno no servidor',
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API ouvindo em http://localhost:${PORT}`);
  console.log(`Swagger em http://localhost:${PORT}/api-docs`);
});
