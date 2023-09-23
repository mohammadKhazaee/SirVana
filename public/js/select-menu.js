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