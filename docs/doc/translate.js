const Translate = {
	doc: ['Документация', 'Documentation'],
	"theme-label": ['Тема просмотровщика кода', 'Code viewer theme'],
	"library-description": [
		'Библиотека для двустороннего реактивного связывания JavaScript данных с DOM элементами. Для отслеживания Object он лениво-рекурсивно оборачивается в Proxy. Это значит, что вложенные Object\'ы и массивы будут заменены на свои Proxy только при необходимости. Вся реализация происходит в коде, нет никаких биндингов в HTML.',
		'Library for two-way reactive binding of JavaScript data with DOM elements. For observing Object, it is lazily-recursively wrapped in Proxy. This means that nested Objects and arrays will be replaced with their Proxy only when necessary. The entire implementation occurs in code, there are no bindings in HTML.'
	],
	"connect-text": ['Подключаем библиотеку', 'Connect the library'],
	"cdn-info": [
		'Сейчас, и наверное далее, будет использоваться только CDN для подключения библиотеки',
		'Now, and probably in the future, only CDN will be used to connect the library'
	],
	"create-app-text": ['Создаем экземпляр приложения:', 'Create application instance:'],
	"create-proxy-text": ['Создаем прокси объекта с данными:', 'Create proxy object with data:'],
	"create-binding-text": [
		'Создадим привязку поля объекта с текстовым элементом.',
		'Create binding of object field with text element.'
	],
	"arguments-title": ['Аргументы:', 'Arguments:'],
	"create-inputs-text": [
		'Создадим input элементы по количеству элементов в массиве (объекте) и каждому новому элементу будет установлен атрибут value',
		'Create input elements according to the number of elements in the array (object) and each new element will have the value attribute set'
	],
	"app-function-text": [
		'После того, как библиотека будет подключена в глобальной области видимости появится функция App, которая возвращает экземпляр приложения.',
		'After the library is connected, the App function will appear in the global scope, which returns an application instance.'
	],
	"warning-text": [
		'Следите за тем, чтобы не переназначить идентификатор App в глобальной области видимости',
		'Make sure not to reassign the App identifier in the global scope'
	],
	"configuration-text": [
		'При создании экземпляра приложения можно задать настройки определяющие правила работы данного экземпляра приложения. Указание настроек осуществляется путём указания флагов в аргументах функции App указанной выше. Идентификаторы флагов доступны как статические свойства объекта функции App. На данный момент доступны следующие флаги:',
		'When creating an application instance, you can set settings that determine the rules of operation for this application instance. Settings are specified by setting flags in the arguments of the App function mentioned above. Flag identifiers are available as static properties of the App function object. The following flags are currently available:'
	],
	"flags-warning": [
		'Флаги являются битовыми флагами, их можно сочетать с помощью операции битового оператора "ИЛИ" или арифметического сложения',
		'Flags are bit flags, they can be combined using the bitwise OR operator or arithmetic addition'
	],
	"bind-description": [
		'Простое двустороннее связывание. Отслеживает изменение поля объекта (массива) и меняет свойство value или textContent DOM элемента. Если поменять значение в DOM элементе - то изменится связанное поле объекта соответственно.',
		'Simple two-way binding. Observes changes in object (array) fields and changes the value or textContent property of the DOM element. If you change the value in the DOM element, the associated object field will change accordingly.'
	],
	"arguments-title3": ['Аргументы:', 'Arguments:'],
	"alternative-text": ['Возможен такой вариант:', 'This option is possible:'],
	"xrbind-description": [
		'Расширенное двустороннее связывание. Принцип действия аналогичен bind.',
		'Extended two-way binding. The principle of operation is similar to bind.'
	],
	"implementation-text": [
		'Реализация метода bind методом xrBind:',
		'Implementation of the bind method using xrBind:'
	],
	"repeat-description": [
		'Метод копирования DOM объекта по количеству элементов итерируемого объекта, также устанавливает привязки.',
		'Method for copying DOM objects according to the number of elements in the iterable object, also sets bindings.'
	],
	"three-args-title": [
		'Аргументы для реализации с тремя аргументами:',
		'Arguments for implementation with three arguments:'
	],
	"four-args-title": [
		'Аргументы для реализации с четырьмя аргументами (аналогично xrBind):',
		'Arguments for implementation with four arguments (similar to xrBind):'
	],
	"usage-options": [
		'Есть варианты использовать данный метод для создания элементов без привязок и реактивности:',
		'There are options to use this method for creating elements without bindings and reactivity:'
	],
	"note1": [
		'В методах xrBind и repeat с 4 аргументами: в аргументе-функции в которой указываем привязку DOM элемента к JS данным (3-й аргумент) нужно в коде читать поле JS объекта, чтобы сработал перехват Proxy и связал нужное поле JS объекта. Этого можно не делать, тогда будет отсутствовать привязка JS данных с DOM объектом.',
		'In xrBind and repeat methods with 4 arguments: in the function argument where we specify the binding of the DOM element to JS data (3rd argument), you need to read the JS object field in the code so that the Proxy interception works and links the required JS object field. This can be omitted, then there will be no binding of JS data with the DOM object.'
	],
	"note2": [
		'Можно использовать все методы для заполнения данными DOM элементов без каких либо привязок и реактивности, достаточно использовать в качестве источника данных неотслеживаемый JS объект (не использовать App.buildData)',
		'You can use all methods to fill DOM elements with data without any bindings and reactivity, just use a non-observed JS object as the data source (do not use App.buildData)'
	],
	"selector-list": ['Селектор или сам DOM элемент', 'The selector or the DOM element itself'],
	"func-li1": ['Функция возвращающая значение из JS объекта к которому привязываемся', 'A function that returns a value from the JS object that we are linking to'],
	"list-2-2": ['Функция возвращающая итерируемый объект по которому будем повторять выше указанный DOM элемент', 'A function that returns an iterable object that we will use to repeat the above DOM element.'],
	"list-2-3": ['Функция возвращающая значение из JS объекта к которому привязываемся, в данном случае эта функция имеет первый аргумент - ключ объекта который будет использован на этапах создания копии DOM элемента', 'A function that returns a value from the JS object to which we bind, in this case this function has the first argument - the key of the object that will be used at the stages of creating a copy of the DOM element.'],
	"l-3-1-1": [' — устанавливает тип обработчиков событий на связанных элементах в ', '— sets the type of event handlers on related elements in '],
	"l-3-1-2": ['. Иначе будет установлено', '. Otherwise, change will be set'],
	"l-3-2-1": [' — устанавливает привязку к', ' — sets the binding to the '],
	"l-3-2-2": ['DOM элемента', 'DOM element'],
	"l-3-2-3": ['. Иначе установлено в ', '. Otherwise it is set to value'],
	"l-5-3": ['Функция-коллбэк которая выполняется при изменении значения JS объекта, также данная функция выполнится сразу. ', 'The callback function that is executed when the value of the JS object changes, also this function will be executed immediately. '],
	"l-5-3-1": ['DOM элемент из 1-го аргумента данного метода', 'DOM element from the 1st argument of this method'],
	'l-5-4': ['Функция-коллбэк которая выполняется при изменении значения DOM объекта. Допускается пропустить данный аргумент, в этом случае обработка событий DOM объекта отсутствует, что можно использовать для "облегчения" кода. ', 'A callback function that is executed when the DOM value of an object is changed. It is allowed to skip this argument, in this case there is no event handling of the DOM object, which can be used to "lighten" the code. '],
	'l-5-4-2': ['Значение поля JS объекта которое было ранее привязано', "The value of the object's JS field that was previously linked"],
	'l-6-2': ['Функция возвращающая JS итерируемый объект', 'A function that returns a JS iterable object'],
	'l-6-3-1': ['Коллбэк аналогичен 3-му аргументу', 'The callback is similar to the 3rd'],
	'l-6-3-2': ['(вызывается на каждой итерации).', '(called at each iteration).'],
	'l-6-3-3': ['Ключ объекта (массива) который используется в итерации', 'The key of the object (array) that is used in the iteration'],
	'l-7-3-3': ['DOM элемент созданный на данной итерации', 'The DOM element created in this iteration'],
	'l-7-4-2': ['Значение поля JS объекта которое было ранее привязано', "The value of the object's JS field that was previously linked"],
	'l-8-1': ['Для того чтобы отсутствовала привязка между созданными DOM объектами и полем итерируемого JS объекта для этого нужно 4-м аргументом передать', 'In order for there to be no binding between the created DOM objects and the field of the iterated JS object, you need to pass the 4th argument.'],
	'l-8-2-1': ['Для того чтобы отсутствовала привязка по итерируемому JS объекту (количество полей объекта меняется соответственно меняется количество создаваемых DOM элементов) для этого нужно 4-м аргументом передать', 'In order for there to be no binding to the iterated JS object (the number of fields of the object changes, the number of DOM elements created changes accordingly), for this you need to pass the 4th argument'],
	'l-8-2-2': ['или использовать неотслеживаемый JS объект в 1-м аргументе (см. Важные заметки).', 'or use an untraceable JS object in the 1st argument (see important notes).'],
	'l-8-2-3': ['Стоит учесть, что данный функционал также ведёт к отсутствию реактивности в пункте выше', 'It is worth considering that this functionality also leads to a lack of reactivity in the paragraph above.'],
	general: ['Общее', 'General'],
	introduction: ['Ввидение', 'Introduction'],
	quickstart: ['Быстрый старт', 'Quickstart'],
	basics: ['Основы', 'Basics'],
	createapp: ['Создание приложения', 'Create App'],
	trackedobject: ['Создание отслеживаемого объекта', 'Creating a observed object'],
	createapp: ['Создание приложения', 'Create App'],
	bindings: ['Связывания', 'Bindings'],
	notes: ['Важные заметки', 'Critical notes'],
};

