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
const dateDiv = document.getElementsByClassName('info-header__data--details')[0]
const descriptionText = document.getElementsByName('description')[0]
const imageContainer = document.getElementsByClassName('info-header__image')[0]
const boRadios = document.getElementsByName('boRadio')
const dateTimes = document.getElementsByClassName('timedate')
const mmrdrops = document.getElementsByClassName('mmr')[0]
const mmrMedals = document.getElementsByClassName('mmr2')[0]
const prizeInput = document.getElementsByName('prizeInput')[0]
const mmrSelects = document.getElementsByTagName('select')
const gameEles = document.getElementsByClassName('details')
const maxEle = document.getElementsByClassName('max')[0]

const selectTeamPluses = document.getElementsByName('selectTeamPlus')
const addTeamPluses = document.getElementsByName('addTeamPlus')
const addGamePlus = document.getElementsByName('addGamePlus')[0]
const removeTeamBtns = document.getElementsByName('removeTeamBtns')
const removeGameBtns = document.getElementsByName('removeGameBtns')
const deleteFromTour = document.getElementsByName('deleteFromTour')[0]


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
          selectTeamPlus.nextElementSibling.setAttribute('href', svgBtn.nextElementSibling.children[1].getAttribute("href"))
        }
        selectTeamPlus.nextElementSibling.children[0].style.color = '#cacaca'
      })
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 fh">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"/>
          </svg>
          <div class="timedate">
            <input class="editable" type="datetime-local" value="<%= game.dateTime %>">
          </div>
          <svg name="removeTeamBtns" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 gh">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
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
  removeGameBtns.forEach(svgBtn => {
    svgBtn.addEventListener('click', () => {
      svgBtn.parentElement.parentElement.remove()
    })
  })
  let deletedTeam
  deleteFromTour.addEventListener('click', () => {
    toggleModal()
    fetch('/dashboard/remove-from-tour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
      body: JSON.stringify({ leaderId: deleteFromTour.previousElementSibling.value }),
    }).then(res => {
      if (res.status === 200) {
        deletedTeam.remove()
      }
    }).catch(err => console.log(err))
  })
  editTour.addEventListener('click', () => {
    const filteredGames = [...document.getElementsByClassName('details')]
      .filter(gameEle => {
        const validGame = gameEle.children[0].children[0].children[1].getAttribute('href') && 
        gameEle.children[0].children[2].children[1].getAttribute('href') &&
        gameEle.children[2].children[0].value !== ''
        if (!validGame) gameEle.remove()
        return validGame
      })
    if (!nameInput.classList.contains('editable')) {
      // Edit mode here
      console.log(editTour);
      editTour.innerHTML = 'ثبت اطلاعات'
      mmrdrops.style.display = 'flex'
      mmrMedals.style.display = 'none'
      boRadios[0].nextElementSibling.style.cursor = 'pointer'
      // radioBtn cursor pointer for span's before
      boRadios[1].nextElementSibling.style.cursor = 'pointer'
			imageContainer.children[0].style.display = 'none'
			imageContainer.children[1].style.display = 'block'
			maxEle.style.display = 'block'
			maxEle.previousElementSibling.style.display = 'none'
			dateDiv.children[1].style.display = 'none'
			dateDiv.children[2].style.display = 'block'
			addGamePlus.style.display = 'block'
      selectTeamPluses.forEach(svgBtn => svgBtn.style.display = 'block')
      removeTeamBtns.forEach(svgBtn => svgBtn.style.display = 'block')
      removeGameBtns.forEach(svgBtn => svgBtn.style.display = 'block')
      nameInput.classList.toggle('editable')
      nameInput.disabled = !nameInput.disabled
      descriptionText.classList.toggle('editable')
      descriptionText.disabled = !descriptionText.disabled
      prizeInput.classList.toggle('editable')
      prizeInput.disabled = !prizeInput.disabled
      boRadios[0].disabled = !boRadios[0].disabled
      boRadios[1].disabled = !boRadios[1].disabled
      ;[...gameEles].forEach(gameEle => {
        gameEle.children[2].children[0].disabled = !gameEle.children[2].children[0].disabled
        gameEle.children[2].children[0].classList.toggle('editable')
      })
		} else {
      maxEle.previousElementSibling.children[0].innerHTML = maxEle.children[1].value
      if (dateDiv.children[2].value !== '') {
        const newDate = new Date(dateDiv.children[2].value).toLocaleString('en-GB', {
          year: "numeric",
          month: "short",
          day: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
        })
        dateDiv.children[1].innerHTML = newDate.replaceAll(' ', '.').replaceAll(',.', ' - ')
      }
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
        game.dateTime = gameEle.children[2].children[0].value
        return game
      })
      // console.log(games);
      const formData = new FormData()
			formData.append('name', nameInput.value)
			formData.append('startDate', dateDiv.children[2].value)
			formData.append('description', descriptionText.value)
			formData.append('bo3', boRadios[1].checked)
			formData.append('prize', prizeInput.value)
			formData.append('teamCount', maxEle.children[1].value)
			formData.append('minMMR', mmrSelects[0].value)
			formData.append('maxMMR', mmrSelects[1].value)
			formData.append('tournamentId', window.location.href.split('/')[4])
			formData.append('image', imageContainer.children[1].firstElementChild.files[0])
			formData.append('games', JSON.stringify(games))
			fetch('/edit-tournament', {
				method: 'POST',
				headers: { 'csrf-token': csrf.value },
				body: formData,
			}).then(res => {
        if (res.status === 200 || res.status === 422 || res.status === 500) return res.json()
      }).then(data => {
        const alertEle = document.querySelector('.alert')
        alertEle.children[1].innerHTML = `
        <div class="alert-box__top">
					<p></p>
				</div>`
        alertEle.style.visibility = 'visible'
        alertEle.style.backgroundColor = '#FF2F3D'
        alertEle.children[0].style.backgroundColor = '#FF2F3D'
        alertEle.children[1].children[0].children[0].innerHTML = 'عملیات انجام نشد. لطفا بعدا امتحان کنید !'
        if(data.status === '422') {
          alertEle.children[1].children[0].children[0].innerHTML = 'اطلاعات وارد شده اشتباه بود !'
          const nameError = data.errors.find((error) => error.param === 'name')
          const startDateError = data.errors.find((error) => error.param === 'startDate')
          const bo3Error = data.errors.find((error) => error.param === 'bo3')
          const minMMRError = data.errors.find((error) => error.param === 'minMMR')
          const maxMMRError = data.errors.find((error) => error.param === 'maxMMR')
          const prizeError = data.errors.find((error) => error.param === 'prize')
          const teamCountError = data.errors.find((error) => error.param === 'teamCount')
          if (nameError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${nameError.msg}</p>`)
          if (startDateError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${startDateError.msg}</p>`)
          if (bo3Error) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${bo3Error.msg}</p>`)
          if (minMMRError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${minMMRError.msg}</p>`)
          if (maxMMRError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${maxMMRError.msg}</p>`)
          if (prizeError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${prizeError.msg}</p>`)
          if (teamCountError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${teamCountError.msg}</p>`)
          return
        }
        if(data.status === '200') {
          alertEle.children[1].children[0].children[0].innerHTML = 'ویرایش اطلاعات مسابقه با موفقیت انجام شد‌ !'
          alertEle.style.backgroundColor = '#3DFF2F'
          alertEle.children[0].style.backgroundColor = '#3DFF2F'

          editTour.innerHTML = 'تغییر اطلاعات'
          mmrdrops.style.display = 'none'
          mmrMedals.style.display = 'flex'
          boRadios[0].nextElementSibling.style.cursor = 'default'
          boRadios[1].nextElementSibling.style.cursor = 'default'
          imageContainer.children[0].style.display = 'block'
          imageContainer.children[1].style.display = 'none'
          maxEle.style.display = 'none'
          maxEle.previousElementSibling.style.display = 'block'
          dateDiv.children[1].style.display = 'block'
          dateDiv.children[2].style.display = 'none'
          addGamePlus.style.display = 'none'
          selectTeamPluses.forEach(svgBtn => svgBtn.style.display = 'none')
          removeTeamBtns.forEach(svgBtn => svgBtn.style.display = 'none')
          removeGameBtns.forEach(svgBtn => svgBtn.style.display = 'none')
          nameInput.classList.toggle('editable')
          nameInput.disabled = !nameInput.disabled
          descriptionText.classList.toggle('editable')
          descriptionText.disabled = !descriptionText.disabled
          prizeInput.classList.toggle('editable')
          prizeInput.disabled = !prizeInput.disabled
          boRadios[0].disabled = !boRadios[0].disabled
          boRadios[1].disabled = !boRadios[1].disabled
          ;[...gameEles].forEach(gameEle => {
            gameEle.children[2].children[0].disabled = !gameEle.children[2].children[0].disabled
            gameEle.children[2].children[0].classList.toggle('editable')
          })
          imageContainer.children[0].src = '../'+data.imageUrl
          return
        }
      }).catch(err => console.log(err))
		}
  })
  // Remove team confirmation button
  const count = document.querySelector('.count')
  const cross = document.querySelectorAll('.dh')
  const closeButton = document.querySelector('.close-button')
  function toggleModal() {
    count.classList.toggle('show-modal')
  }

  for (i = 0; i < cross.length; i++) {
    cross[i].addEventListener('click', function() {
      deletedTeam = this.parentElement.parentElement
      count.children[0].children[3].children[0].value = this.nextElementSibling.value
      return toggleModal()
    })
  }

  function windowOnClick(event) {
    if (event.target === count) {
      toggleModal()
    }
  }
  closeButton.addEventListener('click', toggleModal)
  window.addEventListener('click', windowOnClick)
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