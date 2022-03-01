/*global chrome*/

import React from 'react';

function Other() {

    function newTab(activeTab)
    {
        const newURL = 'https://www.youtube.com/'
        chrome.tabs.create({ url: newURL });
    }

    return (
        <div>
            여기는 유튜브가 아닙니다. 유튜브로 이동하세요.
            <div>
                <button onClick={newTab}>유튜브 바로가기</button>
            </div>
        </div>
    );
}

export default Other;
