import React from 'react';

/* ─── Tabs container ─── */
interface TabsProps {
  id?: string;
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> & { Tab: typeof Tab } = ({
  id,
  activeKey,
  onSelect,
  className = '',
  children,
}) => {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> => React.isValidElement(child),
  );

  return (
    <div id={id} className={className}>
      {/* Tab navigation */}
      <div className="flex border-b border-slate-200 gap-1">
        {tabs.map((tab) => {
          const isActive = tab.props.eventKey === activeKey;
          return (
            <button
              key={tab.props.eventKey}
              onClick={() => onSelect(tab.props.eventKey)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer inline-flex items-center gap-1.5 ${
                isActive
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.props.title}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      {tabs.map((tab) =>
        tab.props.eventKey === activeKey ? (
          <div key={tab.props.eventKey}>{tab.props.children}</div>
        ) : null,
      )}
    </div>
  );
};

/* ─── Single Tab (only used declaratively) ─── */
interface TabProps {
  eventKey: string;
  title: React.ReactNode;
  children: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

Tabs.Tab = Tab;

export default Tabs;
