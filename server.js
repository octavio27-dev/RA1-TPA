// ===== Integrante 3: Backend con Node.js + Estructuras de datos =====
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Estructuras de datos propias ----------
class Cola {                       // FIFO: el primero que llega, el primero que sale
  constructor() { this.items = []; }
  encolar(x) { this.items.push(x); }
  desencolar() { return this.items.shift(); }
  buscarYSacar(pred) {             // saca el primero que cumpla la condición (respeta orden)
    const i = this.items.findIndex(pred);
    return i === -1 ? undefined : this.items.splice(i, 1)[0];
  }
  verTodos() { return [...this.items]; }
}

class Pila {                       // LIFO: lo último que entra, lo primero que sale
  constructor() { this.items = []; }
  apilar(x) { this.items.push(x); }
  desapilar() { return this.items.pop(); }
  verTodos() { return [...this.items].reverse(); } // el más reciente primero
}

// ---------- Datos en memoria ----------
const reservas = [];               // { id, cliente, fecha, hora, cancha, estado }
const colaEspera = new Cola();     // reservas en lista de espera
const historial = new Pila();      // pagos y confirmaciones recientes
let siguienteId = 1;

const mismoHorario = (a, b) =>
  a.fecha === b.fecha && a.hora === b.hora && a.cancha === b.cancha;

const horarioOcupado = (r) =>
  reservas.some(x => x.estado === 'confirmada' && mismoHorario(x, r));

// ---------- Rutas ----------
app.get('/api/reservas', (req, res) => res.json(reservas));
app.get('/api/cola', (req, res) => res.json(colaEspera.verTodos()));
app.get('/api/historial', (req, res) => res.json(historial.verTodos()));

// Crear reserva: si el horario está ocupado va a la COLA
app.post('/api/reservas', (req, res) => {
  const { cliente, fecha, hora, cancha } = req.body;
  if (!cliente || !fecha || !hora || !cancha)
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });

  const nueva = { id: siguienteId++, cliente: cliente.trim(), fecha, hora, cancha, estado: 'confirmada' };
  if (horarioOcupado(nueva)) {
    nueva.estado = 'en espera';
    colaEspera.encolar(nueva);
  } else {
    historial.apilar({ tipo: 'Reserva confirmada', cliente: nueva.cliente, reservaId: nueva.id, hora: new Date().toLocaleTimeString() });
  }
  reservas.push(nueva);
  res.status(201).json(nueva);
});

// Cancelar reserva: libera el horario y se DESENCOLA al siguiente en espera
app.delete('/api/reservas/:id', (req, res) => {
  const r = reservas.find(x => x.id === Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Reserva no encontrada.' });

  const eraConfirmada = r.estado === 'confirmada';
  if (r.estado === 'en espera') colaEspera.buscarYSacar(x => x.id === r.id);
  r.estado = 'cancelada';

  let promovida = null;
  if (eraConfirmada) {
    promovida = colaEspera.buscarYSacar(x => mismoHorario(x, r));
    if (promovida) {
      promovida.estado = 'confirmada';
      historial.apilar({ tipo: 'Pasó de la cola a confirmada', cliente: promovida.cliente, reservaId: promovida.id, hora: new Date().toLocaleTimeString() });
    }
  }
  res.json({ cancelada: r, promovida });
});

// Registrar pago: se APILA en el historial
app.post('/api/reservas/:id/pago', (req, res) => {
  const r = reservas.find(x => x.id === Number(req.params.id));
  if (!r || r.estado !== 'confirmada')
    return res.status(400).json({ error: 'Solo se pueden pagar reservas confirmadas.' });
  historial.apilar({ tipo: 'Abono registrado', cliente: r.cliente, reservaId: r.id, hora: new Date().toLocaleTimeString() });
  res.json({ ok: true });
});

// Deshacer último movimiento: se DESAPILA
app.post('/api/historial/deshacer', (req, res) => {
  const ultimo = historial.desapilar();
  if (!ultimo) return res.status(400).json({ error: 'El historial está vacío.' });
  res.json(ultimo);
});

app.listen(3000, () => console.log('Servidor listo en http://localhost:3000'));
