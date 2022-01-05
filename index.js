const head = document.getElementById('head');
const root = document.getElementById('root');
const editor = document.getElementById('editor');

const prev = document.getElementById('prev');
const next = document.getElementById('next');

const properties = {
    'firstName': 'Имя',
    'lastName': 'Фамилия',
    'about': 'Описание',
    'eyeColor': 'Цвет глаз'
}

let visibleProperties = ['firstName', 'lastName', 'about', 'eyeColor'];
let sortedProperty = null;
let editableElement = null;

let page = 0;

function getProperty(element, property) {
    if (property == 'firstName' || property == 'lastName') {
        return element['name'][property];
    } 
    return element[property];
}

function setProperty(element, property, value) {
    if (property == 'firstName' || property == 'lastName') {
        element['name'][property] = value;
    } else {
        element[property] = value;
    }
}


function sort(property) {
    sortedProperty = property;
    renderHeader();

    const sortedData = data.slice();
    sortedData.sort((a, b) => {
        const propertyA = getProperty(a, property);
        const propertyB = getProperty(b, property);

        if (propertyA > propertyB) return 1;
        if (propertyA == propertyB) return 0;
        return -1;
    });
    renderTable(sortedData);
}

function renderHeader() {
    head.innerHTML = '';
    
    head.append(...visibleProperties.map((property) => {
        const header = document.createElement('th');
        let text = properties[property];
        if (property === sortedProperty) {
            text += '⬇';
        } 
        header.innerText = text;
        header.onclick = () => sort(property);
        return header;
    }));
}

function renderTable(data) {
    root.innerHTML = '';
    root.append(...data.slice(page*10, (page+1)*10).map((elem) => {
        const row = document.createElement('tr');
        row.onclick = () => edit(elem);
        row.append(...visibleProperties.map((property) => {
            const cell = document.createElement('td');
            cell.innerText = getProperty(elem, property);
            cell.className = property;
            return cell;
        }));
        return row;
    }));
}

function renderEditor() {
    const inputs = Object.keys(properties).flatMap((property) => {
        const label = document.createElement('label');
        label.innerText = properties[property];
        label.htmlFor = property;
        let input;
        if (property != 'about') {
            input = document.createElement('input');
            input.type = 'text';
        } else {
            input = document.createElement('textarea');
        }
        
        input.id = property;
        return [label, input];
    });
    const submit = document.createElement('input'); 
    submit.type = 'submit';
    submit.innerText = 'Редактировать';
    submit.onclick = (e) => {
        e.preventDefault();
        submitChanges();
    };
    editor.append(...inputs, submit);
}

function edit(elem) {
    Object.keys(properties).forEach((property) => {
        document.getElementById(property).value = getProperty(elem, property);
    });
    editableElement = elem;
}

function submitChanges() {
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === editableElement['id']) {
            Object.keys(properties).forEach((property) => setProperty(data[i], property, document.getElementById(property).value));
            renderSortedTable(data);
        }
    }
}

function renderSortedTable(data) {
    if (sortedProperty != '') {
        sort(sortedProperty);
    } else {
        renderTable(data);
    }
}

window.onload = () => {
    prev.onclick = () => {
        if (page <= 0) return;
        page--;
        renderSortedTable(data);
    };
    next.onclick = () => {
        if (page >= data.length / 10 - 1) return;
        page++;
        renderSortedTable(data);
    };

    renderHeader();
    renderTable(data);
    renderEditor();
};
