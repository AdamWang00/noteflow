import React from 'react'
import * as Requests from './requests.js'
import './MelodyList.css'

const MelodyList = (props) => {
    const { name, onLoadMelody, onDeleteMelody } = props;
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
                {melody.title + " " + melody.date}
                <button onClick={() => onLoadMelody(melody.melody_data)}>Load</button>
                <button onClick={() => onDeleteMelody(melody.id)}>Delete</button>
            </div>
        )
    }

    React.useEffect(() => {
        getMelodies();
    }, [name])

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