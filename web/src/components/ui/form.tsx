"use client";

import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { TriangleAlert } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type HTMLMotionProps,
} from "motion/react";
import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

const DURATION = 0.2;
const EASE = "easeOut";

function FormMessage({
  className,
  children,
  ...props
}: HTMLMotionProps<"p"> & { children?: React.ReactNode }) {
  const { error, formMessageId } = useFormField();
  const nextBody = React.useMemo(() => {
    return error ? (
      <>
        <TriangleAlert className="text-destructive size-3.5 shrink-0 translate-y-[0.1875rem]" />
        <span className="text-destructive">{error.message ?? ""}</span>
      </>
    ) : (
      children
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error?.message]);

  // What is currently rendered
  const [displayBody, setDisplayBody] = React.useState<React.ReactNode>();
  const [displayKey, setDisplayKey] = React.useState<string>();

  // Container controls
  const wrapControls = useAnimationControls();
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // Hidden measurer to get target height
  const measureWrapRef = React.useRef<HTMLDivElement>(null);
  const measureChildrenRef = React.useRef<React.ReactNode>(undefined);

  // Keep width context identical to real message
  const measureHeight = React.useCallback((children: React.ReactNode) => {
    measureChildrenRef.current = children;
    if (!measureWrapRef.current || !children) return 0;
    return measureWrapRef.current.offsetHeight;
  }, []);

  // Initialize container
  React.useEffect(() => {
    wrapControls.set({ height: 0, opacity: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Orchestration flags
  const [pendingBody, setPendingBody] = React.useState<React.ReactNode>();
  const [isShrinking, setIsShrinking] = React.useState(false);

  // React to external message changes
  React.useEffect(() => {
    if (nextBody === displayBody) {
      // Same text: just sync height (responsive reflow)
      const target = measureHeight(nextBody);
      void wrapControls.start({
        height: target,
        opacity: nextBody ? 1 : 0,
        transition: { duration: DURATION, ease: EASE },
      });
      return;
    }

    // First show
    if (!displayBody && nextBody) {
      const target = measureHeight(nextBody);
      void (async () => {
        await wrapControls.start({
          height: target,
          opacity: 1,
          transition: { duration: DURATION, ease: EASE },
        });
        setDisplayBody(nextBody); // mount then the text will animate in
        setDisplayKey(error?.message ?? "default");
      })();
      return;
    }

    // Clear all
    if (displayBody && !nextBody) {
      // We’ll let the text exit first (handled in onExitComplete), then shrink to 0
      setPendingBody(undefined);
      setIsShrinking(true);
      setDisplayBody(undefined); // triggers exit
      setDisplayKey(undefined);
      return;
    }

    // Swap text
    if (displayBody && nextBody) {
      const currentH = wrapRef.current?.offsetHeight ?? 0;
      const targetH = measureHeight(nextBody);

      if (targetH > currentH) {
        // Grow first, then enter
        void (async () => {
          await wrapControls.start({
            height: targetH,
            opacity: 1,
            transition: { duration: DURATION, ease: EASE },
          });
          setDisplayBody(nextBody);
          setDisplayKey(error?.message ?? "default");
        })();
        setIsShrinking(false);
      } else {
        // Exit first, then shrink, then enter
        setPendingBody(nextBody);
        setIsShrinking(true);
        setDisplayBody(undefined); // triggers exit
        setDisplayKey(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextBody, displayBody, measureHeight, wrapControls]);

  // After exit finishes: perform shrink (if needed), then mount pending text
  const handleExitComplete = async () => {
    if (!isShrinking) return;

    const targetH = pendingBody ? measureHeight(pendingBody) : 0;
    await wrapControls.start({
      height: targetH,
      opacity: pendingBody ? 1 : 0,
      transition: { duration: DURATION, ease: EASE },
    });

    if (pendingBody) {
      setDisplayBody(pendingBody); // mount new text after container landed
      setDisplayKey(error?.message ?? "default");
      setPendingBody(undefined);
    }
    setIsShrinking(false);
  };

  return (
    <div className="relative">
      {/* Hidden measurer mirrors real DOM for accurate multi-line height */}
      <div
        ref={measureWrapRef}
        className={cn("inline-flex w-full gap-1 text-sm", className)}
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          insetInlineStart: 0,
          insetBlockStart: 0,
          whiteSpace: "normal",
        }}
        aria-hidden
      >
        {measureChildrenRef.current}
      </div>

      {/* Animated container controls height */}
      <motion.div
        ref={wrapRef}
        animate={wrapControls}
        initial={false}
        style={{ overflow: "hidden" }}
        aria-live="polite"
      >
        <AnimatePresence
          mode="wait"
          onExitComplete={handleExitComplete}
          initial={false}
        >
          {displayBody && (
            <motion.p
              key={displayKey}
              data-slot="form-message"
              id={formMessageId}
              className={cn("inline-flex w-full gap-1 text-sm", className)}
              initial={{ opacity: 0, y: "-75%" }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: DURATION, ease: EASE },
              }}
              exit={{
                opacity: 0,
                y: "-75%",
                transition: { duration: DURATION, ease: EASE },
              }}
              {...props}
            >
              {displayBody}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
