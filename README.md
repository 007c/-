- 使用
- 需要导入src中的 index.css和 index.js文件
```html
  <link rel="stylesheet" href="./src/index.css">
  <script src="./src/index.js"></script>
```
index.js 会导出一个Scroll对象，直接使用即可，例：
```javascript
         var scroll = new Scroll({
            el: document.getElementById('page'),
            transition: ['ease-out', 200],
            lazy: true,
            tick: 15,
            scrollClassName: '_scroll_slide_bar_test',
            //pageNumClassName: '_page_num_item_test',
            switchedPage: function (page) {
                console.log(page);
            },
            beforeUpdate: function () {
                console.log('beforeUpdate');
            },
            updated: function () {
                console.log('updated');
            }
        });
```
配置参数，new Scroll的时候需要传入一个options参数，可选的字段有

 - el type:[string | DOMElement]  需要滚动分页的容器元素，可传入元素的id或者DOM结点。
 - transition type:[Array] 页码切换的动画，需要传入一个数组，第一项为transition的过渡效果，第二项为过渡事件（不支持css3属性的浏览器下仅支持 `linear`, `ease-in`, `ease-out`）三种过渡效果，默认过渡为 `ease-in`.
 - lazy type:[bool] 懒更新选项，默认为false，改选项决定是否在构造函数调用时初始化scroll，若设置为true，则需要手动调用Scroll实例方法来初始化scroll。
 - tick type:[number] 切换页码时滑动块移动距离所占整个滑块长度的百分比，（若设置为 10则表示滑动10%的距离就会切页），默认为30.
 - scrollClassName type: [string] 滑块条的class属性值， 默认为 `_scroll_slide_bar`.
 - pageNumClassName type: [string] 页码现实块的class属性值， 默认为 `page-num-item`.
 
 - switchedPage type: [function] 切换页码之后的钩子函数.
 - beforeUpdate type: [function] 钩子函数，在scroll的update方法调用之前执行。
 - updated type [function] 钩子函数，在scroll的update方法调用后执行。
 - 实例方法
  + scroll.update 更新scroll配置。（常在由于滑动内容为异步加载而无法获取其初始元素的尺寸下使用。）
