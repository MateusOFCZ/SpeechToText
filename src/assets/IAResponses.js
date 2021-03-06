var moment = require('moment-timezone');
var axios = require('axios');
const UserData = { Coords: null, Weather: null, Time: null }

async function MoneyData(from, to = 'BRL') {
    return await axios({
        method: 'get',
        url: `https://economia.awesomeapi.com.br/json/last/${from}-${to}`,
    }).then(function (response) {
        return response.data[`${from}${to}`].ask;
    });
}

async function Weather() {
    UserData.Weather = await axios({
        method: 'get',
        url: `https://weather.contrateumdev.com.br/api/weather?lat=${UserData.Coords.latitude}&lon=${UserData.Coords.longitude}`,
    }).then(function (response) {
        return response.data;
    });
}

async function SaveGeolocation(position) {
    UserData.Coords = await position.coords;
    Weather();
}

navigator.geolocation.getCurrentPosition(SaveGeolocation);

async function GetCurrentTime() {
    let Hour = await moment().tz("America/Sao_Paulo").format('HH');
    console.log(Hour);
    if ([19, 20, 21, 22, 23, 0, 1, 2, 3].includes(parseInt(Hour))) {
        return { prefix: `uma`, time: `boa noite` };
    } else if ([12, 13, 14, 15, 16, 17, 18].includes(parseInt(Hour))) {
        return { prefix: `uma`, time: `boa tarde` };
    } else {
        return { prefix: `um`, time: `bom dia` };
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function IAData() {
    const Data = [
        {
            trigger: [`OI`, `OLA`, `BOM DIA`, `BOA TARDE`],
            response: [`Oi!`, `Olá!`, `${capitalizeFirstLetter((await GetCurrentTime()).time)}!`]
        },
        {
            trigger: [`COMO VAI`, `TUDO BEM`, `COMO VOCE ESTA`, `COMO VOCE TA`],
            response: [`Estou bem e você?`, `Estou bem, obrigado, e você?`]
        },
        {
            trigger: [`QUE HORAS SAO`, `ME DIGA A HORA`],
            response: [`Agora são ${moment().tz("America/Sao_Paulo").format('HH:mm')}.`]
        },
        {
            trigger: [`QUE DIA E HOJE`, `ESTAMOS EM QUE DIA`, `EM QUE DIA ESTAMOS`],
            response: [`Hoje é ${moment().tz("America/Sao_Paulo").format('DD/MM/yyyy')}.`]
        },
        {
            trigger: [`COTACAO DO DOLAR`, `QUANTO ESTA O DOLAR`, `QUANTO TA O DOLAR`],
            response: [`O dólar está ${await MoneyData('USD')}`]
        },
        {
            trigger: [`COTACAO DO EURO`, `QUANTO ESTA O EURO`, `QUANTO TA O EURO`],
            response: [`O euro está ${await MoneyData('EUR')}`]
        },
        {
            trigger: [`PREVISAO DO TEMPO PARA HOJE`, `PREVISAO DO TEMPO DE HOJE`, `PREVISAO DO TEMPO HOJE`],
            response: [`A previsão do tempo para hoje em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus e ${await UserData.Weather.weather[0].description}, com mínima de ${await UserData.Weather.main.temp_min} graus e máxima de ${await UserData.Weather.main.temp_max} graus. Tenha ${(await GetCurrentTime()).prefix} ${(await GetCurrentTime()).time}.`, `A previsão do tempo para hoje em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus e ${await UserData.Weather.weather[0].description}, com mínima de ${await UserData.Weather.main.temp_min} graus e máxima de ${await UserData.Weather.main.temp_max} graus.`]
        },
        {
            trigger: [`SENSACAO TERMICA PARA HOJE`, `SENSACAO TERMICA DE HOJE`, `SENSACAO TERMICA HOJE`],
            response: [`A temperatura em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus com sensação térmica de ${await UserData.Weather.main.feels_like} graus. Tenha ${(await GetCurrentTime()).prefix} ${(await GetCurrentTime()).time}.`, `A temperatura em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus com sensação térmica de ${await UserData.Weather.main.feels_like} graus.`]
        },
        {
            trigger: [`TCHAU`, `ATE MAIS`, `BOA NOITE`],
            response: [`Até mais!`, `Tchau!`]
        },
    ]

    return Data;
}

exports.IAResponses = IAData;

async function IAResponses(text) {
    const Data = await IAData();
    let ResponseMessage = [];

    await Data.map(ResponseData => {
        ResponseData.trigger.map(Trigger => {
            text = text.toUpperCase();
            text = text.replace(new RegExp('[ÁÀÂÃ]', 'gmi'), 'A');
            text = text.replace(new RegExp('[ÉÈÊ]', 'gmi'), 'E');
            text = text.replace(new RegExp('[ÍÌÎ]', 'gmi'), 'I');
            text = text.replace(new RegExp('[ÓÒÔÕ]', 'gmi'), 'O');
            text = text.replace(new RegExp('[ÚÙÛ]', 'gmi'), 'U');
            text = text.replace(new RegExp('[Ç]', 'gmi'), 'C');

            Trigger = new RegExp(`\\b${Trigger}\\b`, 'gmi');

            if (Trigger.test(text)) {
                const Response = Math.floor(Math.random() * ResponseData.response.length);
                ResponseMessage = [{ message: ResponseData.response[Response], author: 'system' }, ...ResponseMessage];
            }
        })
    });

    return ResponseMessage;
}

exports.IAResponses = IAResponses;