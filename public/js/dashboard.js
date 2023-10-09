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
			.filter((input, i) => input.checked && input.name !== 'lftCheck')
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
		console.log(profileAvatarDiv.children[0]);
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