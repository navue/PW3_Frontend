const backendURL = "http://localhost:3000"; // Ajustalo si tu backend usa otro puerto

// REGISTRO
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

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch(`${backendURL}/ingreso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (res.ok) {
    localStorage.setItem('token', result.accessToken);
    alert("Ingreso exitoso.");
    // Podés redirigir si querés:
    // window.location.href = "index.html";
  } else {
    alert(result.mensaje || "Credenciales inválidas.");
  }
});
