/**
 * @name 右键菜单jcontextmenu插件
 * @description 基于jQuery开发的一款简单的右键菜单插件，提供通用的参数、事件、方法等功能
 * @version 1.0.0
 * @author caojianping 2016/10/25
 */
; (function ($, window, document, undefined) {
    //右键菜单对象
    var ContextMenu = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };

    ContextMenu.prototype.constructor = ContextMenu;

    //右键菜单对象扩展方法
    ContextMenu.prototype = {
        //初始化
        init: function () {
            var that = this;
            //失去焦点关闭右键菜单
            $(document).on('click.jcontextmenu', function (event) {
                event.stopPropagation();
                $('.jcontextmenu:visible').hide();
            });
            return that.$elements.each(function () {
                var disabled = that.cacheData(this);
                if (disabled === false) {
                    that.trigger(this);
                }
            });
        },
        //缓存数据
        cacheData: function (element) {
            var that = this,
                data = $.data(element, 'jcontextmenu');
            if (!data) {
                data = $.extend({}, $.fn.jcontextmenu.defaults, that.options || {});
            } else {
                $(element).off('.jcontextmenu');
                data = $.extend(data, that.options || {});
            }
            $.data(element, 'jcontextmenu', data);
            return data.disabled;
        },
        //右键菜单触发
        trigger: function (element) {
            var that = this;
            $(element).on('contextmenu.jcontextmenu', { target: element }, function (event) {
                that.create(event);
                return false;
            });
        },
        //创建自定义右键菜单
        create: function (event) {
            var that = this,
                $jcontextmenu = $('.jcontextmenu');
            if ($jcontextmenu.length <= 0) {
                $jcontextmenu = $('<div class="jcontextmenu"><div class="menu"></div></div>');
                $(document.body).append($jcontextmenu);
            }
            var $menu = $jcontextmenu.children('.menu');
            that.loadMenu($menu, event);
            that.setStyle($jcontextmenu, event);
        },
        //加载菜单列表
        loadMenu: function (menu, event) {
            var that = this,
                data = $.data(event.data.target, 'jcontextmenu');
            menu.empty();
            that.recurseLoadMenu(menu, data.menus, event);
        },
        //递归加载菜单列表
        recurseLoadMenu: function (menu, menus, event) {
            var that = this;
            for (var i = 0; i < menus.length; i++) {
                var item = menus[i],
                    $menuitem;
                if (item.type === 'menuitem') {
                    var hasId = item.id ? ' id="' + item.id + '"' : '';
                    var hasSubmenus = item.submenus ? '<span class="arrow">></span>' : '';
                    $menuitem = $('<div class="menuitem"><a' + hasId + '>' + item.text + hasSubmenus + '</a></div>');
                    //绑定事件
                    (function (menuitem, item) {
                        menuitem.on('mouseover.jcontextmenu mouseout.jcontextmenu', function (event) {
                            if (event.type === 'mouseover') {
                                $(this).children('.submenu').show();
                            } else if (event.type === 'mouseout') {
                                $(this).children('.submenu').hide();
                            }
                        });
                        menuitem.on('click.jcontextmenu', function () {
                            if (item.handler) {
                                item.handler.call(this, event);
                            }
                        });
                    })($menuitem, item);
                    //填充子菜单
                    if (item.submenus) {
                        var $submenu = $('<div class="submenu"></div>');
                        $menuitem.append($submenu);
                        that.recurseLoadMenu($submenu, item.submenus, event);
                    }
                } else if (item.type === 'separator') {
                    $menuitem = $('<div class="separator"></div>');
                }
                menu.append($menuitem);
            }
        },
        //设置插件样式
        setStyle: function (jcontextmenu, event) {
            jcontextmenu.css({
                "left": event.pageX,
                "top": event.pageY
            });
            jcontextmenu.show();
        }
    };

    $.fn.extend({
        jcontextmenu: function (options) {
            //1.插件传入配置参数；
            //2.插件传入方法名称、及方法参数；
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.jcontextmenu.methods[options](this, args);
            }
            return new ContextMenu(this, options).init();
        }
    });

    //默认配置参数
    //包含：配置、事件
    $.fn.jcontextmenu.defaults = {
        disabled: false,//是否禁用
        menus: [
            { type: 'menuitem', id: 'menuitem1', text: '菜单一', handler: function (event) { alert('您点击了“菜单一”！'); } },
            { type: 'separator' },
            {
                type: 'menuitem', id: 'menuitem2', text: '菜单二', submenus: [
                    { type: 'menuitem', id: 'menuitem21', text: '子菜单21', handler: function (event) { alert('您点击了“子菜单21”！'); } },
                    { type: 'menuitem', id: 'menuitem22', text: '子菜单22', handler: function (event) { alert('您点击了“子菜单22”！'); } }
                ]
            }
        ],//右键菜单列表
        onStart: function () { },
        onStop: function () { }
    };

    //默认方法
    $.fn.jcontextmenu.methods = {
        options: function (elements) {
            return $.data(elements[0], 'jcontextmenu');
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).jcontextmenu({ disabled: false });
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).jcontextmenu({ disabled: true });
            });
        }
    };
})(jQuery, window, document);