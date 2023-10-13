const createTour = document.querySelector(".create-tour");
const createButton = document.querySelector("#create-button");
const closeButton = document.querySelector(".close-button");

if (createTour) {
  function toggleModal() {
    createTour.classList.toggle("show-modal");
  }

  createButton.addEventListener("click", toggleModal);

  function windowOnClick(event) {
    if (event.target === createTour) {
      toggleModal();
    }
  }

  closeButton.addEventListener("click", toggleModal);
  window.addEventListener("click", windowOnClick);
}


// rank clear ----------------------------------
const checkbox = document.querySelector("#discheck");
const input = document.querySelector("#mmrfirst");
const inputBas = document.querySelector("#mmrlast");

if(input) {
  const toogleInput = function(e){
    input.disabled = e.target.checked;
    inputBas.disabled = e.target.checked;
  
    if (e.target.checked) {
      input.value = "";
      inputBas.value = "";
    }
  };
  
  toogleInput({target: checkbox});
  checkbox.addEventListener("change", toogleInput);
}
// ------------------------------------------------------

// Filter's custom range input

const rangeInput = document.getElementById('range')
if (rangeInput) {
  rangeInput.addEventListener('input',() => {
      const x = document.getElementById("range").value;
      const ele = document.getElementById("output");
      document.getElementsByName('slided')[0].value = 'true'
  
      switch (x) {
          case "0":
              ele.innerHTML = `<img class="slider-medals" src="img/Herald_medal.webp">`;
              ele.style.marginLeft = "-4%";
              break;
          case "14.28":
              ele.innerHTML = `<img class="slider-medals" src="img/Guardian_medal.webp">`;
              ele.style.marginLeft = "10.28%";
              break;
          case "28.56":
              ele.innerHTML = `<img class="slider-medals" src="img/Crusader_medal.webp">`;
              ele.style.marginLeft = "23.56%";
              break;
          case "42.84":
              ele.innerHTML = `<img class="slider-medals" src="img/Archon_medal.webp">`;
              ele.style.marginLeft = "36.84%";
              break;
          case "57.12":
              ele.innerHTML = `<img class="slider-medals" src="img/Legend_medal.webp">`;
              ele.style.marginLeft = "51.12%";
              break;
          case "71.4":
              ele.innerHTML = `<img class="slider-medals" src="img/Ancient_medal.webp">`;
              ele.style.marginLeft = "64.4%";
              break;
          case "85.68":
              ele.innerHTML = `<img class="slider-medals" src="img/Divine_medal.webp">`;
              ele.style.marginLeft = "77.68%";
              break;
          case "99.96":
              ele.innerHTML = `<img class="slider-medals" src="img/Immortal_medal.webp">`;
              ele.style.marginLeft = "91%";
              break;
      }
  })
}


//  Edit tournament info
const editTour = document.getElementsByName('editTour')[0]
const nameInput = document.getElementsByName('name')[0]
const dateInput = document.getElementsByName('startDate')[0]
const descriptionText = document.getElementsByName('description')[0]
const imageContainer = document.getElementsByClassName('info-header__image')[0]
//  minMMR maxMMR selects

const selectTeamPluses = document.getElementsByName('selectTeamPlus')
const addTeamPluses = document.getElementsByName('addTeamPlus')
const addGamePlus = document.getElementsByName('addGamePlus')[0]
const dateTimes = document.getElementsByClassName('timedate')
 
