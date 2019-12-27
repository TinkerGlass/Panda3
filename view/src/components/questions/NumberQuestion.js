import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import PropTypes from "prop-types";

class NumberQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
            answer: this.props.defaultAnswer
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({answer: event.target.value},
            () => {this.props.onAnswer(this.state.answer)}
        );
    }

    render() {
        return (
            <Container>
                <Row>{this.state.title}</Row>
                <input type="number" className="form-control"
                       readOnly={this.props.readOnly}
                          value={this.state.answer}
                          onChange={this.handleChange}
                       placeholder="Enter a number"
                />
            </Container>
        );
    }
}

NumberQuestion.propTypes = {
    defaultAnswer: PropTypes.string,
    title: PropTypes.string,
    onAnswer: PropTypes.func,
    readOnly:PropTypes.bool
};

NumberQuestion.defaultProps = {
    defaultAnswer: '',
    title:'',
    readOnly:false
};

export default NumberQuestion;