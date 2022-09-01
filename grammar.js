// Symbols can contain any character when escaped:
// https://www.gnu.org/software/emacs/manual/html_node/elisp/Symbol-Type.html
// Most characters do not need escaping, but space and parentheses
// certainly do.
//
// Symbols also cannot start with ?.

const WHITESPACE_CHAR =
  /[\f\n\r\t, \u000B\u001C\u001D\u001E\u001F\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200a\u205f\u3000]/;

const WHITESPACE = token(repeat1(WHITESPACE_CHAR));
const PREC = {
  NUM_LIT: 0,
  EXP_LIT: 3,
  FLOAT_LIT: 2,
  INT_LIT: 1,
  NORMAL: 1,
  DEFINED: 2,
  DOTTET_LIT: 3,
  KWD_LIT: 4,
  SPECIAL: 5,
  META_LIT: 6,
};

const NULL = /\u0000/;
const WORD = /(\w|\s_)+[^ \t\n]*[ \t\n]*/;
const DIGIT = /[0-9]/;
const ALPHANUMERIC = /[0-9a-zA-Z]/;
const HEX_DIGIT = /[0-9a-fA-F]/;
const OCTAL_DIGIT = /[0-7]/;
const BINARY_DIGIT = /[0-1]/;
const RADIX_DIGIT = choice(
  /[2-9]/,
  seq(/[1-2]/, DIGIT),
  seq(/3/, /[0-6]/)
);

