import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
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
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const [auth, setAuth] = React.useState(null);

    const synth = props.synth;
    const validKeys = ["C","G","D","A","E","B","F#","C#","Cb","Gb","Db","Ab","Eb","Bb","F"];

    const timeouts = React.useRef([]);

    const [started, setStarted] = React.useState(false);
    const [play, setPlay] = React.useState(false);
    const [index, setIndex] = React.useState(0);

    const [qpm, setQpm] = React.useState(120);
    const [keySignature, setKeySignature] = React.useState("C");
    const [melodyData, setMelodyData] = React.useState(defaultMelodyData);
    const [notes, setNotes] = React.useState(defaultNotes);

    const onStart = async () => {
        await Tone.start();
        await melodyRnnLoaded;
        setStarted(true);
        const name = await checkAuth();
        setAuth(name);
    };

    const onKeyChanged = e => {
        let value = e.target.value || "C";
        value = value.charAt(0).toUpperCase() + value.substring(1);
        if (validKeys.includes(value)) setKeySignature(value);
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

    const onSave = async () => {
        if (auth===null) {
            return;
        }

        const token = cookies["token"];
        const name = await checkAuth();
        if (name===null) {
            setAuth(null)
        } else {
            await Requests.newMelody(token, "melody 1", {"qpm": qpm, "keySignature": keySignature, "melody": melodyData});
        }
    };

    const onLoadMelody = data => {
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
            setAuth(null)
        } else {
            await Requests.deletePost(token, melodyId);
        }
    };

    const onLoginLogout = async () => {
        if (auth===null) {
            const { data } = await Requests.login("jane", "123");
            if (data["error"]) {
                console.log("invalid credentials, please try again")
            } else {
                const token = data["token"];
                setCookie("token", token);
                const name = await checkAuth(token);
                setAuth(name);
            }
        } else {
            removeCookie("token");
            setAuth(null);
        }
    };

    const onRegister = async () => {
        const { data } = await Requests.register("jane", "123");
        if (data["error"]) {
            console.log("invalid credentials, please try again")
        } else {
            const token = data["token"];
            setCookie("token", token);
            const name = await checkAuth(token);
            setAuth(name);
        }
    };

    const clearTimeouts = () => {
        timeouts.current.forEach(timeout => {
            clearTimeout(timeout);
        })
        timeouts.current = [];
    };

    const updateNotes = newMelodyData => {
       setMelodyData(newMelodyData);
    };

    const checkAuth = async (optionalToken) => {
        const token = optionalToken || cookies["token"];
        const { data } = await Requests.account(token);
        if (data["error"]) {
            console.log("[ERROR]", data["error"]);
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
                duration: noteRestsPairs[i][0][1],
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
        if (!started) return <Jumbotron>
            <h1>Welcome to NoteFlow</h1>
            <br />
            <Button onClick={onStart}>Start</Button>
            </Jumbotron>;
        return (
            <Jumbotron>
                {auth!==null && auth}
                <Button variant="outline-secondary" onClick={onLoginLogout}>{auth===null ? "Login" : "Logout"}</Button>
                {auth===null && <Button variant="outline-primary" onClick={onRegister}>Register</Button>}
                <br />
                <br />
                <Notes notes={notes} keySignature={keySignature}/>
                <br />

                <div style={{display: "inline-block"}}>
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroup-sizing-default">Key</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl type="text" onChange={onKeyChanged}/>
                    </InputGroup>
                </div>

                <br />
                <Button variant="outline-primary" onClick={onPlayPause}>{play ? "Stop" : "Play"}</Button>
                <Generator melodyRnn={melodyRnn} updateNotes={updateNotes} keySignature={keySignature}/>
                <Button variant={auth===null ? "outline-secondary" : "outline-primary"} onClick={onSave}>{auth===null ? "Login to save melody" : "Save melody"}</Button>
                { auth!==null && <MelodyList name={auth} onLoadMelody={onLoadMelody} onDeleteMelody={onDeleteMelody} /> }
            </Jumbotron>
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
