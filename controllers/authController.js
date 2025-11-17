// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-mude-em-producao';

function buildUserResponse(user, token) {
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Nome, email e senha são obrigatórios' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Já existe um usuário com esse email, caso tenha perdido os seus acessos entre em contacto com os noivos.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.status(201).json(buildUserResponse(user, token));
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.json(buildUserResponse(user, token));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
};
