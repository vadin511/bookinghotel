"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const ActionDropdown = ({ actions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // Tính toán vị trí menu khi mở
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: buttonRect.bottom + window.scrollY + 8,
        right: window.innerWidth - buttonRect.right - window.scrollX,
      });
    }
  }, [isOpen]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 shadow-sm hover:shadow-md"
      >
        <span>Hành động</span>
        <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[99999] overflow-hidden"
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {actions.map((action, index) => {
              if (action.divider) {
                return <div key={index} className="border-t border-gray-200 my-1" />;
              }

              if (action.hidden) {
                return null;
              }

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (action.onClick && !action.disabled) {
                      action.onClick();
                    }
                    setIsOpen(false);
                  }}
                  disabled={action.disabled}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 flex items-center space-x-2 ${
                    action.disabled
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : action.danger
                      ? "text-red-600 hover:bg-red-50"
                      : action.warning
                      ? "text-amber-600 hover:bg-amber-50"
                      : action.success
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={action.title}
                >
                  {action.icon && (
                    <i className={`${action.icon} text-xs w-4 text-center`}></i>
                  )}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ActionDropdown;

