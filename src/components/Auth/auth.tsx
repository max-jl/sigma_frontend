import { createHash, randomBytes } from 'crypto';

const site_url = "http://localhost:8000";
const redirect_url = "http://localhost:8000/callback";

const refresh_validity = 90 * 24 * 60 * 60 * 1000 - 10000;
const access_validity = 60 * 60 * 1000 - 10000;


/**
 * Requests authorisation code from SBHS API
 * @param client_id - App ID
 * @param client_secret - App secret
 */
export function request_code(client_id: string, client_secret: string) {

    console.log("getting code")

    function base64_url_encode(str: any) {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    function sha256(buffer: any) {
        return createHash('sha256').update(buffer).digest();
    }

    var verifier = base64_url_encode(randomBytes(32));
    var challenge = base64_url_encode(sha256(verifier));
    var state = base64_url_encode(randomBytes(16));
    
    localStorage.setItem("code_verifier", verifier);
    localStorage.setItem("state", state);

    const request_url = (
        "https://student.sbhs.net.au/api/authorize" +
        "?client_id=" + client_id +
        "&client_secret=" + client_secret + 
        "&response_type=code" +
        "&redirect_uri=" + redirect_url +
        "&scope=all-ro" +
        "&code_challenge=" + challenge + 
        "&code_challenge_method=S256" +
        "&state=" + state
        );

    // redirects to login URL
    window.location.assign(request_url);

}

/**
 * Attempts to get new access token using refresh token
 * @param client_id - App ID
 * @param client_secret - App secret
 * @returns True if access token successfully refreshed
 */
export function request_refresh(client_id: string, client_secret: string) {

    console.log("requesting refresh")
        
    // fetchs and access token and time when it was recieved from localstorage
    const refresh_timestamp = Number(localStorage.getItem("refresh_token_timestamp"));
    const access_timestamp = Number(localStorage.getItem("access_token_timestamp"));
    const refresh_token = localStorage.getItem("refresh_token");
    console.log("request_refresh tokens: ", refresh_token);

    // no refresh token
    if (refresh_token === null) {
         return false;
    }

    // refresh token has expired
    if (refresh_timestamp + refresh_validity < Date.now()) {
        localStorage.clear();
        return false;
    }

    // access token has expired, get new access token
    if (access_timestamp + access_validity < Date.now() || localStorage.getItem("access_token") === null) {

        localStorage.removeItem("access_token_timestamp");

        const request_body = (
            "grant_type=refresh_token" +
            "&redirect_uri=" + redirect_url +
            "&client_id=" + client_id +
            "&client_secret=" + client_secret
        );

        const request_url = ("https://student.sbhs.net.au/api/token");

        let promise = fetch(request_url, {
            method: "POST", 
            headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            body: request_body
        })

        promise.then((result: any) => {
            localStorage.setItem("access_token_timestamp", Date.now().toString());
            localStorage.setItem("access_token", JSON.parse(result).access_token);
        })
        
        promise.catch((err) => {
            console.log("Error: " + err);
            return false;
        })
        
        return true;

    }

    // access token is valid
    if (access_timestamp + access_validity > Date.now()) {
        return true;
    }

    // other error with tokens
    return false;

}

/**
 * Requests access and refresh tokens from SBHS API using code in URL params following redirect
 * @param client_id - ID for sigma app
 * @returns True when tokens are acquired, false otherwise
 */
export async function get_tokens(client_id: string) {

    console.log("getting tokens...")
    
    localStorage.removeItem("access_token_timestamp");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token_timestamp");
    localStorage.removeItem("refresh_token");
    
    const verifier = localStorage.getItem("code_verifier");
    const state = localStorage.getItem("state");

    const params = new URLSearchParams(window.location.search);
    console.log("params: " + params)
    console.log("state: " + state)
    console.log("verifier: " + verifier)
    
    // checks code is in returned url
    if (params.has("code") === false) {
        return false;
    }
    if (params.get("state") !== state) {
        return false;
    }

    const code = params.get("code");  
    console.log("code: " + code)
    
    const request_body = (
        "grant_type=authorization_code" +
        "&redirect_uri=" + redirect_url +
        "&client_id=" + client_id +
        "&code=" + code + 
        "&code_verifier=" + verifier);

    const request_url = ("https://student.sbhs.net.au/api/token");

    let response = await fetch(request_url, {
        method: "POST", 
        headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
        body: request_body
    })

    let tokens = await response.json();

    if (tokens) {
        localStorage.setItem("access_token_timestamp", Date.now().toString());
        localStorage.setItem("access_token", tokens["access_token"]);
        localStorage.setItem("refresh_token_timestamp", Date.now().toString());
        localStorage.setItem("refresh_token", tokens["refresh_token"]);
    }
            
    localStorage.removeItem("code_verifier");
    localStorage.removeItem("state");

    window.location.assign(site_url);

    console.log("token fetch complete");

    return true;

}

/**
 * Requests student data from SBHS API
 * @param ask - shorthand for required JSON from API
 * @returns Object with requested API data, false if function fails
 */
export async function fetch_data(ask: string) {

    console.log("beginning", ask, "fetch");

    const callables = {
        tt: 'timetable/timetable.json',
        ui: 'details/userinfo.json',
        wk: 'timetable/bells.json',
        dt: 'timetable/daytimetable.json',
        dn: 'dailynews/list.json'
    };

    
    let request_url = "https://student.sbhs.net.au/api/" + Object(callables)[ask];
    let token = localStorage.getItem("access_token");
    
    if (token === null) {
        console.log("data fetch failed")
        return false;
    }
    else {
        token = "Bearer " + token;
    }

    let res: any = await fetch(request_url, {headers: new Headers({'Authorization': token})})
    
    .catch((err) => {
        console.log(err);
        return false;
    });

    if (!res.ok) {
        localStorage.clear();
        return false;
    }
    
    const data: any = await res.json();
    
    if (data !== undefined) {
        console.log(ask, "fetch successful");
        return data;
    }
    else {
        return false;
    }
}

/**
 * Fetchs all student data from SBHS API
 * @returns Object with all available API data, false if function fails
 */
export async function get_data() {

    if (localStorage.getItem("access_token") === null) {
        const client_id = process.env.CLIENT_ID

        let res = await get_tokens(client_id);
        console.log("tokens: ", res)

        if (res === false) {
            return false;
        }
    }

    type Data = {
        [key: string]: any;
    }

    let return_data: Data = {};

    return_data['tt'] = await fetch_data('tt');
    return_data['dt'] = await fetch_data('dt');
    return_data['wk'] = await fetch_data('wk');
    return_data['ui'] = await fetch_data('ui');
    return_data['dn'] = await fetch_data('dn');
    
    for (let key in return_data) {
        if (return_data[key] === false) {
            return false;
        }
    }

    console.log("return data: ", return_data)
    return return_data;
    
}