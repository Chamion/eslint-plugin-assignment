const noExpression = require('./rules/no-expression');

module.exports = {
    rules: {
        'no-expression': noExpression
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
