const csrf = document.getElementsByName('_csrf')[0]

// Edit profile
const editProfile = document.getElementsByName('editProfile')[0]
const inputEles = document.getElementsByTagName('input')
const textEle = document.getElementsByTagName('textarea')[0]
const medalImg = document.getElementsByName('medalImg')[0]
const summary = document.getElementsByName('summary')[0]
const nameEle = document.getElementsByName('name')[0]
const dota2IdEle = document.getElementsByName('dota2Id')[0]
const discordIdEle = document.getElementsByName('discordId')[0]
const mmrEle = document.getElementsByName('mmr')[0]
const imageEle = document.getElementsByName('image')[0]
const lftCheckEle = document.getElementsByName('lftCheck')[0]
const detailsEle = document.getElementsByTagName('details')[0]
const posP = document.getElementsByName('posP')[0]
const selectDropdown = document.getElementsByClassName('multiple-select-dropdown')[0]
const profileAvatarDiv = document.getElementsByClassName('midblock__left1--topimg')[0]

if (editProfile) {
	lftCheckEle.style.cursor = 'default'
	selectDropdown.addEventListener('click', () => {
		const inputArray = [...inputEles]
		const pos = inputArray
		.filter((input) => input.checked && input.name !== 'lftCheck')
		.map((input) => input.value)
		.join('-')
		if (pos === '1-2-3-4-5') {
			summary.innerText = 'همه'
			posP.innerText = 'همه'
		} else {
			summary.innerText = pos
			posP.innerText = pos
		}
	})
	editProfile.addEventListener('click', () => {
		const inputArray = [...inputEles]
		if (!inputEles[0].disabled) {
			const pos = inputArray
			.filter((input) => input.checked && input.name !== 'lftCheck')
			.map((input) => input.value)
			.join('-')
			const formData = new FormData()
			formData.append('name', nameEle.value)
			formData.append('pos', pos)
			formData.append('rank', mmrEle.value)
			formData.append('discordId', discordIdEle.value)
			formData.append('dota2Id', dota2IdEle.value)
			formData.append('lft', lftCheckEle.checked ? true : false)
			formData.append('bio', textEle.value)
			formData.append('image', imageEle.files[0])
			fetch('/dashboard/edit-profile', {
				method: 'POST',
				headers: { 'csrf-token': csrf.value },
				body: formData,
			})
			.then((res) => res.json())
			.then((data) => {
				medalImg.src = `img/${data.medal}_medal.webp`
			})
			.catch((err) => console.log(err))
		}
		editProfile.children[1].innerText =
		editProfile.children[1].innerText === 'ثبت تغییرات' ? 'تغییر پروفایل' : 'ثبت تغییرات'
		textEle.disabled = !textEle.disabled
		textEle.classList.toggle('editable')
		detailsEle.removeAttribute('open')
		
		if (detailsEle.style.display === 'none') {
			detailsEle.style.display = 'block'
			posP.style.display = 'none'
			profileAvatarDiv.children[0].style.display = 'none'
			profileAvatarDiv.children[1].style.display = 'block'
		} else {
			detailsEle.style.display = 'none'
			posP.style.display = 'block'
			profileAvatarDiv.children[0].style.display = 'block'
			profileAvatarDiv.children[1].style.display = 'none'
		}
		inputArray.forEach((inputEle) => {
			if (inputEle.name === 'name' || inputEle.name === 'discordId' || inputEle.name === 'dota2Id' || inputEle.name === 'mmr' || inputEle.name === 'lftCheck')
			inputEle.disabled = !inputEle.disabled
		if (inputEle.name === 'name' || inputEle.name === 'discordId' || inputEle.name === 'dota2Id' || inputEle.name === 'mmr')
		inputEle.classList.toggle('editable')
	if (inputEle.name === 'lftCheck')
	lftCheckEle.style.cursor = lftCheckEle.style.cursor === 'default' ? 'pointer' : 'default'
})
})
}

