const head = document.getElementById('head');
const root = document.getElementById('root');
const editor = document.getElementById('editor');
const toggler = document.getElementById('toggler');

/*
Создаем ссылки на DOM-элементы основых частей страницы, 
а также кнопок "Вперед" и "Назад"
*/

const prev = document.getElementById('prev');
const next = document.getElementById('next');

const properties = { 
    /*
    Словарь отображаемых названий полей
    */
    'firstName': 'Имя',
    'lastName': 'Фамилия',
    'about': 'Описание',
    'eyeColor': 'Цвет глаз'
}

//Список полей, отображаемых в данный момент в таблице

let visibleProperties = ['firstName', 'lastName', 'about', 'eyeColor'];

//При инициализации нет ни сортировки, ни редактирования
let sortedProperty = null;
let editableElementId = null;

//Начинаем отображение с первой страницы
let page = 0;


function getProperty(element, property) {
    /*
    Геттер, позволяющий использовать структуру как плоскую. 
    */
    if (property == 'firstName' || property == 'lastName') {
        return element['name'][property];
    } 
    return element[property];
}

function setProperty(element, property, value) {
    /*
    Сеттер, позволяющий использовать структуру как плоскую.
    */
    if (property == 'firstName' || property == 'lastName') {
        element['name'][property] = value;
    } else {
        element[property] = value;
    }
}

//Обработчик клика по заголовку колонки
function sort(property) {
    //Перерисуем заголовок, отобразив, по какому полю сортируем
    sortedProperty = property;
    renderHeader();

    //Сортируем по выбранному полю
    const sortedData = data.slice();
    sortedData.sort((a, b) => {
        const propertyA = getProperty(a, property);
        const propertyB = getProperty(b, property);

        if (propertyA > propertyB) return 1;
        if (propertyA == propertyB) return 0;
        return -1;
    });
    //Перерисуем тело таблицы
    renderTable(sortedData);
}

//Вызывается при клике по строке таблицы
function edit(elem) {
    //Перенесем в поля ввода значения 
    Object.keys(properties).forEach((property) => {
        document.getElementById(property).value = getProperty(elem, property);
    });
    editableElementId = elem.id;
}

//Создание заголовка таблицы
function renderHeader() {
    //Очистим прошлый возможный заголовок
    head.innerHTML = '';
    
    head.append(...visibleProperties.map((property) => {
        const header = document.createElement('th');
        let text = properties[property];

        //Отметим отсортированный столбец
        if (property === sortedProperty) {
            text += '⬇';
        } 

        header.innerText = text;
        header.onclick = () => {
            page = 0;
            sort(property);
        }
        return header;
    }));
}

//Создание тела таблицы
function renderTable(data) {
    //Очистим прошлую возможную таблицу
    root.innerHTML = '';

    //Берем текущую страницу по индексу page
    root.append(...data.slice(page*10, (page+1)*10).map((elem) => {
        const row = document.createElement('tr');
        row.onclick = () => edit(elem);
        row.append(...visibleProperties.map((property) => {
            const cell = document.createElement('td');
            const value = getProperty(elem, property);
            //Красим колонку с цветом 
            if (property === 'eyeColor') {
                cell.style = `background-color:${value}`;
            } else {
                cell.innerText = value;
            }
            cell.className = property;
            return cell;
        }));
        return row;
    }));
}

//Вызывается один раз при инициализации
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
    submit.id = 'submit';
    submit.value = 'Редактировать';
    submit.onclick = (e) => {
        e.preventDefault();
        submitChanges();
    };
    editor.append(...inputs, submit);
}

//Вызывается один раз при инициализации
function renderToggler() {
    toggler.append(...Object.keys(properties).map((property) => {
        const div = document.createElement('div');
        div.className = 'toggleCheckbox';

        const label = document.createElement('label');
        const id = `${property}Label`;
        label.htmlFor = id;
        label.innerText = properties[property];

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox'; checkbox.id = id; 
        checkbox.checked = true; //Изначально все поля отображаются
        checkbox.className = 'checkbox';

        checkbox.onchange = () => {
            //Перерисуем таблицу с новыми visibleProperties
            visibleProperties = Object.keys(properties).filter((prop) => {
                return document.getElementById(`${prop}Label`).checked;
            });
            renderSortedTable(data);
        };

        div.append(label, checkbox);
        return div;
    }));
}

//Обработчик submit формы
function submitChanges() {
    //Находим элемент с нужным id в цикле
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === editableElementId) {
            //С помощью сеттера перенесем значения из формы
            Object.keys(properties).forEach((property) => 
                setProperty(data[i], property, document.getElementById(property).value));
            renderSortedTable(data);
        }
    }
}

/*
Перерисовывает таблицу с учетом сортировки после изменения элемента и/или
списка отображаемых столбцов
*/
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
    renderToggler();
    renderEditor();
};
