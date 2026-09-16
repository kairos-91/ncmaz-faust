import type { Access } from 'payload'

/**
 * Cualquiera puede leer. Se usa en el contenido publico del sitio
 * (proyectos, servicios, imagenes...) para que el frontend pueda consultarlo
 * sin autenticarse.
 */
export const publico: Access = () => true

/**
 * Solo usuarios con sesion iniciada en el panel.
 */
export const autenticado: Access = ({ req: { user } }) => Boolean(user)

/**
 * Solo el rol "admin". El cliente entra como "editor" y no puede, por ejemplo,
 * crear o borrar usuarios.
 */
export const soloAdmin: Access = ({ req: { user } }) => user?.rol === 'admin'

/**
 * Lectura publica solo de lo publicado. Los borradores quedan visibles
 * unicamente para quien tiene sesion en el panel, que es lo que hace posible
 * el "Vista previa" sin exponer el borrador al mundo.
 */
export const publicadoOAutenticado: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