// Send feed
const sendFeedBtn = document.getElementsByName('sendFeedBtn')[0]
const feedInput = document.getElementsByName('feedInput')[0]
const feedsContainer = document.getElementsByClassName('scroll-box')[0]

if (sendFeedBtn) {
	sendFeedBtn.addEventListener('click', () => {
		fetch('/dashboard/send-feed', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
			body: JSON.stringify({ feedContent: feedInput.value }),
		})
		.then((res) => res.json())
		.then((data) => {
			feedInput.value = ''
			feedsContainer.insertAdjacentHTML(
				'afterbegin',`<div class="box-shadow">
					<div class="rightbox__bot--comments">
						<div class="comments__box">
							<div class="comments__box--top">
								<div class="comments__box--top-name">
									<span>${data.name}</span>
								</div>
								<div class="comments__box--top-reply">
									<a name="deleteFeedBtn">حذف</a>
								</div>
							</div>
							<div class="comments__box--bot">
								<div class="comments__box--bot-comment">
									<p>${data.feeds.pop().content}</p>
								</div>
							</div>
						</div>
					</div>
					<div class="comments__box--reply">
						<input name="commentInput" type="text" placeholder="پاسخ به این پست ..." />
						<a name="sendCommentBtn">ارسال</a>
					</div>
				</div>`
			)
		})
		.catch((err) => console.log(err))
	})
}
		
// send Comment
const sendCommentBtns = document.getElementsByName('sendCommentBtn')

for (let i = 0; i < sendCommentBtns.length; i++) {
	sendCommentBtns[i].addEventListener('click', function() {
		const commentInput = this.parentElement.children[0]
		const feedId = this.parentElement.children[2]
		const userId = '6513fb260f1a160fd02ecd1e'
		fetch('/dashboard/send-feed-comment', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
			body: JSON.stringify({ 
				commentContent: commentInput.value, 
				userId: userId, 
				feedId: feedId.value
			}),
		}).then((res) => res.json())
		.then((data) => {
			commentInput.value = ''
			this.parentElement.insertAdjacentHTML('beforebegin', `
				<div class="rightbox__bot--comments">
					<div class="comments__box">
						<div class="comments__box--top">
							<div class="comments__box--top-name">
								<span>${data.sender.name}</span>
							</div>
							<div class="comments__box--top-reply">
								<a name="deleteCommentBtn">حذف</a>
							</div>
						</div>
						<div class="comments__box--bot">
							<div class="comments__box--bot-comment">
								<p>${data.content}</p>
							</div>
						</div>
					</div>
				</div>`
			)
		})
		.catch((err) => console.log(err))
	})
}

// Recruit req btn
const recruitReq = document.getElementsByName('recruitReq')[0]

if (recruitReq) {
	recruitReq.addEventListener('click', () => {
		fetch('/dashboard/recruit-req', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
		body: JSON.stringify({ playerId: window.location.href.split('/')[4] }),
		}).then(res => window.location.replace('/dashboard/notif')).catch(err => console.log(err))
	})
}

// Remove notif
const deleteNotifBtn = document.getElementsByClassName('delete')

if (deleteNotifBtn) {
	[...deleteNotifBtn].forEach(btn => {
		btn.addEventListener('click', () => {
			fetch('/dashboard/delete-req', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
				body: JSON.stringify({ 
					reqId: btn.previousElementSibling.value, 
					reqInfo: { reqId: btn.previousElementSibling.previousElementSibling.value, userId: btn.previousElementSibling.previousElementSibling.previousElementSibling.value }
				}),
			}).then(res => btn.parentElement.remove()).catch(err => console.log(err))
		})
	})
}

// Accept&Reject notif
const accNotifs = document.getElementsByName('accNotif')
const rejNotifs = document.getElementsByName('rejNotif')

