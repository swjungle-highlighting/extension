/*global chrome*/

import React, { useEffect, useState } from "react";
import "./App.css";
import Other from "./page/Other";
import SiteHome from "./page/SiteHome";
import Youtube from "./page/Youtube";
import Header from "./page/Header";
import Twitch from "./page/Twitch";

function App() {
  const [url, setUrl] = useState("");
  const [isYoutube, SetIsYoutube] = useState("");

  /**
   * Get current URL
   */
  useEffect(() => {
    const queryInfo = { active: true, lastFocusedWindow: true };

    chrome.tabs &&
      chrome.tabs.query(queryInfo, (tabs) => {
        const currentURL = tabs[0].url;
        setUrl(currentURL);
        checkURL(currentURL);
      });
  }, []);

  /**
   * Check current URL
   */
  function checkURL(url) {
    if (!url.includes("youtube") && !url.includes("twitch")) {
      SetIsYoutube(1);
    } else if (
      url === "https://www.youtube.com/" ||
      url === "https://www.twitch.tv/"
    ) {
      SetIsYoutube(2);
    } else if (url.includes("youtube")) {
      SetIsYoutube(3);
    } else if (url.includes("twitch")) {
      SetIsYoutube(4);
    }
  }

  return (
    <div className="extenstion">
      <Header />
      {isYoutube === 1 ? <Other /> : null}
      {isYoutube === 2 ? <SiteHome /> : null}
      {isYoutube === 3 ? <Youtube url={url} /> : null}
      {isYoutube === 4 ? <Twitch url={url} /> : null}
    </div>
  );
}

export default App;
