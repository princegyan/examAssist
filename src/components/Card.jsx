import React from 'react';

export default function Card({ title, description, actionText, onAction }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-salient-blue text-white rounded hover:bg-salient-pink"
      >
        {actionText}
      </button>
    </div>
  );
}