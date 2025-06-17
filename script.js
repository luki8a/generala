// =========================
// VARIABLES GLOBALES
// =========================
let jugadores = [];
let cantidadJugadores = 2;
let jugadas = [
    "1", "2", "3", "4", "5", "6",
    "ESCALERA", "FULL", "PÓKER", "GENERALA", "DOBLE GENERALA", "TOTAL"
];
let puntajes = [];
let turno = 0;

// =========================
// MODAL JUGADORES
// =========================
const modalJugadores = document.getElementById('modal-jugadores');
const cantidadBtns = document.querySelectorAll('.btn-cant');
const inputsJugadores = document.getElementById('inputs-jugadores');
const formJugadores = document.getElementById('form-jugadores');
const closeModalJugadores = document.getElementById('close-modal-jugadores');

cantidadBtns.forEach(btn => {
    btn.onclick = () => {
        cantidadJugadores = parseInt(btn.dataset.cant);
        cantidadBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        renderInputsJugadores();
    };
});

function renderInputsJugadores() {
    inputsJugadores.innerHTML = '';
    for (let i = 0; i < cantidadJugadores; i++) {
        inputsJugadores.innerHTML += `<input type="text" placeholder="Jugador ${i+1}" required maxlength="10">`;
    }
}
renderInputsJugadores();

formJugadores.onsubmit = e => {
    e.preventDefault();
    jugadores = Array.from(inputsJugadores.querySelectorAll('input')).map(input => input.value.trim().toUpperCase() || `J${Math.random().toString(36).substr(2,2)}`);
    if (jugadores.some(j => !j)) {
        mostrarAlerta("Todos los nombres son obligatorios");
        return;
    }
    puntajes = jugadores.map(() => Array(jugadas.length).fill('-'));
    puntajes.forEach(p => p[p.length-1] = 0); // Total en 0
    modalJugadores.classList.remove('active');
    renderTablero();
};

closeModalJugadores.onclick = () => modalJugadores.classList.remove('active');
function mostrarModalJugadores() {
    modalJugadores.classList.add('active');
}
window.onload = () => {
    mostrarModalJugadores();
};

