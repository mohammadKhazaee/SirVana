// setting up event listener for all a tag which are going to submit forms
const submitLogout = document.getElementsByClassName('submitLogout')

for (let i = 0; i < submitLogout.length; i++) {
    submitLogout[i].addEventListener('click', () => {
        submitLogout[i].parentElement.submit()
    })
}

// live search box functionality
const liveSearchInputs = document.getElementsByClassName('liveSearchInput')
const searchTypeInput = document.getElementsByName('searchType')[0]
const csrf = document.getElementsByName('_csrf')[0].value

for (let i = 0; i < liveSearchInputs.length; i++) {
    liveSearchInputs[i].addEventListener('keyup', () => {
        if (liveSearchInputs[i].value !== '' && 
        liveSearchInputs[i].value === liveSearchInputs[i].value.match(/[a-zA-Z0-9\s]*/)[0]) 
        {
            console.log(searchTypeInput.value)
            fetch('/search-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'csrf-token': csrf },
                body: JSON.stringify({
                    'searchInput': liveSearchInputs[i].value,
                    'searchType': searchTypeInput.value,
                    'searchLimit': '6',
                })
            }).then(res => res.json()).then(data => {
                for (let i = 0; i < data.searchResult.length; i++) {
                    console.log(data.searchResult[i]);
                }
            }).catch(err => console.log(err))
        }
    })
}

// Lfp & Lft live feed
const socket = io();
const lfpDiv = document.getElementsByClassName('looking-for__player')[0]
const lftDiv = document.getElementsByClassName('looking-for__team')[0]
window.addEventListener('load', () => {
    document.getElementById('sendMsg').addEventListener('click', () => {
        const message = { content: 'pos '+ Math.ceil(Math.random()*5), type: Math.random() > 0.5?'lfp':'lft' }
        fetch('http://localhost:3000/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'csrf-token': csrf },
        body: JSON.stringify({
            content: message.content,
            type: message.type,
        })
    })
    })
    fetch('http://localhost:3000/messages', {
        method: 'GET',
    }).then(res => res.json()).then(data => {
        for (let i = 0; i < data.messages.length; i++){
            addMessage(data.messages[i])
        }
    })
})

socket.on('message', message => {
    addMessage(message)
})

function addMessage(message){
    const type = message.type
    const content = message.content
    const sender = message.sender
    if(type === 'lfp') {
        lfpDiv.insertAdjacentHTML( 'beforeend', `<a href="#" class="team">
						<div class="team-name">
							<p>${sender.name}</p>
						</div>
						<div class="more-of-team">
							<div class="player-rol">
								<p>${content}</p>
							</div>
							<div class="player-rank">
								<img src="img/Divine_medal.webp" alt="" />
							</div>
						</div>
					</a>`)
    } else {
        lftDiv.insertAdjacentHTML( 'beforeend', `<a href="#" class="player">
						<div class="player-name">
							<p>${sender.name}</p>
						</div>
						<div class="more-of-player">
							<div class="rol">
								<p>${content}</p>
							</div>
							<div class="rank">
								<img src="img/Divine_medal.webp" alt="" />
							</div>
						</div>
					</a>` )
    }
}




