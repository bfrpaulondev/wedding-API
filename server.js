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

/* ########################################
   cors configuration
######################################## */

const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin(origin, callback) {
      // requests sem origin (curl, postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// preflight para todos os endpoints
app.options('*', cors());

/* ########################################
   middlewares base
######################################## */

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ########################################
   swagger
######################################## */

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wedding API',
      version: '1.0.0',
      description: 'API do casamento para RSVP e gestão de convidados',
    },
    servers: [
      {
        url: '/api',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ########################################
   routes
######################################## */

app.use('/api/rsvps', rsvpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// opcional: healthcheck simples
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* ########################################
   error handler global
######################################## */

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origem não permitida por CORS' });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Erro interno no servidor',
  });
});

/* ########################################
   mongo + start server
######################################## */

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log(`API ouvindo em http://localhost:${PORT}`);
      console.log(`Swagger em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });
