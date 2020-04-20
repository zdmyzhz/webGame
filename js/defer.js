function Defer(){
	this.promise=new Promise((function(resolve,reject){
		this._resolve=resolve;
		this._reject=reject;
	}).bind(this))
}
Defer.prototype.resolve=function(value){
	this._resolve.call(this.promise,value);
};
Defer.prototype.reject=function(value){
	this._reject.call(this.promise,value);
};