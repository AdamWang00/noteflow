import React from 'react';
import * as Tone from 'tone';
import './App.css';
import Sequencer from './Sequencer.js';
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

    const [play, setPlay] = React.useState(true);
    // quarters per minute
    const [qpm, setQpm] = React.useState(120);
    // current note index
    const [index, setIndex] = React.useState(0);

    const notes = [
    new StaveNote({
        keys: ["g/4"],
        duration: "4",
    }),
    new StaveNote({
        keys: ["g/4"],
        duration: "8",
    }),
    new StaveNote({
        keys: ["e/4"],
        duration: "8",
    }),
    new StaveNote({
        keys: ["b/4"],
        duration: "8r"
    }),
    new StaveNote({
        keys: ["f#/4"],
        duration: "4",
    }).addAccidental(0, new Accidental("#")),
    new StaveNote({
        keys: ["b/3"],
        duration: "8",
    }),
    ];
    
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
            <Notes notes={notes} />
            <br />
            <button onClick={() => setPlay(!play)}>{play ? "Pause" : "Play"}</button>
            <Sequencer />
            <Hello />
        </div>
        );
}

export default App;
