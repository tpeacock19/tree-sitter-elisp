;; Special forms
[
 "and"
 "catch"
 "cond"
 "condition-case"
 "defconst"
 "defvar"
 "function"
 "if"
 "interactive"
 "lambda"
 "let"
 "let*"
 "or"
 "prog1"
 "prog2"
 "progn"
 "quote"
 "save-current-buffer"
 "save-excursion"
 "save-restriction"
 "setq"
 "setq-default"
 "unwind-protect"
 "while"
 ] @keyword

;; Function definitions
[
 "defun"
 "defsubst"
 ] @keyword
(function_definition name: (symbol) @function)
(function_definition parameters: (list (symbol) @variable.parameter))
(function_definition docstring: (string) @doc)

;; Highlight macro definitions the same way as function definitions.
"defmacro" @keyword
(macro_definition name: (symbol) @function)
(macro_definition parameters: (list (symbol) @variable.parameter))
(macro_definition docstring: (string) @doc)

((comment) @variable.special
 (.match? @variable.special "^;;;###autoload"))


(comment) @comment

(integer) @number
(float) @number
(char) @number

(string) @string

[
 "("
 ")"
 "#["
 "["
 "]"
 ] @punctuation.bracket

[
 "`"
 "#'"
 "'"
 ","
 ",@"
 ] @operator

;; package specific macros
((symbol) @function.macro
 (.match? @function.macro "^(use-package|disable|general-with-eval-after-load|general--ensure-lists|general-emacs-define-key|general-evil-define-key|general-def|general-create-definer|general-defs|general-unbind|general--save-state|general-key|general-simulate-keys|general-simulate-key|general-key-dispatch|general-predicate-dispatch|general-swap-key|general-lambda|general-setq|gsetq|general-setq-default|gsetq-default|general-pushnew|general-with-package|general-after-gui|general-after-tty|general-after-init|general-after|general-extended-def-:wk|general-extended-def-:prefix-map|general-l|general-setq-local|gsetq-local|general-add-advice|general-remove-advice|general-with|imap|emap|nmap|vmap|mmap|omap|rmap|iemap|nvmap|itomap|otomap|tomap|use-package-normalize/:ghook|use-package-handler/:gfhook)$"))

