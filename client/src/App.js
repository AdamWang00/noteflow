import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import './App.css';
import Hello from './Hello.js';
import Notes from './Notes';
import Vex from 'vexflow';
import * as Tone from 'tone';
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
    const synth = props.synth;
    const validKeys = ["C","G","D","A","E","B","F#","C#","Cb","Gb","Db","Ab","Eb","Bb","F"];

    const [started, setStarted] = React.useState(false);
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

    const onStart = async e => {
        await Tone.start();
        setStarted(true);
    }

    const onKeyChanged = e => {
        let value = e.target.value || "C";
        value = value.charAt(0).toUpperCase() + value.substring(1);
        if (validKeys.includes(value)) setKey(value);
    }

    const onPlayPause = async e => {
        setPlay(!play);
    }

    const updateNotes = newNotes => {
        setPlay(false);
        setIndex(0);
        setNotes(newNotes);
    };

    const render = () => {
        if (!started) return <Jumbotron><Button onClick={onStart}>Start</Button></Jumbotron>;
        return (
            <Jumbotron>
                <Notes notes={notes} keySignature={key}/>
                <br />
                <br />

                <div style={{display: "inline-block"}}>
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroup-sizing-default">Key</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl type="text" onChange={onKeyChanged} />
                    </InputGroup>
                </div>

                <br />
                <Button variant="outline-primary" onClick={onPlayPause}>{play ? "Pause" : "Play"}</Button>
                <Hello updateNotes={updateNotes} keySignature={key}/>
            </Jumbotron>
        );
    }

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
    }, [play, notes, qpm, index, synth]);
        

    return (
        <div className="App">
            <div style={{display: "inline-block"}}>
                {render()}
            </div>
        </div>
    );
}

export default App;
