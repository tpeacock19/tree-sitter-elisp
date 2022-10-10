(defun foo (x &optional y)
  ;; ^ keyword
  ;;    ^ function
  ;;        ^ variable.parameter
  ;;          ^ type
  ;;                    ^ variable.parameter
  "`type' docstring `code'"
  ;;       ^ doc
  ;;  ^ type
  ;;                  ^ type
  (interactive "P")
  ;; ^ keyword
  (foo bar 10))

(cl-labels
    ((to-string (one &optional another)
       ;;             ^ type
       (pcase-exhaustive arg)
       (pcase-exhaustive arg)))
  (to-string args))
