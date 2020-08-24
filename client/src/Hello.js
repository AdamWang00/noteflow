import React from 'react';
import Button from 'react-bootstrap/Button';
import * as mm from "@magenta/music";
import * as Tone from 'tone';
import Vex from 'vexflow';
import { getNoteFromPitch, getInitialAccidentals } from './utils.js';
const { Accidental, StaveNote } = Vex.Flow;
// import * as p5 from 'p5';
// import * as ml5 from 'ml5';

const melodyRnn = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn");
const melodyRnnLoaded = melodyRnn.initialize();

const Hello = (props) => {

    const { keySignature, updateNotes } = props;

    const [started, setStarted] = React.useState(false);
    const [melodyData, setMelodyData] = React.useState(null); // [combined, noteRestsPairs]

    const generateMelody = async () => {
        await melodyRnnLoaded;

        if (!started) setStarted(true);

        const seed = {
            notes: [
            { pitch: Tone.Frequency('C5').toMidi(), quantizedStartStep: 0, quantizedEndStep: 4 }
            ],
            totalQuantizedSteps: 4,
            quantizationInfo: { stepsPerQuarter: 4}
        };
        const steps = 28;
        const temperature = 1.2;

        const result = await melodyRnn.continueSequence(seed, steps, temperature);
        const combined = mm.sequences.concatenate([seed, result]);

        const startSteps = [];
        for (let note of combined.notes) {
            startSteps.push(note.quantizedStartStep);
        }
        
        const noteRestsPairs = [];
        for (let i = 0; i < startSteps.length; i++) {
            const startDiff = (i + 1 === startSteps.length ? 32 : startSteps[i + 1]) - startSteps[i];
            const noteRests = [];
            const noteDuration = Math.pow(2, Math.floor(Math.log(startDiff) / Math.log(2)));
            noteRests[0] = (16 / noteDuration).toString();

            const restTime = startDiff - noteDuration;
            let counter = 1;
            const rests = [];
            while (counter <= restTime) {
                const include = restTime & counter;
                if (include) rests.push((16 / counter).toString());
                counter <<= 1;
            }
            noteRests[1] = rests;
            noteRestsPairs.push(noteRests);
        }

        setMelodyData([combined, noteRestsPairs]);
    };

    React.useEffect(() => {
        if (started) {
            const finalNotes = [];
            const [combined, noteRestsPairs] = melodyData;
            const accidentals = getInitialAccidentals(keySignature); // each is "n", "#", or "b"

            for (let i = 0; i < noteRestsPairs.length; i++) {
                const noteName = getNoteFromPitch(combined.notes[i].pitch, keySignature);

                const noteObj = new StaveNote({
                    keys: [noteName],
                    duration: noteRestsPairs[i][0],
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
            
            updateNotes(finalNotes);
        }
    }, [melodyData, keySignature, started, updateNotes])

    return <Button variant="outline-success" onClick={generateMelody}>Generate</Button>;
}

export default Hello;