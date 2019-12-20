import React, {Component} from 'react';
import {withAuthenticator} from "aws-amplify-react";
import {Auth} from 'aws-amplify';
import UserMainView from "./pages/candidate/UserMainView";

class HomeController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdmin: false
        }
    }

    componentDidMount = async () => {
        const session = await Auth.currentSession();
        const groups = session.getIdToken().decodePayload()['cognito:groups'];
        const username = session.getIdToken().payload['cognito:username'];
        this.setState(username);
        this.setState({isAdmin: groups && groups.includes('Admin')})
    };

    render() {
        const {isAdmin} = this.state;
        const {username} = this.state;
        if (isAdmin) {
            return;
        }
        return <UserMainView username={username}/>;
    }
}

//Czekamy na cognito
//export default withAuthenticator(HomeController, false)
export default HomeController;