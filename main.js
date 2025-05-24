// main.js - Versione per "Indovina la Bandiera"

let questions = [];           // Array delle domande
let currentQuestion = 0;      // Indice della domanda corrente (0-based)
const prizeLevels = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000]; // Premi per ciascun livello
let currentPrize = 0;         // Premio attuale
let safeMilestone = 0;        // Premio sicuro (fissato dopo la 5ª domanda)
let playerName = "";          // Nome del giocatore

// Variabili per gli aiuti (disabilitati dopo l'uso)
let help5050Used = false;
let helpSwitchUsed = false;

document.addEventListener("DOMContentLoaded", () => {
  // Mostra il modal per il nome del giocatore (non chiudibile senza inserimento)
  $('#playerModal').modal({
    backdrop: 'static',
    keyboard: false
  });

  // Evento per il bottone "Inizia il gioco"
  document.getElementById("startGameBtn").addEventListener("click", () => {
    const nameInput = document.getElementById("modalPlayerName").value.trim();
    if (nameInput === "") {
      alert("Inserisci il tuo nome!");
      return;
    }
    playerName = nameInput;
    $('#playerModal').modal('hide');
    
    // Reset dello stato della partita e degli aiuti
    currentQuestion = 0;
    currentPrize = 0;
    safeMilestone = 0;
    help5050Used = false;
    helpSwitchUsed = false;
    document.getElementById("btn5050").disabled = false;
    document.getElementById("btnSwitch").disabled = false;
    
    updateStatus();
    updateBoard("ongoing");
    clearCanvas();
    drawCanvasIntro();
    initGame();
  });

  // Eventi per pulsanti fissi
  document.getElementById("quitGame").addEventListener("click", quitGame);
  document.getElementById("submitScore").addEventListener("click", saveRecord);
  document.getElementById("newGame").addEventListener("click", newGame);
  document.getElementById("closeGame").addEventListener("click", () => { window.location.href = "index.html"; });
  
  // Eventi per i due aiuti
  document.getElementById("btn5050").addEventListener("click", use5050);
  document.getElementById("btnSwitch").addEventListener("click", useSwitch);
});

function initGame() {
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        alert("Errore: nessuna domanda trovata nel file JSON.");
        return;
      }
      // Conserva l'intero pool di domande (puoi avere più domande per lo switch)
      questions = data;
      console.log("Domande caricate:", questions);
      
      // Mescola le domande
      questions.sort(() => Math.random() - 0.5);
      
      // Se il pool è troppo grande, limitalo (lasciando qualche domanda in più per lo switch)
      if (questions.length >= prizeLevels.length + 3) {
          questions = questions.slice(0, prizeLevels.length + 3);
      } else {
          console.warn("Pool di domande limitato; lo switch potrebbe non avere effetto ottimale.");
      }
      showQuestion();
    })
    .catch(error => {
      console.error("Errore nel caricamento delle domande:", error);
      alert("Errore nel caricamento delle domande.");
    });
}

function updateStatus() {
  const statusArea = document.getElementById("statusArea");
  if (currentQuestion < prizeLevels.length) {
    statusArea.innerHTML = `Giocatore: ${playerName} | <strong>Domanda ${currentQuestion + 1} / ${prizeLevels.length}</strong> | Premio attuale: € ${currentPrize} | Prossimo premio: € ${prizeLevels[currentQuestion]}`;
  } else {
    statusArea.innerHTML = `Giocatore: ${playerName} | Hai completato tutte le domande! Premio totale: € ${currentPrize}`;
  }
}

function updateBoard(status) {
  // status: "ongoing", "win", "lose"
  const boardDiv = document.getElementById("prizeBoard");
  let html = "<ul class='list-group'>";
  for (let i = 0; i < prizeLevels.length; i++) {
    let className = "list-group-item";
    if (i < currentQuestion) {
      className += " bg-success text-white";
    } else if (i === currentQuestion) {
      if (status === "ongoing") {
        className += " active";
      } else if (status === "lose") {
        className += " bg-danger text-white";
      } else if (status === "win") {
        className += " bg-success text-white";
      }
    }
    html += `<li class="${className}">Domanda ${i + 1}: € ${prizeLevels[i]}</li>`;
  }
  html += "</ul>";
  boardDiv.innerHTML = html;
}

