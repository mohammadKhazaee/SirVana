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

// searchTypeInput.addEventListener('select', () => {
//     console.log(searchTypeInput.value);
// })

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
            }).then(res => res.json()).then(searchResult => {
                console.log(searchResult);
            }).catch(err => console.log(err))
        }
    })
}
