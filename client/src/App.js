import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import './App.css';
import Hello from './Hello.js';
import * as Requests from './requests.js'
import Notes from './Notes';
import Vex from 'vexflow';
import * as Tone from 'tone';
import { CookiesProvider } from 'react-cookie';
import { useCookies } from 'react-cookie';
import { logging } from '@magenta/music';
const { StaveNote } = Vex.Flow;

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

const App = (props) => {
    const [cookies, setCookie] = useCookies(["token"]);
    setCookie("token","joe");
    const synth = props.synth;
    const validKeys = ["C","G","D","A","E","B","F#","C#","Cb","Gb","Db","Ab","Eb","Bb","F"];

    const timeouts = React.useRef([]);

    const [started, setStarted] = React.useState(false);
    const [play, setPlay] = React.useState(false);
    const [index, setIndex] = React.useState(0);

    const [qpm, setQpm] = React.useState(120);
    const [key, setKey] = React.useState("C");
    const [notes, setNotes] = React.useState([
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
    ]);

    const onStart = async e => {
        await Tone.start();
        setStarted(true);
    };

    const onKeyChanged = e => {
        let value = e.target.value || "C";
        value = value.charAt(0).toUpperCase() + value.substring(1);
        if (validKeys.includes(value)) setKey(value);
    };

    const onPlayPause = async e => {
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

    const clearTimeouts = () => {
        timeouts.current.forEach(timeout => {
            clearTimeout(timeout);
        })
        timeouts.current = [];
    };

    const updateNotes = newNotes => {
        setPlay(false);
        setIndex(0);
        setNotes(newNotes);

        clearTimeouts();
    };
    const render = () => {
        if (!started) return <Jumbotron>
            <Button onClick={onStart}>Start</Button>
            </Jumbotron>;
        return (
            <Jumbotron>
                <Notes notes={notes} keySignature={key}/>
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
                <Hello updateNotes={updateNotes} keySignature={key}/>
            </Jumbotron>
        );
    }

    notes[(index + notes.length - 1) % notes.length].setStyle({fillStyle: "black", strokeStyle: "black"});
    notes[index].setStyle({fillStyle: "orange", strokeStyle: "orange"});

    // // OLD PLAYER
    // React.useEffect(() => {
    //     if (play && notes.length) {
    //         const note = notes[index];
    //         const duration = note.duration;
    //         const ms = 1000 * (60 / qpm) * durationToFloat[duration];

    //         if (note.noteType !== "r") { // not a rest
    //             const key = note.keys[0].replace("/", ""); // e.g. f#/4 => f#4
    //             synth.triggerAttackRelease(key, Number(duration) * 1.5 + "n");
    //         }

    //         const interval = setInterval(() => {
    //             setIndex((index + 1) % notes.length); // loop
    //         }, ms);

    //         return () => clearInterval(interval);
    //     }
    // }, [play, notes, qpm, index, synth]);

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
