let js = 0;
let java = 0;
let python = 0;

let js_btn = document.getElementById("js");
let java_btn = document.getElementById("java");
let python_btn = document.getElementById("python");

// Update count display
function updateDisplay() {
    document.getElementById("js_count").textContent = "JavaScript : " + js;
    document.getElementById("java_count").textContent = "Java : " + java;
    document.getElementById("python_count").textContent = "Python : " + python;
}

// Vote functions
function voteJS() {
    js++;
    console.log("JavaScript count: " + js);
    updateDisplay();
    resetInactivityTimer();
}

function voteJava() {
    java++;
    console.log("Java count: " + java);
    updateDisplay();
    resetInactivityTimer();
}

function votePython() {
    python++;
    console.log("Python count: " + python);
    updateDisplay();
    resetInactivityTimer();
}

// Event listeners
js_btn.addEventListener("click", voteJS);
java_btn.addEventListener("click", voteJava);
python_btn.addEventListener("click", votePython);

// Inactivity timer logic
let inactivityTimer = setTimeout(randomVote, 2000);

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(randomVote, 2000);
}

function randomVote() {
    let choice = Math.floor(Math.random() * 3);
    if (choice === 0) voteJS();
    else if (choice === 1) voteJava();
    else votePython();
}