;; macros from std directory lisp/emacs-lisp
( (symbol) @keyword
  (.match? @keyword "^(syntax-propertize-precompile-rules|syntax-propertize-rules|internal--thread-argument|thread-first|thread-last|if-let*|when-let*|and-let*|if-let|when-let|named-let|with-memoization|package--with-work-buffer|package--with-response-buffer|package--unless-error|package--push|seq-doseq|seq|seq-let|seq-setq|radix-tree-leaf|with-timeout|rx|rx-let-eval|rx-let|rx-define|rx|pcase|pcase-exhaustive|pcase-lambda|pcase-let*|pcase-let|pcase-dolist|pcase-setq|pcase--flip|guard|map|map-let|map--dispatch|map-put|reb-target-binding|add-function|remove-function|define-advice|let-alist|lm-with-file|gv-letplace|gv-define-expander|gv-define-expand|gv-define-setter|gv-define-simple-setter|setf|gv-pushnew!|gv-inc!|gv-dec!|gv-synthetic-place|gv-delay-error|gv-ref|gv-letref|macroexp--accumulate|macroexp-let2|macroexp-let2*|degrees-to-radians|radians-to-degrees|cps--gensym|cps--define-unsupported|cps--with-value-wrapper|cps--with-dynamic-binding|iter-yield-from|iter-defun|iter-lambda|iter-make|iter-do|cps--advance-for|cps--initialize-for|ewoc--set-buffer-bind-dll-let*|ewoc--set-buffer-bind-dll|ert-with-test-buffer|ert-simulate-keys|ert-with-buffer-renamed|ert-with-message-capture|ert-resource-directory|ert-resource-file|ert-with-temp-file|ert-with-temp-directory|defclass|oref|oref-default|with-slots|eieio|eieio-class-parent|oset|oset-default|faceup-defexplainer|let-when-compile|thunk-delay|thunk-let|thunk-let*|ert-deftest|should|should-not|should-error|ert--skip-unless|ert-info|eldoc--documentation-strategy-defcustom|eieio--class-option-assoc|eieio-declare-slots|defgeneric|defmethod|crm--completion-command|define-derived-mode|define-minor-mode|define-globalized-minor-mode|easy-mmode-defmap|easy-mmode-defsyntax|easy-mmode-define-navigation|debugger-env-macro|easy-menu-define|cl-incf|cl-decf|cl-pushnew|cl-declaim|with-comp-cstr-accessors|comp-cstr-set-range-for-arithm|proclaim-inline|proclaim-notinline|defsubst|define-obsolete-function-alias|define-obsolete-variable-alias|define-obsolete-face-alias|dont-compile|eval-when-compile|eval-and-compile|with-suppressed-warnings|byte-compiler-options|benchmark-elapse|benchmark-run|benchmark-run-compiled|benchmark-progn|backtrace--with-output-variables|cl-generic-define-generalizer|cl--generic|cl-defgeneric|cl-generic-current-method-specializers|cl-generic-define-context-rewriter|cl-defmethod|cl--generic-prefill-dispatchers|backquote-list*-macro|backquote|avl-tree--root|avl-tree--switch-dir|avl-tree--dir-to-sign|avl-tree--sign-to-dir|byte-compile-log-lap|byte-optimize--pcase|myaccessor|cl-defsubst|inline-quote|inline-const-p|inline-const-val|inline-error|inline--leteval|inline--letlisteval|inline-letevals|inline-if|define-inline|cl--pop2|cl-defun|cl-iter-defun|cl-function|cl-destructuring-bind|cl-eval-when|cl-load-time-value|cl-case|cl-ecase|cl-typecase|cl-etypecase|cl-block|cl-return|cl-return-from|cl-loop|cl--push-clause-loop-body|cl-do|cl-do*|cl-dolist|cl-dotimes|cl-tagbody|cl-prog|cl-prog*|cl-do-symbols|cl-do-all-symbols|cl-psetq|cl-progv|cl-flet|cl-flet*|cl-labels|cl-macrolet|cl-symbol-macrolet|cl-multiple-value-bind|cl-multiple-value-setq|cl-locally|cl-the|cl-declare|cl-psetf|cl-remf|cl-shiftf|cl-rotatef|cl-letf|cl-letf*|cl-callf|cl-callf2|cl-defsubst|cl--find-class|cl-defstruct|cl-struct|cl-check-type|cl-assert|cl-define-compiler-macro|cl-deftype|cl-type|comp-loop-insn-in-block|comp-with-sp|comp-op-case|comp-apply-in-env|cl-defgeneric|byte-defop|byte-extrude-byte-code-vectors|byte-compile-push-bytecodes|byte-compile-push-bytecode-const2|byte-compile-log|byte-compile-close-variables|displaying-byte-compile-warnings|byte-compile-get-constant|byte-defop-compiler|byte-defop-compiler-1|byte-compile-goto-if|byte-compile-maybe-guarded|bindat--pcase|bindat-type|u8|sint|repeat|edebug-save-restriction|edebug-storing-offsets|edebug-tracing|edebug-changing-windows|edebug-outside-excursion|cl--parsing-keywords|cl--check-key|cl--check-test-nokey|cl--check-test|cl--check-match|define-generic-mode|foom|ad-do-advised-functions|defadvice|ad-with-originals)$"))