function showQuestion() {
  updateStatus();
  updateBoard("ongoing");

  if (currentQuestion >= prizeLevels.length) {
    winGame();
    return;
  }
  
  const q = questions[currentQuestion];
  if (!q) {
    console.error("Domanda non trovata per currentQuestion", currentQuestion);
    winGame();
    return;
  }
  
  const questionDiv = document.getElementById("question");
  // Se il record contiene 'flag', usalo per visualizzare l'emoji della bandiera  
  if (q.flag) {
    questionDiv.innerHTML = `<span class="flagEmoji">${q.flag}</span>`;
  } else {
    questionDiv.innerText = q.question;
  }
  
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = ""; // Pulisce l'area risposte

  for (let key in q.answers) {
    let col = document.createElement("div");
    col.className = "col-md-6 mb-3";
    
    let btn = document.createElement("button");
    btn.className = "btn btn-outline-primary btn-block answer-btn";
    btn.setAttribute("data-answer", key);
    btn.innerText = key.toUpperCase() + ": " + q.answers[key];
    btn.addEventListener("click", () => checkAnswer(key));
    
    col.appendChild(btn);
    answersDiv.appendChild(col);
  }
}

function checkAnswer(selected) {
  const q = questions[currentQuestion];
  const correct = q.correct;
  
  if (selected === correct) {
    animateCorrect();  // Animazione risposta corretta (5 sec)
    currentPrize = prizeLevels[currentQuestion];
    if (currentQuestion === 4) {
      safeMilestone = prizeLevels[4];
    }
    currentQuestion++;
    setTimeout(() => {
      updateBoard("ongoing");
      showQuestion();
    }, 5000);
  } else {
    animateWrong();
    setTimeout(() => {
      updateBoard("lose");
      loseGame();
    }, 5000);
  }
}

function quitGame() {
  animateQuit();
  setTimeout(() => {
    endGame("Ti sei ritirato", currentPrize);
  }, 5000);
}

function loseGame() {
  animateWrong();
  let premioFinale = safeMilestone;
  setTimeout(() => {
    endGame("Risposta sbagliata, hai perso !!!", premioFinale);
  }, 5000);
}

function winGame() {
  animateWin();
  setTimeout(() => {
    endGame("Hai Vinto!!! Denaro Vinto!", currentPrize);
  }, 5000);
}

function endGame(message, finalPrize) {
  document.getElementById("quizArea").style.display = "none";
  const endArea = document.getElementById("endGame");
  endArea.style.display = "block";
  
  document.getElementById("resultMessage").innerText = message;
  document.getElementById("score").innerText = finalPrize;
  document.getElementById("displayPlayerName").innerText = playerName;
  updateStatus();
  if (message.indexOf("perso") !== -1) {
    updateBoard("lose");
  } else {
    updateBoard("win");
  }
}

// Funzione di salvataggio record: usa response.json() e controlla il campo "success"
function saveRecord() {
  fetch('save.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: playerName, score: currentPrize })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Record salvato con successo!");
    } else {
      alert("Errore nel salvataggio del record: " + (data.error || "Errore sconosciuto"));
    }
    window.location.href = "index.html";
  })
  .catch(error => {
    console.error("Errore nel salvataggio del record:", error);
    alert("Errore nel salvataggio del record, controlla la console per maggiori dettagli.");
  });
}

function newGame() {
  document.getElementById("quizArea").style.display = "block";
  document.getElementById("endGame").style.display = "none";
  currentQuestion = 0;
  currentPrize = 0;
  safeMilestone = 0;
  help5050Used = false;
  helpSwitchUsed = false;
  document.getElementById("btn5050").disabled = false;
  document.getElementById("btnSwitch").disabled = false;
  updateStatus();
  updateBoard("ongoing");
  clearCanvas();
  drawCanvasIntro();
  initGame();
}

