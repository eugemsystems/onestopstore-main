"use client";

import { Fragment, useMemo } from "react";
import {
  Dialog,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanels,
  TabPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Link from "next/link";
import { X } from "lucide-react";
import Category from "@components/category/Category";
import { useSetting } from "@context/SettingContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getEnabledDrawerPages } from "@utils/navbarMenus";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const PagesDrawer = ({ open, setOpen, categories, categoryError }) => {
  const { storeCustomization, globalSetting } = useSetting() || {};
  const { showingTranslateValue } = useUtilsFunction();
  const drawerLogo =
    storeCustomization?.navbar?.logo ||
    globalSetting?.logo ||
    "/logo/logo-color.png";
  const pages = useMemo(
    () =>
      getEnabledDrawerPages(
        storeCustomization?.navbar,
        showingTranslateValue,
      ),
    [storeCustomization?.navbar, showingTranslateValue],
  );

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 z-40 flex">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-card pb-12 shadow-xl">
              {/* Header */}
              <div className="flex items-center px-4 py-4 justify-between border-b border-border">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>

                <Link
                  href="/"
                  className="flex flex-shrink-0 items-center"
                  onClick={() => setOpen(false)}
                >
                  <img
                    className="h-9 w-auto max-w-[140px] object-contain"
                    src={drawerLogo}
                    alt="Logo"
                  />
                </Link>
              </div>

              {/* Tabs */}
              <TabGroup as="div" className="flex flex-col flex-1">
                {/* Tab list */}
                <div className="bg-muted/40">
                  <TabList className="flex">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-primary text-primary bg-card font-semibold"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                          "flex-1 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors",
                        )
                      }
                    >
                      Category
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-primary text-primary bg-card font-semibold"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                          "flex-1 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors",
                        )
                      }
                    >
                      Pages
                    </Tab>
                  </TabList>
                </div>

                {/* Tab panels */}
                <TabPanels className="flex-1 overflow-y-auto">
                  {/* Category Panel */}
                  <TabPanel>
                    <div className="overflow-y-auto max-h-[70vh] scrollbar-hide">
                      <Category
                        categories={categories}
                        categoryError={categoryError}
                        onClose={() => setOpen(false)}
                      />
                    </div>
                  </TabPanel>

                  {/* Pages Panel */}
                  <TabPanel>
                    <div className="py-2">
                      {pages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                        >
                          <page.icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                          <span className="font-medium">{page.title}</span>
                        </Link>
                      ))}
                    </div>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PagesDrawer;
