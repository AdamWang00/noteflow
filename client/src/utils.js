const defaultNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const keyPitchesMap = {
    "C": defaultNotes,
    "G": defaultNotes,
    "D": defaultNotes,
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

const [n, s, f] = ["n", "#", "b"];

const keyAccidentalsMap = {
    "C": {"C": n, "D": n, "E": n, "F": n, "G": n, "A": n, "B": n},
    "G": {"C": n, "D": n, "E": n, "F": s, "G": n, "A": n, "B": n},
    "D": {"C": s, "D": n, "E": n, "F": s, "G": n, "A": n, "B": n},
    "A": {"C": s, "D": n, "E": n, "F": s, "G": s, "A": n, "B": n},
    "E": {"C": s, "D": s, "E": n, "F": s, "G": s, "A": n, "B": n},
    "B": {"C": s, "D": s, "E": n, "F": s, "G": s, "A": s, "B": n},
    "F#": {"C": s, "D": s, "E": s, "F": s, "G": s, "A": s, "B": n},
    "C#": {"C": s, "D": s, "E": s, "F": s, "G": s, "A": s, "B": s},
    "Cb": {"C": f, "D": f, "E": f, "F": f, "G": f, "A": f, "B": f},
    "Gb": {"C": f, "D": f, "E": f, "F": n, "G": f, "A": f, "B": f},
    "Db": {"C": n, "D": f, "E": f, "F": n, "G": f, "A": f, "B": f},
    "Ab": {"C": n, "D": f, "E": f, "F": n, "G": n, "A": f, "B": f},
    "Eb": {"C": n, "D": n, "E": f, "F": n, "G": n, "A": f, "B": f},
    "Bb": {"C": n, "D": n, "E": f, "F": n, "G": n, "A": n, "B": f},
    "F": {"C": n, "D": n, "E": n, "F": n, "G": n, "A": n, "B": f},
};

const getNoteFromPitch = (pitch, key) => {
    const noteLetter = keyPitchesMap[key][pitch % 12];
    const octave = Math.floor(pitch / 12) + (noteLetter === "Cb") - 1;
    return noteLetter + "/" + octave;
};

const getInitialAccidentals = key => keyAccidentalsMap[key];

export { getNoteFromPitch, getInitialAccidentals };