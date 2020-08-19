import React from 'react';
import './App.css';
import Hello from './Hello.js';

const App = () => {
  const [h, setH] = React.useState(1);

  const lol = x => x * x;

  const lolol = x => x ** 3;

  const lololol = x => x ** 4;

  const updateMe = () => {
    setH(h + 1);
  }

  return (
    <div className="App">
      {h}
      <br />
      <Hello note="C4" h={h} update={updateMe} squid="hello world" func={lol} />
      <Hello note="E4" h={h} update={updateMe} squid="squidward" func={lolol} />
      <Hello note="G4" h={h} update={updateMe} squid="peen" func={lololol} />
    </div>
  );
}

export default App;
