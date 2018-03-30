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

## 高清图问题

低版本安卓有兼容性问题

使用 `css-image-set` [兼容性](https://caniuse.com/css-image-set/embed)

```css
.example {
  background-image: -webkit-image-set( "test.png" 1x, "test-2x.png" 2x, "test-print.png" 600dpi );
}
```

使用 `@media`

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

使用 `srcset` [兼容性](https://caniuse.com/srcset/embed)

```html
<img src="test.png" srcset="test.png 1x, test-2x.png 2x, test-3x.png 3x">
```

使用插件 lazyload，延迟加载img并实现 srcset 的功能

## 1px问题

什么是 1像素问题 ？ 我们说的1像素，就是指1CSS像素。问题就是设计师实际了一条线，本来是1像素，但是在有些设备上，用了横竖都是3的物理像素（即：3x3=9像素）来显示这1像素（即：dpr=3），导致在这些设备上，这条线看上去非常粗！

使用css3的 scaleY(0.5)

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

使用lib-flexible，将将页面整体所缩小1/2

