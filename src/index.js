
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.Scroll = factory());
}(this, (function () {
    'use strict'

    
    var animate_algorthim = {
        linear: function (t, b, c, d) {
            return c * t / d + b;
        },
        'ease-in': function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        'ease-out': function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
    }

    var Animate = function (dom) {
        this.dom = dom;
        this.startTime = 0;
        this.startPos = 0;
        this.endPos = 0;
        this.propertyName = null;
        this.easing = null;
        this.duration = null;
    }

    Animate.prototype = {
        start: function (propertyName, endPos, duration, easing) {
            this.startTime = +new Date;
            this.startPos = getProperty(this.dom, propertyName);
            this.propertyName = propertyName;
            this.endPos = endPos;
            this.duration = duration;
            this.easing = animate_algorthim[easing];

            var that = this;

            var timerId = setInterval(function () {
                if (that.step() === false) {
                    clearInterval(timerId);
                }
            }, 19);
        },
        step: function () {
            var t = +new Date;
            if (t >= this.startTime + this.duration) {
                this.update(this.endPos);
                return false;
            }

            var pos = this.easing(t - this.startTime, this.startPos, this.endPos - this.startPos, this.duration);

            this.update(pos);
        },
        update: function (pos) {
            this.dom.style[this.propertyName] = pos + 'px';
        }
    }

    function isIE(version){
        var UA = window.navigator.userAgent;

        var reg = new RegExp("msie "+ version +"\\.0|trident", 'i');

        return reg.test(UA);
    }

    var isIE8 = isIE(8);

    function getProperty(ele, propertyName) {

        var elRect = ele.getBoundingClientRect();
        var clientRect = {};

        //ie8 say clientRect is read-only
        //make them happy
        if(isIE8){
            for(var key in elRect){
                clientRect[key] = elRect[key];
            }

            clientRect.width = ele.clientWidth;
            clientRect.height = ele.clientHeight;

            return clientRect[propertyName];
        }

        return elRect[propertyName];

        //return ele.getBoundingClientRect()[propertyName];
    }

    function query(id) {
        return document.getElementById(id);
    }

    function addListener(ele, type, cb) {
        if (window.addEventListener) {
            return ele.addEventListener(type, cb);
        }

        return ele.attachEvent('on' + type, cb);

    }

    function createElement(tag, context, options) {
        context = context || document.body;

        var ele = document.createElement(tag);

        if(options){
            ele.className = options.className || '';
            ele.innerText = options.text || '';
        }



        context.appendChild(ele);

        return ele;
    }

    function isImplementsStyleProperty(ele, propertyName) {
        return propertyName in ele.style;
    }

    function updateCssText(ele, cssObj) {

        var cssString;

        for (var key in cssObj) {
            ele.style[key] = cssObj[key];
        }
    }

    function init$el(options) {

        var className = options.scrollClassName ? options.scrollClassName : '_scroll_slide_bar';


        this.$el = createElement('div', this.page.$warp, {
            className: className
        });
        //this.$el.className = 

        updateCssText(this.$el, {
            position: 'absolute'
        });
    }

    function initEvents() {

        var is_click_scroll = false;
        var is_touch_scroll = false;
        var startPos;
        var endPos;

        var that = this;

        function getPos(e) {
            var e = e || window.event;
            var left = getProperty(e.target || e.srcElement, 'left');


            if (e.touches && e.touches[0]) {
                return e.touches[0].clientX - left;
            } else if (e.changedTouches && e.changedTouches[0]) {
                return e.changedTouches[0].clientX - left;
            } else {
                return e.offsetX;
            }

            //return e.clientX || (e.touches ? e.touches[0].clientX : e.changedTouches[0].clientX);
        }

        addListener(this.$el, 'mousedown', function (e) {
            is_click_scroll = true;

            startPos = getPos(e);
        });

        addListener(this.$el, 'mouseup', moveEnd);

        addListener(this.$el, 'mouseleave', moveEnd);



        addListener(this.$el, 'touchstart', function (e) {
            is_touch_scroll = true;
            startPos = getPos(e);
        });

        addListener(this.$el, 'touchend', moveEnd);

        addListener(document, 'mousemove', function (e) {
            if (is_click_scroll) {
                //endPos = getPos(e);
                move.call(this, e);
            }
        });

        addListener(document, 'touchmove', function (e) {

            e.preventDefault();

            if (is_touch_scroll) {
                //endPos = getPos(e);
                move.call(this, e);
            }
        });

        function move(e) {

            var e = e || window.event;

            endPos = getPos(e);

            var left = getProperty(that.$el, 'left');

            var _SWITCH_PAGE_PERCENT = that.$options.tick || 30;

            var diff = endPos - startPos;

            //console.log(e);

            updateCssText(that.$el, {
                left: left + diff + 'px'
            });

            if (Math.abs((left / that.page.warpW) * 100) > _SWITCH_PAGE_PERCENT) {

                //if (!that.page.checkPageLimit()){

                var page = that.page.currentPage;

                if (left > 0 && page < that.page.maxPage) {
                    ++page
                } else if (left <= 0 && page > 1) {
                    --page;
                } else {
                    return;
                }

                //left > 0 ? ++that.page.currentPage : --that.page.currentPage;
                that.page.switchPage(page);
                //}

                moveEnd(e);
            }

        }

        function moveEnd(e) {
            is_click_scroll = false;
            is_touch_scroll = false;
            var animate = new Animate(that.$el);
            animate.start('left', 0, 100, 'ease-in');
        }

    }


    var doAnimate = (function () {

        if(isImplementsStyleProperty(document.documentElement, 'transition')){
            return function (el, easing, duration, endPos) {

                    updateCssText(el, {
                        //transition: easing + ' ' + duration / 1000 + 's'
                        top: -endPos + 'px'
                    });
            }
        }

        return function (el, easing, duration, endPos) {

            if(isIE8 && !(easing in animate_algorthim)){
                easing = 'ease-in';
            }

            var animate = new Animate(el);
            animate.start('top', -endPos, duration, easing);
        }
    }())

    function Scroll(options) {
        this.$el = null;
        this.inited = false;
        this.$options = options;
        this._init(options);
    }

    function Page(options) {
        this.$el = options.el.nodeType ? options.el : query(options.el);
        this.$warp = this.$el.parentNode;
        this.currentPage = 1;
        this.maxPage = null;
        this.$options = options;
        this.pageHolder = createElement('div', this.$warp, {
            className: options.pageNumClassName ? options.pageNumClassName : 'page-num-item',
            text: this.currentPage
        });
        this._init();
    }

    function noop(){};

    Page.prototype = {
        _init: function () {
            updateCssText(this.$warp, {
                position: 'relative',
                overflow: 'hidden'
            });
            updateCssText(this.$el, {
                position: 'absolute',
                top: 0
            });

            var easing = 'ease-in';
            var duration = 100;

            if (this.$options.transition) {
                easing = this.$options.transition[0];
                duration = this.$options.transition[1];
            }

            this.easing = easing;
            this.duration = duration;

            if(isImplementsStyleProperty(document.documentElement, 'transition')){
                updateCssText(this.$el, {
                    transition: easing + ' ' + duration / 1000 + 's'
                    //top: -endPos + 'px'
                });
            }

            this.pageH = getProperty(this.$el, 'height');
            this.warpW = getProperty(this.$warp, 'width');
            this.warpH = getProperty(this.$warp, 'height');
            this.updateMaxPage();
        },
        move: function (page, pageDiff) {

            var endPos = (this.currentPage - 1) * this.warpH;
            doAnimate(this.$el, this.easing, this.duration, endPos);
        },
        switchPage: function (page) {

            if (page > this.maxPage) {
                page = this.maxPage;
            }

            if (page < 1) {
                page = 1;
            }

            var prev_page = this.currentPage;
            var now_page = page;
            this.currentPage = page;
            this.move(now_page, now_page - prev_page);

            this.pageHolder.innerText = page;

            (this.$options.switchedPage || noop).call(this.scroll, page);
        },
        updateMaxPage: function () {
            var pageH = this.pageH;
            var warpH = this.warpH;

            this.maxPage = Math.ceil(pageH / warpH);
        }
    }

    Scroll.prototype = {
        _init: function (options) {
            if (!options.el) {
                throw new Error('options must contain el!')
            }

            this.initEvents = false;

            !!!options.lazy && this.update();
        },
        update: function () {
            //this.page.updateMaxPage();
            //this.beforeUpdate();
            (this.$options.beforeUpdate || noop).call(this);
            if (!this.inited) {
                this.page = new Page(this.$options);
                this.page.scroll = this;

                init$el.call(this, this.$options);
            }else{
                this.page.updateMaxPage();
            }

            if(this.page.pageH <= this.page.warpH){
                updateCssText(this.$el, {
                    display: 'none'
                });
            }else{
                updateCssText(this.$el, {
                    display: 'block'
                }); 
            }

            if (!this.initEvents) {
                initEvents.call(this);
                this.initEvents = true;
            }

            this.inited && this.page.switchPage(1);

            this.inited = true;

            (this.$options.updated || noop).call(this);
        }
    }


    return Scroll;
})));