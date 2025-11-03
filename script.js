const mainContent = document.getElementById('mainContent');
const searchContainer = document.getElementById('searchContainer');
const searchDisplay = document.getElementById('searchDisplay');
const typedText = document.getElementById('typedText');
const suggestionElement = document.getElementById('suggestion');
const suggestionListElement = document.getElementById('suggestionList');
const macroIndicator = document.getElementById('macroIndicator');

const macrosConfig = {
  reddit: "https://reddit.com/",
  yt: "https://youtube.com/",
  git: "https://github.com/",
  chatgpt: "https://chatgpt.com/",
  seedbox: "https://50.lw.itsby.design/qbittorrent/",
  arch: "https://wiki.archlinux.org/title/Main_page",
  roblox: "https://roblox.com",
  puppyfin: "https://puppyf.in",
  protondb: "https://www.protondb.com/",
  fitgirl: "https://fitgirl-repacks.site",
  kick: "https://kick.com",
  puppyseer: "http://50.lw.itsby.design:5570/",
  dodi: "https://dodi-repacks.site/",
  hyprland: "https://wiki.hyprland.org/",
  i3wm: "https://i3wm.org/docs/",
  fc: "https://constelia.ai/forums",
  roli: "https://rolimons.com",
  paypal: "https://paypal.com",
  catppuccin: "https://catppuccin.com",
  freecodecamp: "https://www.freecodecamp.org/learn",
  discordpyself: "https://discordpy-self.readthedocs.io"
};

let searchActive = false;
let typingQueue = [];
let processing = false;
let currentTimer = null;
let currentChar = null;
let timerActive = false; 
let titleInterval; 

let suggestionMatches = [];
let suggestionSelectedIndex = -1;

function animateTitle() {
  const titleText = "woof! <3";
  let i = 0;
  function typeNext() {
    if (i <= titleText.length) {
      document.title = titleText.slice(0, i);
      i++;
      setTimeout(typeNext, 100);
    }
  }
  typeNext();
}

function isURL(query) {
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
  return urlRegex.test(query);
}

function getMatchingMacros(query) {
  let matches = [];
  for (let key in macrosConfig) {
    if (key.toLowerCase().startsWith(query.toLowerCase())) {
      matches.push(key);
    }
  }
  return matches;
}

function getCommonPrefix(strings) {
  if (!strings.length) return "";
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }
  return prefix;
}

function updateSuggestion() {
  const query = typedText.textContent;
  if (!query) {
    suggestionElement.textContent = "";
    suggestionMatches = [];
    suggestionSelectedIndex = -1;
    updateSuggestionList([]);
    return;
  }
  suggestionMatches = getMatchingMacros(query);
  updateSuggestionList(suggestionMatches);
  if (suggestionMatches.length === 0) {
    suggestionElement.textContent = "";
  } else if (suggestionMatches.length === 1) {
    let full = suggestionMatches[0];
    if (full.toLowerCase() === query.toLowerCase()) {
      suggestionElement.textContent = "";
    } else if (full.length > query.length) {
      suggestionElement.innerHTML = `<span class="suggestion-dim">${full.slice(query.length)}</span>`;
    }
  } else {
    let common = getCommonPrefix(suggestionMatches);
    if (common.length > query.length) {
      suggestionElement.innerHTML = `<span class="suggestion-dim">${common.slice(query.length)}</span>`;
    } else {
      suggestionElement.textContent = "";
    }
  }
}

function updateSuggestionList(matches) {
  suggestionListElement.innerHTML = "";
  if (matches.length <= 1) {
    suggestionSelectedIndex = -1;
    return;
  }
  matches.forEach((item, index) => {
    const div = document.createElement('div');
    div.textContent = item;
    div.classList.add('suggestion-item');
    if (index === suggestionSelectedIndex) {
      div.classList.add('selected');
    }
    suggestionListElement.appendChild(div);
  });
}

function updateMacroIndicator() {
  const query = typedText.textContent.trim();
  if (query.startsWith("r/")) {
    macroIndicator.textContent = "reddit search";
  } else if (query.startsWith("yt/")) {
    macroIndicator.textContent = "youtube search";
  } else if (query.startsWith("arch/")) {
    macroIndicator.textContent = "arch wiki search";
  } else {
    macroIndicator.textContent = macrosConfig.hasOwnProperty(query)
      ? macrosConfig[query]
      : "";
  }
  updateSuggestion();
}

