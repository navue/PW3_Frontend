const backendURL = 'http://localhost:3000';

// Renderizar la página y envia el comentario
document.addEventListener('DOMContentLoaded', () => {
    cargarEmailDesdeSesion();
    cargarComentarios();

    const insertarComentarioForm = document.getElementById("insertarComentarioForm");

    insertarComentarioForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(insertarComentarioForm);
        const datos = {
            apellido: formData.get("apellido"),
            nombre: formData.get("nombre"),
            asunto: formData.get("asunto"),
            mensaje: formData.get("mensaje"),
        };

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${backendURL}/agregar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(datos),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Comentario agregado con éxito.");
                insertarComentarioForm.reset();
            } else {
                const errores = result.errores?.map(err => err.msg).join("\n") || result.error || response.statusText;
                alert("Error: " + errores);
            }
            cargarEmailDesdeSesion();
            cargarComentarios();
        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error al enviar el comentario.");
        }
    });
});

// Reestablece el formulario de agregar comentario
document.getElementById("reestablecerBtn").addEventListener("click", () => {
  const form = document.getElementById("insertarComentarioForm");
  const emailInput = form.querySelector('input[name="email"]');
  const emailActual = emailInput.value;
  form.reset();
  cargarEmailDesdeSesion();
});

// Botón para cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});

// Botón que obtiene y muestra comentarios
document.getElementById('btnMostrarTodo').addEventListener('click', async () => {
    cargarComentarios();
});

// Botón que obtiene y muestra comentarios por ID
document.getElementById("filtrarPorIdForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("itemId").value;

    try {
        const res = await fetch(`${backendURL}/comentarios?id=${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || data.mensaje || "Error en la respuesta");

        if (data.comentario) {
            renderizarComentarios(data.comentario);
        } else {
            alert(data.mensaje || "No se encontró el comentario.");
        }

    } catch (error) {
        alert("Error: " + error.message);
    }
});

// Botón que obtiene y muestra comentarios por email
document.getElementById("filtrarPorEmailForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("inputEmail").value;

    try {
        const res = await fetch(`${backendURL}/comentarios?email=${email}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || data.mensaje || "Error en la respuesta");

        if (data.comentarios?.length > 0) {
            renderizarComentarios(data.comentarios);
        } else {
            alert(data.mensaje || "No se encontraron comentarios.");
        }

    } catch (error) {
        alert("Error: " + error.message);
    }
});

