const CPP = require("tree-sitter-cpp/grammar")

module.exports = grammar(CPP, {
    name: 'cuda',

    externals: $ => [
        $.raw_string_literal
    ],
    conflicts: ($, original) => original.concat([
        [$.call_expression, $.delete_expression]
    ]),


    rules: {
        _top_level_item: (_, original) => original,

        function_definition: ($, original) => seq(
            seq(
                repeat(
                    choice(
                        $.launch_bounds,
                        '__device__',
                        '__host__',
                        prec(10, '__global__'),
                        '__forceinline__'
                    )
                ),
            ), original
        ),

        call_expression: ($, original) => choice(original, seq(
            field('function', $._expression),
            $.kernel_call_syntax,
            field('arguments', $.argument_list),
        )),

        kernel_call_syntax: $ => seq(alias(rep3('<'), '<<<'), $._expression, repeat(seq(",", $._expression)), alias(rep3('>'), '>>>')),

        type_qualifier: (_, original) => choice(
            original,
            '__shared__',
            '__global__',
            '__local__',
            '__constant__',
            '__restrict__',
        ),

        launch_bounds: $ => seq("__launch_bounds__", "(" , $._expression, ",", $._expression, ")"),
    }
});

function rep3(obj) {
    return token(seq(obj, /\s*/, obj, /\s*/, obj));
}