function keydownHandler(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    exitSearch();
    return;
  }
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (suggestionMatches.length > 1) {
      suggestionSelectedIndex = (suggestionSelectedIndex + 1) % suggestionMatches.length;
      updateSuggestionList(suggestionMatches);
    }
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (suggestionMatches.length > 1) {
      suggestionSelectedIndex = (suggestionSelectedIndex - 1 + suggestionMatches.length) % suggestionMatches.length;
      updateSuggestionList(suggestionMatches);
    }
    return;
  }
  
  if (e.key === 'Tab') {
    e.preventDefault();
    if (suggestionMatches.length > 0) {
      let fillValue = "";
      if (suggestionSelectedIndex !== -1 && suggestionMatches[suggestionSelectedIndex]) {
        fillValue = suggestionMatches[suggestionSelectedIndex];
      } else {
        const common = getCommonPrefix(suggestionMatches);
        fillValue = common.length > typedText.textContent.length ? common : suggestionMatches[0];
      }
      typedText.textContent = fillValue;
      typedText.innerHTML = "";
      for (let char of fillValue) {
        let span = document.createElement('span');
        span.classList.add('char');
        span.textContent = char;
        span.style.color = "#C5C8C6";
        typedText.appendChild(span);
      }
      suggestionElement.textContent = "";
      suggestionMatches = [];
      suggestionSelectedIndex = -1;
      updateMacroIndicator();
    }
    return;
  }
  
  if (timerActive) {
    e.preventDefault();
    return;
  }
  
  const isPrintable = e.key.length === 1;
  
  if (!searchActive && isPrintable && !e.ctrlKey && !e.altKey && !e.metaKey) {
    searchActive = true;
    mainContent.style.display = 'none';
    searchContainer.style.display = 'flex';
    typedText.innerHTML = "";
    typedText.style.display = "inline-block";
    typedText.style.color = "#C5C8C6";
    typedText.style.opacity = "1";
    typedText.style.visibility = "visible";
  }
  
  if (e.key === 'Enter') {
    e.preventDefault();
    if (suggestionMatches.length > 1 && suggestionSelectedIndex !== -1) {
      const selected = suggestionMatches[suggestionSelectedIndex];
      typedText.textContent = selected;
      typedText.innerHTML = "";
      for (let char of selected) {
        let span = document.createElement('span');
        span.classList.add('char');
        span.textContent = char;
        span.style.color = "#C5C8C6";
        typedText.appendChild(span);
      }
      suggestionElement.textContent = "";
      suggestionMatches = [];
      suggestionSelectedIndex = -1;
      updateMacroIndicator();
      return;
    }
    flushQueue();
    runSearch();
    return;
  }
  
  if (isPrintable && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    typingQueue.push(e.key);
    processQueue();
  } else if (e.key === 'Backspace') {
    if (!processing) {
      const spans = typedText.querySelectorAll('.char');
      if (spans.length > 0) {
        typedText.removeChild(spans[spans.length - 1]);
        updateMacroIndicator();
      } else {
        exitSearch();
      }
    }
  }
}

function processQueue() {
  if (processing || typingQueue.length === 0) return;
  processing = true;
  const char = typingQueue.shift();
  currentChar = char;
  const delay = char === ' ' ? 30 : Math.floor(Math.random() * 50) + 50;
  currentTimer = setTimeout(() => {
    const span = document.createElement('span');
    span.classList.add('char');
    span.textContent = char;
    span.style.color = "#C5C8C6";
    typedText.appendChild(span);
    updateMacroIndicator();
    processing = false;
    currentTimer = null;
    currentChar = null;
    processQueue();
  }, delay);
}

