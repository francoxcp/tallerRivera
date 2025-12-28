/**
 * Validadores seguros para entrada de datos
 * Previene XSS e inyecciones
 */

// Validar que sea un email válido
export const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validar número de factura (alfanumérico con guiones)
export const validarNumeroFactura = (numero) => {
  const regex = /^[A-Z0-9-]{1,20}$/;
  return regex.test(numero);
};

// Validar placa de vehículo
export const validarPlaca = (placa) => {
  const regex = /^[A-Z0-9-]{1,10}$/;
  return regex.test(placa);
};

// Validar que sea un número positivo
export const validarPrecio = (precio) => {
  const num = parseFloat(precio);
  return !isNaN(num) && num >= 0 && num <= 999999.99;
};

// Validar cantidad (número entero positivo)
export const validarCantidad = (cantidad) => {
  const num = parseInt(cantidad, 10);
  return !isNaN(num) && num > 0 && num <= 9999;
};

// Validar texto (sin caracteres peligrosos)
export const validarTexto = (texto, minLength = 1, maxLength = 500) => {
  if (!texto || typeof texto !== 'string') return false;
  
  const trimmed = texto.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) return false;
  
  // Detectar intentos de inyección
  const dangerousPatterns = [
    /<script|javascript:|on\w+\s*=/gi, // XSS
    /(\bOR\b|\bAND\b|\bDROP\b|\bINSERT\b)/gi, // SQL injection
    /[<>'"]/g, // HTML/XML tags
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(texto));
};

// Sanitizar HTML (remover tags peligrosos)
export const sanitizarHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html; // textContent es seguro, no interpreta HTML
  return div.innerHTML;
};

// Validar contraseña
export const validarContrasena = (password) => {
  if (!password || password.length < 12) return false;
  
  const requisitos = {
    longitud: password.length >= 12,
    mayuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    numero: /[0-9]/.test(password),
    especial: /[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(password),
  };
  
  return Object.values(requisitos).every(x => x === true);
};

// Obtener requisitos de contraseña incumplidos
export const obtenerRequisitos = (password) => {
  return {
    longitud: { cumple: password.length >= 12, texto: 'Mínimo 12 caracteres' },
    mayuscula: { cumple: /[A-Z]/.test(password), texto: 'Al menos una mayúscula' },
    minuscula: { cumple: /[a-z]/.test(password), texto: 'Al menos una minúscula' },
    numero: { cumple: /[0-9]/.test(password), texto: 'Al menos un número' },
    especial: { cumple: /[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(password), texto: 'Al menos un carácter especial' },
  };
};

// Validar objeto factura completo
export const validarFactura = (factura) => {
  const errores = [];
  
  if (!validarNumeroFactura(factura.numero_factura)) {
    errores.push('Número de factura inválido');
  }
  
  if (!validarPlaca(factura.placa)) {
    errores.push('Placa de vehículo inválida');
  }
  
  if (factura.cliente && !validarTexto(factura.cliente, 1, 100)) {
    errores.push('Nombre de cliente inválido');
  }
  
  if (factura.servicios?.some(s => !validarPrecio(s.precio))) {
    errores.push('Uno o más precios de servicio son inválidos');
  }
  
  if (factura.repuestos?.some(r => !validarPrecio(r.precio_unitario))) {
    errores.push('Uno o más precios de repuesto son inválidos');
  }
  
  if (factura.servicios?.some(s => !validarCantidad(s.cantidad))) {
    errores.push('Una o más cantidades de servicio son inválidas');
  }
  
  if (factura.repuestos?.some(r => !validarCantidad(r.cantidad))) {
    errores.push('Una o más cantidades de repuesto son inválidas');
  }
  
  return {
    valido: errores.length === 0,
    errores,
  };
};

export default {
  validarEmail,
  validarNumeroFactura,
  validarPlaca,
  validarPrecio,
  validarCantidad,
  validarTexto,
  sanitizarHTML,
  validarContrasena,
  obtenerRequisitos,
  validarFactura,
};
