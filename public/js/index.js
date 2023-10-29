// Lfp & Lft live feed
const socket = io();
const lfpDiv = document.getElementsByClassName('looking-for__player')[0]
const lftDiv = document.getElementsByClassName('looking-for__team')[0]
const canSend = document.getElementsByName('canSend')[0]

if(lfpDiv) {
  window.addEventListener('load', () => {
    const lfpSendBtn = document.getElementById('lfpSend')
    const ownedTeam = document.getElementsByName('ownedTeam')[0]

    let posSelect, rankSelect
    if (lfpSendBtn) {
      posSelect = lfpSendBtn.parentNode.getElementsByTagName('select')[0]
      rankSelect = lfpSendBtn.parentNode.getElementsByTagName('select')[1]
      for (let i = 0; i < lfpSendBtn.parentNode.getElementsByTagName('select').length; i++) {
        lfpSendBtn.parentNode.getElementsByClassName('select-selected')[i].addEventListener('click', () => {
          if(canSend.value === 'true' && posSelect.value !== 'null' && rankSelect.value !== 'null') {
            lfpSendBtn.classList.add('active-btn')
          }
        })
      }
      lfpSendBtn.addEventListener('click', function(e) {
        if(canSend.value === 'true' && posSelect.value !== 'null' && rankSelect.value !== 'null'){
          lftSendBtn.classList.remove('active-btn')
          lfpSendBtn.classList.remove('active-btn')
          canSend.value = 'false'
          fetch('/lf-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
            body: JSON.stringify({
              content: { name: ownedTeam.value, pos: posSelect.value, rank: rankSelect.value },
              type: 'lfp',
            })
          }).then(res => {
            if (res.status === 422 || res.status === 500 || res.status === 403 ) return res.json()
            if (res.status === 200 || res.status === 201) {
              throw 'success'
            }
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
          }).catch(err => console.log(err))
        }
      })
    }
    
    const lftSendBtn = document.getElementById('lftSend')
    let posSelectT, rankSelectT
    if (lftSendBtn) {
      posSelectT = lftSendBtn.parentNode.getElementsByTagName('select')[0]
      rankSelectT = lftSendBtn.parentNode.getElementsByTagName('select')[1]
      for (let i = 0; i < lftSendBtn.parentNode.getElementsByTagName('select').length; i++) {
        lftSendBtn.parentNode.getElementsByClassName('select-selected')[i].addEventListener('click', () => {
          if(canSend.value === 'true' && posSelectT.value !== 'null' && rankSelectT.value !== 'null') {
            lftSendBtn.classList.add('active-btn')
          }
        })
      }
      lftSendBtn.addEventListener('click', function(e) {
        if(canSend.value === 'true' && posSelectT.value !== 'null' && rankSelectT.value !== 'null'){
          lftSendBtn.classList.remove('active-btn')
          lfpSendBtn.classList.remove('active-btn')
          canSend.value = 'false'
          fetch('/lf-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'csrf-token': csrf.value },
            body: JSON.stringify({
              content: { name: undefined, pos: posSelectT.value, rank: rankSelectT.value },
              type: 'lft',
            })
          })
        }
      })
    }
    fetch('/lf-messages', {
        method: 'GET',
    }).then(res => res.json()).then(data => {
        for (let i = 0; i < data.messages.length; i++){
            addMessage(data.messages[i])
        }
    })
  })
  
  socket.on('lf-message', message => {
      addMessage(message)
  })
  
  function addMessage(message){
      const type = message.type
      const pos = message.content.split(' ')[0]
      const rank = message.content.split(' ')[1]
      const sender = message.sender
      if(type === 'lfp') {
          lfpDiv.insertAdjacentHTML( 'afterbegin', `<a href="/team/${sender.userId}" class="team">
              <div class="team-name">
                <p>${sender.name}</p>
              </div>
              <div class="more-of-team">
                <div class="player-rol">
                  <p>پوز ${pos}</p>
                </div>
                <div class="player-rank">
                  <img src="img/${rank}_medal.webp" alt="" />
                </div>
              </div>
            </a>`)
      } else {
          lftDiv.insertAdjacentHTML( 'afterbegin', `<a href="/player/${sender.userId}" class="player">
              <div class="player-name">
                <p>${sender.name}</p>
              </div>
              <div class="more-of-player">
                <div class="rol">
                  <p>پوز ${pos}</p>
                </div>
                <div class="rank">
                  <img src="img/${rank}_medal.webp" alt="" />
                </div>
              </div>
            </a>` )
      }
  }
}

