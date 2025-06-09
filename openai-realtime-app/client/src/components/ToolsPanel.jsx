import React from 'react';

export default function ToolsPanel() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
      <h3 className="font-semibold mb-4">Available Tools</h3>
      <div className="space-y-2">
        <div className="text-sm bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
          <div className="font-medium">get_current_time</div>
          <div className="text-xs text-gray-500">Returns the current date and time</div>
        </div>
      </div>
    </div>
  );
}