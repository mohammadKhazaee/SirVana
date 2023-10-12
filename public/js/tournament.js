let createTour = document.querySelector(".create-tour");
let createButton = document.querySelector("#create-button");
let closeButton = document.querySelector(".close-button");

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


// rank clear ----------------------------------
var checkbox = document.querySelector("#discheck");
var input = document.querySelector("#mmrfirst");
var inputBas = document.querySelector("#mmrlast");

var toogleInput = function(e){
  input.disabled = e.target.checked;
  inputBas.disabled = e.target.checked;

  if (e.target.checked) {
    input.value = "";
    inputBas.value = "";
  }
};

toogleInput({target: checkbox});
checkbox.addEventListener("change", toogleInput);
// ------------------------------------------------------

// Filter's custom range input

const rangeInput = document.getElementById('range')

rangeInput.addEventListener('input',() => {
    var x = document.getElementById("range").value;
    var ele = document.getElementById("output");
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