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
    [$.defun_header, $.symbol],
    [$.variable_setter, $.symbol],
    [$.macro_definition, $.symbol],
    [$.custom_definition, $.symbol],
    [$.variable_definition, $.symbol],
    [$.constant_definition, $.symbol],
  ],

  // word: ($) => $.identifier,

  rules: {
    source: ($) => repeat(choice($._gap, $._form)),
    _gap: ($) => prec(5, $._ws),
    _ws: (_) => WHITESPACE,
    identifier: ($) => /[a-zA-Z_\\-]+/,

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
          $.special_form,
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
          $._dotted_pair_list,
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

    symbol: ($) =>
      prec(
        PREC.NORMAL,
        choice(
          prec(10, $.boolean),
          token(SYMBOL),
          // allow for dot to be symbol
          // TODO: only allow at end of list
          // $.macro,
          alias(token("."), $.dot),
          choice("defun", "defsubst", "cl-defun", "cl-defsubst"),
          choice("setq", "setq-local", "setq-default"),
          choice("defmacro", "cl-defmacro"),
          choice("defvar", "defcustom", "defconst")
        )
      ),

    keyword: ($) => seq(":", $.identifier),
    quote: ($) => seq(field("marker", "'"), field("value", $._form)),
    fn_quote: ($) =>
      seq(field("marker", "#'"), field("value", $._form)),
    backquote_eval: ($) =>
      seq(field("marker", ","), field("value", $._form)),
    splice: ($) => seq(field("marker", ",@"), field("value", $._form)),
    backquote: ($) =>
      seq(field("marker", "`"), field("value", $._form)),

    _dotted_pair_list: ($) =>
      seq(field("open", "("), $.dotted_pair, field("close", ")")),
    dotted_pair: ($) =>
      seq(field("car", $._form), $.dot, field("cdr", $._form)),

    list: ($) =>
      seq(
        field("open", "("),
        repeat(choice($.cons)),
        field("close", ")")
      ),
    cons: ($) =>
      prec.right(
        1,
        seq(
          field("car", $._form),
          // dotted pair without quotations can be the cdr of a cons cell
          // TODO: Only allow in the final cons cell of list
          optional(field("cdr", choice($.cons, $.dotted_pair)))
        )
      ),

    string: ($) =>
      prec(
        2,
        seq(
          '"',
          repeat(
            choice(
              $.lisp_code,
              alias(
                $.unescaped_double_string_fragment,
                $.string_fragment
              ),
              alias(
                $.unescaped_double_string_fragment_grv,
                $.string_fragment
              ),
              $.null,
              $.escape_sequence
            )
          ),
          token.immediate('"')
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
    unescaped_double_string_fragment: ($) =>
      token.immediate(prec(2, /([^`"\\])+/)),

    unescaped_double_string_fragment_grv: ($) =>
      token.immediate(prec(1, seq("`", optional(/([^'"\\])+/)))),

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
        field("open", "["),
        repeat(choice(field("value", $._form), $._gap)),
        field("close", "]")
      ),

    char_table: ($) =>
      seq(
        field("open", choice("#^[", "#^^[")),
        repeat(choice($._form, $._gap)),
        field("close", "]")
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
        "(",
        alias("interactive", $.special_form),
        optional($._form),
        optional(choice($.list, repeat1(prec(1, $.symbol)))),
        ")"
      ),

    special_form: ($) =>
      prec.left(
        PREC.KWD_LIT,
        seq(
          field("open", "("),
          choice(
            "and",
            "catch",
            "cond",
            "condition-case",
            "function",
            "if",
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
          repeat($._form),
          field("close", ")")
        )
      ),

    variable_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          field("open", "("),
          field("special_form", alias("defvar", $.symbol)),
          field("name", $.symbol),
          optional(field("initvalue", $._form)),
          optional(field("docstring", $.string)),
          field("close", ")")
        )
      ),
    constant_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          field("open", "("),
          field("special_form", alias("defconst", $.symbol)),
          optional(repeat(field("comment", $.comment))),
          field("name", $.symbol),
          field("initvalue", $._form),
          optional(field("docstring", $.string)),
          field("close", ")")
        )
      ),
    custom_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          field("open", "("),
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
          field("close", ")")
        )
      ),
    // _custom_types: (_) =>
    //   choice(
    //     ":initialize",
    //     ":set",
    //     ":get",
    //     ":type",
    //     ":options",
    //     ":require",
    //     ":set-after",
    //     ":risky",
    //     ":safe",
    //     ":local",
    //     ":group",
    //     ":link",
    //     ":package-version",
    //     ":version",
    //     ":tag",
    //     ":load"
    //   ),
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
          field("open", "("),
          field(
            "special_form",
            alias(
              choice("setq", "setq-local", "setq-default"),
              $.symbol
            )
          ),
          repeat1(
            seq(field("symbol", $._form), field("value", $._form))
          ),
          field("close", ")")
        )
      ),
    defun_header: ($) =>
      prec.right(
        PREC.NORMAL,
        choice(
          seq(
            field(
              "macro",
              alias(
                choice("defun", "defsubst", "cl-defun", "cl-defsubst"),
                $.symbol
              )
            ),
            field("function_name", $.symbol),
            field("parameters", $.list)
          ),
          seq(
            field("macro", alias("lambda", $.symbol)),
            field("lambda_list", $.list)
          )
        )
      ),
    function_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          field("open", "("),
          $.defun_header,
          optional(field("docstring", $.string)),
          optional(field("interactive", $.interactive)),
          repeat($._form),
          field("close", ")")
        )
      ),
    macro_definition: ($) =>
      prec.right(
        PREC.NORMAL,
        seq(
          field("open", "("),
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
              seq("(", "declare", repeat1($._form), ")")
            )
          ),
          repeat($._form),
          field("close", ")")
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
    no_read_syntax: ($) =>
      seq(field("open", "#<"), /[^>]*/, field("close", ">")),

    bytecode: ($) =>
      prec(PREC.SPECIAL, seq("#[", repeat($._form), "]")),

    record: ($) => prec(PREC.SPECIAL, seq("#s(", repeat($._form), ")")),
    hash_table: ($) => seq("#s(hash-table", repeat($._form), ")"),

    macro: ($) => choice($._macros_lisp, $._macros_lisp_emacslisp),
    _macros_lisp: ($) =>
      choice(
        "save-mark-and-excursion",
        "define-alternatives",
        "custom-put-if-not",
        "with-help-window",
        "strokes-define-stroke",
        "strokes-define-stroke",
        "hfy-save-buffer-state",
        "define-widget-keywords",
        "image-dired--with-db-file",
        "image-dired--with-marked",
        "image-dired--with-thumbnail-buffer",
        "image-dired--on-file-in-dired-buffer",
        "image-dired--do-mark-command",
        "speedbar-with-writable",
        "widget-specify-insert",
        "dired-mark-if",
        "dired-map-over-marks",
        "define-thing-chars",
        "define-skeleton",
        "transient--with-emergency-exit",
        "transient-define-prefix",
        "transient-define-suffix",
        "transient-define-infix",
        "server-with-environment",
        "rtree-make-node",
        "rtree-set-left",
        "rtree-set-right",
        "rtree-set-range",
        "rtree-low",
        "rtree-high",
        "rtree-set-low",
        "rtree-set-high",
        "rtree-left",
        "rtree-right",
        "rtree-range",
        "repos-debug-macro",
        "declare-function",
        "noreturn",
        "1value",
        "def-edebug-spec",
        "setq-local",
        "defvar-local",
        "push",
        "pop",
        "when",
        "unless",
        "dolist",
        "dotimes",
        "declare",
        "ignore-errors",
        "ignore-error",
        "letrec",
        "dlet",
        "with-wrapper-hook",
        "subr--with-wrapper-hook-no-warnings",
        "delay-mode-hooks",
        "atomic-change-group",
        "with-undo-amalgamate",
        "track-mouse",
        "with-current-buffer",
        "with-selected-window",
        "with-selected-frame",
        "save-window-excursion",
        "with-output-to-temp-buffer",
        "with-temp-file",
        "with-temp-message",
        "with-temp-buffer",
        "with-silent-modifications",
        "with-output-to-string",
        "with-local-quit",
        "while-no-input",
        "condition-case-unless-debug",
        "with-demoted-errors",
        "combine-after-change-calls",
        "combine-change-calls",
        "with-case-table",
        "with-file-modes",
        "with-existing-directory",
        "save-match-data",
        "with-eval-after-load",
        "with-syntax-table",
        "dotimes-with-progress-reporter",
        "dolist-with-progress-reporter",
        "with-mutex",
        "defvar-keymap",
        "with-delayed-message",
        "recentf-dialog",
        "with-cpu-profiling",
        "with-memory-profiling",
        "pcomplete-here",
        "pcomplete-here*",
        "replace--push-stack",
        "proced-with-processes-buffer",
        "save-selected-window",
        "with-temp-buffer-window",
        "with-current-buffer-window",
        "with-displayed-buffer-window",
        "with-window-non-dedicated",
        "comment-with-narrowing",
        "json--with-output-to-string",
        "json--with-indentation",
        "json-readtable-dispatch",
        "with-auto-compression-mode",
        "jsonrpc-lambda",
        "menu-bar-make-mm-toggle",
        "menu-bar-make-toggle",
        "menu-bar-make-toggle-command",
        "imenu-progress-message",
        "with-buffer-prepared-for-jit-lock",
        "info-xref-with-file",
        "info-xref-with-output",
        "lazy-completion-table",
        "with-minibuffer-selected-window",
        "ibuffer-aif",
        "ibuffer-awhen",
        "ibuffer-save-marks",
        "define-ibuffer-column",
        "define-ibuffer-sorter",
        "define-ibuffer-op",
        "define-ibuffer-filter",
        "defimage",
        "make-help-screen",
        "Info-no-error",
        "with-isearch-suspended",
        "isearch-define-mode-toggle",
        "with-connection-local-variables",
        "defezimage",
        "save-buffer-state",
        "with-environment-variables",
        "electric-pair--with-uncached-syntax",
        "electric-pair--save-literal-point-excursion",
        "dframe-with-attached-buffer",
        "face-attribute-specified-or",
        "dabbrev-filter-elements",
        "custom-put-if-not",
        "defcustom",
        "defface",
        "defgroup",
        "deftheme",
        "completion-string",
        "completion-num-uses",
        "completion-last-use-time",
        "completion-source",
        "set-completion-string",
        "set-completion-num-uses",
        "set-completion-last-use-time",
        "cmpl-prefix-entry-symbol",
        "set-cmpl-prefix-entry-head",
        "set-cmpl-prefix-entry-tail",
        "with-buffer-modified-unmodified",
        "bookmark-maybe-historicize-string",
        "bound-and-true-p",
        "auth-source--aput",
        "pcmpl-gnu-with-file-buffer",
        "align--set-marker",
        "hex-char-to-num",
        "num-to-hex-char",
        "md4-make-step",
        "dom-attr",
        "minibuffer-with-setup-hook"
      ),

    _macros_lisp_emacslisp: ($) =>
      choice(
        "syntax-propertize-precompile-rules",
        "syntax-propertize-rules",
        "internal--thread-argument",
        "thread-first",
        "thread-last",
        "if-let*",
        "when-let*",
        "and-let*",
        "if-let",
        "when-let",
        "named-let",
        "with-memoization",
        "package--with-work-buffer",
        "package--with-response-buffer",
        "package--unless-error",
        "package--push",
        "seq-doseq",
        "seq",
        "seq-let",
        "seq-setq",
        "radix-tree-leaf",
        "with-timeout",
        "rx",
        "rx-let-eval",
        "rx-let",
        "rx-define",
        "rx",
        "pcase",
        "pcase-exhaustive",
        "pcase-lambda",
        "pcase-let*",
        "pcase-let",
        "pcase-dolist",
        "pcase-setq",
        "pcase--flip",
        "guard",
        "map",
        "map-let",
        "map--dispatch",
        "map-put",
        "reb-target-binding",
        "add-function",
        "remove-function",
        "define-advice",
        "let-alist",
        "lm-with-file",
        "gv-letplace",
        "gv-define-expander",
        "gv-define-expand",
        "gv-define-setter",
        "gv-define-simple-setter",
        "setf",
        "gv-pushnew!",
        "gv-inc!",
        "gv-dec!",
        "gv-synthetic-place",
        "gv-delay-error",
        "gv-ref",
        "gv-letref",
        "macroexp--accumulate",
        "macroexp-let2",
        "macroexp-let2*",
        "degrees-to-radians",
        "radians-to-degrees",
        "cps--gensym",
        "cps--define-unsupported",
        "cps--with-value-wrapper",
        "cps--with-dynamic-binding",
        "iter-yield-from",
        "iter-defun",
        "iter-lambda",
        "iter-make",
        "iter-do",
        "cps--advance-for",
        "cps--initialize-for",
        "ewoc--set-buffer-bind-dll-let*",
        "ewoc--set-buffer-bind-dll",
        "ert-with-test-buffer",
        "ert-simulate-keys",
        "ert-with-buffer-renamed",
        "ert-with-message-capture",
        "ert-resource-directory",
        "ert-resource-file",
        "ert-with-temp-file",
        "ert-with-temp-directory",
        "defclass",
        "oref",
        "oref-default",
        "with-slots",
        "eieio",
        "eieio-class-parent",
        "oset",
        "oset-default",
        "faceup-defexplainer",
        "let-when-compile",
        "thunk-delay",
        "thunk-let",
        "thunk-let*",
        "ert-deftest",
        "should",
        "should-not",
        "should-error",
        "ert--skip-unless",
        "ert-info",
        "eldoc--documentation-strategy-defcustom",
        "eieio--class-option-assoc",
        "eieio-declare-slots",
        "defgeneric",
        "defmethod",
        "crm--completion-command",
        "define-derived-mode",
        "define-minor-mode",
        "define-globalized-minor-mode",
        "easy-mmode-defmap",
        "easy-mmode-defsyntax",
        "easy-mmode-define-navigation",
        "debugger-env-macro",
        "easy-menu-define",
        "cl-incf",
        "cl-decf",
        "cl-pushnew",
        "cl-declaim",
        "with-comp-cstr-accessors",
        "comp-cstr-set-range-for-arithm",
        "proclaim-inline",
        "proclaim-notinline",
        "defsubst",
        "define-obsolete-function-alias",
        "define-obsolete-variable-alias",
        "define-obsolete-face-alias",
        "dont-compile",
        "eval-when-compile",
        "eval-and-compile",
        "with-suppressed-warnings",
        "byte-compiler-options",
        "benchmark-elapse",
        "benchmark-run",
        "benchmark-run-compiled",
        "benchmark-progn",
        "backtrace--with-output-variables",
        "cl-generic-define-generalizer",
        "cl--generic",
        "cl-defgeneric",
        "cl-generic-current-method-specializers",
        "cl-generic-define-context-rewriter",
        "cl-defmethod",
        "cl--generic-prefill-dispatchers",
        "backquote-list*-macro",
        "backquote",
        "avl-tree--root",
        "avl-tree--switch-dir",
        "avl-tree--dir-to-sign",
        "avl-tree--sign-to-dir",
        "byte-compile-log-lap",
        "byte-optimize--pcase",
        "myaccessor",
        "cl-defsubst",
        "inline-quote",
        "inline-const-p",
        "inline-const-val",
        "inline-error",
        "inline--leteval",
        "inline--letlisteval",
        "inline-letevals",
        "inline-if",
        "define-inline",
        "cl--pop2",
        "cl-defun",
        "cl-iter-defun",
        "cl-function",
        "cl-destructuring-bind",
        "cl-eval-when",
        "cl-load-time-value",
        "cl-case",
        "cl-ecase",
        "cl-typecase",
        "cl-etypecase",
        "cl-block",
        "cl-return",
        "cl-return-from",
        "cl-loop",
        "cl--push-clause-loop-body",
        "cl-do",
        "cl-do*",
        "cl-dolist",
        "cl-dotimes",
        "cl-tagbody",
        "cl-prog",
        "cl-prog*",
        "cl-do-symbols",
        "cl-do-all-symbols",
        "cl-psetq",
        "cl-progv",
        "cl-flet",
        "cl-flet*",
        "cl-labels",
        "cl-macrolet",
        "cl-symbol-macrolet",
        "cl-multiple-value-bind",
        "cl-multiple-value-setq",
        "cl-locally",
        "cl-the",
        "cl-declare",
        "cl-psetf",
        "cl-remf",
        "cl-shiftf",
        "cl-rotatef",
        "cl-letf",
        "cl-letf*",
        "cl-callf",
        "cl-callf2",
        "cl-defsubst",
        "cl--find-class",
        "cl-defstruct",
        "cl-struct",
        "cl-check-type",
        "cl-assert",
        "cl-define-compiler-macro",
        "cl-deftype",
        "cl-type",
        "comp-loop-insn-in-block",
        "comp-with-sp",
        "comp-op-case",
        "comp-apply-in-env",
        "cl-defgeneric",
        "byte-defop",
        "byte-extrude-byte-code-vectors",
        "byte-compile-push-bytecodes",
        "byte-compile-push-bytecode-const2",
        "byte-compile-log",
        "byte-compile-close-variables",
        "displaying-byte-compile-warnings",
        "byte-compile-get-constant",
        "byte-defop-compiler",
        "byte-defop-compiler-1",
        "byte-compile-goto-if",
        "byte-compile-maybe-guarded",
        "bindat--pcase",
        "bindat-type",
        "u8",
        "sint",
        "require",
        "repeat",
        "edebug-save-restriction",
        "edebug-storing-offsets",
        "edebug-tracing",
        "edebug-changing-windows",
        "edebug-outside-excursion",
        "cl--parsing-keywords",
        "cl--check-key",
        "cl--check-test-nokey",
        "cl--check-test",
        "cl--check-match",
        "define-generic-mode",
        "foom",
        "ad-do-advised-functions",
        "defadvice",
        "ad-with-originals"
      ),
  },
});
