/**
 * @description  Uproszczenie kopiowania zamówień do excela ze strony SOTESHOP - bubblejoy
 * @author       Piotr Rogalski
 * @created_at   2020-04-29
 * @email        piotr5rogalski@gmail.com
 */
const copyToClipboardByMe = id => {
    const el = document.getElementById(id);el.select();
    document.execCommand('copy');
};

function toShow(text, exclude = '')
{
    let tab = '\t',
        result = '';

    if(typeof text === 'undefined' || text === exclude) {
        result = tab;
    } else {
        result = text + tab;
    }

    return result;
}

function orderByExist(a, b, noExistWord = 'brak')
{
    if (a === noExistWord && b !== noExistWord)
        return 1
    if (a !== noExistWord && b === noExistWord)
        return -1
    return 0
}

function showThatError(message)
{
    let errorEl = document.getElementById('showThatErrorId');
    if(errorEl) {
        errorEl.innerText = message;
        errorEl.classList.remove('hideThatError');
    }
}

function hideThatError()
{
    let errorEl = document.getElementById('showThatErrorId');
    if(errorEl) {
        errorEl.classList.add('hideThatError');
        errorEl.innerText = '';
    }
}

function getElementByNameTest(orderError) {
    let names = [
        'clientData',
        'orderEl',
        'commentEl',
        'recipientData',
        'recipientAddressData',
        'recipientFullName',
        'orderAddress',
        'recipientPhone',
        'products',
        'containerElement',
        'buttonsElement',
    ];

    let error = '';
    let isInvalid = names.some(function (name) {
        if (getElByName(name) === null) {
            error += `${name}\n`;
            return true;
        }
        return false;
    });

    if (isInvalid) {
        throw new Error('Nie przechodzi testu inicjalizacji, Nie mozna znalezc elementu: ' + error);
    }
}

/**
 *
 * @param name {string}
 * @returns {HTMLElement|string}
 */
function getElByName(name) {
    let element = '';
    let HTMLCollection;
    switch (name)
    {
        case 'clientData':
            element = document.querySelector('.row_user_info');
            break;
        case 'orderEl':
            element = document.querySelector('div.header h2.float_left i');
            break;
        case 'commentEl':
            element = document.querySelector('#sf_fieldset_informacje_dodatkowe_slide .clr');
            break;
        case 'recipientData':
            element = getElByName('clientData').children[1];
            break;
        case 'recipientAddressData':
            HTMLCollection = getElByName('recipientData').children[1].children;
            element = toArray(HTMLCollection);
            break;
        case 'recipientFullName':
            element = getElByName('recipientAddressData')[0].innerText;
            break;
        case 'orderAddress':
            element = getElByName('recipientAddressData')[1]
                .innerText
                .replace(getPatternByName('addressReplace'),' ');
            break;
        case 'recipientPhone':
            element = getElByName('recipientAddressData')[2].innerText;
            break;
        case 'products':
            HTMLCollection = document.querySelector('#st_order-product-list tbody').children;
            element = toArray(HTMLCollection);
            break;
        case 'containerElement':
            element = document.getElementById('container');
            break;
        case 'buttonsElement':
            element = document.createElement('span');
            break;
    }

    return element;
}

function toArray(object) {
    let result = [];
    Object.keys(object).forEach(key => result[key] = object[key]);
    return result;
}

/**
 *
 * @param name
 * @returns {RegExp}
 */
function getPatternByName(name) {
    let pattern = /thisIsImposibleCombination32/;
    switch(name) {
        case 'driverComment':
            pattern = /(\bgodzin.{1,4}\b|dzwoni|\bkod|\bhas[lł]|\bodbi[oe]r|zostawi|napis[a-zć]{1,2}\b|\bsms|\btelefon|kontakt\b|kontaktowa[cć])/i;
            break;
        case 'addressReplace':
            pattern = /(\r\n|\n|\r|\t|Polska)/ig;
            break;
        case 'mixType':
            pattern = /(?<=MIX)\b.{3,12}\b/i;
            break;
        case 'noSugar':
            pattern = /(brak|bez)/i;
            break;
    }

    return pattern;
}

/**
 *
 * @param productParts
 * @returns {object}
 */
