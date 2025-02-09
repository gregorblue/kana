document.querySelector('#header .brand').addEventListener('click', (e) => window.open('https://nfzxm.uk', '_self'));

const settingWrapper = document.querySelector('.settingsWrapper')
const charElem = document.querySelector('#symbol');
const inputElem = document.querySelector('.text');

function submitHandler() {
    if (currentChar) {
        if (currentChar.phonetic !== inputElem.value) {
            errorEntry(`Incorrect, the phonetic for "${currentChar.symbol}" is "${currentChar.phonetic}" not "${inputElem.value}"`);
        }
        chooseRandomChar();
    }
}

document.querySelector('.iconButton#enter').addEventListener('click', submitHandler);
inputElem.addEventListener('keyup', function(event) {if (event.keyCode === 13) submitHandler()});
document.querySelector('.iconButton#speak').addEventListener('click', function() {
    if (currentChar && currentChar.audio) {
        const audio = new Audio(`./assets/audio/${currentChar.type}/${currentChar.audio}`);
        audio.playbackRate = settings.playbackRate;
        audio.play();
    }
});
document.querySelector('.iconButton#skip').addEventListener('click', chooseRandomChar);
document.querySelector('.iconButton#settings').addEventListener('click', function() {
    settingWrapper.style.display = 'flex';
});

settingWrapper.addEventListener('click', function(e) {
    if (e.target.className.includes('settingsWrapper') || e.target.id === 'settingsClose') settingWrapper.style.display = 'none';
});

let settings = {
    hiragana: true,
    hiraganaCombinations: true,
    katakana: true,
    katakanaCombinations: true,
    playbackRate: 1.0
}

document.querySelector('.settings #hiragana').addEventListener('change', function(e) {
    e.preventDefault();
    settings.hiragana = !settings.hiragana;
    refreshSettings(true);
});
document.querySelector('.settings #hiraganaCombinations').addEventListener('change', function(e) {
    e.preventDefault();
    settings.hiraganaCombinations = !settings.hiraganaCombinations;
    refreshSettings(true);
});
document.querySelector('.settings #katakana').addEventListener('change', function(e) {
    e.preventDefault();
    settings.katakana = !settings.katakana;
    refreshSettings(true);
});
document.querySelector('.settings #katakanaCombinations').addEventListener('change', function(e) {
    e.preventDefault();
    settings.katakanaCombinations = !settings.katakanaCombinations;
    refreshSettings(true);
});

document.querySelector('.settings input#playbackRate').addEventListener('input', function(e) {
    e.preventDefault();
    settings.playbackRate = e.target.value;
    refreshSettings();
});

function refreshSettings(refreshChar) {
    document.querySelector('.settings #hiragana').checked = settings.hiragana;
    document.querySelector('.settings #hiraganaCombinations').checked = settings.hiraganaCombinations;
    document.querySelector('.settings #katakana').checked = settings.katakana;
    document.querySelector('.settings #katakanaCombinations').checked = settings.katakanaCombinations;
    
    document.querySelector('.settings a#playbackRate').innerText = settings.playbackRate;
    document.querySelector('.settings input#playbackRate').value = settings.playbackRate;

    if (refreshChar) {
        // Refresh list
        availableChars = generateCharset();
    
        // Set current char
        chooseRandomChar();
    }
}

let hiraganaCharset;
let katakanaCharset;

let availableChars;
let currentChar;

const errorLog = document.querySelector('.errorLog');
function errorEntry(text) {
    const elem = document.createElement('a');
    elem.innerText = text;
    errorLog.prepend(elem);
}

function generateCharset() {
    let ret = [];
    if (settings.hiragana || settings.hiraganaCombinations) {
        Object.entries(hiraganaCharset).forEach(([symbol, info]) => {
            if ((!info.combination && settings.hiragana) || (info.combination && settings.hiraganaCombinations)) {
                info.symbol = symbol;
                info.type = 'hiragana';
                ret.push(info);
            }
        });
    }
    if (settings.katakana || settings.katakanaCombinations) {
        Object.entries(katakanaCharset).forEach(([symbol, info]) => {
            if ((!info.combination && settings.katakana) || (info.combination && settings.katakanaCombinations)) {
                info.symbol = symbol;
                info.type = 'katakana';
                ret.push(info);
            }
        });
    }
    return ret;
}

function chooseRandomChar() {
    if (availableChars.length <= 0) availableChars = generateCharset();
    let index = Math.round(Math.random() * availableChars.length);
    if (index >= availableChars.length) index = availableChars.length - 1; // clamp
    if (index < 0) index = 0; // clamp
    const char = availableChars[index];
    if (char) {
        availableChars.splice(index, 1);
        currentChar = char;
        charElem.innerText = char.symbol;
    } else {
        currentChar = null;
        charElem.innerText = null;
    }
    inputElem.value = null;
}

async function init() {
    // Get charsets
    await fetch('./data/hiragana.json')
        .then((response) => response.json())
        .then((json) => hiraganaCharset = json);
    await fetch('./data/katakana.json')
        .then((response) => response.json())
        .then((json) => katakanaCharset = json);

    refreshSettings(true);
}

init();