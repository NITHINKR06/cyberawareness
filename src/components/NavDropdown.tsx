import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

interface NavDropdownProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DropdownItem[];
  isActive?: boolean;
  className?: string;
}

export default function NavDropdown({ label, icon: Icon, items, isActive = false, className = "" }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (  
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 group ${className} ${
          isActive 
            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 animate-in fade-in slide-in-from-top-1 duration-200 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-xl overflow-hidden">
            <div className="py-1">
              {items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 group/item"
                  >
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover/item:bg-indigo-500 transition-all duration-200">
                      <ItemIcon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover/item:text-white" />
                    </div>
                    <span className="font-medium text-sm group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
