/**
 * tilamic.js
 * ver. 1.0.0
 * 
 * Copyright 2014 Artgear
 * http://d.hatena.ne.jp/artgear/
 * https://github.com/artgear/tilamicjs
 * 
 * This software is released under the MIT License.
 */

(function(window, $){
	// utilities
	var checkSupport = function(prop){
		// check whether the browser supports css3 'prop' property.
		var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
		var venderProp = null;
		var propForLCC = prop.charAt(0).toUpperCase() + prop.slice(1);
		var rawDiv = document.createElement('div');
		
		if(prop in rawDiv.style){
			rawDiv = null;
			return true;
		};
		
		for(var i = 0; i < prefixes.length; i++){
			venderProp = prefixes[i] + propForLCC;
			if(venderProp in rawDiv.style){
				rawDiv = null;
				return true;
			};
		};
		
		rawDiv = null;
		return false;
	};
	
	// check IE6, 7
	var isVeryOldBrowser = document.all && !document.querySelectorAll;
	
	// check IE6, 7, 8
	var isOldBrowser = document.all && !document.addEventListener;
	
	 // Tile object controls only 1 tile.
	 // Tile object is a part of Tilamic object.
	 // Tilamic object presides over all of the tiles.
	 
	var Tile = function(selector, options){
		// control the only one tile to flip with CSS3 transition.
		var $ele = this.$ele = $(selector);
		
		if($ele.length !== 1){
			throw new Error('Selector Error.');
		};
		
		var defaultOptions = {
			'width': '100%',
			'height': '100%',
			'duration': '500ms',
			'imgTop': 0,
			'imgLeft': 0,
			'importImgPaths': {},
			'attrPrefix': '',
			'imgWidth': 'auto',
			'imgHeight': 'auto'
		};
		
		options = this.options = $.extend({}, defaultOptions, options);
		
		// customize every class name if the option is assigned
		this.classNames = {
			'face': options['attrPrefix'] + 'tilamic_tile_face',
			'backX': options['attrPrefix'] + 'tilamic_tile_backX',
			'backY': options['attrPrefix'] + 'tilamic_tile_backY'
		};
		
		// validate the class names
		for (v in this.classNames){
			if(!(/^[_a-zA-Z][_a-zA-Z0-9-]+$/.test(this.classNames[v]))){
				throw new Error('Invalid attrPrefix');
			};
		};
		
		//get the path of every image.
		var imgPaths = {};
		$ele.find('img').each(function(index){
			imgPaths[index] = $(this).get(0).src;
			var key = $(this).attr('alt');
			if(key){
				imgPaths[key] = imgPaths[index];
			};
		});
		
		this.imgPaths = imgPaths = $.extend({}, imgPaths, options['importImgPaths']);
		
		//setup the tile
		var tileWrapperCss = {
			'position': 'relative',
			'width': options['width'],
			'height': options['height'],
			'border': 0,
			'padding': 0,
			'margin': 0
		};
		
		var tileFaceCss = {
			'display': 'block',
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'width': '100%',
			'height': '100%',
			'border': 0,
			'padding': 0,
			'margin': 0,
			'background-size': options['imgWidth'] + 'px ' + options['imgHeight'] + 'px',
			'transition-property': 'transform',
			'-webkit-transition-property': '-webkit-transform', // jQuery doesn't add vender-prefixes to values automatically.
			'-o-transition-property': '-o-transform',
			'-moz-transition-property': '-moz-transform',
			'transition-duration': options['duration'],
			'transform-style': 'preserve-3d',
			'backface-visibility': 'hidden',
			'background-position': options['imgLeft'] + ' ' + options['imgTop']
		};
		
		var tileBackXCss = $.extend({
			'transform': 'perspective(1000px) rotateX(-180deg) rotateY(0deg)'
		}, tileFaceCss);
		
		var tileBackYCss = $.extend({
			'transform': 'perspective(1000px) rotateX(0deg) rotateY(-180deg)'
		}, tileFaceCss);
		
		// this shows the ID of the 'face' image.
		this._currentImgID = '0';
		
		//Build the HTML structure
		$ele.html('<!-- This section is built by Tile constructor of tilamic.js automatically. -->');
		var $tileWrapper = $('<div>').css(tileWrapperCss);
		var $tileFace = $('<span>').addClass(this.classNames['face']).css(tileFaceCss).css('background-image', 'url(' + imgPaths[0] + ')');
		var $tileBackX = $('<span>').addClass(this.classNames['backX']).css(tileBackXCss).css('background-image', 'url(' + imgPaths[1] + ')');
		var $tileBackY = $('<span>').addClass(this.classNames['backY']).css(tileBackYCss).css('background-image', 'url(' + imgPaths[1] + ')');
		
		$tileWrapper.append($tileFace).append($tileBackX).append($tileBackY).appendTo($ele);
		
		// set post-processing and pre-processing for the next on transition end.
		var self = this;
		$ele.find('span').on({
			'webkitTransitionEnd transitionend': function(e){
				if(e.originalEvent.elapsedTime <= 0.1 || !$(this).hasClass(self.classNames['face'])){
					return;
				};
				$ele.find('span').each(function(index){
					var resetTransform = $(this).hasClass(self.classNames['face']) ? 'perspective(1000px) rotateX(0deg) rotateY(0deg)' :
										 $(this).hasClass(self.classNames['backX']) ? 'perspective(1000px) rotateX(-180deg) rotateY(0deg)' :
										 'perspective(1000px) rotateX(0deg) rotateY(-180deg)';
					
					$(this).css({
						'transition-duration': '0s',
						'transform': resetTransform
					});
				}).delay(50).queue(function(){
					$(this).css({
						'transition-duration': options['duration']
					}).dequeue();
				});
			}
		});
	};
	
	Tile.prototype.getCurrentImgID = function(){
		return this._currentImgID;
	};
	
	Tile.prototype.setInnerTileCss = function(property, value){
		this.$ele.find('span').css(property, value);
	};
	
	Tile.prototype.flip = function(imgID, isAxisX, isReverse){
		// rotate the span elements.
		var $ele = this.$ele;
		
		var backClass = isAxisX ? this.classNames['backX'] : this.classNames['backY'];
		var faceClass = this.classNames['face'];
		
		$ele.find('.' + backClass).css('background-image', 'url(' + this.imgPaths[imgID] + ')');
		
		var computeCssValue = function(isAxisX, isFace, isReverse){
			var x = isAxisX ? (isFace ? (isReverse ? -180 : 180) : (isReverse ? -360 : 0)) : 0;
			var y = isAxisX ? 0 : (isFace ? (isReverse ? -180 : 180) : (isReverse ? -360 : 0));
				
			return 'perspective(1000px) rotateX(' + x + 'deg) rotateY(' + y + 'deg)';
		};
		
		$ele.find('span').each(function(index){
			var isFace = $(this).hasClass(faceClass);
			if(!isFace && !$(this).hasClass(backClass)){
				return;
			};
			$(this).css({
				'transform': computeCssValue(isAxisX, isFace, isReverse)
			}).toggleClass(faceClass + ' ' + backClass);
		});
		
		this._currentImgID = imgID;
	};
	
	Tile.prototype.flipX = function(imgID, isReverse){
		this.flip(imgID, true, isReverse);
	};
	
	Tile.prototype.flipY = function(imgID, isReverse){
		this.flip(imgID, false, isReverse);
	};
	
	var AltTile = function(selector, options){
		// This object provides compatibility with old browsers.
		// If the browser doesn't support CSS3 features,
		// Tilamic constructor use this instead of Tile object.
		var $ele = this.$ele = $(selector);
		
		if($ele.length !== 1){
			throw new Error('Selector Error.');
		};
		
		var defaultOptions = {
			'width': '100%',
			'height': '100%',
			'duration': '500ms',
			'imgTop': 0,
			'imgLeft': 0,
			'importImgPaths': {},
			'attrPrefix': '',
			'imgWidth': 'auto',
			'imgHeight': 'auto'
		};
		
		options = this.options = $.extend({}, defaultOptions, options);
		
		// customize every class name if the option is assigned
		this.classNames = {
			'face': options['attrPrefix'] + 'tilamic_tile_face',
			'back': options['attrPrefix'] + 'tilamic_tile_back'
		};
		
		// validate the class names
		for (v in this.classNames){
			if(!(/^[_a-zA-Z][_a-zA-Z0-9-]+$/.test(this.classNames[v]))){
				throw new Error('Invalid attrPrefix');
			};
		};
		
		//get the path of every image.
		var imgPaths = {};
		$ele.find('img').each(function(index){
			imgPaths[index] = $(this).get(0).src;
			var key = $(this).attr('alt');
			if(key){
				imgPaths[key] = imgPaths[index];
			};
		});
		
		this.imgPaths = imgPaths = $.extend({}, imgPaths, options['importImgPaths']);
		
		//setup the tile
		var tileWrapperCss = {
			'position': 'relative',
			'width': options['width'],
			'height': options['height'],
			'border': 0,
			'padding': 0,
			'margin': 0,
			'overflow': 'hidden'
		};
		
		var tileImgCss = {
			'vertical-align': 'top',
			'position': 'absolute',
			'top': options['imgTop'],
			'left': options['imgLeft'],
			'width': options['imgWidth'],
			'height': options['imgHeight']
		};
		
		var tileFaceImgCss = $.extend({
			'display': 'inline'
		}, tileImgCss);
		
		var tileBackImgCss = $.extend({
			'display': 'none'
		}, tileImgCss);
		
		// this shows the ID of the 'face' image.
		this._currentImgID = '0';
		
		// build the html structure
		$ele.html('<!-- This section is built by AltTile constructor of tilamic.js automatically. -->');
		$tileWrapper = $('<div>').css(tileWrapperCss);
		$tileFace = $('<img />').addClass(this.classNames['face']).css(tileFaceImgCss).attr('src', imgPaths[0]);
		$tileBack = $('<img />').addClass(this.classNames['back']).css(tileBackImgCss).attr('src', imgPaths[1]);
		
		$tileWrapper.append($tileFace).append($tileBack).appendTo($ele);
	};
	
	AltTile.prototype.getCurrentImgID = function(){
		return this._currentImgID;
	};
	
	AltTile.prototype.setInnerTileCss = function(property, value){
		this.$ele.find('img').css(property, value);
	};
	
	AltTile.prototype.fade = function(imgID){
		// fallback method of flip for non CSS3 browsers 
		$ele = this.$ele;
		var faceClass = this.classNames['face'];
		var backClass = this.classNames['back'];
		
		$ele.find('.' + backClass).attr('src', this.imgPaths[imgID]).fadeIn();
		$ele.find('.' + faceClass).fadeOut();
		
		$ele.find('img').toggleClass(faceClass + ' ' + backClass);
		
		this._currentImgID = imgID;
	};
	
	AltTile.prototype.replace = function(imgID){
		// fallback method of flip for IE 6, 7 ,8
		$ele = this.$ele;
		var faceClass = this.classNames['face'];
		
		$ele.find('.' + faceClass).attr('src', this.imgPaths[imgID]);
		
		this._currentImgID = imgID;
	};
	
	AltTile.prototype.flip = function(imgID, isAxisX, isReverse){
		// This method doesn't flip the tile practically.
		// For compatibility with Tile object, Tilamic object calls this.
		if(isOldBrowser){
			// IE 6, 7, 8
			this.replace(imgID);
			return;
		}
		// IE 9
		this.fade(imgID);
	};
	
	var Tilamic = function(selector, options){
		var $ele = this.$ele = $(selector);
		var $firstImg = $ele.find('img').eq(0);
		
		// 'aspectRatio' is for resizing. If you want to make with responsive design, this option is required.
		// 'aspectRatio' doesn't work fine on IE 6. So tilamic.js doesn't support IE 6 officially.
		var defaultOptions = {
			'rows': 3,
			'cols': 3,
			'attrPrefix': '',
			'aspectRatio': 0,
			'isCSS3Supported': checkSupport('transition') && checkSupport('transform')
		};
		
		this.options = $.extend({}, defaultOptions, options);
		
		// set the element height.
		if(this.options['aspectRatio']){
			$ele.css('height', Math.round($ele.width() * this.options['aspectRatio']));
		};
		
		//get the path of every image.
		var imgPaths = {};
		$ele.find('img').each(function(index){
			imgPaths[index] = $(this).get(0).src;
			var key = $(this).attr('alt');
			if(key){
				imgPaths[key] = imgPaths[index];
			};
		});
		
		var rowContainerCss = {
			'border': 0,
			'padding': 0,
			'margin': 0,
			'line-height': 0,
			'list-style-type': 'none',
			'width': '105%'
		};
		
		var tileContainerCss = {
			'border': 0,
			'padding': 0,
			'margin': 0,
			'display': isVeryOldBrowser ? 'inline' : 'inline-block', // for compatibility with old IE
			'zoom': 1
		};
		
		this._computeTileSize = function(isWidth, index){
			// Internal method. compute the size of every tile.
			var totalSize = Math.floor(isWidth ? $ele.width() : $ele.height());
			var num = this.options[isWidth ? 'cols' : 'rows'];
			
			return Math.floor(totalSize / num) + (index < (totalSize % num) ? 1: 0);
		};
		// bind 'this' for following process.
		var computeTileSize = $.proxy(this._computeTileSize, this);
		
		this._computeImgPos = function(isLeft, index){
			// Internal method. compute the position of every tile for css background-position value.
			var totalSize = isLeft ? $ele.width() : $ele.height();
			var num = this.options[isLeft ? 'cols' : 'rows'];
			
			return ((Math.floor(totalSize / num) * index + Math.min(index,  (totalSize % num))) * -1) + 'px';
		};
		// bind 'this' for following process.
		var computeImgPos = $.proxy(this._computeImgPos, this);
		
		// This array has the references to every Tile object with several status parameters. 
		var tiles = this.tiles = []; 
		
		// select the tile constructor
		var tileConstructor = this.options['isCSS3Supported'] ? Tile : AltTile;
		
		//build the HTML structure
		$ele.html('<!-- This section is built by Tilamic constructor of tilamic.js automatically. -->');
		
		for(var row = 0; row < this.options['rows']; row++){
			var $r = $('<ul>').css(rowContainerCss);
			for (var col = 0; col < this.options['cols']; col++){
				var li = $('<li>').css({
					'width': computeTileSize(true, col),
					'height': computeTileSize(false, row)
				}).css(tileContainerCss).appendTo($r);
				
				tiles.push({
					'row': row,
					'col': col,
					'isActive': true,
					'origin-x': '50%',
					'origin-y': '50%',
					'tileObject': new tileConstructor(li, {
						'imgTop': computeImgPos(false, row),
						'imgLeft': computeImgPos(true, col),
						'imgWidth': $ele.width(),
						'imgHeight': $ele.height(),
						'importImgPaths': imgPaths,
						'attrPrefix': this.options['attrPrefix']
					})
				});
			};
			$r.appendTo($ele);
		};
	};
	
	Tilamic.prototype._controlOrigin = function(keyword){
		// Internal method. Setup the css transform-origin of 'isActive' tiles.
		$.each(this.tiles, function(index, val){
			if(val['isActive']){
				var cssValue = val['origin-x'] + ' ' + val['origin-y'] + ' 0';
				val['tileObject'].setInnerTileCss({
					'transform-origin': cssValue
				});
			}
		});
	};
	
	Tilamic.prototype.flip = function(imgID, options){
		// All of 'isActive' tiles flip in unison.
		var defaultOptions = {
			'isAxisX': false,
			'isReverse': false
		};
		options = $.extend({}, defaultOptions, options);
		this._controlOrigin();
		$.each(this.tiles, function(index, val){
			if(val['isActive']){
				val['tileObject'].flip(imgID, options['isAxisX'], options['isReverse']);
			}
		});
	};
	
	Tilamic.prototype.seqFlip = function(imgID, options){
		// All of 'isActive' tiles flip in sequence.
		var defaultOptions = {
			'delay': 100,
			'isAxisX': false,
			'isReverse': false,
			'isZtoA': false
		};
		options = $.extend({}, defaultOptions, options);
		this._controlOrigin();
		var activeIndex = options['isZtoA'] ? this.tiles.length : 0;
		$.each(this.tiles, function(index, val){
			if(val['isActive']){
				setTimeout(function(){
					val['tileObject'].flip(imgID, options['isAxisX'], options['isReverse']);
				}, activeIndex * options['delay']);
				options['isZtoA'] ? activeIndex-- : activeIndex++;
			};
		});
	};
	
	Tilamic.prototype.filter = function(expr){
		// construct a new Tilamic object having the matching tiles as 'isActive'.
		var ret = $.extend(true, {}, this);
		var tiles = ret.tiles;
		$.each(tiles, function(index, val){
			if(!val['isActive']){
				return;
			};
			val['isActive'] = expr(index, val['col'], val['row']);
		});
		return ret;
	};
	
	Tilamic.prototype.setOrigin = function(keyword){
		// construct a new Tilamic object 'origin-x' and 'origin-y' property of the tiles are modified.
		var computeOrigin = function(self){
			var computeDistance = function(isX, colOrRow){
				//compute the distance from top-left of the tile to the origin.
				var totalPercent = 100 * self.options[isX ? 'cols' : 'rows'];
				
				return (totalPercent / 2 - 100 * colOrRow) + '%';
			};
			return {
				'each': function(isX, col, row){
					return '50%';
				},
				'centerOfAll': function(isX, col, row){
					if(isX){
						return computeDistance(isX, col);
					};
					return computeDistance(isX, row);
				},
				'centerOfRow': function(isX, col, row){
					if(isX){
						return computeDistance(isX, col);
					};
					return '50%';
				},
				'middleOfCol': function(isX, col, row){
					if(isX){
						return '50%';
					};
					return computeDistance(isX, row);
				}
			};
		}(this);
		var ret = $.extend(true, {}, this);
		if(!(keyword in computeOrigin) || !this.options['isCSS3Supported']){
			return ret;
		};
		var tiles = ret.tiles;
		$.each(tiles, function(index, val){
			val['origin-x'] = computeOrigin[keyword](true, val['col'], val['row']);
			val['origin-y'] = computeOrigin[keyword](false, val['col'], val['row']);
		});
		return ret;
	};
	
	Tilamic.prototype.resize = function(){
		// To make your content with responsive design, you should bind this method to window 'resize' event.
		// This method resize ALL of the tiles ALWAYS. Even the Tilamic object is constructed by the 'filter' method.
		$ele = this.$ele;
		var eleWidth = $ele.width();
		
		// set the element height.
		$ele.css('height', Math.round(eleWidth * this.options['aspectRatio']));
		
		var computeTileSize = $.proxy(this._computeTileSize, this);
		
		// resize the tile containers
		$ele.find('ul').each(function(ulIndex){
			$(this).find('li').each(function(liIndex){
				$(this).css({
					'width': computeTileSize(true, liIndex),
					'height': computeTileSize(false, ulIndex)
				});
			});
		});
		
		// reposition the images on the tiles.
		var handleTile = null, tileObject = null, tileCss = null, tiles = this.tiles, computeImgPos = $.proxy(this._computeImgPos, this);
		var isCSS3Supported = this.options['isCSS3Supported'];
		var tileBasicCss = isCSS3Supported ? {
			'background-size': $ele.width() + 'px ' + $ele.height() + 'px'
		} : {
			'width': $ele.width() + 'px',
			'height': $ele.height() + 'px'
		};
		for(var i = 0; i < tiles.length; i++){
			handleTile = tiles[i];
			tileCss = $.extend((isCSS3Supported ? {
				'background-position': computeImgPos(true, handleTile['col']) + ' ' + computeImgPos(false, handleTile['row'])
			} : {
				'top': computeImgPos(false, handleTile['row']),
				'left': computeImgPos(true, handleTile['col'])
			}), tileBasicCss);
			handleTile['tileObject'].setInnerTileCss(tileCss);
		};
	};
	
	Tilamic.prototype.getCurrentImgID = function(index){
		// return the ID of selected image of the tile. 
		index = index || 0;
		if(index < 0){
			index = index + this.tiles.length;
		};
		if(!(0 <= index && index < this.tiles.length)){
			throw new Error('Index Error');
		};
		return this.tiles[index]['tileObject'].getCurrentImgID();
	};
	
	Tilamic.prototype.on = function(events, data, handler){
		// attaches event handlers to the 'isActive' tiles;
		$tileLi = this.$ele.find('li');
		
		if($.type(data) === 'function'){
			handler = data;
			data = {};
		};
		
		$.each(this.tiles, function(index, val){
			if(!val['isActive']){
				return;
			};
			$tileLi.eq(index).on(events, $.extend({}, {'tileIndex': index}, data), handler);
		});
	};
	
	// window.Tile = Tile;
	// window.AltTile = AltTile;
	window.Tilamic = Tilamic;
})(window, jQuery);