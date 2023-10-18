const createTeam = document.querySelector(".create-team");
const createButton = document.querySelector("#create-button");
const triggers = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");

if(createTeam){
  function toggleModal() {
    createTeam.classList.toggle("show-modal");
  }
  createButton.addEventListener("click", toggleModal);
  function windowOnClick(event) {
    if (event.target === createTeam) {
      toggleModal();
    }
  }
  closeButton.addEventListener("click", toggleModal);
  window.addEventListener("click", windowOnClick);
}


// Team info chat
const sendChat = document.getElementsByName('sendChat')[0]
const chatInput = document.getElementsByName('chatInput')[0]
const msgBox = document.getElementsByClassName('message-box')[0]

if (chatInput) {
  const socket = io();
  socket.on('team-chat', message => {
    if(!message.incomming) {
      msgBox.insertAdjacentHTML(
        'afterbegin',`
          <div class="send">
            <span class="send-time">${message.sentAt}</span>
            <p>${message.content}</p>
          </div>
        `
      )
    } else {
      msgBox.insertAdjacentHTML(
        'afterbegin',`
          <div class="recieve">
            <p>${message.sender.name}</p>
            <div class="content">
              <span class="send-time">${message.sentAt}</span>
              <p>${message.content}</p>
            </div>
          </div>
        `
      )
    }
  })
  sendChat.addEventListener('click', () => {
    fetch('/team-chat', {
      method: 'POST',
			headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
			body: JSON.stringify({ chatContent: chatInput.value, teamId: window.location.href.split('/')[4] }),
		})
    chatInput.value = ''
	})
}

//  Edit team info
const editTeam = document.getElementsByName('editTeam')[0]
const nameInput = document.getElementsByName('name')[0]
const nameTagInput = document.getElementsByName('nameTag')[0]
const bioText = document.getElementsByName('description')[0]
const imageContainer = document.getElementsByClassName('info-header__image')[0]
const lfpContainer = document.getElementsByClassName('team-need')[0]

if(editTeam) {
  editTeam.addEventListener('click', () => {
    nameInput.classList.toggle('editable')
    nameTagInput.classList.toggle('editable')
    bioText.classList.toggle('editable')
    nameInput.disabled = !nameInput.disabled
    nameTagInput.disabled = !nameTagInput.disabled
    bioText.disabled = !bioText.disabled
    lfpContainer.children[0].disabled = !lfpContainer.children[0].disabled
    lfpContainer.children[0].style.cursor = lfpContainer.children[0].style.cursor !== 'pointer' ? 'pointer' : 'default'
    if (nameInput.classList.contains('editable')) {
			imageContainer.children[0].style.display = 'none'
			imageContainer.children[1].style.display = 'block'
		} else {
			imageContainer.children[0].style.display = 'block'
			imageContainer.children[1].style.display = 'none'

      // Sending new data to server
      const formData = new FormData()
			formData.append('name', nameInput.value)
			formData.append('nameTag', nameTagInput.value)
			formData.append('description', bioText.value)
			formData.append('teamId', window.location.href.split('/')[4])
			formData.append('image', imageContainer.children[1].firstElementChild.files[0])
			fetch('/edit-team', {
				method: 'POST',
				headers: { 'csrf-token': csrf.value },
				body: formData,
			})
		}
  })

}

// Join team req
const joinBtn = document.getElementsByName('joinToTeam')[0]

if (joinBtn) {
  joinBtn.addEventListener('click', () => {
    fetch('/dashboard/join-req', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
      body: JSON.stringify({ teamId: window.location.href.split('/')[4] }),
    }).then(res => window.location.replace('/dashboard/notif')).catch(err => console.log(err))
  })
}