/*
 * Copyright (c) 2012-2015 S-Core Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview webida - workbench
 *
 * @version: 0.1.0
 * @since: 2013.09.25
 *
 * Src:
 */

/* global timedLogger: true */

var time;
define([(time = timedLogger.getLoggerTime(), 'other-lib/underscore/lodash.min'), 
    'require',
    'src/plugin-manager-0.1', // pm
    './job-manager', // jobManager
    './views-controller', // jobManager
    './command-system/MenuItemTree', // MenuItemTree
    './command-system/context-menu', // contextMenu
    './command-system/top-level-menu', // menubar
    './command-system/toolbar', // toolbar
    'dojo/text!./workbench.html', // markup
    'widgets/views/viewmanager', // vm
    'dijit/focus',
    'dojo/topic',
    'dojo/dom',
    'dojo/dom-class', // domClass
], function(
    _,
    require,
    pm,
    jobManager,
    viewsController,
    MenuItemTree,
    contextMenu,
    menubar,
    toolbar,
    markup,
    vm,
    focus,
    topic,
    dom,
    domClass
) {
    'use strict';

    time = timedLogger.log('loaded modules required by workbench. initializing workbench plugin\'s module', time);

    //console.log('hina: Loading workbench module');

    var time2 = time;
    var menuItemTrees = {};

    var topElem, elem, elemTopPanel, elemCenterPanel;

    $(document.body).append(markup);
    topElem = document.getElementById('app-workbench');
    topElem.focus(); // to enable global shortcut keys at any time

    jobManager.init();

    time2 = timedLogger.log('(a) in initialization of workbench module', time2);

    elem = document.getElementById('app-workbench-border-container');
    viewsController.initialize(elem);

    time2 = timedLogger.log('(b) in initialization of workbench module', time2);

    elemTopPanel = document.getElementById('app-workbench-top-panel');
    elemCenterPanel = document.getElementById('app-workbench-center-panel');

    time2 = timedLogger.log('(c) in initialization of workbench module', time2);

    // extensions of webida.common.workbench:menu
    var exts = pm.getExtensions('webida.common.workbench:menu');
    var menuConfig = pm.getAppConfig('webida.common.workbench')['webida.common.workbench:menu'];
    var predefinedHierarchy = menuConfig ? menuConfig.hierarchy : {};
    var menuItemTree = new MenuItemTree(predefinedHierarchy, exts, topElem, 'workbench', pm.getAppConfig('webida.common.workbench').menuSystem);

    time2 = timedLogger.log('(d) in initialization of workbench module', time2);

    if (menuItemTree instanceof Error) {
        alert('Failed to initialize the top-level menu: ' + menuItemTree.message);
    } else {
        menuItemTrees.workbench = menuItemTree;

        // create top level menu
        menubar.init(menuItemTree);

        // create toolbar menu
        toolbar.init(menuItemTree);
        toolbar.startup();

        /*
        window.setTimeout(function() {
            menuItemTree.getViableItems(function () {
                timedLogger.log('(Y) loading modules contributing to the top-level menu done');
            });
        }, 7);
         */
        topic.subscribe('app.showing', function() {
            menuItemTree.getViableItems(function() {
                timedLogger.log('(Y) loading modules contributing to the top-level menu done');
            });
        });
    }

    time2 = timedLogger.log('(e) in initialization of workbench module', time2);

    var regionsToInitialize;
    var regionsInitialized = 0;

    function checkIfInitDone() {
        if (regionsToInitialize === regionsInitialized) {
            topic.publish('#REQUEST.showApp');
        }
    }

    var panels = pm.getExtensions('webida.common.workbench:panels');
    var views = pm.getExtensions('webida.common.workbench:views');
    regionsToInitialize = panels.length + views.length;

    var locations0 = ['top', 'center'];
    //console.log('panels', panels);
    panels.forEach(function(ext) {
        if (locations0.indexOf(ext.location) < 0) {
            console.error('Error: Illegal extension to "webida.common.workbench:panels" is ignored');
            return;
        }

        //console.log('hina temp: ext.module in workbench.js = ' + ext.module);
        require([ext.module], function(mod) {
            var panel = mod[ext.getPanel]();
            var panelTopElem;
            if (panel) {
                if (ext.location === 'top') {
                    elemTopPanel.appendChild(panel);
                    panelTopElem = elemTopPanel; // TODO: this is temporary
                } else if (ext.location === 'center') {
                    elemCenterPanel.appendChild(panel);
                    panelTopElem = elemCenterPanel; // TODO: this is temporary
                }

                // init context menu of the panel
                var pluginManifest = ext.__plugin__.manifest;
                var pluginName = pluginManifest.name;
                var menuExtPoint = pluginManifest.extensionPoints &&
                    pluginManifest.extensionPoints[pluginName + ':menu'];
                addContextMenuHandler(pluginName, menuExtPoint, panelTopElem);
                // end of 'init context menu of the panel'

                mod[ext.onPanelAppended]();
                regionsInitialized++;
                checkIfInitDone();

                //console.log('onPanelAppended done');
            } else {
                console.error('Error: Illegal return value from an extension to "webida.common.workbench:panels"');
            }
        });

    });

    time2 = timedLogger.log('(f) in initialization of workbench module', time2);

    // extensions of webida.common.workbench:views
    var locations1 = ['top', 'left', 'right', 'bottom', 'center'];
    views.forEach(function(ext) {
        if (locations1.indexOf(ext.location) < 0) {
            console.error('Error: Illegal extension to "webida.common.workbench:views" is ignored');
            return;
        }

        //console.log('hina temp: ext.module in workbench.js = ' + ext.module);
        require([ext.module], function(mod) {
            var view = mod[ext.getView]();
            var viewTopElem;
            if (view) {
                if (ext.location === 'top') {
                    elemTopPanel.appendChild(view);
                    viewTopElem = elemTopPanel; // TODO: this is temporary
                } else if (ext.location === 'center') {
                    elemCenterPanel.appendChild(view);
                    viewTopElem = elemCenterPanel; // TODO: this is temporary
                } else {
                    viewsController._addView(view, ext.location, 0);
                    viewTopElem = view.contentPane.domNode; // TODO: this is temporary
                }

                // init context menu of the view
                var pluginManifest = ext.__plugin__.manifest;
                var pluginName = pluginManifest.name;
                var menuExtPoint = pluginManifest.extensionPoints &&
                    pluginManifest.extensionPoints[pluginName + ':menu'];
                addContextMenuHandler(pluginName, menuExtPoint, viewTopElem);
                // end of 'init context menu of the view'

                mod[ext.onViewAppended]();
                regionsInitialized++;
                checkIfInitDone();

                //console.log('onViewAppended');
            } else {
                console.error('Error: Illegal return value from an extension to "webida.common.workbench:views"');
            }
        });

    });

    time2 = timedLogger.log('(g) in initialization of workbench module', time2);

    if (regionsToInitialize === 0) {
        topic.publish('#REQUEST.showApp');
    }

    $(document.body).focus();
    $(document.body).bind('bubble', function(evt) {
        function collectViableItems(menuHolders, i, accum) {
            if (i === menuHolders.length) {
                require(['./command-system/shortcutKeysDlg'], function(dlg) {
                    var exts;

                    function collectAdditionalShortcuts(i) {
                        if (i === exts.length) {
                            dlg.open(accum, wholeAccum,
                                additionalShortcuts, evt.shortcutHolders || [],
                                _.uniq(evt.bubbleTouchers), false);
                        } else {
                            var ext = exts[i];
                            require([ext.module], function(mod) {
                                var plugin = ext.__plugin__.manifest.name;
                                if (!additionalShortcuts[plugin]) {
                                    additionalShortcuts[plugin] = [];
                                }
                                if (typeof mod[ext.getShortcuts] === 'function') {
                                    var shortcutsOfPlugin = additionalShortcuts[plugin];
                                    var shortcuts = mod[ext.getShortcuts]();
                                    var len = shortcuts.length;
                                    for (var j = 0; j < len; j++) {

                                        var shortcut = shortcuts[j];
                                        var normalizedKeys = MenuItemTree.normalizeKeysStr(shortcut.keys);
                                        if (normalizedKeys) {
                                            var item = {
                                                keys: normalizedKeys,
                                                title: shortcut.title,
                                                desc: shortcut.desc,
                                                viable: shortcut.viable
                                            };
                                            shortcutsOfPlugin.push(item);
                                        } else {
                                            alert('Error: Invalid shortcut key string "' +
                                                shortcut.keys + '" from plug-in ' + plugin);
                                            break;
                                        }
                                    }
                                }

                                collectAdditionalShortcuts(i + 1);
                            });
                        }
                    }

                    var wholeAccum = {};
                    Object.keys(menuItemTrees).forEach(function(pluginName) {
                        wholeAccum[pluginName] = menuItemTrees[pluginName].getWholeItems();
                    });

                    // collect shortcuts registered via webida.common.workbench:shortcutList
                    exts = pm.getExtensions('webida.common.workbench:shortcutList');
                    var additionalShortcuts = {};
                    collectAdditionalShortcuts(0);

                    //dlg.open(accum, wholeAccum, false);
                });
            } else {
                var menuHolder = menuHolders[i];
                var menuItemTree = menuItemTrees[menuHolder];
                menuItemTree.getViableItems(function(items) {
                    if (items) {
                        accum[menuHolder] = items;
                        //accum[menuHolder + '@whole'] = menuItemTree.getWholeItems();
                    }
                    collectViableItems(menuHolders, i + 1, accum);
                });
            }

        }

        if (evt.bubbleTouchers) {
            //console.log('hina temp: evt.menuHolders = ' + evt.menuHolders);
            collectViableItems(_.uniq(evt.menuHolders || []), 0, {});
        } else {
            alert('Keyboard input focus is out of workbench');
        }
    });

    time2 = timedLogger.log('(h) in initialization of workbench module', time2);

    // add bubble event handler to the extensions of webida.common.workbench:shortcutList
    exts = pm.getExtensions('webida.common.workbench:shortcutList');
    exts.forEach(function(ext) {
        require([ext.module], function(mod) {
            if (typeof mod[ext.getEnclosingDOMElem] === 'function') {
                var elem = mod[ext.getEnclosingDOMElem]();
                if (elem) {
                    $(elem).bind('bubble', function(evt) {
                        //console.log('hina temp: bubble event reached to ' + pluginName);
                        if (!evt.shortcutHolders) {
                            evt.shortcutHolders = [];
                        }
                        if (!evt.bubbleTouchers) {
                            evt.bubbleTouchers = [];
                        }
                        var holder = ext.__plugin__.manifest.name;
                        evt.shortcutHolders.push(holder);
                        evt.bubbleTouchers.push(holder);
                    });
                }
            }
        });
    });

    time2 = timedLogger.log('(i) in initialization of workbench module', time2);

    function addContextMenuHandler(pluginName, menuExtPoint, elem) {
        if (menuExtPoint === 'plugins/_extension-points/menu.json') {
            //console.log('hina temp: View/panel ' + pluginName + ' has a context menu');

            var menuExts = pm.getExtensions(pluginName + ':menu');
            if (menuExts.length > 0) {
                //console.log('hina temp: View ' + pluginName + ' has context menu items');
                var menuConfig = pm.getAppConfig(pluginName)[pluginName + ':menu'];
                var predefinedHierarchy = menuConfig ? menuConfig.hierarchy : {};
                var menuItemTree =
                    new MenuItemTree(predefinedHierarchy, menuExts, elem, pluginName,
                        pm.getAppConfig('webida.common.workbench').menuSystem); // TODO: temporary
                if (menuItemTree instanceof Error) {
                    alert('Failed to initialize the context menu of ' +
                        pluginName + ': ' + menuItemTree.message);
                } else {
                    elem.addEventListener('contextmenu', function(evt) {
                        contextMenu.rebuild(menuItemTree, evt);
                        evt.preventDefault();
                        evt.stopPropagation();
                    });

                    menuItemTrees[pluginName] = menuItemTree;
                }
            }
            /*else {
                //console.log('hina temp: View/panel ' + pluginName + ' does not have context menu items');
            } */
        }
    }

    function updateStatusbar() {
        var statusInfos = [];

        if (context.projectPath) {
            statusInfos.push({
                text: context.projectPath,
                tooltip: 'Project'
            });
        }
        if (context.paths) {
            if (context.paths.length > 1) {
                statusInfos.push({
                    text: context.paths.length + ' ' + 'items',
                    tooltip: 'selected item count'
                });
            } else if (context.paths.length === 1) {
                var path = context.paths[0];
                if (context.projectPath && (path.split(context.projectPath).length > 1)) {
                    path = path.split(context.projectPath)[1];
                }
                statusInfos.push({
                    text: path,
                    tooltip: 'Path'
                });
            }
        }

        if (context.etc) {
            var keys = Object.keys(context.etc);
            keys.forEach(function(key) {
                statusInfos.push({
                    text: context.etc[key]
                });
            });
        }

        viewsController.setStatusbarInfos(statusInfos);
    }

    var context = {
        lastFocusedWidget: null,
        paths: null,
        projectPath: null,
        etc: null
    };

    focus.watch('activeStack', function(name, oldValue, newValue) {
        if (newValue.length > 0 && newValue[0] === 'app-workbench-border-container') {
            var id = newValue[newValue.length - 1];
            var widgetNode;
            if ((widgetNode = dom.byId(id))) {
                context.lastFocusedWidget = widgetNode;
            }
        }
    });

    function focusLastWidget() {
        // case editor
        var id;
        if (context.lastFocusedWidget && (id = context.lastFocusedWidget.id) && dom.byId(id)) {
            if (id.indexOf('view_') !== -1) {
                var view = vm.getView(id);
                if (view) {
                    view.select(true);
                }
            } else { // case view
                focus.focus(context.lastFocusedWidget);
            }
        }
    }

    timedLogger.log('(j) in initialization of workbench module', time2);

    timedLogger.log('initialized workbench plugin\'s module', time);

    return {
        appendView: function(view, location) {
            viewsController.appendView(view, location);
        },

        getMenuItemTrees: function() {
            return menuItemTrees;
        },

        /*
        getNullItems : function () {
            return null;
        },
         */
        getBogusItems: function() {
            return {
                'Focus Menu Bar': ['cmnd', 'plugins/workbench/wb-commands', 'focusTopMenubar']
            };
        },
        getWorkspaceSeletionItem: function() {
            return {
                '&Quit': ['cmnd', 'src/app', 'quit']
            };
        },

        getItemsUnderView: function() {
            var items = {};
            items['Select View from &List'] =
                ['cmnd', 'plugins/workbench/views-controller', 'showViewList'];
            items['Toggle &Menu'] =
                ['cmnd', 'plugins/workbench/views-controller', 'toggleMenubar'];
            items['Toggle &Toolbar'] =
                ['cmnd', 'plugins/workbench/views-controller', 'toggleToolbar'];
            items['Toggle &Full-Screen'] =
                ['cmnd', 'plugins/workbench/views-controller', 'toggleFullScreen'];

            return items;
        },

        registToViewFocusList: function(view, opt) {
            var option = {};
            option.fields = {
                title: opt.title
            };
            if (opt.hasOwnProperty('key')) {
                option.key = opt.key;
            }
            viewsController.focusController.registerView(view, option);
        },

        unregistFromViewFocusList: function(view) {
            return viewsController.focusController.unregisterView(view);
        },

        registToElementFocusList: function( /*element, opt*/ ) {
            //return focusManager.registElement(element, opt);
        },

        unregistFromElementFocusList: function( /*element*/ ) {

        },

        menuCallbackShowMenubar: function(index) {
            if (index === 0) {
                viewsController.setMenubarState('show');
            } else {
                viewsController.setMenubarState('hide');
            }
        },

        menuCallbackShowToolbar: function(index) {
            if (index === 0) {
                viewsController.setToolbarState('show');
            } else {
                viewsController.setToolbarState('hide');
            }
        },

        showTopMenubar: function() {
            viewsController.removeClass(viewsController.getWorkbenchTopElement(), 'workbenchMenubarHide');
        },

        hideTopMenubar: function() {
            domClass.addClass(viewsController.getWorkbenchTopElement(), 'workbenchMenubarHide');
        },

        showTopToolbar: function() {
            domClass.removeClass(viewsController.getWorkbenchTopElement(), 'workbenchToolbarHide');
        },

        hideTopToolbar: function() {
            domClass.addClass(viewsController.getWorkbenchTopElement(), 'workbenchToolbarHide');
        },

        isTopMenubarHided: function() {
            return domClass.contains(viewsController.getWorkbenchTopElement(), 'workbenchMenubarHide');
        },

        isTopToolbarHided: function() {
            return domClass.contains(viewsController.getWorkbenchTopElement(), 'workbenchToolbarHide');
        },

        setStatusText: function(text) {
            viewsController.setStatusbarText(text);
        },

        addJob: function(title) {
            return jobManager.addJob(title);
        },

        removeJob: function(id) {
            jobManager.removeJob(id);
        },

        getContext: function() {
            return context;
        },

        setContext: function(paths, etc) {
            if (paths && paths.length > 0) {
                context.paths = paths;
                var path = paths[0].split('/');
                var projectPath;
                if (path.length >= 3) {
                    projectPath = path[0] + '/' + path[1] + '/' + path[2];
                } else {
                    projectPath = '';
                }
                context.projectPath = projectPath;
            }

            if (etc) {
                context.etc = etc;
            } else {
                context.etc = null;
            }

            updateStatusbar();
            topic.publish('workbench.context.changed', context);
        },

        focusLastWidget: focusLastWidget,

        openWorkspaceView: function() {
            // left pane is closed
            if (viewsController.isPanelCollapsed('left')) {
                viewsController.expandPanel('left');
            }
        },

        toggleFullScreen: function() {
            viewsController.toggleFullScreen();
        }

    };
});