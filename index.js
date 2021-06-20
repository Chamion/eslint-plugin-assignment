const noExpression = require('./rules/no-expression');
const compound = require('./rules/compound');
const update = require('./rules/update');

module.exports = {
    rules: {
        'no-expression': noExpression,
        'compound': compound,
        'update': update
    },
    configs: {
        recommended: {
            plugins: [
                'assignment'
            ],
            rules: {
                'assignment/no-expression': 'error'
            }
        }
    }
};
