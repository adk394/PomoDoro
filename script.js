import { supabase } from "./database/supabase.js";

let music = [
  {
    title: "Jazz Song",
    artist: "Anon",
    src: "/items/music/jazz.mp3",
    icon: "/items/music/icons/jazz.png",
  },
  {
    title: "Minecraft - Minecraft Volume Alpha",
    artist: "C418",
    src: "/items/music/minecraft1.mp3",
    icon: "/items/music/icons/minecraft1.png",
  },
];

let times = {
  seconds: document.getElementById("seconds"),
  minutes: document.getElementById("minutes"),
};

let clocks = {
  cicles: 1,
  flow: {
    title: "Pomodoro",
    lap: 1,
    minutes: "25",
    seconds: "00",
    isSelected: true,
    isActive: false,
  },
  shortPause: {
    title: "Short Break",
    minutes: "05",
    seconds: "00",
    isSelected: false,
    isActive: false,
  },
  longPause: {
    title: "Long Break",
    minutes: "10",
    seconds: "00",
    isSelected: false,
    isActive: false,
  },
};

///--- SUPABASE

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnRegistro = document.getElementById("btnRegister");

async function probarSupabase() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log("No has iniciado sesión");
    return;
  }

  const { error: errorGuardar } = await supabase.from("clocks").upsert(
    {
      user_id: user.id,
      flow_minutes: Number(clocks.flow.minutes),
      flow_seconds: Number(clocks.flow.seconds),
      short_minutes: Number(clocks.shortPause.minutes),
      short_seconds: Number(clocks.shortPause.seconds),
      long_minutes: Number(clocks.longPause.minutes),
      long_seconds: Number(clocks.longPause.seconds),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (errorGuardar) {
    console.log("Error al guardar:", errorGuardar.message);
    return;
  }

  console.log("¡Tiempos guardados correctamente!");
}

// Register

btnRegistro.addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  console.log("Registro:", data, error);
});

// Login

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) {
    console.log("Error al entrar:", error.message);
    return;
  }
  console.log("Login correcto:", data, error);
  await probarSupabase();
});

// ------------------------------------------------------------

// Music Player

let musicAudio = document.getElementById("musicAudio");

let startMiniRep = document.getElementById("playMiniRep");
let stopMiniRep = document.getElementById("stopMiniRep");

let volumeMiniRep = document.getElementById("volumeMiniRep");
let audioRange = document.getElementById("audioRange");

let advanceMiniRep = document.getElementById("advanceMiniRep");
let backMiniRep = document.getElementById("backMiniRep");
let musicIcon = document.getElementById("musicIcon");

let currentSong = 0;

let musicTitle = document.getElementById("musicTitle");
let musicSubtitle = document.getElementById("musicSubtitle");

updateMusicMiniRep();

audioRange.addEventListener("input", () => {
  musicAudio.volume = audioRange.value;

  if (musicAudio.volume > 0) {
    musicAudio.muted = false;
  }
});

function updateMusicMiniRep() {
  musicTitle.innerHTML = music[currentSong].title;
  musicSubtitle.innerHTML = music[currentSong].artist;
}

volumeMiniRep.addEventListener("click", () => {
  audioRange.classList.toggle("hidden");
});

startMiniRep.addEventListener("click", () => {
  musicAudio.src = music[currentSong].src;
  musicAudio.play();
  startMiniRep.classList.add("hidden");
  stopMiniRep.classList.remove("hidden");
});

stopMiniRep.addEventListener("click", () => {
  musicAudio.src = music[currentSong].src;
  musicAudio.pause();
  startMiniRep.classList.remove("hidden");
  stopMiniRep.classList.add("hidden");
});

advanceMiniRep.addEventListener("click", () => {
  if (currentSong > music.length - 1 || currentSong == music.length - 1) {
    return;
  } else {
    currentSong++;
    updateMusicMiniRep();

    musicIcon.style.backgroundImage = `url(${music[currentSong].icon})`;
    musicAudio.src = music[currentSong].src;
  }
});

