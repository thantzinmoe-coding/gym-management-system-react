import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, Trash2, RefreshCw, Search, Filter, Weight } from 'lucide-react';
import { manageUserService, BackendUser, MemberStatus, Status } from '@/services/manageUserService'; // Ensure MemberStatus and Status are imported
import Cookies from 'js-cookie';

// Type definition for rows displayed in the table, including booking status and derived user status
type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  nrc: string;
  dob: string;
  address: string;
  gender: string;
  weight?: string;
  height: string;
  goal: string;
  role: string; // This will be 'MEMBER' due to our primary fetch filter
  // --- Crucial change: 'status' now reflects booking status ---
  status: 'active' | 'inactive'; // Derived status: 'active' if booked, 'inactive' if not booked (or backend inactive)
  memberStatus: string; // Member's actual booking status (e.g., PENDING, ACTIVE, INACTIVE)
  packageName: string; // From BackendUser.Package
  avatarUrl: string;
  isBooked: boolean; // Internal flag: true if the member has booked a package
};


function useSecureAvatar(url: string | null) {
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    if (!url) return;

    const fetchAvatar = async () => {
      try {
        const token = Cookies.get('token');
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch avatar");

        const blob = await response.blob();
        setAvatar(URL.createObjectURL(blob));
      } catch {
        setAvatar(null);
      }
    };

    fetchAvatar();
  }, [url]);

  return avatar;
}

const SecureAvatar = ({ url, name }: { url: string | null; name: string }) => {
  const avatar = useSecureAvatar(url);


  if (!url) {
    // Show initials if no avatar or fetch failed
    const initials = name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) // limit to 2 letters
      : "U";

    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium border-2 border-gray-300">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
    />
  );
};




