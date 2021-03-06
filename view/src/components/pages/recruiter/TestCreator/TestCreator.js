import React, {Component} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import update from 'immutability-helper';
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import TestCreatorQuestionController from "./TestCreatorQuestionController";
import QuestionTitleChooser from "./QuestionTitleChooser";
import ValidateTest from "./TestValidator";
import {removeByKey} from "../../../utils/utils";
import Alert from "react-bootstrap/Alert";
import {getLanguages, translateTest} from "../../../utils/Yandex";
import VirtualizedSelect from 'react-virtualized-select';
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import TranslationSpinner from "../../../fragments/TranslationSpinner";
import LoadingSpinner from "../../../fragments/LoadingSpinner";
import ApiHelper from "../../../utils/API";
import PropTypes from "prop-types";

class TestCreator extends Component{
    constructor(props) {
        super(props);
        this.state = {
            error:null,
            counter:0,
            translating:false,
            loading:true,
            languages:[],
            canSubmit:null,
            test: {
                title:'',
                language:{label:'English', value:'en'},
                questions: [
                    {
                        question:'',
                        type:'O',
                    }
                ]
            }
        };
    }

    componentDidMount = async () => {
        if(this.props.match.params.id !== undefined){
          await this.fetchTestData(this.props.match.params.id);
        }
        const languages = await getLanguages();
        try{
            const options = Object.keys(languages).map((key) => ({label:languages[key], value:key}));
            this.setState({
                languages: options,
                loading:false
        });
        } catch (e) {
            this.setState({
                error:true,
                loading:false
            })
        }
    };

    fetchTestData = async (id) => {
       await ApiHelper.getTestById(id).then(test =>
           this.setState({test:test})
       ).catch(() =>
           this.setState({
           error:true,
           loading:false
       }));
    };

    setTestType = (type) => {
        let t = type;
        if((!('answers' in this.state.test.questions[this.state.counter])) && this.state.test.questions[this.state.counter].type !== 'W'){
            this.setState((prevState) => ({
                test:update(prevState.test,{questions:{[prevState.counter]:{answers:{$set:Array(4).fill('')}}}})
            }));
        }
        this.setState((prevState) => ({
            test:update(prevState.test,{questions:{[prevState.counter]:{type: {$set:t}}}})
        }));
    };

    IncrementCounter = () => {
        this.setState((prevState) => ({
            counter: prevState.counter + 1
        }));
    };

    DecrementCounter = () => {
        this.setState((prevState) => ({
            counter: prevState.counter - 1
        }));
    };

    SubmitTest = async() => {
        let test = this.state.test;
        for(let i=0; i< test.questions.length;i++){
            if(test.questions[i].type !== 'W' &&'answers' in test.questions[i]){
                test.questions[i] = removeByKey(test.questions[i], 'answers')
            }
        }
        if(ValidateTest(test)){
            this.setState({
                canSubmit:true,
                loading:true
            });
            if(this.props.modify) await ApiHelper.updateTest(test, this.props.userId).then(() => this.props.history.push('/view-tests')).catch((e)=>alert(e));
                else {
                    await ApiHelper.createTest(test, this.props.userId).then(() => this.props.history.push('/view-tests')).catch((e)=>alert(e));
            }
        } else{
            this.setState({
                canSubmit:false,
                loading:false
            })
        }
    };

    handleTestTitle = (event) => {
        let val = event.target.value;
        this.setState((prevState) => ({
            test:update(prevState.test,{title: {$set:val}})
        }));
    };

    handleTestLanguage = (selectValue) => {
        if(selectValue != null) {
            this.setState({translating: true});
            let val = selectValue;
            translateTest(this.state.test, val).then((translatedTest) =>
                this.setState({
                    test: translatedTest,
                    translating: false
                })
            ).catch((error) => {
                console.log(error);
                this.setState((prevState) => ({
                    test: update(prevState.test, {language: {$set: val}}),
                    translating: false
                }))
            });
        } else {
            this.setState((prevState) => ({
                test: update(prevState.test, {language: {$set: null}}),
            }))
        }
    };

    handleQuestionTitle = (event) =>{
        let val = event.target.value;
        this.setState((prevState) => ({
            test:update(prevState.test,{questions:{[prevState.counter]:{question: {$set:val}}}})
        }));
    };

    deleteQuestion = () => {
        this.setState((prevState) => ({
            test:update(prevState.test,{questions:{$splice:[[prevState.counter, 1]]}})
        }));
        if(this.state.counter > 0){
            this.DecrementCounter();
        }
    };

    setQuestions = () => {
        let questions = this.state.test.questions;
        questions.push({
            question:'',
            type:'O'
        });
        this.setState((prevState) => ({
            test:update(prevState.test,{questions: {$set:questions}})
        }),() => this.IncrementCounter());
    };

