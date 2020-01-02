import React, {Component} from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    withRouter
} from "react-router-dom";
import UserManagement from "./UserManagement";
import AddUser from "./AddUser"
import SplitButton from "react-bootstrap/SplitButton";
import DropdownItem from "react-bootstrap/DropdownItem";
import RecruiterTests from "./RecruiterTests";
import TestCreator from "./TestCreator/TestCreator";
import Translator from "./Translator";
import PendingSubmissions from "./SubmissionManager/PendingSubmissions";
import TestChecker from "./SubmissionManager/TestChecker";
import { ReactSVG } from 'react-svg'
import Panda from '../../../resources/panda.svg';
import AccessManager from "./AccessManager";
import TestImporter from "./TestImporter";
import {getLanguages, getSynonyms} from "../../utils/Yandex";
import VirtualizedSelect from "react-virtualized-select";
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import SynonymViewer from "./SynonymViewer";
import {getSelectionText} from "../../utils/utils";

class RecruiterMainView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            error:null,
            languages:[],
            synonymsUrl:'/synonyms/',
            language:{label:'English', value:'en'},
        }
    }

    setSynonymsURL = () =>{
        let text = getSelectionText();
        this.setState((prevState) => ({
            synonymsUrl:'/synonyms/'+ prevState.language.value +'/'+ text
        }));
    };

    handleLanguage = (selectValue) => {
        this.setState({
            language:selectValue
        });
    };

    componentDidMount = async () => {
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

    render() {
        return (
            <Router>
                <Container fluid={true} style={{height:"100%"}}>
                    <Row className="d-flex top-menu">
                        <Col className="d-flex align-items-center" md="auto">Welcome, {this.props.username}</Col>
                        <Col md="auto">
                            <Link to="/users">
                            <SplitButton variant="primary" title={"Users"}>
                                <DropdownItem as="button"><Link to="/add-user">Add User</Link></DropdownItem>
                            </SplitButton></Link>
                        </Col>
                        <Col md="auto">
                            <Link to="/view-tests"><Button>View Tests</Button></Link>
                        </Col>
                        <Col md="auto">
                            <Link to="/test-creator"><Button>Test Creator</Button></Link>
                        </Col>
                        <Col md="auto">
                            <Link to="/import"><Button>Import tests</Button></Link>
                        </Col>
                        <Col className="d-flex align-items-center justify-content-end">
                            <div className="d-flex align-items-center">
                                <a href={this.state.synonymsUrl} target="_blank" rel="noopener noreferrer"><Button onClick={this.setSynonymsURL} className="mr-1">Get Synonyms in </Button></a>
                        <VirtualizedSelect
                            options={this.state.languages}
                            onChange={(selectValue) => this.handleLanguage(selectValue)}
                            value={this.state.language}
                            style={{minWidth:"8rem"}}
                        />
                        </div>
                        </Col>
                        <Col md="auto" className="d-flex align-items-center justify-content-end">
                            <ReactSVG className="panda" src={Panda}/>
                        </Col>
                    </Row>
                    <Switch>
                        <Route path="/users" component={UserManagement}/>
                        <Route path="/add-user" component={AddUser}/>
                        <Route path="/view-tests"><RecruiterTests/></Route>
                        <Route path="/test-creator" component={TestCreator}/>
                        <Route path="/modify-test/:id">{withRouter(TestCreator)}</Route>
                        <Route path="/translate/:id">{withRouter(Translator)}</Route>
                        <Route path="/submissions/:id">{withRouter(PendingSubmissions)}</Route>
                        <Route path="/check-test/:testId/:userId">{withRouter(TestChecker)}</Route>
                        <Route path="/manage-access/:id">{withRouter(AccessManager)}</Route>
                        <Route path="/import">{withRouter(TestImporter)}</Route>
                        <Route path="/synonyms/:lang/:text">{withRouter(SynonymViewer)}</Route>
                    </Switch>
                </Container>
            </Router>
        );
    }
}

export default RecruiterMainView;