function getParts(productParts) {
    let parts = {};
    let str, end, start, result, partKey;

    productParts.forEach(function (part) {
        str = part.innerText;
        end = str.length;
        start = str.indexOf(':');
        result = str.slice(start + 2, end);
        partKey = str.slice(0, start);
        parts[partKey] = result;
    });
    return parts;
}

function checkTapiocaError(parts, nameCell) {
    let error = '';
    if (parts['Tapioka'] !== 'Z tapioką' && parts['Ekstra tapioka'] !== 'Nie') {
        productName = nameCell.children[0].innerText;
        error = `Uwaga! ${productName} jest "bez tapioki" ale zawiera "ekstra tapiokę" - błąd logiczny!<br>`;
    }
    return error;
}

function getTapiocaMessage(parts) {
    let tapioca;
    if (parts['Tapioka'] === 'Z tapioką') {
        tapioca = 'tak'
    } else {
        tapioca = 'NIE'
    }
    return tapioca;
}

function getTemperatureMessage(parts) {
    let temperature;
    if (parts['Temperatura napoju'] === 'Zimna herbatka') {
        temperature = ''
    } else {
        temperature = 'CIEPŁE'
    }
    return temperature;
}

function getSizeMessage(parts) {
    let size;
    if (parts['Rozmiar'] === 'Średni (0,7l)') {
        size = 'srednie'
    } else {
        size = 'male'
    }
    return size;
}

function getQuantityMessage(product) {
    let orderQuantity = product.children[10].innerText;

    return getRegMatch(/[\d]/, orderQuantity, 0);
}

function getCommentMessage(parts, additions) {
    let comments = '';
    if (parts['Cukier'] !== 'Standard') {
        if(getPatternByName('noSugar').test(parts['Cukier'])) {
            comments += 'Bez cukru, ';
        } else {
            comments += parts['Cukier'] + ', ';
        }
    }

    for (let i = 3; i <= 5; i++) {
        if (additions[i] !== 'brak') {
            comments += additions[i] + ', ';
        }
    }
    return comments;
}

function getRecipientText(order) {
    let o = {};
    o.id = toShow(order.id);
    o.fullName = toShow(order.recipient.fullName);
    o.phone = toShow(order.recipient.phone);
    o.address = toShow(order.recipient.address);

    return o.id + o.fullName + o.phone + o.address;
}

function getProductText(order) {
    let productsTextToCopy = '';
    const productKeys = Object.keys(order.products);
    productKeys.forEach(function (key) {
        let product = order.products[key];
        let p = {};
        let emptyColumn = '\t';
        p.quantity = toShow(product.quantity);
        p.size = toShow(product.size);
        p.ingredient_1 = toShow(product.ingredient_1);
        p.ingredient_2 = toShow(product.ingredient_2);
        p.temperature = toShow(product.temperature);
        p.tapioca = toShow(product.tapioca);
        p.additions_0 = toShow(product.additions_0, 'brak');
        p.additions_1 = toShow(product.additions_1, 'brak');
        p.additions_2 = toShow(product.additions_2, 'brak');
        p.comments = toShow(product.comments);

        let productToCopy = p.quantity + p.size + p.ingredient_1 + p.ingredient_2 + p.temperature + p.tapioca +
            emptyColumn + p.additions_0 + emptyColumn + p.additions_1 + emptyColumn + p.additions_2 + p.comments;

        productsTextToCopy += productToCopy + '\n';
    });
    return productsTextToCopy;
}

function showUserInterface(order, orderError, products) {
    if(orderError !== '') {
        showThatError(orderError);
    } else {
        hideThatError();
    }

    let recipientTextToCopy = getRecipientText(order);
    let productsTextToCopy = getProductText(order);
    let containerElement = getElByName('containerElement');
    let buttonsElement = getElByName('buttonsElement');
    buttonsElement.innerHTML = `
            <div style="width:100%">
                <span>
                    <button id="stickySzpanerBanner" style="margin-bottom: 10px" onclick="copyToClipboardByMe('recipientDataToCopy')">Kopiuj odbiorcę</button>
                </span>
                <span>
                    <button id="stickySzpanerBanner" style="margin-bottom: 10px" onclick="copyToClipboardByMe('productDataToCopy')">Kopiuj ${products.length} prod.</button>
                </span>
                <span style="float:right">Created by: Piotr Rogalski</span>
            </div>
            <span id="showThatErrorId" style="width: 100%; color: red; font-weight: bold;">${orderError}</span>
            <span>
                <textarea id="recipientDataToCopy" rows="1" style="width: 100%;">${recipientTextToCopy}</textarea>
                <textarea id="productDataToCopy" rows="${products.length}" style="width: 100%">${productsTextToCopy}</textarea>
            </span>`;
    containerElement.insertBefore(buttonsElement, containerElement.firstChild);
}

