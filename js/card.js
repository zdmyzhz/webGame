Vue.component('card',{
	data:function(){
		return {
			done:false,//卡片最终状态
			intermediate:false//卡片中间状态
		}
	},
	props:["title","size","promise","img","bk"],
	computed:{
		classCount(){
			return ["cardFrame",this.intermediate||this.done?"show":""]
		},
		image(){
			return {backgroundImage:"url("+this.img+")"}
		},
		back(){
			return {backgroundImage:"url("+this.bk+")"}
		}
	},
	methods:{
		turn(){
			if(!this.intermediate){
				this.intermediate=true;
				return this;
			}
			return;
		}
	},
	template:`<div :class="classCount" @click="$emit('card-turn',turn())" :style="size">
					<div class="card image" :style="image"></div>
					<div class="card back" :style="back"></div>
				</div>`
});
let game=new Vue({
	el:"#scene",
	data:{
		status:false,//用于控制迭代器状态
		turn:"",//存储迭代器
		defualtType:"middle",//默认卡片尺寸模式
		missionNum:1,//默认关卡
		defualtTheme:"minecraft",//默认主题
		over:false,
		go:true,
		beginTime:0,
		spend:"0s",
		maxImage:52,//支持最大图片数
		control:true,
		imageNum:0,
		conclusion:"",
		model:{
			small:{
				width:40,
				height:70,
				margin:6
			},
			middle:{
				width:50,
				height:80,
				margin:8
			},
			big:{
				width:60,
				height:100,
				margin:10
			}
		},
		missionSize:[
			{
				width:200,
				height:200
			},
			{
				width:300,
				height:300
			},
			{
				width:400,
				height:400
			},
			{
				width:500,
				height:500
			},
			{
				width:600,
				height:550
			},
			{
				width:700,
				height:550
			},
			{
				width:800,
				height:550
			},
			{
				width:900,
				height:550
			}
		],
		themeList:[
			{
				name:"我的世界",
				fileName:"minecraft"
			},
			{
				name:"复仇者联盟",
				fileName:"avengers"
			}
		],
		nodes:[],
		conclusionName:{
			perfect:["记忆神童","人肉照相机","雨人","外星人","最强大脑候选人","可能单身30年","逮虾户"],
			good:["666","凡夫俗子","没啥好说的","我们都一样~","盘就完事儿了"],
			bad:["老年痴呆症患者","没睡醒夫斯基","一条鱼","菜的像个弟弟","你可能喝的是7个核桃"]
		},
		conclusionObj:[
			{
				cardNum:[0,6],
				timeRange:[2,3]
			},
			{
				cardNum:[6,20],
				timeRange:[3,4]
			},
			{
				cardNum:[20,30],
				timeRange:[4,5]
			},
			{
				cardNum:[30,40],
				timeRange:[5,6]
			},
			{
				cardNum:[40,52],
				timeRange:[6,7]
			}
		]
	},
	created(){
		this.status=false;
		this.turn="";
		this.go=true;
		this.over=false;
		this.conclusionObj=[
			{
				cardNum:[0,6],
				timeRange:[2,3]
			},
			{
				cardNum:[6,20],
				timeRange:[3,4]
			},
			{
				cardNum:[20,30],
				timeRange:[4,5]
			},
			{
				cardNum:[30,40],
				timeRange:[5,6]
			},
			{
				cardNum:[40,52],
				timeRange:[6,7]
			}
		];
		this.$options.methods.cardUpdate.call(this);
	},
	methods:{
		*iterator(){
			let count=new Set(),
				firstCard=null,
				secondCard=null;
			firstCard=yield 1;
			secondCard=yield count.add(firstCard.title);
			yield (
					count.add(secondCard.title)
					,setTimeout(()=>count.size>1?(firstCard.intermediate=secondCard.intermediate=false):(firstCard.done=secondCard.done=true,firstCard.promise.resolve(),secondCard.promise.resolve()),500)
					,this.status=false
				);
		},
		compare(value){
			if(value)
			{
				if(!this.status){
					this.turn=this.$options.methods.iterator.call(this);
					this.turn.next();
					this.status=true;
				}
				this.turn.next(value);
			}
		},
		cardNum(){
			var	box=this.missionSize[this.missionNum-1],
				card=this.model[this.defualtType],
				rowNum=Math.floor(box.height/(card.height+(card.margin*2))),
				colNum=Math.floor(box.width/(card.width+(card.margin*2))),
				imageNum=0;
			if(rowNum%2===0||colNum%2===0){
			}else if(rowNum>=colNum){
				rowNum=(rowNum-1);
			}else{
				colNum=(colNum-1);
			}
			imageNum=rowNum*colNum/2;
			return {rowNum,colNum,imageNum};
		},
		random(num){
			let diff=new Set();
			if(num<this.maxImage/2){
				for(
					;diff.size<num
					;diff.add(Math.floor(Math.random()*this.maxImage+1))
					){}
			}else{
				let extra=this.maxImage-num,
					extraDiff=new Set();
				for(
					;extraDiff.size<extra
					;extraDiff.add(Math.floor(Math.random()*this.maxImage+1))
					){}
				for(let i=1;i<this.maxImage+1;i++){
					if(extraDiff.has(i)){
						continue;
					}
					diff.add(i);
				}
			}
			return [...diff];
		},
		imageObjList(num){
			let path="img/"+this.defualtTheme+"/",
				imgObjList=[],
				imgNumList=this.$options.methods.random.call(this,num),
				mixNum=Math.floor(Math.random()*num*2+1),
				result=null,
				r=0;
			for(let i=0;i<num;i++){
				imgObjList.push(
					{
						title:i,
						path:path+imgNumList[i]+".jpg",
						bk:path+"bk.jpg"
					}
				)
			}
			result=imgObjList.concat(imgObjList);
			for(let i=0;i<mixNum;i++){
				r=Math.floor(Math.random()*result.length);
				[result[i],result[r]]=[result[r],result[i]];
			}
			return result;
		},
		begin(){
			this.beginTime=Date.now();
			this.go=false;
		},
		observer(){
			Promise.all(this.nodes.map(value=>value.defer.promise)).then(value=>{
				let time=((Date.now()-this.beginTime)/1000).toFixed(2);
				this.$options.methods.getConclusion(this,time-0.5);
				this.spend=time+"s";
				this.over=true;
			});
		},
		cardUpdate(){
			var cardObj=this.$options.methods.cardNum.call(this);
				imgObj=null,
				nodes=[];
			imgObj=this.$options.methods.imageObjList.call(this,cardObj.imageNum);
			this.imageNum=cardObj.imageNum;
			for(let i=0;i<cardObj.rowNum*cardObj.colNum;i++){
				nodes.push({
					title:imgObj[i].title,
					defer:new Defer(),
					id:Date.now(),
					path:imgObj[i].path,
					bk:imgObj[i].bk
				});
			}
			this.nodes=nodes;
			this.$options.methods.observer.call(this);
		},
		getConclusion(obj,time){
			var imageNum=obj.imageNum,
				conclusionName=obj.conclusionName,
				range=obj.conclusionObj,
				limit=null,
				cost=time/imageNum,
				rank=null;
			for(let i of range){
				if(imageNum>i.cardNum[0]&&imageNum<=i.cardNum[1]){
					limit=i.timeRange;
					break;
				}
			}
			rank=cost<=limit[0]?"perfect":(cost>limit[1]?"bad":"good");
			obj.conclusion=conclusionName[rank][Math.floor(Math.random()*conclusionName[rank].length)];
			setTimeout(()=>document.querySelector(".conclusion").classList.add("conclusionEnd"),100);
		}
	},
	computed:{
		mission:{
			get:function(){
				return this.missionNum;
			},
			set:function(value){
				this.missionNum=value;
				this.$options.methods.cardUpdate.call(this);
				this.status=false
				this.go=true;
				this.over=false;
			}
		},
		type:{
			get:function(){
				return this.defualtType;
			},
			set:function(value){
				this.defualtType=value;
				this.$options.methods.cardUpdate.call(this);
				this.status=false
				this.go=true;
				this.over=false;
			}
		},
		theme:{
			get:function(){
				return this.defualtTheme;
			},
			set:function(value){
				this.defualtTheme=value;
				this.$options.methods.cardUpdate.call(this);
				this.status=false
				this.go=true;
				this.over=false;
			}
		},
		img(){
			return {backgroundImage:"url(img/"+this.defualtTheme+"/index.jpg)"};
		},
		size(){
			var style=this.model[this.defualtType];
			return {
					width:style.width+"px"
					,height:style.height+"px"
					,margin:style.margin+"px"
				};
		},
		boxSize(){
			var style=this.missionSize[this.missionNum-1];
			return {
					width:style.width+"px"
					,height:style.height+"px"
			};
		}
	}
});
