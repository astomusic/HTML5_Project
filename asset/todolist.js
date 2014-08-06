var TODOSync = {
	get : function(callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET","http://ui.nhnnext.org:3333/astomusic",true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		xhr.addEventListener("load", function(e){
			callback(JSON.parse(xhr.responseText).reverse());
		});
		xhr.send();
	},

	add : function(todo, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("PUT","http://ui.nhnnext.org:3333/astomusic",true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		xhr.addEventListener("load", function(e){
			//DOM add
			callback(JSON.parse(xhr.responseText));
		});
		xhr.send("todo="+todo);
	},

	completed : function(param, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST","http://ui.nhnnext.org:3333/astomusic/" + param.key ,true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		xhr.addEventListener("load", function(e){
			//DOM add
			callback(JSON.parse(xhr.responseText));
		});
		xhr.send("completed="+param.completed);
	},

	remove : function(key, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("DELETE","http://ui.nhnnext.org:3333/astomusic/" + key ,true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		xhr.addEventListener("load", function(e){
			//DOM add
			callback(JSON.parse(xhr.responseText));
		});
		xhr.send();
	}
}

var TODO =  {
	ENTER_KEYCODE : 13,

	init :  function() {
		$("#new-todo").on("keydown", $.proxy(TODO.add, TODO));//jquery의 bind방법?
		$("#todo-list").on("click", ".toggle", TODO.completed);
		$("#todo-list").on("click", ".destroy", TODO.remove);

		TODOSync.get(function(response){
			response.forEach(function(value, key){	
				var todo = $("#new-todo")[0].value;
				var completed = value.completed?"completed":"";
				var checked = value.completed?"checked":"";
				var todoLi = TODO.build(value.todo, value.id, completed, checked); //this의 범위?
				var appendedTodo = $('#todo-list').append(todoLi);
				$("#todo-list li:last-child").css("opacity", 1);
			})
		});

		utility.featureDetector();
	},

	build : function(todo, key, completed, checked) {
		var template_vars = {
			text: todo,
			key: key,
			completed: completed,
			checked: checked
		}
		var template = $('#todo-template').html();
		var html = Mustache.to_html(template, template_vars);

		console.log(html);

		return html;
	},

	completed : function(e) {
		var li = $(this).parent().parent();
		var checked = $(this).prop("checked")?"1":"0"

		TODOSync.completed({
			key: li[0].dataset.key,
			completed: checked
		},function(){
			if(checked == "1") {
				li.addClass("completed");
			} else {
				li.removeClass("completed");
			}
		});
		
	},

	remove : function(e) {
		var li = $(this).parent().parent();
		var ul = li.parent();

		var key = li[0].dataset.key;

		TODOSync.remove(key, function() {
			li.css("opacity", 0);
			li.on(utility.transitionEnd, function() { 
				li.empty();
			});	
		});
	},

	add : function(e){
		if(e.keyCode === this.ENTER_KEYCODE) {
			var todo = $("#new-todo")[0].value;
			
			TODOSync.add(todo, function(json){
				var todoLi = this.build(todo, json.insertId, "", "");
				var appendedTodo = $('#todo-list').append(todoLi);
				$("#new-todo")[0].value = "";
				$("#todo-list li:last-child").css("opacity", 1);
			}.bind(this));	
		}
	}
}

var utility = {
	transitionEnd : "",

	featureDetector : function() {
	// 해당브라우져에서 동작가능한 transitionEnd 타입을 찾아서 해당 타입을 result로 반환 해준다.
	var result;
	var elForCheck = document.querySelector("body");

	var status = {
		"webkitTransitionEnd" : typeof elForCheck.style.webkitTransform,
		"mozTransitionEnd" : typeof elForCheck.style.MozTransform,
		"OTransitionEnd" : typeof elForCheck.style.OTransform,
		"msTransitionEnd" : typeof elForCheck.style.msTransform,
		"transitionEnd" : typeof elForCheck.style.transform
	}

	for ( var key in status) {
		if (status[key] !== "undefined") {
			result = key;
		}
	}

	this.transitionEnd = result;
}
}

var featureDetector = function() {
	// 해당브라우져에서 동작가능한 transitionEnd 타입을 찾아서 해당 타입을 result로 반환 해준다.
	var result;
	var elForCheck = document.querySelector("body");

	var status = {
		"webkitTransitionEnd" : typeof elForCheck.style.webkitTransform,
		"mozTransitionEnd" : typeof elForCheck.style.MozTransform,
		"OTransitionEnd" : typeof elForCheck.style.OTransform,
		"msTransitionEnd" : typeof elForCheck.style.msTransform,
		"transitionEnd" : typeof elForCheck.style.transform
	}

	for ( var key in status) {
		if (status[key] !== "undefined") {
			result = key;
		}
	}

	return result;
}

document.addEventListener("DOMContentLoaded",TODO.init);