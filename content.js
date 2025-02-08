console.log("Email Writer Extension Loaded");

function createAiButton(){
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    const button = document.createElement('div');
    button.className = 'T-I J-J5 aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML ='AI Reply';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Generate AI Reply');

    const dropdown = document.createElement('select');
    dropdown.style.marginLeft = '5px';
    dropdown.className = 'ai-reply-dropdown';
    const tones = ['Professional', 'Casual', 'Friendly', 'Concise', 'Detailed'];
    tones.forEach(tone => {
        const option = document.createElement('option');
        option.value = tone.toLowerCase();
        option.innerText = tone;
        dropdown.appendChild(option);
    });

    container.appendChild(button);
    container.appendChild(dropdown);
    
    return { container, button, dropdown };
}

function getEMailContent(){
    const selectors =[
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];

    for(const selector of selectors){
        const content = document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar(){
    const selectors =[
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for(const selector of selectors){
        const toolbar = document.querySelector(selector);
        if(toolbar){
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-container');
    if(existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if(!toolbar){
        console.log('Toolbar not found');
        return;
    }
    console.log('Found toolbar');
    
    const { container, button, dropdown } = createAiButton();
    container.classList.add('ai-reply-container');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;
            const emailContent = getEMailContent().trim();
            const selectedTone = dropdown.value;
            
            const response = await fetch('https://write-email-ai.onrender.com/email/generateResponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: selectedTone
                })
            });
            
            if (!response.ok) {
                throw new Error('API not working');
            }
            
            const generatedResponse = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText', false, generatedResponse);
            }else{
                console.log('Compose box not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });
    
    toolbar.insertBefore(container, toolbar.firstChild);
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
