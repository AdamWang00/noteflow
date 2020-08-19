import React from 'react';
import * as mm from "@magenta/music";
import * as Tone from 'tone';
import * as p5 from 'p5';
import * as ml5 from 'ml5';

export default (props) => {
  const synth = new Tone.Synth().toDestination();

  const [foo, setFoo] = React.useState(1);

  React.useEffect(() => {
    setTimeout(() => setFoo(foo + 1), 1000);
  });

  return (
    <div>
      { props.squid + " " + props.func(props.h) }
      <br />
      <button onClick={() => {
        props.update();
        synth.triggerAttackRelease(props.note, "8n");
      }}>Play {props.note}</button>
    </div>
  );
  
};