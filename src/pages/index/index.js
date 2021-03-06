import React, { Component } from "react";
import Speech from 'speak-tts';
import SpeechToText from 'speech-to-text';
import SupportedLanguages from '../../assets/SupportedLanguages';
import IAResponses from '../../assets/IAResponses';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import './index.css';
const speech = new Speech();

export default class Index extends Component {
    state = {
        Error: '',
        InterimText: '',
        FinalisedText: [],
        HistoryText: [],
        ResponseText: [],
        Listening: false,
        Language: 'pt-BR',
        Loaded: false,
        Stream: {},
    };

    SetListening = type => {
        if (type) {
            let Microphone_On = new Audio('../../assets/Microphone_On.mp3');
            this.setState({ Listening: true });
            Microphone_On.play();

            setTimeout(() => {
                Microphone_On.pause();
            }, 900);
        } else {
            let Microphone_Off = new Audio('../../assets/Microphone_Off.mp3');
            this.setState({ Listening: false });
            Microphone_Off.play();

            setTimeout(() => {
                Microphone_Off.pause();
            }, 900);
        }
    }

    SayMessage = text => {
        this.listener.stopListening();
        this.SetListening(false);

        setTimeout(() => {
            speech.setRate(1.5);
            speech.setVolume(1);
            speech.setPitch(0);
            speech.setLanguage('pt-BR');
            speech.speak({
                text: text,
                queue: true,
                listeners: {
                    onend: () => {
                        if (!speech.speaking()) {
                            this.listener.startListening();
                            this.SetListening(true);
                        }
                    }
                }
            }).catch(err => {
                console.error(err);
            })
        }, 1000);
    }

    addMessage = (message, author = 'user', say = false) => {
        if (typeof message === 'string') {
            this.setState({
                FinalisedText: [{ message: message, author: author }, ...this.state.FinalisedText],
                HistoryText: [{ message: message, author: author }, ...this.state.FinalisedText].reverse(),
                InterimText: ''
            });

            setTimeout(() => {
                if (this.state.FinalisedText.length > 3) {
                    document.getElementById("chat_table").scrollTop = document.getElementById("chat_table").scrollHeight;
                }
            }, 100);
        } else if (typeof message === 'object') {
            this.setState({
                FinalisedText: [...message, ...this.state.FinalisedText],
                HistoryText: [...message, ...this.state.FinalisedText].reverse(),
                InterimText: ''
            });

            if (say) {
                message.reverse().forEach(Message => {
                    this.SayMessage(Message.message);
                });
            }

            setTimeout(() => {
                if (this.state.FinalisedText.length > 3) {
                    document.getElementById("chat_table").scrollTop = document.getElementById("chat_table").scrollHeight;
                }
            }, 100);
        }
    }

