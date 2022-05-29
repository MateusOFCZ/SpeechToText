var moment = require('moment-timezone');
var axios = require('axios');

async function MoneyData(from, to = 'BRL') {
    return await axios({
        method: 'get',
        url: `https://economia.awesomeapi.com.br/json/last/${from}-${to}`,
    }).then(function (response) {
        return response.data[`${from}${to}`].ask;
    });
}

async function IAData() {
    const Data = [
        { trigger: [`OI`, `OLA`, `BOM DIA`, `BOA TARDE`, `BOA NOITE`], response: [`Oie!`, `Olá!`, `Oii!`] },
        { trigger: [`COMO VAI`, `TUDO BEM`, `COMO VOCE ESTA`, `COMO VOCE TA`], response: [`Estou bem e você?`, `Estou bem, obrigado, e você?`] },
        { trigger: [`QUE HORAS SAO`, `ME DIGA A HORA`], response: [`Agora são ${moment().tz("America/Sao_Paulo").format('HH:mm')}.`] },
        { trigger: [`QUE DIA É HOJE`, `ESTAMOS EM QUE DIA`], response: [`Hoje é ${moment().tz("America/Sao_Paulo").format('DD/MM/yyyy')}.`] },
        { trigger: [`QUAL A COTACAO DO DOLAR`, `QUANTO ESTA O DOLAR`, `QUANTO TA O DOLAR`], response: [`O dólar está ${await MoneyData('USD')}`] },
        { trigger: [`QUAL A COTACAO DO EURO`, `QUANTO ESTA O EURO`, `QUANTO TA O EURO`], response: [`O euro está ${await MoneyData('EUR')}`] },
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