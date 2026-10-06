function esValorAusente(valor) {
  return valor === null
    || valor === undefined
    || (typeof valor === 'string' && valor.trim() === '');
}

export function validarNumeroNoNegativo(valor, nombre) {
  if (esValorAusente(valor)) {
    throw new Error(`${nombre} es un campo obligatorio.`);
  }

  if (typeof valor !== 'number' && typeof valor !== 'string') {
    throw new Error(`${nombre} debe ser un número finito mayor o igual a 0.`);
  }

  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) {
    throw new Error(`${nombre} debe ser un número finito mayor o igual a 0.`);
  }
  return numero;
}

export function validarPorcentaje(valor, nombre, maximo = 100) {
  const porcentaje = validarNumeroNoNegativo(valor, nombre);
  if (porcentaje > maximo) {
    throw new Error(`${nombre} no puede superar ${maximo}%.`);
  }
  return porcentaje;
}

export function validarTasa(valor, nombre, maximo = 1) {
  const tasa = validarNumeroNoNegativo(valor, nombre);
  if (tasa > maximo) {
    throw new Error(`${nombre} debe estar entre 0 y ${maximo}.`);
  }
  return tasa;
}

/** Impide que Date normalice silenciosamente fechas civiles inexistentes. */
export function validarFechaISO(valor, nombre) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new Error(`${nombre} debe usar el formato AAAA-MM-DD.`);
  }

  const fecha = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    throw new Error(`${nombre} no es una fecha válida.`);
  }
  return valor;
}
