/*global document, window, jQuery*/
(function ($) {
    'use strict';
    var methods = {
        init: function (options) {
            var defaults = {
                menuWidth: 300,
                edge: 'left',
                closeOnClick: false,
                draggable: true,
                backButtonClose: true
            };
            options = $.extend(defaults, options);

            $(this).each(function () {
                var $this = $(this),
                    menu_id = $("#" + $this.attr('data-activates')),
                    $dragTarget,
                    removeMenu,
                    panning = false,
                    menuOut = false;

                // Set history state
                if (options.backButtonClose === true) {
                    window.addEventListener('popstate', function (event) {
                        menuOut = false;
                        panning = false;
                        removeMenu(true);
                    });
                }

                // Set to width
                if (options.menuWidth !== 300) {
                    menu_id.css('width', options.menuWidth);
                }

                // Add Touch Area
                //var $dragTarget;
                if (options.draggable) {
                    $dragTarget = $('<div class="drag-target"></div>').attr('data-sidenav', $this.attr('data-activates'));
                    $('body').append($dragTarget);
                } else {
                    $dragTarget = $();
                }

                if (options.edge === 'left') {
                    menu_id.css('transform', 'translateX(-100%)');
                    $dragTarget.css({
                        'left': 0
                    }); // Add Touch Area
                } else {
                    menu_id.addClass('right-aligned') // Change text-alignment to right
                        .css('transform', 'translateX(100%)');
                    $dragTarget.css({
                        'right': 0
                    }); // Add Touch Area
                }

                // If fixed sidenav, bring menu out
                if (menu_id.hasClass('fixed')) {
                    if (window.innerWidth > 992) {
                        menu_id.css('transform', 'translateX(0)');
                    }
                }

                // Window resize to reset on large screens fixed
                if (menu_id.hasClass('fixed')) {
                    $(window).resize(function () {
                        if (window.innerWidth > 992) {
                            // Close menu if window is resized bigger than 992 and user has fixed sidenav
                            if ($('#sidenav-overlay').length !== 0 && menuOut) {
                                removeMenu(true);
                            } else {
                                // menu_id.removeAttr('style');
                                menu_id.css('transform', 'translateX(0%)');
                                // menu_id.css('width', options.menuWidth);
                            }
                        } else if (menuOut === false) {
                            if (options.edge === 'left') {
                                menu_id.css('transform', 'translateX(-100%)');
                            } else {
                                menu_id.css('transform', 'translateX(100%)');
                            }

                        }

                    });
                }

                // if closeOnClick, then add close event for all a tags in side sideNav
                if (options.closeOnClick === true) {
                    menu_id.on("click.itemclick", "a:not(.collapsible-header)", function () {
                        removeMenu();
                    });
                }

                removeMenu = function (restoreNav) {
                    // Push history state
                    window.history.pushState({
                        sidenav: 'closed'
                    }, $(this).text(), $(this).attr('href'));
                    panning = false;
                    menuOut = false;
                    // Reenable scrolling
                    $('body').css({
                        overflow: '',
                        width: ''
                    });

                    $('#sidenav-overlay').velocity({
                        opacity: 0
                    }, {
                        duration: 200,
                        queue: false,
                        easing: 'easeOutQuad',
                        complete: function () {
                            $(this).remove();
                        }
                    });
                    if (options.edge === 'left') {
                        // Reset phantom div
                        $dragTarget.css({
                            width: '',
                            right: '',
                            left: '0'
                        });
                        menu_id.velocity({
                            'translateX': '-100%'
                        }, {
                            duration: 200,
                            queue: false,
                            easing: 'easeOutCubic',
                            complete: function () {
                                if (restoreNav === true) {
                                    // Restore Fixed sidenav
                                    menu_id.removeAttr('style');
                                    menu_id.css('width', options.menuWidth);
                                }
                            }

                        });
                    } else {
                        // Reset phantom div
                        $dragTarget.css({
                            width: '',
                            right: '0',
                            left: ''
                        });
                        menu_id.velocity({
                            'translateX': '100%'
                        }, {
                            duration: 200,
                            queue: false,
                            easing: 'easeOutCubic',
                            complete: function () {
                                if (restoreNav === true) {
                                    // Restore Fixed sidenav
                                    menu_id.removeAttr('style');
                                    menu_id.css('width', options.menuWidth);
                                }
                            }
                        });
                    }
                };

                // Touch Event
                //var panning = false,
                //    menuOut = false;

                if (options.draggable) {
                    $dragTarget.on('click', function () {
                        if (menuOut) {
                            removeMenu();
                        }
                    });

                    $dragTarget.hammer({
                        prevent_default: false
                    }).bind('pan', function (e) {

                        if (e.gesture.pointerType === "touch") {

                            var direction = e.gesture.direction,
                                x = e.gesture.center.x,
                                y = e.gesture.center.y,
                                velocityX = e.gesture.velocityX,

                                // Disable Scrolling
                                $body = $('body'),
                                $overlay = $('#sidenav-overlay'),
                                oldWidth = $body.innerWidth(),
                                rightPos,
                                overlayPerc;
                            $body.css('overflow', 'hidden');
                            $body.width(oldWidth);

                            // If overlay does not exist, create one and if it is clicked, close menu
                            if ($overlay.length === 0) {
                                $overlay = $('<div id="sidenav-overlay"></div>');
                                $overlay.css('opacity', 0).click(function () {
                                    removeMenu();
                                });
                                $('body').append($overlay);
                            }

                            // Keep within boundaries
                            if (options.edge === 'left') {
                                if (x > options.menuWidth) {
                                    x = options.menuWidth;
                                } else if (x < 0) {
                                    x = 0;
                                }
                            }

                            if (options.edge === 'left') {
                                if (x < (options.menuWidth / 2)) { // Left Direction
                                    menuOut = false;
                                } else if (x >= (options.menuWidth / 2)) { // Right Direction
                                    menuOut = true;
                                }
                                menu_id.css('transform', 'translateX(' + (x - options.menuWidth) + 'px)');
                            } else {
                                if (x < (window.innerWidth - options.menuWidth / 2)) { // Left Direction
                                    menuOut = true;
                                } else if (x >= (window.innerWidth - options.menuWidth / 2)) { // Right Direction
                                    menuOut = false;
                                }
                                rightPos = (x - options.menuWidth / 2);
                                if (rightPos < 0) {
                                    rightPos = 0;
                                }

                                menu_id.css('transform', 'translateX(' + rightPos + 'px)');
                            }


                            // Percentage overlay
                            //var overlayPerc;
                            if (options.edge === 'left') {
                                overlayPerc = x / options.menuWidth;
                                $overlay.velocity({
                                    opacity: overlayPerc
                                }, {
                                    duration: 10,
                                    queue: false,
                                    easing: 'easeOutQuad'
                                });
                            } else {
                                overlayPerc = Math.abs((x - window.innerWidth) / options.menuWidth);
                                $overlay.velocity({
                                    opacity: overlayPerc
                                }, {
                                    duration: 10,
                                    queue: false,
                                    easing: 'easeOutQuad'
                                });
                            }
                        }

                    }).bind('panend', function (e) {

                        if (e.gesture.pointerType === "touch") {
                            var $overlay = $('<div id="sidenav-overlay"></div>'),
                                velocityX = e.gesture.velocityX,
                                x = e.gesture.center.x,
                                leftPos = x - options.menuWidth,
                                rightPos = x - options.menuWidth / 2;
                            if (leftPos > 0) {
                                leftPos = 0;
                            }
                            if (rightPos < 0) {
                                rightPos = 0;
                            }
                            panning = false;

                            if (options.edge === 'left') {
                                // If velocityX <= 0.3 then the user is flinging the menu closed so ignore menuOut
                                if ((menuOut && velocityX <= 0.3) || velocityX < -0.5) {
                                    // Return menu to open
                                    if (leftPos !== 0) {
                                        menu_id.velocity({
                                            'translateX': [0, leftPos]
                                        }, {
                                            duration: 300,
                                            queue: false,
                                            easing: 'easeOutQuad'
                                        });
                                    }

                                    $overlay.velocity({
                                        opacity: 1
                                    }, {
                                        duration: 50,
                                        queue: false,
                                        easing: 'easeOutQuad'
                                    });
                                    $dragTarget.css({
                                        width: '50%',
                                        right: 0,
                                        left: ''
                                    });
                                    menuOut = true;
                                } else if (!menuOut || velocityX > 0.3) {
                                    // Enable Scrolling
                                    $('body').css({
                                        overflow: '',
                                        width: ''
                                    });
                                    // Slide menu closed
                                    menu_id.velocity({
                                        'translateX': [-1 * options.menuWidth - 10, leftPos]
                                    }, {
                                        duration: 200,
                                        queue: false,
                                        easing: 'easeOutQuad'
                                    });
                                    $overlay.velocity({
                                        opacity: 0
                                    }, {
                                        duration: 200,
                                        queue: false,
                                        easing: 'easeOutQuad',
                                        complete: function () {
                                            $(this).remove();
                                        }
                                    });
                                    $dragTarget.css({
                                        width: '10px',
                                        right: '',
                                        left: 0
                                    });
                                }
                            } else {
                                if ((menuOut && velocityX >= -0.3) || velocityX > 0.5) {
                                    // Return menu to open
                                    if (rightPos !== 0) {
                                        menu_id.velocity({
                                            'translateX': [0, rightPos]
                                        }, {
                                            duration: 300,
                                            queue: false,
                                            easing: 'easeOutQuad'
                                        });
                                    }

                                    $overlay.velocity({
                                        opacity: 1
                                    }, {
                                        duration: 50,
                                        queue: false,
                                        easing: 'easeOutQuad'
                                    });
                                    $dragTarget.css({
                                        width: '50%',
                                        right: '',
                                        left: 0
                                    });
                                    menuOut = true;
                                } else if (!menuOut || velocityX < -0.3) {
                                    // Enable Scrolling
                                    $('body').css({
                                        overflow: '',
                                        width: ''
                                    });

                                    // Slide menu closed
                                    menu_id.velocity({
                                        'translateX': [options.menuWidth + 10, rightPos]
                                    }, {
                                        duration: 200,
                                        queue: false,
                                        easing: 'easeOutQuad'
                                    });
                                    $overlay.velocity({
                                        opacity: 0
                                    }, {
                                        duration: 200,
                                        queue: false,
                                        easing: 'easeOutQuad',
                                        complete: function () {
                                            $(this).remove();
                                        }
                                    });
                                    $dragTarget.css({
                                        width: '10px',
                                        right: 0,
                                        left: ''
                                    });
                                }
                            }

                        }
                    });
                }

                $this.click(function () {
                    if (menuOut === true) {
                        menuOut = false;
                        panning = false;
                        removeMenu();
                    } else {
                        // Push history state
                        window.history.pushState({
                            sidenav: 'opened'
                        }, $(this).text(), $(this).attr('href'));
                        // Disable Scrolling
                        var $body = $('body'),
                            $overlay = $('<div id="sidenav-overlay"></div>'),
                            oldWidth = $body.innerWidth();
                        $body.css('overflow', 'hidden');
                        $body.width(oldWidth);

                        // Push current drag target on top of DOM tree
                        $('body').append($dragTarget);

                        if (options.edge === 'left') {
                            $dragTarget.css({
                                width: '50%',
                                right: 0,
                                left: ''
                            });
                            menu_id.velocity({
                                'translateX': [0, -1 * options.menuWidth]
                            }, {
                                duration: 300,
                                queue: false,
                                easing: 'easeOutQuad'
                            });
                        } else {
                            $dragTarget.css({
                                width: '50%',
                                right: '',
                                left: 0
                            });
                            menu_id.velocity({
                                'translateX': [0, options.menuWidth]
                            }, {
                                duration: 300,
                                queue: false,
                                easing: 'easeOutQuad'
                            });
                        }

                        $overlay.css('opacity', 0)
                            .click(function () {
                                menuOut = false;
                                panning = false;
                                removeMenu();
                                $overlay.velocity({
                                    opacity: 0
                                }, {
                                    duration: 300,
                                    queue: false,
                                    easing: 'easeOutQuad',
                                    complete: function () {
                                        $(this).remove();
                                    }
                                });

                            });
                        $('body').append($overlay);
                        $overlay.velocity({
                            opacity: 1
                        }, {
                            duration: 300,
                            queue: false,
                            easing: 'easeOutQuad',
                            complete: function () {
                                menuOut = true;
                                panning = false;
                            }
                        });
                    }

                    return false;
                });
            });


        },
        destroy: function () {
            var $overlay = $('#sidenav-overlay'),
                $dragTarget = $('.drag-target[data-sidenav="' + $(this).attr('data-activates') + '"]');
            $overlay.trigger('click');
            $dragTarget.remove();
            $(this).off('click');
            $overlay.remove();
        },
        show: function () {
            this.trigger('click');
        },
        hide: function () {
            $('#sidenav-overlay').trigger('click');
        }
    };


    $.fn.sideNav = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.sideNav');
        }
    }; // Plugin end
}(jQuery));