# jQuery.myTabs
jquery plugin:  tab
根据easytab，优化和定制的，主要是熟悉jQuery插件的编写思想

使用：<br>
<code>
    $('#tab-container').myTabs();
</code><br>
<p>可配置选项：</p>
<table>
  <tr style="background-color: azure;"><td>options</td><td>value</td><td>说明</td></tr>
  <tr><td>animate</td><td>true</td><td>是否有动画效果</td></tr>
  <tr><td>tabActiveClass</td><td>"active"</td><td>选中tab的class</td></tr>
  <tr><td>panelActiveClass</td><td>"active"</td><td>选中panel的class</td></tr>
  <tr><td>defaultTab</td><td>"li:first-child"</td><td>默认选中的tab</td></tr>
  <tr><td>animationSpeed</td><td>"normal"("slow", "fast", number)</td><td>动画速度，单位毫秒，或者默认的3项（"normal","slow","fast"）</td></tr>
  <tr><td>tabs</td><td>"> ul > li"</td><td>tab在container中的位置</td></tr>
  <tr><td>transitionIn</td><td>"fadeIn"("show")</td><td>出现动画效果（slideDown效果需要代码较多，暂先剔除）</td></tr>
  <tr><td>transitionOut</td><td>"fadeOut"("hide")</td><td>消失动画效果（slideUp效果需要代码较多，暂先剔除）</td></tr>
  <tr><td>containerClass</td><td></td><td></td></tr>
  <tr><td>tabsClass</td><td></td><td></td></tr>
  <tr><td>tabClass</td><td></td><td></td></tr>
  <tr><td>panelClass</td><td></td><td></td></tr>
  <tr><td>cache</td><td>true</td><td>若a标签的href被占用，是否缓存</td></tr>
</table>
<p>其他配置：</p>
<ul>
  <li><code>a href="#first"</code> href为panel的id</li>
  <li>如果href被占用，可用<code>data-targetId="#first"</code></li>
  <li><code>$container.attr('data-myTabs', true);</code> 可通过此attr快速找到内容</li>
  <li>定义了一些事件接口，可在外部实现:
    <ul>
      <li>myTabs:initialised</li>
      <li>myTabs:before</li>
      <li>myTabs:midTransition</li>
      <li>myTabs:after</li>
      <li>myTabs:ajax:beforeSend</li>
      <li>myTabs:ajax:complete</li>
    </ul>
  </li>
</ul>




