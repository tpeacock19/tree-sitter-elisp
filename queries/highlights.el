;;; highlights.el --- Elisp Treesit Highlights -*- lexical-binding: t; -*-
;;
;; Copyright (C) 2022 Trey Peacock
;;
;; Author: Trey Peacock <https://github/tpeacock19>
;; Maintainer: Trey Peacock <git@treypeacock.com>
;; Created: September 01, 2022
;; Modified: September 01, 2022
;; Version: 0.0.1
;; Keywords:
;; Homepage: https://github.com/tpeacock19/highlights
;; Package-Requires: ((emacs 29.0.50) (cl-lib "0.5"))
;;
;; This file is not part of GNU Emacs.
;;
;; This file is free software; you can redistribute it and/or modify it
;; under the terms of the GNU General Public License as published by the
;; Free Software Foundation; either version 3, or (at your option) any
;; later version.

;; This program is distributed in the hope that it will be useful, but
;; WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
;; General Public License for more details.

;; For a full copy of the GNU General Public License
;; see <http://www.gnu.org/licenses/>.
;;
;;; Commentary:
;;
;; Eval or add this code to your init file and set
;; `treesit-font-lock-settings' to this variable.
;;
;; (add-hook 'emacs-lisp-mode-hook
;;           (lambda ()
;;             (treesit-parser-create 'elisp)
;;             (setq-local treesit-font-lock-settings
;;                         my-treesit-elisp-font-lock-settings)
;;             (treesit-font-lock-enable)))
;;
;;; Code:
(defvar my-treesit-elisp-font-lock-settings
  (treesit-font-lock-rules
   :language 'elisp
   '(
     ;; order must go from generic to most specific
     ;; misc
     (number) @font-lock-constant-face
     (char) @font-lock-constant-face
     (lisp_code) @font-lock-constant-face
     (comment) @font-lock-comment-face
     ;; symbols
     (symbol (boolean) @font-lock-builtin-face)
     (symbol (keyword) @font-lock-builtin-face)
     (symbol (param_keyword) @font-lock-type-face)
     (special_syntax (uninterned_symbol (symbol_name) @font-lock-builtin-face))
     (quote (symbol) @font-lock-constant-face)
     (fn_quote (symbol) @font-lock-function-name-face)
     (dotted_pair (dot) @font-lock-builtin-face)
     ;; comments
     (comment (lisp_code):* @font-lock-constant-face)
     (autoload
       (function):* @font-lock-function-name-face
       (keyword) @font-lock-warning-face)
     ;; strings
     (string open: _ @font-lock-string-face)
     (string (escape_sequence) @font-lock-string-face)
     (string (string_fragment) @font-lock-string-face)
     (string (lisp_code) @font-lock-type-face)
     (string close: _ @font-lock-string-face)

     docstring: (string open: _ @font-lock-doc-face)
     docstring: (string (escape_sequence) @font-lock-doc-face)
     docstring: (string (string_fragment) @font-lock-doc-face)
     docstring: (string (lisp_code) @font-lock-type-face)
     docstring: (string close: _ @font-lock-doc-face)

     ;; defined forms
     arglist: (list (symbol (param_keyword) @font-lock-type-face))
     arglist: (list (symbol) @font-lock-variable-name-face)
     interactive: (interactive (special_form) @font-lock-keyword-face)
     interactive: (interactive (string) @font-lock-string-face)
     macro: (symbol) @font-lock-keyword-face
     mode: (symbol) @font-lock-constant-face
     special_form: (symbol) @font-lock-keyword-face
     marker: _ @bold

     (variable_definition name: (symbol) @font-lock-variable-name-face)
     (custom_definition name: (symbol) @font-lock-variable-name-face)
     (variable_setter name: (symbol) @font-lock-variable-name-face)
     (function_definition name: (symbol) @font-lock-function-name-face)
     (macro_definition name: (symbol) @font-lock-function-name-face))))

(provide 'highlights)
;;; highlights.el
