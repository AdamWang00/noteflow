import React from 'react';
import './App.css';
import Hello from './Hello.js'


const App = () => {

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
