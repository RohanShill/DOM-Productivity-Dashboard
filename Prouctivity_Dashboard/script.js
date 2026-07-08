const dashboard = document.getElementById("dashboardHome");
const pages = document.querySelectorAll(".page-view");
const cards = document.querySelectorAll(".card");
const backButtons = document.querySelectorAll(".back-btn");

cards.forEach(card => {
  card.addEventListener("click", () => {
    dashboard.classList.add("hidden");
    pages.forEach(page => page.classList.add("hidden"));
    const targetPage = document.getElementById(card.dataset.target);
    if (targetPage) {
      targetPage.classList.remove("hidden");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

backButtons.forEach(button => {
  button.addEventListener("click", () => {
    pages.forEach(page => page.classList.add("hidden"));
    dashboard.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

const themeBtn = document.getElementById("themeBtn");
const currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", currentTheme);
updateThemeIcon(currentTheme);

themeBtn.addEventListener("click", () => {
  const activeTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = activeTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  const icon = themeBtn.querySelector("i");
  if (theme === "dark") {
    icon.className = "ri-moon-line";
  } else {
    icon.className = "ri-sun-line";
  }
}

function updateDateTime() {
  const now = new Date();

  const dayNameOpts = { weekday: 'long' };
  const fullDateOpts = { day: 'numeric', month: 'long', year: 'numeric' };

  document.getElementById("dayName").textContent = now.toLocaleDateString('en-US', dayNameOpts);
  document.getElementById("fullDate").textContent = now.toLocaleDateString('en-US', fullDateOpts);

  const hour = now.getHours();
  const minute = now.getMinutes();

  let displayHour = hour % 12;
  displayHour = displayHour ? displayHour : 12;
  const displayMinute = minute < 10 ? '0' + minute : minute;
  const ampm = hour >= 12 ? 'PM' : 'AM';

  document.getElementById("liveTime").textContent = `${displayHour}:${displayMinute} ${ampm}`;

  updateBackgroundGradient(hour);
}

function updateBackgroundGradient(hour) {
  const backgroundEl = document.querySelector(".background-container");
  if (!backgroundEl) return;
  backgroundEl.className = "background-container";

  if (hour >= 5 && hour < 11) {
    backgroundEl.classList.add("morning");
  } else if (hour >= 11 && hour < 17) {
    backgroundEl.classList.add("afternoon");
  } else if (hour >= 17 && hour < 20) {
    backgroundEl.classList.add("evening");
  } else {
    backgroundEl.classList.add("night");
  }
}

setInterval(updateDateTime, 1000);
updateDateTime();

const defaultCoords = { latitude: 28.61, longitude: 77.20, name: "New Delhi, India" };

function fetchWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherData(position.coords.latitude, position.coords.longitude, "Your Location");
      },
      () => {
        getWeatherData(defaultCoords.latitude, defaultCoords.longitude, defaultCoords.name);
      }
    );
  } else {
    getWeatherData(defaultCoords.latitude, defaultCoords.longitude, defaultCoords.name);
  }
}

function getWeatherData(lat, lon, locationLabel) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data && data.current) {
        displayWeather(data.current, locationLabel);
      }
    })
    .catch(() => {
      displayWeatherOfflineFallback();
    });
}

function displayWeather(current, label) {
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const wind = Math.round(current.wind_speed_10m);
  const code = current.weather_code;

  document.getElementById("temperature").textContent = `${temp}°C`;
  document.getElementById("feelsLike").textContent = `${feelsLike}°C`;
  document.getElementById("humidity").textContent = `${humidity}%`;
  document.getElementById("wind").textContent = `${wind} km/h`;
  document.getElementById("location").textContent = label;

  const weatherMap = getWeatherDetails(code);
  document.getElementById("condition").textContent = weatherMap.condition;
  document.getElementById("weatherIcon").className = `ri-${weatherMap.icon}`;
}

function displayWeatherOfflineFallback() {
  document.getElementById("temperature").textContent = "28°C";
  document.getElementById("feelsLike").textContent = "29°C";
  document.getElementById("humidity").textContent = "45%";
  document.getElementById("wind").textContent = "12 km/h";
  document.getElementById("location").textContent = "New Delhi, India";
  document.getElementById("condition").textContent = "Partly Cloudy";
  document.getElementById("weatherIcon").className = "ri-sun-cloudy-line";
}

function getWeatherDetails(code) {
  if (code === 0) return { condition: "Clear Sky", icon: "sun-line" };
  if (code >= 1 && code <= 3) return { condition: "Partly Cloudy", icon: "sun-cloudy-line" };
  if (code === 45 || code === 48) return { condition: "Foggy", icon: "mist-line" };
  if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65)) return { condition: "Rainy", icon: "rainy-line" };
  if (code >= 71 && code <= 77) return { condition: "Snowy", icon: "snowy-line" };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", icon: "showers-line" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", icon: "thunderstorms-line" };
  return { condition: "Cloudy", icon: "cloudy-line" };
}

