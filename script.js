import { supabase } from "./database/supabase.js";

let music = [
  {
    title: "Jazz Default",
    artist: "Anon",
    src: "/items/music/jazz.mp3",
    icon: "/items/music/icons/animal.jpg",
  },
  {
    title: "Minecraft - Minecraft Volume Alpha",
    artist: "C418",
    src: "/items/music/minecraft1.mp3",
    icon: "/items/music/icons/minecraft.jpg",
  },
  {
    title: "Honey Comb",
    artist: "ggg.",
    src: "/items/music/bluematchalatte.mp3",
    icon: "/items/music/icons/cat1.jpg",
  },
  {
    title: "Blue matcha",
    artist: "ggg.",
    src: "/items/music/honeycomb.mp3",
    icon: "/items/music/icons/sheep1.jpg",
  },
  {
    title: "Pip Pip",
    artist: "Anon",
    src: "/items/music/jazz.mp3",
    icon: "/items/music/icons/menta.png",
  },
  {
    title: "Vigo Carlos",
    artist: "C418",
    src: "/items/music/minecraft1.mp3",
    icon: "/items/music/icons/marino.png",
  },
  {
    title: "Marino Carlos",
    artist: "C418",
    src: "/items/music/minecraft1.mp3",
    icon: "/items/music/icons/mar.png",
  },
];

let times = {
  seconds: document.getElementById("seconds"),
  minutes: document.getElementById("minutes"),
};

let clocks = {
  cicles: 1,
  autoStart: false,
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
let clockMainDiv = document.querySelector(".clockMainDiv");
let messageError = document.getElementById("messageError");
let currentBackground = "./items/backgrounds/original.svg";
let currentColor = "#171717";
let currentTextColor = "#ffffff";
let loadingScreen = document.querySelector(".loadingScreen");

// GUARDAR: de clocks -> base de datos
async function guardarRelojes() {
  console.log("guardando datos");
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
      background: currentBackground,
      color: currentColor,
      text_color: currentTextColor,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (errorGuardar) {
    console.log("Error al guardar:", errorGuardar.message);
    return;
  }

  console.log("¡Tiempos guardados correctamente!");
}

// CARGAR: de base de datos -> clocks
async function cargarRelojes() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("clocks")
    .select("*")
    .maybeSingle();

  if (error) {
    console.log("Error al cargar:", error.message);
    return;
  }
  if (!data) return; // usuario nuevo: aún sin fila

  const tipos = {
    flow: "flow",
    shortPause: "short",
    longPause: "long",
  };

  if (data.background) {
    currentBackground = data.background;
    clockMainDiv.style.backgroundImage = `url("${currentBackground}")`;
  }

  if (data.color) {
    currentColor = data.color;
    clockMainDiv.style.backgroundColor = `${currentColor}`;
  }

  if (data.text_color) {
    currentTextColor = data.text_color;
    clockMainDiv.style.color = `${currentTextColor}`;
    allSvgs.forEach((svg) => {
      svg.style.fill = `${currentTextColor}`;
    });
    blobs.forEach((blob) => {
      blob.style.backgroundColor = `${currentTextColor}80`;
    });
  }

  for (const [claveObjeto, prefijo] of Object.entries(tipos)) {
    clocks[claveObjeto].minutes = String(data[`${prefijo}_minutes`]).padStart(
      2,
      "0",
    );
    clocks[claveObjeto].seconds = String(data[`${prefijo}_seconds`]).padStart(
      2,
      "0",
    );
  }
}

cargarRelojes(); // al abrir la app: LEER, nunca guardar

// Register

btnRegistro.addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  messageError.innerHTML = ("Registro:", data, error);
});

// Login

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) {
    messageError.innerHTML = ("Error al entrar:", error.message);
    return;
  }
  messageError.innerHTML = ("Login correcto:", data, error);
  await guardarRelojes();
});

const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  messageError.innerHTML = ("Logueado como:", session.user.email);
} else {
  messageError.innerHTML = "No hay sesión";
}

async function startApp() {
  await cargarRelojes();

  let firstUpdate = whatClockIsSelected();
  console.log(firstUpdate);
  times.seconds.innerHTML = firstUpdate.seconds;
  times.minutes.innerHTML = firstUpdate.minutes;
}

async function iniciarApp() {
  startApp();
  await cargarRelojes();
  loadingScreen.classList.add("hidden"); // ahora sí se muestra
  clockMainDiv.classList.remove("hidden");
}

iniciarApp();

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

updateMusicMiniRep();

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
  if (currentSong == music.length - 1 || currentSong < 0) {
    return;
  } else {
    currentSong++;
    updateMusicMiniRep();
    console.log(currentSong);

    musicIcon.style.backgroundImage = `url(${music[currentSong].icon})`;
    musicAudio.src = music[currentSong].src;
  }
});

backMiniRep.addEventListener("click", () => {
  if (currentSong !== music.length - 1 || currentSong !== 0) {
    currentSong--;
    if (currentSong < 0) {
      currentSong = 0;
    }
    updateMusicMiniRep();
    console.log(currentSong);
    musicIcon.style.backgroundImage = `url(${music[currentSong].icon})`;
    musicAudio.src = music[currentSong].src;
  }
});