// =========================
// TABLERO
// =========================
function renderTablero() {
    const tablero = document.getElementById('tablero');
    // Calcular posiciones
    let totales = jugadores.map((_, idx) => ({
        idx,
        total: parseInt(puntajes[idx][jugadas.length-1]) || 0
    }));
    totales.sort((a, b) => b.total - a.total);
    let posiciones = Array(jugadores.length);
    totales.forEach((t, i) => posiciones[t.idx] = i + 1);

    let html = `<table class="tabla-generala"><thead><tr><th></th>`;
    jugadores.forEach((j, i) => {
        // Mostrar posición al lado del nombre
        let pos = posiciones[i];
        let posStr = `<span class="posicion ${pos === 1 ? 'primero' : ''}">${pos}°</span>`;
        html += `<th><div class="nombre">${j}<span class="posicion ${pos === 1 ? 'primero' : ''}">${pos}°</span></div></th>`;
    });
    html += `</tr></thead><tbody>`;
    jugadas.forEach((jugada, idx) => {
        let jugadaClass = "jugada";
        if (jugada === "TOTAL") jugadaClass += " total-label";
        else if (
            ["ESCALERA", "FULL", "PÓKER", "GENERALA", "DOBLE GENERALA"].includes(jugada)
        ) jugadaClass += " especial";
        html += `<tr><td class="${jugadaClass}">${jugada}</td>`;
        jugadores.forEach((_, j) => {
            let cellClass = idx === jugadas.length-1 ? 'total' : '';
            html += `<td class="${cellClass}" data-j="${j}" data-i="${idx}">${puntajes[j][idx]}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table>`;
    tablero.innerHTML = html;

    // Click para ingresar puntaje (excepto TOTAL)
    document.querySelectorAll('.tabla-generala td:not(.total)').forEach(td => {
        td.onclick = () => {
            const j = td.dataset.j, i = td.dataset.i;
            if (i == jugadas.length-1) return;
            mostrarModalPuntaje(j, i);
        };
    });
    actualizarColoresNombres();
}

function actualizarColoresNombres() {
    document.querySelectorAll('.nombre').forEach((th, i) => {
        const colores = ['#b794f4','#38b6ff','#ffd600','#38a169','#ff6f61','#ffb347','#00b894'];
        th.style.color = colores[i % colores.length];
    });
}

function actualizarTotal(j) {
    let total = 0;
    for (let i = 0; i < jugadas.length-1; i++) {
        let val = puntajes[j][i];
        // Si es número o termina en "s", toma el valor numérico
        if (typeof val === "string" && val.endsWith("s")) {
            val = parseInt(val);
        }
        val = parseInt(val);
        if (!isNaN(val)) total += val;
    }
    puntajes[j][jugadas.length-1] = total;
}

// =========================
// MODAL PUNTAJE
// =========================
const modalPuntaje = document.getElementById('modal-puntaje');
const puntajeContent = document.getElementById('puntaje-content');
function mostrarModalPuntaje(j, i) {
    let opciones = '';
    const valoresNumeros = [
        [1,2,3,4,5],      // 1
        [2,4,6,8,10],     // 2
        [3,6,9,12,15],    // 3
        [4,8,16,20,24],   // 4
        [5,10,15,20,25],  // 5
        [6,12,18,24,30]   // 6
    ];
    const valoresEspeciales = {
        6: [20, '25s'],      // Escalera
        7: [30, '35s'],      // Full
        8: [40, '45s'],      // Poker
        9: [50, '55s'],      // Generala
        10: [100, '100s']    // Generala doble
    };

        if (i < 6) {
        opciones += valoresNumeros[i].map(val =>
            `<button class="puntaje-opcion">${val}</button>`
        ).join('');
        opciones += `<button class="puntaje-opcion">Tachar</button>`;
        opciones += `<button class="puntaje-opcion">-</button>`; // <-- Agregado aquí
    } else {
        opciones += valoresEspeciales[i].map(val =>
            `<button class="puntaje-opcion${String(val).endsWith('s') ? ' servido-btn' : ''}">${val}</button>`
        ).join('');
        opciones += `<button class="puntaje-opcion">Tachar</button>`;
        opciones += `<button class="puntaje-opcion">-</button>`; // <-- Agregado aquí
    }

    puntajeContent.innerHTML = `
        <span class="close" id="close-modal-puntaje">&times;</span>
        <h3>Puntaje para ${jugadas[i]} (${jugadores[j]})</h3>
        <div class="opciones-vertical">${opciones}</div>
    `;
    modalPuntaje.classList.add('active');
    document.querySelectorAll('.puntaje-opcion').forEach(btn => {
        btn.onclick = () => {
            puntajes[j][i] = btn.textContent === "Tachar" ? "X" : btn.textContent;
            actualizarTotal(j);
            modalPuntaje.classList.remove('active');
            renderTablero();
        };
    });
    document.getElementById('close-modal-puntaje').onclick = () => modalPuntaje.classList.remove('active');
}

// =========================
// MODAL REGLAS
// =========================
const modalReglas = document.getElementById('modal-reglas');
document.getElementById('btn-reglas').onclick = () => modalReglas.classList.add('active');
document.getElementById('close-modal-reglas').onclick = () => modalReglas.classList.remove('active');

// =========================
// NUEVA PARTIDA Y REINICIAR
// =========================
document.getElementById('btn-nueva-partida').onclick = mostrarModalJugadores;
document.getElementById('btn-reiniciar').onclick = () => {
  mostrarAlerta("¿Seguro que quieres reiniciar la partida?", {
    confirmar: true,
    onAccept: () => {
      puntajes = jugadores.map(() => Array(jugadas.length).fill('-'));
      puntajes.forEach(p => p[p.length-1] = 0);
      renderTablero();
    }
    // Puedes agregar onCancel si quieres hacer algo al cancelar
  });
};

// =========================
// DROPDOWN MENU
// =========================
const dropdownBtn = document.getElementById('dropdown-btn');
const dropdown = dropdownBtn?.parentElement;
dropdownBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('open');
});
document.addEventListener('click', () => {
  dropdown?.classList.remove('open');
});

// =========================
// ALERTA PERSONALIZADA
// =========================
function mostrarAlerta(msg, opciones = {}) {
  const alertDiv = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('custom-alert-msg');
  const btnAccept = document.getElementById('custom-alert-accept');
  const btnCancel = document.getElementById('custom-alert-cancel');
  const btnClose = document.getElementById('custom-alert-close');
  alertMsg.textContent = msg;

  // Mostrar u ocultar botones según opciones
  if (opciones.confirmar) {
    btnAccept.style.display = '';
    btnCancel.style.display = '';
    btnClose.style.display = 'none';
    btnAccept.onclick = () => {
      alertDiv.classList.remove('active');
      if (typeof opciones.onAccept === 'function') opciones.onAccept();
      limpiarAlertHandlers();
    };
    btnCancel.onclick = () => {
      alertDiv.classList.remove('active');
      if (typeof opciones.onCancel === 'function') opciones.onCancel();
      limpiarAlertHandlers();
    };
  } else {
    btnAccept.style.display = 'none';
    btnCancel.style.display = 'none';
    btnClose.style.display = '';
    btnClose.onclick = () => {
      alertDiv.classList.remove('active');
      limpiarAlertHandlers();
    };
  }

  alertDiv.classList.add('active');

  // Limpia handlers para evitar duplicados
  function limpiarAlertHandlers() {
    btnAccept.onclick = null;
    btnCancel.onclick = null;
    btnClose.onclick = null;
  }
}



// ===============================
// Animación de cohetes para el ganador
// ===============================
function animarGanador(idGanador) {
  const th = document.getElementById(idGanador);
  if (!th) return;

  // Agrega la clase de brillo
  th.classList.add('ganador-brilla');
  th.style.position = 'relative';

  // Crea y lanza 3 cohetes
  for (let i = 0; i < 3; i++) {
    const cohete = document.createElement('span');
    cohete.className = 'cohete';
    cohete.style.left = `${30 + i * 20}%`; // Espaciado horizontal
    cohete.textContent = '🚀';
    th.appendChild(cohete);

    // Elimina el cohete después de la animación
    setTimeout(() => {
      cohete.remove();
    }, 1200);
  }
}

// Ejemplo de uso: animarGanador('ganador');
// Llama a esta función cuando determines el ganador

// ===============================
// Evento para tachar celdas (poner X)
// ===============================
document.addEventListener('DOMContentLoaded', function () {
  // Selecciona todas las celdas jugables
  document.querySelectorAll('.tabla-generala td.jugada').forEach(celda => {
    celda.addEventListener('click', function () {
      // Si ya está tachada, no hacer nada
      if (this.classList.contains('tachado')) return;

      // Si la celda está vacía o con "-", permite tachar
      if (this.textContent.trim() === '' || this.textContent.trim() === '-') {
        this.textContent = 'X';
        this.classList.add('tachado');
      }
    });
  });
});