fetchWeather();

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const clearCompletedTodos = document.getElementById("clearCompletedTodos");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let activeFilter = "all";

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    important: false
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  todoInput.value = "";
  todoInput.focus();
});

todoList.addEventListener("click", (e) => {
  const target = e.target;

  const customCheckbox = target.closest(".custom-checkbox");
  if (customCheckbox) {
    const todoEl = customCheckbox.closest(".task-item");
    const todoId = todoEl.dataset.id;
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    }
    return;
  }

  const starBtn = target.closest(".btn-star");
  if (starBtn) {
    const todoEl = starBtn.closest(".task-item");
    const todoId = todoEl.dataset.id;
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      todo.important = !todo.important;
      saveTodos();
      renderTodos();
    }
    return;
  }

  const deleteBtn = target.closest(".btn-delete");
  if (deleteBtn) {
    const todoEl = deleteBtn.closest(".task-item");
    const todoId = todoEl.dataset.id;
    todos = todos.filter(t => t.id !== todoId);
    saveTodos();
    renderTodos();
  }
});

clearCompletedTodos.addEventListener("click", () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTodos();
  });
});

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = "";

  let filtered = todos;
  if (activeFilter === "active") {
    filtered = todos.filter(t => !t.completed);
  } else if (activeFilter === "important") {
    filtered = todos.filter(t => t.important);
  } else if (activeFilter === "completed") {
    filtered = todos.filter(t => t.completed);
  }

  if (filtered.length === 0) {
    todoList.innerHTML = `
      <li class="empty-state">No tasks found.</li>
    `;
  } else {
    filtered.forEach(todo => {
      const li = document.createElement("li");
      li.className = `task-item ${todo.completed ? 'completed' : ''} ${todo.important ? 'important' : ''}`;
      li.dataset.id = todo.id;
      li.innerHTML = `
        <div class="task-item-left">
          <div class="custom-checkbox">
            <i class="ri-check-line"></i>
          </div>
          <span class="task-text">${todo.text}</span>
        </div>
        <div class="task-item-actions">
          <button class="task-btn btn-star">
            <i class="ri-star-fill"></i>
          </button>
          <button class="task-btn btn-delete">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      `;
      todoList.appendChild(li);
    });
  }

  updateTodoStats();
}

function updateTodoStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;

  document.getElementById("todoFractionText").textContent = `${completed} of ${total} tasks`;

  const percentage = total ? Math.round((completed / total) * 100) : 0;
  document.getElementById("todoProgressText").textContent = `${percentage}% Completed`;
  document.getElementById("todoProgressFill").style.width = `${percentage}%`;
}

renderTodos();

const clearPlannerBtn = document.getElementById("clearPlannerBtn");
const timeRows = document.querySelectorAll(".time-row");

let plannerData = JSON.parse(localStorage.getItem("planner")) || {};

