const eyes = new Eyes(new VisualGridRunner({testConcurrency: 5}));

await eyes.open()

await eyes.check(Target.shadow(elementWithShadow).region(regionToCheck))

/**
 * happy path:
 * regionToCheck is a selector
 * elementWithShadow is a selector
 * 
 * exceptions
 * 1. if regionToCheck is absolute coordinates, then the preceding .shadow doesn't carry any meaning
 * 2. if regionToCheck or elementWithShadow is an element instance, we need to mark it
 * 
 * 
 * 
 * Architectural levels:
 * 1. user api: API + types
 * 2. user api implementation: translation into plain checkSettings object, error handling in case of classic
 * 3. core api: API + types
 * 4. core implementation: mark elements if needed
 * 5. visual-grid-client api
 * 6. visual-grid-client implementation: enhance RenderRequest object
 * 7. Documentation: readme (including non-support for classic)
 */


// VG protocol change:
// old:
{
    target: 'selector',
    selector: '.my-element'
}

// new:
{
    target: 'selector',
    selector: ['.element-with-shadow', '.element-inside-shadow']
}

// valid as well:
{
    target: 'selector',
    selector: [
        {type: 'css', selector: '.element-with-shadow'},
        {type: 'xpath', selector: '//element-inside-shadow'}
    ]
}

// out of scope:
{
    target: 'selector',
    selector: [
        {type: 'css', selector: '.element-with-shadow', nodeType: 'shadow'},
        {type: 'css', selector: '.frame', nodeType: 'frame'},
        {type: 'xpath', selector: '//element-inside-frame-inside-shadow'}
    ]
}