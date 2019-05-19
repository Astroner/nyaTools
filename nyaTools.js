!function () {
	var cssAsObj = [],//Массив со стилями
		media = [],//массив с media queries
		units = {
			width: "vw",
			height: "vh",
			margin: "px",
			padding: "px",
			"max-width": "vw",
			"min-width": "vw",
			"max-height": "vh",
			"min-height": "vh",
			transition: "s",
			border: "px",
			"border-left": "px",
			"border-right": "px",
			"border-top": "px",
			"border-bottom": "px",
			outline: "px",
			"font-size": "px",
			"border-radius": "px",
			"box-shadow": "px"
		};
	//Функция, возвращающая dom element
	function createHTML(tag, args) {
		//tag = 'div'/'span'/e.t.c.
		//args = { id: "mi", className: "test" }
		if (!tag) {
			return document.createElement('div');
		}
		var result = document.createElement(tag);

		if (args) {
			for (var key in args) {
				if (args.hasOwnProperty(key)) {
					if (key=="style"&&typeof(args[key])=='object') {
						for (var jec in args[key]) {
							if (args[key].hasOwnProperty(jec)) {
								result.style[jec] = args[key][jec]
							}
						}
					}else{
						result[key] = args[key]
					}
				}
			}
		}

		if (arguments.length>2) {
			for (var i = 2; i < arguments.length; i++) {
				if (typeof(arguments[i])!=="object") {
					result.appendChild(new Text(arguments[i]))
				}else{
					result.appendChild(arguments[i])
				}
			}
		}

		return result
	}
	//Превращает КамелКейс в нормальные-слова
	function CamelCaseParse(str) {
		//str = camelCase -> camel-case
		return str.replace(/[A-Z]/g, function (a) {
			return "-" + a.toLowerCase();
		})
	}
	//Добавляет форматированный объект в массив стилей
	function addStyle(selector, rules) {
		//selector = ".test"
		//rules = { color: white }
		//Если это глобальный тег медиа, то отправляем его в media
		if (selector=="media") {
			addGlobalMedia( rules );
			return
		}
		cssAsObj.push({
			selector: selector,
			rules: rules
		});
	}

	//Даёт возможность заюзать addStyle много раз для пар ключ - значение
	function addStyleMany(object) {
		for (prop in object) {
			if (object.hasOwnProperty(prop)) {
				addStyle(prop, object[prop]);
			}
		}
	}

	//Запускает парсер js2css
	function startStyle(mode) {
		//mode = true/false
		var result = "",//Результирующая строка
			container = createHTML('style', { type: "text/css" });//контайнер для стилей
			cssAsObj.forEach(function (elem) {//перерабатываем массив стилей
			result+= getCssString(elem);//превращает {selector:".test", rules:{ color: white }} в .test{ color: white }
		});
		
		//Добавляем в конце все media запросы, полученные в процессе выше
		for (var prop in media) {
			if (media.hasOwnProperty(prop)) {
				result+="@media screen and " + prop + "{";

				media[prop].forEach(function (elem) {
					result+= getCssString(elem)
				})

				result+="}";
			}
		}
		if (mode) {
			window.open('about:blank', '_blank').document.body.innerText = result;
		}
		container.innerHTML = result;
		document.head.appendChild(container);
	}
	//превращает {selector:".test", rules:{ color: white }} в .test{ color: white }
	function getCssString(item, namespace) {
		/*
		item = {
			selector: ".test",
			rules:{
				color: white
			}
		}
		namespace = ".namespace"
		*/
		if (item.selector=="media") {//Прверка на медиа запрос
			addMedia( namespace, item.rules );//Если да, то добавляем его в массив запросов через функцию
			return "";
		}

		var result = "",//результирущая строка
			prefix = "",//префикс для реализации вложений
			childrens = "",//строка для вложенных стилей
			transitions = [];

		if (namespace) {//если обрабатываеммый item вложен, то добавляем к нему namespace
			if (item.selector[0]!==":") {
				prefix = namespace + " ";
			}else{
				prefix = namespace;
			}
		}
		result+=prefix + item.selector + " {";

		//Прогоняем каждое правило в rules
		for (var key in item.rules) {
			if (item.rules.hasOwnProperty(key)) {
				if(typeof item.rules[key]!="object"){
					if (key == "transition") {
						transitions.default = measured( CamelCaseParse(key), item.rules[key] );
					}else{
						//Возвращаем пару ключ: значение, где значение прогоняется через валидатор, добавляющий ед. измерения.
						result+= CamelCaseParse(key)+ ": " + measured( CamelCaseParse(key), item.rules[key] ) + ";";
					}
				//Проверка на массив, т.е. на наличие встроенного transition'а
				}else if(item.rules[key] instanceof Array){
					transitions.push({
						name: key,
						dur: item.rules[key][1],
						fun: item.rules[key][2],
						del: item.rules[key][3],
					});
					result+= CamelCaseParse(key)+ ": " + measured( CamelCaseParse(key), item.rules[key][0] ) + ";";
				}else if(item.rules[key] instanceof Object){
					//Если тип свойстав - объект, значит это вложенность, а значит отправляем его в в getCssString c префиксом в параметрах. Такая рекурсия
					childrens+= getCssString({selector: key, rules: item.rules[key]}, prefix + item.selector)
				}
			}
		}
		//Добавляем в result transition
		result += setTransition(transitions);
		//Закрываем стил. Добавляем к нему потомков
		return result + "}" + childrens
	}

	function setTransition(rules) {
		//Отсеиваем пустые rules
		if (!rules.length&&!rules.default) {
			return ""
		}

		//Отсеиваем те, где есть только default
		if (!rules.length&&rules.default) {
			return "transition: " + rules.default + ";"
		}

		var result = "transition: ";

		//Если есть дефолтный, то добавляем его
		if (rules.default) {
			result+= rules.default + ",";
		}

		//Пробегаемся по
		rules.forEach(function (item, index) {
			if (index!==0) result+=",";
			result+=" " + CamelCaseParse(item.name);
			if(item.dur) result+=" " + item.dur + "s";
			if(item.fun) result+=" " + item.fun;
			if(item.del) result+=" " + item.del + "s";
		})
		return result + ";"
	}

	//Добавляет форматированный объект в объект media
	function addMedia(target, rules) {
		//target = ".test"
		/*rules = {
			"(max-width: 100px)":{
				color: black
			}
		}*/
		//Проходимся по всем rules
		for (var prop in rules) {
			if (rules.hasOwnProperty(prop)) {
				//Если такого ключа в объекте media не существует, то добавляем его
				if (!media[prop]) {
					media[prop] = [];
				}
				//добавляем по ключу селектор и rules
				media[prop].push({ selector: target, rules: rules[prop] });
			}
		}
	}

	//Добавляет единицы измерения к свойствам
	function measured(name, value) {
		//name = "padding", value = "10px"/"10"/"10px auto"/"10 auto"
		//Проверяем на наличие дефолтных единиц измерения в units{}
		if (!units[name]) {
			return value
		}

		//Если есть, то разбиваем строку на слова, работаем с ними и join'им в строку
		return (value + "").split(" ").map(function ( item, index ) {
			//Если item - число, то добавляем единицы измерения, т.е. в item'е нет px/vh e.t.c. 
			if (Number(item)) {
				//Потому что если они есть, то Number вернёт NaN(false)
				return item + units[name]
			}
			return item;
		}).join(" ");
	}

	//Устанавливает default'ные удиницы измерения для величин
	function setDefaultUnits(prop, merge) {
		//prop - объект со значениями
		//merge - bool, говорящий мёрджить уже имеющиеся значения или нет
		if (merge) {
			units = Object.assign(units, prop)
		}else{
			units = prop;
		}
	}

	//Обработчик для добавления глобальных media
	function addGlobalMedia(rules) {
		for (var key in rules) {
			if (rules.hasOwnProperty(key)) {
				if (!media[key]) {
					media[key] = [];
				}
				for (var selector in rules[key]) {
					if (rules[key].hasOwnProperty(selector)) {
						media[key].push({ selector: selector, rules: rules[key][selector] });
					}
				}
			}
		}
	}
	window.nya = {
		cel: createHTML,
		style: {
			add: addStyleMany,
			start: startStyle,
			defUnits: setDefaultUnits
		}
	}
}();