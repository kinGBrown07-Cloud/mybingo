"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  totalGamesPlayed: number;
  totalWinnings: number;
}

interface Profile {
  id: string;
  email: string;
  username: string;
  coins: number;
  created_at: string;
}

interface Transaction {
  id: string;
  type: string;
  user_id: string;
  amount: number;
  coins_amount: number;
  status: string;
  created_at: string;
}

interface GameSession {
  id: string;
  user_id: string;
  game_type: string;
  bet_amount: number;
  prize: number;
  use_coins: boolean;
  created_at: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalGamesPlayed: 0,
    totalWinnings: 0
  });

  const [users, setUsers] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [games, setGames] = useState<GameSession[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState({
    userId: '',
    amount: 0,
    note: ''
  });

  const { user } = useUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/admin/transactions');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      }
    };

    const fetchGames = async () => {
      try {
        const response = await fetch('/api/admin/games');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching games:', error);
        toast({
          title: "Error",
          description: "Failed to load games",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchStats();
      fetchUsers();
      fetchTransactions();
      fetchGames();
    }
  }, [user]);

  const handleAddPoints = async () => {
    try {
      const response = await fetch('/api/admin/add-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pointsToAdd),
      });
      if (!response.ok) {
        throw new Error('Failed to add points');
      }
      toast({
        title: "Success",
        description: "Points added successfully",
      });
      setShowPointsDialog(false);
    } catch (error) {
      console.error('Error adding points:', error);
      toast({
        title: "Error",
        description: "Failed to add points",
        variant: "destructive",
      });
    }
  };

  const handleUserSelect = (user: Profile) => {
    setSelectedUser(user);
    setPointsToAdd(prev => ({ ...prev, userId: user.id }));
    setShowPointsDialog(true);
  };

  if (!user) {
    return <div>Unauthorized access</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-sm text-muted-foreground">
              Active: {stats.activeUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-sm text-muted-foreground">
              Revenue: ${stats.totalRevenue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGamesPlayed}</div>
            <p className="text-sm text-muted-foreground">
              Total Winnings: ${stats.totalWinnings}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserSelect(user)}
                        >
                          Add Points
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{users.find(u => u.id === tx.user_id)?.username}</TableCell>
                      <TableCell>${tx.amount}</TableCell>
                      <TableCell>{tx.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Game Type</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>{new Date(game.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{users.find(u => u.id === game.user_id)?.username}</TableCell>
                      <TableCell>{game.game_type}</TableCell>
                      <TableCell>{game.prize || 0}€</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Points</DialogTitle>
            <DialogDescription>
              Add points to {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={pointsToAdd.amount}
                onChange={(e) => setPointsToAdd(prev => ({ ...prev, amount: Number(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Input
                id="note"
                className="col-span-3"
                value={pointsToAdd.note}
                onChange={(e) => setPointsToAdd(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPointsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPoints}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