function getRegMatch(pattern, value, defaultValue = '') {
    let matches = value.match(pattern);
    let result = '';

    if (matches) {
        result = matches[0];
    } else {
        result = defaultValue;
    }

    return result;
}

function getMixName(fullName) {
    return getRegMatch(getPatternByName('mixType'), fullName, '').trim();
}

function getIngredientMessage(number, nameCell, parts, orderError) {
    const orderName = nameCell.children[0].innerText;
    const mixName = getMixName(orderName);
    let ingredient = '';

    if (mixName) {
        let key = `MIX ${mixName} - ${number} smak`;
        ingredient = parts[key];
        if (ingredient) {
            ingredient.toLowerCase()
        } else {
            orderError.message += `Nie można pobrać smaku dla klucza: ${key} wprowadź go ręcznie<br>`;
            ingredient = 'Błąd!';
        }
    }

    return ingredient;
}

function getAdditionsMessage(parts) {
    let tapiocaNum = getRegMatch(/[\d]/, parts['Ekstra tapioka']) * 1;
    if (tapiocaNum && tapiocaNum > 1) {
        tapiocaNum = ' x' + tapiocaNum;
    } else if (tapiocaNum === 1) {
        tapiocaNum = '';
    }

    let additions = [
        'tapioka' + tapiocaNum,
        parts['Dodatek nr1'],
        parts['Dodatek nr2'],
        parts['Dodatek nr3'],
        parts['Dodatek nr4'],
        parts['Dodatek nr5'],
    ];

    if (parts['Ekstra tapioka'] === 'Nie') {
        additions.shift();
    }

    additions.forEach(function (addition, key) {
        additions[key] = addition.toLowerCase()
            .replace(/popping/ig, 'pop.')
            .replace(/galaretka/ig, 'gal.');
    });

    additions.sort(orderByExist);
    return additions;
}

function getOrderIdMessage() {
    let orderEl = getElByName('orderEl');
    let orderId = '';

    if (orderEl) {
        orderId = 'S' + orderEl.innerText;
    }
    return orderId;
}

function init()
{
    let orderError = {
        message: ''
    };

    getElementByNameTest(orderError)


    let clientComment = '';
    let driverComment = '';
    let commentEl = getElByName('commentEl');
    if(commentEl) {
        clientComment = commentEl.innerText;
        if(getPatternByName('driverComment').test(clientComment)) {
            driverComment = clientComment.replace(getPatternByName('addressReplace'), ' ');
        }
    }

    let orderAddress = getElByName('orderAddress');

    orderAddress += driverComment;

    let order = {
        id: getOrderIdMessage(),
        comments: clientComment,
        recipient: {
            fullName: getElByName('recipientFullName'),
            address: orderAddress,
            phone: getElByName('recipientPhone'),
        },
        products: {}
    };

    let products = getElByName('products');
    products.forEach(function (product, key) {
        let nameCell = product.children[3];
        let productParts = toArray(nameCell.children[1].children);
        let parts = getParts(productParts);
        let additions = getAdditionsMessage(parts);

        orderError.message += checkTapiocaError(parts, nameCell);

        order.products[key] = {
            quantity:       getQuantityMessage(product),
            ingredient_1:   getIngredientMessage(1, nameCell, parts, orderError),
            ingredient_2:   getIngredientMessage(2, nameCell, parts, orderError),
            size:           getSizeMessage(parts),
            temperature:    getTemperatureMessage(parts),
            tapioca:        getTapiocaMessage(parts),
            additions_0:    additions[0],
            additions_1:    additions[1],
            additions_2:    additions[2],
            comments:       getCommentMessage(parts, additions),
        }
    });

    showUserInterface(order, orderError.message, products);
}
init();

