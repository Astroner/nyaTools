!function () {
	var cssRules = {
		value:"",
		root: document.createElement('style'),
		push: function(arg){
			if (!this.root.parentElement) {
				document.head.appendChild(this.root);
			}
			this.value+=arg;
			this.root.innerHTML=this.value;
		}
	};
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
	function createCss(selector, rules) {
		var result = selector+" {"
		for (var key in rules) {
			if (rules.hasOwnProperty(key)) {
				result+=CamelCaseParse(key) + ": " + rules[key] +";"
			}
		}
		result+="}"
		cssRules.push(result);
	}
	function createCssMany() {
		for (var i = 0; i < arguments.length; i=i+2) {
			createCss(arguments[i], arguments[i+1]);
		}
	}
	window.nya = {
		cel: createHTML,
		style: createCssMany
	}
}();