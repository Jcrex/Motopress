// Carpeta de salida común de las herramientas (presentaciones empaquetadas y capturas).
// Por defecto es output/ en la raíz del repositorio. Se cambia, por orden de prioridad, con:
//   --out=<carpeta>          opción en la línea de órdenes
//   MOTOR_OUT=<carpeta>      variable de entorno
// Una ruta relativa se resuelve desde la raíz del repositorio.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function outDir(argv = process.argv) {
  const flag = argv.find((a) => a.startsWith('--out='));
  const dir = (flag && flag.slice(6)) || process.env.MOTOR_OUT || 'output';
  return path.resolve(ROOT, dir);
}

// Argumentos posicionales, sin opciones --x ni --x=y.
export const positional = (argv = process.argv) => argv.slice(2).filter((a) => !a.startsWith('--'));