if(editTour) {
  selectTeamPluses.forEach(svgBtn => {
    svgBtn.addEventListener('click', () => {
      selectTeamPluses.forEach(svgBtn => {svgBtn.nextElementSibling.children[0].style.color = '#cacaca'})
      addTeamPluses.forEach(svgBtn => {svgBtn.style.display = 'block'})
      svgBtn.nextElementSibling.children[0].style.color = '#fff'
    })
  })
  addTeamPluses.forEach(svgBtn => {
    svgBtn.addEventListener('click', () => {
      addTeamPluses.forEach(svgBtn => {svgBtn.style.display = 'none'})
      selectTeamPluses.forEach(selectTeamPlus => {
        if (selectTeamPlus.nextElementSibling.children[0].style.color === 'rgb(255, 255, 255)') {
          selectTeamPlus.nextElementSibling.children[0].innerHTML = svgBtn.nextElementSibling.children[1].innerHTML
          selectTeamPlus.nextElementSibling.setAttribute('href', '/team/')
          // console.log(selectTeamPlus.nextElementSibling.children[0])
        }
        selectTeamPlus.nextElementSibling.children[0].style.color = '#cacaca'
      })
      // console.log(svgBtn.nextElementSibling.children[1].innerHTML);
    })
  })
  addGamePlus.addEventListener('click', () => {
    addGamePlus.insertAdjacentHTML(
      'beforebegin',`
        <div class="details">
          <div class="teams-match">
            <div class="team1">
              <svg name="selectTeamPlus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              <a>تیم 1 : <span>انتخاب کنید</span></a>
            </div>
            <span class="vs">Vs</span>
            <div class="team1">
              <svg name="selectTeamPlus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              <a>تیم 2 : <span>انتخاب کنید</span></a>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"/>
          </svg>
          <div class="timedate">
            <input class="editable" type="text" placeholder="تاریخ" dir="ltr"/>
            <input class="editable" type="text" placeholder="ساعت" dir="ltr"/>
          </div>
        </div>
      `
    )
    selectTeamPluses.forEach(svgBtn => {
      svgBtn.addEventListener('click', () => {
        selectTeamPluses.forEach(svgBtn => {svgBtn.nextElementSibling.children[0].style.color = '#cacaca'})
        addTeamPluses.forEach(svgBtn => {svgBtn.style.display = 'block'})
        svgBtn.nextElementSibling.children[0].style.color = '#fff'
      })
    })
  })
  editTour.addEventListener('click', () => {
    nameInput.classList.toggle('editable')
    dateInput.classList.toggle('editable')
    descriptionText.classList.toggle('editable')
    nameInput.disabled = !nameInput.disabled
    dateInput.disabled = !dateInput.disabled
    descriptionText.disabled = !descriptionText.disabled
    ;[...dateTimes].forEach(dateTime => {
      dateTime.children[0].disabled = !dateTime.children[0].disabled
      dateTime.children[1].disabled = !dateTime.children[1].disabled
    })

    const filteredGames = [...document.getElementsByClassName('details')]
      .filter(gameEle => {
        const validGame = gameEle.children[0].children[0].children[1].getAttribute('href') && 
        gameEle.children[0].children[2].children[1].getAttribute('href') &&
        gameEle.children[2].children[0].value !== '' &&
        gameEle.children[2].children[1].value !== ''
        if (!validGame) gameEle.remove()
        return validGame
      })
    if (nameInput.classList.contains('editable')) {
			imageContainer.children[0].style.display = 'none'
			imageContainer.children[1].style.display = 'block'
			addGamePlus.style.display = 'block'
      selectTeamPluses.forEach(svgBtn => svgBtn.style.display = 'block')
      ;[...dateTimes].forEach(dateTime => {
        dateTime.children[0] = !dateTime.children[0].classList.toggle('editable')
        dateTime.children[1] = !dateTime.children[1].classList.toggle('editable')
      })
		} else {
      imageContainer.children[0].style.display = 'block'
			imageContainer.children[1].style.display = 'none'
			addGamePlus.style.display = 'none'
      selectTeamPluses.forEach(svgBtn => svgBtn.style.display = 'none')
      const games = filteredGames.map(gameEle => {
        const game = {}
        game.team1 = { 
          teamId: gameEle.children[0].children[0].children[1].getAttribute('href').split('/')[2], 
          name: gameEle.children[0].children[0].children[1].children[0].innerHTML 
        }
        game.team2 = { 
          teamId: gameEle.children[0].children[2].children[1].getAttribute('href').split('/')[2], 
          name: gameEle.children[0].children[2].children[1].children[0].innerHTML 
        }
        game.dateTime = { 
          date: gameEle.children[2].children[0].value, 
          time: gameEle.children[2].children[1].value 
        }
        return game
      })

      // Sending new data to server
      const formData = new FormData()
			formData.append('name', nameInput.value)
			formData.append('startDate', dateInput.value)
			formData.append('description', descriptionText.value)
			formData.append('tournamentId', window.location.href.split('/')[4])
			formData.append('image', imageContainer.children[1].firstElementChild.files[0])
      //  minMMR maxMMR selects
			formData.append('games', JSON.stringify(games))
			fetch('/edit-tournament', {
				method: 'POST',
				headers: { 'csrf-token': csrf.value },
				body: formData,
			})
		}
  })
}

// Join tour req
const joinBtn = document.getElementsByName('joinTourReq')[0]

if (joinBtn) {
  joinBtn.addEventListener('click', () => {
    fetch('/dashboard/join-tour-req', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
      body: JSON.stringify({ tournamentId: window.location.href.split('/')[4] }),
    }).then(res => window.location.replace('/dashboard/notif')).catch(err => console.log(err))
  })
}