interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { label: 'Thông tin cơ bản', value: 'basic' },
  { label: 'Mô tả', value: 'description' },
  { label: 'Thông tin bán hàng', value: 'selling' },
  { label: 'Vận chuyển', value: 'shipping' },
  { label: 'Thông tin khác', value: 'other' },
];

export function ProductTabs({ activeTab, setActiveTab }: Props) {
  return (
    <div className="mb-6 border-b flex gap-6 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => setActiveTab(tab.value)}
          className={`px-4 py-3 border-b-2 ${
            activeTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}