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

loginAcc.addEventListener('click', () => {
    openBar.classList.toggle('active');
})

