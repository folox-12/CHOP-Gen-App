import { useState, useRef, useLayoutEffect } from "react";
import { ToastContainer } from "react-toastify";
import { TEXTS } from "@/constants/texts";
import { Employees } from "@/sections/Employees";
import { SupervisoryCase } from "@/sections/SupervisoryCase";
import { Loader } from "@/components/Loader";
import { AddOrganization } from "@/components/AddOrganization";
import type { ComponentType } from "react";

type Tab = "employees" | "supervisoryCase";

type TabConfig = {
  id: Tab;
  label: string;
  Component: ComponentType;
};

const TABS: TabConfig[] = [
  { id: "employees", label: TEXTS.tabs.employees, Component: Employees },
  {
    id: "supervisoryCase",
    label: TEXTS.tabs.supervisoryCase,
    Component: SupervisoryCase,
  },
];

const tabClass = (activeTab: Tab, tab: Tab) =>
  `px-6 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px hover:cursor-pointer hover:text-bold ${
    activeTab === tab
      ? "border-cyan-500 text-cyan-600"
      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
  }`;

export const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>("employees");
  const [loading, setLoading] = useState(true);
  const logoRef = useRef<HTMLImageElement>(null);
  const [logoRect, setLogoRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (logoRef.current) {
      setLogoRect(logoRef.current.getBoundingClientRect());
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {loading && (
        <Loader targetRect={logoRect} onDone={() => setLoading(false)} />
      )}

      <nav className="flex border-b-2 border-gray-200 bg-white px-3 items-center gap-1 pt-7">
        <img
          ref={logoRef}
          src="/iceberg.svg"
          width={40}
          height={40}
          alt="Iceberg"
          style={{ opacity: loading ? 0 : 1, transition: "opacity 0.15s ease" }}
        />
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={tabClass(activeTab, id)}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 pt-3">
        <AddOrganization />
      </div>

      <main className="flex-1 min-h-0 overflow-auto">
        {TABS.map(
          ({ id, Component }) => activeTab === id && <Component key={id} />,
        )}
      </main>

      <ToastContainer hideProgressBar={true} />
    </div>
  );
};
