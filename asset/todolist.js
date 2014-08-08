//online, offline 이벤트 할당을 하고
//offline일때 header 엘리먼트에 offline 클래스 추가하고
//online일때 header 엘리먼트에 offline 클래스 삭제하기


var TODOSync = {
	url : "http://ui.nhnnext.org:3333/",
	id : "astomusic",
	
	init : function() {
		window.addEventListener("online", this.onoffLineListener);
		window.addEventListener("offline", this.onoffLineListener);
	},

	onoffLineListener : function() {
		console.log(this);
		console.log("event");
	},

	get : function(callback) {
		$.ajax({
			type: "GET",
			url: this.url + this.id,
		}).done(function( msg ) {
			callback(msg);
		});
		// var xhr = new XMLHttpRequest();
		// xhr.open("GET", this.url + this.id, true);
		// xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		// xhr.addEventListener("load", function(e){
		// 	if(xhr.status === 200) {
		// 		callback(JSON.parse(xhr.responseText));
		// 	}
		// }.bind(this));
		// xhr.send();
	},

	add : function(todo, callback) {
		$.ajax({
			type: "PUT",
			url: this.url + this.id,
			data: { todo: todo }
		}).done(function( msg ) {
			callback(msg);
		});

		// var xhr = new XMLHttpRequest();
		// xhr.open("PUT", this.url + this.id, true);
		// xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		// xhr.addEventListener("load", function(e){
		// 	if(xhr.status === 200) {
		// 		callback(JSON.parse(xhr.responseText));
		// 	}
		// });
		// xhr.send("todo="+todo);
	},

	completed : function(param, callback) {
		$.ajax({
			type: "POST",
			url: this.url + this.id + "/" + param.key,
			data: { completed: param.completed }
		}).done(function( msg ) {
			callback();
		});

		// var xhr = new XMLHttpRequest();
		// xhr.open("POST", this.url + this.id + "/" + param.key ,true);
		// xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		// xhr.addEventListener("load", function(e){
		// 	if(xhr.status === 200) {
		// 		callback();
		// 	}
		// });
		// xhr.send("completed="+param.completed);
	},

	remove : function(key, callback) {
		$.ajax({
			type: "DELETE",
			url: this.url + this.id + "/" + key,
		}).done(function( msg ) {
			callback();
		});

		// var xhr = new XMLHttpRequest();
		// xhr.open("DELETE", this.url + this.id + "/" + key ,true);
		// xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		// xhr.addEventListener("load", function(e){
		// 	if(xhr.status === 200) {
		// 		callback();
		// 	}
		// });
		// xhr.send();
	}
}

var TODO =  {
	ENTER_KEYCODE : 13,

	init :  function() {

		TODOSync.init();

		$("#new-todo").on("keydown", this.add.bind(this));
		$("#todo-list").on("click", ".toggle", this.completed);
		$("#todo-list").on("click", ".destroy", this.remove);

		TODOSync.get(function(response){
			var initLi = ""
			response.map(function(res){
				var completed = res.completed?"completed":"";
				var checked = res.completed?"checked":"";
				var todoLi = this.build(res.todo, res.id, completed, checked); 
				initLi = initLi + todoLi;
			}.bind(this));
			var appendedTodo = $('#todo-list').append(initLi);
			$("#todo-list li:last-child").css("opacity", 1);
		}.bind(this));

		utility.featureDetector();
	},

	build : function(todo, key, completed, checked) {
		var template_vars = {
			text: todo,
			key: key,
			completed: completed,
			checked: checked
		}
		var template = utility.todoTemplate();
		var html = Mustache.to_html(template, template_vars);

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
				var appendedTodo = $('#todo-list').prepend(todoLi);
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
	},

	todoTemplate : function() {
		var temp = "";
		temp += "<li data-key={{key}} class={{completed}}>";
		temp += "<div class=\"view\">";
		temp += "<input class=\"toggle\" type=\"checkbox\" {{checked}}>";
		temp += "<label>{{text}}</label>";
		temp += "<button class=\"destroy\"></button>";
		temp += "</div>";
		temp += "</li>";

		return temp;
	}
}

document.addEventListener("DOMContentLoaded",TODO.init.bind(TODO));