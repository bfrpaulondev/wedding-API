// controllers/rsvpController.js
const Rsvp = require('../models/Rsvp');

// POST /api/rsvps
async function createRsvp(req, res, next) {
  try {
    const { name, guests, message, dietary } = req.body;

    if (!name || !guests) {
      return res.status(400).json({ message: 'Nome e número de pessoas são obrigatórios' });
    }

    const rsvp = await Rsvp.create({
      name: String(name).trim(),
      guests: Number(guests),
      message,
      dietary,
    });

    return res.status(201).json(rsvp);
  } catch (err) {
    return next(err);
  }
}

// GET /api/rsvps/:id
async function getRsvpById(req, res, next) {
  try {
    const { id } = req.params;
    const rsvp = await Rsvp.findById(id);

    if (!rsvp) {
      return res.status(404).json({ message: 'RSVP não encontrado' });
    }

    return res.json(rsvp);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createRsvp,
  getRsvpById,
};
