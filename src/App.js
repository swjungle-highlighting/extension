/*global chrome*/

import React, { useEffect, useState } from 'react';
import './App.css';
import Other from './page/Other';
import Youtube from './page/Youtube';
import Main from './page/Main';

function App() {
    const [url, setUrl] = useState('');
    const [isYoutube, SetIsYoutube] = useState('');

    /**
     * Get current URL
     */
    useEffect(() => {
        const queryInfo = { active: true, lastFocusedWindow: true };

        chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
            const currentURL = tabs[0].url;
            setUrl(currentURL);
            checkURL(currentURL)
        });
    }, []);

    /**
     * Check current URL
     */
    function checkURL(url) {
        if (!url.includes("youtube"))
        {
            SetIsYoutube(1)
        }
        else if (url === 'https://www.youtube.com/')
        {
            SetIsYoutube(2)
        }
        else
        {
            SetIsYoutube(3)
        }
    }

    return (
        <div className="App">
            {isYoutube === 1 ? <Other />:null}
            {isYoutube === 2 ? <Youtube />:null}
            {isYoutube === 3 ? <Main url={url} />:null}
        </div>
    );
}

export default App;
