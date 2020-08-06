# jq-thermoquiz

Simple quiz with a thermometer

Based on [jq-thermometer](https://github.com/davedupplaw/jquery.thermometer) of @davedupplaw

Original jq-thermometer modified to allow rotation and more parámeters:

- Custom viewbox
- Custom preserve aspect ratio
- Horizontal mode
- Functions to adjust texts for horizontal mode

## Dependencies

- jquery
- jQuery UI:
    - jQuery UI widget
    - jQuery UI uniqueId

## Features

- Configurable by html
- Each option could sum or subtract points
- Show feedback message by score range
- Reset
- Events to notify completion and option change

## Playground
[JS Fiddle](https://jsfiddle.net/Haztivity/2vh47cwx/11/)

## Usage

Install with `npm i jq-thermoquiz`

### Vanilla ES2015

The configuration of the component is specified by `data-thermoquiz-*` attributes
```html
<div id="thermoquiz">
    <div id="thq-t" data-thermoquiz-thermometer></div>
    <ul data-thermoquiz-options>
        <li>
            <label for="o1">+5</label>
            <input id = "o1" type="checkbox" data-thermoquiz-option="5"/>
        </li>
        <li>
            <label for="o2">+4</label>
            <input id = "o2" type="checkbox" data-thermoquiz-option="4"/>
        </li>
        <li>
            <label for="o3">+2</label>
            <input id = "o3" type="checkbox" data-thermoquiz-option="2"/>
        </li>
        <li>
            <label for="o4">-5</label>
            <input id = "o4" type="checkbox" data-thermoquiz-option="-5"/>
        </li>
        <li>
            <label for="o5">-4</label>
            <input id = "o5" type="checkbox" data-thermoquiz-option="-4"/>
        </li>
        <li>
            <label for="o6">-2</label>
            <input id = "o6" type="checkbox" data-thermoquiz-option="-2"/>
        </li>
    </ul>
    <button data-thermoquiz-check>Comprobar</button>
    <div data-thermoquiz-feedback>
        <p data-thermoquiz-feedback-item="10,7">Feedback 10-7</p>
        <p data-thermoquiz-feedback-item="6,4">Feedback 6-4</p>
        <p data-thermoquiz-feedback-item="3,0">Feedback 3-0</p>
    </div>
</div>
```

```javascript
import * as $ from "jquery";
//choose one of the follow options
//for jquery-ui package
import "jq-thermoquiz/esm2015/jquery-ui-deps";
//for jquery-ui-dist package
import "jquery-ui-dist/jquery-ui";
import "jq-thermopquiz";
const $el = $("#thermoquiz");
$el.thermoQuiz({
  //horizontal: true,
  topText:"Top value",
  bottomText:"Bottom value",
  value: 5,
  thermometer: {
    height: 300,
    width: 400,
    pathToSVG: "https://raw.githubusercontent.com/davedupplaw/jquery.thermometer/94b07aa6dbbe71b293a66b999bdb5abf1b078565/svg/thermo-bottom.svg",
    liquidColour: (value) => {
      let color;
      if ( value < 4) {
        color = "#00bcd4";
      } else if (value >=4 && value <= 8) {
        color = "#ffcb00";
      } else {
        color = "#ff0000";
      }
      return color;
    }
  }
});
$el.on("thermoQuizCheckAnswers",(event, thermoquizInstance, value) => {
    console.log("thermoQuizCheckAnswers",value);
});
```

**Please note** that depending of the bundler you are using other configurations may be necessary. For example, shimming JQuery and jQuery UI.

#### Attributes

| Attribute        | Short description       |
| ------------- | ----------------------- |
| `data-thermoquiz-thermometer`       | Element to use to initialize  the thermometer chart      |
| `data-thermoquiz-options`       | Container for the anwsers     |
| `data-thermoquiz-option`        | Answer. The value is the points to add or substract. If the value is above 0 the points will be added, if the value is below 0 the points will be subtract       |
| `data-thermoquiz-check`  | Container for the feedback     |
| `data-thermoquiz-feedback-item`         | Feedback item. The value is the range for which the feedback should be used. Max,Min separated by a comma |



## jQuery UI
jQuery UI could be included in the projects in many different ways and with different packages, instead
of force you to use one, we leave up to you how to include it:

### Modularized
Using `npm i jquery-ui` that install the package allowing to import the widgets you want.

We provided a file with the imports of the required dependencies:
```typescript
import "jq-thermoquiz/esm2015/jquery-ui-deps";
```

### Events

| Event name    | Detail           | Emit  |
| ------------- | ---------------- | ----- |
| thermoQuizCheckAnswers | Triggered when the answers are check |  |
| thermoQuizOptionChange | Triggered when the selection of an option changes |  |

### Methods
Available methods to invoke:

| Method        | Short description       |
| ------------- | ----------------------- |
| destroy       | Destroy the widget      |
| disable       | Disable the widget      |
| enable        | Enable the widget       |
| checkAnswers  | Check the answers       |
| reset         | Reset the quiz and the thermometer |
