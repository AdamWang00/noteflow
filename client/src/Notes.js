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
        const {notes} = props;

        // create svg and svgcontainer
        const svgContainer = document.createElement('div');
        const renderer = new Renderer(svgContainer, Renderer.Backends.SVG);
        const ctx = renderer.getContext();
        const width = notes.length * 50;
        const stave = new Stave(0, 0, width);  // x, y, width
        stave.addClef("treble")/*.addTimeSignature("4/4")*/.setContext(ctx).draw();
        const bb = Formatter.FormatAndDraw(ctx, stave, notes, true);

        // display settings
        const svg = svgContainer.childNodes[0];
        const padding = 10;
        const half = padding / 2;
        svg.style.top = -bb.y + half + Math.max(0, (100 - bb.h) * 2/3) + "px";
        svg.style.height = Math.max(100, bb.h);
        svg.style.left = "0px";
        svg.style.width = width + "px";
        svg.style.position = "absolute";
        svg.style.overflow = "visible";
        svgContainer.style.height = Math.max(100, bb.h + padding) + "px";
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