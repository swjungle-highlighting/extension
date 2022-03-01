/*global chrome*/

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Main(props) {
    
    const server_addr = "http://143.248.193.175:5000";
    const [data, setData] = useState();

    function requestResult(url) {
        axios
          .post(server_addr + "/flask/hello", {
            url: url,
          })
          .then((response) => {
            chrome.extension.getBackgroundPage().console.log('foo');
            chrome.extension.getBackgroundPage().console.log(response.data);
            setData(JSON.stringify(response.data.bookmarker))
          })
          .catch((error) => {
          });
      }
      
      useEffect(()=>{
        requestResult(props.url)
      },[])

    return (
        <div>
            {props.url}
            <div>
                {data}
            </div>
        </div>
    );
}

export default Main;