/* -------------------------------
   Funzione per pulire il canvas
------------------------------- */
function clearCanvas() {
  const canvas = document.getElementById("gameCanvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ==============================================================
   Funzioni di animazione per il canvas con effetti e lampeggiamenti
================================================================= */

// Animazione di intro: visualizza messaggio di benvenuto
function drawCanvasIntro() {
  const canvas = document.getElementById("gameCanvas");
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");
    clearCanvas();
    ctx.fillStyle = "#1d1f21";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#f1c40f";
    ctx.textAlign = "center";
    ctx.fillText("Benvenuto in Indovina la Bandiera!", canvas.width / 2, canvas.height / 2);
  }
}

// Animazione per risposta corretta: lampeggia per 5 sec e poi mostra sfondo verde con messaggio
function animateCorrect() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const flashDuration = 5000;
  const flashInterval = 250;
  const toggles = Math.floor(flashDuration / flashInterval);
  let counter = 0;
  
  let timer = setInterval(() => {
    if (counter % 2 === 0) {
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    counter++;
    if (counter >= toggles) {
      clearInterval(timer);
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "28px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("Hai Indovinato !!! Denaro Vinto!", canvas.width / 2, canvas.height / 2);
    }
  }, flashInterval);
}

// Animazione per risposta errata: lampeggia per 5 sec e poi mostra sfondo rosso con messaggio
function animateWrong() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const flashDuration = 5000;
  const flashInterval = 250;
  const toggles = Math.floor(flashDuration / flashInterval);
  let counter = 0;
  
  let timer = setInterval(() => {
    if (counter % 2 === 0) {
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    counter++;
    if (counter >= toggles) {
      clearInterval(timer);
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "28px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("Risposta sbagliata, hai perso !!!", canvas.width / 2, canvas.height / 2);
    }
  }, flashInterval);
}

// Animazione per Switch: flash viola per 1 sec
function animateSwitch() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const flashDuration = 1000;
  const flashInterval = 250;
  const toggles = Math.floor(flashDuration / flashInterval);
  let counter = 0;
  
  let timer = setInterval(() => {
    if (counter % 2 === 0) {
      ctx.fillStyle = "#9b59b6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    counter++;
    if (counter >= toggles) {
      clearInterval(timer);
      clearCanvas();
    }
  }, flashInterval);
}

// Animazione per Ritirati: flash blu-grigio per 5 sec
function animateQuit() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const flashDuration = 5000;
  const flashInterval = 250;
  const toggles = Math.floor(flashDuration / flashInterval);
  let counter = 0;
  
  let timer = setInterval(() => {
    if (counter % 2 === 0) {
      ctx.fillStyle = "#34495e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    counter++;
    if (counter >= toggles) {
      clearInterval(timer);
      clearCanvas();
    }
  }, flashInterval);
}

/* =====================================================
   Funzioni degli Aiuti: "50 e 50" e "Switch"
===================================================== */

// Aiuto "50 e 50": rimuove due risposte errate dalla domanda corrente
function use5050() {
  if (currentQuestion >= questions.length || help5050Used) return;
  
  const currentQ = questions[currentQuestion];
  const correct = currentQ.correct;
  
  const answerButtons = document.querySelectorAll("#answers button.answer-btn");
  let wrongButtons = [];
  answerButtons.forEach(btn => {
    if (btn.getAttribute("data-answer") !== correct) {
      wrongButtons.push(btn);
    }
  });
  
  if (wrongButtons.length < 2) return;
  wrongButtons.sort(() => Math.random() - 0.5);
  wrongButtons[0].style.display = "none";
  wrongButtons[1].style.display = "none";
  
  help5050Used = true;
  document.getElementById("btn5050").disabled = true;
}

// Aiuto "Switch": sostituisce la domanda corrente senza avanzare il livello
function useSwitch() {
  if (currentQuestion >= questions.length || helpSwitchUsed) return;
  
  animateSwitch();
  helpSwitchUsed = true;
  document.getElementById("btnSwitch").disabled = true;
  
  // Rimuove la domanda corrente dall'array senza incrementare currentQuestion
  questions.splice(currentQuestion, 1);
  setTimeout(() => {
    updateBoard("ongoing");
    showQuestion();
  }, 1000);
}
