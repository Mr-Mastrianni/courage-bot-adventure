import React from 'react';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
}

interface JournalEntriesProps {
  entries: JournalEntry[];
}

const JournalEntries: React.FC<JournalEntriesProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No journal entries to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div key={entry.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">{entry.title}</h3>
            <div className="flex items-center gap-2">
              {entry.mood && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  {entry.mood}
                </span>
              )}
              <span className="text-sm text-gray-500">{entry.date}</span>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-line">{entry.content}</p>
        </div>
      ))}
    </div>
  );
};

export default JournalEntries;
