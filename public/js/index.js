// live search box functionality
const liveSearchInput = document.getElementsByName('liveSearchInput')[0]
const searchTypeInput = document.getElementsByName('searchType')[0]
const searchResultEle = document.getElementById('search-result-box')

liveSearchInput.addEventListener('keyup', () => {
    if (liveSearchInput.value !== '' && 
    liveSearchInput.value === liveSearchInput.value.match(/[a-zA-Z0-9\s]*/)[0]) 
    {
        // console.log(searchTypeInput.value)
        fetch('/search-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
            body: JSON.stringify({
                'searchInput': liveSearchInput.value,
                'searchType': searchTypeInput.value,
                'searchLimit': '6',
            })
        }).then(res => res.json()).then(data => {
            const searchResult = [...data.searchResult]
            searchResultEle.innerHTML = ''
            const watchAllBtn = document.getElementsByClassName('uli1__watch')[0]
            if (watchAllBtn) watchAllBtn.remove()
            searchResult.forEach(item => {
                if (data.searchType === 'team') {
                    searchResultEle.insertAdjacentHTML( 'beforeend', `<a href="#">
                        <li>
                            <p>${item.name}</p>
                            <div class="class-p">
                                <div class="p-image">
                                    <p class="p-image--row">
                                        <img src="img/${item.avgMMR}_medal.webp" alt="" />
                                    </p>
                                </div>
                            </div>
                        </li>
                    </a>`)
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
            searchResultEle.parentNode.insertAdjacentHTML( 'afterend', `
                <a class="uli1__watch" href="/${data.searchType}s?search=${liveSearchInput.value}&rankFilter=0&filter=true&slided=false">مشاهده همه</a>
            `)
            const resultItemsEle = searchResultEle.childNodes
            for (let j = 0; j < resultItemsEle.length; j++) {
                resultItemsEle[j].addEventListener('click', () => {
                    liveSearchInput.value = searchResult[j].name
                    searchResultEle.innerHTML = ''
                })
            }
        }).catch(err => console.log(err))
    } else if(liveSearchInput.value === '') {
        searchResultEle.innerHTML = ''
        const watchAllBtn = document.getElementsByClassName('uli1__watch')[0]
        if (watchAllBtn) watchAllBtn.remove()
    }
})

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
            fetch('/lf-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
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
            fetch('/lf-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
                body: JSON.stringify({
                    content: { name: undefined, pos: posSelectT.value, rank: rankSelectT.value },
                    type: 'lft',
                })
            })
        }
    })
    fetch('/lf-messages', {
        method: 'GET',
    }).then(res => res.json()).then(data => {
        for (let i = 0; i < data.messages.length; i++){
            addMessage(data.messages[i])
        }
    })
})

socket.on('lf-message', message => {
    addMessage(message)
})

function addMessage(message){
    const type = message.type
    const pos = message.content.split(' ')[0]
    const rank = message.content.split(' ')[1]
    const sender = message.sender
    if(type === 'lfp') {
        lfpDiv.insertAdjacentHTML( 'afterbegin', `<a href="#" class="team">
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
        lftDiv.insertAdjacentHTML( 'afterbegin', `<a href="#" class="player">
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
