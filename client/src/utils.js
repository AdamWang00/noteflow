const defaultNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const keyMap = {
    "G": defaultNotes,
    "D": defaultNotes,
    "C": defaultNotes,
    "A": defaultNotes,
    "E": defaultNotes,
    "B": defaultNotes,
    "F#": defaultNotes,
    "C#": defaultNotes,
    "Cb": ["C", "Db", "D", "Eb", "Fb", "F", "Gb", "G", "Ab", "A", "Bb", "Cb"],
    "Gb": ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "Cb"],
    "Db": ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
    "Ab": ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
    "Eb": ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
    "Bb": ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"],
    "F": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"],
};

const pitchToNote = (pitch, key) => {
    const noteLetter = keyMap[key][pitch % 12];
    const octave = Math.floor(pitch / 12) + (noteLetter === "Cb") - 1;
    return noteLetter + "/" + octave;
};

export {pitchToNote};