const COMMENT = token(/;.*/);

// Symbols can contain any character when escaped:
// https://www.gnu.org/software/emacs/manual/html_node/elisp/Symbol-Type.html
// Most characters do not need escaping, but space and parentheses
// certainly do.
//
// Symbols also cannot start with ?.
const SYMBOL = token(
  /([^?# \n\s\f()\[\]'`,\\";]|\\.)([^# \n\s\f()\[\]'`,\\";]|\\.)*/
);

const ESCAPED_READER_SYMBOL = token(/\\(`|'|,)/);
const INTERNED_EMPTY_STRING = token("##");

const INTEGER_BASE10 = token(/[+-]?[0-9]+\.?/);
const INTEGER_WITH_BASE = token(/#([box]|[0-9][0-9]?r)[0-9a-zA-Z]/);

const FLOAT_WITH_DEC_POINT = token(/[+-]?[0-9]*\.[0-9]+/);
const FLOAT_WITH_EXPONENT = token(/[+-]?[0-9]+[eE][0-9]+/);
const FLOAT_WITH_BOTH = token(/[+-]?[0-9]*\.[0-9]+[eE][0-9]+/);
const FLOAT_INF = token(/-?1.0[eE]\+INF/);
const FLOAT_NAN = token(/-?0.0[eE]\+NaN/);

const CHAR = token(/\?(\\.|.)/);
const UNICODE_NAME_CHAR = token(/\?\\N\{[^}]+\}/);
const LOWER_CODE_POINT_CHAR = token(/\?\\u[0-9a-fA-F]{4}/);
const UPPER_CODE_POINT_CHAR = token(/\?\\U[0-9a-fA-F]{8}/);
const HEX_CHAR = token(/\?\\x[0-9a-fA-F]+/);
const OCTAL_CHAR = token(/\?\\[0-7]{1,3}/);

// E.g. ?\C-o or ?\^o or ?\C-\S-o
const KEY_CHAR = token(/\?(\\(([CMSHsA]-)|\^))+(\\;|.)/);
// E.g. ?\M-\123
const META_OCTAL_CHAR = token(/\?\\M-\\[0-9]{1,3}/);

// https://www.gnu.org/software/emacs/manual/html_node/elisp/Special-Read-Syntax.html
const BYTE_COMPILED_FILE_NAME = token("#$");

module.exports = grammar({
  name: "elisp",

  extras: ($) => [/(\s|\f)/, $.comment],

  rules: {
    source_file: ($) => repeat($._sexp),

    _sexp: ($) =>
      choice(
        $.special_form,
        $.function_definition,
        $.macro_definition,
        $.variable_definer,
        $.constant_definer,
        $.custom_definer,
        $.list,
        $.vector,
        $.hash_table,
        $.bytecode,
        $.string_text_properties,
        $._atom,
        $.quote,
        $.unquote_splice,
        $.unquote
      ),

    _setvar: ($) => seq($.symbol, $._sexp),

    special_form: ($) =>
      seq(
        "(",
        choice(
          "and",
          "catch",
          "cond",
          "condition-case",
          "function",
          "if",
          "interactive",
          "lambda",
          "let",
          "let*",
          "or",
          "prog1",
          "prog2",
          "progn",
          "quote",
          "save-current-buffer",
          "save-excursion",
          "save-restriction",
          "unwind-protect",
          "while"
        ),
        repeat($._sexp),
        ")"
      ),
    variable_definer: ($) =>
      prec(
        1,
        seq(
          "(",
          choice("defvar"),
          field("name", $.symbol),
          optional(field("initvalue", $._sexp)),
          optional(field("docstring", $.string)),
          ")"
        )
      ),
    constant_definer: ($) =>
      prec(
        1,
        seq(
          "(",
          choice("defconst"),
          field("name", $.symbol),
          field("initvalue", $._sexp),
          optional(field("docstring", $.string)),
          ")"
        )
      ),
    custom_definer: ($) =>
      prec(
        1,
        seq(
          "(",
          choice("defcustom"),
          field("name", $.symbol),
          optional(field("standard", $._sexp)),
          optional(field("docstring", $.string)),
          optional(repeat($.custom_args)),
          ")"
        )
      ),
    custom_args: ($) =>
      choice(
        prec.left(1, seq(":type", $._sexp)),
        prec.left(1, seq(":options", $._sexp)),
        prec.left(1, seq(":initialize", $.symbol)),
        prec.left(1, seq(":set", $.symbol)),
        prec.left(1, seq(":get", $.symbol)),
        prec.left(1, seq(":require", $.symbol)),
        prec.left(1, seq(":set-after", $.list)),
        prec.left(1, seq(":risky", $.symbol)),
        prec.left(1, seq(":safe", $.symbol)),
        prec.left(1, seq(":local", $.symbol)),
        prec.left(1, seq(":group", $.symbol)),
        prec.left(1, seq(":link", $._sexp)),
        prec.left(1, seq(":version", $.string)),
        prec.left(1, seq(":package-version", $.list)),
        prec.left(1, seq(":tag", $.string)),
        prec.left(1, seq(":load", $.string))
      ),

    variable_setter: ($) =>
      prec(
        1,
        seq(
          "(",
          choice("setq", "setq-local", "setq-default"),
          repeat($._sexp),
          ")"
        )
      ),

    function_definition: ($) =>
      prec(
        1,
        seq(
          "(",
          choice("defun", "defsubst"),
          field("name", $.symbol),
          optional(field("parameters", $._sexp)),
          optional(field("docstring", $.string)),
          repeat($._sexp),
          ")"
        )
      ),

    macro_definition: ($) =>
      prec(
        1,
        seq(
          "(",
          "defmacro",
          field("name", $.symbol),
          optional(field("parameters", $._sexp)),
          optional(field("docstring", $.string)),
          repeat($._sexp),
          ")"
        )
      ),

    _atom: ($) =>
      choice(
        $.float,
        $.integer,
        $.char,
        $.string,
        $.byte_compiled_file_name,
        $.symbol
      ),
    float: ($) =>
      choice(
        FLOAT_WITH_DEC_POINT,
        FLOAT_WITH_EXPONENT,
        FLOAT_WITH_BOTH,
        FLOAT_INF,
        FLOAT_NAN
      ),
    integer: ($) => choice(INTEGER_BASE10, INTEGER_WITH_BASE),
    char: ($) =>
      choice(
        CHAR,
        UNICODE_NAME_CHAR,
        LOWER_CODE_POINT_CHAR,
        UPPER_CODE_POINT_CHAR,
        HEX_CHAR,
        OCTAL_CHAR,
        KEY_CHAR,
        META_OCTAL_CHAR
      ),
    // Here we tolerate unescaped newlines in double-quoted and
    // single-quoted string literals.
    // This is legal in typescript as jsx/tsx attribute values (as of
    // 2020), and perhaps will be valid in javascript as well in the
    // future.
    //
    string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            alias($.unescaped_double_string_fragment, $.string_fragment),
            $.escape_sequence
          )
        ),
        '"'
      ),
    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token() constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    unescaped_double_string_fragment: ($) =>
      token.immediate(prec(1, /[^"\\]+/)),

    // same here
    unescaped_single_string_fragment: ($) =>
      token.immediate(prec(1, /[^'\\]+/)),

    escape_sequence: ($) =>
      token.immediate(
        seq(
          "\\",
          choice(
            /[^xu0-7]/,
            /[0-7]{1,3}/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u{[0-9a-fA-F]+}/
          )
        )
      ),

    byte_compiled_file_name: ($) => BYTE_COMPILED_FILE_NAME,
    symbol: ($) =>
      choice(
        // Match nil and t separately so we can highlight them.
        "nil",
        "t",
        // We need to define these as separate tokens so we can handle
        // e.g '(defun) as a sexp. Without these, we just try
        // function_definition and produce a parse failure.
        "defun",
        "defsubst",
        "defmacro",
        "defvar",
        "defconst",
        ESCAPED_READER_SYMBOL,
        SYMBOL,
        INTERNED_EMPTY_STRING
      ),

    quote: ($) => seq(choice("#'", "'", "`"), $._sexp),
    unquote_splice: ($) => seq(",@", $._sexp),
    unquote: ($) => seq(",", $._sexp),

    dot: ($) => token("."),
    list: ($) => seq("(", choice(repeat($._sexp)), ")"),
    vector: ($) => seq("[", repeat($._sexp), "]"),
    bytecode: ($) => seq("#[", repeat($._sexp), "]"),

    string_text_properties: ($) => seq("#(", $.string, repeat($._sexp), ")"),

    hash_table: ($) => seq("#s(hash-table", repeat($._sexp), ")"),

    comment: ($) => COMMENT,
  },
});
