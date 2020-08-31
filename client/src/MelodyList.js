import React from 'react'
import * as Requests from './requests.js'
import './MelodyList.css'
import Button from 'react-bootstrap/Button';

const MelodyList = (props) => {
    const { update, name, onLoadMelody, onDeleteMelody } = props;
    const [melodies, setMelodies] = React.useState(null);

    const getMelodies = async () => {
        const { data } = await Requests.user(name);
        if (data["error"]) {
            console.log(data["error"])
            return
        } else {
            const posts = data.posts;
            setMelodies(posts);
        }
    }

    const renderMelody = (melody) => {
        return (
            <div key={melody.id}>
                {melody.title + " " + melody.date + "  "}
                {/* <Button variant="outline-primary onClick={() => onLoadMelody(melody.melody_data)}>Load</Button>{' '}
                <Button variant="outline-error onClick={() => onDeleteMelody(melody.id)}>Delete</Button> */}
                <Button variant="outline-primary" onClick={onLoadMelody(melody.melody_data)}>Load</Button>{' '}
                <Button variant="outline-danger" onClick={onDeleteMelody(melody.id)}>Delete</Button>
            </div>
        )
    }

    React.useEffect(() => {
        getMelodies();
    }, [name, update])

    if (melodies!==null) {
        return (
            <div className="MelodyList">
                <h3>Saved Melodies</h3>
                {melodies.map(renderMelody)}
            </div>
        );
    } else {
        return null;
    }
};


export default MelodyList