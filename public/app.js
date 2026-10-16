// ===== Integrante 2: Interacción / JavaScript cliente =====
const $ = (id) => document.getElementById(id);
const campos = ['cliente', 'fecha', 'hora', 'cancha'];

// Llenar horas de 8:00 a 22:00
for (let h = 8; h <= 22; h++) {
  const texto = String(h).padStart(2, '0') + ':00';
  $('hora').insertAdjacentHTML('beforeend', `<option>${texto}</option>`);
}
// No permitir fechas pasadas (usa la fecha local, no la UTC)
const hoy = new Date();
$('fecha').min = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

// ---------- Validaciones en pantalla ----------
function validar() {
  let ok = true;
  campos.forEach(id => {
    const vacio = !$(id).value.trim();
    $(id).classList.toggle('invalido', vacio);
    if (vacio) ok = false;
  });
  $('error').textContent = ok ? '' : 'Completa todos los campos antes de reservar.';
  return ok;
}
campos.forEach(id => $(id).addEventListener('input', () => $(id).classList.remove('invalido')));

// ---------- Llamadas al servidor ----------
// Si abres index.html con doble clic (file://) igual se conecta al servidor en el puerto 3000
const BASE = location.protocol === 'file:' ? 'http://localhost:3000' : '';

async function api(url, metodo = 'GET', cuerpo) {
  let r;
  try {
    r = await fetch(BASE + url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Ejecuta "npm start" en la terminal de VS Code.');
  }
  const datos = await r.json();
  if (!r.ok) throw new Error(datos.error || 'Error inesperado');
  return datos;
}

// ---------- Eventos de botones ----------
$('form-reserva').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validar()) return;
  try {
    const nueva = await api('/api/reservas', 'POST', Object.fromEntries(campos.map(id => [id, $(id).value])));
    $('form-reserva').reset();
    $('error').textContent = nueva.estado === 'en espera'
      ? 'Ese horario está ocupado. Quedaste en la cola de espera.' : '';
    refrescar().catch(err => { $('error').textContent = err.message; });
  } catch (err) { $('error').textContent = err.message; }
});

$('btn-deshacer').addEventListener('click', async () => {
  try { await api('/api/historial/deshacer', 'POST'); refrescar(); }
  catch (err) { alert(err.message); }
});

async function cancelar(id) {
  if (!confirm('¿Cancelar esta reserva?')) return;
  await api(`/api/reservas/${id}`, 'DELETE');
  refrescar().catch(err => { $('error').textContent = err.message; });
}
async function pagar(id) {
  try { await api(`/api/reservas/${id}/pago`, 'POST'); refrescar(); }
  catch (err) { alert(err.message); }
}
window.cancelar = cancelar; window.pagar = pagar;

// ---------- Pintar pantalla ----------
const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function refrescar() {
  const [reservas, cola, historial] = await Promise.all([
    api('/api/reservas'), api('/api/cola'), api('/api/historial')
  ]);

  $('tabla-reservas').innerHTML = reservas.map(r => {
    const clase = r.estado === 'en espera' ? 'espera' : r.estado;
    const acciones = r.estado === 'cancelada' ? '' : `
      ${r.estado === 'confirmada' ? `<button class="mini" onclick="pagar(${r.id})">Registrar abono</button>` : ''}
      <button class="mini peligro" onclick="cancelar(${r.id})">Cancelar</button>`;
    return `<tr><td>${r.id}</td><td>${esc(r.cliente)}</td><td>${r.fecha}</td><td>${r.hora}</td><td>${r.cancha}</td>
      <td><span class="estado ${clase}">${r.estado}</span></td><td class="acciones">${acciones}</td></tr>`;
  }).join('');
  $('vacio-reservas').hidden = reservas.length > 0;

  $('lista-cola').innerHTML = cola.map(r =>
    `<li>${esc(r.cliente)}<small>${r.cancha} · ${r.fecha} · ${r.hora}</small></li>`).join('');
  $('vacio-cola').hidden = cola.length > 0;

  $('lista-pila').innerHTML = historial.map(h =>
    `<li>${esc(h.tipo)}: ${esc(h.cliente)}<small>Reserva ${h.reservaId} · ${h.hora}</small></li>`).join('');
  $('vacio-pila').hidden = historial.length > 0;
}
refrescar().catch(err => { $('error').textContent = err.message; });
