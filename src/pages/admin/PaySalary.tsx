import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Calendar, Check, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaySalary() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [employees, setEmployees] = useState([
    { 
      id: 1, 
      name: 'Alex Johnson', 
      role: 'Trainer',
      baseSalary: 3500,
      bonus: 200,
      deductions: 50,
      netSalary: 3650,
      status: 'Pending',
      lastPaid: '2023-12-15'
    },
    { 
      id: 2, 
      name: 'Maria Garcia', 
      role: 'Trainer',
      baseSalary: 3200,
      bonus: 150,
      deductions: 30,
      netSalary: 3320,
      status: 'Paid',
      lastPaid: '2024-01-15'
    },
    { 
      id: 3, 
      name: 'Chris Wilson', 
      role: 'Trainer',
      baseSalary: 3800,
      bonus: 300,
      deductions: 75,
      netSalary: 4025,
      status: 'Pending',
      lastPaid: '2023-12-15'
    },
    { 
      id: 4, 
      name: 'Sarah Admin', 
      role: 'Administrator',
      baseSalary: 4500,
      bonus: 500,
      deductions: 100,
      netSalary: 4900,
      status: 'Paid',
      lastPaid: '2024-01-15'
    },
    { 
      id: 5, 
      name: 'Mike Receptionist', 
      role: 'Receptionist',
      baseSalary: 2800,
      bonus: 100,
      deductions: 40,
      netSalary: 2860,
      status: 'Pending',
      lastPaid: '2023-12-15'
    },
  ]);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePaySalary = () => {
    if (selectedEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, status: 'Paid', lastPaid: new Date().toISOString().split('T')[0] }
          : emp
      ));
      toast({
        title: "Salary Paid",
        description: `Salary of $${selectedEmployee.netSalary} paid to ${selectedEmployee.name}`,
      });
      setIsPayDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const totalPending = employees.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.netSalary, 0);
  const totalPaid = employees.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.netSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pay Salary</h1>
          <p className="text-muted-foreground">Manage employee salary payments</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2023-12">December 2023</SelectItem>
              <SelectItem value="2023-11">November 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button>Generate Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {employees.filter(e => e.status === 'Pending').length} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {employees.filter(e => e.status === 'Paid').length} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${(totalPending + totalPaid).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Salary Management</CardTitle>
          <CardDescription>Process salary payments for employees</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                    <p className="text-xs text-muted-foreground">Last paid: {employee.lastPaid}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Base</p>
                      <p className="font-medium">${employee.baseSalary}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bonus</p>
                      <p className="font-medium text-green-600">+${employee.bonus}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deductions</p>
                      <p className="font-medium text-red-600">-${employee.deductions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Salary</p>
                      <p className="font-bold text-primary">${employee.netSalary}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={employee.status === 'Paid' ? 'default' : 'destructive'}>
                    {employee.status}
                  </Badge>
                  {employee.status === 'Pending' && (
                    <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          Pay Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Salary Payment</DialogTitle>
                        </DialogHeader>
                        {selectedEmployee && (
                          <div className="space-y-4">
                            <div className="text-center">
                              <h3 className="text-lg font-medium">{selectedEmployee.name}</h3>
                              <p className="text-muted-foreground">{selectedEmployee.role}</p>
                            </div>
                            
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span>Base Salary:</span>
                                <span>${selectedEmployee.baseSalary}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Bonus:</span>
                                <span>+${selectedEmployee.bonus}</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>Deductions:</span>
                                <span>-${selectedEmployee.deductions}</span>
                              </div>
                              <hr />
                              <div className="flex justify-between font-bold text-lg">
                                <span>Net Salary:</span>
                                <span>${selectedEmployee.netSalary}</span>
                              </div>
                            </div>
                            
                            <Button onClick={handlePaySalary} className="w-full">
                              Confirm Payment
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}