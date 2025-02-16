const mainContent = document.getElementById('mainContent');
const searchContainer = document.getElementById('searchContainer');
const typedText = document.getElementById('typedText');
const macroIndicator = document.getElementById('macroIndicator');

const macrosConfig = {
  reddit: "https://reddit.com/",
  maps: "https://maps.google.com/",
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
  hyprland: "https://wiki.hyprland.org/"
};

let searchActive = false;
let typingQueue = [];
let processing = false;
let currentTimer = null;
let currentChar = null;

// keydown handler :3
function keydownHandler(e) {
  const isPrintable = e.key.length === 1;
  
  if (!searchActive && isPrintable && !e.ctrlKey && !e.altKey && !e.metaKey) {
    searchActive = true;
    mainContent.style.display = 'none';
    searchContainer.style.display = 'flex';
  }
  
  if (e.key === 'Escape') {
    e.preventDefault();
    exitSearch();
    return;
  }
  
  if (e.key === 'Enter') {
    e.preventDefault();
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
    typedText.appendChild(span);
  }
  updateMacroIndicator();
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
}

function runSearch() {
  const query = typedText.textContent.trim();
  if (query.length === 0) return;
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
  searchActive = false;
  searchContainer.style.display = 'none';
  mainContent.style.display = 'flex';
  while (typedText.firstChild) {
    typedText.removeChild(typedText.firstChild);
  }
  macroIndicator.textContent = "";
  typingQueue = [];
}

function animateTitle(string) {
  document.querySelector('title').innerHTML = "";
  recursiveAnimateTitle(string);
}

function recursiveAnimateTitle(string) {
  if (!string.length) return; // done!
  let title = document.querySelector('title');
  title.innerHTML += string[0];
  setTimeout(() => {
    recursiveAnimateTitle(string.substring(1));
  }, 100);
}

animateTitle("woof! <3");

// add keydown listener after load :3
window.addEventListener("load", () => {
  setTimeout(() => {
    document.addEventListener('keydown', keydownHandler);
  }, 500);
});