// Special Syntax
// (info "(elisp)Special Read Syntax")
const INTERNED_EMPTY_STRING = token("##");
// defined uninterned symbol in rules to highlight symbol name
// const UNINTERNED_SYMBOL = seq(/#/, token(seq(/:/, repeat1(WORD))));
const CIRCULAR_LOOP = token(seq(/#/, repeat1(DIGIT)));
const CIRCULAR_REF = token(seq(/#/, repeat1(DIGIT), /#/));
const HEX_SPECIAL = seq("#", /[xX]/, repeat1(HEX_DIGIT));
const OCTAL_SPECIAL = seq("#", /[oO]/, repeat1(OCTAL_DIGIT));
const BINARY_SPECIAL = seq("#", /[bB]/, repeat1(BINARY_DIGIT));
const RADIX_SPECIAL = seq("#", RADIX_DIGIT, "r", repeat1(ALPHANUMERIC));
const UNREADABLE_FORM = token(seq(/#f/));

// https://www.gnu.org/software/emacs/manual/html_node/elisp/Special-Read-Syntax.html
const BYTE_COMPILED_FILE_NAME = token("#$");

// Integers
// (info "(elisp)Integer Basics")
const BASE10_INTEGER = seq(
  optional(/[+-]/),
  repeat1(DIGIT),
  optional(/\./)
);
const INTEGER = choice(
  BASE10_INTEGER,
  HEX_SPECIAL,
  OCTAL_SPECIAL,
  BINARY_SPECIAL,
  RADIX_SPECIAL
);
// Floating Points
// (info "(elisp)Float Basics")
const DECIMAL = seq(
  optional(/[+-]/),
  repeat(DIGIT),
  seq(".", repeat1(DIGIT))
);
const EXPONENT = seq(
  optional(/[+-]/),
  repeat(DIGIT),
  optional(/\./),
  repeat1(DIGIT),
  /[eE]/,
  optional(/[+-]/),
  choice(repeat1(DIGIT), /INF/, /NaN/)
);
const FLOAT = choice(DECIMAL, EXPONENT);

const NIL = token("nil");
const BOOLEAN = token(choice("nil", "t"));

const NON_BACKSLASH_CHAR = /[^\\\(\)\[\];\"]/;
const CTRL_ESC = /(\\(([CMSHsA]-)|\^))+/;
const ALPHA_ESC = seq(/\\/, /[^CMSHA]/);
const LOWER_UNICODE_ESC = seq(/\\u[0-9a-fA-F]{4}/);
const UPPER_UNICODE_ESC = seq(/\\U[0-9a-fA-F]{8}/);
const HEX_ESC = seq(/\\x/, repeat1(HEX_DIGIT));
const OCTAL_ESC = seq(
  /\\/,
  OCTAL_DIGIT,
  optional(OCTAL_DIGIT),
  optional(OCTAL_DIGIT)
);
const UNICODE_NAME_ESC = token(/\\N\{[^}]+\}/);

const KEYBIND_ESC = choice(
  seq(
    CTRL_ESC,
    choice(
      ALPHA_ESC,
      LOWER_UNICODE_ESC,
      UPPER_UNICODE_ESC,
      UNICODE_NAME_ESC,
      HEX_ESC,
      OCTAL_ESC
    )
  ),
  seq(CTRL_ESC, NON_BACKSLASH_CHAR)
);

// Keybind characters don't need backslashes when in strings
const KEYBIND_ESC_STR = choice(
  seq(
    CTRL_ESC,
    choice(
      ALPHA_ESC,
      LOWER_UNICODE_ESC,
      UPPER_UNICODE_ESC,
      UNICODE_NAME_ESC,
      HEX_ESC,
      OCTAL_ESC
    )
  ),
  seq(CTRL_ESC, /./)
);
const ESC_SEQUENCE = choice(
  ALPHA_ESC,
  LOWER_UNICODE_ESC,
  UPPER_UNICODE_ESC,
  UNICODE_NAME_ESC,
  HEX_ESC,
  OCTAL_ESC,
  KEYBIND_ESC
);

// const ASCII_CHAR = /[\u0000-\u007F]/;
// const NON_BACKSLASH_ASCII_CHAR = /[\u0000-\u007F--[\\\(\)\[\];\"]]/;
const ALPHA_ESC_CHAR = token(
  seq(/\?/, choice(ALPHA_ESC, NON_BACKSLASH_CHAR))
);
const UNICODE_NAME_CHAR = token(seq(/\?/, UNICODE_NAME_ESC));
const LOWER_CODE_POINT_CHAR = token(seq(/\?/, LOWER_UNICODE_ESC));
const UPPER_CODE_POINT_CHAR = token(seq(/\?/, UPPER_UNICODE_ESC));
const HEX_CHAR = token(seq(/\?/, HEX_ESC));
const OCTAL_CHAR = token(seq(/\?/, OCTAL_ESC));

const META_OCTAL_CHAR = token(seq(/\?\\M-\\/, repeat1(OCTAL_DIGIT)));

const KEYBIND_CHAR = token(seq(/\?/, KEYBIND_ESC));

// \u2026 is horizontal ellips
const SYMBOL = prec.right(
  token(
    seq(
      choice(
        ALPHANUMERIC,
        /[-+=*/_~!@$%^&:<>{}\.′]/,
        /\\./,
        /(\p{Symbol}|\p{Letter}|\p{Mark}\|\p{Number}|[[\p{P}]--[\u0020-\u00A7]])/
      ),
      repeat(
        choice(
          ALPHANUMERIC,
          /[-+=*/_~!@$%^&:<>{}\.′?]/,
          /\\./,
          /\p{Symbol}|\p{Letter}|\p{Mark}|\p{Number}|[[\p{P}]--[\u0020-\u00A7]]/
        )
      )
    )
  )
);

module.exports = grammar({
  name: "elisp",

  extras: ($) => [$.comment, $._ws, /(\s|\f)/],

  conflicts: ($) => [
    // [$.autoload],
    // [$.circular_object],
    // [$._defun_header, $.symbol],
    [$.variable_setter, $.symbol],
    [$.macro_definition, $.symbol],
    [$.custom_definition, $.symbol],
    [$.function_definition, $.symbol],
    [$.variable_definition, $.symbol],
    [$.constant_definition, $.symbol],
  ],

  word: ($) => $.identifier,

  rules: {
    source: ($) => repeat(choice($._gap, $._form)),
    _gap: ($) => prec(5, $._ws),
    _ws: (_) => WHITESPACE,
    identifier: ($) => /[a-zA-Z_\\-]+/,

    _paren_open: ($) => token.immediate("("),
    _paren_close: ($) => token.immediate(")"),
    _brk_open: ($) => token.immediate("["),
    _brk_close: ($) => token.immediate("]"),
    _form: ($) =>
      prec.right(
        choice(
          // atoms
          $.variable_setter,
          $.macro_definition,
          $.custom_definition,
          $.variable_definition,
          $.constant_definition,
          $.function_definition,
          $.number,
          // $.special_form,
          $.special_syntax,
          $.string,
          $.char,
          $.symbol,
          $.vector,
          $.char_table,
          $.bool_vector,
          $.hash_table,
          $.bytecode,
          $.record,
          $.text_properties,
          $.interactive,
          $.list,
          // $.keyword,
          alias($.dotted_pair_list, $.list),
          // some other reader macros
          $.fn_quote,
          $.quote,
          $.backquote,
          $.splice,
          $.backquote_eval,
          $.no_read_syntax
        )
      ),

    special_syntax: ($) =>
      prec(
        PREC.SPECIAL,
        choice(
          $.interned_empty_string,
          $.uninterned_symbol,
          $.circular_loop,
          $.circular_object,
          $.circular_ref,
          $.unreadable_form,
          $.byte_compiled_file_name
        )
      ),

    text_properties: ($) =>
      seq("#(", $.string, repeat(seq($._form, $._form, $._form)), ")"),

    exponent: ($) => token(prec(PREC.EXP_LIT, EXPONENT)),
    decimal: ($) => token(prec(PREC.FLOAT_LIT, DECIMAL)),
    integer: ($) => token(prec.right(INTEGER)),

    number: ($) => prec.left(choice($.float, $.integer)),
    float: ($) =>
      choice(prec.right(2, $.exponent), prec.left(1, $.decimal)),

    char: ($) =>
      prec.left(
        seq(
          choice(
            ALPHA_ESC_CHAR,
            UNICODE_NAME_CHAR,
            LOWER_CODE_POINT_CHAR,
            UPPER_CODE_POINT_CHAR,
            HEX_CHAR,
            OCTAL_CHAR,
            KEYBIND_CHAR,
            META_OCTAL_CHAR
          )
        )
      ),

    boolean: ($) => token(BOOLEAN),
    // Look for dot with space afterward for dotted notation
    dot: ($) => token(". "),

    keyword: ($) => token(seq(":", SYMBOL)),
    param_keyword: ($) => token(seq("&", choice("optional", "rest"))),
    error: ($) => token("error"),

    symbol: ($) =>
      prec(
        PREC.NORMAL,
        choice(
          prec(10, $.boolean),
          // alias(token(seq(":", SYMBOL)), $.keyword),
          $.keyword,
          $.param_keyword,
          token(SYMBOL),
          // allow for dot to be symbol
          // TODO: only allow at end of list
          alias(token("."), $.dot),
          choice("defun", "defsubst", "cl-defun", "cl-defsubst"),
          choice("setq", "setq-local", "setq-default"),
          choice("defmacro", "cl-defmacro"),
          choice("defvar", "defcustom", "defconst")
        )
      ),

    quote: ($) => seq(field("marker", "'"), field("value", $._form)),
    fn_quote: ($) =>
      seq(field("marker", "#'"), field("value", $._form)),
    backquote_eval: ($) =>
      seq(field("marker", ","), field("value", $._form)),
    splice: ($) => seq(field("marker", ",@"), field("value", $._form)),
    backquote: ($) =>
      seq(field("marker", "`"), field("value", $._form)),

    dotted_pair_list: ($) =>
      seq($._paren_open, $._dotted_pair, $._paren_close),
    // prec.right(seq(token("("), $.dotted_pair, token(")"))),
    _dotted_pair: ($) =>
      seq(field("car", $._form), $.dot, field("cdr", $._form)),

    list: ($) =>
      seq($._paren_open, repeat(choice($._cons)), $._paren_close),
    _cons: ($) =>
      prec.right(
        1,
        seq(
          choice($._form),
          // dotted pair without quotations can be the cdr of a cons cell
          // TODO: Only allow in the final cons cell of list
          optional(
            choice($._cons, alias($._dotted_pair, $.dotted_pair))
          )
        )
      ),

    string: ($) =>
      prec(
        2,
        seq(
          field("open", '"'),
          repeat(
            choice(
              $.lisp_code,
              alias(
                $._unescaped_double_string_fragment,
                $.string_fragment
              ),
              $.null,
              $.escape_sequence
            )
          ),
          field("close", token.immediate('"'))
        )
      ),

    lisp_code: ($) =>
      token.immediate(
        prec.left(
          3,
          choice(
            // Allow for escaped quotation mark in lisp-code
            seq("`", /[^'"`\n]*\\"[^'"`\n]*/, "'"),
            seq("`", /[^'"`\n]+/, "'")
          )
        )
      ),

    null: ($) => NULL,
    _unescaped_double_string_fragment: ($) =>
      token.immediate(
        choice(
          prec(2, /([^`"\\])+/),
          prec(1, seq("`", optional(/([^'"\\])+/)))
        )
      ),

    unicode_name_esc: ($) => token(UNICODE_NAME_ESC),
    unicode_point_esc: ($) =>
      token(choice(LOWER_UNICODE_ESC, UPPER_UNICODE_ESC)),
    hex_esc: ($) => token(HEX_ESC),
    _octal_esc: ($) => token.immediate(OCTAL_ESC),
    keybind_esc: ($) => token(KEYBIND_ESC_STR),

    escape_sequence: ($) =>
      prec.right(
        3,
        seq(
          choice(
            $.unicode_name_esc,
            $.unicode_point_esc,
            $.hex_esc,
            alias($._octal_esc, $.octal_esc),
            $.keybind_esc,
            token(ALPHA_ESC)
          ),
          optional("\\ ")
        )
      ),

    vector: ($) =>
      seq(
        $._brk_open,
        repeat(choice(field("value", $._form), $._gap)),
        $._brk_close
      ),

    char_table: ($) =>
      seq(
        field("open", choice("#^[", "#^^[")),
        repeat(choice($._form, $._gap)),
        "]"
      ),

    bool_vector: ($) =>
      seq(
        "#&",
        repeat(DIGIT),
        /"/,
        choice(/\^./, repeat($._octal_esc)),
        field("close", /"/)
      ),

    comment: ($) =>
      prec(
        1,
        seq(
          ";",
          repeat(
            choice(
              // seq($.fn_autoload, $.autokey),
              choice($.autoload, $._comment_header),
              $.lisp_code,
              token.immediate(prec(2, /[^`\n]+/)),
              token.immediate(prec(2, seq("`", optional(/[^'"\n]+/))))
            )
          ),
          token.immediate("\n")
        )
      ),
    _autoload_header: ($) =>
      token.immediate(prec(3, seq(";;###", optional("(")))),
    _comment_header: ($) =>
      token.immediate(prec(3, seq(";;####", /[^`\n]+/))),
    autoload: ($) =>
      seq(
        $._autoload_header,
        alias(
          optional(token.immediate(seq(/[a-zA-Z\\]*/))),
          $.function
        ),
        optional("-"),
        alias("autoload", $.keyword)
      ),
    interactive: ($) =>
      seq(
        $._paren_open,
        alias("interactive", $.special_form),
        optional($._form),
        optional(choice($.list, repeat1(prec(1, $.symbol)))),
        $._paren_close
      ),

    special_form: ($) =>
      prec.left(
        PREC.KWD_LIT,
        seq(
          $._paren_open,
          choice(
            "and",
            "catch",
            "cond",
            "condition-case",
            "function",
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
          repeat($._form),
          $._paren_close
        )
      ),

    variable_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          $._paren_open,
          field("special_form", alias("defvar", $.symbol)),
          field("name", $.symbol),
          optional(field("initvalue", $._form)),
          optional(field("docstring", $.string)),
          $._paren_close
        )
      ),
    constant_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          $._paren_open,
          field("special_form", alias("defconst", $.symbol)),
          optional(repeat(field("comment", $.comment))),
          field("name", $.symbol),
          field("initvalue", $._form),
          optional(field("docstring", $.string)),
          $._paren_close
        )
      ),
    custom_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          $._paren_open,
          field("macro", alias("defcustom", $.symbol)),
          field("name", $.symbol),
          field("standard", $._form),
          field("docstring", $.string),
          // repeat(
          //   seq(
          //     field("key", alias($._custom_types, $.keyword)),
          //     field("value", $._form)
          //   )
          // ),
          repeat(
            choice(
              seq(
                field("key", alias($._custom_type_form, $.keyword)),
                field("value", $._form)
              ),
              seq(
                field("key", alias($._custom_type_quote, $.keyword)),
                field("value", choice($.quote, $.symbol))
              ),
              seq(
                field("key", alias($._custom_type_string, $.keyword)),
                field("value", $.string)
              )
            )
          ),
          $._paren_close
        )
      ),
    _custom_type_form: ($) => choice(":initialize", ":set", ":get"),
    _custom_type_quote: ($) =>
      choice(
        ":type",
        ":options",
        ":require",
        ":set-after",
        ":risky",
        ":safe",
        ":local",
        ":group",
        ":link",
        ":package-version"
      ),
    _custom_type_string: ($) => choice(":version", ":tag", ":load"),
    variable_setter: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          $._paren_open,
          field(
            "special_form",
            alias(
              choice("setq", "setq-local", "setq-default"),
              $.symbol
            )
          ),
          repeat1(seq(field("name", $._form), field("value", $._form))),
          $._paren_close
        )
      ),
    // _defun_header: ($) => prec.right(PREC.NORMAL),
    function_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          $._paren_open,
          choice(
            seq(
              field(
                "macro",
                alias(
                  choice(
                    "defun",
                    "defsubst",
                    "cl-defun",
                    "cl-defsubst"
                  ),
                  $.symbol
                )
              ),
              field("name", $.symbol),
              field("parameters", $.list)
            ),
            seq(
              field("macro", alias("lambda", $.symbol)),
              field("lambda_list", $.list)
            )
          ),
          optional(field("docstring", $.string)),
          optional(field("interactive", $.interactive)),
          repeat($._form),
          $._paren_close
        )
      ),
    macro_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          $._paren_open,
          field(
            "macro",
            alias(choice("defmacro", "cl-defmacro"), $.symbol)
          ),
          field("name", $._form),
          field("parameters", $.list),
          field("docstring", optional($.string)),
          optional(
            field(
              "declaration",
              seq(
                $._paren_open,
                "declare",
                repeat1($._form),
                $._paren_close
              )
            )
          ),
          field("body", repeat($._form)),
          $._paren_close
        )
      ),

    byte_compiled_file_name: ($) => BYTE_COMPILED_FILE_NAME,
    interned_empty_string: ($) => INTERNED_EMPTY_STRING,
    uninterned_symbol: ($) =>
      seq(/#/, alias(token(seq(/:/, repeat1(WORD))), $.symbol_name)),
    circular_object: ($) =>
      prec.right(
        2,
        seq(
          field("name", alias($.circular_loop, $.name)),
          "=",
          field("object", repeat(choice($._form, $._gap)))
        )
      ),
    circular_loop: ($) => CIRCULAR_LOOP,

    circular_ref: ($) => CIRCULAR_REF,
    unreadable_form: ($) => UNREADABLE_FORM,
    no_read_syntax: ($) => seq("#<", /[^>]*/, ">"),

    bytecode: ($) =>
      prec(PREC.SPECIAL, seq("#[", repeat($._form), "]")),

    record: ($) => prec(PREC.SPECIAL, seq("#s(", repeat($._form), ")")),
    hash_table: ($) => seq("#s(hash-table", repeat($._form), ")"),
  },
});
