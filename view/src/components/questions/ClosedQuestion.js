import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import PropTypes, {arrayOf} from 'prop-types';

class ClosedQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: this.props.options,
            title: this.props.title,
            answers: this.props.defaultAnswer
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, index) {
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.answers[index] = event.target.checked;
        this.forceUpdate();
        this.props.onAnswer(this.state.answers);
    }

    render() {
        let options = this.state.options.map((option, index)=> {
            return <Row key={option} className="d-flex align-content-center justify-content-start">
                <input
                    checked={this.state.answers[index]}
                    onChange={(e) => this.handleChange(e, index)}
                    style={{width:"2rem", marginRight:"0.8rem"}}
                    className="form-control"
                    type="checkbox"/>
                <span  className="text-center" style={{width:"auto"}}>{option}</span>
            </Row>
        });
        return (
            <Container>
                <Row>{this.state.title}</Row>
                {options}
            </Container>
        );
    }
}

ClosedQuestion.propTypes = {
    defaultAnswer: PropTypes.arrayOf(PropTypes.bool),
    title: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    onAnswer: PropTypes.func
};

ClosedQuestion.defaultProps = {
    options:[],
    defaultAnswer: [false, false, false, false],
    title:''
};

export default ClosedQuestion;