backMiniRep.addEventListener("click", () => {
  if (currentSong == music.length - 1) {
    currentSong--;
    updateMusicMiniRep();

    musicIcon.style.backgroundImage = `url(${music[currentSong].icon})`;
    musicAudio.src = music[currentSong].src;
  }
});

// ------------------------------------------------------------
console.log(Notification.requestPermission(NavigationPrecommitController));

let startButton = document.getElementById("Start");
let intervalClock = null;
let buttonMenu = document.querySelectorAll(".configNav button");

let endClockMinutes = document.getElementById("endMin");
let endClockHours = document.getElementById("endHours");

let loginButton = document.getElementById("loginButton");

let closeOverlay = document.getElementById("closeOverlay");
let overlay = document.getElementById("mainOverlay");

let themeSelector = document.querySelectorAll(".configNav #themeSelect");
let clockMainDiv = document.querySelector(".clockMainDiv");

let miniPlayer = document.getElementById("miniPlayer");

let objectSelected;

// Mini reproductor --------------------------------

let pipWindow;
let player = document.getElementById("clock");

miniPlayer.addEventListener("click", async () => {
  if (pipWindow && !pipWindow.closed) {
    pipWindow.close();
    return;
  }

  pipWindow = await documentPictureInPicture.requestWindow({
    width: 320,
    height: 180,
  });

  pipWindow.document.body.appendChild(player);
});

// ----------------------------------------------------

loginButton.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  clockMainDiv.classList.add("blurred");
});

closeOverlay.addEventListener("click", () => {
  overlay.classList.add("hidden");
  clockMainDiv.classList.remove("blurred");
});

function avisar(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "",
    });
  }
}

buttonMenu.forEach((button) => {
  button.addEventListener("click", () => {
    let sibling = button.nextElementSibling;

    buttonMenu.forEach((otherButton) => {
      let otherSibling = otherButton.nextElementSibling;
      if (!otherSibling) return;
      const isCurrent = otherSibling === sibling;
      const isAncestor = otherSibling.contains(button);

      if (!isCurrent && !isAncestor) {
        otherSibling.classList.remove("open");
      }
    });

    sibling.classList.toggle("open");
  });
});

let resetButton = document.getElementById("resetButton");

resetButton.addEventListener("click", () => {
  objectSelected = whatClockIsSelected();
  objectSelected.seconds = "00";
  objectSelected.minutes = "00";
  times.seconds.innerHTML = objectSelected.seconds;
  times.minutes.innerHTML = objectSelected.minutes;
  stopTimer();
});

function advanceOnClock() {
  startButton.classList.remove("hidden");
  stopButton.classList.add("hidden");
  let objectSelected = whatClockIsSelected();
  if (objectSelected.title === "Flow" && clocks.flow.lap == 1) {
    adjustSelectedClock("shortPause");
    clocks.flow.lap = 2;
  } else if (objectSelected.title === "Pomodoro") {
    adjustSelectedClock("flow");
  } else if (objectSelected.title === "Short Break" && clocks.flow.lap == 2) {
    adjustSelectedClock("longPause");
  } else if (objectSelected.title === "Long Break") {
    adjustSelectedClock("flow");
    clocks.flow.lap = 1;
  }
  objectSelected = whatClockIsSelected();
  clockTitle.innerHTML = objectSelected.title;
  return whatClockIsSelected();
}

let blobFlow = document.getElementById("blobFlow");
let blobShort = document.getElementById("blobShort");
let blobLong = document.getElementById("blobLong");

function getTotalTime() {
  let allClocks = [clocks.flow, clocks.shortPause, clocks.longPause];
  let sumAllTime = 0;

  allClocks.forEach((clock) => {
    let minutes = clock.minutes * 60;
    sumAllTime += minutes;
    sumAllTime += parseInt(clock.seconds);
  });

  sumAllTime = sumAllTime / 60;
  console.log(sumAllTime);
  return sumAllTime;
}

