// setting up event listener for all a tag which are going to submit forms
const submitLogout = document.getElementsByClassName('submitLogout')

for (let i = 0; i < submitLogout.length; i++) {
    submitLogout[i].addEventListener('click', () => {
        submitLogout[i].parentElement.submit()
    })
}

//  logout button
const csrf = document.getElementsByName('_csrf')[0]
const logoutBtn = document.getElementsByName('logoutBtn')[0]

if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
        fetch('/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
        }).then(res => {
            window.location.replace('/')
        }).catch(err => console.log(err))
    })
}

// name button open up
const loginAcc = document.getElementById('login-acc')
const openBar = document.getElementsByClassName('open__bar')[0]

if(loginAcc) {
    loginAcc.addEventListener('click', () => {
        openBar.classList.toggle('active');
    })
}

// Burger menu open/close
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".navbar__rightbox");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
    
    document.querySelectorAll(".navbar__right--link").forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));
}

// live search box functionality
const liveSearchInput = document.getElementsByName('liveSearchInput')[0]
const searchTypeInput = document.getElementsByName('searchType')[0]
const searchResultEle = document.getElementById('search-result-box')
const findPlayerBtns = document.getElementsByClassName('find-player__btns')[0]
const isTeams = findPlayerBtns ? true:false
const isIndex = document.getElementsByClassName('mySlides').length > 0? true:false

if(isIndex) liveSearchInput.addEventListener('keyup', () => {
    if (liveSearchInput.value !== '' && 
    liveSearchInput.value === liveSearchInput.value.match(/[a-zA-Z0-9\s]*/)[0]) 
    {
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
                    searchResultEle.insertAdjacentHTML( 'beforeend', `<a href="/team/${item._id}">
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
                    searchResultEle.insertAdjacentHTML( 'beforeend', `<a href="/tournament/${item._id}">
                        <li>
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
                        </li>
                    </a>`)
                } else if (data.searchType === 'player') {
                    searchResultEle.insertAdjacentHTML( 'beforeend', `<a href="/player/${item._id}">
                        <li>
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
                        </li>
                    </a>`)
                }
            })
            searchResultEle.parentNode.insertAdjacentHTML( 'afterend', `
                <a class="uli1__watch" href="/${data.searchType}s?search=${liveSearchInput.value}&rankFilter=0&filter=true&slided=false">مشاهده همه</a>
            `)
            const resultItemsEle = searchResultEle.childNodes
            for (let j = 0; j < resultItemsEle.length; j++) {
                resultItemsEle[j].addEventListener('click', () => {
                    liveSearchInput.value = searchResult[j].name
                    findPlayerBtns.children[0].setAttribute('href', '/player/'+searchResult[j]._id)
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

// Alert box close btn
const alertDiv = document.getElementsByClassName('alert')[0]

if(alertDiv) {
    alertDiv.children[0].addEventListener('click', function() {
        alertDiv.style.visibility = 'hidden'
    })
}