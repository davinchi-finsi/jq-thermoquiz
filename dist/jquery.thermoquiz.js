/**
 * @license jq-thermoquiz v1.0.0
 * (c) 2020 Finsi, Inc. Credits to @davedupplaw for jq-thermometer
 */

(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	/* global jQuery */
	(function ($) {
	    var Thermometer = {
	        /**
	         *  Set the value to show in the thermometer. If the value
	         *  is outside the maxmimum or minimum range it shall be clipped.
	         */
	        setValue: function (value) {
	            if (value >= this.options.maxValue) {
	                this.valueToAttain = this.options.maxValue;
	            }
	            else if (value <= this.options.minValue) {
	                this.valueToAttain = this.options.minValue;
	            }
	            else {
	                this.valueToAttain = value;
	            }
	            this._update();
	        },
	        /**
	         * Set the text colour
	         */
	        setTextColour: function (newColour) {
	            this._updateTextColour(newColour);
	        },
	        /**
	         * Set the tick colour
	         */
	        setTickColour: function (newColour) {
	            this._updateTickColour(newColour);
	        },
	        /**
	         * Set the text at the top of the scale
	         */
	        setTopText: function (newText) {
	            this.topText.find('tspan').text(newText);
	        },
	        /**
	         * Set the text at the bottom of the scale
	         */
	        setBottomText: function (newText) {
	            this.bottomText.find('tspan').text(newText);
	        },
	        /**
	         * Set the colour of the liquid in the thermometer. This must
	         * be of the form #ffffff. The shortened form and the rgb() form
	         * are not supported.
	         */
	        setLiquidColour: function (newColour) {
	            this.options.liquidColour = newColour;
	            this._updateLiquidColour();
	        },
	        /**
	         * Returns the liquid colour. If this is controlled by a colour
	         * function, then it returns the colour for the current value.
	         */
	        getLiquidColour: function () {
	            if ($.isFunction(this.options.liquidColour)) {
	                return this.options.liquidColour(this.currentValue);
	            }
	            else {
	                return this.options.liquidColour;
	            }
	        },
	        _updateLiquidColour: function () {
	            var liquidColour = this.getLiquidColour();
	            var variables = [];
	            variables["colour"] = liquidColour;
	            variables["darkColour"] = this._blendColors(liquidColour, "#000000", 0.1);
	            variables["veryDarkColour"] = this._blendColors(liquidColour, '#000000', 0.2);
	            this._formatDataAttribute(this.neckLiquid, "style", variables);
	            this._formatDataAttribute(this.liquidTop, "style", variables);
	            this._formatDataAttribute(this.bowlLiquid, "style", variables);
	            this._formatDataAttribute(this.bowlGlass, "style", variables);
	            this._formatDataAttribute(this.neckGlass, "style", variables);
	        },
	        _updateTextColour: function (newColour) {
	            this.options.textColour = newColour;
	            var variables = { textColour: this.options.textColour };
	            this._formatDataAttribute(this.topText, "style", variables);
	            this._formatDataAttribute(this.bottomText, "style", variables);
	        },
	        _updateTickColour: function (newColour) {
	            this.options.tickColour = newColour;
	            var variables = { tickColour: this.options.tickColour };
	            var self = this;
	            this.ticks.find('rect').each(function (indx, tick) {
	                self._formatDataAttribute(tick, "style", variables);
	            });
	        },
	        _setupSVGLinks: function (svg) {
	            // Replace all ids in the SVG with fixtureId_id
	            var id = this.fixtureId;
	            svg.find('g[id], g [id]').each(function (indx, obj) {
	                $(obj).attr('id', id + "_" + $(obj).attr('id'));
	            });
	            // This is all a bit magic, but these numbers come
	            // from the SVG itself and so this will only work with
	            // a specific SVG file.
	            this.liquidBottomY = 346;
	            this.liquidTopY = 25;
	            this.neckBottomY = 573;
	            this.neckTopY = 250;
	            this.neckMinSize = 30;
	            this.svgHeight = 1052;
	            this.leftOffset = 300;
	            this.topOffset = 150;
	            this.liquidTop = $('#' + id + '_LiquidTop path');
	            this.neckLiquid = $('#' + id + '_NeckLiquid path');
	            this.bowlLiquid = $('#' + id + '_BowlLiquid path');
	            this.topText = $('#' + id + '_TopText');
	            this.bottomText = $('#' + id + '_BottomText');
	            this.bowlGlass = $('#' + id + '_BowlGlass');
	            this.neckGlass = $('#' + id + '_NeckGlass');
	            this.ticks = $('#' + id + '_Ticks');
	        },
	        _create: function () {
	            var self = this;
	            var div = $('<div/>');
	            this.div = div;
	            this.element.append(div);
	            this.fixtureId = this.element.attr('id');
	            div.load(this.options.pathToSVG, null, function () {
	                // Scale the SVG to the options provided.
	                var svg = $(this).find("svg");
	                self._setupSVGLinks(svg);
	                svg[0].setAttribute("preserveAspectRatio", self.options.preserveAspectRatio);
	                svg[0].setAttribute("viewBox", self.options.viewBox(self));
	                svg.attr("width", self.options.width);
	                svg.attr("height", self.options.height);
	                // Setup the SVG to the given options
	                self.currentValue = self.options.startValue;
	                self.setValue(self.options.startValue);
	                self.setTopText(self.options.topText);
	                self.setBottomText(self.options.bottomText);
	                self.setLiquidColour(self.options.liquidColour);
	                self.setTextColour(self.options.textColour);
	                self.setTickColour(self.options.tickColour);
	                if (self.options.horizontal) {
	                    svg.css("transform", "rotate(90deg)");
	                    self.options.adjustTopTextHorizontal(self.topText);
	                    self.options.adjustBottomTextHorizontal(self.bottomText);
	                }
	                if (self.options.onLoad) {
	                    self.options.onLoad();
	                }
	            });
	        },
	        _update: function () {
	            var self = this;
	            var valueProperty = { val: this.currentValue };
	            $(valueProperty).animate({ val: this.valueToAttain }, {
	                duration: this.options.animationSpeed,
	                step: function () {
	                    self._updateViewToValue(this.val);
	                    self.currentValue = this.val;
	                }
	            });
	        },
	        _updateViewToValue: function (value) {
	            // Allow the liquid colour to be controlled by a function based on value
	            if ($.isFunction(this.options.liquidColour)) {
	                this._updateLiquidColour();
	            }
	            var variables = [];
	            variables["liquidY"] = this.liquidBottomY - (value - this.options.minValue) * (this.liquidBottomY - this.liquidTopY) / (this.options.maxValue - this.options.minValue);
	            variables["neckPosition"] = (value - this.options.minValue) * (this.neckBottomY - this.neckTopY) / (this.options.maxValue - this.options.minValue) + this.neckMinSize;
	            variables["boxPosition"] = this.neckBottomY - variables["neckPosition"];
	            // Move the oval representing the top of the liquid
	            this._formatDataAttribute(this.liquidTop, "transform", variables);
	            // Stretch the box representing the liquid in the neck
	            this._formatDataAttribute(this.neckLiquid, "d", variables);
	            // Call the valueChanged callback.
	            if (this.options.valueChanged) {
	                this.options.valueChanged(value);
	            }
	        },
	        _formatDataAttribute: function (object, attribute, variables) {
	            var formatString = $(object).attr("data-" + attribute);
	            for (var v in variables) {
	                formatString = formatString.replace(new RegExp("%%" + v + "%%", "g"), variables[v]);
	            }
	            $(object).attr(attribute, formatString);
	        },
	        // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
	        _blendColors: function (c0, c1, p) {
	            var f = parseInt(c0.slice(1), 16), t = parseInt(c1.slice(1), 16), R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF, R2 = t >> 16, G2 = t >> 8 & 0x00FF, B2 = t & 0x0000FF;
	            return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
	        },
	        // Default options
	        options: {
	            horizontal: false,
	            adjustTopTextHorizontal: function ($text) {
	                $text.css({
	                    "transform-origin": "center",
	                    "text-anchor": "middle",
	                    "transform": "rotate(-90deg) translate(-150px, 305px)"
	                });
	            },
	            adjustBottomTextHorizontal: function ($text) {
	                $text.css({
	                    "transform-origin": "center",
	                    "text-anchor": "middle",
	                    "transform": "rotate(-90deg) translate(-460px, -25px)"
	                });
	            },
	            height: 700,
	            minValue: 0,
	            maxValue: 8,
	            startValue: 0,
	            topText: 8,
	            bottomText: 0,
	            textColour: '#000000',
	            tickColour: '#000000',
	            liquidColour: "#ff0000",
	            animationSpeed: 1000,
	            pathToSVG: "svg/thermo-bottom.svg",
	            viewBox: function (instance) {
	                return instance.leftOffset + " " + instance.topOffset + " 744 600";
	            },
	            preserveAspectRatio: "xMinYMin meet",
	            valueChanged: undefined,
	            onLoad: undefined
	        }
	    };
	    $.widget("dd.thermometer", Thermometer);
	})(jQuery);

	(function ($) {
	    $.widget("ui.thermoQuiz", {
	        NAMESPACE: "thermoQuiz",
	        _$thermometer: null,
	        _$thermometerBackup: null,
	        _$optionsContainer: null,
	        _$checkAnswerButton: null,
	        _$options: null,
	        _options: null,
	        _$feedbackContainer: null,
	        _feedback: null,
	        _currentScore: 0,
	        _selectedOptions: [],
	        ON_OPTION_CHANGE: "thermoQuizOptionChange",
	        ON_CHECK_ANSWERS: "thermoQuizCheckAnswers",
	        options: {
	            value: 0,
	            minValue: 0,
	            maxValue: 10,
	            topText: 10,
	            bottomText: 0,
	            horizontal: false,
	            classes: {
	                root: "jq-thermoquiz",
	                horizontal: "jq-thermoquiz--horizontal",
	                completed: "jq-thermoquiz--completed",
	                disabled: "jq-thermoquiz--disabled",
	                checked: "jq-thermoquiz--checked"
	            }
	        },
	        _create: function () {
	            this.element.addClass(this.options.classes.root);
	            this.element.uniqueId();
	            if (this.options.disabled) {
	                this.element.addClass(this.options.classes.disabled);
	            }
	            if (this.options.horizontal) {
	                this.element.addClass(this.options.classes.horizontal);
	            }
	            this._initialize();
	        },
	        _initialize: function () {
	            var self = this;
	            this._$checkAnswerButton = this.element.find("[data-thermoquiz-check]");
	            this._$checkAnswerButton.on("click." + this.NAMESPACE, function () {
	                self.checkAnswers.call(self, null);
	            });
	            if (this.options.disabled) {
	                this._$checkAnswerButton.prop("disabled", true);
	            }
	            this._initializeFeedback();
	            this._initializeOptions();
	            this._initializeThermometer();
	        },
	        _initializeThermometer: function () {
	            if (this._$thermometer) {
	                this._$thermometer.after(this._$thermometerBackup);
	                this._$thermometer.remove();
	            }
	            this._$thermometer = this.element.find("[data-thermoquiz-thermometer]");
	            this._$thermometerBackup = this._$thermometer.clone();
	            var thermometerOptions = $.extend(true, {}, (this.options.thermometer || {}), {
	                horizontal: this.options.horizontal,
	                startValue: this.options.value,
	                minValue: this.options.minValue,
	                maxValue: this.options.maxValue,
	                topText: this.options.topText,
	                bottomText: this.options.bottomText
	            });
	            this._$thermometer.thermometer(thermometerOptions);
	        },
	        _initializeOptions: function () {
	            this._$optionsContainer = this.element.find("[data-thermoquiz-options]");
	            this._$optionsContainer.off("." + this.NAMESPACE);
	            this._$options = this._$optionsContainer.find("[data-thermoquiz-option]");
	            if (this.options.disabled) {
	                this._$options.prop("disabled", true);
	            }
	            var optionsElements = Array.from(this._$options);
	            this._options = optionsElements.map(function (optionElement, index) {
	                var $option = $(optionElement);
	                var value = parseFloat($option.data("thermoquizOption"));
	                return {
	                    index: index,
	                    element: optionElement,
	                    $element: $option,
	                    value: value
	                };
	            });
	            var self = this;
	            this._$optionsContainer.on("change." + this.NAMESPACE, function (args) {
	                self._onOptionChange.call(self, args);
	            });
	        },
	        _onOptionChange: function (event) {
	            var target = event.target;
	            var option = this._options.find(function (o) { return o.element == target; });
	            if (option) {
	                if (target.checked) {
	                    option.$element.addClass(this.options.classes.checked);
	                    if (this._selectedOptions.findIndex(function (o) { return o.element == target; }) == -1) {
	                        this._selectedOptions.push(option);
	                    }
	                }
	                else {
	                    option.$element.removeClass(this.options.classes.checked);
	                    var optionIndex = this._selectedOptions.findIndex(function (o) { return o.element == target; });
	                    if (optionIndex != -1) {
	                        this._selectedOptions.splice(optionIndex, 1);
	                    }
	                }
	                this.element.trigger(this.ON_OPTION_CHANGE, [this, option]);
	            }
	            //obtener opcion
	            // incluir en selectedOptions
	        },
	        _initializeFeedback: function () {
	            this._$feedbackContainer = this.element.find("[data-thermoquiz-feedback]");
	            var $feedbackItems = this._$feedbackContainer.find("[data-thermoquiz-feedback-item]");
	            this._$feedback = $feedbackItems;
	            var feedbackItems = Array.from($feedbackItems);
	            $feedbackItems.detach();
	            this._feedback = feedbackItems.map(function (feedbackElement, index) {
	                var $feedback = $(feedbackElement);
	                var value = $feedback.data("thermoquizFeedbackItem").split(",");
	                var max = parseFloat(value[0]);
	                var min = parseFloat(value[1]);
	                return {
	                    index: index,
	                    min: min,
	                    max: max,
	                    element: feedbackElement,
	                    $element: $feedback
	                };
	            });
	        },
	        _disableInteractions: function () {
	            this._$checkAnswerButton
	                .addClass(this.options.classes.disabled)
	                .prop("disabled", true);
	            this._$options
	                .addClass(this.options.classes.disabled)
	                .prop("disabled", true);
	        },
	        _enableInteractions: function () {
	            this._$checkAnswerButton
	                .removeClass(this.options.classes.disabled)
	                .prop("disabled", false);
	            this._$options
	                .removeClass(this.options.classes.disabled)
	                .prop("disabled", false);
	        },
	        reset: function () {
	            this._selectedOptions = [];
	            this._enableInteractions();
	            this._initializeThermometer();
	            this._$options.prop("checked", false);
	            this._$feedback.detach();
	            this.element.removeClass(this.options.classes.completed);
	        },
	        checkAnswers: function () {
	            var _this = this;
	            this._disableInteractions();
	            // calcular valor
	            var value = this.options.value + this._selectedOptions.reduce(function (acc, option) { return acc + option.value; }, 0);
	            if (value > this.options.maxValue) {
	                value = this.options.maxValue;
	            }
	            else if (value < this.options.minValue) {
	                value = this.options.minValue;
	            }
	            // actualizar termómetro
	            this._$thermometer.thermometer("setValue", value);
	            var feedback = this._feedback.filter(function (feedbackItem) { return value >= feedbackItem.min && value <= feedbackItem.max; });
	            feedback.forEach(function (feedbackItem) {
	                feedbackItem.$element.appendTo(_this._$feedbackContainer);
	            });
	            this.element.addClass(this.options.classes.completed);
	            this.element.trigger(this.ON_CHECK_ANSWERS, [this, value, feedback]);
	        },
	        /**
	         * Destroy the component
	         */
	        destroy: function () {
	            this.element.removeClass(this.options.classes.root);
	            this.element.removeClass(this.options.classes.completed);
	            this.element.removeClass(this.options.classes.disabled);
	            this._$options.removeClass(this.options.classes.disabled);
	            this._$options.off("." + this.NAMESPACE);
	            this._$checkAnswerButton.off("." + this.NAMESPACE);
	            this._$thermometer.after(this._$thermometerBackup);
	            this._$thermometer.remove();
	            //@ts-ignore
	            this._super();
	        },
	        /**
	         * Disable the widget
	         */
	        disable: function () {
	            this.element.addClass(this.options.classes.disabled);
	            this._disableInteractions();
	            //@ts-ignore
	            this._super();
	        },
	        /**
	         * Enable the widget
	         */
	        enable: function () {
	            this.element.removeClass(this.options.classes.disabled);
	            this._enableInteractions();
	            //@ts-ignore
	            this._super();
	        }
	    });
	})(jQuery);

})));
