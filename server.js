function showForm(form) {
  document.getElementById('login-form').classList.remove('active');
  document.getElementById('signup-form').classList.remove('active');
  document.getElementById(`${form}-form`).classList.add('active');
  document.getElementById('form-title').textContent = form === 'login' ? 'Login' : 'Sign Up';
}

async function login(event) {
  event.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (!user || !pass) {
    alert("Please enter both username and password.");
    return;
  }

  try {
    const response = await fetch('https://my-backend-km6v.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem('loggedInUser', user);
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Invalid username or password.");
    }
  } catch (err) {
    alert("Error connecting to server. Please try again later.");
    console.error(err);
  }
}

async function signup(event) {
  event.preventDefault();
  const user = document.getElementById('signup-user').value.trim();
  const pass = document.getElementById('signup-pass').value.trim();
  const key = document.getElementById('signup-key').value.trim();

  if (!user || !pass || !key) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    const response = await fetch('https://my-backend-km6v.onrender.com/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass, key: key })
    });

    const data = await response.json();

    if (data.success) {
      alert("Account created successfully. Please log in.");
      showForm('login');
    } else {
      alert(data.message || "Signup failed.");
    }
  } catch (err) {
    alert("Error connecting to server. Please try again later.");
    console.error(err);
  }
}

function createDots() {
  const container = document.getElementById('dots-container');
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.top = `${Math.random() * 100}vh`;
    dot.style.left = `${Math.random() * 100}vw`;
    dot.style.animationDuration = `${Math.random() * 5 + 5}s`;
    container.appendChild(dot);
  }
}

window.onload = () => {
  createDots();
};
