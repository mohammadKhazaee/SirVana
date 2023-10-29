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
		if (detailsEle.style.display === 'none') {
			editProfile.children[1].innerText =
				editProfile.children[1].innerText === 'ثبت تغییرات' ? 'تغییر پروفایل' : 'ثبت تغییرات'
			textEle.disabled = !textEle.disabled
			textEle.classList.toggle('editable')
			detailsEle.removeAttribute('open')
			detailsEle.style.display = 'block'
			posP.style.display = 'none'
			profileAvatarDiv.children[0].style.display = 'none'
			profileAvatarDiv.children[1].style.display = 'block'
			inputArray.forEach((inputEle) => {
				if (inputEle.name === 'name' || inputEle.name === 'discordId' || inputEle.name === 'dota2Id' || inputEle.name === 'mmr' || inputEle.name === 'lftCheck')
					inputEle.disabled = !inputEle.disabled
				if (inputEle.name === 'name' || inputEle.name === 'discordId' || inputEle.name === 'dota2Id' || inputEle.name === 'mmr')
					inputEle.classList.toggle('editable')
				if (inputEle.name === 'lftCheck')
					lftCheckEle.style.cursor = lftCheckEle.style.cursor === 'default' ? 'pointer' : 'default'
			})
		} else {
			const pos = inputArray
			.filter((input) => input.checked && input.name !== 'lftCheck')
			.map((input) => input.value)
			.join('-')
			const formData = new FormData()
			formData.append('name', nameEle.value)
			formData.append('discordId', discordIdEle.value)
			formData.append('dota2Id', dota2IdEle.value)
			formData.append('bio', textEle.value)
			formData.append('pos', pos)
			formData.append('rank', mmrEle.value)
			formData.append('lft', lftCheckEle.checked ? true : false)
			formData.append('image', imageEle.files[0])
			fetch('/dashboard/edit-profile', {
				method: 'POST',
				headers: { 'csrf-token': csrf.value },
				body: formData,
			}).then(res => {
				if (res.status === 200 || res.status === 422 || res.status === 500 ) return res.json()
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
					const lftError = data.errors.find((error) => error.param === 'lft')
					const rankError = data.errors.find((error) => error.param === 'rank')
					const dota2IdError = data.errors.find((error) => error.param === 'dota2Id')
					if (nameError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${nameError.msg}</p>`)
					if (lftError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${lftError.msg}</p>`)
					if (rankError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${rankError.msg}</p>`)
					if (dota2IdError) alertEle.children[1].children[0].insertAdjacentHTML('afterend', `<p>${dota2IdError.msg}</p>`)
					return
				}
				if(data.status === '200') {
					alertEle.children[1].children[0].children[0].innerHTML = 'ویرایش پروفایل با موفقیت انجام شد‌ !'
					alertEle.style.backgroundColor = '#3DFF2F'
					alertEle.children[0].style.backgroundColor = '#3DFF2F'

					editProfile.children[1].innerText =
						editProfile.children[1].innerText === 'ثبت تغییرات' ? 'تغییر پروفایل' : 'ثبت تغییرات'
					textEle.disabled = !textEle.disabled
					textEle.classList.toggle('editable')
					detailsEle.removeAttribute('open')
					detailsEle.style.display = 'none'
					posP.style.display = 'block'
					profileAvatarDiv.children[0].style.display = 'block'
					profileAvatarDiv.children[1].style.display = 'none'
					inputArray.forEach((inputEle) => {
						if (inputEle.name === 'name' || inputEle.name === 'discordId' || inputEle.name === 'dota2Id' || inputEle.name === 'mmr' || inputEle.name === 'lftCheck')
							inputEle.disabled = !inputEle.disabled
						if (inputEle.name === 'name' || inputEle.name === 'discordId' || inputEle.name === 'dota2Id' || inputEle.name === 'mmr')
							inputEle.classList.toggle('editable')
						if (inputEle.name === 'lftCheck')
							lftCheckEle.style.cursor = lftCheckEle.style.cursor === 'default' ? 'pointer' : 'default'
					})
					medalImg.src = `img/${data.medal}_medal.webp`
					imageEle.parentElement.previousElementSibling.src = data.imageUrl
					return
				}
			}).catch(err => console.log(err))
		}
	})
}

// Send feed
const sendFeedBtn = document.getElementsByName('sendFeedBtn')[0]
const feedInput = document.getElementsByName('feedInput')[0]
const feedsContainer = document.getElementsByClassName('scroll-box')[0]

if (sendFeedBtn) {
	sendFeedBtn.addEventListener('click', function() {
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
									<input type="hidden" value="${data.feedId}">
									<input type="hidden" value="false">
								</div>
							</div>
							<div class="comments__box--bot">
								<div class="comments__box--bot-comment">
									<p>${data.feeds[0].content}</p>
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
			const deleteBtnEle = feedsContainer.children[0].children[0].children[0].children[0].children[1].children[0]	
			deleteBtnEle.addEventListener('click', function() {
				fetch('/dashboard/delete-feed', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
					body: JSON.stringify({ 
						url: window.location.href,
						isComment: this.nextElementSibling.nextElementSibling.value === 'true',
						userId: userId.value,
						feedId: this.nextElementSibling.value
					}),
				}).then(res => res.json()).then(data => {
					if(data.status === '200') {
						return deleteBtnEle.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
					}
					const alertEle = document.querySelector('.alert')
					alertEle.children[1].innerHTML = `
					<div class="alert-box__top">
						<p></p>
					</div>`
					alertEle.style.visibility = 'visible'
					alertEle.style.backgroundColor = '#FF2F3D'
					alertEle.children[0].style.backgroundColor = '#FF2F3D'
					alertEle.children[1].children[0].children[0].innerHTML = 'عملیات انجام نشد. لطفا بعدا امتحان کنید !'
					if(data.status === '403' || data.status === '404') {
						alertEle.children[1].children[0].children[0].innerHTML = data.errors
						return
					}
				}).catch(err => console.log(err))
			})
		})
		.catch((err) => console.log(err))
	})
}
		
// send Comment
const sendCommentBtns = document.getElementsByName('sendCommentBtn')
const deleteCommentBtns = document.getElementsByName('deleteCommentBtn')
const userId = document.getElementsByName('userId')[0]

for (let i = 0; i < sendCommentBtns.length; i++) {
	sendCommentBtns[i].addEventListener('click', function() {
		const commentInput = this.parentElement.children[0]
		const feedId = this.parentElement.children[2]
		fetch('/dashboard/send-feed-comment', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
			body: JSON.stringify({ 
				commentContent: commentInput.value, 
				userId: userId.value, 
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
								<input type="hidden" value="${data.commentId}">
								<input type="hidden" value="true">
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
			const deleteBtnEle = this.parentElement.previousElementSibling.children[0].children[0].children[1].children[0]
			deleteBtnEle.addEventListener('click', function() {
				fetch('/dashboard/delete-feed', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
					body: JSON.stringify({ 
						url: window.location.href,
						isComment: this.nextElementSibling.nextElementSibling.value === 'true',
						userId: userId.value,
						feedId: this.nextElementSibling.value
					}),
				}).then(res => res.json()).then(data => {
					if(data.status === '200') {
						return deleteBtnEle.parentElement.parentElement.parentElement.parentElement.remove()
					}
					const alertEle = document.querySelector('.alert')
					alertEle.children[1].innerHTML = `
					<div class="alert-box__top">
						<p></p>
					</div>`
					alertEle.style.visibility = 'visible'
					alertEle.style.backgroundColor = '#FF2F3D'
					alertEle.children[0].style.backgroundColor = '#FF2F3D'
					alertEle.children[1].children[0].children[0].innerHTML = 'عملیات انجام نشد. لطفا بعدا امتحان کنید !'
					if(data.status === '403' || data.status === '404') {
						alertEle.children[1].children[0].children[0].innerHTML = data.errors
						return
					}
				}).catch(err => console.log(err))
			})
			this.parentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
		})
		.catch((err) => console.log(err))
	})
}

// Delete comment btn

for (let i = 0; i < deleteCommentBtns.length; i++) {
	deleteCommentBtns[i].addEventListener('click', function() {
		fetch('/dashboard/delete-feed', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
			body: JSON.stringify({ 
				url: window.location.href,
				isComment: this.nextElementSibling.nextElementSibling.value === 'true',
				userId: userId.value,
				feedId: this.nextElementSibling.value
			}),
		}).then(res => res.json()).then(data => {
			if(data.status === '200') {
				if(data.isComment) return this.parentElement.parentElement.parentElement.parentElement.remove()
				return this.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
			}
			const alertEle = document.querySelector('.alert')
			alertEle.children[1].innerHTML = `
			<div class="alert-box__top">
				<p></p>
			</div>`
			alertEle.style.visibility = 'visible'
			alertEle.style.backgroundColor = '#FF2F3D'
			alertEle.children[0].style.backgroundColor = '#FF2F3D'
			alertEle.children[1].children[0].children[0].innerHTML = 'عملیات انجام نشد. لطفا بعدا امتحان کنید !'
			if(data.status === '403' || data.status === '404') {
				alertEle.children[1].children[0].children[0].innerHTML = data.errors
				return
			}
		}).catch(err => console.log(err))
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
					friendEle.nextElementSibling.style.display = 'none'
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
							<div class="players">
								<input type="hidden" value="${ resultItemsEle[j].children[0].children[1].value }">
								<input type="hidden" value="${ resultItemsEle[j].children[0].children[2].innerHTML }">
								<input type="hidden" value="${ resultItemsEle[j].children[0].children[0].value }">
								<a name="getPvMails" class="player">${ resultItemsEle[j].children[0].children[2].innerHTML }</a>
								<div style="display: none;" class="red-circle"></div>
							</div>
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

// dashboard setting
const isSetting = document.getElementsByClassName('password-edit__content').length > 0? true:false

if(isSetting) {
	// setting style
	const emailEditt = document.querySelector("#email-editt");
	const emailEdit = document.querySelector(".email-edit");
	const emailEditcontent = document.querySelector(".email-edit__content");
	const title = document.querySelector(".title");
	const passwordEditt = document.querySelector("#password-editt");
	const passwordEdit = document.querySelector(".password-edit");
	const passwordEditcontent = document.querySelector(".password-edit__content");
	const passtitle = document.querySelector(".pass-title");
	const bgc = document.querySelector("#bgc");
	const editBtn = document.querySelector(".edit-btn");
	const passEditBtn = document.querySelector(".pass-edit-btn");

	emailEditt.addEventListener("click", () => {
		emailEdit.classList.toggle("active");
		emailEditcontent.classList.toggle("active");
		title.classList.toggle("active");
	});

	passwordEditt.addEventListener("click", () => {
		passwordEdit.classList.toggle("active");
		passwordEditcontent.classList.toggle("active");
		passtitle.classList.toggle("active");
	});

	bgc.addEventListener("keyup", () => {
		editBtn.style.backgroundColor = "aqua";
		editBtn.style.color = "#000";
		editBtn.style.cursor = "pointer";
	})

	const email = document.getElementsByName('email')[0]
	const password = document.getElementsByName('pass')[0]
	const confirmPassword = document.getElementsByName('confirmPass')[0]

	password.addEventListener("keyup", () => {
		if (confirmPassword.value !== '') {
			passEditBtn.style.backgroundColor = "aqua";
			passEditBtn.style.color = "#000";
			passEditBtn.style.cursor = "pointer";
		}
	})
	confirmPassword.addEventListener("keyup", () => {
		if (password.value !== '') {
			passEditBtn.style.backgroundColor = "aqua";
			passEditBtn.style.color = "#000";
			passEditBtn.style.cursor = "pointer";
		}
	})
	
	// setting requests
	editBtn.addEventListener('click', function() {
		if(this.style.backgroundColor === 'aqua') {
			const formData = new FormData()
			formData.append('email', email.value)
			fetch('/dashboard/edit-email', {
				method: 'POST',
				headers: { 'csrf-token': csrf.value },
				body: formData,
			}).then(res => {
				if (res.status === 200 || res.status === 422 || res.status === 500 ) return res.json()
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
					alertEle.style.visibility = 'hidden'
					const emailError = data.errors.find((error) => error.param === 'email')
					if (emailError) {
						email.nextElementSibling.style.visibility= 'visible'
						email.nextElementSibling.innerHTML = '* '+ emailError.msg
					}
					return
				}
				if(data.status === '200') {
					alertEle.children[1].children[0].children[0].innerHTML = 'ایمیل شما با موفقیت ویرایش شد !'
					alertEle.style.backgroundColor = '#3DFF2F'
					alertEle.children[0].style.backgroundColor = '#3DFF2F'
					document.querySelector('.email-content').children[0].innerHTML = data.email
					emailEdit.classList.toggle("active");
					return
				}
			}).catch(err => console.log(err))
		}
	})

	passEditBtn.addEventListener('click', function() {
		if(this.style.backgroundColor === 'aqua') {
			const formData = new FormData()
			formData.append('password', password.value)
			formData.append('confirmPass', confirmPassword.value)
			fetch('/dashboard/edit-password', {
				method: 'POST',
				headers: { 'csrf-token': csrf.value },
				body: formData,
			}).then(res => {
				if (res.status === 200 || res.status === 422 || res.status === 500 ) return res.json()
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
					alertEle.style.visibility = 'hidden'
					const passError = data.errors.find((error) => error.param === 'password')
					if (passError) {
						password.nextElementSibling.style.display= 'block'
						password.nextElementSibling.innerHTML = passError.msg
					}
					const confirmPassError = data.errors.find((error) => error.param === 'confirmPass')
					if (confirmPassError) {
						confirmPassword.nextElementSibling.style.display= 'block'
						confirmPassword.nextElementSibling.innerHTML = confirmPassError.msg
					}
					return
				}
				if(data.status === '200') {
					alertEle.children[1].children[0].children[0].innerHTML = 'رمز شما با موفقیت ویرایش شد !'
					alertEle.style.backgroundColor = '#3DFF2F'
					alertEle.children[0].style.backgroundColor = '#3DFF2F'
					passwordEdit.classList.toggle("active");
					return
				}
			}).catch(err => console.log(err))
		}
	})
}

// Alert box close btn
const alertDiv = document.getElementsByClassName('alert')[0]

if(alertDiv) {
    alertDiv.children[0].addEventListener('click', function() {
        alertDiv.style.visibility = 'hidden'
    })
}