import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

import { get_data, get_tokens, request_refresh } from './components/Auth/auth.tsx';
import Home from './components/Home/Home';
import Loading from './components/Loading/Loading';
import Login from './components/Login/Login';

function UseMounted() {
    const [is_mounted, set_is_mounted] = useState(false);

    useEffect(() => {
        set_is_mounted(true);
    }, [])

    return is_mounted;
}

function App() {
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    
    let location = useLocation();
    const [page, change_page] = useState("loading");
    
    const is_mounted = UseMounted();

    useEffect(() => {

        const check_callback = async () => {
      
          const pathname = location.pathname;
    
          // startup function
          if (is_mounted === false && pathname !== "callback") {
    
            console.log("first render")
            const valid_refresh = await request_refresh(client_id, client_secret);
            
            // valid refresh token
            if (valid_refresh === true) {
              console.log("refresh success")
              change_page("home");
            }
        
            // need to get new refresh tokens
            if (valid_refresh === false) {
              console.log("refresh failed")
              change_page("login");
            }
    
          }
      
          // app has just recieved code after returning from API
          if (pathname === "/callback") {
    
            console.log("loading...")
            change_page("loading");
    
            const token_success = await get_tokens(client_id);
    
            // failed to get tokens
            if (token_success !== null && token_success === false) {
              console.log("token failure");
              change_page("login");
            }
    
            // success receiving tokens
            if (token_success !== null && token_success === true) {
    
              const data = await get_data();
              
              // failure fetching student data from SBHS API
              if (data !== null && data === false) {
                console.log("data fetching failure");
                change_page("login");
              }
    
              // successfully received student data
              if (data !== null) {
                console.log("success");
                console.log("data: ", data);
                tt = data.tt;
                dt = data.dt;
                change_page("home");
              }
    
            }
      
          }
          
        }
    
        check_callback();
        
      }, [location]);

    return (
        <div>
            {(page === "loading") && <Loading />}
            {(page === "login") && <Login />}
            {(page === "home") && <Home />}
        </div>
    );
}

export default App;