// ------------------------------------------------------------

// Mini reproductor --------------------------------

let miniPlayer = document.getElementById("miniPlayer");

let pipWindow;
let player = document.getElementById("clock");
let title = document.getElementById("clockTitle");
let stopstart = document.querySelector(".switchState");

miniPlayer.addEventListener("click", async () => {
  if (pipWindow && !pipWindow.closed) {
    pipWindow.close();
    return;
  }

  pipWindow = await documentPictureInPicture.requestWindow({
    width: 300,
    height: 140,
    disallowReturnToOpener: true,
  });

  const marcador = document.createComment("reloj");
  const estilo = pipWindow.document.createElement("style");

  estilo.textContent = `
  @font-face {
    font-family: "SFPro";
    src: url("./items/fonts/sf-pro-display/SFPRODISPLAYREGULAR.OTF")
      format("opentype");
    font-weight: 400;
    font-style: normal;
  }

  body {
  font-variant-numeric: tabular-nums;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url(${currentBackground});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: ${currentColor};
  color: ${currentTextColor};
  margin: 0;
  padding: 0;
  overflow: hidden; 

  }

  svg {
  width:44px;
  height:44px;
  }

  #clock {
  font-size: 3rem ;
  border: 0px;
  display: flex;
  font-family: "SFPro";
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  }

  .time {
  text-align: center;
  margin: 0;
  }

  p {
  margin:0;
  }

  .blob {
  transition: 150ms;
  border-radius: 1rem;
  width: 0.25rem;
  height: 0.25rem;
  background-color: ${currentTextColor}80;
  border: 0px #ffffff7c solid;
}

.blob:hover {
  transition: 150ms;
  border-radius: 1rem;
  background-color: ${currentTextColor};
  opacity: 0.5;
}

.blobSelected {
  transition: 150ms;
  width: 0.25rem;
  height: 0.25rem;
  background-color: ${currentTextColor};
}

.blobActive {
  transition: 150ms;
  width: 0.5rem;
  height: 0.25rem;
}

#clockTitle {
  padding-top: 1rem;
  font-family: "SFPro";
  font-size: 1rem;
  margin: 0rem;
  font-weight: 500;
}

.hidden {
  display: none !important;
}

`;
  player.before(marcador);
  pipWindow.document.head.appendChild(estilo);

  pipWindow.document.body.appendChild(title);
  pipWindow.document.body.appendChild(player);

  pipWindow.addEventListener("pagehide", () => {
    marcador.replaceWith(title, player);
  });
});

// ----------------------------------------------------

Notification.requestPermission(NavigationPrecommitController);

let startButton = document.getElementById("Start");
let intervalClock = null;
let buttonMenu = document.querySelectorAll(".configNav button");

let endClockMinutes = document.getElementById("endMin");
let endClockHours = document.getElementById("endHours");

let loginButton = document.getElementById("loginButton");

let closeOverlay = document.getElementById("closeOverlay");
let closeMusicListOverlay = document.getElementById("closeMusicListOverlay");
let overlay = document.getElementById("mainOverlay");

let themeSelector = document.querySelectorAll(".configNav #themeSelect");
let colorSelector = document.querySelectorAll(".configNav #colorSelect");

let blobs = document.querySelectorAll(".blob");

let openMusicBar = document.getElementById("openMusicBar");
let insideMusicBar = document.getElementById("insideMusicBar");
let musicBar = document.getElementById("musicBar");

let svgOpenBar = document.getElementById("svgOpenBar");
let svgCloseBar = document.getElementById("svgCloseBar");

let musicListOverlay = document.getElementById("musicListOverlay");
let listMiniRep = document.getElementById("listMiniRep");
let songsList = document.getElementById("songsList");

let objectSelected;

let selectorFontType = document.querySelectorAll(".configNav #typeText");
let clockTitle = document.getElementById("clockTitle");
let watchClock = document.querySelector(".watchClock");

let autoStartButton = document.getElementById("autoStartButton");
let onOff = document.getElementById("onOff");

autoStartButton.addEventListener("click", () => {
  clocks.autoStart = !clocks.autoStart;
  if (clocks.autoStart == true) {
    onOff.innerHTML = "ON";
  } else {
    onOff.innerHTML = "OFF";
  }
});

selectorFontType.forEach((fontType) => {
  fontType.addEventListener("click", async () => {
    console.log(fontType.textContent);
    clockTitle.style.fontFamily = fontType.textContent;
    watchClock.style.fontFamily = fontType.textContent;
  });
});

function renderPlaylist() {
  music.forEach((song) => {
    songsList.innerHTML += `
    <div id="musicListBar"> 
      <div id="musicListIcon" style="background-image: url(${song.icon});">  </div>
      <div id="textDivMusic">
        <p id="musicListTitle"> ${song.title} </p> 
        <p id="musicListSubtitle"> ${song.artist} </p> 
      </div>
    </div>`;
  });
}
renderPlaylist();