    getLocalStream = () => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then((stream) => {
            })
            .catch((err) => {
                console.error(err);

                if (err.message === "Permission denied" && this.state.Error !== "This browser doesn't support speech recognition. Try Google Chrome.") {
                    this.addMessage(`<p style="color: #FF0000; text-align: center">HABILITE SEU <b>MICROFONE</b></p>`, 'system', true);
                    this.state.Listening = false;
                }
            });
    }

    onAnythingSaid = text => {
        this.setState({ InterimText: text });
    };

    onEndEvent = () => {
        if (this.state.Listening) {
            this.startListening();
        }
    };

    onFinalised = async (text) => {
        this.addMessage(text);

        setTimeout(() => {
            IAResponses.IAResponses(text).then(ResponseMessage => {
                if (ResponseMessage.length > 0) {
                    this.addMessage(ResponseMessage, 'system', true);
                }
            });
        }, 1000);
    };

    startListening = () => {
        if (this.state.FinalisedText.length > 3) {
            document.getElementById("chat_table").scrollTop = document.getElementById("chat_table").scrollHeight;
        }

        try {
            this.listener = new SpeechToText(
                this.onFinalised,
                this.onEndEvent,
                this.onAnythingSaid,
                this.state.Language
            );

            this.listener.startListening();
            this.setState({ Listening: true });
        } catch (err) {
            if (err.message === "This browser doesn't support speech recognition. Try Google Chrome.") {
                this.addMessage(`<p style="color: #FF0000; text-align: center">ESTE NAVEGADOR N??O SUPORTA RECONHECIMENTO DE FALA. RECOMENDAMOS A UTILIZA????O DO <b>GOOGLE CHROME</b></p>`, 'system');
            }

            this.state.Error = err.message;
            console.error(err);
        }
    };

    stopListening = () => {
        this.listener.stopListening();
        this.SetListening(false);
    };

    clearChat = () => {
        this.setState({
            FinalisedText: [],
            HistoryText: [],
            InterimText: ''
        });

        document.getElementById("chat_table").scrollTop = 0;
    }

    render() {
        const {
            Error,
            InterimText,
            FinalisedText,
            HistoryText,
            ResponseText,
            HistoryResponseText,
            Listening,
            Language,
            Loaded,
            Stream,
        } = this.state;

        if (this.state.Loaded === false && this.state.Error !== "This browser doesn't support speech recognition. Try Google Chrome.") {
            try {
                this.listener = new SpeechToText(
                    this.onFinalised,
                    this.onEndEvent,
                    this.onAnythingSaid,
                    this.state.Language
                );

            } catch (err) {
                console.log(err);
                this.state.Error = err.message;
            }
            this.state.Loaded = true;
        }

        return (
            <div className="index">
                {this.state.Error === "This browser doesn't support speech recognition. Try Google Chrome." ?
                    <div className="error">
                        <div className="overlay-title">
                            <p><span className="title">Error</span></p>
                        </div>
                        <div className="overlay">
                            <div className="content">
                                <p>ESTE NAVEGADOR N??O SUPORTA RECONHECIMENTO DE FALA.</p>
                                <p>RECOMENDAMOS A UTILIZA????O DO <b>GOOGLE CHROME</b></p>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="main">
                        <div className="panel">
                            <div className="header">
                                <p onClick={() => this.SayMessage('Teste')}>Avalia????o 3 - Intelig??ncia Artificial</p>
                            </div>
                            <div className="content">
                                <div className="steps">
                                    <p>Etapas do reconhecimento de voz e convers??o de fala para texto:</p>
                                    <ol>
                                        <li>Usu??rio faz a requisi????o;</li>
                                        <li>O reconhecimento autom??tico de fala converte o ??udio em texto;</li>
                                        <li>A compreens??o de linguagem natural faz o tratamento do ??udio para entender o que o usu??rio quis dizer;</li>
                                        <li>O texto ?? processado e convertido para fala ou renderizado em componente gr??fico.</li>
                                    </ol>
                                </div>
                                <div className="controls">
                                    <span className="control">
                                        <FontAwesomeIcon className="trash" icon={faTrashCan} onClick={() => (!speech.speaking() && (this.clearChat()))} />
                                    </span>
                                    {Listening ?
                                        <span className="control">
                                            <FontAwesomeIcon className="microphone" icon={faMicrophone} style={{ color: "#017D0C" }} onClick={() => (!speech.speaking() && (this.getLocalStream(), this.stopListening()))} />
                                        </span>
                                        :
                                        <span className="control">
                                            <FontAwesomeIcon className="microphone" icon={faMicrophone} style={{ color: "#7D0101" }} onClick={() => (!speech.speaking() && (this.getLocalStream(), this.SetListening(true), this.startListening()))} />
                                        </span>
                                    }
                                    {/*<select className="control" value={Language} disabled={Listening} onChange={evt => this.setState({ Language: evt.target.value })}>
                                        {SupportedLanguages.map(Language => (
                                            <option key={Language[1]} value={Language[1]}>
                                                {Language[0]}
                                            </option>
                                        ))}
                                    </select>*/}
                                </div>
                            </div>
                            <div className="chat">
                                <div id="chat_table" className="wrapper">
                                    <table>
                                        {this.state.HistoryText.length > 0 &&
                                            this.state.HistoryText.map(TextData => (
                                                <span>
                                                    {TextData.author === 'user' ?
                                                        <tr align="right">
                                                            <p className="user_text" dangerouslySetInnerHTML={{ __html: `${TextData.message}` }}></p>
                                                        </tr>
                                                        :
                                                        <tr align="left">
                                                            <p className="system_text" dangerouslySetInnerHTML={{ __html: `${TextData.message}` }}></p>
                                                        </tr>
                                                    }
                                                </span>
                                            ))
                                        }
                                    </table>
                                </div>
                                <div className="current_text">
                                    <p>{this.state.InterimText}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}