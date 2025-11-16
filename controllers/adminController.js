// controllers/adminController.js
const jwt = require('jsonwebtoken');
const Rsvp = require('../models/Rsvp');

const ADMIN_CODE = process.env.ADMIN_CODE || 'MUDA-ESTE-CODIGO';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-mude-em-producao';

// POST /api/admin/login
async function adminLogin(req, res, next) {
  try {
    const { code } = req.body;

    if (!code || code !== ADMIN_CODE) {
      return res.status(401).json({ message: 'Código inválido' });
    }

    const token = jwt.sign(
      { role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}

// GET /api/admin/rsvps
async function listRsvps(req, res, next) {
  try {
    const list = await Rsvp.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/admin/rsvps/:id/status
async function updateRsvpStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Status inválido. Use um de: ${allowed.join(', ')}`,
      });
    }

    const updated = await Rsvp.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: 'RSVP não encontrado' });
    }

    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  adminLogin,
  listRsvps,
  updateRsvpStatus,
};
