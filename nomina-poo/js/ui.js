/**
 * @file ui.js
 * @description Controlador de la interfaz de usuario en el frontend.
 * Conecta el formulario interactivo con el Backend y renderiza los desprendibles de pago.
 */

const form = document.getElementById('employee-form');
const typeSelect = document.getElementById('type');
const dynamicFields = document.getElementById('dynamic-fields');
const errorBox = document.getElementById('error');
const resultsGrid = document.getElementById('results');
const totalNetoEl = document.getElementById('total');
const btnSamples = document.getElementById('load-samples');
const btnClear = document.getElementById('clear');

const EMPLOYEE_TYPES = [
  { value: 'Asalariado', label: 'Asalariado (Salario fijo + Bono antigüedad + Alimentación)' },
  { value: 'Por Horas', label: 'Por Horas (Horas extras 1.5x + Fondo ahorro)' },
  { value: 'Por Comisión', label: 'Por Comisión (Salario base + % Ventas + Bono meta)' },
  { value: 'Temporal', label: 'Temporal (A término fijo, sin bonos)' }
];

const formatCOP = (num) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(num);
};

// =========================================================================
// RENDERIZADO DINÁMICO DE CAMPOS SEGÚN EL TIPO DE EMPLEADO
// =========================================================================
function renderDynamicFields(type) {
  dynamicFields.innerHTML = '';

  switch (type) {
    case 'Asalariado':
      dynamicFields.innerHTML = `
        <label class="field">
          <span>Salario fijo mensual ($)</span>
          <input name="salarioBase" type="number" min="0" step="any" placeholder="Ej: 3000000" required>
        </label>
      `;
      break;

    case 'Por Horas':
      dynamicFields.innerHTML = `
        <label class="field">
          <span>Horas trabajadas en el mes</span>
          <input name="horasTrabajadas" type="number" min="0" step="any" placeholder="Ej: 45" required>
        </label>
        <label class="field">
          <span>Tarifa por hora ($)</span>
          <input name="tarifaHora" type="number" min="0" step="any" placeholder="Ej: 25000" required>
        </label>
        <label class="check">
          <input name="aceptaFondoAhorro" type="checkbox">
          <span>Acepta acceso al Fondo de Ahorro (2% mensual si lleva más de 1 año)</span>
        </label>
      `;
      break;

    case 'Por Comisión':
      dynamicFields.innerHTML = `
        <label class="field">
          <span>Salario base ($)</span>
          <input name="salarioBase" type="number" min="0" step="any" placeholder="Ej: 1500000" required>
        </label>
        <label class="field">
          <span>Total ventas en el mes ($)</span>
          <input name="ventasMes" type="number" min="0" step="any" placeholder="Ej: 22000000" required>
        </label>
        <label class="field">
          <span>Comisión sobre ventas (%)</span>
          <input name="porcentajeComision" type="number" min="0" step="any" value="5" required>
        </label>
      `;
      break;

    case 'Temporal':
      dynamicFields.innerHTML = `
        <label class="field">
          <span>Salario mensual pactado ($)</span>
          <input name="salarioBase" type="number" min="0" step="any" placeholder="Ej: 1800000" required>
        </label>
        <label class="field">
          <span>Duración del contrato (meses)</span>
          <input name="duracionMeses" type="number" min="1" step="1" value="6" required>
        </label>
      `;
      break;
  }
}

