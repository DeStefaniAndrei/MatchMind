'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ContractManagement from './contract-management';
import { MatchManagement } from './match-management';
import { PayoutManagement } from './payout-management';
import { QuestionManagement } from './question-management';
import TestButtons from './test-buttons';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('contracts');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage MatchMind contracts, matches, and payouts
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Spicy Testnet</Badge>
          <Badge variant="secondary">Admin Mode</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <TestButtons />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract Management</CardTitle>
              <CardDescription>
                Deploy and manage smart contracts for PSG matches on the Chiliz blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContractManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Management</CardTitle>
              <CardDescription>
                Monitor and manage PSG matches from SportMonks API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatchManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Management</CardTitle>
              <CardDescription>
                Manage rewards and payouts for successful predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayoutManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Management</CardTitle>
              <CardDescription>
                Configure prediction questions for PSG matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Prediction Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-2xl font-bold">591</p>
                <p className="text-xs text-muted-foreground">PSG Team ID</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-2xl font-bold">88882</p>
                <p className="text-xs text-muted-foreground">Chain ID</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-2xl font-bold">CHZ</p>
                <p className="text-xs text-muted-foreground">Native Token</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
