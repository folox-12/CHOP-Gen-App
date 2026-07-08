import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { open } from "@tauri-apps/plugin-shell";
import { TEXTS } from "@/constants/texts";
import { Employees } from "@/sections/Employees";
import { SupervisoryCase } from "@/sections/SupervisoryCase";
import { Loader } from "@/components/Loader";
import { BearIcon } from "@/components/ui/BearIcon";
import { Header } from "@/components/Header";
import { useCompanyStore } from "@/entity/organisation/useOrganisationStore";
import { checkForUpdate } from "@/utils/checkForUpdate";
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
  const selectOrg = useCompanyStore((state) => state.selectOrg);
  const organization = useCompanyStore((state) => state.organization);

  useLayoutEffect(() => {
    if (logoRef.current) {
      setLogoRect(logoRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    checkForUpdate().then((info) => {
      if (!info) return;
      toast.info(`${TEXTS.update.available}. ${TEXTS.update.action}`, {
        autoClose: false,
        closeOnClick: false,
        onClick: () => open(info.url),
      });
    });
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {loading && (
        <Loader targetRect={logoRect} onDone={() => setLoading(false)} />
      )}

      <nav className="flex border-b-2 border-gray-200 bg-white px-3 items-center gap-1 pt-7">
        <BearIcon
          size={44}
          active={!loading}
          className="select-none pointer-events-none"
          style={{
            opacity: loading ? 0 : 1,
            transition: "opacity 0.15s ease",
            position: "relative",
            zIndex: 20,
          }}
        />
        <img
          ref={logoRef}
          src="/iceberg.svg"
          width={40}
          height={40}
          alt="Iceberg"
          style={{
            opacity: loading ? 0 : 1,
            transition: "opacity 0.15s ease",
            transformOrigin: "bottom center",
            animation: loading
              ? undefined
              : "iceberg-hit 30s ease-in-out infinite",
          }}
        />
      </nav>

      <Header changeCompany={selectOrg} />
      <nav className="flex border-b-2 border-gray-200 bg-white px-3 gap-1">
        {organization &&
          TABS.map(({ id, label }) => (
            <button
              key={id}
              className={tabClass(activeTab, id)}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
      </nav>
      <main className="flex-1 min-h-0 overflow-auto">
        {organization ? (
          TABS.map(
            ({ id, Component }) => activeTab === id && <Component key={id} />,
          )
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            {TEXTS.app.nonCompany}
          </div>
        )}
      </main>

      <ToastContainer hideProgressBar={true} />
    </div>
  );
};
