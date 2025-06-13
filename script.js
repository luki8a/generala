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


// Animación simple de fuegos artificiales
function lanzarFuegosArtificiales() {
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');
  // Ajusta el tamaño del canvas al tamaño del contenedor
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  let W = canvas.width;
  let H = canvas.height;
  let fireworks = [];

  function randomColor() {
    const colors = ['#ffd600', '#38a169', '#38b6ff', '#b794f4', '#ff6f61', '#ffb347', '#00b894'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function Firework() {
    this.x = Math.random() * W;
    this.y = H;
    this.radius = 2 + Math.random() * 2;
    this.color = randomColor();
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = - (3 + Math.random() * 2);
    this.alpha = 1;
    this.exploded = false;
    this.particles = [];
  }
  Firework.prototype.update = function() {
    if (!this.exploded) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05;
      if (this.vy > -1) {
        this.exploded = true;
        for (let i = 0; i < 30; i++) {
          this.particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos((i/30)*2*Math.PI) * (2 + Math.random()*2),
            vy: Math.sin((i/30)*2*Math.PI) * (2 + Math.random()*2),
            alpha: 1,
            color: this.color
          });
        }
      }
    } else {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.alpha -= 0.02;
      });
      this.particles = this.particles.filter(p => p.alpha > 0);
    }
  };
  Firework.prototype.draw = function(ctx) {
    if (!this.exploded) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    } else {
      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2*Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });
    }
  };

  function animate() {
    ctx.clearRect(0, 0, W, H);
    if (fireworks.length < 5 && Math.random() < 0.08) {
      fireworks.push(new Firework());
    }
    fireworks.forEach(fw => {
      fw.update();
      fw.draw(ctx);
    });
    fireworks = fireworks.filter(fw => !fw.exploded || fw.particles.length > 0);
    requestAnimationFrame(animate);
  }
  animate();
}

// Mostrar modal de ganador y ranking
function mostrarGanador(nombreGanador, rankingArray) {
  const modal = document.getElementById('ganador-modal');
  const titulo = document.getElementById('ganador-titulo');
  const lista = document.getElementById('ranking-list');
  titulo.innerHTML = `¡${nombreGanador} es el ganador! 🎉`;
  lista.innerHTML = '';
  rankingArray.forEach((jug, idx) => {
    lista.innerHTML += `<li>${idx+1}º - ${jug.nombre} <span style="float:right;">${jug.puntos} pts</span></li>`;
  });
  modal.classList.add('active');
  setTimeout(lanzarFuegosArtificiales, 300);

  // Botones
  document.getElementById('btn-jugar-nuevo').onclick = () => {
    modal.classList.remove('active');
    // Llama aquí a tu función para reiniciar partida
    mostrarModalJugadores();
  };
  document.getElementById('btn-menu-principal').onclick = () => {
    modal.classList.remove('active');
    // Aquí puedes redirigir o mostrar el menú principal
    // window.location.href = 'index.html'; // Ejemplo
  };
}

// Supón que tienes los arrays jugadores y puntajes
let ranking = jugadores.map((nombre, idx) => ({
  nombre,
  puntos: puntajes[idx][puntajes[idx].length-1]
}));
// Ordena de mayor a menor puntaje
ranking.sort((a, b) => b.puntos - a.puntos);

// Llama a la animación:
mostrarGanador(ranking[0].nombre, ranking);