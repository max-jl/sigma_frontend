import { createHash, randomBytes } from 'crypto';
import { request } from 'https';
import { stringify } from 'querystring';

const site_url = "http://localhost:8000";
const redirect_url = "http://localhost:8000/callback";

const refresh_validity = 90 * 24 * 60 * 60 * 1000 - 10000;
const access_validity = 60 * 60 * 1000 - 10000;


/**
 * Requests authorisation code from SBHS API
 * @param client_id - App ID
 * @param client_secret - App secret
 */
export async function request_code(client_id: string, client_secret: string) {

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
export async function request_refresh(client_id: string, client_secret: string) {

    console.log("requesting refresh")
        
    // fetchs and access token and time when it was recieved from localstorage
    const refresh_timestamp = Number(localStorage.getItem("refresh_token_timestamp"));
    const refresh_token = localStorage.getItem("refresh_token");

    if (refresh_timestamp == null || refresh_token == null) {
        // no refresh token or refresh token is invalid
        return false;
    }

    if (Date.now() < (refresh_timestamp + refresh_validity)) {
        // refresh token is valid
        const post_data = stringify({
            refresh_token: refresh_token,
            grant_type: refresh_token,
            client_id: client_id,
            client_secret: client_secret
        });
        const http_options = {
            hostname: "student.sbhs.net.au",
            path: "/api/token",
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
            }
        };

        let promise = new Promise( (resolve, reject) => {
            const req = request(http_options, (res) => {
                res.setEncoding('utf8');
                var body = "";
                req.on("data", (data) => {
                    body += data;
                });
                req.on("end", () => {
                    resolve(body);
                })
            })
            req.write(post_data);
            req.end();
        })

        promise.then((result: any) => {
            localStorage.setItem("access_token", JSON.parse(result).access_token)
        })

        return true;
    }
    else {
        // invalid refresh token
        return false;
    }

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
    window.history.replaceState({}, "", "/");
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

    let response: any = await fetch(request_url, {
        method: "POST", 
        headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
        body: request_body
    })
    .catch((err) => {
        console.log(err);
    });

    let tokens = await response.json();

    if (tokens) {
        localStorage.setItem("access_token_timestamp", Date.now().toString());
        localStorage.setItem("access_token", tokens["access_token"]);
        localStorage.setItem("refresh_token_timestamp", Date.now().toString());
        localStorage.setItem("refresh_token", tokens["refresh_token"]);
    }

    localStorage.removeItem("code_verifier");
    localStorage.removeItem("state");

    console.log("token fetch complete")

    return true;

}

/**
 * Requests student data from SBHS API
 * @param ask - shorthand for required JSON from API
 * @returns Object with requested API data, false if function fails
 */
export async function fetch_data(ask: string) {

    console.log("beginning data fetch")
    const callables = {
        tt: 'timetable/timetable.json',
        ui: 'details/userinfo.json',
        wk: 'timetable/bells.json',
        dt: 'timetable/daytimetable.json',
        dn: 'dailynews/list.json'
    };

    
    let request_url = "https://student.sbhs.net.au/api/";
    let token = localStorage.getItem("access_token");
    
    if (token === null) {
        console.log("data fetch failed")
        return false;
    }
    else {
        token = "Bearer " + token;
    }

    let res: any = false;
    await fetch(request_url, {headers: new Headers({'Authorization': token})}).then(r => res=r).catch(e => console.log(e));

    if (!res.ok){
        console.log("data fetch failed")
        return false;
    }
    else {
        console.log("fetch successful", res.json())
        return res.json();
    }
}

/**
 * Fetchs all student data from SBHS API
 * @returns Object with all available API data, false if function fails
 */
export async function get_data() {

    let return_data: any;
    
    await Promise.all([
        fetch_data('tt').then((res) => {return_data.tt= res}).catch(() => {return false}),
        fetch_data('dt').then((res) => {return_data.dt= res}).catch(() => {return false}),
        fetch_data('wk').then((res) => {return_data.wk= res}).catch(() => {return false}),
        fetch_data('ui').then((res) => {return_data.ui= res}).catch(() => {return false}),
        fetch_data('dn').then((res) => {return_data.dn= res}).catch(() => {return false}),
    ])

    .catch((err) => {
        console.log(err);
        return false;
    })

    
    if (return_data !== undefined) {
        console.log(return_data)
        return return_data;
    }

}