    setClosedAnswers = (event) => {
        let val = event.target.value;
        let i = event.target.attributes['index'].value - 1;
        if(this.state.test.questions[this.state.counter].answers === undefined){
            this.setState(prevState => ({
                test:update(prevState.test,{questions:{[prevState.counter]:{answers: {$set:[]}}}})
            }))}
        this.setState((prevState) => ({
            test:update(prevState.test,{questions:{[prevState.counter]:{answers:{[i]: {$set:val}}}}})
        }));

    };

    setClosedAnswersLength = (numberOfAnswers) => {
        let val = numberOfAnswers;
        if(this.state.test.questions[this.state.counter].answers.length > val){
            let difference = this.state.test.questions[this.state.counter].answers.length - val;
            this.setState((prevState) => ({
                test:update(prevState.test,{questions:{[prevState.counter]:{answers:{$splice:[[val,difference]]}}}})
            }));
        } else if(this.state.test.questions[this.state.counter].answers.length < val){
            let difference = val - this.state.test.questions[this.state.counter].answers.length;
            this.setState((prevState) => ({
                test:update(prevState.test,{questions:{[prevState.counter]:{answers:{$push:Array(difference).fill('')}}}})
            }));
        }
    };

    getSubmitButton = () => {
        if(this.props.modify) return <Button variant="warning" size="lg" onClick={this.SubmitTest}>Edit Test</Button>;
        return <Button variant="success" size="lg" onClick={this.SubmitTest}>Submit Test</Button>;
    };

    render() {
        if(this.state.loading){
            return LoadingSpinner();
        } else if(this.state.translating){
            return TranslationSpinner();
        }
        else if(this.state.error){
            return ;
        }
        return <Container className="d-flex justify-content-between bg-items-color grayBorder m1rem" style={{ minHeight:"20rem", flexDirection:"column"}}>
            <div>
            <Row className="d-flex justify-content-between" style={{margin:"1rem"}}>
            <div className="d-flex"  style={{width:"auto", flexDirection:"column"}}>
                <label className="text-center">Enter test title:</label>
                <Form.Control
                    type="text"
                    className="d-flex"
                    onChange={(event => this.handleTestTitle(event))}
                    placeholder={"Sample title"}
                    value={this.state.test.title}
                    style={{width:"auto"}}
                    />
            </div>
                <div className="d-flex"  style={{width:"auto", flexDirection:"column"}}>
                    <label className="text-center">Choose Language:</label>
                    <VirtualizedSelect
                        options={this.state.languages}
                        onChange={(selectValue) => this.handleTestLanguage(selectValue)}
                        value={this.state.test.language}
                        style={{minWidth:"12rem"}}
                    />
                </div>
                <div className="d-flex"  style={{width:"auto", flexDirection:"column"}} >
                    <label className="text-center">Select question type:</label>
                    <ButtonGroup>
                        <Button variant="info" className="mr-1" onClick={() => this.setTestType('O')}>Open</Button>
                        <Button variant="info" onClick={() => this.setTestType('W')}>Closed</Button>
                        <Button variant="info" className="ml-1" onClick={() => this.setTestType('L')}>Number</Button>
                    </ButtonGroup>
                </div>
                <div className="d-flex"  style={{width:"auto", flexDirection:"column"}}>
                    <span className="d-flex">
                    Question {this.state.counter + 1} / {this.state.test.questions.length}
                    </span>
                    <Button variant="danger" disabled={this.state.test.questions.length === 1} onClick={this.deleteQuestion}>Delete this question</Button>
                </div>
            </Row>
            <Row className="d-flex" style={{marginLeft:"1rem", marginRight:"1rem"}}>
                <QuestionTitleChooser
                    value={this.state.test.questions[this.state.counter].question}
                    onChange={this.handleQuestionTitle}
                />
            </Row>
            </div>
            <TestCreatorQuestionController
                type={this.state.test.questions[this.state.counter].type}
                answers={this.state.test.questions[this.state.counter].answers}
                onChange={this.setClosedAnswers}
                onChangeOfNumberOfClosedAnswers={this.setClosedAnswersLength}
            />
            <Row className="justify-content-between" style={{margin:"1rem"}}>
                <Button onClick={this.DecrementCounter} disabled={this.state.counter === 0}>Previous</Button>
                {
                    this.state.counter + 1 < this.state.test.questions.length
                        ?<Button onClick={this.IncrementCounter}>Next</Button>
                        :<Button onClick={this.setQuestions} variant="info">Add new question</Button>
                }
            </Row>
            <Row className="justify-content-end" style={{margin:"1rem"}}>
                {this.getSubmitButton()}
            </Row>
            <Row className="justify-content-end" style={{margin:"1rem"}}>
                {
                    !this.state.canSubmit && this.state.canSubmit != null
                    ? <Alert variant="danger">Test contains empty data</Alert>
                        :null
                }
            </Row>
        </Container>
    }
}

TestCreator.propTypes = {
    modify: PropTypes.bool,
};

TestCreator.defaultProps = {
    modify: false,
};

export default TestCreator;