// Slider picture change

let slideIndex = 0;
const slides = document.getElementsByClassName("mySlides");

showSlides();

function showSlides() {
  let i;
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1
  slides[slideIndex-1].style.display = "block";  
  setTimeout(showSlides, 5000);
}

// Custom select

const customSelects = document.getElementsByClassName("custom-select");
for (let i = 0; i < customSelects.length; i++) {
  const selectEle = customSelects[i].getElementsByTagName("select")[0];

  const chosenOptionEle = document.createElement("DIV");
  chosenOptionEle.setAttribute("class", "select-selected");
  chosenOptionEle.innerHTML = selectEle.options[selectEle.selectedIndex].innerHTML;
  customSelects[i].appendChild(chosenOptionEle);
  /*for each element, create a new DIV that will contain the option list:*/
  const newSelectEle = document.createElement("DIV");
  newSelectEle.setAttribute("class", "select-items select-hide");
  for (let j = 1; j < selectEle.length; j++) {
    /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
    const newOptionEle = document.createElement("DIV");
    newOptionEle.innerHTML = selectEle.options[j].innerHTML;
    newOptionEle.addEventListener("click", function(e) {
      /*when an item is clicked, update the original select box,
      and the selected item:*/
      for (let i = 0; i < selectEle.length; i++) {
        if (selectEle.options[i].innerHTML == this.innerHTML) {
          selectEle.selectedIndex = i;
          chosenOptionEle.innerHTML = this.innerHTML;
          const previousSelectedOption = newSelectEle.getElementsByClassName("same-as-selected");
          for (let k = 0; k < previousSelectedOption.length; k++) {
            previousSelectedOption[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      chosenOptionEle.click();
    });
    newSelectEle.appendChild(newOptionEle);
  }
  customSelects[i].appendChild(newSelectEle);
  chosenOptionEle.addEventListener("click", function(e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
}

function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  const arrNo = [];
  const newSelectEles = document.getElementsByClassName("select-items");
  const chosenOptionEle = document.getElementsByClassName("select-selected");
  for (let i = 0; i < chosenOptionEle.length; i++) {
    if (elmnt == chosenOptionEle[i]) {
      arrNo.push(i)
    } else {
      chosenOptionEle[i].classList.remove("select-arrow-active");
    }
  }
  for (let i = 0; i < newSelectEles.length; i++) {
    if (arrNo.indexOf(i)) {
      newSelectEles[i].classList.add("select-hide");
    }
  }
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);

// Features transform

const cardBox1 = document.querySelector('.card-box1');
window.addEventListener('scroll', () => {
    const target = cardBox1.getBoundingClientRect()
    if (target.top - target.height <= 0) {
        cardBox1.style.transform = 'translateY(-10%)';
        cardBox1.style.transition = 'all 1s ease-out';
        cardBox1.style.opacity = '1';
    }
})

const cardBox2 = document.querySelector('.card-box2');
window.addEventListener('scroll', () => {
    const target = cardBox2.getBoundingClientRect()
    if (target.top - target.height <= 0) {
        cardBox2.style.transform = 'translateY(-10%)';
        cardBox2.style.transition = 'all 1s ease-out';
        cardBox2.style.opacity = '1';
    }
})

const cardBox3 = document.querySelector('.card-box3');
window.addEventListener('scroll', () => {
    const target = cardBox3.getBoundingClientRect()
    if (target.top - target.height <= 0) {
        cardBox3.style.transform = 'translateY(-10%)';
        cardBox3.style.transition = 'all 1s ease-out';
        cardBox3.style.opacity = '1';
    }
})

const clickBtn = document.querySelector('#toptobotbtn')
const botBox = document.querySelector('.botbox')

clickBtn.addEventListener('click', () => {
	botBox.classList.toggle('active')
	botBox.classList.remove('unactive')
	if (
		clickBtn.children[0].getAttribute('d') === 'M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5'
	) {
		clickBtn.children[0].setAttribute('d', 'M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5')
	} else {
		botBox.classList.add('unactive')
		clickBtn.children[0].setAttribute('d', 'M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5')
	}
})