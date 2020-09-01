import React from 'react'
import * as Requests from './requests.js'
import './MelodyList.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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

            <Container>
                <Row>
                    <Col xs lg="2">
                    1 of 3 hello world 
                    </Col>
                    <Col md="auto">1 of 3 hello world test test</Col>
                    <Col xs lg="2">
                    3 of 3
                    </Col>
                </Row>
                <Row>
                    <Col xs lg="2">1 of 3</Col>
                    <Col md="auto">Variable width content</Col>
                    <Col xs lg="2">
                    3 of 3
                    </Col>
                </Row>
            </Container>

                <b>{melody.title}</b>
                {" "+melody.date}
                <button className="loadButton" onClick={() => onLoadMelody(melody.melody_data)}>Load</button>
                <button className="deleteButton" onClick={() => onDeleteMelody(melody.id)}>Delete</button>
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