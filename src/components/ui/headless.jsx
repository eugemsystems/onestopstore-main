"use client";

/**
 * Lightweight drop-in replacements for @headlessui/react components.
 * Eliminates the Turbopack popover barrel-export bug in Next.js 16.
 *
 * Exports: Transition, TransitionChild, Dialog, DialogPanel, DialogTitle,
 *          TabGroup, TabList, Tab, TabPanels, TabPanel, Menu, MenuButton, Button
 */

import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Helpers ─────────────────────────────────────────────────────────
function cx(...args) {
  return args.filter(Boolean).join(" ");
}

// ─── Transition ──────────────────────────────────────────────────────
const TransitionCtx = createContext(false);

export function Transition({
  show,
  as: As,
  children,
  enter = "",
  enterFrom = "",
  enterTo = "",
  leave = "",
  leaveFrom = "",
  leaveTo = "",
}) {
  const [mounted, setMounted] = useState(show);
  const [phase, setPhase] = useState(show ? "entered" : "exited");
  const elRef = useRef(null);

  useEffect(() => {
    if (show) {
      setMounted(true);
      setPhase("enter-from");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("enter-to"));
      });
    } else if (mounted) {
      setPhase("leave-from");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("leave-to"));
      });
    }
  }, [show]);

  useEffect(() => {
    if (phase !== "leave-to") return;
    const el = elRef.current;
    const done = () => {
      setMounted(false);
      setPhase("exited");
    };
    if (el) {
      el.addEventListener("transitionend", done, { once: true });
      const fallback = setTimeout(done, 500);
      return () => {
        clearTimeout(fallback);
        el.removeEventListener("transitionend", done);
      };
    } else {
      done();
    }
  }, [phase]);

  if (!mounted) return null;

  let tc = "";
  switch (phase) {
    case "enter-from":
      tc = cx(enter, enterFrom);
      break;
    case "enter-to":
    case "entered":
      tc = cx(enter, enterTo);
      break;
    case "leave-from":
      tc = cx(leave, leaveFrom);
      break;
    case "leave-to":
      tc = cx(leave, leaveTo);
      break;
  }

  if (As === Fragment) {
    return (
      <TransitionCtx.Provider value={true}>{children}</TransitionCtx.Provider>
    );
  }

  if (!As) {
    return (
      <TransitionCtx.Provider value={true}>
        <div ref={elRef} className={tc}>
          {children}
        </div>
      </TransitionCtx.Provider>
    );
  }

  return (
    <TransitionCtx.Provider value={true}>
      <As ref={elRef} className={tc}>
        {children}
      </As>
    </TransitionCtx.Provider>
  );
}

export function TransitionChild({
  as: As,
  children,
  enter = "",
  enterFrom = "",
  enterTo = "",
  leave = "",
  leaveFrom = "",
  leaveTo = "",
}) {
  const [phase, setPhase] = useState("enter-from");
  const elRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("enter-to"));
    });
  }, []);

  let tc = "";
  if (phase === "enter-from") tc = cx(enter, enterFrom);
  else tc = cx(enter, enterTo);

  if (As === Fragment || !As) {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(child, {
        ref: elRef,
        className: cx(child.props.className, tc),
      });
    });
  }

  return (
    <As ref={elRef} className={tc}>
      {children}
    </As>
  );
}

// ─── Dialog ──────────────────────────────────────────────────────────
const DialogCtx = createContext(null);

export function Dialog({
  as: As = "div",
  open,
  onClose,
  className,
  children,
  ...props
}) {
  const isOpen = open !== undefined ? open : true;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <DialogCtx.Provider value={{ onClose }}>
      <As
        role="dialog"
        aria-modal="true"
        className={className}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.(false);
        }}
        {...props}
      >
        {children}
      </As>
    </DialogCtx.Provider>
  );
}

