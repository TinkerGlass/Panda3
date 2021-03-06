import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import PropTypes from "prop-types";

class OpenQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
            answer: this.props.defaultAnswer
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps, nextState,nextContent) {
        if (prevProps.title !== this.props.title) {
            this.setState({title: this.props.title})
        }
        if (prevProps.defaultAnswer !== this.props.defaultAnswer) {
            this.setState({answer: this.props.defaultAnswer})
        }
    }

    handleChange(event) {
        this.setState({answer: event.target.value},
            () => {this.props.onAnswer(this.state.answer)}
        );
    }

    render() {
        return (
            <Container>
                <Row className="mb-1">{this.state.title}</Row>
                <Row>
                    <textarea className="form-control-lg form-control"
                              value={this.state.answer}
                              readOnly={this.props.readOnly}
                              onChange={this.handleChange}/>
                </Row>
            </Container>
        );
    }
}

OpenQuestion.propTypes = {
    defaultAnswer: PropTypes.string,
    title: PropTypes.string,
    onAnswer: PropTypes.func,
    readOnly:PropTypes.bool
};

OpenQuestion.defaultProps = {
    defaultAnswer: '',
    title:'',
    readOnly:false
};
export default OpenQuestion;