import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';

const router = Router();

const userFields = {
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
  email: z.string().trim().email('Ingresa un correo valido').max(254),
  phone: z.string().trim().max(30).optional().default(''),
  position: z.string().trim().max(80).optional().default(''),
  department: z.string().trim().max(80).optional().default(''),
  status: z.enum(['active', 'inactive']).optional().default('active')
};

const createUserSchema = z.object(userFields).strict();
const updateUserSchema = z
  .object({
    ...userFields,
    phone: userFields.phone,
    position: userFields.position,
    department: userFields.department,
    status: userFields.status
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar'
  });

router.get('/stats', async (_req, res) => {
  const [total, active, inactive] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'inactive' })
  ]);
  res.json({ total, active, inactive });
});

router.get('/', async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
  const query = {};

  if (req.query.status === 'active' || req.query.status === 'inactive') {
    query.status = req.query.status;
  }
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const search = req.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
  ]);

  res.json({ users, total, page, pages: Math.ceil(total / limit), limit });
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) {
    return res.status(404).json({ message: 'No se encontro el usuario' });
  }
  return res.json(user);
});

router.post('/', async (req, res) => {
  const data = createUserSchema.parse(req.body);
  const user = await User.create(data);
  res.status(201).json(user);
});

router.patch('/:id', async (req, res) => {
  const data = updateUserSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true
  });
  if (!user) {
    return res.status(404).json({ message: 'No se encontro el usuario' });
  }
  return res.json(user);
});

router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'No se encontro el usuario' });
  }
  return res.status(204).end();
});

export default router;
