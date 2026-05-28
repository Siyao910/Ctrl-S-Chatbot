(function () {
  "use strict";

  const STORAGE_KEY = "ctrl-s-save-earth-progress";
  const lessonIds = ["reduce", "recycle", "special"];
  const actionIds = ["bottle", "sort", "share"];
  function createDefaultState() {
    return {
      completedLessons: [],
      questionsAsked: 0,
      bestScore: 0,
      actions: [],
      badges: []
    };
  }

  const badges = [
    { id: "curious", mark: "ASK", name: "Curious Recycler", description: "Ask one sorting question." },
    { id: "learner", mark: "101", name: "Lesson Starter", description: "Complete one module." },
    { id: "champion", mark: "SDG", name: "Knowledge Champion", description: "Complete every module." },
    { id: "sorter", mark: "BIN", name: "Sorting Star", description: "Score 6 or more." },
    { id: "perfect", mark: "100", name: "Perfect Sorter", description: "Get every item right." },
    { id: "action", mark: "ACT", name: "Action Taker", description: "Complete three actions." }
  ];

  const sortingItems = [
    { symbol: "PET", name: "Empty plastic water bottle", hint: "The bottle has been rinsed and the cap is attached.", bin: "recycle" },
    { symbol: "PEEL", name: "Banana peel", hint: "It is food waste and contains no packaging.", bin: "compost" },
    { symbol: "BAT", name: "Used lithium battery", hint: "It can start fires in regular waste streams.", bin: "ewaste" },
    { symbol: "TIS", name: "Used tissue", hint: "It is soiled and cannot be recycled.", bin: "trash" },
    { symbol: "CAN", name: "Clean aluminum drink can", hint: "It is empty and ready for processing.", bin: "recycle" },
    { symbol: "CORE", name: "Apple core", hint: "It naturally breaks down with food scraps.", bin: "compost" },
    { symbol: "EAR", name: "Broken wired earphones", hint: "They contain electronic components.", bin: "ewaste" },
    { symbol: "WRAP", name: "Snack wrapper", hint: "This flexible multilayer packaging is not accepted here.", bin: "trash" }
  ];

  const knowledge = [
    {
      terms: ["plastic", "bottle", "pet"],
      reply: "Yes, an empty plastic bottle is usually recyclable. Empty it, rinse away residue, keep it dry, and follow your local rule about caps."
    },
    {
      terms: ["battery", "batteries", "power bank"],
      reply: "Batteries never belong in recycling or trash bins. Tape exposed terminals if needed and take them to an e-waste or battery collection point."
    },
    {
      terms: ["pizza", "box", "cardboard"],
      reply: "Clean cardboard can be recycled. Tear off heavily greasy or food-covered sections of a pizza box and place those sections in compost or trash according to local rules."
    },
    {
      terms: ["coffee", "cup"],
      reply: "Most disposable coffee cups have a plastic lining and are not accepted in ordinary paper recycling. A reusable cup is the best choice; check local specialty collection programs."
    },
    {
      terms: ["aluminum", "tin can", "drink can", "metal can"],
      reply: "Empty aluminum and steel cans are widely recyclable. Give them a quick rinse so leftover food does not contaminate other materials."
    },
    {
      terms: ["food", "banana", "apple", "compost"],
      reply: "Food scraps such as fruit peels and cores can go into compost where a collection service exists. Remove stickers and packaging first."
    },
    {
      terms: ["glass", "jar"],
      reply: "Glass bottles and jars are often recyclable after being emptied and rinsed. Broken glass and drinking glasses may require special disposal, so check local guidance."
    },
    {
      terms: ["electronic", "phone", "cable", "earphone", "e-waste"],
      reply: "Electronics should be taken to an e-waste collection point so valuable materials can be recovered safely. Do not place them in curbside recycling."
    }
  ];

  let state = loadState();
  let activeGame = [];
  let currentRound = 0;
  let score = 0;
  let awaitingChoice = false;
  let advanceTimer = null;
  const binNames = {
    recycle: "recycling",
    compost: "compost",
    trash: "trash",
    ewaste: "e-waste"
  };

  const elements = {
    progressPercent: document.getElementById("progressPercent"),
    badgeShelf: document.getElementById("badgeShelf"),
    chatMessages: document.getElementById("chatMessages"),
    chatForm: document.getElementById("chatForm"),
    chatInput: document.getElementById("chatInput"),
    gameScore: document.getElementById("gameScore"),
    gameTotal: document.getElementById("gameTotal"),
    bestScore: document.getElementById("bestScore"),
    scoreFill: document.getElementById("scoreFill"),
    startGame: document.getElementById("startGame"),
    roundLabel: document.getElementById("roundLabel"),
    itemSymbol: document.getElementById("itemSymbol"),
    itemName: document.getElementById("itemName"),
    itemHint: document.getElementById("itemHint"),
    binOptions: document.getElementById("binOptions"),
    gameFeedback: document.getElementById("gameFeedback"),
    resetProgress: document.getElementById("resetProgress")
  };

  function loadState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (!parsed) return createDefaultState();
      return {
        completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
        questionsAsked: Number(parsed.questionsAsked) || 0,
        bestScore: Number(parsed.bestScore) || 0,
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
        badges: Array.isArray(parsed.badges) ? parsed.badges : []
      };
    } catch (error) {
      return createDefaultState();
    }
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function awardBadge(id) {
    if (!state.badges.includes(id)) {
      state.badges.push(id);
    }
  }

  function checkAchievements() {
    if (state.questionsAsked >= 1) awardBadge("curious");
    if (state.completedLessons.length >= 1) awardBadge("learner");
    if (state.completedLessons.length === lessonIds.length) awardBadge("champion");
    if (state.bestScore >= 6) awardBadge("sorter");
    if (state.bestScore === sortingItems.length) awardBadge("perfect");
    if (state.actions.length === actionIds.length) awardBadge("action");
  }

  function updateProgress() {
    const progressUnits =
      state.completedLessons.length +
      Math.min(state.questionsAsked, 1) +
      Math.min(state.bestScore, sortingItems.length) +
      state.actions.length;
    const maxUnits = lessonIds.length + 1 + sortingItems.length + actionIds.length;
    elements.progressPercent.textContent = Math.round((progressUnits / maxUnits) * 100) + "%";
  }

  function renderLessons() {
    lessonIds.forEach(function (id) {
      const card = document.querySelector('[data-lesson="' + id + '"]');
      const button = document.querySelector('[data-complete="' + id + '"]');
      const completed = state.completedLessons.includes(id);
      card.classList.toggle("completed", completed);
      button.textContent = completed ? "Completed" : "Mark as Complete";
      button.setAttribute("aria-pressed", String(completed));
    });
  }

  function renderBadges() {
    elements.badgeShelf.innerHTML = badges.map(function (badge) {
      const earned = state.badges.includes(badge.id);
      return (
        '<article class="badge ' + (earned ? "earned" : "") + '">' +
        '<div class="badge-icon">' + (earned ? badge.mark : "LOCK") + "</div>" +
        "<h3>" + badge.name + "</h3>" +
        "<p>" + (earned ? "Unlocked" : badge.description) + "</p>" +
        "</article>"
      );
    }).join("");
  }

  function renderActions() {
    actionIds.forEach(function (id) {
      const checkbox = document.querySelector('[data-action="' + id + '"]');
      checkbox.checked = state.actions.includes(id);
    });
  }

  function syncView() {
    checkAchievements();
    saveState();
    renderLessons();
    renderBadges();
    renderActions();
    elements.bestScore.textContent = String(state.bestScore);
    updateProgress();
  }

  function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = "message " + type;
    message.textContent = text;
    elements.chatMessages.appendChild(message);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }

  function getReply(question) {
    const input = question.toLowerCase();
    const match = knowledge.find(function (entry) {
      return entry.terms.some(function (term) {
        return input.includes(term);
      });
    });
    if (match) return match.reply;
    return "I do not have a specific match for that item yet. Start by checking whether it is empty, clean, and accepted locally. If it contains batteries, electronics, chemicals, or sharp parts, use a special collection point.";
  }

  function askQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed) return;
    addMessage(trimmed, "user");
    addMessage(getReply(trimmed), "bot");
    state.questionsAsked += 1;
    syncView();
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temporary = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temporary;
    }
    return copy;
  }

  function enableBins(enabled) {
    elements.binOptions.querySelectorAll("button").forEach(function (button) {
      button.disabled = !enabled;
    });
  }

  function showRound() {
    const item = activeGame[currentRound];
    awaitingChoice = true;
    enableBins(true);
    elements.roundLabel.textContent = "Item " + (currentRound + 1) + " of " + activeGame.length;
    elements.itemSymbol.textContent = item.symbol;
    elements.itemName.textContent = item.name;
    elements.itemHint.textContent = item.hint;
    elements.gameFeedback.textContent = "";
    elements.gameFeedback.classList.remove("wrong");
  }

  function startGame() {
    window.clearTimeout(advanceTimer);
    activeGame = shuffle(sortingItems);
    currentRound = 0;
    score = 0;
    elements.gameScore.textContent = "0";
    elements.scoreFill.style.width = "0%";
    elements.startGame.textContent = "Restart Game";
    showRound();
  }

  function finishGame() {
    enableBins(false);
    awaitingChoice = false;
    state.bestScore = Math.max(state.bestScore, score);
    syncView();
    elements.roundLabel.textContent = "Challenge completed";
    elements.itemSymbol.textContent = score >= 6 ? "WIN" : "TRY";
    elements.itemName.textContent = "You scored " + score + " out of " + activeGame.length;
    elements.itemHint.textContent = score >= 6 ?
      "Great work! You are ready to sort waste with confidence." :
      "Review the lessons and play again to improve your score.";
    elements.gameFeedback.textContent = score === activeGame.length ?
      "Perfect sorting! You unlocked the Perfect Sorter badge." :
      "Your best result is saved in your badge collection.";
  }

  function chooseBin(selectedBin) {
    if (!awaitingChoice) return;
    awaitingChoice = false;
    enableBins(false);
    const item = activeGame[currentRound];
    const correct = item.bin === selectedBin;
    if (correct) {
      score += 1;
      elements.gameScore.textContent = String(score);
      elements.gameFeedback.textContent = "Correct! This item belongs in " + binNames[selectedBin] + ".";
      elements.gameFeedback.classList.remove("wrong");
    } else {
      elements.gameFeedback.textContent = "Not quite. The correct choice is " + binNames[item.bin] + ".";
      elements.gameFeedback.classList.add("wrong");
    }
    elements.scoreFill.style.width = ((score / activeGame.length) * 100) + "%";
    advanceTimer = window.setTimeout(function () {
      currentRound += 1;
      if (currentRound < activeGame.length) {
        showRound();
      } else {
        finishGame();
      }
    }, 650);
  }

  document.querySelectorAll("[data-complete]").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = button.getAttribute("data-complete");
      if (!state.completedLessons.includes(id)) {
        state.completedLessons.push(id);
        syncView();
      }
    });
  });

  document.querySelectorAll("[data-action]").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      const id = checkbox.getAttribute("data-action");
      if (checkbox.checked && !state.actions.includes(id)) {
        state.actions.push(id);
      }
      if (!checkbox.checked) {
        state.actions = state.actions.filter(function (action) { return action !== id; });
      }
      syncView();
    });
  });

  document.querySelectorAll(".prompt-chip").forEach(function (button) {
    button.addEventListener("click", function () {
      askQuestion(button.textContent);
    });
  });

  elements.chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    askQuestion(elements.chatInput.value);
    elements.chatInput.value = "";
  });

  elements.startGame.addEventListener("click", startGame);
  elements.binOptions.addEventListener("click", function (event) {
    const button = event.target.closest("[data-bin]");
    if (button) chooseBin(button.getAttribute("data-bin"));
  });

  elements.resetProgress.addEventListener("click", function () {
    window.clearTimeout(advanceTimer);
    state = createDefaultState();
    window.localStorage.removeItem(STORAGE_KEY);
    syncView();
    elements.chatMessages.innerHTML =
      '<div class="message bot">Hi! Ask me how to sort an everyday item, and I will suggest the safest disposal method.</div>';
    activeGame = [];
    score = 0;
    currentRound = 0;
    awaitingChoice = false;
    elements.gameScore.textContent = "0";
    elements.scoreFill.style.width = "0%";
    elements.roundLabel.textContent = "Ready to test your sorting skills?";
    elements.itemSymbol.textContent = "?";
    elements.itemName.textContent = "Press Start Game";
    elements.itemHint.textContent = "Select the correct bin for each item.";
    elements.gameFeedback.textContent = "";
    enableBins(false);
    elements.startGame.textContent = "Start Game";
  });

  syncView();
}());
