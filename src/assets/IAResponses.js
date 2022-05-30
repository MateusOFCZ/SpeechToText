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

    if (Hour >= 18 && Hour <= 4) {
        return { prefix: `uma`, time: `boa noite` };
    } else if (Hour >= 12 && Hour <= 17) {
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
            trigger: [`OI`, `OLÁ`],
            response: [`Oi!`, `Olá!`, `${capitalizeFirstLetter((await GetCurrentTime()).time)}!`]
        },
        {
            trigger: [`COMO VAI`, `TUDO BEM`, `COMO VOCÊ ESTÁ`, `COMO VOCÊ TÁ`],
            response: [`Estou bem e você?`, `Estou bem, obrigado, e você?`]
        },
        {
            trigger: [`QUE HORAS SÃO`, `ME DIGA A HORA`],
            response: [`Agora são ${moment().tz("America/Sao_Paulo").format('HH:mm')}.`]
        },
        {
            trigger: [`QUE DIA É HOJE`, `ESTAMOS EM QUE DIA`],
            response: [`Hoje é ${moment().tz("America/Sao_Paulo").format('DD/MM/yyyy')}.`]
        },
        {
            trigger: [`COTAÇÃO DO DÓLAR`, `QUANTO ESTÁ O DÓLAR`, `QUANTO TÁ O DÓLAR`],
            response: [`O dólar está ${await MoneyData('USD')}`]
        },
        {
            trigger: [`COTAÇÃO DO EURO`, `QUANTO ESTÁ O EURO`, `QUANTO TÁ O EURO`],
            response: [`O euro está ${await MoneyData('EUR')}`]
        },
        {
            trigger: [`PREVISÃO DO TEMPO PARA HOJE`, `PREVISÃO DO TEMPO DE HOJE`, `PREVISÃO DO TEMPO HOJE`],
            response: [`A previsão do tempo para hoje em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus e ${await UserData.Weather.weather[0].description}, com mínima de ${await UserData.Weather.main.temp_min} graus e máxima de ${await UserData.Weather.main.temp_max} graus. Tenha ${(await GetCurrentTime()).prefix} ${(await GetCurrentTime()).time}.`, `A previsão do tempo para hoje em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus e ${await UserData.Weather.weather[0].description}, com mínima de ${await UserData.Weather.main.temp_min} graus e máxima de ${await UserData.Weather.main.temp_max} graus.`]
        },
        {
            trigger: [`SENSAÇÃO TÉRMICA PARA HOJE`, `SENSAÇÃO TÉRMICA DE HOJE`, `SENSAÇÃO TÉRMICA HOJE`],
            response: [`A temperatura em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus com sensação térmica de ${await UserData.Weather.main.feels_like} graus. Tenha ${(await GetCurrentTime()).prefix} ${(await GetCurrentTime()).time}.`, `A temperatura em ${await UserData.Weather.name} é de ${await UserData.Weather.main.temp} graus com sensação térmica de ${await UserData.Weather.main.feels_like} graus.`]
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
            /*text = text.replace(new RegExp('[ÁÀÂÃ]', 'gmi'), 'A');
            text = text.replace(new RegExp('[ÉÈÊ]', 'gmi'), 'E');
            text = text.replace(new RegExp('[ÍÌÎ]', 'gmi'), 'I');
            text = text.replace(new RegExp('[ÓÒÔÕ]', 'gmi'), 'O');
            text = text.replace(new RegExp('[ÚÙÛ]', 'gmi'), 'U');
            text = text.replace(new RegExp('[Ç]', 'gmi'), 'C');

            let Test_Trigger_1 = new RegExp(` ${Trigger} `, 'gmi');
            let Test_Trigger_2 = new RegExp(`${Trigger} `, 'gmi');
            let Test_Trigger_3 = new RegExp(` ${Trigger}`, 'gmi');*/
            Trigger = new RegExp(`${Trigger}`, 'gmi');

            if (Trigger.test(text)) {
                const Response = Math.floor(Math.random() * ResponseData.response.length);
                ResponseMessage = [{ message: ResponseData.response[Response], author: 'system' }, ...ResponseMessage];
            }
        })
    });

    return ResponseMessage;
}

exports.IAResponses = IAResponses;