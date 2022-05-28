var moment = require('moment-timezone');

function IAResponses(props) {
    const Data = [
        {trigger: [`OI`, `OLÁ`, `OLA`], response: [`Oie!`, `Olá!`, `Oii!`]},
        {trigger: [`COMO VAI`, `TUDO BEM`, `COMO VOCÊ ESTÁ`, `COMO VOCÊ TÁ`], response: [`Estou bem e você?`, `Estou bem, obrigada, e você?`]},
        {trigger: [`QUE HORAS SÃO`, `ME DIGA A HORA`], response: [`Agora são ${moment().tz("America/Sao_Paulo").format('HH:mm')}.`]},
        {trigger: [`QUE DIA É HOJE`, `ESTAMOS EM QUE DIA`], response: [`Hoje é ${moment().tz("America/Sao_Paulo").format('DD/MM/yyyy')}.`]},
    ]

    return Data;
}

exports.IAResponses = IAResponses;