listMiniRep.addEventListener("click", () => {
  musicListOverlay.classList.toggle("hidden");
  clockMainDiv.classList.add("blurred");
});

openMusicBar.addEventListener("click", () => {
  svgCloseBar.classList.toggle("hidden");
  svgOpenBar.classList.toggle("hidden");

  insideMusicBar.classList.toggle("hidden");
  musicBar.classList.toggle("musicBarCompact");
  musicIcon.classList.toggle("musicIconCompact");
  openMusicBar.classList.toggle("closeMusicBar");
});

loginButton.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  clockMainDiv.classList.add("blurred");
});

closeMusicListOverlay.addEventListener("click", () => {
  musicListOverlay.classList.toggle("hidden");
  clockMainDiv.classList.remove("blurred");
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

resetButton.addEventListener("click", async () => {
  objectSelected = whatClockIsSelected();
  objectSelected.seconds = "00";
  objectSelected.minutes = "00";
  times.seconds.innerHTML = objectSelected.seconds;
  times.minutes.innerHTML = objectSelected.minutes;
  await guardarRelojes();
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

let musicRingTone = document.getElementById("musicRingTone");

function start() {
  let objectSelected = whatClockIsSelected();

  document.title = `Essy | ${objectSelected.title}`;
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

    document.title = `Essy | ${objectSelected.title} ${times.minutes.innerHTML}:${times.seconds.innerHTML}`;

    if (times.seconds.innerHTML == 0 && times.minutes.innerHTML == 0) {
      musicRingTone.play();
      clearInterval(intervalClock);
      musicAudio.play();
      intervalClock = null;
      objectSelected.isActive = false;

      //cambias de reloj, y activas la siguiente fase del pomodoro
      advanceOnClock();
      objectSelected = whatClockIsSelected();
      times.seconds.innerHTML = objectSelected.seconds;
      times.minutes.innerHTML = objectSelected.minutes;
      if (clocks.cicles !== 4) {
        console.log(clocks.cicles++);
        avisar(`${objectSelected.title} terminado`, "🌼");
      } else if (clocks.cicles >= 4) {
        avisar("Pomodoro terminado", "🪷");
        clocks.cicles = 0;
      }
      if (clocks.autoStart === true) {
        start();
      }
    }
  }, 1000);
}

startButton.addEventListener("click", start);

///---STOP

let stopButton = document.getElementById("Stop");

function stopTimer() {
  let objectSelected = whatClockIsSelected();
  document.title = `Essy`;
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
    currentBackground = theme.value;
    console.log(theme.value);
    clockMainDiv.style.backgroundImage = `url("${currentBackground}")`;
    guardarRelojes();
  });
});

let allSvgs = document.body.querySelectorAll(".clockMainDiv svg path");

colorSelector.forEach((color) => {
  color.addEventListener("click", () => {
    currentColor = color.value;
    currentTextColor = color.name;
    console.log(color.value);
    clockMainDiv.style.backgroundColor = `${currentColor}`;
    clockMainDiv.style.color = `${currentTextColor}`;
    allSvgs.forEach((svg) => {
      svg.style.fill = `${currentTextColor}`;
    });
    blobs.forEach((blob) => {
      blob.style.backgroundColor = `${currentTextColor}80`;
    });
    guardarRelojes();
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

let minsFlow = document.querySelectorAll(".configNav #minFlow");
let minsShort = document.querySelectorAll(".configNav #minShort");
let minsLong = document.querySelectorAll(".configNav #minLong");

function correctZero() {
  times.seconds.innerHTML = times.seconds.innerHTML.padStart(2, "0");
  times.minutes.innerHTML = times.minutes.innerHTML.padStart(2, "0");
}

minsFlow.forEach((minFlow) => {
  minFlow.addEventListener("click", async () => {
    clocks.flow.minutes = minFlow.value;
    clocks.flow.seconds = "00";

    await guardarRelojes();

    if (clocks.flow.isSelected === true) {
      times.minutes.innerHTML = clocks.flow.minutes;
      times.seconds.innerHTML = clocks.flow.seconds;
    }
    console.log(minFlow.value);
    correctZero();
  });
});

minsShort.forEach((minShort) => {
  minShort.addEventListener("click", async () => {
    clocks.shortPause.minutes = minShort.value;
    clocks.shortPause.seconds = "00";

    await guardarRelojes();

    if (clocks.shortPause.isSelected === true) {
      times.minutes.innerHTML = clocks.shortPause.minutes;
      times.minutes.innerHTML = clocks.shortPause.seconds;
    }
    console.log(minShort.value);
    correctZero();
  });
});

minsLong.forEach((minLong) => {
  minLong.addEventListener("click", () => {
    clocks.longPause.minutes = minLong.value;
    clocks.longPause.seconds = "00";

    if (clocks.longPause.isSelected === true) {
      times.minutes.innerHTML = clocks.longPause.minutes;
      times.seconds.innerHTML = clocks.longPause.seconds;
    }
    console.log(minLong.value);
    correctZero();
  });
});
