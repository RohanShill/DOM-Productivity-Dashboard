var dashboard = document.getElementById("dashboardHome");
var pages = document.querySelectorAll(".page-view");
var cards = document.querySelectorAll(".card");
var backButtons = document.querySelectorAll(".back-btn");

for (var i = 0; i < cards.length; i++) {
  var card = cards[i];
  card.addEventListener("click", function() {
    dashboard.classList.add("hidden");
    for (var j = 0; j < pages.length; j++) {
      pages[j].classList.add("hidden");
    }
    var targetPageId = this.getAttribute("data-target");
    var targetPage = document.getElementById(targetPageId);
    if (targetPage) {
      targetPage.classList.remove("hidden");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

for (var i = 0; i < backButtons.length; i++) {
  var btn = backButtons[i];
  btn.addEventListener("click", function() {
    for (var j = 0; j < pages.length; j++) {
      pages[j].classList.add("hidden");
    }
    dashboard.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

var themeBtn = document.getElementById("themeBtn");
var currentTheme = localStorage.getItem("theme");
if (!currentTheme) {
  currentTheme = "light";
}
document.documentElement.setAttribute("data-theme", currentTheme);
updateThemeIcon(currentTheme);

themeBtn.addEventListener("click", function() {
  var activeTheme = document.documentElement.getAttribute("data-theme");
  var newTheme = "light";
  if (activeTheme === "light") {
    newTheme = "dark";
  }
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  var icon = themeBtn.querySelector("i");
  if (theme === "dark") {
    icon.className = "ri-moon-line";
  } else {
    icon.className = "ri-sun-line";
  }
}

function updateDateTime() {
  var now = new Date();
  
  var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  var dayName = dayNames[now.getDay()];
  var dateNum = now.getDate();
  var monthName = monthNames[now.getMonth()];
  var yearNum = now.getFullYear();
  
  document.getElementById("dayName").textContent = dayName;
  document.getElementById("fullDate").textContent = dateNum + " " + monthName + " " + yearNum;
  
  var hour = now.getHours();
  var minute = now.getMinutes();
  
  var ampm = "AM";
  if (hour >= 12) {
    ampm = "PM";
  }
  
  var displayHour = hour % 12;
  if (displayHour === 0) {
    displayHour = 12;
  }
  
  var displayMinute = minute;
  if (minute < 10) {
    displayMinute = "0" + minute;
  }
  
  document.getElementById("liveTime").textContent = displayHour + ":" + displayMinute + " " + ampm;
  
  updateBackgroundGradient(hour);
}

function updateBackgroundGradient(hour) {
  var backgroundEl = document.querySelector(".background-container");
  if (!backgroundEl) {
    return;
  }
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

function fetchWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var geoUrl = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=en";
        
        fetch(geoUrl)
          .then(function(res) {
            return res.json();
          })
          .then(function(geoData) {
            var cityName = "Your Location";
            if (geoData && geoData.city) {
              cityName = geoData.city;
              if (geoData.countryName) {
                cityName = cityName + ", " + geoData.countryName;
              }
            }
            getWeatherData(lat, lon, cityName);
          })
          .catch(function() {
            getWeatherData(lat, lon, "Your Location");
          });
      },
      function() {
        getWeatherData(28.61, 77.20, "New Delhi, India");
      }
    );
  } else {
    getWeatherData(28.61, 77.20, "New Delhi, India");
  }
}

function getWeatherData(lat, lon, locationLabel) {
  var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code";
  
  fetch(url)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      if (data && data.current) {
        displayWeather(data.current, locationLabel);
      }
    })
    .catch(function() {
      displayWeatherOfflineFallback();
    });
}

function displayWeather(current, label) {
  var temp = Math.round(current.temperature_2m);
  var feelsLike = Math.round(current.apparent_temperature);
  var humidity = current.relative_humidity_2m;
  var wind = Math.round(current.wind_speed_10m);
  var code = current.weather_code;
  
  document.getElementById("temperature").textContent = temp + "°C";
  document.getElementById("feelsLike").textContent = feelsLike + "°C";
  document.getElementById("humidity").textContent = humidity + "%";
  document.getElementById("wind").textContent = wind + " km/h";
  document.getElementById("location").textContent = label;
  
  var weatherMap = getWeatherDetails(code);
  document.getElementById("condition").textContent = weatherMap.condition;
  document.getElementById("weatherIcon").className = "ri-" + weatherMap.icon;
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
  if (code === 0) {
    return { condition: "Clear Sky", icon: "sun-line" };
  }
  if (code >= 1 && code <= 3) {
    return { condition: "Partly Cloudy", icon: "sun-cloudy-line" };
  }
  if (code === 45 || code === 48) {
    return { condition: "Foggy", icon: "mist-line" };
  }
  if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65)) {
    return { condition: "Rainy", icon: "rainy-line" };
  }
  if (code >= 71 && code <= 77) {
    return { condition: "Snowy", icon: "snowy-line" };
  }
  if (code >= 80 && code <= 82) {
    return { condition: "Rain Showers", icon: "showers-line" };
  }
  if (code >= 95 && code <= 99) {
    return { condition: "Thunderstorm", icon: "thunderstorms-line" };
  }
  return { condition: "Cloudy", icon: "cloudy-line" };
}

fetchWeather();

var todoForm = document.getElementById("todoForm");
var todoInput = document.getElementById("todoInput");
var todoList = document.getElementById("todoList");
var clearCompletedTodos = document.getElementById("clearCompletedTodos");
var filterButtons = document.querySelectorAll(".filter-btn");

var todos = [];
var storedTodos = localStorage.getItem("todos");
if (storedTodos) {
  todos = JSON.parse(storedTodos);
}
var activeFilter = "all";

todoForm.addEventListener("submit", function(e) {
  e.preventDefault();
  var text = todoInput.value.trim();
  if (!text) {
    return;
  }
  
  var newTodo = {
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

todoList.addEventListener("click", function(e) {
  var target = e.target;
  
  var customCheckbox = target.closest(".custom-checkbox");
  if (customCheckbox) {
    var todoEl = customCheckbox.closest(".task-item");
    var todoId = todoEl.getAttribute("data-id");
    
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === todoId) {
        todos[i].completed = !todos[i].completed;
        break;
      }
    }
    saveTodos();
    renderTodos();
    return;
  }
  
  var starBtn = target.closest(".btn-star");
  if (starBtn) {
    var todoEl = starBtn.closest(".task-item");
    var todoId = todoEl.getAttribute("data-id");
    
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === todoId) {
        todos[i].important = !todos[i].important;
        break;
      }
    }
    saveTodos();
    renderTodos();
    return;
  }
  
  var deleteBtn = target.closest(".btn-delete");
  if (deleteBtn) {
    var todoEl = deleteBtn.closest(".task-item");
    var todoId = todoEl.getAttribute("data-id");
    
    var newTodos = [];
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id !== todoId) {
        newTodos.push(todos[i]);
      }
    }
    todos = newTodos;
    saveTodos();
    renderTodos();
  }
});