export default function ManageUser() {
  const { toast } = useToast();

  // State management
  const [loading, setLoading] = useState(false);
  const [allMembers, setAllMembers] = useState<UserRow[]>([]); // Store all members fetched from getAllUsers (filtered by role='MEMBER')
  const [bookedMemberIds, setBookedMemberIds] = useState<Set<number>>(new Set()); // Store IDs of *members* who have booked
  const [usersToDisplay, setUsersToDisplay] = useState<UserRow[]>([]); // Filtered list for the table rendering
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  // Filters for the table display
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // Filter by the *displayed* user status (Active/Inactive based on booking)
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>('ALL'); // Filter by the member's actual booking status

  // Pagination for the table display (based on allMembers)
  const [currentPage, setCurrentPage] = useState(1); // UI uses 1-based indexing
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Total members fetched from getAllUsers

  // Function to load all necessary data
  const loadData = async (resetPage = false) => {
    setLoading(true);
    try {
      const pageForApi = resetPage ? 1 : currentPage;

      // 1. Fetch all members (filtered by role: 'MEMBER')
      const allMembersResponse = await manageUserService.getAllUsers(
        pageForApi - 1, // 0-based for API
        pageSize,
        keyword.trim() || undefined,
        'MEMBER', // Explicitly filter for MEMBER role
        // Note: We apply the user.status filter client-side now, so we pass undefined here.
        undefined
      );

      // 2. Fetch booked users to identify those who have booked packages.
      // Ensure to filter by role: 'MEMBER' to only consider members who booked.
      const bookedUsersResponse = await manageUserService.getBookedUsers(0, 20); // Fetch a reasonable batch of booked users
      // Process and map all book
      // Build a map of booked user data for quick lookup
      const bookedMap = new Map<number, BackendUser>();
      bookedUsersResponse.data.forEach((b: BackendUser) => {
        bookedMap.set(b.id, b);
      });

      const mappedAllMembers: UserRow[] = allMembersResponse.data.map((user: BackendUser) => {
        const bookedInfo = bookedMap.get(user.id); // Get booking info if exists
        const isBooked = !!bookedInfo;

        return {
          id: user.id,
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          phone: user.phone || 'N/A',
          nrc: user.nrc || 'N/A',
          dob: user.dob || 'N/A',
          address: user.address || 'N/A',
          gender: user.gender || 'N/A',
          weight: user.weight?.toString() || 'N/A',
          height: user.height?.toString() || 'N/A',
          goal: user.goal || 'N/A',
          role: user.role || 'N/A',
          memberStatus: bookedInfo?.memberStatus || 'N/A', // ✅ from booking data
          packageName: bookedInfo?.packageName || 'N/A',       // ✅ from booking data
          avatarUrl: user.avatarUrl || '',
          isBooked: isBooked,                              // ✅ internal flag
          status: isBooked ? 'active' : 'inactive',        // ✅ derived status
        };
      });


      // Create a set of IDs for members who have booked for quick lookup by filter
      const memberBookedIds = new Set<number>(mappedAllMembers
        .filter(member => member.isBooked)
        .map(member => member.id)
      );
      setBookedMemberIds(memberBookedIds); // Store for use in stats calculation and potential future filtering

      setAllMembers(mappedAllMembers); // Store the complete list of members fetched
      setTotalPages(allMembersResponse.meta?.totalPages || 1);
      setTotalItems(allMembersResponse.meta?.totalItems || 0); // Total count of members fetched from getAllUsers

      // Apply client-side filters for the usersToDisplay state
      applyClientSideFilters(mappedAllMembers, keyword, statusFilter, memberStatusFilter);

      if (resetPage) setCurrentPage(1);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load data',
      });
    } finally {
      setLoading(false);
    }
  };


  // Function to apply client-side filters to the 'allMembers' list
  const applyClientSideFilters = (
    members: UserRow[],
    currentKeyword: string,
    currentUserStatus: string, // This filter now applies to the DERIVED status
    currentMemberStatus: string
  ) => {
    let filtered = [...members]; // Start with all members

    // Filter by keyword (name, email, phone)
    if (currentKeyword.trim()) {
      const lowerKeyword = currentKeyword.trim().toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(lowerKeyword) ||
        user.email.toLowerCase().includes(lowerKeyword) ||
        user.phone.toLowerCase().includes(lowerKeyword)
      );
    }

    // Filter by the DERIVED user status (Active/Inactive based on booking)
    if (currentUserStatus !== 'ALL') {
      filtered = filtered.filter(user => user.status === currentUserStatus.toLowerCase());
    }

    // Filter by the member's actual booking status (PENDING, ACTIVE, INACTIVE)
    if (currentMemberStatus !== 'ALL') {
      filtered = filtered.filter(user => user.memberStatus === currentMemberStatus);
    }

    setUsersToDisplay(filtered); // Update the state for the table rendering
  };

  // Effect to load initial data and re-load when pagination changes
  useEffect(() => {
    loadData();
  }, [currentPage]); // Dependency on currentPage for pagination

  // Effect to re-apply client-side filters when filter states or the allMembers list changes
  useEffect(() => {
    // Only re-apply filters if data is not currently being loaded from the API
    // and we have members data to filter.
    if (!loading && allMembers.length > 0) {
      applyClientSideFilters(allMembers, keyword, statusFilter, memberStatusFilter);
    } else if (!loading && allMembers.length === 0 && !keyword && statusFilter === 'ALL' && memberStatusFilter === 'ALL') {
      // If no members and no filters applied, ensure usersToDisplay is empty
      setUsersToDisplay([]);
    }
  }, [keyword, statusFilter, memberStatusFilter, allMembers, loading]); // Dependencies for re-filtering


  // Calculate stats based on 'allMembers' and their 'isBooked' status
  const totalMemberCount = useMemo(() => allMembers.length, [allMembers]);

  // Active Members: members who have booked a package AND whose derived status is 'active'
  const activeMemberCount = useMemo(() => {
    return allMembers.filter(m => m.isBooked && m.status === 'active').length;
  }, [allMembers]);

  const inactiveMemberCount = useMemo(() => {
    return totalMemberCount - activeMemberCount;
  }, [totalMemberCount, activeMemberCount]);


  // Handler for deleting a user
  const handleDeleteUser = async (userId: number, userName: string) => {
    try {
      await manageUserService.deleteUser(userId);
      toast({
        title: 'Success',
        description: `Member ${userName} has been deleted successfully`,
      });
      loadData(true); // Reload data after deletion to reflect changes
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete member',
      });
    }
  };

  // Apply filters by reloading data and resetting to page 1
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page
    loadData(true);    // Load data with reset page flag
  };

  // Reset all filters and reload data
  const resetFilters = () => {
    setKeyword('');
    setStatusFilter('ALL');
    setMemberStatusFilter('ALL');
    setCurrentPage(1);
    loadData(true); // Reload data with reset page flag
  };

  // Status badge component for the DERIVED user status
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge className={`px-2 py-1 rounded-md border ${variants[status] || variants.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
          <p className="text-gray-600 mt-1">View and manage all system members</p>
        </div>
        <Button
          onClick={() => loadData()} // Refresh button
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemberCount}</div>
            <p className="text-xs text-muted-foreground">All registered members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members (Booked)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMemberCount}</div>
            <p className="text-xs text-muted-foreground">Members who have booked a package</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members (Not Booked)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveMemberCount}</div>
            <p className="text-xs text-muted-foreground">Members who have not booked a package</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter members by keyword, user status, and member status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Grid layout for filters */}
            <div className="relative col-span-1 md:col-span-2"> {/* Keyword search input */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search name, email, phone..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()} // Apply filters on Enter key
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All User Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={memberStatusFilter} onValueChange={setMemberStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Member Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Member Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table of Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members List</CardTitle>
          <CardDescription>
            Showing {usersToDisplay.length} of {totalItems} members (Page {currentPage} of {totalPages})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Member Status</TableHead> {/* Member's actual booking status */}
                  <TableHead>Package</TableHead>
                  <TableHead>Booked</TableHead> {/* Visually indicates booking */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersToDisplay.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <SecureAvatar url={user.avatarUrl} name={user.name} />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.memberStatus}</TableCell> {/* Member's actual booking status */}
                    <TableCell>{user.packageName}</TableCell>
                    <TableCell>
                      {/* Display Booked status */}
                      <Badge variant={user.isBooked ? "default" : "outline"} className={user.isBooked ? "bg-green-500 text-white" : ""}>
                        {user.isBooked ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* View Details Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)} // Set selected user for details view
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Member Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="grid grid-cols-2 gap-4 py-4">
                                {/* Left Column Details */}
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-sm">{selectedUser.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-sm">{selectedUser.phone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">NRC</label>
                                    <p className="text-sm">{selectedUser.nrc}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                    <p className="text-sm">{selectedUser.dob}</p>
                                  </div>
                                </div>
                                {/* Right Column Details */}
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Gender</label>
                                    <p className="text-sm">{selectedUser.gender}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Address</label>
                                    <p className="text-sm">{selectedUser.address}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Role</label>
                                    <p className="text-sm">{selectedUser.role}</p> {/* Will show MEMBER */}
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Weight</label>
                                    <p className="text-sm">{selectedUser.weight}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Height</label>
                                    <p className="text-sm">{selectedUser.height}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Goal</label>
                                  <p className="text-sm">{selectedUser.goal}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Delete Member AlertDialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="bg-red-600 hover:bg-red-700" // Red button for delete action
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State: Shown when no users are found after filtering */}
          {!loading && usersToDisplay.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No members found matching your criteria.</p>
            </div>
          )}

          {/* Loading State: Shown while data is being fetched */}
          {loading && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p className="text-gray-500">Loading members...</p>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} ({totalItems} total members)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} // Decrement page, ensure it's at least 1
                  disabled={currentPage <= 1 || loading} // Disable if on first page or loading
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} // Increment page, ensure it's not past totalPages
                  disabled={currentPage >= totalPages || loading} // Disable if on last page or loading
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}