// =========================================================================
// RENDERIZADO DE DESPRENDIBLES
// =========================================================================
function renderReceipts(data) {
  const { desprendibles = [], totalNeto = 0 } = data;

  totalNetoEl.textContent = formatCOP(totalNeto);

  if (desprendibles.length === 0) {
    resultsGrid.innerHTML = '<p class="empty">No hay empleados liquidados. Agrega uno o carga los ejemplos.</p>';
    return;
  }

  resultsGrid.innerHTML = desprendibles.map(d => {
    const { empleado, salarioBruto, bonos, beneficios, totalDevengado, deducciones, totalDeducciones, salarioNeto } = d;

    const bonosHtml = bonos.map(b => `
      <dt class="plus">+ ${b.concepto}</dt>
      <dd class="plus">${formatCOP(b.valor)}</dd>
    `).join('');

    const beneficiosHtml = beneficios.map(ben => `
      <dt class="plus">+ ${ben.concepto}</dt>
      <dd class="plus">${formatCOP(ben.valor)}</dd>
    `).join('');

    const deduccionesHtml = deducciones.map(ded => `
      <dt class="minus">- ${ded.concepto}</dt>
      <dd class="minus">${formatCOP(ded.valor)}</dd>
    `).join('');

    return `
      <article class="receipt">
        <header>
          <h3>${empleado.nombre}</h3>
          <span class="badge">${empleado.tipo}</span>
        </header>
        <dl>
          <dt>Años en empresa:</dt>
          <dd>${empleado.aniosServicio} año(s)</dd>

          <dt>Salario Bruto:</dt>
          <dd>${formatCOP(salarioBruto)}</dd>

          ${bonosHtml}
          ${beneficiosHtml}

          <dt class="strong">Total Devengado:</dt>
          <dd class="strong plus">${formatCOP(totalDevengado)}</dd>

          ${deduccionesHtml}

          <dt class="strong">Total Deducciones:</dt>
          <dd class="strong minus">${formatCOP(totalDeducciones)}</dd>

          <dt class="net">Salario Neto:</dt>
          <dd class="net">${formatCOP(salarioNeto)}</dd>
        </dl>
      </article>
    `;
  }).join('');
}

function showError(msg) {
  if (!msg) {
    errorBox.hidden = true;
    errorBox.textContent = '';
  } else {
    errorBox.hidden = false;
    errorBox.textContent = msg;
  }
}

// =========================================================================
// CONSUMO DE LA API REST (BACKEND)
// =========================================================================
async function fetchNomina() {
  try {
    const res = await fetch('/api/nomina');
    const json = await res.json();
    if (json.ok) {
      renderReceipts(json.data);
    }
  } catch (err) {
    console.error('Error al consultar nómina:', err);
  }
}

// Inicialización de select
EMPLOYEE_TYPES.forEach(t => {
  const opt = document.createElement('option');
  opt.value = t.value;
  opt.textContent = t.label;
  typeSelect.appendChild(opt);
});

typeSelect.addEventListener('change', () => {
  renderDynamicFields(typeSelect.value);
  showError(null);
});

// Enviar formulario (Agregar empleado)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(null);

  const formData = new FormData(form);
  const payload = {
    tipo: typeSelect.value,
    nombre: formData.get('name'),
    aniosServicio: Number(formData.get('yearsOfService')),
    salarioBase: Number(formData.get('salarioBase') || 0),
    horasTrabajadas: Number(formData.get('horasTrabajadas') || 0),
    tarifaHora: Number(formData.get('tarifaHora') || 0),
    aceptaFondoAhorro: form.elements['aceptaFondoAhorro'] ? form.elements['aceptaFondoAhorro'].checked : false,
    ventasMes: Number(formData.get('ventasMes') || 0),
    porcentajeComision: Number(formData.get('porcentajeComision') || 0),
    duracionMeses: Number(formData.get('duracionMeses') || 0)
  };

  try {
    const res = await fetch('/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!json.ok) {
      showError(json.error || 'Ocurrió un error al procesar el empleado.');
      return;
    }

    renderReceipts(json.consolidado);
    form.reset();
    typeSelect.value = EMPLOYEE_TYPES[0].value;
    renderDynamicFields(typeSelect.value);
  } catch (err) {
    showError('Error de comunicación con el servidor backend.');
  }
});

// Cargar ejemplos
btnSamples.addEventListener('click', async () => {
  showError(null);
  try {
    const res = await fetch('/api/ejemplos', { method: 'POST' });
    const json = await res.json();
    if (json.ok) {
      renderReceipts(json.data);
    }
  } catch (err) {
    showError('Error al cargar ejemplos desde el servidor.');
  }
});

// Vaciar lista
btnClear.addEventListener('click', async () => {
  showError(null);
  try {
    const res = await fetch('/api/empleados', { method: 'DELETE' });
    const json = await res.json();
    if (json.ok) {
      renderReceipts(json.data);
    }
  } catch (err) {
    showError('Error al vaciar la lista.');
  }
});

// Render inicial
renderDynamicFields(typeSelect.value);
fetchNomina();