;; std directory lisp/
( (symbol) @keyword
  (.match? @keyword
           "^(save-mark-and-excursion|define-alternatives|custom-put-if-not|with-help-window|strokes-define-stroke|strokes-define-stroke|hfy-save-buffer-state|define-widget-keywords|image-dired--with-db-file|image-dired--with-marked|image-dired--with-thumbnail-buffer|image-dired--on-file-in-dired-buffer|image-dired--do-mark-command|speedbar-with-writable|widget-specify-insert|dired-mark-if|dired-map-over-marks|define-thing-chars|define-skeleton|transient--with-emergency-exit|transient-define-prefix|transient-define-suffix|transient-define-infix|server-with-environment|rtree-make-node|rtree-set-left|rtree-set-right|rtree-set-range|rtree-low|rtree-high|rtree-set-low|rtree-set-high|rtree-left|rtree-right|rtree-range|repos-debug-macro|declare-function|noreturn|1value|def-edebug-spec|setq-local|defvar-local|push|pop|when|unless|dolist|dotimes|declare|ignore-errors|ignore-error|letrec|dlet|with-wrapper-hook|subr--with-wrapper-hook-no-warnings|delay-mode-hooks|atomic-change-group|with-undo-amalgamate|track-mouse|with-current-buffer|with-selected-window|with-selected-frame|save-window-excursion|with-output-to-temp-buffer|with-temp-file|with-temp-message|with-temp-buffer|with-silent-modifications|with-output-to-string|with-local-quit|while-no-input|condition-case-unless-debug|with-demoted-errors|combine-after-change-calls|combine-change-calls|with-case-table|with-file-modes|with-existing-directory|save-match-data|with-eval-after-load|with-syntax-table|dotimes-with-progress-reporter|dolist-with-progress-reporter|with-mutex|defvar-keymap|with-delayed-message|recentf-dialog|with-cpu-profiling|with-memory-profiling|pcomplete-here|pcomplete-here*|replace--push-stack|proced-with-processes-buffer|save-selected-window|with-temp-buffer-window|with-current-buffer-window|with-displayed-buffer-window|with-window-non-dedicated|comment-with-narrowing|json--with-output-to-string|json--with-indentation|json-readtable-dispatch|with-auto-compression-mode|jsonrpc-lambda|menu-bar-make-mm-toggle|menu-bar-make-toggle|menu-bar-make-toggle-command|imenu-progress-message|with-buffer-prepared-for-jit-lock|info-xref-with-file|info-xref-with-output|lazy-completion-table|with-minibuffer-selected-window|ibuffer-aif|ibuffer-awhen|ibuffer-save-marks|define-ibuffer-column|define-ibuffer-sorter|define-ibuffer-op|define-ibuffer-filter|defimage|make-help-screen|Info-no-error|with-isearch-suspended|isearch-define-mode-toggle|with-connection-local-variables|defezimage|save-buffer-state|with-environment-variables|electric-pair--with-uncached-syntax|electric-pair--save-literal-point-excursion|dframe-with-attached-buffer|face-attribute-specified-or|dabbrev-filter-elements|custom-put-if-not|defcustom|defface|defgroup|deftheme|completion-string|completion-num-uses|completion-last-use-time|completion-source|set-completion-string|set-completion-num-uses|set-completion-last-use-time|cmpl-prefix-entry-symbol|set-cmpl-prefix-entry-head|set-cmpl-prefix-entry-tail|with-buffer-modified-unmodified|bookmark-maybe-historicize-string|bound-and-true-p|auth-source--aput|pcmpl-gnu-with-file-buffer|align--set-marker|hex-char-to-num|num-to-hex-char|md4-make-step|dom-attr|minibuffer-with-setup-hook)$"))



(["("] @punctuation
 ((symbol) @variable.builtin
  (.match? @variable.builtin "^:")))

(["("] @punctuation
 ((quote) @function
  (.match? @function "^#'")))

((symbol) @type
 (.match? @type "^&"))


((quote) @variable
 (.match? @variable "^'\\("))

(["("] @punctuation.bracket
 .
 ["and" "catch" "cond" "condition-case" "defconst"
  "defvar" "function" "if" "interactive" "lambda" "let"
  "let*" "or" "prog1" "prog2" "progn" "quote"
  "save-current-buffer" "save-excursion" "save-restriction"
  "setq" "setq-default" "unwind-protect" "while"
  ]
 @keyword
 (symbol) @variable
 (.match? @variable ".*"))

(["("]
 @punctuation.bracket
 .
 (symbol) @function
 .
 (.match? @function ".*"))

(["("] @punctuation.bracket
 (symbol) @variable
 .
 (symbol) @variable
 (.match? @variable ".*"))

;; Highlight nil and t as constants, unlike other symbols
[
 "nil"
 "t"
 ] @constant.builtin

(quote) @variable
(symbol) @variable
