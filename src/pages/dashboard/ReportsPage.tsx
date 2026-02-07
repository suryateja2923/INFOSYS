import React from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { FitnessButton } from '@/components/ui/FitnessButton';
import { FileText, Download, Calendar } from 'lucide-react';

const reports = [
  { id: 1, title: 'Weekly Workout Summary', date: 'Jan 15-22, 2026', type: 'Workout' },
  { id: 2, title: 'Monthly Nutrition Report', date: 'January 2026', type: 'Diet' },
  { id: 3, title: 'Progress Assessment', date: 'Jan 22, 2026', type: 'Overall' },
];

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Download and review your fitness reports
        </p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <FitnessCard key={report.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {report.date}
                  <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                    {report.type}
                  </span>
                </div>
              </div>
            </div>
            <FitnessButton variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Download
            </FitnessButton>
          </FitnessCard>
        ))}
      </div>

      <FitnessCard className="text-center p-8">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-bold mb-2">Generate Custom Report</h3>
        <p className="text-muted-foreground mb-4">
          Create a detailed report for any date range
        </p>
        <FitnessButton>Generate Report</FitnessButton>
      </FitnessCard>
    </div>
  );
};

export default ReportsPage;
