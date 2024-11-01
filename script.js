let tablero = [];
let filas, columnas, cantidadMinas;
let juegoTerminado = false;
let primerTurno = true;

const niveles = {
    "Facil": { filas: 5, columnas: 5, minas: 5 },
    "Medio": { filas: 8, columnas: 8, minas: 15 },
    "Dificil": { filas: 10, columnas: 10, minas: 25 },
    "MuyDificil": { filas: 12, columnas: 12, minas: 35 },
    "Hardcore": { filas: 15, columnas: 15, minas: 50 },
    "Leyenda": { filas: 20, columnas: 20, minas: 80 }
};

function iniciarJuego() {
    const nivelSeleccionado = document.getElementById("nivel").value;
    if (nivelSeleccionado in niveles) {
        ({ filas, columnas, cantidadMinas } = niveles[nivelSeleccionado]);
    } else {
        filas = parseInt(document.getElementById("filas").value);
        columnas = parseInt(document.getElementById("columnas").value);
        cantidadMinas = parseInt(document.getElementById("minas").value);
        
        if (filas < 5 || columnas < 5 || cantidadMinas <= 0) {
            alert("El tamaño mínimo es 5x5 y debe haber al menos 1 mina.");
            return;
        }
    }
    
    juegoTerminado = false;
    primerTurno = true;
    crearTablero();
    mostrarTablero();
    document.getElementById("reiniciarJuego").style.display = "block";
}

function crearTablero() {
    tablero = Array(filas).fill().map(() => Array(columnas).fill({
        revelada: false,
        mina: false,
        bandera: false,
        conteo: 0
    }));
}

function mostrarTablero() {
    const tableroJuego = document.getElementById("tableroJuego");
    tableroJuego.style.gridTemplateColumns = `repeat(${columnas}, 30px)`;
    tableroJuego.innerHTML = "";

    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            const celda = document.createElement("div");
            celda.classList.add("celda");
            celda.dataset.fila = f;
            celda.dataset.columna = c;
            celda.addEventListener("click", () => revelarCelda(f, c));
            celda.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                alternarBandera(f, c);
            });
            tableroJuego.appendChild(celda);
        }
    }
}

function colocarMinas(exceptoFila, exceptoColumna) {
    let minasColocadas = 0;
    while (minasColocadas < cantidadMinas) {
        let f = Math.floor(Math.random() * filas);
        let c = Math.floor(Math.random() * columnas);

        if ((f === exceptoFila && c === exceptoColumna) || tablero[f][c].mina) {
            continue;
        }

        tablero[f][c].mina = true;
        incrementarConteoVecinos(f, c);
        minasColocadas++;
    }
}

function incrementarConteoVecinos(fila, columna) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let vecinoFila = fila + i;
            let vecinoColumna = columna + j;

            if (vecinoFila >= 0 && vecinoFila < filas && vecinoColumna >= 0 && vecinoColumna < columnas) {
                if (!tablero[vecinoFila][vecinoColumna].mina) {
                    tablero[vecinoFila][vecinoColumna].conteo++;
                }
            }
        }
    }
}

function revelarCelda(fila, columna) {
    if (juegoTerminado) return;

    const celda = tablero[fila][columna];
    if (celda.revelada || celda.bandera) return;

    if (primerTurno) {
        colocarMinas(fila, columna);
        primerTurno = false;
    }

    celda.revelada = true;
    const celdaElemento = document.querySelector(`[data-fila='${fila}'][data-columna='${columna}']`);
    celdaElemento.classList.add("revelada");

    if (celda.mina) {
        celdaElemento.classList.add("mina");
        terminarJuego(false);
        revelarTodasLasCeldas();
    } else {
        if (celda.conteo > 0) {
            celdaElemento.textContent = celda.conteo;
        } else {
            revelarVecinos(fila, columna);
        }
        verificarVictoria();
    }
}

function revelarVecinos(fila, columna) {
    for (let df = -1; df <= 1; df++) {
        for (let dc = -1; dc <= 1; dc++) {
            const f = fila + df;
            const c = columna + dc;
            if (f >= 0 && f < filas && c >= 0 && c < columnas) {
                const vecino = tablero[f][c];
                if (!vecino.revelada && !vecino.mina) {
                    revelarCelda(f, c);
                }
            }
        }
    }
}

function alternarBandera(fila, columna) {
    if (juegoTerminado) return;

    const celda = tablero[fila][columna];
    if (celda.revelada) return;

    celda.bandera = !celda.bandera;
    const celdaElemento = document.querySelector(`[data-fila='${fila}'][data-columna='${columna}']`);
    celdaElemento.classList.toggle("marcada");
    celdaElemento.textContent = celda.bandera ? "🚩" : "";
}

function verificarVictoria() {
    let celdasSinRevelar = 0;

    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            const celda = tablero[f][c];
            if (!celda.revelada && !celda.mina) {
                celdasSinRevelar++;
            }
        }
    }

    if (celdasSinRevelar === 0) {
        terminarJuego(true);
    }
}

function terminarJuego(victoria) {
    juegoTerminado = true;
    alert(victoria ? "¡Has ganado!" : "¡Has perdido! Haz tocado una mina.");
}

function revelarTodasLasCeldas() {
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            const celda = tablero[f][c];
            const celdaElemento = document.querySelector(`[data-fila='${f}'][data-columna='${c}']`);
            if (celda.mina) {
                celdaElemento.classList.add("mina");
                celdaElemento.textContent = "💣";
            } else if (celda.conteo > 0) {
                celdaElemento.textContent = celda.conteo;
                celdaElemento.classList.add("revelada");
            } else {
                celdaElemento.classList.add("revelada");
            }
        }
    }
}

function reiniciarJuego() {
    document.getElementById("tableroJuego").innerHTML = "";
    document.getElementById("reiniciarJuego").style.display = "none";
    iniciarJuego();
}
