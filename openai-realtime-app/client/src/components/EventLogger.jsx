import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

export default function EventLogger({ events }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'client') return event.source === 'client';
    if (filter === 'server') return event.source === 'server';
    return true;
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Event Log
        </h3>
        <div className="flex items-center gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-white dark:bg-gray-800 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="client">Client</option>
            <option value="server">Server</option>
          </select>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className={`space-y-1 overflow-auto transition-all ${isExpanded ? 'max-h-96' : 'max-h-32'}`}>
        {filteredEvents.map((event, idx) => (
          <div key={idx} className="text-xs font-mono bg-white dark:bg-gray-800 rounded px-2 py-1">
            <span className={`font-semibold ${event.source === 'client' ? 'text-blue-500' : 'text-green-500'}`}>
              [{event.source}]
            </span>
            <span className="text-gray-500 ml-2">{event.type}</span>
            {event.data && (
              <pre className="text-xs mt-1 text-gray-600 dark:text-gray-400 overflow-x-auto">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}