timeRows.forEach(row => {
  const hour = row.dataset.hour;
  const input = row.querySelector(".planner-input");

  if (plannerData[hour]) {
    input.value = plannerData[hour];
    row.classList.add("has-content");
  }

  input.addEventListener("input", () => {
    const val = input.value.trim();
    if (val) {
      plannerData[hour] = val;
      row.classList.add("has-content");
    } else {
      delete plannerData[hour];
      row.classList.remove("has-content");
    }
    localStorage.setItem("planner", JSON.stringify(plannerData));
  });

  const clearBtn = row.querySelector(".btn-clear");
  clearBtn.addEventListener("click", () => {
    input.value = "";
    delete plannerData[hour];
    row.classList.remove("has-content");
    localStorage.setItem("planner", JSON.stringify(plannerData));
  });
});

clearPlannerBtn.addEventListener("click", () => {
  timeRows.forEach(row => {
    const input = row.querySelector(".planner-input");
    input.value = "";
    row.classList.remove("has-content");
  });
  plannerData = {};
  localStorage.removeItem("planner");
});

function highlightCurrentHourSlot() {
  const currentHour = new Date().getHours();
  timeRows.forEach(row => {
    const hour = parseInt(row.dataset.hour);
    if (hour === currentHour) {
      row.classList.add("current-hour");
    } else {
      row.classList.remove("current-hour");
    }
  });
}

highlightCurrentHourSlot();
setInterval(highlightCurrentHourSlot, 60000);

const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const goalList = document.getElementById("goalList");
const goalsFractionText = document.getElementById("goalsFractionText");
const goalsMotivationLabel = document.getElementById("goalsMotivationLabel");

let goals = JSON.parse(localStorage.getItem("goals")) || [];

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = goalInput.value.trim();
  if (!text) return;

  const newGoal = {
    id: Date.now().toString(),
    text: text,
    completed: false
  };

  goals.push(newGoal);
  saveGoals();
  renderGoals();
  goalInput.value = "";
  goalInput.focus();
});

goalList.addEventListener("click", (e) => {
  const target = e.target;

  const checkbox = target.closest(".goal-checkbox");
  if (checkbox) {
    const goalEl = checkbox.closest(".goal-item");
    const goalId = goalEl.dataset.id;
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      goal.completed = !goal.completed;
      saveGoals();
      renderGoals();
    }
    return;
  }

  const deleteBtn = target.closest(".btn-delete");
  if (deleteBtn) {
    const goalEl = deleteBtn.closest(".goal-item");
    const goalId = goalEl.dataset.id;
    goals = goals.filter(g => g.id !== goalId);
    saveGoals();
    renderGoals();
  }
});

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

function renderGoals() {
  goalList.innerHTML = "";

  if (goals.length === 0) {
    goalList.innerHTML = `
      <li class="empty-state">No goals set yet.</li>
    `;
  } else {
    goals.forEach(goal => {
      const li = document.createElement("li");
      li.className = `goal-item ${goal.completed ? 'completed' : ''}`;
      li.dataset.id = goal.id;
      li.innerHTML = `
        <div class="goal-item-left">
          <div class="goal-checkbox">
            <i class="ri-check-line"></i>
          </div>
          <span class="goal-text">${goal.text}</span>
        </div>
        <button class="task-btn btn-delete">
          <i class="ri-delete-bin-line"></i>
        </button>
      `;
      goalList.appendChild(li);
    });
  }

  updateGoalsProgress();
}

function updateGoalsProgress() {
  const total = goals.length;
  const completed = goals.filter(g => g.completed).length;

  goalsFractionText.textContent = `${completed} of ${total} completed`;

  if (total === 0) {
    goalsMotivationLabel.textContent = "No goals set for today.";
  } else if (completed === total) {
    goalsMotivationLabel.textContent = "Spectacular! You've achieved all your goals today!";
  } else if (completed > 0) {
    goalsMotivationLabel.textContent = "Doing great! Keep pushin' and finish strong!";
  } else {
    goalsMotivationLabel.textContent = "Select a goal checkbox to get started!";
  }
}

renderGoals();

const fallbackQuotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "An obstacle is often a stepping stone.", author: "Prescott Bush" },
  { text: "Keep your face always toward the sunshine - and shadows will fall behind you.", author: "Walt Whitman" }
];

