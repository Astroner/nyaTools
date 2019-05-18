!function () {
	var cssAsObj = [];//Массив со стилями

	//Функция, возвращающая dom element
	function createHTML(tag, args) {
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

	function CamelCaseParse(str) {
		return str.replace(/[A-Z]/g, function (a) {
			return "-" + a.toLowerCase();
		})
	}
	function addStyle(selector, rules) {
		cssAsObj.push({
			selector: selector,
			rules: rules
		});
	}
	function addStyleMany(object) {
		for (prop in object) {
			if (object.hasOwnProperty(prop)) {
				addStyle(prop, object[prop]);
			}
		}
	}
	function startStyle() {
		var result = "",
			container = createHTML('style', { type: "text/css" });
		cssAsObj.forEach(function (elem) {
			result+= getCssString(elem);
		});

		container.innerHTML = result;
		document.head.appendChild(container);
	}
	function getCssString(item, namespace) {
		var result = "",
			prefix = "",
			childrens = "";
		if (namespace) {
			if (item.selector[0]!==":") {
				prefix = namespace + " ";
			}else{
				prefix = namespace;
			}
		}
		result+=prefix + item.selector + " {";

		for (var key in item.rules) {
			if (item.rules.hasOwnProperty(key)) {
				if(typeof item.rules[key]!="object"){
					result+= CamelCaseParse(key)+ ": " + item.rules[key] + ";";
				}else{
					childrens+= getCssString({selector: key, rules: item.rules[key]}, prefix + item.selector)
				}
			}
		}

		return result + "}" + childrens
	}
	window.nya = {
		cel: createHTML,
		style: {
			add: addStyleMany,
			start: startStyle
		},
		ta: "text-align",
		bg: "background",
		fs: "font-size",
		ff: "font-family",
		trs: "transition",
		jc: "justify-content",
		br: "border-radius"
	}
}();