// Botón que borra todos los comentarios
document.getElementById('btnBorrarTodos').addEventListener('click', async () => {
    const confirmar = confirm('¿Estás seguro de que deseas borrar todos los comentarios?');
    if (!confirmar) return;

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${backendURL}/eliminar`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || data.mensaje || 'Error desconocido del servidor');
        }

        alert(data.mensaje || 'Comentarios eliminados');
        cargarComentarios();
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error('Error al borrar todos los comentarios:', error);
    }
});

// Obtiene y muestra comentarios
async function cargarComentarios() {
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${backendURL}/comentarios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error en la respuesta');
        }

        if (data.comentarios && data.comentarios.length > 0) {
            renderizarComentarios(data.comentarios);
        } else {
            alert(data.mensaje || 'No hay comentarios.');
            document.querySelector("table tbody").innerHTML = '';
        }

    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        alert('Error al cargar comentarios');
    }
}

// Muestro/oculto el formulario de edición
function displayFormularioEditar(id) {
    // Busco si ya existe el formulario
    const filaExistente = document.getElementById(`formulario-editar-${id}`);
    if (filaExistente) {
        filaExistente.remove();
        return;
    }

    // Busco el comentario original en la fila principal
    const filaComentario = document.getElementById(`comentario-${id}`);
    if (!filaComentario) return;

    // Obtengo los valores actuales del comentario
    const apellido = filaComentario.querySelector(".td-apellido").textContent;
    const nombre = filaComentario.querySelector(".td-nombre").textContent;
    const email = filaComentario.querySelector(".td-email").textContent;
    const asunto = filaComentario.querySelector(".td-asunto").textContent;
    const mensaje = filaComentario.querySelector(".td-mensaje").textContent;

    // Creo la fila del formulario
    const filaForm = document.createElement("tr");
    filaForm.id = `formulario-editar-${id}`;
    filaForm.innerHTML = `
        <td colspan="8">
            <div id="editar" class="card border-primary mb-3">
                <div class="card-header">
                    <strong>Editar un comentario</strong>
                </div>
            <div class="card-body text-primary">
            <form onsubmit="editarComentario(event, '${id}')">
                <div class="row mb-2">
                    <div class="col">
                        <div class="form-group mb-3">
                            <label for="apellido-${apellido}"><strong>Apellido</strong></label>
                            <input type="text" class="form-control" name="apellido" value="${apellido}" required>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group mb-3">
                            <label for="nombre-${nombre}"><strong>Nombre</strong></label>
                            <input type="text" class="form-control" name="nombre" value="${nombre}" required>
                        </div>
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col">
                        <div class="form-group mb-3">
                            <label for="email-${email}"><strong>Email</strong></label>
                            <input type="email" class="form-control bg-light" name="email" value="${email}" readonly>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group mb-3">
                            <label for="asunto-${asunto}"><strong>Asunto</strong></label>
                            <input type="text" class="form-control" name="asunto" value="${asunto}" required>
                        </div>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="form-group mb-3">
                            <label for="mensaje-${mensaje}"><strong>Mensaje</strong></label>
                        <textarea class="form-control" name="mensaje" rows="3" required>${mensaje}</textarea>
                    </div>
                </div>
                <button type="submit" class="btn btn-success me-2">Guardar</button>
                <button type="button" class="btn btn-danger" onclick="displayFormularioEditar('${id}')">Cancelar</button>
            </form>
            </div>
            </div>
        </td>
    `;

    // Inserto la fila justo después del comentario
    filaComentario.insertAdjacentElement("afterend", filaForm);
}


// Envio comentario editado
async function editarComentario(event, id) {
    event.preventDefault();

    const form = event.target;
    const datos = {
        apellido: form.apellido.value,
        nombre: form.nombre.value,
        email: form.email.value,
        asunto: form.asunto.value,
        mensaje: form.mensaje.value
    };

    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${backendURL}/editar/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json" ,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error("Error al editar");

        alert("Comentario actualizado");
        await cargarComentarios();

    } catch (err) {
        console.error("Error al editar:", err);
        alert("Error al editar el comentario");
    }
}


// Elimina un comentario
async function eliminarComentario(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return;

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${backendURL}/eliminar/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert("Comentario eliminado.");
            window.location.reload();
        } else {
            alert("Error al eliminar: " + (result.error || result.mensaje || response.statusText));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al eliminar el comentario.");
    }
}

// Renderiza la lista de comentarios en la tabla
function renderizarComentarios(comentarios) {
    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    comentarios.forEach(({ _id, fecha, apellido, nombre, email, asunto, mensaje }) => {
        const tr = document.createElement("tr");
        tr.id = `comentario-${_id}`;

        tr.innerHTML = `
          <th scope="row">${_id}</th>
          <td class="td-fecha">${fecha}</td>
          <td class="td-apellido">${apellido}</td>
          <td class="td-nombre">${nombre}</td>
          <td class="td-email">${email}</td>
          <td class="td-asunto">${asunto}</td>
          <td class="td-mensaje">${mensaje}</td>
          <td class="w-5">
            <button id="editarBtn-${_id}" class="btn btn-outline-primary mb-2" onclick="displayFormularioEditar('${_id}')" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                  </svg>
                </button>
                <button class="btn btn-outline-danger" onclick="eliminarComentario('${_id}')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                  </svg>
                </button>
          </td>
        `;

        tbody.appendChild(tr);
    });
}

// Carga el email desde la sesión
function cargarEmailDesdeSesion() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        const emailUsuario = payload.username;

        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.value = emailUsuario;
            emailInput.readOnly = true;
            emailInput.classList.add("bg-light");
        }
    } catch (error) {
        console.error("Error al decodificar el token:", error);
    }
}