export function DialogPanel({ as: As = "div", className, children, ...props }) {
  return (
    <As className={className} onClick={(e) => e.stopPropagation()} {...props}>
      {children}
    </As>
  );
}

export function DialogTitle({ as: As = "h2", className, children, ...props }) {
  return (
    <As className={className} {...props}>
      {children}
    </As>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────
const TabGroupCtx = createContext({
  selectedIndex: 0,
  setSelectedIndex: () => {},
});
const TabIndexCtx = createContext({ current: 0 });

export function TabGroup({ as: As = "div", className, children, ...props }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <TabGroupCtx.Provider value={{ selectedIndex, setSelectedIndex }}>
      <As className={className} {...props}>
        {children}
      </As>
    </TabGroupCtx.Provider>
  );
}

export function TabList({ className, children, ...props }) {
  const counterRef = useRef(0);
  counterRef.current = 0;
  return (
    <TabIndexCtx.Provider value={counterRef}>
      <div role="tablist" className={className} {...props}>
        {children}
      </div>
    </TabIndexCtx.Provider>
  );
}

export function Tab({ className, children, ...props }) {
  const { selectedIndex, setSelectedIndex } = useContext(TabGroupCtx);
  const counter = useContext(TabIndexCtx);
  const idx = useRef(null);
  if (idx.current === null) {
    idx.current = counter.current++;
  }
  const selected = selectedIndex === idx.current;
  const resolvedClass =
    typeof className === "function" ? className({ selected }) : className;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={selected}
      data-selected={selected ? "" : undefined}
      className={resolvedClass}
      onClick={() => setSelectedIndex(idx.current)}
      {...props}
    >
      {typeof children === "function" ? children({ selected }) : children}
    </button>
  );
}

export function TabPanels({ as: As, className, children, ...props }) {
  const { selectedIndex } = useContext(TabGroupCtx);
  const panels = React.Children.toArray(children);

  const rendered = panels.map((panel, i) =>
    React.isValidElement(panel)
      ? React.cloneElement(panel, {
          key: i,
          hidden: selectedIndex !== i,
          style: selectedIndex !== i ? { display: "none" } : undefined,
        })
      : panel,
  );

  if (As === Fragment) return <>{rendered}</>;
  const Wrapper = As || "div";
  return (
    <Wrapper className={className} {...props}>
      {rendered}
    </Wrapper>
  );
}

export function TabPanel({ className, children, hidden, style, ...props }) {
  return (
    <div
      role="tabpanel"
      className={className}
      hidden={hidden}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Menu ────────────────────────────────────────────────────────────
const MenuCtx = createContext({ isOpen: false, setIsOpen: () => {} });

function MenuRoot({ as: As = "div", className, children, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <MenuCtx.Provider value={{ isOpen, setIsOpen }}>
      <As ref={menuRef} className={className} {...props}>
        {typeof children === "function" ? children({ open: isOpen }) : children}
      </As>
    </MenuCtx.Provider>
  );
}

function MenuItems({ className, children, ...props }) {
  const { isOpen } = useContext(MenuCtx);
  if (!isOpen) return null;
  return (
    <div role="menu" className={className} {...props}>
      {children}
    </div>
  );
}

function MenuItem({ children, ...props }) {
  const [active, setActive] = useState(false);
  return (
    <div
      role="menuitem"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      {...props}
    >
      {typeof children === "function" ? children({ active }) : children}
    </div>
  );
}

export function MenuButton({
  as: As = "button",
  className,
  children,
  ...props
}) {
  const { isOpen, setIsOpen } = useContext(MenuCtx);
  return (
    <As
      className={className}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </As>
  );
}

// Attach sub-components to Menu
export const Menu = Object.assign(MenuRoot, {
  Items: MenuItems,
  Item: MenuItem,
});

// ─── Button (simple passthrough) ─────────────────────────────────────
export function Button({ as: As = "button", className, children, ...props }) {
  return (
    <As className={className} {...props}>
      {children}
    </As>
  );
}