startButton.addEventListener("click", () => {
  let objectSelected = whatClockIsSelected();
  let sumAllTime = getTotalTime();
  let currentTime = new Date();
  let currentMinutes = currentTime.getMinutes();
  let currentHours = currentTime.getHours();
  console.log(currentHours + ":" + currentMinutes);

  let endMinutes = Math.round(currentMinutes + sumAllTime);
  console.log(endMinutes);
  if (endMinutes > 59 && endMinutes < 119) {
    currentHours++;
    endMinutes = endMinutes - 60;
  } else if (endMinutes > 119 && endMinutes < 179) {
    endMinutes = endMinutes - 120;
    currentHours = currentHours + 2;
  } else if (endMinutes > 179) {
    endMinutes = endMinutes - 180;
    currentHours = currentHours + 3;
  }

  if (currentHours === 24) {
    currentHours = 0;
  }

  // Hay un bug que no se pueden sumar mas de 1 hora

  endClockMinutes.innerHTML = endMinutes;
  endClockHours.innerHTML = currentHours;

  if (endMinutes < 10) {
    endClockMinutes.innerHTML = endClockMinutes.innerHTML.padStart(2, "0");
  }

  if (currentHours < 10) {
    endClockHours.innerHTML = endClockHours.innerHTML.padStart(2, "0");
  }

  if (
    intervalClock !== null ||
    (objectSelected.minutes <= 0 && objectSelected.seconds <= 0)
  )
    return;

  if (objectSelected.title === "Pomodoro") {
    blobFlow.classList.add("blobActive");
  } else if (objectSelected.title === "Short Break") {
    blobShort.classList.add("blobActive");
  } else if (objectSelected.title === "Long Break") {
    blobLong.classList.add("blobActive");
  }

  startButton.classList.add("hidden");
  stopButton.classList.remove("hidden");
  objectSelected.isActive = true;
  intervalClock = setInterval(() => {
    let seconds = Number(times.seconds.innerHTML);
    let minutes = Number(times.minutes.innerHTML);
    times.seconds.innerHTML = seconds - 1;

    if (seconds <= 0) {
      times.seconds.innerHTML = 59;
      times.minutes.innerHTML = minutes - 1;
    }

    if (Number(times.seconds.innerHTML) < 10) {
      times.seconds.innerHTML = times.seconds.innerHTML.padStart(2, "0");
    }
    if (Number(times.minutes.innerHTML) < 10) {
      times.minutes.innerHTML = times.minutes.innerHTML.padStart(2, "0");
    }

    if (times.seconds.innerHTML == 0 && times.minutes.innerHTML == 0) {
      clearInterval(intervalClock);
      intervalClock = null;
      objectSelected.isActive = false;

      //cambias de reloj, y activas la siguiente fase del pomodoro
      advanceOnClock();
      objectSelected = whatClockIsSelected();
      times.seconds.innerHTML = objectSelected.seconds;
      times.minutes.innerHTML = objectSelected.minutes;
      if (clocks.cicles !== 4) {
        console.log(clocks.cicles++);
        avisar("Ciclo terminado", "🍅");
      } else if (clocks.cicles >= 4) {
        avisar("Pomodoro terminado", ":D :D :D 🍅🍅🍅");
        clocks.cicles = 0;
      }
    }
  }, 1000);
});

///---STOP

let stopButton = document.getElementById("Stop");

function stopTimer() {
  let objectSelected = whatClockIsSelected();

  stopButton.classList.add("hidden");
  startButton.classList.remove("hidden");

  if (objectSelected.title === "Pomodoro") {
    blobFlow.classList.remove("blobActive");
  } else if (objectSelected.title === "Short Break") {
    blobShort.classList.remove("blobActive");
  } else if (objectSelected.title === "Long Break") {
    blobLong.classList.remove("blobActive");
  }

  clearInterval(intervalClock);
  intervalClock = null;
  objectSelected.isActive = false;
  console.log(intervalClock);
}

stopButton.addEventListener("click", stopTimer);

///---SELECTOR DEL TIMER Y AJUSTE DEL ISSELECTED