if(accNotifs) {
	accNotifs.forEach(accBtn => {
		accBtn.addEventListener('click', () => {
			let type
			switch (accBtn.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.value) {
				case 'accPlayer':
					type = 'player'
					break;
				case 'accRecruit':
					type = 'recruit'
					break;
				case 'accTeam':
					type = 'team'
					break;
			}
			fetch('/dashboard/accept-'+type, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
				body: JSON.stringify({ 
					reqId: accBtn.previousElementSibling.value,
					senderId: accBtn.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.value,
					reqInfo: { reqId: accBtn.previousElementSibling.previousElementSibling.value, userId: accBtn.previousElementSibling.previousElementSibling.previousElementSibling.value }
				}),
			}).then(res => {
				if (res.status == 200) {
					accBtn.parentElement.parentElement.remove()
				} else {
					console.log(res)
				}
			}).catch(err => console.log(err))
		})
	})
	rejNotifs.forEach(rejBtn => {
		rejBtn.addEventListener('click', () => {
			let type
			switch (rejBtn.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.value) {
				case 'accPlayer':
					type = 'player'
					break;
				case 'accRecruit':
					type = 'recruit'
					break;
				case 'accTeam':
					type = 'team'
					break;
			}
			fetch('/dashboard/reject-'+type, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
				body: JSON.stringify({ 
					reqId: rejBtn.previousElementSibling.previousElementSibling.value, 
					reqInfo: { reqId: rejBtn.previousElementSibling.previousElementSibling.previousElementSibling.value, userId: rejBtn.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.value }
				}),
			}).then(res => {
				if (res.status == 200) {
					rejBtn.parentElement.parentElement.remove()
				} else {
					console.log(res)
				}
			}).catch(err => console.log(err))
		})
	})

}

// Loads chats with chosen friend
const responsorEle = document.getElementsByClassName('reciever-name')[0]
const mailBox = document.getElementsByClassName('message-box')[0]
const noMessage = document.getElementById('noMessage')
const chooseFriend = document.getElementById('chooseFriend')
const liveSearchInput = document.getElementsByName('liveSearchInput')[0]
const searchResultEle = document.getElementById('search-result-box')
const isNotif = document.getElementsByClassName('out-messages__top').length > 0? true:false

