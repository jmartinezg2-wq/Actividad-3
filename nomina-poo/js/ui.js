const form = document.getElementById('employee-form');
const typeSelect = document.getElementById('type');
const dynamicFields = document.getElementById('dynamic-fields');
const errorBox = document.getElementById('error');
const resultsGrid = document.getElementById('results');
const totalNetoEl = document.getElementById('total');
const btnSamples = document.getElementById('load-samples');
const btnClear = document.getElementById('clear');

const EMPLOYEE_TYPES = [
  { value: 'Asalariado', label: 'Asalariado' },
  { value: 'Por Horas', label: 'Por horas' },
  { value: 'Por Comisión', label: 'Por comisión' },
  { value: 'Temporal', label: 'Temporal' }
];

const formatCOP = (valor) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
}).format(valor);

const escapeHtml = (valor) => String(valor).replace(/[&<>'"]/g, (caracter) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[caracter]);

function renderDynamicFields(tipo) {
  const campos = {
    Asalariado: `
      <label class="field"><span>Salario fijo mensual ($)</span>
        <input name="salarioBase" type="number" min="0" step="any" required></label>`,
    'Por Horas': `
      <label class="field"><span>Horas trabajadas</span>
        <input name="horasTrabajadas" type="number" min="0" step="any" required></label>
      <label class="field"><span>Tarifa por hora ($)</span>
        <input name="tarifaHora" type="number" min="0" step="any" required></label>
      <label class="check"><input name="aceptaFondoAhorro" type="checkbox">
        <span>Acepta el aporte voluntario al fondo de ahorro (2%, con más de 1 año)</span></label>`,
    'Por Comisión': `
      <label class="field"><span>Salario base ($)</span>
        <input name="salarioBase" type="number" min="0" step="any" required></label>
      <label class="field"><span>Ventas del mes ($)</span>
        <input name="ventasMes" type="number" min="0" step="any" required></label>
      <label class="field"><span>Comisión sobre ventas (%)</span>
        <input name="porcentajeComision" type="number" min="0" max="100" step="any" required></label>`,
    Temporal: `
      <label class="field"><span>Salario fijo mensual ($)</span>
        <input name="salarioBase" type="number" min="0" step="any" required></label>
      <label class="field"><span>Fecha de inicio (opcional)</span>
        <input name="fechaInicio" type="date"></label>
      <label class="field"><span>Fecha de finalización (opcional)</span>
        <input name="fechaFin" type="date"></label>`
  };

  dynamicFields.innerHTML = campos[tipo] ?? '';
}

function conceptosHtml(conceptos, clase, prefijo) {
  return conceptos.map((item) => `
    <dt class="${clase}">${prefijo} ${escapeHtml(item.concepto)}</dt>
    <dd class="${clase}">${formatCOP(item.valor)}</dd>`).join('');
}

function detallesEmpleadoHtml(empleado) {
  const detalles = [];
  if (empleado.horasTrabajadas !== undefined) {
    detalles.push(['Horas trabajadas', empleado.horasTrabajadas]);
    detalles.push(['Tarifa por hora', formatCOP(empleado.tarifaHora)]);
  }
  if (empleado.ventasMes !== undefined) {
    detalles.push(['Ventas del mes', formatCOP(empleado.ventasMes)]);
    detalles.push(['Comisión', `${empleado.porcentajeComision}%`]);
  }
  if (empleado.fechaInicio) {
    detalles.push(['Contrato', `${empleado.fechaInicio} a ${empleado.fechaFin}`]);
  }
  return detalles.map(([etiqueta, valor]) =>
    `<dt>${escapeHtml(etiqueta)}</dt><dd>${escapeHtml(valor)}</dd>`
  ).join('');
}

function renderReceipts({ desprendibles = [], totalNeto = 0 } = {}) {
  totalNetoEl.textContent = formatCOP(totalNeto);

  if (desprendibles.length === 0) {
    resultsGrid.innerHTML = '<p class="empty">No hay empleados liquidados. Agrega uno o carga los ejemplos.</p>';
    return;
  }

  resultsGrid.innerHTML = desprendibles.map((item) => `
    <article class="receipt">
      <header><h3>${escapeHtml(item.empleado.nombre)}</h3>
        <span class="badge">${escapeHtml(item.empleado.tipo)}</span></header>
      <dl>
        <dt>Años en la empresa</dt><dd>${escapeHtml(item.empleado.aniosServicio)}</dd>
        ${detallesEmpleadoHtml(item.empleado)}
        <dt>Salario bruto</dt><dd>${formatCOP(item.salarioBruto)}</dd>
        ${conceptosHtml(item.bonos, 'plus', '+')}
        <dt class="strong">Total salarial</dt><dd class="strong plus">${formatCOP(item.totalSalarial)}</dd>
        ${conceptosHtml(item.deducciones, 'minus', '−')}
        <dt class="strong">Total deducciones</dt><dd class="strong minus">${formatCOP(item.totalDeducciones)}</dd>
        <dt class="net">Salario neto</dt><dd class="net">${formatCOP(item.salarioNeto)}</dd>
        ${conceptosHtml(item.beneficios, 'benefit', 'Empresa:')}
        <dt class="benefit strong">Compensación total</dt>
        <dd class="benefit strong">${formatCOP(item.totalCompensacion)}</dd>
      </dl>
    </article>`).join('');
}

function showError(mensaje) {
  errorBox.hidden = !mensaje;
  errorBox.textContent = mensaje || '';
  if (mensaje) errorBox.focus();
}

async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error(body.error || 'No fue posible completar la operación.');
  }
  return body;
}

async function actualizarNomina() {
  try {
    const body = await request('/api/nomina');
    renderReceipts(body.data);
  } catch (error) {
    showError(error.message);
  }
}

function obtenerPayload() {
  const datos = new FormData(form);
  const payload = {
    tipo: typeSelect.value,
    nombre: datos.get('name'),
    aniosServicio: datos.get('yearsOfService'),
    salarioBase: datos.get('salarioBase'),
    horasTrabajadas: datos.get('horasTrabajadas'),
    tarifaHora: datos.get('tarifaHora'),
    aceptaFondoAhorro: form.elements.aceptaFondoAhorro?.checked === true,
    ventasMes: datos.get('ventasMes'),
    porcentajeComision: datos.get('porcentajeComision')
  };
  const fechaInicio = datos.get('fechaInicio');
  const fechaFin = datos.get('fechaFin');
  if (fechaInicio) payload.fechaInicio = fechaInicio;
  if (fechaFin) payload.fechaFin = fechaFin;
  return payload;
}

EMPLOYEE_TYPES.forEach(({ value, label }) => typeSelect.add(new Option(label, value)));
typeSelect.addEventListener('change', () => {
  renderDynamicFields(typeSelect.value);
  showError();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError();
  try {
    const body = await request('/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obtenerPayload())
    });
    renderReceipts(body.consolidado);
    form.reset();
    typeSelect.value = EMPLOYEE_TYPES[0].value;
    renderDynamicFields(typeSelect.value);
  } catch (error) {
    showError(error.message);
  }
});

btnSamples.addEventListener('click', async () => {
  showError();
  try {
    renderReceipts((await request('/api/ejemplos', { method: 'POST' })).data);
  } catch (error) {
    showError(error.message);
  }
});

btnClear.addEventListener('click', async () => {
  showError();
  try {
    renderReceipts((await request('/api/empleados', { method: 'DELETE' })).data);
  } catch (error) {
    showError(error.message);
  }
});

errorBox.tabIndex = -1;
renderDynamicFields(typeSelect.value);
actualizarNomina();
