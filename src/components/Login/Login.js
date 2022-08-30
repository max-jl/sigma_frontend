import '../../res/styles/index.css';

import logo from "../../res/images/Logo-Vector-Graphics.svg";
import { request_code } from "../Auth/auth.tsx";

/**
 * Login page with 
 * @returns Login page react component
 */
function Login() {

    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;

    return (
        <div className="login">
            <img src={logo} />
            <hr></hr>
            <p>
                This is Sigma, an management and timetable application created for Sydney Boys Students. Press the Login button to sign in and begin. Please be sure to post your feedback in the feedback section.
            </p>
            <hr></hr>
            <button
                title="Login to Sydney Boys High"
                className="clickable_button"
                aria-label="login button"
                onClick={ () => request_code(client_id, client_secret) }
            >
                Login
            </button>
        </div>
    );
}

export default Login;