function flushQueue() {
  if (currentTimer !== null) {
    clearTimeout(currentTimer);
    if (currentChar !== null) {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = currentChar;
      span.style.opacity = 1;
      span.style.transform = 'translateY(0)';
      span.style.color = "#C5C8C6";
      typedText.appendChild(span);
    }
    currentTimer = null;
    currentChar = null;
  }
  processing = false;
  while (typingQueue.length > 0) {
    const char = typingQueue.shift();
    const span = document.createElement('span');
    span.classList.add('char');
    span.textContent = char;
    span.style.opacity = 1;
    span.style.transform = 'translateY(0)';
    span.style.color = "#C5C8C6";
    typedText.appendChild(span);
  }
  updateMacroIndicator();
}

function runTimerCommand(query) {
  const regex = /^(\d+)\s*(sec(?:ond)?|min(?:ute)?|hr(?:our)?)s?\s+timer$/i;
  const match = query.match(regex);
  if (!match) return false;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  let ms = 0;
  if (unit.startsWith("min")) {
    ms = num * 60 * 1000;
  } else if (unit.startsWith("sec")) {
    ms = num * 1000;
  } else if (unit.startsWith("hr")) {
    ms = num * 60 * 60 * 1000;
  }
  
  timerActive = true;
  clearInterval(titleInterval);
  
  typedText.innerHTML = "";
  macroIndicator.textContent = `timer set for ${num} ${unit}`;
  
  const endTime = Date.now() + ms;
  const countdownInterval = setInterval(() => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      document.getElementById('searchDisplay').textContent = "time's up!";
      document.title = "time's up! - woof! <3";
      alert("time's up!");
      timerActive = false;
      typedText.innerHTML = "";
      macroIndicator.textContent = "";
      document.title = "woof! <3";
      animateTitle();
    } else {
      const formatted = formatTime(remaining);
      document.getElementById('searchDisplay').textContent = formatted;
      document.title = formatted + " - woof! <3";
    }
  }, 1000);
  return true;
}

function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let seconds = totalSeconds % 60;
  let minutes = Math.floor(totalSeconds / 60) % 60;
  let hours = Math.floor(totalSeconds / 3600);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

function runSearch() {
  const query = typedText.textContent.trim();
  if (query.length === 0) return;
  
  if (isURL(query)) {
    let url = query;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    window.location.href = url;
    return;
  }
  
  if (runTimerCommand(query)) {
    return;
  }
  
  if (query.startsWith("r/")) {
    const rest = query.substring(2);
    if (rest.includes(":")) {
      const colonIndex = rest.indexOf(":");
      const subreddit = rest.substring(0, colonIndex).trim();
      const terms = rest.substring(colonIndex + 1).trim();
      const encoded = encodeURIComponent(terms);
      const url = `https://www.reddit.com/r/${subreddit}/search?q=${encoded}&restrict_sr=1`;
      window.location.href = url;
      return;
    } else {
      const subreddit = rest.trim();
      const url = `https://www.reddit.com/r/${subreddit}`;
      window.location.href = url;
      return;
    }
  } else if (query.startsWith("yt/")) {
    const searchQuery = query.substring(3).trim();
    const encoded = encodeURIComponent(searchQuery);
    const url = `https://www.youtube.com/results?search_query=${encoded}`;
    window.location.href = url;
    return;
  } else if (query.startsWith("arch/")) {
    const searchQuery = query.substring(5).trim();
    const encoded = encodeURIComponent(searchQuery);
    const url = `https://wiki.archlinux.org/index.php?search=${encoded}`;
    window.location.href = url;
    return;
  } else {
    if (macrosConfig.hasOwnProperty(query)) {
      window.location.href = macrosConfig[query];
      return;
    }
    const encoded = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encoded}`;
    window.location.href = url;
    return;
  }
}

function exitSearch() {
  if (document.getElementById('searchDisplay').textContent.trim() === "time's up!") {
    timerActive = false;
  }
  searchActive = false;
  timerActive = false;
  searchContainer.style.display = 'none';
  mainContent.style.display = 'flex';
  typedText.innerHTML = "";
  suggestionElement.innerHTML = "";
  macroIndicator.textContent = "";
  typingQueue = [];
  document.title = "woof! <3";
}

window.addEventListener("load", () => {
  animateTitle();
  setTimeout(() => {
    document.addEventListener('keydown', keydownHandler);
  }, 50);
});

