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

const create = (context) => {
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

return {
    create,
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