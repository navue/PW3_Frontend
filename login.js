const backendURL = "http://localhost:3000";

// Registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch(`${backendURL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (res.ok) {
    alert("Usuario registrado correctamente.");
  } else {
    const errores = result.errores?.map(e => e.msg).join("\n") || result.mensaje || "Error al registrarse.";
    alert(errores);
  }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch(`${backendURL}/ingreso`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (res.ok) {
    localStorage.setItem('token', result.accessToken);
    window.location.href = '/comentarios.html';
  } else {
    // Si viene un array de errores
    if (Array.isArray(result.errores)) {
      // Concatenar todos los mensajes de error en una cadena
      const mensajes = result.errores.map(e => e.msg || e.message || JSON.stringify(e)).join('\n');
      alert(mensajes);
    } else if (result.mensaje) {
      alert(result.mensaje);
    }
  }
});
