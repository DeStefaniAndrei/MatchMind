'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const handleClick = () => {
    alert('Button clicked!');
    console.log('Test button clicked');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Test Page</h1>
      <p className="mb-4">This is a test page to verify the admin route is working.</p>
      <Button onClick={handleClick}>
        Test Button
      </Button>
    </div>
  );
} 