function MineSweeper(tr, td, mineNum) {
	this.tr = tr; //行
	this.td = td; //列
	this.mineNum = mineNum; //雷数
	this.area = []; //存取每个格子信息
	this.doms = []; //存储格子DOM,用来动态创建DOM
	this.lastMineNum = mineNum; //剩余雷数
	this.allRight=false;
	this.parent = document.querySelector('.mine');
	this.num = document.querySelector('.last .mineNum');
}
//初始化
MineSweeper.prototype.init = function() {
	var time = document.getElementById('time'); //计时器
	var timer = setInterval(function () {
    let seconds = (parseFloat(time.innerHTML) + 0.1).toFixed(1); //保留一位小数
    time.innerHTML = seconds;
	},
    100) //定时器 100ms执行一次
	var rn = this.randomNum(); //获得type: mine 的索引
	var n = 0; //记录格子索引
	for(var i = 0; i < this.tr; i++) {
		this.area[i] = [];
		for(var j = 0; j < this.td; j++) {
			n ++;
			if(rn.indexOf(n) !== -1) {
				this.area[i][j] = {
					type: 'mine',
					x: j,
					y: i
				};
			} else {
				this.area[i][j] = {
					type: 'number',
					x: j,
					y: i,
					value: 0
				};
			}
		}
	}
	// console.log(this.area);
	this.num.innerHTML = this.mineNum; //初始化雷数
    this.parent.oncontextmenu = function() {
    	return false; //阻止右击菜单事件
    }
    this.updateNumber();
	//创建表格
	this.parent.innerHTML = "";
	this.create();
}

//创建DOM表格
MineSweeper.prototype.create = function() {
	var _this = this;
	var table = document.createElement('table');
	for(var i = 0; i < this.tr; i++) {
		var trDom = document.createElement('tr');
		this.doms[i] = [];
		for(var j = 0; j < this.td; j++) {
			var tdDom = document.createElement('td');
			this.doms[i][j] = tdDom;
			trDom.appendChild(tdDom);

            tdDom.pos = [i, j];
			tdDom.onmousedown = function(event) {
				if(event.button === 0) {  //鼠标左键
					var curArea = _this.area[this.pos[0]][this.pos[1]];
					console.log(curArea)
					if(curArea.type === 'mine') {
						// console.log('踩到雷了！')
						this.className = 'mine';
						_this.gameOver(this);
						alert('啧啧啧。。。行不行啊你。');
						clearInterval(time);
					} else {
						// console.log('is number')
						if(!curArea.value) {  //踩到0，出现一大片
							// console.log(0);
							this.className = 'select'; //先显示自己
							this.innerHTML = '';
							
							function getAllZero(area) {
								var around = _this.mineAround(area); //找其周围的格子
								for(var i = 0; i < around.length; i++) {
									var x = around[i][0]; //行
									var y = around[i][1]; //列
									_this.doms[x][y].className = 'select';
									if(!_this.area[x][y].value) {
										if(!_this.doms[x][y].isHas) {  
											_this.doms[x][y].isHas = true; //标记被找过的元素,避免格子重复重复被调用,导致内存资源被滥用
											arguments.callee(_this.area[x][y])
										}
									} else {
										_this.doms[x][y].innerHTML = _this.area[x][y].value;
									}
								}
							}
							getAllZero(curArea);

						} else {
							this.className = 'select';
							this.innerHTML = curArea.value;
						}
						
					}
				
				} else if(event.button === 2) {  //鼠标右键
					this.className = this.className == 'flag'? '':'flag';
					//标记小旗子，则剩余雷数-1
					if(this.className === 'flag') {
						_this.num.innerHTML = --_this.lastMineNum;
					} else {
						_this.num.innerHTML = ++_this.lastMineNum;
					} 
				}
			}
		}
		table.appendChild(trDom);
	}
	this.parent.appendChild(table);
};

//生成指定数量的不重复的数字
MineSweeper.prototype.randomNum = function() {
	var mineArr = new Array(this.tr*this.td); //该数组用来存储所有格子下标
	for(var i = 0; i < mineArr.length; i++) {
		mineArr[i] = i;
	}

	mineArr.sort(function() {return 0.5 - Math.random()}); //将数组乱序排序
	return mineArr.slice(0, this.mineNum); //随机取得放置雷的下标
};

//找目标格子周围的格子, 雷周围的格子都需要number++
MineSweeper.prototype.mineAround = function(target) {
	var x = target.x;
	var y = target.y;
	var result = []; //二位数组,存储周围格子的坐标
	for(var i = x-1; i <= x+1; i++) {
		for(var j = y-1; j <= y+1; j++) {
			if(
                  i < 0 || j < 0 || i > this.td - 1 || j > this.tr - 1 ||  //排除四个角
                  (i == x && j == y) ||                            //排除周围是雷
                  this.area[j][i].type === 'mine'    
			  ){
				continue;
			}
			result.push([j, i]);
		}
	}
	return result; 
};

//更新所有数字
MineSweeper.prototype.updateNumber = function() {
	for(var i = 0; i < this.tr; i++) {
		for(var j = 0; j < this.td; j++) {
			if(this.area[i][j].type == 'number') {
				continue;
			}
			var nums = this.mineAround(this.area[i][j]);  //获取雷周围的格子
			for(var k = 0; k < nums.length; k++) {
				//雷周围的格子的number都要+1
				this.area[nums[k][0]][nums[k][1]].value += 1;
			}
		}
	}
};

//gameOver
MineSweeper.prototype.gameOver = function(downMine) {
	for(var i = 0; i < this.tr; i++) {
		for(var j = 0; j < this.td; j++) {
			if(this.area[i][j].type === 'mine') {
				this.doms[i][j].className = 'mine';
			}
			this.doms[i][j].onmousedown = null;
		}
	}
	if(downMine) {
		downMine.style.backgroundColor = '#f40';
	}

}
function startGame() {
	var btn = document.querySelectorAll('.container .level>button');
	var arr = [[10,10,15],[15,15,40],[20,20,80]];
	var select = 0; //当前选中状态的按钮
	var mine = null;
	for(let i = 0; i < btn.length - 1; i++) {
		console.log(i);
		console.log(arr);
		btn[i].onclick = function(e) {
			btn[select].className = '';
			this.className = 'select';
			select = i;
			mine = new MineSweeper(...arr[i]);
			console.log(arr[i]);
			mine.init();
		}

	}
	btn[0].onclick();
	btn[3].onclick = function() {
		mine.init();
	}
}
startGame();