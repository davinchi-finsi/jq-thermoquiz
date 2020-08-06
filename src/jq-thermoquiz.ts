(function($) {
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
            value:0,
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
        _create: function() {
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
        _initialize: function() {
            const self = this;
            this._$checkAnswerButton = this.element.find("[data-thermoquiz-check]");
            this._$checkAnswerButton.on("click."+this.NAMESPACE, function() {
                self.checkAnswers.call(self,null);
            });
            if (this.options.disabled) {
                this._$checkAnswerButton.prop("disabled",true);
            }
            this._initializeFeedback();
            this._initializeOptions();
            this._initializeThermometer();
        },
        _initializeThermometer: function() {
            if (this._$thermometer) {
                this._$thermometer.after(this._$thermometerBackup);
                this._$thermometer.remove();
            }
            this._$thermometer = this.element.find("[data-thermoquiz-thermometer]");
            this._$thermometerBackup = this._$thermometer.clone();
            const thermometerOptions = $.extend(true, {},(this.options.thermometer||{}),
                {
                    horizontal: this.options.horizontal,
                    startValue: this.options.value,
                    minValue: this.options.minValue,
                    maxValue: this.options.maxValue,
                    topText: this.options.topText,
                    bottomText: this.options.bottomText
                }
            );
            this._$thermometer.thermometer(thermometerOptions);
        },
        _initializeOptions: function() {
            this._$optionsContainer = this.element.find("[data-thermoquiz-options]");
            this._$optionsContainer.off("."+this.NAMESPACE);
            this._$options = this._$optionsContainer.find("[data-thermoquiz-option]");
            if (this.options.disabled) {
                this._$options.prop("disabled",true);
            }
            let optionsElements = Array.from(this._$options);
            this._options = optionsElements.map((optionElement,index) => {
                const $option = $(optionElement);
                const value = parseFloat($option.data("thermoquizOption"));
                return {
                    index,
                    element: optionElement,
                    $element: $option,
                    value
                }
            });
            const self = this;
            this._$optionsContainer.on("change."+this.NAMESPACE, function(args) {
                self._onOptionChange.call(self, args);
            });
        },
        _onOptionChange: function(event) {
            const target = event.target;
            const option = this._options.find(o => o.element == target);
            if (option) {
              if (target.checked) {
                option.$element.addClass(this.options.classes.checked);
                if (this._selectedOptions.findIndex(o => o.element == target) == -1){
                  this._selectedOptions.push(option);
                }
              } else {
                option.$element.removeClass(this.options.classes.checked);
                const optionIndex = this._selectedOptions.findIndex(o => o.element == target);
                if (optionIndex != -1) {
                  this._selectedOptions.splice(optionIndex,1);
                }
              }
              this.element.trigger(this.ON_OPTION_CHANGE, [this,option]);
            }
            //obtener opcion
            // incluir en selectedOptions
        },
        _initializeFeedback: function() {
            this._$feedbackContainer = this.element.find("[data-thermoquiz-feedback]");
            const $feedbackItems = this._$feedbackContainer.find("[data-thermoquiz-feedback-item]");
            this._$feedback = $feedbackItems;
            const feedbackItems = Array.from($feedbackItems);
            $feedbackItems.detach();
            this._feedback = feedbackItems.map((feedbackElement, index) => {
                const $feedback = $(feedbackElement);
                const value = $feedback.data("thermoquizFeedbackItem").split(",");
                const max = parseFloat(value[0]);
                const min = parseFloat(value[1]);
                return {
                    index,
                    min,
                    max,
                    element: feedbackElement,
                    $element: $feedback
                }
            })
        },
        _disableInteractions: function() {
            this._$checkAnswerButton
                .addClass(this.options.classes.disabled)
                .prop("disabled",true);
            this._$options
                .addClass(this.options.classes.disabled)
                .prop("disabled",true);
        },
        _enableInteractions: function() {
            this._$checkAnswerButton
                .removeClass(this.options.classes.disabled)
                .prop("disabled",false);
            this._$options
                .removeClass(this.options.classes.disabled)
                .prop("disabled",false);
        },
        reset: function() {
            this._selectedOptions = [];
            this._enableInteractions();
            this._initializeThermometer();
            this._$options.prop("checked",false);
            this._$feedback.detach();
            this.element.removeClass(this.options.classes.completed);
        },
        checkAnswers: function() {
            this._disableInteractions();
            // calcular valor
            let value = this.options.value+this._selectedOptions.reduce((acc, option) => acc+option.value,0);
            if (value > this.options.maxValue) {
                value = this.options.maxValue;
            } else if (value < this.options.minValue) {
                value = this.options.minValue;
            }
            // actualizar termómetro
            this._$thermometer.thermometer("setValue", value);
            const feedback = this._feedback.filter(feedbackItem => value >= feedbackItem.min && value <= feedbackItem.max);
            feedback.forEach(feedbackItem => {
                feedbackItem.$element.appendTo(this._$feedbackContainer);
            });
            this.element.addClass(this.options.classes.completed);
            this.element.trigger(this.ON_CHECK_ANSWERS, [this,value,feedback]);
        },
        /**
         * Destroy the component
         */
        destroy: function(){
            this.element.removeClass(this.options.classes.root);
            this.element.removeClass(this.options.classes.completed);
            this.element.removeClass(this.options.classes.disabled);
            this._$options.removeClass(this.options.classes.disabled);
            this._$options.off("."+this.NAMESPACE);
            this._$checkAnswerButton.off("."+this.NAMESPACE);
            this._$thermometer.after(this._$thermometerBackup);
            this._$thermometer.remove();
            //@ts-ignore
            this._super();
        },
        /**
         * Disable the widget
         */
        disable: function() {
            this.element.addClass(this.options.classes.disabled);
            this._disableInteractions();
            //@ts-ignore
            this._super();
        },
        /**
         * Enable the widget
         */
        enable: function() {
            this.element.removeClass(this.options.classes.disabled);
            this._enableInteractions();
            //@ts-ignore
            this._super();
        }
    });
  })(jQuery);