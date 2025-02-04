document.querySelector('#header .brand').addEventListener('click', (e) => window.open('https://nfzxm.uk', '_self'));

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
        audio.play();
    }
});
document.querySelector('.iconButton#skip').addEventListener('click', chooseRandomChar);


let settings = {
    hiragana: true,
    hiraganaCombinations: true,
    katakana: true,
    katakanaCombinations: true
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
    if (settings.hiragana) {
        Object.entries(hiraganaCharset).forEach(([symbol, info]) => {
            if (!info.combination || settings.hiraganaCombinations) {
                info.symbol = symbol;
                info.type = 'hiragana';
                ret.push(info);
            }
        });
    }
    if (settings.katakana) {
        Object.entries(katakanaCharset).forEach(([symbol, info]) => {
            if (!info.combination || settings.katakanaCombinations) {
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
        inputElem.value = null;
    }
}

async function init() {
    // Get charsets
    await fetch('./data/hiragana.json')
        .then((response) => response.json())
        .then((json) => hiraganaCharset = json);
    await fetch('./data/katakana.json')
        .then((response) => response.json())
        .then((json) => katakanaCharset = json);

    // Refresh list
    availableChars = generateCharset();

    // Set current char
    chooseRandomChar();
}

init();