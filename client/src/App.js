import React from 'react';
import './App.css';
import Hello from './Hello.js';
import { Sampler } from 'tone';

const App = () => {
  //create a synth and connect it to the main output (your speakers)
  const synth = new Tone.Synth().toDestination();

  //play a middle 'C' for the duration of an 8th note
  synth.triggerAttackRelease("C4", "8n");
  const [h, setH] = React.useState(1);

  const lol = x => x * x;

  const lolol = x => x ** 3;

  const updateMe = () => {
    setH(h + 1);
  }

  return (
    <div className="App">
      {h}
      <br />
      <Hello h={h} update={updateMe} squid="hello world" func={lol} />
      <Hello h={h} update={updateMe} squid="squidward" func={lolol} />
    </div>
  );
}

export default App;
