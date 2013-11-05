function close_window(){
    window.open("","_self");
    window.close();
}


function getClass(obj) {
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";
  return Object.prototype.toString.call(obj)
    .match(/^\[object\s(.*)\]$/)[1];
}
function RemoveScript( strText )
{
    var regEx = /<script[^>]*>[^>]*<[^>]script>/g;
    return strText.replace(regEx, "");
}
function RemoveHTML( strText )
{
    var regEx = /<[^>]>/g;
    return strText.replace(regEx, "");
}
function RemoveA ( strText )
{
    var regEx = /<a[^>]*>[^>]*<[^>]a>/g;
    return strText.replace(regEx, "");
}

function RemoveAH ( strText )
{
    var regEx = /(<a[^>]*>)|(<[^>]a>)/g;
    return strText.replace(regEx, "");
}

function RemoveCenter( strText )
{
    var regEx = /(<center[^>]*>)|(<[^>]center>)/g;
    return strText.replace(regEx, "");
}
function RemoveBR( strText )
{
    var regEx = /(<br>)/g;
    return strText.replace(regEx, "");
}
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    //var month = months[a.getMonth()];
    var month = a.getMonth()+1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year+'-'+month+'-'+date+' '+hour+':'+min+':'+sec ;
    return time;
}

function injectEle(tag, type, source, name)
{
    var elem = document.createElement(tag);
    elem.type = type;
    elem.innerHTML = source;
    document[name].appendChild(elem);
}

function inject_code_to_page(code){
    injectEle("script", "text/javascript",code, 'head');
}

function unsafeInvoke(callback) {
	/// <summary>非沙箱模式下的回调</summary>
	var cb = document.createElement("script");
	cb.type = "text/javascript";
	cb.textContent = buildCallback(callback);
	document.head.appendChild(cb);
}

function buildCallback(callback) {
	var content = "";
	content += "(" + buildObjectJavascriptCode(callback) + ")();";
	return content;
}

function buildObjectJavascriptCode(object) {
	/// <summary>将指定的Javascript对象编译为脚本</summary>
	if (!object) return null;

	var t = typeof (object);
	if (t == "string") {
		return "\"" + object.replace(/(\r|\n|\\)/gi, function (a, b) {
			switch (b) {
				case "\r":
					return "\\r";
				case "\n":
					return "\\n";
				case "\\":
					return "\\\\";
			}
		}) + "\"";
	}
	if (t != "object") return object + "";

	var code = [];
	for (var i in object) {
		var obj = object[i];
		var objType = typeof (obj);

		if ((objType == "object" || objType == "string") && obj) {
			code.push(i + ":" + buildObjectJavascriptCode(obj));
		} else {
			code.push(i + ":" + obj);
		}
	}

	return "{" + code.join(",") + "}";
}