clearCompletedTodos.addEventListener("click", function() {
  var newTodos = [];
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].completed === false) {
      newTodos.push(todos[i]);
    }
  }
  todos = newTodos;
  saveTodos();
  renderTodos();
});

for (var i = 0; i < filterButtons.length; i++) {
  var filterBtn = filterButtons[i];
  filterBtn.addEventListener("click", function() {
    for (var j = 0; j < filterButtons.length; j++) {
      filterButtons[j].classList.remove("active");
    }
    this.classList.add("active");
    activeFilter = this.getAttribute("data-filter");
    renderTodos();
  });
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = "";
  
  var filtered = [];
  if (activeFilter === "all") {
    filtered = todos;
  } else if (activeFilter === "active") {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].completed === false) {
        filtered.push(todos[i]);
      }
    }
  } else if (activeFilter === "important") {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].important === true) {
        filtered.push(todos[i]);
      }
    }
  } else if (activeFilter === "completed") {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].completed === true) {
        filtered.push(todos[i]);
      }
    }
  }
  
  if (filtered.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks found.</li>';
  } else {
    for (var i = 0; i < filtered.length; i++) {
      var todo = filtered[i];
      var li = document.createElement("li");
      
      var classNames = "task-item";
      if (todo.completed) {
        classNames += " completed";
      }
      if (todo.important) {
        classNames += " important";
      }
      li.className = classNames;
      li.setAttribute("data-id", todo.id);
      
      li.innerHTML = '<div class="task-item-left">' +
        '<div class="custom-checkbox">' +
        '<i class="ri-check-line"></i>' +
        '</div>' +
        '<span class="task-text">' + todo.text + '</span>' +
        '</div>' +
        '<div class="task-item-actions">' +
        '<button class="task-btn btn-star">' +
        '<i class="ri-star-fill"></i>' +
        '</button>' +
        '<button class="task-btn btn-delete">' +
        '<i class="ri-delete-bin-line"></i>' +
        '</button>' +
        '</div>';
      todoList.appendChild(li);
    }
  }
  
  updateTodoStats();
}

