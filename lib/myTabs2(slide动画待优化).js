/**
 * Created by chy on 15-8-17.
 */
;(function ($) {
    $.myTabs = function (container, options) {
        var plugin = this,
            pluginName = "myTab",
            $container = $(container),

            defaults = {
                animate: true,
                tabActiveClass: "active",
                panelActiveClass: "active",
                defaultTab: "li:first-child",
                animationSpeed: "normal",
                tabs: "> ul > li",
                // 需要slide成对出现（in和out效果相同），否则会出现问题
                transitionIn: "fadeIn", // "slideUp"
                transitionOut: "fadeOut", // "slideDown"
                containerClass: "",
                tabsClass: "",
                tabClass: "",
                panelClass: "",
                cache: true,
                event: "click",
                panelContext: $container
            },

            $defaultTab,
            $defaultTabLink,
            transitions,
            animationSpeeds = {
                fast: 200,
                normal: 400,
                slow: 600
            },

            settings;


        plugin.init = function() {

            plugin.settings = settings = $.extend({}, defaults, options);
            settings.bind_str = settings.event + "." + pluginName;

            // Convert 'normal', 'fast', and 'slow' animation speed settings to their respective speed in milliseconds
            if ( typeof(settings.animationSpeed) === 'string' ) {
                settings.animationSpeed = animationSpeeds[settings.animationSpeed];
            }
            // default speed
            if (!settings.animationSpeed) {
                settings.animationSpeed = animationSpeeds[defaults.animationSpeed];
            }

            // Store myTabs object on container so we can easily set
            // properties throughout
            $container.data('myTabs', {});

            plugin.setTransitions();

            plugin.getTabs();

            addClasses();

            setDefaultTab();

            bindToTabClicks();

            // Append data-myTabs HTML attribute to make easy to query for
            // myTabs instances via CSS pseudo-selector
            $container.attr('data-myTabs', true);
        };

        // Set transitions for switching between tabs based on options.
        // Could be used to update transitions if settings are changes.
        plugin.setTransitions = function() {
            transitions = ( settings.animate ) ? {
                show: settings.transitionIn,
                hide: settings.transitionOut,
                speed: settings.animationSpeed,
                halfSpeed: settings.animationSpeed / 2
            } :
            {
                show: "show",
                hide: "hide",
                speed: 0,
                halfSpeed: 0
            };
        };

        // Find and instantiate tabs and panels.
        // Could be used to reset tab and panel collection if markup is
        // modified.
        plugin.getTabs = function() {
            var $matchingPanel;

            // Find the initial set of elements matching the setting.tabs
            // CSS selector within the container
            plugin.tabs = $container.find(settings.tabs),

                // Instantiate panels as empty jquery object
                plugin.panels = $(),

                plugin.tabs.each(function(){
                    var $tab = $(this),
                        $a = $tab.children('a'),

                    // targetId is the ID of the panel, which is either the
                    // `href` attribute for non-ajax tabs, or in the
                    // `data-target` attribute for ajax tabs since the `href` is
                    // the ajax URL
                        targetId = $tab.children('a').data('target');

                    $tab.data('myTabs', {});

                    // If the tab has a `data-target` attribute, and is thus an ajax tab
                    if ( targetId !== undefined && targetId !== null ) {
                        $tab.data('myTabs').ajax = $a.attr('href');
                    } else {
                        targetId = $a.attr('href');
                    }
                    // 利用id寻找，但需要targetId以#开头符合规范。如果不，则会影响效率且找不到。
                    // 以下代码是检查用，如果没有以#开头，则加上。
                    // targetId = targetId.match(/#([^\?]+)/); //默认正则
                    // targetId = targetId.match(/#([^]+)/);  //另一种正则
                    //if(targetId) {
                    //    targetId = targetId[1];
                    //}
                    $matchingPanel = settings.panelContext.find(targetId);

                    // If tab has a matching panel, add it to panels
                    if ( $matchingPanel.length ) {

                        // Store panel height before hiding
                        $matchingPanel.data('myTabs', {
                            position: $matchingPanel.css('position'),
                            visibility: $matchingPanel.css('visibility')
                        });

                        // Don't hide panel if it's active (allows `getTabs` to be called manually to re-instantiate tab collection)
                        $matchingPanel.not(settings.panelActiveClass).hide();

                        plugin.panels = plugin.panels.add($matchingPanel);

                        $tab.data('myTabs').panel = $matchingPanel;

                        // Otherwise, remove tab from tabs collection
                    } else {
                        plugin.tabs = plugin.tabs.not($tab);
                        if ('console' in window) {
                            console.warn('Warning: tab without matching panel for selector \'#' + targetId +'\' removed from set');
                        }
                    }
                });
        };

        // Select tab and fire callback
        plugin.selectTab = function($clicked, callback) {
            var url = window.location,
                $targetPanel = $clicked.parent().data('myTabs').panel;
                ajaxUrl = $clicked.parent().data('myTabs').ajax;

            // Tab is not active and panel is not active => select tab
            // Cache is disabled => reload (e.g reload an ajax tab).
            if( (! $clicked.hasClass(settings.tabActiveClass) || ! $targetPanel.hasClass(settings.panelActiveClass))
                || ! settings.cache ) {
                activateTab($clicked, $targetPanel, ajaxUrl, callback);
            }
        };

        // Add CSS classes to markup (if specified), called by init
        var addClasses = function() {
            $container.addClass(settings.containerClass);
            //设置tab parent（ul）样式，可以直接写好
            //plugin.tabs.parent().addClass(settings.tabsClass);
            plugin.tabs.addClass(settings.tabClass);
            plugin.panels.addClass(settings.panelClass);
        };

        // Set the default tab, whether from hash (bookmarked) or option,
        // called by init
        var setDefaultTab = function() {
            // 忽略hash（后续根据需求补增）
            $defaultTab = plugin.tabs.parent().find(settings.defaultTab);
            if ( $defaultTab.length === 0 ) {
                $.error("The specified default tab ('" + settings.defaultTab + "') could not be found in the tab set ('" + settings.tabs + "') out of " + plugin.tabs.length + " tabs.");
            }

            $defaultTabLink = $defaultTab.children("a");
            if($defaultTabLink.length > 0) {
                $defaultTabLink = $defaultTabLink[0].href;
            }

            activateDefaultTab();
        };

        // Activate defaultTab, called by setDefaultTab
        var activateDefaultTab = function(/*$selectedTab*/) {
            var defaultPanel = $( $defaultTab.data('myTabs').panel),
                defaultAjaxUrl = $defaultTab.data('myTabs').ajax;

                if ( defaultAjaxUrl && (!settings.cache || !$defaultTab.data('myTabs').cached) ) {
                    $container.trigger('myTabs:ajax:beforeSend', [$defaultTabLink, defaultPanel]);
                    defaultPanel.load(defaultAjaxUrl, function(response, status, xhr) {
                        $defaultTab.data('myTabs').cached = true;
                        $container.trigger('myTabs:ajax:complete', [$defaultTabLink, defaultPanel, response, status, xhr]);
                    });
                }

                $defaultTab.data('myTabs').panel
                    .show()
                    .addClass(settings.panelActiveClass);

                $defaultTab
                    .addClass(settings.tabActiveClass)
                    .children()
                    .addClass(settings.tabActiveClass);

            // Fire event when the plugin is initialised
            $container.trigger("myTabs:initialised", [$defaultTabLink, defaultPanel]);
        };

        // Bind tab-select funtionality to namespaced click event, called by
        // init
        var bindToTabClicks = function() {
            plugin.tabs.children("a").bind(settings.bind_str, function(e) {

                // Select the panel for the clicked tab
                plugin.selectTab( $(this) );

                // Don't follow the link to the anchor
                e.preventDefault;
            });
        };

        var activateTab = function($clicked, $targetPanel, ajaxUrl, callback) {
            plugin.panels.stop(true,true);

            var $visiblePanel = plugin.panels.filter(":visible"),
                $panelContainer = $targetPanel.parent(),
                targetHeight,
                visibleHeight,
                heightDifference,
                showPanel;

            //if (settings.animate) {
            //    targetHeight = getHeightForHidden($targetPanel);
            //    visibleHeight = $visiblePanel.length ? setAndReturnHeight($visiblePanel) : 0;
            //    heightDifference = targetHeight - visibleHeight;
            //}

            showPanel = function() {
                // At this point, the previous panel is hidden, and the new one will be selected
                //$container.trigger("myTabs:midTransition", [$clicked, $targetPanel, settings]);

                // Gracefully animate between panels of differing heights, start height change animation *after* panel change if panel needs to contract,
                // so that there is no chance of making the visible panel overflowing the height of the target panel
                //if (settings.animate && settings.transitionIn == 'fadeIn') {
                //    if (heightDifference < 0)
                //        $panelContainer.animate({
                //            height: $panelContainer.height() + heightDifference
                //        }, transitions.halfSpeed ).css({ 'min-height': '' });
                //}

                $targetPanel
                    [transitions.show](transitions.speed, function(){
                    $panelContainer.css({height: '', 'min-height': ''}); // After the transition, unset the height
                    //$container.trigger("myTabs:after", [$clicked, $targetPanel, settings]);
                    // callback only gets called if selectTab actually does something, since it's inside the if block
                    if(typeof callback == 'function'){
                        callback();
                    }
                });
            };

            if ( ajaxUrl && (!settings.cache || !$clicked.parent().data('myTabs').cached) ) {
                $container.trigger('myTabs:ajax:beforeSend', [$clicked, $targetPanel]);
                $targetPanel.load(ajaxUrl, function(response, status, xhr){
                    $clicked.parent().data('myTabs').cached = true;
                    $container.trigger('myTabs:ajax:complete', [$clicked, $targetPanel, response, status, xhr]);
                });
            }

            // Gracefully animate between panels of differing heights, start height change animation *before* panel change if panel needs to expand,
            // so that there is no chance of making the target panel overflowing the height of the visible panel
            //if( settings.animate && settings.transitionOut == 'fadeOut' ) {
            //    if( heightDifference > 0 ) {
            //        $panelContainer.animate({
            //            height: ( $panelContainer.height() + heightDifference )
            //        }, transitions.halfSpeed );
            //    } else {
            //        // Prevent height jumping before height transition is triggered at midTransition
            //        $panelContainer.css({ 'min-height': $panelContainer.height() });
            //    }
            //}

            // 之前已经判断过是否active，若是active则不会进行到此
            // Change the active tab *first* to provide immediate feedback when the user clicks
            plugin.tabs.filter("." + settings.tabActiveClass).removeClass(settings.tabActiveClass).children().removeClass(settings.tabActiveClass);
            // 优化
            // $clicked.parent().addClass(settings.tabActiveClass).children().addClass(settings.tabActiveClass);
            $clicked.addClass(settings.tabActiveClass).parent().addClass(settings.tabActiveClass);

            plugin.panels.filter("." + settings.panelActiveClass).removeClass(settings.panelActiveClass);
            $targetPanel.addClass(settings.panelActiveClass);

            if( $visiblePanel.length ) {
                $visiblePanel
                    [transitions.hide](transitions.speed, showPanel);
            }
        };

        //// Get heights of panels to enable animation between panels of
        //// differing heights, called by activateTab
        //var getHeightForHidden = function($targetPanel){
        //
        //    if ( $targetPanel.data('easytabs') && $targetPanel.data('easytabs').lastHeight ) {
        //        return $targetPanel.data('easytabs').lastHeight;
        //    }
        //
        //    // this is the only property easytabs changes, so we need to grab its value on each tab change
        //    var display = $targetPanel.css('display'),
        //        outerCloak,
        //        height;
        //
        //    // Workaround with wrapping height, because firefox returns wrong
        //    // height if element itself has absolute positioning.
        //    // but try/catch block needed for IE7 and IE8 because they throw
        //    // an "Unspecified error" when trying to create an element
        //    // with the css position set.
        //    try {
        //        outerCloak = $('<div></div>', {'position': 'absolute', 'visibility': 'hidden', 'overflow': 'hidden'});
        //    } catch (e) {
        //        outerCloak = $('<div></div>', {'visibility': 'hidden', 'overflow': 'hidden'});
        //    }
        //    height = $targetPanel
        //        .wrap(outerCloak)
        //        .css({'position':'relative','visibility':'hidden','display':'block'})
        //        .outerHeight();
        //
        //    $targetPanel.unwrap();
        //
        //    // Return element to previous state
        //    $targetPanel.css({
        //        position: $targetPanel.data('easytabs').position,
        //        visibility: $targetPanel.data('easytabs').visibility,
        //        display: display
        //    });
        //
        //    // Cache height
        //    $targetPanel.data('easytabs').lastHeight = height;
        //
        //    return height;
        //};
        //
        //// Since the height of the visible panel may have been manipulated due to interaction,
        //// we want to re-cache the visible height on each tab change, called
        //// by activateTab
        //var setAndReturnHeight = function($visiblePanel) {
        //    var height = $visiblePanel.outerHeight();
        //
        //    if( $visiblePanel.data('easytabs') ) {
        //        $visiblePanel.data('easytabs').lastHeight = height;
        //    } else {
        //        $visiblePanel.data('easytabs', {lastHeight: height});
        //    }
        //    return height;
        //};

        plugin.init();
    };

    $.fn.myTabs = function (options) {
        return this.each(function () {
            var $this = $(this),
                plugin = $this.data('myTabs');

            if (plugin === undefined) {
                plugin = new $.myTabs(this, options);
                $this.data('myTabs', plugin);
            }
        });
    };
})(jQuery);