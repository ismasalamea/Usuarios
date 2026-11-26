import mongoose from 'mongoose';
import { ZodError } from 'zod';

export function notFound(_req, res) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

export function handleError(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Revisa los datos ingresados',
      errors: error.issues.map(({ path, message }) => ({ field: path.join('.'), message }))
    });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: error.message });
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'El identificador del usuario no es valido' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Ocurrio un error inesperado en el servidor' });
}
