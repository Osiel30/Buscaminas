function mostrarCamposPersonalizados() {
    const nivel = document.getElementById("nivel").value;
    const personalizadoDiv = document.getElementById("personalizado");
    personalizadoDiv.style.display = nivel === "Personalizado" ? "block" : "none";
}

function iniciarJuego() {
    const nivel = document.getElementById("nivel").value;
    let filas, columnas, minas;

    switch (nivel) {
        case "Facil":
            filas = 8;
            columnas = 8;
            minas = 10;
            break;
        case "Medio":
            filas = 12;
            columnas = 12;
            minas = 20;
            break;
        case "Dificil":
            filas = 16;
            columnas = 16;
            minas = 40;
            break;
        case "MuyDificil":
            filas = 20;
            columnas = 20;
            minas = 70;
            break;
        case "Hardcore":
            filas = 24;
            columnas = 24;
            minas = 99;
            break;
        case "Leyenda":
            filas = 30;
            columnas = 30;
            minas = 150;
            break;
        case "Personalizado":
            filas = parseInt(document.getElementById("filas").value);
            columnas = parseInt(document.getElementById("columnas").value);
            minas = parseInt(document.getElementById("minas").value);
            break;
        default:
            filas = 8;
            columnas = 8;
            minas = 10;
            break;
    }

    generarTablero(filas, columnas, minas);
}

function generarTablero(filas, columnas, minas) {
    const tablero = document.getElementById("tableroJuego");
    tablero.innerHTML = "";
    tablero.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
    tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;

    const celdas = Array(filas * columnas).fill({}).map(() => ({
        esMina: false,
        revelado: false,
        minasCercanas: 0
    }));

    colocarMinas(celdas, filas, columnas, minas);

    for (let i = 0; i < filas * columnas; i++) {
        const celdaElement = document.createElement("div");
        celdaElement.classList.add("celda");
        celdaElement.addEventListener("click", () => revelarCelda(celdaElement, celdas, i, filas, columnas));
        celdaElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            marcarCelda(celdaElement);
        });
        tablero.appendChild(celdaElement);
    }
}

function colocarMinas(celdas, filas, columnas, minas) {
    let minasColocadas = 0;

    while (minasColocadas < minas) {
        const index = Math.floor(Math.random() * celdas.length);
        if (!celdas[index].esMina) {
            celdas[index].esMina = true;
            minasColocadas++;
            actualizarConteoMinas(celdas, index, filas, columnas);
        }
    }
}

function actualizarConteoMinas(celdas, index, filas, columnas) {
    const vecinos = obtenerVecinos(index, filas, columnas);

    vecinos.forEach((vecino) => {
        if (!celdas[vecino].esMina) {
            celdas[vecino].minasCercanas++;
        }
    });
}

function obtenerVecinos(index, filas, columnas) {
    const vecinos = [];
    const x = Math.floor(index / columnas);
    const y = index % columnas;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx !== 0 || dy !== 0) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < filas && ny >= 0 && ny < columnas) {
                    vecinos.push(nx * columnas + ny);
                }
            }
        }
    }
    return vecinos;
}

function revelarCelda(celda, celdas, index, filas, columnas) {
    if (celdas[index].revelado) return;
    if (celdas[index].esMina) {
        celda.classList.add("mina");
        mostrarMensajePerdida(celdas, filas, columnas);
        return;
    }

    celdas[index].revelado = true;
    celda.classList.add("revelada");

    if (celdas[index].minasCercanas > 0) {
        celda.textContent = celdas[index].minasCercanas;
        celda.classList.add(`minas${celdas[index].minasCercanas}`);
    } else {
        const vecinos = obtenerVecinos(index, filas, columnas);
        vecinos.forEach((vecino) => {
            const vecinoCelda = document.getElementsByClassName("celda")[vecino];
            revelarCelda(vecinoCelda, celdas, vecino, filas, columnas);
        });
    }
}

function marcarCelda(celda) {
    if (!celda.classList.contains("revelada")) {
        celda.classList.toggle("bandera");
        celda.textContent = celda.classList.contains("bandera") ? "🚩" : "";
    }
}

function mostrarMensajePerdida(celdas, filas, columnas) {
    alert("Has perdido");

    for (let i = 0; i < filas * columnas; i++) {
        const celdaElement = document.getElementsByClassName("celda")[i];
        if (celdas[i].esMina) {
            celdaElement.classList.add("mina");
        }
    }
}

function reiniciarJuego() {
    iniciarJuego();
}