function updateTodoStats() {
  var total = todos.length;
  var completed = 0;
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].completed === true) {
      completed++;
    }
  }
  
  document.getElementById("todoFractionText").textContent = completed + " of " + total + " tasks";
  
  var percentage = 0;
  if (total > 0) {
    percentage = Math.round((completed / total) * 100);
  }
  
  document.getElementById("todoProgressText").textContent = percentage + "% Completed";
  document.getElementById("todoProgressFill").style.width = percentage + "%";
}

renderTodos();

var clearPlannerBtn = document.getElementById("clearPlannerBtn");
var timeRows = document.querySelectorAll(".time-row");

var plannerData = {};
var storedPlanner = localStorage.getItem("planner");
if (storedPlanner) {
  plannerData = JSON.parse(storedPlanner);
}

for (var i = 0; i < timeRows.length; i++) {
  let row = timeRows[i];
  let hour = row.getAttribute("data-hour");
  let input = row.querySelector(".planner-input");
  
  if (plannerData[hour]) {
    input.value = plannerData[hour];
    row.classList.add("has-content");
  }
  
  input.addEventListener("input", function() {
    var val = input.value.trim();
    if (val) {
      plannerData[hour] = val;
      row.classList.add("has-content");
    } else {
      delete plannerData[hour];
      row.classList.remove("has-content");
    }
    localStorage.setItem("planner", JSON.stringify(plannerData));
  });
  
  var clearBtn = row.querySelector(".btn-clear");
  clearBtn.addEventListener("click", function() {
    input.value = "";
    delete plannerData[hour];
    row.classList.remove("has-content");
    localStorage.setItem("planner", JSON.stringify(plannerData));
  });
}

clearPlannerBtn.addEventListener("click", function() {
  for (var i = 0; i < timeRows.length; i++) {
    var row = timeRows[i];
    var input = row.querySelector(".planner-input");
    input.value = "";
    row.classList.remove("has-content");
  }
  plannerData = {};
  localStorage.removeItem("planner");
});

function highlightCurrentHourSlot() {
  var currentHour = new Date().getHours();
  for (var i = 0; i < timeRows.length; i++) {
    var row = timeRows[i];
    var hour = parseInt(row.getAttribute("data-hour"));
    if (hour === currentHour) {
      row.classList.add("current-hour");
    } else {
      row.classList.remove("current-hour");
    }
  }
}

highlightCurrentHourSlot();
setInterval(highlightCurrentHourSlot, 60000);

var goalForm = document.getElementById("goalForm");
var goalInput = document.getElementById("goalInput");
var goalList = document.getElementById("goalList");
var goalsFractionText = document.getElementById("goalsFractionText");
var goalsMotivationLabel = document.getElementById("goalsMotivationLabel");

var goals = [];
var storedGoals = localStorage.getItem("goals");
if (storedGoals) {
  goals = JSON.parse(storedGoals);
}

