// routes/rsvp.routes.js
const express = require('express');
const { createRsvp, getRsvpById } = require('../controllers/rsvpController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RSVP
 *   description: Gestão de pedidos de presença (convidados)
 */

/**
 * @swagger
 * /rsvps:
 *   post:
 *     summary: Cria um novo RSVP (pedido de presença)
 *     tags: [RSVP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               guests:
 *                 type: integer
 *                 example: 2
 *               message:
 *                 type: string
 *                 example: "Mal posso esperar pelo grande dia!"
 *               dietary:
 *                 type: string
 *                 example: "Sem glúten"
 *             required: [name, guests]
 *     responses:
 *       201:
 *         description: RSVP criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rsvp'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createRsvp);

/**
 * @swagger
 * /rsvps/{id}:
 *   get:
 *     summary: Obtém um RSVP por ID
 *     tags: [RSVP]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID do RSVP (MongoDB)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: RSVP encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rsvp'
 *       404:
 *         description: RSVP não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getRsvpById);

module.exports = router;
