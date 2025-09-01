import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Package } from 'lucide-react';
import { useTrainers } from '@/context/TrainerContext';
import { usePackages } from '@/context/PackageContext';

export default function ManagePackages() {
  const { trainers } = useTrainers();
  const { packages, setPackages } = usePackages();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [step, setStep] = useState<number>(1);

  const [newPackage, setNewPackage] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    type: 'personal',
    trainerId: '',
    startDate: '',
    endDate: ''
  });

  const [schedule, setSchedule] = useState<{ day: string; startTime: string; endTime: string }[]>([]);

  const resetForm = () => {
    setNewPackage({
      name: '',
      price: '',
      duration: '',
      description: '',
      type: 'personal',
      trainerId: '',
      startDate: '',
      endDate: ''
    });
    setSchedule([]);
    setEditingPackage(null);
    setStep(1);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const calculateEndDate = (startDate: string, duration: string) => {
    if (!startDate || !duration) return '';
    const start = new Date(startDate);
    let monthsToAdd = 0;
    switch(duration) {
      case '1 Month': monthsToAdd = 1; break;
      case '3 Months': monthsToAdd = 3; break;
      case '6 Months': monthsToAdd = 6; break;
      case '12 Months': monthsToAdd = 12; break;
    }
    const end = new Date(start);
    end.setMonth(end.getMonth() + monthsToAdd);
    return end.toISOString().split('T')[0];
  };

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.price || !newPackage.duration || !newPackage.trainerId || !newPackage.startDate) {
      alert('Please complete all required fields.');
      return;
    }
    const newId = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
    const trainer = trainers.find((t: any) => String(t.id) === String(newPackage.trainerId));
    const packageData = {
      id: newId,
      ...newPackage,
      price: parseFloat(newPackage.price),
      status: 'Active',
      subscribers: 0,
      trainerName: trainer?.name || '',
      schedule
    };
    setPackages([...packages, packageData]);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdatePackage = () => {
    if (!editingPackage) return;
    if (!newPackage.name || !newPackage.price || !newPackage.duration || !newPackage.trainerId || !newPackage.startDate) {
      alert('Please complete all required fields.');
      return;
    }
    const trainer = trainers.find((t: any) => String(t.id) === String(newPackage.trainerId));
    const updatedPackage = {
      ...editingPackage,
      ...newPackage,
      price: parseFloat(newPackage.price),
      trainerName: trainer?.name || '',
      schedule
    };
    setPackages(packages.map((p: any) => p.id === editingPackage.id ? updatedPackage : p));
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      price: pkg.price?.toString() ?? '',
      duration: pkg.duration ?? '',
      description: pkg.description ?? '',
      type: pkg.type ?? 'personal',
      trainerId: pkg.trainerId ? String(pkg.trainerId) : '',
      startDate: pkg.startDate ?? '',
      endDate: pkg.endDate ?? ''
    });
    setSchedule(pkg.schedule ?? []);
    setStep(1);
    setIsDialogOpen(true);
  };

  const handleRemovePackage = (id: number) => {
    if (!confirm('Remove this package?')) return;
    setPackages(packages.filter((pkg: any) => pkg.id !== id));
  };

  const goToStep2 = () => {
    if (!newPackage.name || !newPackage.price || !newPackage.duration || !newPackage.startDate) {
      alert('Please fill package name, price, duration, and start date.');
      return;
    }
    setStep(2);
  };

  const goToStep3 = () => {
    if (!newPackage.trainerId) {
      alert('Please select a trainer.');
      return;
    }
    setStep(3);
  };

  const toggleDay = (day: string) => {
    if (schedule.some(s => s.day === day)) {
      setSchedule(prev => prev.filter(s => s.day !== day));
    } else {
      setSchedule(prev => [...prev, { day, startTime: '', endTime: '' }]);
    }
  };

  const updateDayTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s));
  };

  const personalPackages = packages.filter((p: any) => p.type === 'personal');
  const groupPackages = packages.filter((p: any) => p.type === 'group');

  return (
    <div className="space-y-6 p-6 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Packages</h1>
          <p className="text-muted-foreground">Create and manage membership packages</p>
        </div>
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Package
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
        <DialogContent className="sm:max-w-2xl sm:p-6 bg-card text-card-foreground rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingPackage ? 'Edit' : 'Add New'} Package</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mt-2 mb-4">
            <StepDot label="1. Package" active={step === 1} />
            <div className="h-px bg-border flex-1" />
            <StepDot label="2. Trainer" active={step === 2} />
            <div className="h-px bg-border flex-1" />
            <StepDot label="3. Schedule" active={step === 3} />
          </div>

          {/* Step 1: Package Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-muted-foreground">Package Type</Label>
                <Select value={newPackage.type} onValueChange={(value) => setNewPackage({ ...newPackage, type: value })}>
                  <SelectTrigger className="bg-input text-foreground border-input">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-input text-foreground border-input">
                    <SelectItem value="personal">Personal Training</SelectItem>
                    <SelectItem value="group">Group Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Package Name</Label>
                <Input value={newPackage.name} onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })} placeholder="Enter package name" className="bg-input text-foreground border-input" />
              </div>
              <div>
                <Label className="text-muted-foreground">Price ($)</Label>
                <Input type="number" step="0.01" value={newPackage.price} onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })} placeholder="Enter price" className="bg-input text-foreground border-input" />
              </div>
              <div>
                <Label className="text-muted-foreground">Start Date</Label>
                <Input type="date" value={newPackage.startDate} onChange={e => {
                  const start = e.target.value;
                  const end = calculateEndDate(start, newPackage.duration);
                  setNewPackage({ ...newPackage, startDate: start, endDate: end });
                }} className="bg-input text-foreground border-input" />
              </div>
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <Input type="date" value={newPackage.endDate} readOnly className="bg-input text-foreground border-input" />
              </div>
              <div>
                <Label className="text-muted-foreground">Duration</Label>
                <Select value={newPackage.duration} onValueChange={(value) => {
                  const end = calculateEndDate(newPackage.startDate, value);
                  setNewPackage({ ...newPackage, duration: value, endDate: end });
                }}>
                  <SelectTrigger className="bg-input text-foreground border-input"><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent className="bg-input text-foreground border-input">
                    <SelectItem value="1 Month">1 Month</SelectItem>
                    <SelectItem value="3 Months">3 Months</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="12 Months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Description</Label>
                <Textarea value={newPackage.description} onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })} placeholder="Enter description" className="bg-input text-foreground border-input" />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                <Button onClick={() => { setIsDialogOpen(false); resetForm(); }} variant="secondary">Cancel</Button>
                <Button onClick={goToStep2} variant="primary">Next</Button>
              </div>
            </div>
          )}

          {/* Step 2: Trainer */}
          {step === 2 && (
            <div className="mt-2">
              <Label className="text-muted-foreground">Select Trainer</Label>
              <Select
                value={newPackage.trainerId}
                onValueChange={(value) => {
                  setNewPackage({ ...newPackage, trainerId: value });
                  setTimeout(() => setStep(3), 150);
                }}
              >
                <SelectTrigger className="bg-input text-foreground border-input"><SelectValue placeholder="Select trainer" /></SelectTrigger>
                <SelectContent className="bg-input text-foreground border-input">
                  {trainers.map((t: any) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-between mt-4">
                <Button onClick={() => setStep(1)} variant="secondary">Back</Button>
                <div className="flex space-x-2">
                  <Button onClick={() => { setIsDialogOpen(false); resetForm(); }} variant="secondary">Cancel</Button>
                  <Button onClick={goToStep3} variant="primary">Next</Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="mt-2">
              <h3 className="font-semibold text-lg mb-2">Edit Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Days</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
                      const isSelected = schedule.some(s => s.day === day);
                      return (
                        <button
                          key={day}
                          className={`px-2 py-1 text-xs rounded ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                          onClick={() => toggleDay(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  {schedule.map(s => (
                    <div key={s.day} className="flex items-center gap-4 mb-2">
                      <span className="w-24 text-sm">{s.day}</span>
                      <Input
                        type="time"
                        value={s.startTime}
                        onChange={e => updateDayTime(s.day, 'startTime', e.target.value)}
                        className="bg-input text-foreground border-input"
                      />
                      <Input
                        type="time"
                        value={s.endTime}
                        onChange={e => updateDayTime(s.day, 'endTime', e.target.value)}
                        className="bg-input text-foreground border-input"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button onClick={() => setStep(2)} variant="secondary">Back</Button>
                <div className="flex space-x-2">
                  <Button onClick={() => { setIsDialogOpen(false); resetForm(); }} variant="secondary">Cancel</Button>
                  <Button onClick={editingPackage ? handleUpdatePackage : handleAddPackage} variant="primary">
                    {editingPackage ? 'Update Package' : 'Save Package'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground shadow-lg border border-border">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Personal Training</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalPackages.length}</div>
            <p className="text-xs text-muted-foreground">Packages</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg border border-border">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Group Sessions</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupPackages.length}</div>
            <p className="text-xs text-muted-foreground">Packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="personal" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Personal Training Packages</TabsTrigger>
          <TabsTrigger value="group" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Group Session Packages</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <PackageList packages={personalPackages} onEdit={handleEditPackage} onRemove={handleRemovePackage} />
        </TabsContent>
        <TabsContent value="group">
          <PackageList packages={groupPackages} onEdit={handleEditPackage} onRemove={handleRemovePackage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// StepDot component
function StepDot({ label, active }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {label.split('.')[0]}
      </div>
      <div className={`text-sm ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label.replace(/^\d\.\s*/, '')}</div>
    </div>
  );
}

// PackageList component
function PackageList({ packages, onEdit, onRemove }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {packages.map((pkg: any) => (
        <div key={pkg.id} className="p-6 bg-card text-card-foreground rounded-xl shadow-lg border border-border hover:scale-105 transform transition-all duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{pkg.name}</h3>
              <p className="text-2xl font-bold">${pkg.price}<span className="text-sm text-muted-foreground">/{pkg.duration}</span></p>
              <p className="text-sm text-muted-foreground mt-1">{pkg.trainerName ? `Trainer: ${pkg.trainerName}` : ''}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(pkg)}><Edit className="h-4 w-4" /></Button>
              <Button variant="destructive" size="sm" onClick={() => onRemove(pkg.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
          <Badge className={`px-2 py-1 text-xs ${pkg.status === 'Active' ? 'bg-green-500 text-white' : 'bg-destructive text-destructive-foreground'}`}>{pkg.status}</Badge>
          {pkg.startDate && pkg.endDate && (
            <p className="text-xs text-muted-foreground mt-1">Duration: {pkg.startDate} → {pkg.endDate}</p>
          )}
          {pkg.schedule && pkg.schedule.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {pkg.schedule.map((s: any) => (
                <p key={s.day}>{s.day}: {s.startTime} - {s.endTime}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}