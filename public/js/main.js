// setting up event listener for all a tag which are going to submit forms
const submitLogout = document.getElementsByClassName('submitLogout')

for (let i = 0; i < submitLogout.length; i++) {
    submitLogout[i].addEventListener('click', () => {
        submitLogout[i].parentElement.submit()
    })
}

// live search box functionality
// const liveSearchInput = document.getElementsByClassName('liveSearchInput')

// for (let i = 0; i < liveSearchInput.length; i++) {
//     liveSearchInput[i].addEventListener('keyup', () => {
//         fetch()
//     })
// }