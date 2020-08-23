import React from 'react';
import Vex from 'vexflow';

const {
    Formatter,
    Stave,
    Renderer,
} = Vex.Flow;

// Renders a stave with data from props.notes
const Notes = (props) => {
    // ref to outer div
    const outerRef = React.useRef(null);

    React.useEffect(() => {
        const {notes, keySignature} = props;
        const keyWidth = {
            "C": 0,
            "G": 15,
            "D": 25,
            "A": 35,
            "E": 45,
            "B": 55,
            "F#": 65,
            "C#": 75,
            "Cb": 75,
            "Gb": 65,
            "Db": 55,
            "Ab": 45,
            "Eb": 35,
            "Bb": 25,
            "F": 15,
        };

        // create svg and svgcontainer
        const svgContainer = document.createElement('div');
        const renderer = new Renderer(svgContainer, Renderer.Backends.SVG);
        const ctx = renderer.getContext();
        const width = notes.length * 50 + 50 + keyWidth[keySignature];
        const stave = new Stave(0, 0, width);  // x, y, width
        stave.addClef("treble");
        stave.addKeySignature(keySignature);
        /*stave.addTimeSignature("4/4")*/
        stave.setContext(ctx);
        stave.draw();
        const bb = Formatter.FormatAndDraw(ctx, stave, notes, true);

        // display settings
        const svg = svgContainer.childNodes[0];
        const padding = 10;
        const half = padding / 2;
        svg.style.top = -bb.y + half + Math.max(0, (80 - bb.h) * 2/3) + "px";
        svg.style.height = Math.max(120, bb.h);
        svg.style.left = "0px";
        svg.style.width = width + "px";
        svg.style.position = "absolute";
        svg.style.overflow = "visible";
        svgContainer.style.height = Math.max(120, bb.h + padding) + "px";
        svgContainer.style.width = width + "px";
        svgContainer.style.position = "relative";
        svgContainer.style.display = "inlineBlock";

        // append stave
        outerRef.current.appendChild(svgContainer);

        // remove stave (e.g. when props.notes is changed)
        return () => outerRef.current.removeChild(svgContainer);
    });

    return (
        <div ref={outerRef} style={{
            border: "2px gray solid",
            padding: 10,
            borderRadius: 10,
            display: "inline-block",
        }}>
        </div>
    );
}

export default Notes;