if (isNotif) {
	const userId = document.getElementsByName('userId')[0]
	const sendChatBtn = document.getElementsByClassName('send-box')[0].children[0]
	const chatInput = document.getElementsByClassName('send-box')[0].children[1]
	let prevSocket, prevSocketId

	const setFriendsListener = () => {
		const getPvMails = document.getElementsByName('getPvMails')
		getPvMails.forEach(friendEle => {
			friendEle.addEventListener('click', () => {
				fetch(`/dashboard/mail/${friendEle.previousElementSibling.value}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				}).then(res => res.json()).then(mails => {
					if(mails.length > 0)
						mailBox.innerHTML = ''
					responsorEle.setAttribute('href', '/player/'+friendEle.previousElementSibling.value)
					responsorEle.style.display = 'flex'
					responsorEle.children[0].innerHTML = friendEle.previousElementSibling.previousElementSibling.value
					responsorEle.children[1].setAttribute('src', '../'+friendEle.previousElementSibling.previousElementSibling.previousElementSibling.value)
					const socket = io();
					if (prevSocket)	{
						prevSocket.on('disconnect', () => {
							console.log(`client disconnected ${prevSocketId}`);
							socket.emit('pvDisconnect', prevSocketId)
						});
						prevSocket.disconnect()
					}
					prevSocket = socket
					socket.on('sendPvMail', message => {
						mailBox.insertAdjacentHTML(
							'afterbegin',`
								<div class="${message.inComming? 'recieve':'send'}">
									<span class="send-time">${message.sentAt}</span>
									<p dir="${!message.inComming? 'ltr':'rtl'}">${message.content}</p>
								</div>
							`
						)
					})
					socket.on('connect', () => {
						prevSocketId = socket.id
						console.log(`client connected ${socket.id}`);
						socket.emit('pvConnect', userId.value, friendEle.previousElementSibling.value)
					})
					
					mails.forEach(message => {
						mailBox.insertAdjacentHTML(
							'afterbegin',`
								<div class="${message.inComming? 'recieve':'send'}">
									<span class="send-time">${message.sentAt}</span>
									<p dir="${!message.inComming? 'ltr':'rtl'}">${message.content}</p>
								</div>
							`
						)
					})
				}).catch(err => console.log(err))
			})
		})
	}
	window.addEventListener('beforeunload', (e) => {
		if (prevSocket){
			prevSocket.emit('pvDisconnect', prevSocketId)
			prevSocket.disconnect()
		}
	})
	setFriendsListener()

	sendChatBtn.addEventListener('click', () => {
		if(chatInput.value.trim() !== '')
			fetch('/dashboard/send-mail', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
				body: JSON.stringify({ 
					content: chatInput.value,
					responsorId: responsorEle.getAttribute('href').split('/')[2]
				}),
			}).then((res) => res.json())
			.then((message) => {
				chatInput.value = ''
				mailBox.insertAdjacentHTML(
					'afterbegin',`
						<div class="${message.inComming? 'recieve':'send'}">
							<span class="send-time">${message.sentAt}</span>
							<p dir="${!message.inComming? 'ltr':'rtl'}">${message.content}</p>
						</div>
					`
				)
				mailBox.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
			})
			.catch((err) => console.log(err))
	})
	// console.log(liveSearchInput);
	liveSearchInput.addEventListener('keyup', () => {
		if (liveSearchInput.value !== '' && 
		liveSearchInput.value === liveSearchInput.value.match(/[a-zA-Z0-9\s]*/)[0]) {
			searchType = liveSearchInput.nextElementSibling.value
			fetch('/search-result', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
				body: JSON.stringify({
					'searchInput': liveSearchInput.value,
					'searchType': searchType,
					'searchLimit': '6',
				})
			}).then(res => res.json()).then(data => {
				const searchResult = [...data.searchResult]
				searchResultEle.innerHTML = ''
				const friendsEle = document.getElementsByClassName('bot-box')[0]
				searchResult.forEach(item => {
					let isDupe = false
					for (let i = 0; i < friendsEle.getElementsByTagName('a').length; i++) {
						if(friendsEle.getElementsByTagName('a')[i].previousElementSibling.value == item._id.toString())
							isDupe = true
					}
					if(item._id.toString() === userId.value || isDupe ) return
					searchResultEle.insertAdjacentHTML( 'beforeend', `<li>
						<a>
							<input type="hidden" value="${item._id}">
							<input type="hidden" value="${item.imageUrl}">
							<p>${item.name}</p>
							<div class="class-p">
								<div class="p-image">
									<p class="p-image--row">
										${item.mmr? `<img src="../img/${item.mmr}_medal.webp" alt="" />`:'ثبت نشده'}
									</p>
								</div>
							</div>
						</a>
					</li>`)		
				})
				const resultItemsEle = searchResultEle.childNodes
				for (let j = 0; j < resultItemsEle.length; j++) {
					resultItemsEle[j].addEventListener('click', () => {
						liveSearchInput.value = resultItemsEle[j].children[0].children[2].innerHTML
						friendsEle.insertAdjacentHTML('afterbegin',`
							<input type="hidden" value="${ resultItemsEle[j].children[0].children[1].value }">
							<input type="hidden" value="${ resultItemsEle[j].children[0].children[2].innerHTML }">
							<input type="hidden" value="${ resultItemsEle[j].children[0].children[0].value }">
							<a name="getPvMails" class="players">${ resultItemsEle[j].children[0].children[2].innerHTML }</a>
						`)
						setFriendsListener()
						searchResultEle.innerHTML = ''
					})
				}
			}).catch(err => console.log(err))
		} else if(liveSearchInput.value === '') {
			searchResultEle.innerHTML = ''
		}
	})
}