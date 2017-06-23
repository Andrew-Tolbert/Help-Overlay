var debug = [];

define([
  'qlik',
  'jquery',
  'underscore',
  'css!./chardinjs.css',
  './chardinjs.min',
], function(qlik, $, _) {
    return {
      template: '<div qv-extension style="height: 100%; width: 100%; position: relative; overflow: auto;" class="ng-scope ssi-help-overlay"><lui-button ng-if="layout.ssiHelpOverlay.showStartButton" ng-click="init({forceStart:true})">{{layout.ssiHelpOverlay.startButtonText}}</lui-button></div>',
      support: {
        snapshot: false,
        export: false,
        exportData: false
      },
      initialProperties: {
        version : 1.0,
        qHyperCubeDef: {
          qDimensions: [],
          qMeasures: [],
          qInitialDataFetch: [{
            qWidth: 100,
            qHeight: 100
          }]
        },
        options: {}
      },
      definition: {
        type: 'items',
        component: 'accordion',
        items: {
          dims: {
            uses : 'dimensions',
            ref: 'qHyperCubeDef.qDimensions',
            min: 1,
            max: 100,
            allowAdd: true,
            allowRemove: true,
            allowMove: true,
            items: {
              domSelector: {
                type: 'string',
                ref: 'qDef.domSelector',
                label: 'DOM Selector',
                expression: 'optional'
              },
              overlayText: {
                type: 'string',
                ref: 'qDef.overlayText',
                label: 'Overlay Text',
                expression: 'optional'
              },
              overlayPosition: {
                type: 'string',
                component: 'dropdown',
                label: 'Overlay Position',
                ref: 'qDef.overlayPosition',
                options: [{
                  value: 'right',
                  label: 'Right'
                },{
                  value: 'left',
                  label: 'Left'
                },{
                  value: 'top',
                  label: 'Top'
                },{
                  value: 'bottom',
                  label: 'Bottom'
                }],
                defaultValue: 'right'
              },
            }
          },
          helpOverlay: {
            label: 'Help Overlay Settings',
            type: 'items',
            items: {
              cssUrl: {
                label: 'Show Start Button',
                ref: 'ssiHelpOverlay.showStartButton',
                type: 'boolean',
                defaultValue: true
              },
              cssText: {
                label: 'Start Button Text',
                ref: 'ssiHelpOverlay.startButtonText',
                type: 'string',
                expression: 'optional',
                defaultValue: 'View Tour'
              }
            }
          }
        }
      },
      paint: function() {

        return qlik.Promise.resolve();
      },
      controller: ['$scope', function($scope) {
        console.log($scope.layout);
        // initialized variables - scope and otherwise
        var chardinElement = 'body';
        var overlayElement = 'ssi-help-overlay-toggle';
        var localStorageItem = 'ssi-help-overlay-data';
        $scope.navigationInformation = true;
        $scope.count = 0;

        // init function
        $scope.init = function(options) {
          console.log($scope.count);
          // debugger;

          console.log("CURRENT ELEMENTS:");
          console.log($scope.currentElements );
          console.log("Qlik ELEMENTS:");
          console.log($scope.layout.qHyperCube.qDimensionInfo);
          if($scope.count==0) {
            debug = $.extend(true,[],$scope.layout.qHyperCube.qDimensionInfo);
            $scope.count++;
          }
          options = options || {};
          // check if overlay is already dismissed, if so return
          var ssiLocalStorageData = window.localStorage.getItem(localStorageItem);
          if(ssiLocalStorageData && !options.forceStart && JSON.parse(ssiLocalStorageData).overlayDismissed) {
            return;
          }
          // set up toggle buttons
          $scope.addToggleButtons();
          // init
          $scope.render();
        };

        // render function
        $scope.render = function() {


          if($scope.navigationInformation) {


            $scope.removeOverlayAttributes(debug);
            $scope.addOverlayAttributes($scope.navigationConfig);
            setTimeout(function(){
              // wer = $('.chardinjs-tooltiptext').overlaps();
              // $(wer[0]).parent().css({'top':'15%'});
              $('.chardinjs-bottom-withPadd .chardinjs-tooltiptext').append('<div class="up-image-withPadd"></div>');
              $('.chardinjs-bottom .chardinjs-tooltiptext').append('<div class="up-line"></div><div class="up-image"></div>');
            },500);
          } else {

            // debugger;
            $scope.removeOverlayAttributes($scope.navigationConfig);
            $scope.addOverlayAttributes(debug);
            setTimeout(function(){
              if($('.chardinjs-tooltiptext').overlaps()) {
                wer = $('.chardinjs-tooltiptext').overlaps();
                $(wer[0]).parent().css({'top':'15%'});
                $('.chardinjs-top .chardinjs-tooltiptext').append('<div class="down-line"></div><div class="down-image"></div>');
                $('.chardinjs-left .chardinjs-tooltiptext').append('<div class="left-line"></div><div class="left-image"></div>');

              }
            },500);

          }
          $(chardinElement).chardinJs('start');
          // after render add listener to hide the overlay buttons when you click away
          $('.chardinjs-overlay').click(function() {
            console.log('click .chardinjs-overlay');
            window.localStorage.setItem(localStorageItem, JSON.stringify({
              overlayDismissed: true
            }));

            setTimeout(function(){
              $('#' + overlayElement).hide();
              $scope.navigationInformation = true;
              $('.ssi-navigation').siblings().css('background-color', '#FFFFFF').css('color', '#0195BD');
              $('.ssi-navigation').css('background-color', '#0195BD').css('color', '#FFFFFF');
            },200)

            // $scope.navigationInformation = $(this).hasClass('ssi-navigation');
          });
        };

        // helper functions
        $scope.addOverlayAttributes = function(domObjects) {
          _.each(domObjects, function(domObject) {
            $(domObject.domSelector).attr('data-intro', domObject.overlayText).attr('data-position', domObject.overlayPosition);
          });

          $('#' + overlayElement).show();


        };

        $scope.removeOverlayAttributes = function(domObjects) {
          _.each(domObjects, function(domObject) {
            $(domObject.domSelector).removeAttr('data-intro').removeAttr('data-position');
          });
        };

        // NOTE: bad practice to mix angular and jquery but no real option in the case of adding global elements
        $scope.addToggleButtons = function() {
          // note: these buttons are 360px w/ standard font size
          var left = ($(window).width() - 360) / 2;
          if($('#' + overlayElement).length === 0) {
            $('body').append('<div style="position:absolute;top:15px;left:' + left + 'px;z-index:9999999;" id="' + overlayElement + '" class="lui-buttongroup"><button class="lui-button ssi-page-specific" style="color:#0195BD;background-color:#FFFFFF;">Page-specific Information</button><button class="lui-button ssi-navigation" style="background-color:#0195BD;color:#FFFFFF;">Navigation Information</button></div>');
            $('#' + overlayElement + ' button').click(function(ele) {
              // return if not being toggled
              if($scope.navigationInformation === $(this).hasClass('ssi-navigation')) {
                return;
              }
              // set which tour boolean

              $scope.navigationInformation = $(this).hasClass('ssi-navigation');
              // stop tour
              $(chardinElement).chardinJs('stop');
              // change styles
              $(this).siblings().css('background-color', '#FFFFFF').css('color', '#0195BD');
              $(this).css('background-color', '#0195BD').css('color', '#FFFFFF');
              // poll overlay until gone (callback is called then)
              $scope.pollChardinOverlay(function() {
                // console.log('pollChardinOverlay done');
                // // call render
                $scope.render();
              });
            });
          }
        };

        $scope.pollChardinOverlay = function(cb) {
          var endTime = Number(new Date()) +  5000; // wait up to 5 seconds
          var poll = function() {
            if(!$scope.chardinOverlayExists()) {
              cb();
            } else if (Number(new Date()) < endTime) {
              setTimeout(poll, 250); // interval of 250 ms
            } else {
              // console.log('poll timed out');
            }
          };
          poll();
        };

        $scope.chardinOverlayExists = function() {
          // console.log('overlay exists?');
          return $('.chardinjs-overlay').length > 0;
        };

        // navigation config settings for all pages
        // div[tid="CVEV"]
        $scope.navigationConfig = [{
          domSelector: '.qui-buttonset-right .lui-buttongroup:nth-child(1)',
          overlayText: 'Stories - Create custom presentations based on snapshots of the application.',
          overlayPosition: 'bottom-withPadd'

        },{
          domSelector: '.qui-buttonset-right .lui-buttongroup:nth-child(2)',
          overlayText: 'Bookmarks - Save custom filter sets for specific pages of interest.',
          overlayPosition: 'bottom'
        },{
          domSelector: '.qv-selections-pager .buttons',
          overlayText: 'Filter Controls - Step filters back or forward by one or clear all filters using these controls.',
          overlayPosition: 'bottom'
        },{
          domSelector: '.qv-selections-pager .global-search-button',
          overlayText: 'Smart Search - Typing the field shows matching results from throughout the entire application.',
          overlayPosition: 'bottom'
        },{
          domSelector: '.qui-buttonset-right .lui-buttongroup:nth-child(3)',
          overlayText: 'View and Change Page - The dropdown displays your current page. You can select a specific page by clicking on the dropdown or go back or forward one page by clicking on the arrows.',
          overlayPosition: 'bottom'
        }];

        // render
        $scope.init();
      }]
    };
});
