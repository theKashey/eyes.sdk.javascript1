# fancy

`fancy` helps format output using a predefined string template.
it also provides APIs for formatting strings in different colors,
bold, underlined, dimmed etc...

see [example](https://github.com/applitools/fancy/blob/master/README.md#example)

# usage

```javascript
const {output} = fancy(
  {
    header: 'custom header',
    footer: 'custom footer',
    body: {
      custom: someArray,
      custom2: someArray2,
    },
    indent: 4,
  },
  (formatter, {body}) => {
    // you should call format.section at some point and add sections to body
    // otherwise the body will remain empty
    // you must call format.body at the end of your formatting function
    Object.keys(body).forEach((key) => {
      // typically you would transform each of the items in the body
      // using functions available on the first argument of the formatting function
      formatter.section('title', body[key], key);
    })
    formatter.body(body);
  });
```

# API

## options

### `body`

a body is expected to be an object, with keys who's values are arrays of anything.
for example:

```javascript
const body = {
  things: ["car", "cat", "cart"],
  stuff: ["ball", "card", "pen"],
};
```

each of these keys will be used to group the calls you make with `section` in the provided `formatFunction`
see [example](#example);

### `dull`

optionally return the output without any formatting characters.

### `header`

the header of the output.

### `footer`

the footer of the output.

### `indent`

indent output (each unit is a tab)

### `template`

a string representing the final output.
defaults to `HEADER\nBODY\nFOOTER`.

> NOTE you can change the spaces freely and provide any structure you want.
> e.g `HEADER  \n\n    BODY\n  FOOTER`

## customFormatter

the provided custom formatter function will receive the `formatter` object as a first argument, with all colors and styling functions, and the template object as a second argument.

```javascript
function (formatter, { body, header, footer }) {
  const { section, background } = formatter;
  Object.keys(body).forEach((category, index) => {
    const color = index === 0 ? "green" : "red";
    section(
      background(category.toUpperCase(), color),
      body[category],
      category
    );
  });
  formatter.body(body);
};
// const {
//   section,
//   header,
//   body,
//   footer,
//   bold,
//   italic,
//   background,
//   green,
//   yellow,
//   red,
//   gray,
//   marine,
//   white,
//   cyan,
//   pink,
//   blue,
//   teal,
//   reset
// } = formatter;
```

the only requirement is that you call `formatter.body(body)` at the end of your formatting function.

> NOTE you can change the structure of body freely in the formatting function

# `formatter`

formatter is the first argument to your provided formatting function.
it includes all of the utilities to format a string, and the necessary functions
to interact with the template.

### `.header`

```javascript
formatter.header(header); // sets header of template
```

### `.body`

```javascript
formatter.body(body); // sets body of template
```

### `.footer`

```javascript
formatter.footer(footer); // sets footer of template
```

### `.section`

a section represents one group of things in the body

```javascript
section("title", someArray, key);
```

the `key` will be used to group these things together under `title` inside the body.
you are free to format the contents of each memeber of the array of course.

# example

```javascript
it("works like a charm", async () => {
  const {output} = fancy(
    {
      body: {
        artists: ['tool', 'soundgarden', 'metallica'],
        albums: ['lateralus', 'bad motorfinger', 's&m'],
      },
      indent: 4,
      header: 'my cool header',
      footer: 'my awesome footer',
    },
    (formatter, {body: _body, header: _header, footer: _footer}) => {
      const {underline, background, bold, section, italic} = formatter
      formatter.header(underline(_header.toUpperCase(), 'teal'))
      formatter.footer(background(_footer.toUpperCase(), 'pink'))
      Object.keys(_body).forEach((key, index) => {
        const color = index === 0 ? 'green' : 'red'
        section(
          bold(key.toUpperCase(), color),
          _body[key].map((result) => ` 👉 ${italic(result, color)}`),
          key,
        )
      })
      formatter.body(_body)
    },
  )
  expect(output).to.be(someOtherOutPut);
  // or better yet
  // await snap(output, 'charm')
  // see: applitools/snaptdout
});
```

outputs:  
<img src="https://github.com/applitools/fancy/blob/master/example.png?raw=true" />

# real world application

an example for what would be a test results reporter:

```javascript
const {output} = fancy({
    body: {
      Passed: [{name: 'test1'}, {name: 'test2'}, {name: 'test3'}],
      Failed: [{name: 'test4'}, {name: 'test5'}, {name: 'test6'}],
    },
    indent: 4,
    header: 'Test Results',
  },
  (formatter, {body: _body, header: _header}) => {
    const {bold, section, gray, underline} = formatter
    formatter.header(underline(_header.toUpperCase(), 'blue'))
    const statuses = {
      Passed: {
        icon: '✔',
        color: 'green',
      },
      Failed: {
        icon: '✖',
        color: 'red',
      },
    }
    Object.keys(_body).forEach((key) => {
      const {icon, color} = statuses[key]
      section(
        bold(key, color),
        _body[key].map((result) => ` ${bold(icon, color)} ${gray(result.name)}`),
        key,
      )
    })
    formatter.body(_body)
})
```
outputs:   
<img src="https://github.com/applitools/eyes.sdk.javascript1/master/packages/fancy" />