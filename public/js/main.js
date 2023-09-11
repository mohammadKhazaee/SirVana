const submitLogout = document.getElementsByClassName('submitLogout')

for (let i = 0; i < submitLogout.length; i++) {
    submitLogout[i].addEventListener('click', () => {
        submitLogout[i].parentElement.submit()
    })
}