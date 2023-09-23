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
const searchResultEle = document.getElementById('search-result-box')

for (let i = 0; i < liveSearchInputs.length; i++) {
    liveSearchInputs[i].addEventListener('keyup', () => {
        if (liveSearchInputs[i].value !== '' && 
        liveSearchInputs[i].value === liveSearchInputs[i].value.match(/[a-zA-Z0-9\s]*/)[0]) 
        {
            // console.log(searchTypeInput.value)
            fetch('/search-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'csrf-token': csrf },
                body: JSON.stringify({
                    'searchInput': liveSearchInputs[i].value,
                    'searchType': searchTypeInput.value,
                    'searchLimit': '6',
                })
            }).then(res => res.json()).then(data => {
                const searchResult = [...data.searchResult]
                searchResultEle.innerHTML = ''
                searchResult.forEach(item => {
                    if (data.searchType === 'team') {
                        searchResultEle.insertAdjacentHTML( 'beforeend', `<li>
                        <p>${item.name}</p>
                        <div class="class-p">
                            <div class="p-image">
                                <p class="p-image--row">
                                    <img src="img/${item.avgMMR}_medal.webp" alt="" />
                                </p>
                            </div>
                        </div>
                        </li>`)
                    } else if (data.searchType === 'tournament') {
                        searchResultEle.insertAdjacentHTML( 'beforeend', `<li>
                        <p>${item.name}</p>
                        <div class="class-p">
                            <div class="p-image">
                                <p class="p-image--row">
                                    <img src="img/${item.minMMR}_medal.webp" alt="" />
                                </p>
                                <p style="margin:0 0.5rem;">تا</p>
                                <p class="p-image--row">
                                    <img src="img/${item.maxMMR}_medal.webp" alt="" />
                                </p>
                            </div>
                        </div>
                        </li>`)
                    } else if (data.searchType === 'player') {
                        searchResultEle.insertAdjacentHTML( 'beforeend', `<li>
                        <p>${item.name}</p>
                        <div class="class-p">
                            <div class="p-pos">
                                <p>پوز : ${item.pos? `${item.pos}`:'ثبت نشده'}</p>
                            </div>
                            <div class="p-image">
                                <p class="p-image--row">
                                    ${item.mmr? `<img src="img/${item.mmr}_medal.webp" alt="" />`:'ثبت نشده'}
                                </p>
                            </div>
                        </div>
                        </li>`)
                    }
                })
            }).catch(err => console.log(err))
        } else if(liveSearchInputs[i].value === '') {
            searchResultEle.innerHTML = ''
        }
    })
}

// Lfp & Lft live feed
const socket = io();
const lfpDiv = document.getElementsByClassName('looking-for__player')[0]
const lftDiv = document.getElementsByClassName('looking-for__team')[0]

const lfpSendBtn = document.getElementById('lfpSend')
const teamSelect = lfpSendBtn.parentNode.getElementsByTagName('select')[0]
const posSelect = lfpSendBtn.parentNode.getElementsByTagName('select')[1]
const rankSelect = lfpSendBtn.parentNode.getElementsByTagName('select')[2]

const lftSendBtn = document.getElementById('lftSend')
const posSelectT = lftSendBtn.parentNode.getElementsByTagName('select')[0]
const rankSelectT = lftSendBtn.parentNode.getElementsByTagName('select')[1]

const canSend = document.getElementsByName('canSend')[0]

window.addEventListener('load', () => {
    for (let i = 0; i < lfpSendBtn.parentNode.getElementsByTagName('select').length; i++) {
        lfpSendBtn.parentNode.getElementsByClassName('select-selected')[i].addEventListener('click', () => {
            if(canSend.value === 'true' && teamSelect.value !== 'null' && posSelect.value !== 'null' && rankSelect.value !== 'null') {
                lfpSendBtn.classList.add('active-btn')
            }
        })        
    }
    for (let i = 0; i < lftSendBtn.parentNode.getElementsByTagName('select').length; i++) {
        lftSendBtn.parentNode.getElementsByClassName('select-selected')[i].addEventListener('click', () => {
            if(canSend.value === 'true' && posSelectT.value !== 'null' && rankSelectT.value !== 'null') {
                lftSendBtn.classList.add('active-btn')
            }
        })        
    }
    lfpSendBtn.addEventListener('click', function(e) {
        if(canSend.value === 'true' && teamSelect.value !== 'null' && posSelect.value !== 'null' && rankSelect.value !== 'null'){
            lftSendBtn.classList.remove('active-btn')
            lfpSendBtn.classList.remove('active-btn')
            canSend.value = 'false'
            fetch('http://localhost:3000/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'csrf-token': csrf },
                body: JSON.stringify({
                    content: { name: teamSelect.value, pos: posSelect.value, rank: rankSelect.value },
                    type: 'lfp',
                })
            })
        }
    })
    lftSendBtn.addEventListener('click', function(e) {
        if(canSend.value === 'true' && posSelectT.value !== 'null' && rankSelectT.value !== 'null'){
            lftSendBtn.classList.remove('active-btn')
            lfpSendBtn.classList.remove('active-btn')
            canSend.value = 'false'
            fetch('http://localhost:3000/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'csrf-token': csrf },
                body: JSON.stringify({
                    content: { name: undefined, pos: posSelectT.value, rank: rankSelectT.value },
                    type: 'lft',
                })
            })
        }
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
    const pos = message.content.split(' ')[0]
    const rank = message.content.split(' ')[1]
    const sender = message.sender
    if(type === 'lfp') {
        lfpDiv.insertAdjacentHTML( 'beforeend', `<a href="#" class="team">
						<div class="team-name">
							<p>${sender.name}</p>
						</div>
						<div class="more-of-team">
							<div class="player-rol">
								<p>پوز ${pos}</p>
							</div>
							<div class="player-rank">
								<img src="img/${rank}_medal.webp" alt="" />
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
								<p>پوز ${pos}</p>
							</div>
							<div class="rank">
								<img src="img/${rank}_medal.webp" alt="" />
							</div>
						</div>
					</a>` )
    }
}