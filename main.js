document.querySelector('#header .brand').addEventListener('click', (e) => window.open('https://nfzxm.uk', '_self'));

const settingWrapper = document.querySelector('.settingsWrapper')
const charElem = document.querySelector('#symbol');
let optionElems;
let inputElem;

function submitHandler(input) {
    if (currentChar) {
        input = input || inputElem.value
        if (input !== '') {
            if (currentChar.phonetic !== input) {
                errorEntry(`Incorrect, the phonetic for "${currentChar.symbol}" is "${currentChar.phonetic}" not "${input}"`);
            }
            chooseRandomChar();
        } else {
            errorEntry('Invalid input');
        }
    }
}

document.querySelector('.iconButton#enter').addEventListener('click', () => {submitHandler()});
document.querySelector('.iconButton#speak').addEventListener('click', function() {
    if (currentChar && currentChar.audio) {
        const audio = new Audio(`./assets/audio/${currentChar.type}/${currentChar.audio}`);
        audio.playbackRate = settings.playbackRate;
        audio.play();
    }
});
document.querySelector('.iconButton#skip').addEventListener('click', chooseRandomChar);
document.querySelector('.iconButton#settings').addEventListener('click', function() {
    settingWrapper.style.visibility = 'visible';
});

settingWrapper.addEventListener('click', function(e) {
    if (e.target.className.includes('settingsWrapper') || e.target.id === 'settingsClose') settingWrapper.style.visibility = 'hidden';
});

let settings = {
    hiragana: true,
    hiraganaCombinations: true,
    katakana: true,
    katakanaCombinations: true,
    playbackRate: 1.0,
    input: 'select'
}

document.querySelector('.settings #hiragana').addEventListener('change', function(e) {
    e.preventDefault();
    settings.hiragana = !settings.hiragana;
    availableChars = generateCharset();
    if (!currentChar || (!settings.hiragana && currentChar.type === 'hiragana' && !currentChar.combination)) chooseRandomChar();
    refreshSettings();
});
document.querySelector('.settings #hiraganaCombinations').addEventListener('change', function(e) {
    e.preventDefault();
    settings.hiraganaCombinations = !settings.hiraganaCombinations;
    availableChars = generateCharset();
    if (!currentChar || (!settings.hiraganaCombinations && currentChar.type === 'hiragana' && currentChar.combination)) chooseRandomChar();
    refreshSettings();
});
document.querySelector('.settings #katakana').addEventListener('change', function(e) {
    e.preventDefault();
    settings.katakana = !settings.katakana;
    availableChars = generateCharset();
    if (!currentChar || (!settings.katakana && currentChar.type === 'katakana' && !currentChar.combination)) chooseRandomChar();
    refreshSettings();
});
document.querySelector('.settings #katakanaCombinations').addEventListener('change', function(e) {
    e.preventDefault();
    settings.katakanaCombinations = !settings.katakanaCombinations;
    availableChars = generateCharset();
    if (!currentChar || (!settings.katakanaCombinations && currentChar.type === 'katakana' && currentChar.combination)) chooseRandomChar();
    refreshSettings();
});

document.querySelector('.settings input#playbackRate').addEventListener('input', function(e) {
    e.preventDefault();
    settings.playbackRate = e.target.value;
    refreshSettings();
});

document.querySelector('.settings select#input').addEventListener('change', function(e) {
    e.preventDefault();
    settings.input = e.target.value;
    refreshSettings();
});

function refreshSettings() {
    document.querySelector('.settings #hiragana').checked = settings.hiragana;
    document.querySelector('.settings #hiraganaCombinations').checked = settings.hiraganaCombinations;
    document.querySelector('.settings #katakana').checked = settings.katakana;
    document.querySelector('.settings #katakanaCombinations').checked = settings.katakanaCombinations;
    
    document.querySelector('.settings a#playbackRate').innerText = settings.playbackRate;
    document.querySelector('.settings input#playbackRate').value = settings.playbackRate;

    if (settings.input === 'select') {
        inputElem = null;
        if (!optionElems) {
            const inputWrapper = document.querySelector('.input')
            inputWrapper.innerHTML = '';

            if (!currentCharOptions) currentCharOptions = generateOptions();

            const optionsWrapper = document.createElement('div');
                optionElems = [];
                for (let i = 0; i < 4; i++) {
                    optionElems[i] = document.createElement('div');
                    optionElems[i].className = 'option';
                    if (currentCharOptions?.[i]) optionElems[i].innerText = currentCharOptions[i].phonetic;
                    optionElems[i].addEventListener('click', function(e) {
                        if (currentCharOptions?.[i]) submitHandler(currentCharOptions[i]?.phonetic);
                    });
                    optionsWrapper.appendChild(optionElems[i]);
                }
            optionsWrapper.className = 'options';
            inputWrapper.appendChild(optionsWrapper);
        }
        document.querySelector('.iconButton#enter').style.display = 'none';
    } else {
        optionElems = null;
        if (!inputElem) {
            const inputWrapper = document.querySelector('.input');
            inputElem = document.createElement('input');
            inputElem.className = 'text';
            inputElem.placeholder = 'Phonetic';
            inputWrapper.innerHTML = '';
            inputWrapper.appendChild(inputElem);
            inputElem.addEventListener('keyup', function(event) {if (event.keyCode === 13) submitHandler()});
        }
        document.querySelector('.iconButton#enter').style.display = 'flex';
    }
}

let hiraganaCharset;
let katakanaCharset;

let availableChars;
let currentChar;
let currentCharOptions;

const errorLog = document.querySelector('.errorLog');
function errorEntry(text) {
    const elem = document.createElement('a');
    elem.innerText = text;
    errorLog.prepend(elem);
}

function generateOptions(count) { // possibly rework to grab from around correct index for options that start the same to slighty increase difficulty
    let options;
    if (currentChar) {
        if (!count || typeof count != "number") count = 4;
        let possibleChars = generateCharset();
        possibleChars.splice(possibleChars.indexOf(currentChar), 1);
        if (count > possibleChars.length) count = possibleChars.length;
        const correctIndex = Math.floor(Math.random() * 4);
        options = [];
        for (let i = 0; i < count; i++) {
            if (i === correctIndex) {
                options.push(currentChar);
            } else {
                let index = Math.round(Math.random() * possibleChars.length);
                if (index >= possibleChars.length) index = possibleChars.length - 1; // clamp
                if (index < 0) index = 0; // clamp
                options.push(possibleChars[index])
                possibleChars.splice(index, 1);
            }
        }
    }
    return options
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
        currentCharOptions = null;
        charElem.innerText = null;
    }
    if (settings.input === 'select') {
        currentCharOptions = generateOptions();
        if (currentCharOptions && optionElems) {
            let count = 0;
            currentCharOptions.forEach(option => {
                if (optionElems[count]) optionElems[count].innerText = option.phonetic;
                count += 1;
            })
        }
    } else {
        inputElem.value = null;
        currentCharOptions = null;
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

    refreshSettings();
    
    // Refresh list
    availableChars = generateCharset();
    
    // Set current char
    chooseRandomChar();
}

init();