Translate['l-7-1'] = Translate['l-6-1'] = Translate['l-5-1'] = Translate['l-4-1'] = Translate['selector-list-2'] = Translate['selector-list'];
Translate['l-4-2'] = Translate['l-5-2'] = Translate['func-li1'];
Translate.arguments5 = Translate.arguments4 = Translate.arguments3 = Translate.arguments2 = Translate.arguments = Translate['arguments-title2'] = Translate['arguments-title3'] = Translate['arguments-title4'] = Translate['arguments-title'];
Translate['l-5-4-1'] = Translate['l-5-3-1'];
Translate['l-7-3-4'] = Translate['l-6-3-3'];
Translate['l-7-2'] = Translate['l-6-2'];
Translate['l-7-3-1'] = Translate['l-6-3-1'];
Translate['l-7-4-1'] = Translate['l-7-3-3'];

Translate.general2		= Translate.general;
Translate.introduction2	= Translate.introduction;	
Translate.quickstart2	= Translate.quickstart;
Translate.basics2		= Translate.basics; 
Translate.createapp2	= Translate.createapp;	 	
Translate.trackedobject2= Translate.trackedobject;	 	
Translate.createapp2	= Translate.createapp;	 	
Translate.bindings2		= Translate.bindings;
Translate.notes2		= Translate.notes;