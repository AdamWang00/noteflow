import React from 'react';
import { useSequencer } from 'react-sequencer';
// import * as mm from "@magenta/music";
// import * as Tone from 'tone';
// import * as p5 from 'p5';
// import * as ml5 from 'ml5';

const steps = [
  ['initial', 100],
  ['middle', 100],
  ['final', 0],
]

const Sequencer = (props) => {
  let [state, api] = useSequencer({ steps, endMode: 'loop' })

  return (
    <div>
      <div>The current step: {state.current}</div>
      <button
        onClick={() => {
          api.play()
        }}
      >
        Start
      </button>
      <button
        onClick={() => {
          api.stop()
        }}
      >
        Stop
      </button>
    </div>
  )
}

export default Sequencer;