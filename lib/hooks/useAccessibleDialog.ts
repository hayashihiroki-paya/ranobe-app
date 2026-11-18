"use client"

import { useEffect, useRef } from "react"

type Options = {
  isOpen: boolean
  onClose?: () => void
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

export function useAccessibleDialog({ isOpen, onClose }: Options) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const dialog = dialogRef.current
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousBodyOverflow = document.body.style.overflow
    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

    document.body.style.overflow = "hidden"

    const initialFocus =
      dialog.querySelector<HTMLElement>("[data-dialog-initial-focus]") ??
      getFocusableElements()[0] ??
      dialog
    initialFocus.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }

      if (event.key !== "Tab") return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const activeIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement,
      )

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault()
        if (event.shiftKey) lastElement.focus()
        else firstElement.focus()
      } else if (activeIndex < 0) {
        event.preventDefault()
        if (event.shiftKey) lastElement.focus()
        else firstElement.focus()
      } else if (event.shiftKey && activeIndex === 0) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeIndex === focusableElements.length - 1) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        const firstFocusable = getFocusableElements()[0]
        if (firstFocusable) firstFocusable.focus()
        else dialog.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("focusin", handleFocusIn)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("focusin", handleFocusIn)
      document.body.style.overflow = previousBodyOverflow

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen])

  return dialogRef
}
