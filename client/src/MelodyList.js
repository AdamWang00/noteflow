import React from 'react'
import * as Requests from './requests.js'
import './MelodyList.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const MelodyList = (props) => {
    const { update, name, onLoadMelody, onDeleteMelody, onShareMelody } = props;
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

    const renderHeader = () => {
        console.log(melodies)
        if (melodies === undefined || melodies.length === 0) return "Your saved melodies will appear here.";
        return (
            <Row className="justify-content-xs-center row">
                <Col xs="4">
                    <b>Title</b>
                </Col>
                <Col xs="4">
                    <b>Date saved</b>
                </Col>
            </Row>
        )
    }

    const renderMelody = (melody) => {
        return (
            <Row key={melody.id} className="justify-content-xs-center row">
                <Col xs="4" className="title">{melody.title}</Col>
                <Col xs="4" className="date">{melody.date}</Col>
                <Col xs="4">
                    <button className="loadButton" onClick={() => onLoadMelody(melody.melody_data)}>Load</button>{' '}
                    <button className="shareButton" onClick={() => onShareMelody(melody.id, melody.title)}>Share</button>{' '}
                    <button className="deleteButton" onClick={() => onDeleteMelody(melody.id)}>Delete</button>
                </Col>
                
            </Row>
        )
    }

    React.useEffect(() => {
        getMelodies();
    }, [name, update])

    if (melodies!==null) {
        return (
            <div className="MelodyList">
                <h3>Saved Melodies</h3>
                <Container fluid>
                    {renderHeader()}
                    {melodies.map(renderMelody)}
                </Container>
            </div>
        );
    } else {
        return null;
    }
};


export default MelodyList