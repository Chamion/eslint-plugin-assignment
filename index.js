const last = (array) => array[array.length - 1];

const isLastExpression = ({ sequence, expression }) =>
    last(sequence.expressions) === expression;

const isTestExpression = ({ forStatement, expression }) => expression === forStatement.test;

const isAllowed = (assignmentExpressionNode) => {
    const parent = assignmentExpressionNode.parent;
    switch (parent.type) {
        case "ExpressionStatement":
            return true;
        case "SequenceExpression":
            return (
                !isLastExpression({
                    sequence: parent,
                    expression: assignmentExpressionNode
                }) || isAllowed(parent)
            );
        case "UnaryExpression":
            return parent.operator === "void";
        case "ForStatement":
            return !isTestExpression({
                forStatement: parent,
                expression: assignmentExpressionNode
            });
        default:
            return false;
    }
};
const createNoExpression = (context) => {
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

const noExpression = {
    create: createNoExpression,
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow use of assignments as expression',
            recommended: true
        },
    }
};

const identifierNodeEquals = (a, b) => a.type === "Identifier" && b.type === "Identifier" && a.name === b.name;

const COMPOUNDABLE_BINARY_OPERATORS = ["+", "-", "*", "/", "%", "**", "<<", ">>", ">>>", "&", "^", "|"];
const isCompoundableOperator = Array.prototype.includes.bind(COMPOUNDABLE_BINARY_OPERATORS);

const SYMMETRICAL_BINARY_OPERATORS = ["*", "&", "^", "|"];
const isSymmetricalOperator = Array.prototype.includes.bind(SYMMETRICAL_BINARY_OPERATORS);

const binaryExpressionIdentifierPosition = (identifier, binaryExpression) => {
    if (identifierNodeEquals(identifier, binaryExpression.left)) return "left";
    else if (
        isSymmetricalOperator(binaryExpression.operator) &&
        identifierNodeEquals(identifier, binaryExpression.right)
    )
        return "right";
    else return null;
};

const createCompound = (context) => {
    const { prefer: preference } = context.options[0] || {};
    switch (preference) {
        case "verbose":
            return {
                AssignmentExpression: (node) => {
                    const { operator } = node;
                    if (operator === "=") return;
                    const binaryOperator = operator.substring(0, operator.length - 1);
                    const canFix = isCompoundableOperator(binaryOperator);
                    const fix = canFix
                        ? (fixer) => {
                            const source = context.getSourceCode();
                            const leftText = source.getText(node.left);
                            const rightText = source.getText(node.right);
                            const binaryExpressionText = leftText + binaryOperator + rightText;
                            const assignmentText = leftText + "=" + binaryExpressionText;
                            return fixer.replaceText(node, assignmentText);
                        }
                        : undefined;
                    context.report({
                        node,
                        message: `Unexpected compound assignment operator.`,
                        fix
                    });
                }
            };
        default:
            return {
                AssignmentExpression: (node) => {
                    const { operator } = node;
                    if (operator !== "=" || node.right.type !== "BinaryExpression") return;
                    const binaryExpression = node.right;
                    const identifierPosition = binaryExpressionIdentifierPosition(node.left, binaryExpression);
                    if (!isCompoundableOperator(binaryExpression.operator) || identifierPosition == null) return;
                    const fix = (fixer) => {
                        const source = context.getSourceCode();
                        const leftText = source.getText(node.left);
                        const rightText = source.getText(
                            identifierPosition === "left" ? binaryExpression.right : binaryExpression.left
                        );
                        const assignmentOperatorText = binaryExpression.operator + "=";
                        const assignmentText = leftText + assignmentOperatorText + rightText;
                        return fixer.replaceText(node, assignmentText);
                    };
                    context.report({
                        node,
                        message: `Assignment can be expressed with a compound operator.`,
                        fix
                    });
                }
            };
    }
};

const compound = {
    create: createCompound,
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Prefer compound or verbose assignment operators'
        },
        fixable: 'code',
        schema: [{
            type: 'object',
            properties: {
                prefer: {
                    type: 'string',
                    enum: [
                        'compound',
                        'verbose'
                    ]
                }
            },
            additionalProperties: false
        }]
    }
};

const equivalentUpdateOperator = (assignmentExpression) => {
    let updateOperator = {
        "+=": "++",
        "-=": "--"
    }[assignmentExpression.operator];
    if (
        updateOperator != null &&
        assignmentExpression.right.type === "Literal" &&
        assignmentExpression.right.value === 1
    )
        return updateOperator;
    else return null;
};

const equivalentAssignment = (updateOperator) =>
({
    "++": "+= 1",
    "--": "-= 1"
}[updateOperator]);

const createIncrement = (context) => {
    const { prefer: preference } = context.options[0] || {};
    switch (preference) {
        case "update":
            return {
                AssignmentExpression: (node) => {
                    const updateOperator = equivalentUpdateOperator(
                        node
                    );
                    if (updateOperator == null) return;
                    context.report({
                        node,
                        message: `Use ${updateOperator} instead.`
                    });
                }
            };
        default:
            return {
                UpdateExpression: (node) => {
                    const assignment = equivalentAssignment(
                        node.operator
                    );
                    context.report({
                        node,
                        message: `Use ${assignment} instead.`
                    });
                }
            };
    }
};

const increment = {
    create: createIncrement,
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Prefer compound assignment or increment shorthand'
        },
        schema: [{
            type: 'object',
            properties: {
                prefer: {
                    type: 'string',
                    enum: [
                        'compound',
                        'update'
                    ]
                }
            },
            additionalProperties: false
        }]
    }
};

module.exports = {
    rules: {
        'no-expression': noExpression,
        'compound': compound,
        'increment': increment
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
