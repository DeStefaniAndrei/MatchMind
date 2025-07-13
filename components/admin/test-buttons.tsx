'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestButtons() {
  const [testMessage, setTestMessage] = useState('');

  const handleTestClick = () => {
    setTestMessage('Button clicked at ' + new Date().toLocaleTimeString());
    console.log('Test button clicked!');
  };

  const handleAsyncTest = async () => {
    setTestMessage('Async test started...');
    console.log('Async test started');
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTestMessage('Async test completed at ' + new Date().toLocaleTimeString());
    console.log('Async test completed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Button Test</CardTitle>
        <CardDescription>
          Test component to verify buttons are working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={handleTestClick}>
            Test Button
          </Button>
          
          <Button onClick={handleAsyncTest} variant="outline">
            Async Test
          </Button>
        </div>
        
        {testMessage && (
          <div className="p-3 bg-green-100 border border-green-300 rounded">
            {testMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 