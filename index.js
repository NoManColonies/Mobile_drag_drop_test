"use strict";
var cardStack;
var containers;
window.onload = () => {
    viewCard();
    readTextFile("member.json", (text) => {
        let data = JSON.parse(text);
        cardStack = new CardStack(data);
    });
    containers = document.querySelectorAll('.card__holder');
    containers.forEach((container) => {
        container.addEventListener('dragenter', dragEnter);
        container.addEventListener('dragover', dragOver);
        container.addEventListener('dragleave', dragLeave);
        container.addEventListener('drop', dragDrop);
    });
    // temporary for debugging
    /*
    let draggable = document.querySelector(".current__top__card")!;
    draggable.addEventListener('dragstart', dragStart);
    draggable.addEventListener('dragend', dragEnd);
    */
};
function viewCard(trigger) {
    let card1 = document.querySelector('.card__frame.first__cover');
    let card2 = document.querySelector('.card__frame.second__cover');
    let card3 = document.querySelector('.card__frame.third__cover');
    let title = document.querySelector('.titles__container');
    let button = document.querySelector('.next');
    let hamburger = document.querySelector('.circular__hamburger');
    card1.classList.toggle('pressed');
    card2.classList.toggle('pressed');
    card3.classList.toggle('pressed');
    title.classList.toggle('pressed');
    button.classList.toggle('pressed');
    hamburger.classList.toggle('visible');
    trigger ? trigger() : null;
}
;
const showDeck = () => {
    /*
    let card1 = document.querySelector('.current__top__card')!;
    let card2 = document.querySelector('.next__top__card')!;
    let card3 = document.querySelector('.last__top__card')!;

    toggleMultipleClass(card1, ["active__deck", "inactive__deck"]);
    toggleMultipleClass(card2, ["active__deck", "inactive__deck"]);
    toggleMultipleClass(card3, ["active__deck", "inactive__deck"]);
    */
    toggleMultipleClass(cardStack.currentView.toString(), ["active__deck", "inactive__deck"]);
    toggleMultipleClass(cardStack.nextOnQueue.toString(), ["active__deck", "inactive__deck"]);
    toggleMultipleClass(cardStack.waitOnQueue.toString(), ["active__deck", "inactive__deck"]);
};
const toggleMultipleClass = (element, classes) => {
    classes.forEach((e) => {
        element.classList.toggle(e);
    });
};
function expandCircle(element) {
    element.classList.add('invisible');
    element.parentElement.classList.add('expand');
    setTimeout(() => {
        element.parentElement.addEventListener('click', closeMenu);
        element.nextElementSibling.addEventListener('click', closeMenu);
    }, 100);
    element.nextElementSibling.classList.remove('invisible');
    let blurredBackground = document.querySelector('.blurred__background');
    blurredBackground.classList.add('visible');
    blurredBackground.addEventListener('click', closeMenu);
}
;
function closeMenu() {
    let menuTemplate = document.querySelector(".circular__hamburger");
    menuTemplate.classList.remove('expand');
    menuTemplate.removeEventListener('click', closeMenu);
    menuTemplate.children[0].classList.remove('invisible');
    menuTemplate.children[1].classList.add('invisible');
    menuTemplate.children[1].removeEventListener('click', closeMenu);
    let blurredBackground = document.querySelector('.blurred__background');
    blurredBackground.classList.remove('visible');
    blurredBackground.removeEventListener('click', closeMenu);
}
class CardStack {
    constructor(cardData) {
        this.deckContainer = document.querySelector('.member__deck');
        this.pushCard = (swipableCard) => {
            this.openingCards.push(swipableCard);
        };
        this.convertDataToCard = (datas) => {
            let card;
            let prevCard;
            datas.forEach((data) => {
                card = new SwipableCard(data.tName, data.fName, data.alt, data.junior, data.path, this.openingCards.length + 1);
                typeof prevCard !== typeof undefined ? prevCard.setNextCard(card) : null;
                typeof card !== typeof undefined ? card.setPrevCard(prevCard) : null;
                prevCard = card;
                this.pushCard(card);
            });
        };
        this.initialize = () => {
            this.openingCards.forEach((card) => {
                this.deckContainer.appendChild(card.toString());
            });
            this.dragInit();
            this.currentView.toString().classList.toggle("current__top__card");
            this.nextOnQueue.toString().classList.toggle("next__top__card");
            this.waitOnQueue.toString().classList.toggle("last__top__card");
        };
        this.dragInit = () => {
            this.currentView.toString().setAttribute("draggable", "true");
            this.currentView.toString().addEventListener('dragstart', dragStart);
            this.currentView.toString().addEventListener('dragend', dragEnd);
        };
        this.dragDisconnect = () => {
            this.currentView.toString().setAttribute("draggable", "false");
            this.currentView.toString().removeEventListener('dragstart', dragStart);
            this.currentView.toString().removeEventListener('dragend', dragEnd);
        };
        this.swipeUp = () => {
            if (typeof this.currentView.getNextCard() === typeof undefined) {
                return;
            }
            toggleMultipleClass(this.currentView.toString(), ["current__top__card", "passed__up"]);
            this.dragDisconnect();
            this.currentView = this.currentView.getNextCard();
            toggleMultipleClass(this.currentView.toString(), ["current__top__card", "next__top__card"]);
            this.dragInit();
            this.nextOnQueue = this.nextOnQueue.getNextCard();
            if (typeof this.nextOnQueue === typeof undefined) {
                return;
            }
            toggleMultipleClass(this.nextOnQueue.toString(), ["next__top__card", "last__top__card"]);
            this.waitOnQueue = this.waitOnQueue.getNextCard();
            if (typeof this.waitOnQueue === typeof undefined) {
                return;
            }
            toggleMultipleClass(this.waitOnQueue.toString(), ["last__top__card", "active__deck", "inactive__deck"]);
        };
        this.swipeDown = () => {
            if (typeof this.currentView.getPrevCard() === typeof undefined) {
                return;
            }
            toggleMultipleClass(this.currentView.toString(), ["next__top__card", "current__top__card"]);
            this.dragDisconnect();
            this.currentView = this.currentView.getPrevCard();
            this.dragInit();
            toggleMultipleClass(this.currentView.toString(), ["passed__up", "current__top__card"]);
            if (typeof this.nextOnQueue !== typeof undefined) {
                toggleMultipleClass(this.nextOnQueue.toString(), ["next__top__card", "last__top__card"]);
                this.nextOnQueue = this.nextOnQueue.getPrevCard();
            }
            else {
                this.nextOnQueue = this.currentView.getNextCard();
                return;
            }
            if (typeof this.waitOnQueue !== typeof undefined) {
                toggleMultipleClass(this.waitOnQueue.toString(), ["last__top__card", "inactive__deck", "active__deck"]);
                this.waitOnQueue = this.waitOnQueue.getPrevCard();
                return;
            }
            this.waitOnQueue = this.nextOnQueue.getNextCard();
        };
        this.openingCards = [];
        this.convertDataToCard(cardData);
        this.currentView = this.openingCards[0];
        this.nextOnQueue = this.openingCards[1];
        this.waitOnQueue = this.openingCards[2];
        this.initialize();
    }
}
class SwipableCard {
    constructor(name, FacebookName, nickName, juniorName, imgPath, index) {
        this.getNextCard = () => {
            return this.nextCard;
        };
        this.setNextCard = (nextCard) => {
            this.nextCard = nextCard;
        };
        this.getPrevCard = () => {
            return this.prevCard;
        };
        this.setPrevCard = (prevCard) => {
            this.prevCard = prevCard;
        };
        this.toString = () => {
            return this.card;
        };
        this.setClass = (Class) => {
            if (typeof Class == typeof String) {
                this.card.classList.add(Class);
            }
            else if (typeof Class == typeof Array()) {
                toggleMultipleClass(this.card, Class);
            }
        };
        this.genCard = () => {
            let cardFrame = document.createElement('div');
            cardFrame.classList.add('card__frame');
            cardFrame.classList.add('deck');
            cardFrame.classList.add('inactive__deck');
            cardFrame.setAttribute('data-index', this.index.toString());
            let img = document.createElement('img');
            img.setAttribute('src', this.imgPath);
            img.setAttribute('alt', this.nickName);
            cardFrame.appendChild(img);
            cardFrame.appendChild(this.newProp("Name: ", this.name));
            cardFrame.appendChild(this.newProp("Facebook: ", this.FacebookName));
            cardFrame.appendChild(this.newProp("Nick name: ", this.nickName));
            cardFrame.appendChild(this.newProp("Junior: ", this.juniorName));
            return cardFrame;
        };
        this.newProp = (prefix, value) => {
            let para = document.createElement('p');
            para.innerHTML = prefix + value;
            return para;
        };
        this.name = name;
        this.FacebookName = FacebookName;
        this.nickName = nickName;
        this.juniorName = juniorName;
        this.imgPath = imgPath;
        this.index = index;
        this.card = this.genCard();
    }
}
const readTextFile = (file, callback) => {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
};
function dragStart() {
    containers.forEach((container) => {
        container.classList.add("active");
    });
}
;
function dragEnd() {
    containers.forEach((container) => {
        container.classList.remove("active");
    });
}
;
function dragOver(e) {
    e.preventDefault();
}
;
function dragEnter(e) {
    e.preventDefault();
    this.classList.toggle("hover");
}
;
function dragLeave() {
    this.classList.toggle("hover");
}
;
function dragDrop() {
    // console.log(this.getAttribute("data-pos"));
    containers.forEach((container) => {
        container.classList.remove("active");
    });
    if (this.classList.contains("hover")) {
        this.classList.remove("hover");
    }
    if (this.getAttribute("data-pos") === "top") {
        cardStack.swipeUp();
    }
    else if (this.getAttribute("data-pos") === "bottom") {
        cardStack.swipeDown();
    }
    else {
        console.log("Failed to perform swipe.");
    }
}
;
