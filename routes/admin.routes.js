// routes/admin.routes.js
const express = require('express');
const {
  adminLogin,
  listRsvps,
  updateRsvpStatus,
} = require('../controllers/adminController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints para os noivos (admin)
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login admin usando código secreto
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Login efetuado, retorna token JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       401:
 *         description: Código inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', adminLogin);

/**
 * @swagger
 * /admin/rsvps:
 *   get:
 *     summary: Lista todos os RSVPs (apenas admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de RSVPs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rsvp'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/rsvps', authAdmin, listRsvps);

/**
 * @swagger
 * /admin/rsvps/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um RSVP (apenas admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID do RSVP
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: RSVP atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rsvp'
 *       400:
 *         description: Status inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: RSVP não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/rsvps/:id/status', authAdmin, updateRsvpStatus);

module.exports = router;
