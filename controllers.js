// controllers.js – Gestione degli input da tastiera, touchscreen, mouse e gamepad

// Gestione della tastiera: risposte con i tasti A, B, C, D; tasto 'q' per ritirarsi
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["a", "b", "c", "d"].includes(key)) {
    const btn = document.querySelector(`button.answer-btn[data-answer="${key}"]`);
    if (btn) {
      btn.click();
    }
  }
  if (key === "q") {
    const quitBtn = document.getElementById("quitGame");
    if (quitBtn) {
      quitBtn.click();
    }
  }
});

// Per dispositivi touchscreen e mouse, non serve altro perché i "click" gestiti su ogni button
// infatti rispondono sia a mouse click che a tap su touchscreen.

// Gestione base per il gamepad (joypad)
// Al mapping standard, consideriamo:
//  - Button 0 → Risposta "A"
//  - Button 1 → Risposta "B"
//  - Button 2 → Risposta "C"
//  - Button 3 → Risposta "D"
//  - Button 9 → Ritiro (opzionale, mappato al tasto "quit")
window.addEventListener("gamepadconnected", (e) => {
  console.log("Gamepad connesso:", e.gamepad);
});

// Funzione di polling per il gamepad
function pollGamepad() {
  const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
  if (gp) {
    // Per ogni pulsante, verifichiamo se è premuto e simuliamo un click sul bottone corrispondente
    if (gp.buttons[0] && gp.buttons[0].pressed) {
      const btn = document.querySelector(`button.answer-btn[data-answer="a"]`);
      if (btn) btn.click();
    }
    if (gp.buttons[1] && gp.buttons[1].pressed) {
      const btn = document.querySelector(`button.answer-btn[data-answer="b"]`);
      if (btn) btn.click();
    }
    if (gp.buttons[2] && gp.buttons[2].pressed) {
      const btn = document.querySelector(`button.answer-btn[data-answer="c"]`);
      if (btn) btn.click();
    }
    if (gp.buttons[3] && gp.buttons[3].pressed) {
      const btn = document.querySelector(`button.answer-btn[data-answer="d"]`);
      if (btn) btn.click();
    }
    // Mappatura opzionale: tasto 9 per ritirarsi
    if (gp.buttons[9] && gp.buttons[9].pressed) {
      const quitBtn = document.getElementById("quitGame");
      if (quitBtn) quitBtn.click();
    }
  }
  requestAnimationFrame(pollGamepad);
}
pollGamepad(); // Avvio del polling del gamepad
