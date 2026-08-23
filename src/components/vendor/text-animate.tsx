"use client"

/**
 * Vendored from componentry.dev (`@componentry/text-animate`), then adapted.
 *
 *  1. Accessibility. The original splits the string into spans and leaves them
 *     all readable, so a per-character animation is announced letter by letter.
 *     The wrapper now carries `aria-label` with the whole string and every
 *     segment is `aria-hidden`, which is the only correct way to split text.
 *  2. `motion.create()` moved out of the render body. Calling it on every
 *     render produces a brand new component type each time, which remounts the
 *     subtree and restarts the animation.
 *  3. The `AnimatePresence` wrapper is gone; nothing here ever unmounts.
 *  4. Imports come from `motion/react`, the package this project already uses.
 */

import { cn } from "@/lib/utils"
import { motion, useInView, useReducedMotion, type MotionProps, type Variants } from "motion/react"
import { ElementType, useMemo, useRef } from "react"

type AnimationType =
  | "fadeIn"
  | "blurIn"
  | "blurInUp"
  | "blurInDown"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown"

interface TextAnimateProps extends MotionProps {
  /**
   * The text to animate
   */
  children: string
  /**
   * The class name for the wrapper element
   */
  className?: string
  /**
   * The class name for the segmented elements (words or characters)
   */
  segmentClassName?: string
  /**
   * The base component to use for the wrapper
   */
  as?: ElementType
  /**
   * The base delay for the animation
   */
  delay?: number
  /**
   * The duration of the animation per item
   */
  duration?: number
  /**
   * The type of animation to perform
   */
  animation?: AnimationType
  /**
   * How to split the text
   */
  by?: "text" | "word" | "character"
  /**
   * Whether to start the animation when the element comes into view
   */
  startOnView?: boolean
  /**
   * Whether to run the animation only once
   */
  once?: boolean
}

export function TextAnimate({
  children,
  delay = 0,
  duration = 0.3,
  className,
  segmentClassName,
  as: Component = "p",
  startOnView = true,
  once = true,
  by = "word",
  animation = "fadeIn",
  ...props
}: TextAnimateProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once })
  const reduced = useReducedMotion()

  const segments =
    by === "character"
      ? children.split("")
      : by === "word"
      ? children.split(" ")
      : [children]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants: Record<
    AnimationType,
    Variants
  > = {
    fadeIn: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { duration },
      },
    },
    blurIn: {
      hidden: { opacity: 0, filter: "blur(10px)" },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration },
      },
    },
    blurInUp: {
      hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: { duration },
      },
    },
    blurInDown: {
      hidden: { opacity: 0, filter: "blur(10px)", y: -20 },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: { duration },
      },
    },
    slideUp: {
      hidden: { y: 20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: { duration },
      },
    },
    slideDown: {
      hidden: { y: -20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: { duration },
      },
    },
    slideLeft: {
      hidden: { x: 20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { duration },
      },
    },
    slideRight: {
      hidden: { x: -20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { duration },
      },
    },
    scaleUp: {
      hidden: { scale: 0.5, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: { duration },
      },
    },
    scaleDown: {
      hidden: { scale: 1.5, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: { duration },
      },
    },
  }

  const finalVariants = itemVariants[animation]

  // Created once per element type. Building it inside the render body would
  // hand React a new component type on every render and remount the text.
  const MotionComponent = useMemo(() => motion.create(Component), [Component])

  return (
    <MotionComponent
      ref={ref}
      // The whole string is announced once here; the segments below are hidden
      // from assistive technology so it is never read out piece by piece.
      aria-label={children}
      className={cn("whitespace-pre-wrap", className)}
      initial={reduced ? "show" : "hidden"}
      animate={startOnView ? (isInView ? "show" : "hidden") : "show"}
      variants={containerVariants}
      {...props}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={`${by}-${i}-${segment}`}
          aria-hidden
          className={cn("inline-block", segmentClassName)}
          variants={finalVariants}
        >
          {segment}
          {by === "word" && i < segments.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </motion.span>
      ))}
    </MotionComponent>
  )
}
