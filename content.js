console.log("Email Writer Extension Loaded");

function createAiButton(){
    const button = document.createElement('div');
    button.className = 'T-I J-J5 aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML ='AI Reply';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Genrate AI Reply');
    return button;
}


function getEMailContent(){
    const selectors =[
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentaion"]'
    ];

    for(const selector of selectors){
        const content = document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
        return '';
    }
}

function findComposeToolbaar(){
    const selectors =[
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for(const selector of selectors){
        const toolbaar = document.querySelector(selector);
        if(toolbaar){
            return toolbaar;
        }
        return null;
    }
}

function injectButton() {
   const existingButton = document.querySelector('.ai-repy-button');
   if(existingButton) existingButton.remove();

   const toolbaar = findComposeToolbaar();
   if(!toolbaar){
    console.log('toolbaar not found');
    return;
   }
   console.log('Found toolbaar');
   const button = createAiButton();
   button.classList.add('ai-repy-button');

   button.addEventListener('click',async() => {
    try {
        button.innerHTML='Genrating....'
        button.disabled = true;
        const emailContent = getEMailContent().trim();
        const response = await fetch('http://localhost:8080/email/generateResponse', {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                emailContent:emailContent,
                tone:"professionally"
            })
        });
        if(!response.ok){
            throw new Error('API not working');
        }
        const genratedResponse = await response.text();
        const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
        if(composeBox){
            composeBox.focus();
            document.execCommand('insertText' , false , genratedResponse);
        }else{
            console.log('compose box not found');
        }
    } catch (error) {
        console.error(error)
        alert('failed to genrate reply')
    }finally{
        button.innerHTML ='AI Reply';
        button.disabled = false;
    }
   });

   toolbaar.insertBefore(button , toolbaar.firstChild);

}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && (
                node.matches('.aDh, .btC, [role="dialog"]') ||
                node.querySelector('.aDh, .btC, [role="dialog"]')
            )
        );

        if (hasComposeElements) {
            console.log("Compose window detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
