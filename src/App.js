import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

import { get_data, request_refresh } from './components/Auth/auth.tsx';
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
    
            console.log("first render");

            let valid_refresh = request_refresh(client_id, client_secret);

              // refresh token is valid
              if (valid_refresh === true) {

                console.log("refresh success");
                let response = get_data();

                response.then((data) => {
                  
                  // successfully got data from API
                  if (data !== false && data !== undefined) {
                    console.log("data", data)
                    localStorage.removeItem("data");
                    localStorage.setItem("data", JSON.stringify(data));
                    change_page("home");
                  }

                  // failed to get data from API
                  else {
                    console.log("data fetch failed");
                    change_page("login");
                  }

                })

              }

              // invalid refresh token
              else {
                console.log("refresh failed");
                change_page("login");
              }

          }
      
          // app has just recieved code after returning from API
          if (is_mounted === false && pathname === "/callback") {
    
            console.log("loading...")
            change_page("loading");

            // after redirect
            let data = await get_data();

            // invalid response from SBHS API
            if (data === false || data === undefined) {
                console.log(data);
                console.log("data fetch failure");
                change_page("login");
            }
  
            // valid response from API
            else {
              console.log("data: ", data);
              localStorage.setItem("data", JSON.stringify(data));
              change_page("home");
            }

          }
          
        }
    
        check_callback();
        
      }, [location]);

    return (
        <div>
            {(page === "loading") && <Loading />}
            {(page === "login") && <Login />}
            {(page === "home") && <Home daily={JSON.parse(localStorage.getItem("data"))["dt"]} 
                                        weekly={JSON.parse(localStorage.getItem("data"))["tt"]}/>}
        </div>
    );
}

export default App;