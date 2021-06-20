const noExpression = require('./rules/no-expression');
const compound = require('./rules/compound');

module.exports = {
    rules: {
        'no-expression': noExpression,
        'compound': compound
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
