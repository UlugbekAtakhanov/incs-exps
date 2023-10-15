const state = document.getElementById("state");
const currencySelector = document.getElementById("currencySelector");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const addBtn = document.getElementById("addBtn");

let incDataFromLS = JSON.parse(localStorage.getItem("incList")) || { total: 0, data: [] };
let expDataFromLS = JSON.parse(localStorage.getItem("expList")) || { total: 0, data: [] };

const currentDate = document.getElementById("currentDate");
const alert = document.getElementById("alert");

const incListElement = document.getElementById("incList");
const expListElement = document.getElementById("expList");

const incTotalElement = document.getElementById("incTotal");
const expTotalElement = document.getElementById("expTotal");
const diff = document.getElementById("diff");

// adding data onclicking
addBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (text.value && amount.value) {
        convertIntoUSD(currencySelector.selectedOptions[0].innerText, amount.value)
            .then((convertedData) => {
                console.log(convertedData);
                const dataToSaveToLS = {
                    id: new Date().getTime().toString(),
                    state: state.value,
                    currency: currencySelector.value,
                    currencyInUSD: convertedData.result,
                    text: text.value,
                    amount: amount.value,
                    date: getCurrentTimeAndDate(false),
                };
                if (state.value === "add") {
                    btnOnclickHandler(incListElement, incDataFromLS, dataToSaveToLS, incTotalElement);
                } else {
                    btnOnclickHandler(expListElement, expDataFromLS, dataToSaveToLS, expTotalElement);
                }
                text.value = "";
                amount.value = "";
                rest();
                invokeAlert("Added successfully!", "alert-success");
            })
            .catch((error) => console.log(error));
    } else {
        invokeAlert("Please fill the fields!", "alert-danger");
    }
});

// btn onclick handler
function btnOnclickHandler(listElement, dataFromLS, dataToSaveToLS, totalElement) {
    toggleNoData(listElement, "none");
    addToLS(listElement.id, dataFromLS, dataToSaveToLS);
    listElement.insertAdjacentElement("beforeend", createData(dataToSaveToLS));
    addToTotal(totalElement, dataFromLS);
}

// displaying data onload
window.addEventListener("DOMContentLoaded", () => {
    displayingData(incDataFromLS, "incList");
    displayingData(expDataFromLS, "expList");

    addToTotal(incTotalElement, incDataFromLS);
    addToTotal(expTotalElement, expDataFromLS);

    rest();

    currentDate.innerText = getCurrentTimeAndDate(true);
});

// fn for displaying data
function displayingData(data, elementId) {
    if (data.data.length) {
        toggleNoData(document.getElementById(elementId), "none");
        data.data.forEach((item) => {
            document.getElementById(elementId).append(createData(item));
        });
    }
}

// fn for creating data
function createData(item) {
    const div = document.createElement("div");
    div.id = item.id;
    div.className = "item-container";
    div.innerHTML = `
        <div class="item" >
                <div class="left">
                    <p>${item.text}</p>
                    <p id="currentDate">${item.date}</p>
                </div>
                <div class="right">
                    <p title="$${item.currencyInUSD}">${item.amount}</p>
                    <p>${item.currency}</p>
                    <svg id = "delete-btn" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
        </div>
        `;
    return div;
}

// fn for calculating total incs & exps
function addToTotal(elementName, dataList) {
    elementName.innerText = ` $ ${dataList.total.toFixed(2)}`;
}

// fn for calculating the diff
function rest() {
    diff.innerText = `$${(incDataFromLS.total - expDataFromLS.total).toFixed(2)}`;
}

// delete an element
window.addEventListener("click", (e) => {
    if (e.target.id === "delete-btn") {
        const elementToRemove = e.target.parentElement.parentElement.parentElement;
        const listName = elementToRemove.parentElement.id;
        const elementId = elementToRemove.id;
        if (elementToRemove.parentElement.querySelectorAll(".item-container").length === 1) {
            toggleNoData(elementToRemove.parentElement, "block");
        }
        if (listName === "incList") {
            removeFromLS(listName, elementId, incDataFromLS, incTotalElement);
        } else {
            removeFromLS(listName, elementId, expDataFromLS, expTotalElement);
        }
        elementToRemove.remove();
    }
});

// removing from localStorage
function removeFromLS(listName, elementId, dataFromLS, totalElement) {
    const deletingElement = dataFromLS.data.find((item) => item.id === elementId);
    dataFromLS.total = parseFloat(dataFromLS.total.toFixed(2)) - parseFloat(deletingElement.currencyInUSD.toFixed(2));
    dataFromLS.data = dataFromLS.data.filter((item) => item.id !== elementId);
    localStorage.setItem(listName, JSON.stringify({ ...dataFromLS, data: dataFromLS.data }));
    addToTotal(totalElement, dataFromLS);
    rest();
    invokeAlert("Deleted successfully!", "alert-danger");
}

// adding data to localStorage
function addToLS(listName, list, dataToSave) {
    list.total = parseFloat(list.total.toFixed(2)) + parseFloat(dataToSave.currencyInUSD.toFixed(2));
    list.data.push(dataToSave);
    return localStorage.setItem(listName, JSON.stringify(list));
}

// converting currency into USD
async function convertIntoUSD(fromCurrency, amount) {
    try {
        const resp = await fetch(
            `http://api.exchangerate.host/convert?access_key=ed4892eb21e5f757e196fb421656d394&from=${fromCurrency}&to=USD&amount=${amount}`
        );
        const data = await resp.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

// getting current date
function getCurrentTimeAndDate(state) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const newDate = new Date();
    const time = newDate.toLocaleTimeString("uz");
    const date = newDate.toLocaleDateString("uz");
    const currentMonth = newDate.getMonth();
    const currentDate = newDate.getDate();
    const currentDay = newDate.getDay();
    const currentYear = newDate.getFullYear();

    return state ? `${days[currentDay]} ${currentDate}, ${months[currentMonth]} ${currentYear}` : `${date} ${time} `;
}
getCurrentTimeAndDate();

// alert
const alertClasses = (elclass, alertState, time) => {
    return new Promise((resolve, _) => {
        alert.classList.add(elclass, alertState);
        setTimeout(() => {
            alert.className = "alert";
            resolve();
        }, time);
    });
};
const invokeAlert = (text, alertState) => {
    alert.innerText = text;
    alertClasses("alert-active", alertState, 3000).then(() => alertClasses("alert-remove", alertState, 1000));
};

// removing no-data
function toggleNoData(el, state) {
    const noData = el.querySelector("#no-data");
    if (noData) {
        noData.style.display = state;
    }
}
