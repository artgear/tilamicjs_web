/**
 * tilamic.js DEMO
 * ver. 20140727
 * 
 * Copyright 2014 Artgear
 * http://d.hatena.ne.jp/artgear/
 * https://github.com/artgear/tilamicjs
 * 
 * This software is released under the MIT License.
 */

(function(window, $){
	$(document).ready(function(){
		var tilamic = new Tilamic('#tiles', {
			'rows': 3,
			'cols': 5,
			'aspectRatio': 853/1280
		});
		// prepare a variety of selections of the tiles.
		var selectPatterns = {};
		selectPatterns['checkerA'] = tilamic.filter(function(index, col, row){
			return (col + row) % 2 == 0;
		});
		
		selectPatterns['checkerB'] = tilamic.filter(function(index, col, row){
			return (col + row) % 2 !== 0;
		});
		
		selectPatterns['row0'] = tilamic.filter(function(index, col, row){
			return row == 0;
		});
		selectPatterns['row1'] = tilamic.filter(function(index, col, row){
			return row == 1;
		});
		selectPatterns['row2'] = tilamic.filter(function(index, col, row){
			return row == 2;
		});
		
		
		// define a variety of flip patterns.
		var flippatterns = [];
		flippatterns[0] = function(imgID){
			tilamic.setOrigin('middleOfCol').flip(imgID);
		};
		flippatterns[1] = function(imgID){
			tilamic.seqFlip(imgID);
		};
		flippatterns[2] = function(imgID){
			selectPatterns['checkerA'].flip(imgID);
			setTimeout(function(){
				selectPatterns['checkerB'].flip(imgID);
			}, 800);
		};
		flippatterns[3] = function(imgID){
			tilamic.seqFlip(imgID, {
				'isZtoA': true,
				'isReverse': true,
				'isAxisX': true
			});
		};
		flippatterns[4] = function(imgID){
			selectPatterns['checkerA'].setOrigin('centerOfAll').flip(imgID);
			setTimeout(function(){
				selectPatterns['checkerB'].setOrigin('centerOfAll').flip(imgID, {
					'isReverse': true
				});
			}, 800);
		};
		flippatterns[5] = function(imgID){
			selectPatterns['row0'].seqFlip(imgID);
			setTimeout(function(){
				selectPatterns['row1'].seqFlip(imgID);
			}, 150);
			setTimeout(function(){
				selectPatterns['row2'].seqFlip(imgID);
			}, 300);
		};
		
		
		$(window).on('resize', function(e){
			tilamic.resize();
		});
		
		var counter = 1;
		var timer = null;
		var setTimer = function(){
			//console.log('timerstart');
			timer = setInterval(function(){
				(flippatterns[counter % flippatterns.length])(counter % 4);
				counter++;
			}, 3000);
		};
		var clearTimer = function(){
			//console.log('timerstop');
			clearInterval(timer);
		};
		setTimer();
		$(window).on('focus', setTimer);
		$(window).on('blur', clearTimer);
	});
})(window, jQuery);
