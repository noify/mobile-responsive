# 移动端自适应解决方案

待完成

```bash
# 安装依赖
npm install

# 开发环境
npm run dev

# 生产环境
npm run build
```

## 布局

使用 vw, vh, vmin, vmax

- vw：是Viewport's width的简写,1vw等于window.innerWidth的1%
- vh：和vw类似，是Viewport's height的简写，1vh等于window.innerHeihgt的1%
- vmin：vmin的值是当前vw和vh中较小的值
- vmax：vmax的值是当前vw和vh中较大的值

不过该方案有些小小的兼容性问题，大约4.5%的安卓手机(安卓系统4.4以下)不支持，所以为了兼容性可以考虑使用 flexible + rem。

## 高清图

背景图使用 `css-image-set` [兼容性](https://caniuse.com/css-image-set/embed)

```css
.example {
  background-image: -webkit-image-set( "test.png" 1x, "test-2x.png" 2x, "test-print.png" 600dpi );
}
```

背景图使用 `@media`

```css
/* 普通显示屏(设备像素比例小于等于1)使用1倍的图 */
.css{
  background-image: url(img_1x.png);
}

/* 高清显示屏(设备像素比例大于等于2)使用2倍图  */
@media only screen and (-webkit-min-device-pixel-ratio:2){
  .css{
    background-image: url(img_2x.png);
  }
}

/* 高清显示屏(设备像素比例大于等于3)使用3倍图  */
@media only screen and (-webkit-min-device-pixel-ratio:3){
  .css{
    background-image: url(img_3x.png);
  }
}
```

img 使用 `srcset` [兼容性](https://caniuse.com/srcset/embed)

```html
<img src="test.png" srcset="test.png 1x, test-2x.png 2x, test-3x.png 3x">
```

使用插件 lazyload，延迟加载 img 并实现 srcset 的功能。

## 1px边框

我们说的1像素，就是指1CSS像素。问题就是设计师设计了一条只有1像素的线，但是在有些设备上，用了横竖都是3的物理像素（即：3x3=9像素）来显示这1像素（即：dpr=3），导致在这些设备上，这条线看上去非常粗！

使用css3的 transform

```css
.div:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: auto;
  right: auto;
  height: 1px;
  width: 100%;
  background-color: #c8c7cc;
  display: block;
  z-index: 15;
  -webkit-transform-origin: 50% 0%;
          transform-origin: 50% 0%;
}
@media only screen and (-webkit-min-device-pixel-ratio: 2) {
  .div:before {
    -webkit-transform: scaleY(0.5);
            transform: scaleY(0.5);
  }
}
@media only screen and (-webkit-min-device-pixel-ratio: 3) {
  .div:before {
    -webkit-transform: scaleY(0.33);
            transform: scaleY(0.33);
  }
}
```

使用 `border-image`

使用高度仅为1px的linenew.png，代替border-color

```css
.border-image-1px {
  border-bottom: 1px solid #666;
}
@media only screen and (-webkit-min-device-pixel-ratio: 2) {
  .border-image-1px {
    border-bottom: none;
    border-width: 0 0 1px 0;
    border-image: url(linenew.png) 0 0 2 0 stretch;
  }
}
```