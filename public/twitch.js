function get_source(timeList) {
  console.log("timeList ", timeList);

    var elements = document.getElementsByClassName('hwfGyC')[0];
    
    timeList.map((value, index) =>{
        const div_elem = document.createElement("div");
        const textnode = document.createTextNode('★');
        let style_attr = 'bottom: 30px; left: '+value+'%; transition-delay: 0ms; transition-duration: 100ms; transition-property: none; opacity: 1; color: var(--color-text-overlay) !important; display: flex !important; position: relative;  margin-left: -7px;';
        div_elem.setAttribute('style', style_attr);
        div_elem.appendChild(textnode);
        elements.appendChild(div_elem);
    })
    
    return timeList;
}

  return timeList;
}

chrome.extension.sendMessage({
  action: "getSource",
  source: get_source(config),
});


