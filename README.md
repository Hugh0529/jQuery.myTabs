# jQuery.myTabs
##illustrate:
jquery plugin:  tab
根据easytab，优化和定制的，主要是熟悉jQuery插件的编写思想

##usage:
`$('#tab-container').myTabs();`

##option:
| option | value | description |
| :-- | :-- | :-- |
| animate | true | 是否有动画效果 |
| tabActiveClass | "active" | 选中tab的class |
| panelActiveClass | "active" | 选中panel的class |
| defaultTab | "li:first-child" | 默认选中的tab |
| animationSpeed | "normal"("slow", "fast", number) | 动画速度，单位毫秒，或者默认的3项（"normal","slow","fast"） |
| tabs | "> ul > li" | tab在container中的位置 |
| transitionIn | "fadeIn"("show") | 出现动画效果（slideDown效果需要代码较多，暂先剔除） |
| transitionOut | "fadeOut"("hide") | 消失动画效果（slideUp效果需要代码较多，暂先剔除） |
| containerClass | |  |
| tabsClass | |  |
| tabClass | |  |
| panelClass | |  |
| cache | true | 若a标签的href被占用，是否缓存 |

##other option:
- `a href="#first"`href为panel的id
- 如果href被占用，可用`data-targetId="#first"`
- `$container.attr('data-myTabs', true);`可通过此attr快速找到内容
- 定义了一些事件接口，可在外部实现:
  - myTabs:initialised
  - myTabs:before
  - myTabs:midTransition
  - myTabs:after
  - myTabs:ajax:beforeSend
  - myTabs:ajax:complete
  
  
      