import React from 'react';
import * as Tone from 'tone';
import './App.css';
import Hello from './Hello.js';
import Notes from './Notes';
import Vex from 'vexflow';
const {Accidental, StaveNote} = Vex.Flow;

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
    const synth = props.synth;
    const validKeys = ["C","G","D","A","E","B","F#","C#","Cb","Gb","Db","Ab","Eb","Bb","F"];

    const [play, setPlay] = React.useState(false);
    const [qpm, setQpm] = React.useState(120);
    const [index, setIndex] = React.useState(0);
    const [key, setKey] = React.useState("C");
    const [notes, setNotes] = React.useState([
    new StaveNote({
        keys: ["C/5"],
        duration: "4",
    }),
    ]);

    const onKeyChanged = e => {
        let value = e.target.value || "C";
        value = value.charAt(0).toUpperCase() + value.substring(1);
        if (validKeys.includes(value)) setKey(value);
    }

    const updateNotes = newNotes => {
        setPlay(false);
        setIndex(0);
        setNotes(newNotes);
    };
    
    notes[(index + notes.length - 1) % notes.length].setStyle({fillStyle: "black", strokeStyle: "black"});
    notes[index].setStyle({fillStyle: "orange", strokeStyle: "orange"});

    React.useEffect(() => {
        if (play && notes.length) {
            const note = notes[index];
            const duration = note.duration;
            const ms = 1000 * (60 / qpm) * durationToFloat[duration];

            if (note.noteType !== "r") { // not a rest
                const key = note.keys[0].replace("/", ""); // e.g. f#/4 => f#4
                synth.triggerAttackRelease(key, Number(duration) * 1.5 + "n");
            }

            const interval = setInterval(() => {
                setIndex((index + 1) % notes.length); // loop
            }, ms);

            return () => clearInterval(interval);
        }
    }, [play, notes, qpm, index]);
        

    return (
        <div className="App">
            <Notes notes={notes} keySignature={key}/>
            <br />
            Key: <input type="text" onChange={onKeyChanged} />
            <br />
            <button onClick={() => setPlay(!play)}>{play ? "Pause" : "Play"}</button>
            <Hello updateNotes={updateNotes} keySignature={key}/>
        </div>
    );
}

export default App;
