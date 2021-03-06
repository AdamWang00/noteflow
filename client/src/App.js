import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Modal from 'react-bootstrap/Modal';

import './App.css';
import Generator from './Generator.js';
import MelodyList from './MelodyList.js'
import * as Requests from './requests.js'
import Notes from './Notes';
import Vex from 'vexflow';
import * as Tone from 'tone';
import * as mm from "@magenta/music";
import { CookiesProvider } from 'react-cookie';
import { useCookies } from 'react-cookie';
import { getNoteFromPitch, getInitialAccidentals } from './utils.js';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import Tooltip from '@material-ui/core/Tooltip';

const { Accidental, StaveNote } = Vex.Flow;


const durationToFloat = {
    "1": 4,
    "2": 2,
    "4": 1,
    "8": 0.5,
    "16": 0.25,
    "32": 0.125,
    "1r": 4,
    "2r": 2,
    "4r": 1,
    "8r": 0.5,
    "16r": 0.25,
    "32r": 0.125,
};

const defaultMelodyData = [
    [[60, "4"], []],
    [[62, "4"], []],
    [[64, "4"], []],
    [[65, "4"], []],
    [[67, "4"], []],
    [[69, "4"], []],
    [[71, "4"], []],
    [[72, "4"], []],
]

const defaultNotes = [
    new StaveNote({
        keys: ["C/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["D/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["E/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["F/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["G/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["A/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["B/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["C/5"],
        duration: "4",
    }),
]

const melodyRnn = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn");
const melodyRnnLoaded = melodyRnn.initialize();

const App = (props) => {
    const [temperature, setTemperature] = React.useState(1.2);

    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const [auth, setAuth] = React.useState(null);
    const [melodyListKey, setMelodyListKey] = React.useState(1); // use to force-update melody list

    const [loginModal, setLoginModal] = React.useState(false);
    const [loginName, setLoginName] = React.useState(null);
    const [loginPassword, setLoginPassword] = React.useState(null);
    const [loginMessage, setLoginMessage] = React.useState(null);

    const [registerModal, setRegisterModal] = React.useState(false);
    const [registerName, setRegisterName] = React.useState(null);
    const [registerPassword, setRegisterPassword] = React.useState(null);
    const [registerMessage, setRegisterMessage] = React.useState(null);

    const [saveModal, setSaveModal] = React.useState(false);
    const [saveTitle, setSaveTitle] = React.useState(null);
    const [saveMessage, setSaveMessage] = React.useState(null);

    const [loadModal, setLoadModal] = React.useState(false);
    const [loadID, setLoadID] = React.useState(null);
    const [loadMessage, setLoadMessage] = React.useState(null);

    const [shareModal, setShareModal] = React.useState(false);
    const [shareId, setShareId] = React.useState(null);
    const [shareTitle, setShareTitle] = React.useState(null);

    const synth = props.synth;
    const validKeys = ["C","G","D","A","E","B","F#","C#","Cb","Gb","Db","Ab","Eb","Bb","F"];

    const timeouts = React.useRef([]);

    const [started, setStarted] = React.useState(false);
    const [startButtonText, setStartButtonText] = React.useState("start");
    const [play, setPlay] = React.useState(false);
    const [index, setIndex] = React.useState(0);

    const [title, setTitle] = React.useState("");
    const [qpm, setQpm] = React.useState(120);
    const [keySignature, setKeySignature] = React.useState("C");
    const [melodyData, setMelodyData] = React.useState(defaultMelodyData);
    const [notes, setNotes] = React.useState(defaultNotes);

    const onStart = async () => {
        const t = setTimeout(() => setStartButtonText("starting..."), 100);
        await Tone.start();
        await melodyRnnLoaded;
        clearTimeout(t);
        setStarted(true);
        const name = await checkAuth();
        setAuth(name);
    };

    const onKeyChanged = e => {
        let value = e.target.value || "C";
        value = value.charAt(0).toUpperCase() + value.substring(1);
        if (validKeys.includes(value)) setKeySignature(value);
    };

    const onQPMChanged = e => {
        let value = Number(e.target.value) || "120";
        if (value > 0) setQpm(value);
    };

    const onPlayPause = async () => {
        setPlay(!play);

        if (play) { // play => stop
            clearTimeouts();
        }

        if (!play && notes.length) { // stop => play
            let time = 200; // slight buffer

            for (let i = index; i < notes.length; i++) {
                const note = notes[i];
                const duration = note.duration;
                const ms = 1000 * (60 / qpm) * durationToFloat[duration];

                const timeout = setTimeout(() => {
                    setIndex(i);
                    if (note.noteType !== "r") { // not a rest
                        const key = note.keys[0].replace("/", ""); // e.g. f#/4 => f#4
                        synth.triggerAttackRelease(key, Number(duration) * 1.5 + "n");
                    }
                }, time);

                timeouts.current.push(timeout);
                time += ms;
            }

            timeouts.current.push(setTimeout(() => {
                setPlay(false);
                setIndex(0);
            }, time));
        }
    };

    const onLoadMelody = data => {
        setTitle(data.title || "New Melody");
        setQpm(data.qpm || 120);
        setKeySignature(data.keySignature || "C");
        setMelodyData(data.melody || defaultMelodyData);
    };

    const onDeleteMelody = async melodyId => {
        if (auth===null) {
            return;
        }

        const token = cookies["token"];
        const name = await checkAuth();
        if (name===null) {
            setAuth(null);
        } else {
            await Requests.deletePost(token, melodyId);
            setMelodyListKey(melodyListKey + 1);
        }
    };

    const onShareMelody = async (melodyId, melodyTitle) => {
        setShareModal(true);
        setShareId(melodyId);
        setShareTitle(melodyTitle)
    };

    const onLoginLogoutButton = () => {
        if (auth===null) {
            setLoginModal(true);
        } else {
            removeCookie("token");
            setAuth(null);
        }
    };

    const onLogin = async () => {
        if (!loginName || !loginPassword) {
            setLoginMessage("Missing name or password");
            return;
        }

        const { data } = await Requests.login(loginName, loginPassword);
        if (data["error"]) {
            setLoginMessage(data["error"]);
        } else {
            clearLogin()
            const token = data["token"];
            setCookie("token", token);
            const name = await checkAuth(token);
            setAuth(name);
        }
    }

    const onRegisterButton = () => {
        setRegisterModal(true);
    };

    const onRegister = async () => {
        if (!registerName || !registerPassword) {
            setRegisterMessage("Missing name or password");
            return;
        }

        const { data } = await Requests.register(registerName, registerPassword);
        if (data["error"]) {
            setRegisterMessage(data["error"]);
        } else {
            clearRegister();
            const token = data["token"];
            setCookie("token", token);
            const name = await checkAuth(token);
            setAuth(name);
        }
    }

    const onSaveButton = async () => {
        const token = cookies["token"];
        const name = await checkAuth(token);
        if (name===null) {
            setAuth(null);
        } else {
            setSaveModal(true);
        }
    };

    const onLoadButton = () => {
        setLoadModal(true);
    };

    const onSave = async () => {
        if (!saveTitle) {
            setSaveMessage("Enter a title for your melody");
            return;
        }

        const token = cookies["token"];
        const name = await checkAuth(token);
        if (name===null) {
            setAuth(null);
        } else {
            await Requests.newMelody(token, saveTitle, {"title": saveTitle, "qpm": qpm, "keySignature": keySignature, "melody": melodyData});
            setTitle(saveTitle);
            clearSave();
            setMelodyListKey(melodyListKey + 1);
        }
    };

    const onLoad = async () => {
        if (!loadID) {
            setLoadMessage("Enter the ID of the melody that you want to load");
            return;
        }

        const { data } = await Requests.getPost(loadID);
        if (data["error"]) {
            console.log("[ERROR]", data["error"]);
            setLoadMessage("Melody ID not found");
        } else {
            onLoadMelody(data.post.melody_data);
            clearLoad();
        }
    };

    const clearTimeouts = () => {
        timeouts.current.forEach(timeout => {
            clearTimeout(timeout);
        })
        timeouts.current = [];
    };

    const clearLogin = () => {
        setLoginName(null);
        setLoginPassword(null);
        setLoginModal(false);
        setLoginMessage(null);
    };

    const clearRegister = () => {
        setRegisterName(null);
        setRegisterPassword(null);
        setRegisterModal(false);
        setRegisterMessage(null);
    };

    const clearSave = () => {
        setSaveTitle(null);
        setSaveModal(false);
        setSaveMessage(null);
    };

    const clearLoad = () => {
        setLoadID(null);
        setLoadModal(false);
        setLoadMessage(null);
    };

    const clearShare = () => {
        setShareId(null);
        setShareTitle(null);
        setShareModal(false);
    };

    const updateNotes = newMelodyData => {
        setTitle("");
        setMelodyData(newMelodyData);
    };

    const checkAuth = async (optionalToken) => {
        const token = optionalToken || cookies["token"];
        const { data } = await Requests.account(token);
        if (data["error"]) {
            return null;
        } else {
            return data["name"];
        }
    };

    React.useEffect(() => {
        const finalNotes = [];
        const noteRestsPairs = melodyData;
        const accidentals = getInitialAccidentals(keySignature); // each is "n", "#", or "b"

        for (let i = 0; i < noteRestsPairs.length; i++) {
            const noteName = getNoteFromPitch(noteRestsPairs[i][0][0], keySignature);

            const noteObj = new StaveNote({
                keys: [noteName],
                duration: noteRestsPairs[i][0][1], // e.g. "2" => half note
            });
            
            const note = noteName.split("");
            if (note[1] === "#" && accidentals[note[0]] !== "#") {
                noteObj.addAccidental(0, new Accidental("#"));
                accidentals[note[0]] = "#";
            } else if (note[1] === "b" && accidentals[note[0]] !== "b") {
                noteObj.addAccidental(0, new Accidental("b"));
                accidentals[note[0]] = "b";
            } else if (note[1] === "/" && accidentals[note[0]] !== "n") {
                noteObj.addAccidental(0, new Accidental("n"));
                accidentals[note[0]] = "n";
            }

            finalNotes.push(noteObj);
            noteRestsPairs[i][1].forEach((restDuration) => {
                const restObj = new StaveNote({
                    keys: ["b/4"],
                    duration: restDuration + "r",
                });
                finalNotes.push(restObj);
            });
        }

        setPlay(false);
        setIndex(0);
        setNotes(finalNotes);
        clearTimeouts();
    }, [melodyData, keySignature])
    
    const render = () => {
        if (!started) return <div className="jumbo">
                <h1 className="startHeader">welcome to <span className="noteflow">noteflow</span></h1>
                <p className="startSubheader">a notebook for collaborative melody composition using magenta</p>
                <br />
                <button className="startButton" onClick={onStart}>{startButtonText}</button>
            </div>;
        return (
            <div className="jumbo">
                <h1 className="noteflow" style={{fontSize: 64}}>{auth!==null && auth + "'s "}noteflow</h1>
                <br></br>
                <Button variant={auth===null ? "outline-primary" : "outline-secondary"} onClick={onLoginLogoutButton}>{auth===null ? "Login" : "Logout"}</Button>{' '}
                {auth===null && <Button variant="primary" onClick={onRegisterButton}>Register</Button>}
                <br />
                <br />
                <hr/>
                <br />
                <h3>{title || "New Melody"}</h3>
                <Notes notes={notes} keySignature={keySignature}/>
                <br />

                <div className="keyInput" style={{display: "inline-block"}}>
                    <InputGroup className="mb-3">
                        <Tooltip title = "tonal center of the melody" arrow>
                            <InputGroup.Prepend>
                                <InputGroup.Text>Key</InputGroup.Text>
                            </InputGroup.Prepend>
                        </Tooltip>
                        <FormControl placeholder={keySignature} type="text" onChange={onKeyChanged}/>
                    </InputGroup>
                </div> {' '}

                <div className="qpmInput" style={{display: "inline-block"}}>
                    <InputGroup className="mb-3">
                        <Tooltip title = "quarter notes, or beats, per minute" arrow>
                            <InputGroup.Prepend>
                                <InputGroup.Text>QPM</InputGroup.Text>
                            </InputGroup.Prepend>
                        </Tooltip>
                        <FormControl placeholder={qpm} type="text" onChange={onQPMChanged}/>
                    </InputGroup>
                </div>{' '}
                    
                <div style={{display: "inline-block"}}>
                    <InputGroup className="mb-3">
                        <Tooltip title = "entropy of generated melody" arrow>
                            <InputGroup.Prepend>
                                <InputGroup.Text>Temperature</InputGroup.Text>
                            </InputGroup.Prepend>
                        </Tooltip>
                        <RangeSlider
                            value={temperature}
                            min = {0.8}
                            max = {1.6}
                            step = {0.1}
                            tooltip = {"on"}
                            onChange={e => setTemperature(Number(e.target.value))}
                        />
                    </InputGroup>
                </div>

                <br />
                <div style={{display: "inline-block"}}>
                    <InputGroup className="mb-3">
                        <Button variant={play ? "outline-secondary" : "success"} onClick={onPlayPause}>{play ? "Stop" : "Play"}</Button>
                    </InputGroup>
                </div>{' '}
                <div style={{display: "inline-block"}}>
                    <InputGroup className="mb-3">
                        <Generator melodyRnn={melodyRnn} updateNotes={updateNotes} keySignature={keySignature} temperature={temperature}/>
                    </InputGroup>
                </div>
                <br />
                <Button variant={auth===null ? "outline-secondary" : "outline-primary"} onClick={auth===null ? onLoginLogoutButton : onSaveButton}>{auth===null ? "Login to save melodies" : "Save melody"}</Button>{' '}
                <Button variant="outline-primary" onClick={onLoadButton}>Import melody from ID</Button>
                { auth!==null && <MelodyList update={melodyListKey} name={auth} onLoadMelody={onLoadMelody} onDeleteMelody={onDeleteMelody} onShareMelody={onShareMelody} /> }

                <Modal show={loginModal} onHide={clearLogin} className="modal">
                    <Modal.Header closeButton>
                        <Modal.Title>login to noteflow</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {loginMessage}
                        <InputGroup className="m-2">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Name</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl type="text" onChange={e => setLoginName(e.target.value)}/>
                        </InputGroup>
                        <InputGroup className="m-2">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Password</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl type="password" onChange={e => setLoginPassword(e.target.value)}/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={clearLogin}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={onLogin}>
                            Login
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={registerModal} onHide={clearRegister} className="modal">
                    <Modal.Header closeButton>
                        <Modal.Title>create a noteflow account</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {registerMessage}
                        <InputGroup className="m-2">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Name</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl type="text" onChange={e => setRegisterName(e.target.value)}/>
                        </InputGroup>
                        <InputGroup className="m-2">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Password</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl type="password" onChange={e => setRegisterPassword(e.target.value)}/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={clearRegister}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={onRegister}>
                            Register
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={saveModal} onHide={clearSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>Save your melody</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {saveMessage}
                        <InputGroup className="m-2">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Melody Title</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl type="text" onChange={e => setSaveTitle(e.target.value)}/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={clearSave}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={onSave}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={loadModal} onHide={clearLoad}>
                    <Modal.Header closeButton>
                        <Modal.Title>Load melody</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {loadMessage}
                        <InputGroup className="m-2">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Melody ID</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl type="text" onChange={e => setLoadID(e.target.value)}/>
                        </InputGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={clearLoad}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={onLoad}>
                            Load Melody
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={shareModal} onHide={clearShare}>
                    <Modal.Header closeButton>
                        <Modal.Title>{'Share "' + shareTitle + '"'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Unique melody ID:</p>
                        <p className="shareId"><b>{shareId}</b></p>
                        <p>Others can view your melody on noteflow by selecting "Import melody from ID"</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={clearShare}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    notes[(index + notes.length - 1) % notes.length].setStyle({fillStyle: "black", strokeStyle: "black"});
    notes[index].setStyle({fillStyle: "orange", strokeStyle: "orange"});

    return (
        <CookiesProvider>
            <div className="App">
                <div style={{display: "inline-block"}}>
                    {render()}
                </div>
            </div>

        </CookiesProvider>
    );
}

export default App;
