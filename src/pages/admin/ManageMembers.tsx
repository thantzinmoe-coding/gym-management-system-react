import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ManageMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load approved members
  useEffect(() => {
    const storedMembers = localStorage.getItem('approvedMembers');
    if (storedMembers) setMembers(JSON.parse(storedMembers));
  }, []);

  // Save members to localStorage
  useEffect(() => {
    localStorage.setItem('approvedMembers', JSON.stringify(members));
  }, [members]);

  const handleSaveEdit = () => {
    if (!selectedMember) return;
    setMembers(members.map(m => m.id === selectedMember.id ? selectedMember : m));
    setIsEditDialogOpen(false);
    toast({ title: "Member updated", description: `${selectedMember.fullName} status updated.` });
  };

  const getStatusBadge = (status: string) => {
    const colors = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-800', expired: 'bg-red-100 text-red-800' };
    return <Badge className={`px-2 py-1 rounded ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
          <p className="text-gray-600">View and manage approved gym members</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white shadow rounded-lg">
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{members.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow rounded-lg">
          <CardHeader>
            <CardTitle>Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{members.filter(m => m.status === 'active').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Member List Table */}
      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>All approved members appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <img
                      src={member.profilePicture || '/placeholder.png'}
                      alt={member.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.packageName}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>{member.joinDate}</TableCell>
                  <TableCell className="flex space-x-2">
                    {/* Edit Action */}
                    <Button size="sm" variant="outline" onClick={() => { setSelectedMember(member); setIsEditDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* View Action */}
                    <Button size="sm" variant="outline" onClick={() => { setSelectedMember(member); setIsViewDialogOpen(true); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {members.length === 0 && <p className="text-center py-4 text-gray-500">No approved members found.</p>}
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg sm:p-6 bg-white rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Member Status</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedMember.profilePicture || '/placeholder.png'}
                  alt={selectedMember.fullName}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{selectedMember.fullName}</p>
                  <p className="text-gray-500 text-sm">{selectedMember.email}</p>
                </div>
              </div>

              <div>
                <label className="text-gray-800 font-medium">Status</label>
                <Select value={selectedMember.status} onValueChange={(value) => setSelectedMember({ ...selectedMember, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="default" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Member Dialog with Full Application Details */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg sm:p-6 bg-white rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Member Application Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-3 text-gray-700">
              <p><strong>Full Name:</strong> {selectedMember.fullName}</p>
              <p><strong>NRC:</strong> {selectedMember.nrc || 'N/A'}</p> {/* ✅ NRC right below Full Name */}
              <p><strong>Email:</strong> {selectedMember.email}</p>
              <p><strong>Phone:</strong> {selectedMember.phone}</p>
              <p><strong>Date of Birth:</strong> {selectedMember.dateOfBirth || 'N/A'}</p>
              <p><strong>Gender:</strong> {selectedMember.gender || 'N/A'}</p>
              <p><strong>Weight (kg):</strong> {selectedMember.weight || 'N/A'}</p>
              <p><strong>Height (cm):</strong> {selectedMember.height || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedMember.address || 'N/A'}</p>
              <p><strong>Fitness Goals:</strong> {selectedMember.fitnessGoals || 'N/A'}</p>
              <p><strong>Package:</strong> {selectedMember.packageName || 'N/A'}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
