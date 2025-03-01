import React from 'react';

interface Activity {
  id: string;
  name: string;
  date: string;
  category: string;
  notes?: string;
  difficulty: string;
}

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No activities to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{activity.name}</h3>
            <span className="text-sm text-gray-500">{activity.date}</span>
          </div>
          <div className="flex gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
              {activity.category}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
              {activity.difficulty}
            </span>
          </div>
          {activity.notes && (
            <p className="text-sm text-gray-600">{activity.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