const newQuoteBtn = document.getElementById("newQuoteBtn");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteLoading = document.getElementById("quoteLoading");
const quoteTextWrapper = document.getElementById("quoteTextWrapper");

newQuoteBtn.addEventListener("click", fetchQuote);

function fetchQuote() {
  quoteTextWrapper.style.display = "none";
  quoteLoading.style.display = "block";

  fetch("https://api.allorigins.win/get?url=https://zenquotes.io/api/random")
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      const parsed = JSON.parse(data.contents);
      if (parsed && parsed[0]) {
        quoteText.textContent = `"${parsed[0].q}"`;
        quoteAuthor.textContent = `— ${parsed[0].a}`;
      } else {
        useLocalQuote();
      }
    })
    .catch(() => {
      useLocalQuote();
    })
    .finally(() => {
      quoteLoading.style.display = "none";
      quoteTextWrapper.style.display = "block";
    });
}

function useLocalQuote() {
  const index = Math.floor(Math.random() * fallbackQuotes.length);
  const q = fallbackQuotes[index];
  quoteText.textContent = `"${q.text}"`;
  quoteAuthor.textContent = `— ${q.author}`;
}

fetchQuote();

const pomoDisplay = document.getElementById("pomoDisplay");
const pomoSessionType = document.getElementById("pomoSessionType");
const pomoStart = document.getElementById("pomoStart");
const pomoPause = document.getElementById("pomoPause");
const pomoReset = document.getElementById("pomoReset");
const pomoSoundBtn = document.getElementById("pomoSoundBtn");
const presetButtons = document.querySelectorAll(".preset-btn");

let timerInterval = null;
let currentMode = "work";
let totalSeconds = 25 * 60;
let secondsLeft = totalSeconds;
let soundEnabled = true;

function updateTimerDisplay() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const displayMin = minutes < 10 ? '0' + minutes : minutes;
  const displaySec = seconds < 10 ? '0' + seconds : seconds;

  pomoDisplay.textContent = `${displayMin}:${displaySec}`;
}

function startTimer() {
  if (timerInterval) return;

  pomoStart.classList.add("hidden");
  pomoPause.classList.remove("hidden");

  timerInterval = setInterval(() => {
    if (secondsLeft > 0) {
      secondsLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      playBeep();
      handleSessionEnd();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  pomoPause.classList.add("hidden");
  pomoStart.classList.remove("hidden");
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  pomoPause.classList.add("hidden");
  pomoStart.classList.remove("hidden");

  secondsLeft = totalSeconds;
  updateTimerDisplay();
}

function handleSessionEnd() {
  if (currentMode === "work") {
    alert("Work session complete! Time for a break.");
    switchMode("short", 5);
  } else {
    alert("Break complete! Ready to focus?");
    switchMode("work", 25);
  }
}

function switchMode(mode, minutes) {
  currentMode = mode;
  totalSeconds = minutes * 60;
  secondsLeft = totalSeconds;

  presetButtons.forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (mode === "work") {
    pomoSessionType.textContent = "Work Session";
  } else if (mode === "short") {
    pomoSessionType.textContent = "Short Break";
  } else {
    pomoSessionType.textContent = "Long Break";
  }

  resetTimer();
}

presetButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const minutes = parseInt(btn.dataset.minutes);
    const mode = btn.dataset.mode;
    switchMode(mode, minutes);
  });
});

pomoStart.addEventListener("click", startTimer);
pomoPause.addEventListener("click", pauseTimer);
pomoReset.addEventListener("click", resetTimer);

pomoSoundBtn.closest(".sound-toggle-bar").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    pomoSoundBtn.className = "ri-volume-up-line";
    pomoSoundBtn.nextElementSibling.textContent = "Beep alert active";
  } else {
    pomoSoundBtn.className = "ri-volume-mute-line";
    pomoSoundBtn.nextElementSibling.textContent = "Beep alert muted";
  }
});

function playBeep() {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.5);
  } catch (err) {

  }
}

updateTimerDisplay();
