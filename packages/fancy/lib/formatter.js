const colors = require('./colors');
const STRIP_REGEX = new RegExp(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g);

function formatter({ header = '', footer = '', body = {}, indent = 0, dull = false, template = `HEADER\nBODY\nFOOTER` } = {}) {
    const innerIndent = (template.split(" ").length - 1);

    function _format(message, color) {
        return colors.reset + colors[color] + message + colors.reset;
    };

    function _indent(tabs = 2) {
        return `${' '.repeat(tabs)}`;
    };

    const templateObject = {
        header,
        body,
        footer
    };

    const formatted = {
        formattedHeader: '',
        formattedFooter: '',
        formattedBody: body ? Object.keys(body).reduce((acc, section) => { acc[section] = []; return acc }, {}) : {}
    }

    return {
        // make every color it's own function
        ...Object.keys(colors).reduce((acc, colorName) => {
            acc[colorName] = (text) => {
                return _format(text, colorName);
            }
            return acc;
        }, {}),
        bold(text, color) {
            return _format(text, color || 'reset').replace('m', ';1m');
        },
        dim(text, color) {
            return _format(text, color || 'reset').replace('m', ';2m');
        },
        italic(text, color) {
            return _format(text, color || 'reset').replace('m', ';3m')
        },
        underline(text, color) {
            return _format(text, color || 'reset').replace('m', ';4m');
        },
        background(text, color) {
            return _format(text, color || 'reset').replace('m', ';7m');
        },
        color(text, color) {
            return _format(text, color);
        },
        header(_header) {
            formatted.formattedHeader = _header;
        },
        footer(_footer) {
            formatted.formattedFooter = _footer;
        },
        body(_body) {
            formatted.formattedBody = _body;
        },
        section(title, data, key) {
            // add sections to body
            const indentation = indent;
            const formattedTitle = _indent(innerIndent + indentation) + title + '\n';
            const formattedSection = _indent(innerIndent + indentation) + data.join(`\n${_indent(innerIndent + indentation)}`)
            const category = formatted.formattedBody;
            if (!category[key]) category[key] = [];
            category[key].push(`\n${formattedTitle + formattedSection}\n`);
        },
        print() {
            console.log(this.report())
        },
        getTemplate() {
            return template;
        },
        report(customFormatter) {
            // call the provided format function
            const templateObj = { ...templateObject, ...formatted };
            try {
                customFormatter(this, templateObj);    
            } catch (error) {
                throw new Error(`the provided custom formatter function threw an error: ${error}`);
            }
            
            const newBody = templateObj.formattedBody || templateObj.body;
            const reversed = Object.keys(newBody).reduce((acc, key) => {
                acc.push(...templateObj.formattedBody[key].reverse())
                return acc;
            }, []);
            // indent if necessary
            const _body = reversed.join(`${_indent(innerIndent)}`);
            const formattedHeader = formatted.formattedHeader || templateObj.header;
            const formattedFooter = formatted.formattedFooter || templateObj.footer;
            const _header = indent ? (_indent(indent) + formattedHeader) : formattedHeader;
            const _footer = indent ? (_indent(indent) + formattedFooter) : formattedFooter;
            // replace template with formatted content
            const formattedTemplate = { header: _header, body: _body, footer: _footer };
            let templateString = template;
            Object.keys(formattedTemplate).forEach(key => {
                const upperCased = key.toUpperCase();
                templateString = templateString.replace(upperCased, formattedTemplate[key]);
            });

            return dull ? templateString.replace(STRIP_REGEX, '') : templateString;
        },
    };
}

module.exports = formatter;