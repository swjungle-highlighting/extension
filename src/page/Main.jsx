/*global chrome*/

import React from 'react';

function Main(props) {
    
    const serviceURL = 'localhost:3000';

    return (
        <div>
            {props.url}
            메인입니다.
        </div>
    );
}

export default Main;
