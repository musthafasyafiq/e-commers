"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <Link
              href="/categories"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/deals"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Deals
            </Link>
            <Link
              href="/new-arrivals"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              New Arrivals
            </Link>
            <Link
              href="/seller"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Sell
            </Link>
            <Link
              href="/support"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Support
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