function adjustSelectedClock(valor) {
  console.log(valor);

  //esto se podria cambiar, podria añadir una funcion donde le pases el param que quieres
  //el reloj que necesitas en este caso, deduciria lineas de codigo aqui y abajo
  if (valor === "flow") {
    clocks.flow.isSelected = true;
    clocks.shortPause.isSelected = false;
    clocks.longPause.isSelected = false;
  } else if (valor === "shortPause") {
    clocks.shortPause.isSelected = true;
    clocks.longPause.isSelected = false;
    clocks.flow.isSelected = false;
  } else if (valor === "longPause") {
    clocks.longPause.isSelected = true;
    clocks.flow.isSelected = false;
    clocks.shortPause.isSelected = false;
  }
}

// BOTONES DE CAMBIO DE RELOJ, FLOW -> SHORT -> LONG

let flowButton = document.getElementById("blobFlow");
let shortButton = document.getElementById("blobShort");
let longButton = document.getElementById("blobLong");

flowButton.addEventListener("click", () => {
  stopTimer();
  flowButton.classList.add("blobSelected");
  shortButton.classList.remove("blobSelected");
  longButton.classList.remove("blobSelected");

  clocks.flow.isSelected = true;
  clocks.shortPause.isSelected = false;
  clocks.longPause.isSelected = false;

  objectSelected = whatClockIsSelected();
  times.seconds.innerHTML = objectSelected.seconds;
  times.minutes.innerHTML = objectSelected.minutes;
  clockTitle.innerHTML = objectSelected.title;

  console.log(clocks.flow.isSelected);
});

shortButton.addEventListener("click", () => {
  stopTimer();
  flowButton.classList.remove("blobSelected");
  shortButton.classList.add("blobSelected");
  longButton.classList.remove("blobSelected");

  clocks.flow.isSelected = false;
  clocks.shortPause.isSelected = true;
  clocks.longPause.isSelected = false;

  objectSelected = whatClockIsSelected();
  times.seconds.innerHTML = objectSelected.seconds;
  times.minutes.innerHTML = objectSelected.minutes;
  clockTitle.innerHTML = objectSelected.title;

  console.log(clocks.shortPause.isSelected);
});

longButton.addEventListener("click", () => {
  stopTimer();
  flowButton.classList.remove("blobSelected");
  shortButton.classList.remove("blobSelected");
  longButton.classList.add("blobSelected");

  clocks.flow.isSelected = false;
  clocks.shortPause.isSelected = false;
  clocks.longPause.isSelected = true;

  objectSelected = whatClockIsSelected();
  times.seconds.innerHTML = objectSelected.seconds;
  times.minutes.innerHTML = objectSelected.minutes;
  clockTitle.innerHTML = objectSelected.title;

  console.log(clocks.longPause.isSelected);
});

// -----------------------------------------------

themeSelector.forEach((theme) => {
  theme.addEventListener("click", () => {
    console.log(theme.value);
    clockMainDiv.style.backgroundImage = `url("${theme.value}")`;
  });
});

function whatClockIsSelected() {
  for (let clock in clocks) {
    if (clocks[clock].isSelected === true) {
      let clockSelected = clocks[clock];
      return clockSelected;
    }
  }
}

let clockTitle = document.getElementById("clockTitle");

let minsFlow = document.querySelectorAll(".configNav #minFlow");
let minsShort = document.querySelectorAll(".configNav #minShort");
let minsLong = document.querySelectorAll(".configNav #minLong");

minsFlow.forEach((minFlow) => {
  minFlow.addEventListener("click", () => {
    clocks.flow.minutes = minFlow.value;
    if (clocks.flow.isSelected === true) {
      times.minutes.innerHTML = clocks.flow.minutes;
    }
    console.log(minFlow.value);
  });
});

minsShort.forEach((minShort) => {
  minShort.addEventListener("click", () => {
    clocks.shortPause.minutes = minShort.value;

    if (clocks.shortPause.isSelected === true) {
      times.minutes.innerHTML = clocks.shortPause.minutes;
    }
    console.log(minShort.value);
  });
});

minsLong.forEach((minLong) => {
  minLong.addEventListener("click", () => {
    clocks.longPause.minutes = minLong.value;

    if (clocks.longPause.isSelected === true) {
      times.minutes.innerHTML = clocks.longPause.minutes;
    }
    console.log(minLong.value);
  });
});
