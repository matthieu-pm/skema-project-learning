import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import "../../button.css";

const buttonVariants = cva(
  "app-button",
  {
    variants: {
      variant: {
        default: "app-button-primary",
        destructive: "app-button-danger",
        outline: "app-button-outline",
        secondary: "app-button-secondary",
        ghost: "app-button-quiet",
        link: "app-button-link",
      },
      size: {
        default: "app-button-size-default",
        xs: "app-button-size-xs",
        sm: "app-button-size-sm",
        lg: "app-button-size-lg",
        icon: "app-button-size-icon",
        "icon-xs": "app-button-size-icon-xs",
        "icon-sm": "app-button-size-icon-sm",
        "icon-lg": "app-button-size-icon-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    static?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  static: isStatic = false,
  type,
  disabled,
  "aria-disabled": ariaDisabled,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onLostPointerCapture,
  onKeyDown,
  onBlur,
  ...props
}: ButtonProps) {
  const [pointerPressed, setPointerPressed] = React.useState(false);
  const Comp = asChild ? Slot.Root : "button";
  const unavailable = disabled || ariaDisabled === true || ariaDisabled === "true";
  const pressable = !isStatic && !unavailable;
  const resolvedVariant = variant ?? "default";
  const resolvedSize = size ?? "default";

  React.useEffect(() => {
    if (!pointerPressed) return;
    const reset = () => setPointerPressed(false);
    const checkVisibility = () => { if (document.hidden) reset(); };
    window.addEventListener("pointerup", reset, true);
    window.addEventListener("pointercancel", reset, true);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", checkVisibility);
    return () => {
      window.removeEventListener("pointerup", reset, true);
      window.removeEventListener("pointercancel", reset, true);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", checkVisibility);
    };
  }, [pointerPressed]);

  return (
    <Comp
      data-slot="button"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-static={isStatic || undefined}
      data-pressable={pressable ? "true" : "false"}
      data-pointer-pressed={pointerPressed && pressable ? "true" : "false"}
      type={asChild ? type : type ?? "button"}
      disabled={disabled}
      aria-disabled={ariaDisabled ?? (asChild && disabled ? true : undefined)}
      className={cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize, className }))}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (
          !event.defaultPrevented && pressable && event.isPrimary && event.button === 0 &&
          !event.currentTarget.matches(":disabled, [aria-disabled='true']")
        ) setPointerPressed(true);
      }}
      onPointerUp={(event) => { setPointerPressed(false); onPointerUp?.(event); }}
      onPointerCancel={(event) => { setPointerPressed(false); onPointerCancel?.(event); }}
      onPointerLeave={(event) => { setPointerPressed(false); onPointerLeave?.(event); }}
      onLostPointerCapture={(event) => { setPointerPressed(false); onLostPointerCapture?.(event); }}
      onKeyDown={(event) => { setPointerPressed(false); onKeyDown?.(event); }}
      onBlur={(event) => { setPointerPressed(false); onBlur?.(event); }}
      onClick={(event) => {
        if (unavailable) { event.preventDefault(); event.stopPropagation(); return; }
        onClick?.(event);
      }}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