goalForm.addEventListener("submit", function(e) {
  e.preventDefault();
  var text = goalInput.value.trim();
  if (!text) {
    return;
  }
  
  var newGoal = {
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

goalList.addEventListener("click", function(e) {
  var target = e.target;
  
  var checkbox = target.closest(".goal-checkbox");
  if (checkbox) {
    var goalEl = checkbox.closest(".goal-item");
    var goalId = goalEl.getAttribute("data-id");
    
    for (var i = 0; i < goals.length; i++) {
      if (goals[i].id === goalId) {
        goals[i].completed = !goals[i].completed;
        break;
      }
    }
    saveGoals();
    renderGoals();
    return;
  }
  
  var deleteBtn = target.closest(".btn-delete");
  if (deleteBtn) {
    var goalEl = deleteBtn.closest(".goal-item");
    var goalId = goalEl.getAttribute("data-id");
    
    var newGoals = [];
    for (var i = 0; i < goals.length; i++) {
      if (goals[i].id !== goalId) {
        newGoals.push(goals[i]);
      }
    }
    goals = newGoals;
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
    goalList.innerHTML = '<li class="empty-state">No goals set yet.</li>';
  } else {
    for (var i = 0; i < goals.length; i++) {
      var goal = goals[i];
      var li = document.createElement("li");
      
      var classNames = "goal-item";
      if (goal.completed) {
        classNames += " completed";
      }
      li.className = classNames;
      li.setAttribute("data-id", goal.id);
      
      li.innerHTML = '<div class="goal-item-left">' +
        '<div class="goal-checkbox">' +
        '<i class="ri-check-line"></i>' +
        '</div>' +
        '<span class="goal-text">' + goal.text + '</span>' +
        '</div>' +
        '<button class="task-btn btn-delete">' +
        '<i class="ri-delete-bin-line"></i>' +
        '</button>';
      goalList.appendChild(li);
    }
  }
  
  updateGoalsProgress();
}

function updateGoalsProgress() {
  var total = goals.length;
  var completed = 0;
  for (var i = 0; i < goals.length; i++) {
    if (goals[i].completed === true) {
      completed++;
    }
  }
  
  goalsFractionText.textContent = completed + " of " + total + " completed";
  
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

var fallbackQuotes = [
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

var newQuoteBtn = document.getElementById("newQuoteBtn");
var quoteText = document.getElementById("quoteText");
var quoteAuthor = document.getElementById("quoteAuthor");
var quoteLoading = document.getElementById("quoteLoading");
var quoteTextWrapper = document.getElementById("quoteTextWrapper");

newQuoteBtn.addEventListener("click", fetchQuote);

function fetchQuote() {
  quoteTextWrapper.style.display = "none";
  quoteLoading.style.display = "block";
  
  fetch("https://api.allorigins.win/get?url=https://zenquotes.io/api/random")
    .then(function(res) {
      if (!res.ok) {
        throw new Error();
      }
      return res.json();
    })
    .then(function(data) {
      var parsed = JSON.parse(data.contents);
      if (parsed && parsed[0]) {
        quoteText.textContent = '"' + parsed[0].q + '"';
        quoteAuthor.textContent = "— " + parsed[0].a;
      } else {
        useLocalQuote();
      }
    })
    .catch(function() {
      useLocalQuote();
    })
    .finally(function() {
      quoteLoading.style.display = "none";
      quoteTextWrapper.style.display = "block";
    });
}

function useLocalQuote() {
  var index = Math.floor(Math.random() * fallbackQuotes.length);
  var q = fallbackQuotes[index];
  quoteText.textContent = '"' + q.text + '"';
  quoteAuthor.textContent = "— " + q.author;
}

fetchQuote();

var pomoDisplay = document.getElementById("pomoDisplay");
var pomoSessionType = document.getElementById("pomoSessionType");
var pomoStart = document.getElementById("pomoStart");
var pomoPause = document.getElementById("pomoPause");
var pomoReset = document.getElementById("pomoReset");
var pomoSoundBtn = document.getElementById("pomoSoundBtn");
var presetButtons = document.querySelectorAll(".preset-btn");

var timerInterval = null;
var currentMode = "work"; 
var totalSeconds = 25 * 60; 
var secondsLeft = totalSeconds;
var soundEnabled = true;

function updateTimerDisplay() {
  var minutes = Math.floor(secondsLeft / 60);
  var seconds = secondsLeft % 60;
  var displayMin = minutes;
  if (minutes < 10) {
    displayMin = "0" + minutes;
  }
  var displaySec = seconds;
  if (seconds < 10) {
    displaySec = "0" + seconds;
  }
  
  pomoDisplay.textContent = displayMin + ":" + displaySec;
}

function startTimer() {
  if (timerInterval) {
    return;
  }
  
  pomoStart.classList.add("hidden");
  pomoPause.classList.remove("hidden");
  
  timerInterval = setInterval(function() {
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
  
  for (var i = 0; i < presetButtons.length; i++) {
    var btn = presetButtons[i];
    if (btn.getAttribute("data-mode") === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }
  
  if (mode === "work") {
    pomoSessionType.textContent = "Work Session";
  } else if (mode === "short") {
    pomoSessionType.textContent = "Short Break";
  } else {
    pomoSessionType.textContent = "Long Break";
  }
  
  resetTimer();
}

for (var i = 0; i < presetButtons.length; i++) {
  var btn = presetButtons[i];
  btn.addEventListener("click", function() {
    var minutes = parseInt(this.getAttribute("data-minutes"));
    var mode = this.getAttribute("data-mode");
    switchMode(mode, minutes);
  });
}

pomoStart.addEventListener("click", startTimer);
pomoPause.addEventListener("click", pauseTimer);
pomoReset.addEventListener("click", resetTimer);

pomoSoundBtn.closest(".sound-toggle-bar").addEventListener("click", function() {
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
  if (!soundEnabled) {
    return;
  }
  try {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    
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
