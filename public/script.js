function get_source(time_percent) {
    console.log('time_percent ', time_percent);


    const div_elem = document.createElement("div");
    const textnode = document.createTextNode('★');
    let style_attr = 'bottom: 5px; left: calc(' + time_percent + '% - 8px); user-select: auto; position: absolute ; width: 12px ; height: 17px ; padding-top: 30px ; background-size: cover ; background-position: bottom ; background-repeat: no-repeat ; cursor: pointer ; z-index: 27 ;';
    div_elem.setAttribute('style', style_attr);
    div_elem.appendChild(textnode);
    div_elem.addEventListener('click', clickBack);

    var elements = document.getElementsByClassName('ytp-progress-bar-container')[0];
    elements.appendChild(div_elem);


    return time_percent;
}

function clickBack(event) {
    console.log(event.x)
    console.log(event.y)
    
    console.log(window)
     var ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': event.x,
        'screenY': event.y
    });
    var el = document.elementFromPoint(event.x, event.y);
    el.dispatchEvent(ev);

}

chrome.extension.sendMessage({
    action: "getSource",
    source: get_source(config)
});
