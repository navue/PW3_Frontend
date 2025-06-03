const backendURL = 'http://localhost:3000';

// Renderizar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarEmailDesdeSesion();
    cargarComentarios();
});

// Reestablece el formulario de agregar comentario
document.getElementById("reestablecerBtn").addEventListener("click", () => {
  const form = document.getElementById("insertarComentarioForm");
  const emailInput = form.querySelector('input[name="email"]');
  const emailActual = emailInput.value;
  form.reset();
  cargarEmailDesdeSesion();
});


// Enviar el comentario
document.addEventListener("DOMContentLoaded", () => {
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

// Renderiza la lista de comentarios en la tabla
function renderizarComentarios(comentarios) {
    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    comentarios.forEach(({ _id, fecha, apellido, nombre, email, asunto, mensaje }) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <th scope="row" class="w-15">${_id}</th>
          <td class="w-5">${fecha}</td>
          <td class="w-10">${apellido}</td>
          <td class="w-10">${nombre}</td>
          <td class="w-10">${email}</td>
          <td class="w-10">${asunto}</td>
          <td class="w-35">${mensaje}</td>
          <td class="w-5">
            <button id="editarBtn" class="btn btn-outline-primary mb-2" onclick="displayFormularioEditar('<%= comentario._id %>')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                  </svg>
                </button>
                <button class="btn btn-outline-danger" onclick="eliminarComentario('<%= comentario._id %>')">
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
