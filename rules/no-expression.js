const last = (array) => array[array.length - 1];

const isLastExpression = ({ sequence, expression }) =>
    last(sequence.expressions) === expression;

const isAllowed = (assignmentExpressionNode) => {
    const parent = assignmentExpressionNode.parent;
    switch (parent.type) {
        case "ExpressionStatement":
            return true;
        case "SequenceExpression":
            return (
                isLastExpression({
                    sequence: parent,
                    expression: assignmentExpressionNode
                }) || isAllowed(parent)
            );
        case "UnaryExpression":
            return parent.operator === "void";
        default:
            return false;
    }
};
const create = (context) => {
    const createVisitor = (message) => (node) => {
        if (!isAllowed(node)) {
            context.report({
                node,
                message
            });
        }
    };
    return {
        AssignmentExpression: createVisitor(
            "Assignments are only allowed as statements or voided expressions."
        ),
        UpdateExpression: createVisitor(
            "Updates are only allowed as statements or voided expressions."
        )
    };
};

module.exports = {
    create,
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow use of assignments as expression',
            recommended: true
        },
    }
};
