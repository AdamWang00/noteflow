import React from 'react';

export default (props) => {

  const [foo, setFoo] = React.useState(1);

  React.useEffect(() => {
    setTimeout(() => setFoo(foo + 1), 1000);
  });

  return (
    <div>
      { props.squid + " " + props.func(props.h) }
      <br />
      <button onClick={() => props.update()}>butt</button>
    </div>
  );
  
};