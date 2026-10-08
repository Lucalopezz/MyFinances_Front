"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("relative p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "group relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&.day-range-end]:rounded-r-md",
          props.mode === "range"
            ? "[&.day-range-end]:rounded-r-md [&.day-range-start]:rounded-l-md first:[&[aria-selected]]:rounded-l-md last:[&[aria-selected]]:rounded-r-md"
            : "[&[aria-selected]]:rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal group-aria-selected:opacity-100"
        ),
        range_start:
          "day-range-start bg-primary text-primary-foreground",
        range_end:
          "day-range-end bg-primary text-primary-foreground",
        selected:
          "bg-primary text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "bg-accent text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation }) => {
          const Icon = orientation === "left"
            ? ChevronLeft
            : orientation === "right"
              ? ChevronRight
              : ChevronDown

          return <Icon className={cn("size-4", className)} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
