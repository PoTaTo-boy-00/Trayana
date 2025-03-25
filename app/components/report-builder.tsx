'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Report } from '@/app/types';

interface ReportBuilderProps {
  onGenerate: (report: Report) => void;
}

export function ReportBuilder({ onGenerate }: ReportBuilderProps) {
  const [reportType, setReportType] = useState<'incident' | 'resource' | 'performance' | 'custom'>('incident');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [title, setTitle] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const metrics = {
    incident: ['Total Alerts', 'Response Time', 'Resolution Rate'],
    resource: ['Utilization Rate', 'Availability', 'Distribution'],
    performance: ['Team Performance', 'System Uptime', 'Efficiency'],
    custom: ['Custom Metric 1', 'Custom Metric 2', 'Custom Metric 3'],
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    const report = {
      id: Date.now().toString(),
      title,
      type: reportType,
      dateRange,
      metrics: {},
      charts: [],
      exportFormat: format,
    };

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(title, 20, 20);
      doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } else {
      const csv = Papa.unparse({
        fields: ['Metric', 'Value'],
        data: selectedMetrics.map(metric => [metric, Math.random() * 100]),
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
      link.click();
    }

    onGenerate(report as Report);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Report Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter report title"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select
            value={reportType}
            onValueChange={(value: any) => setReportType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incident">Incident Report</SelectItem>
              <SelectItem value="resource">Resource Report</SelectItem>
              <SelectItem value="performance">Performance Report</SelectItem>
              <SelectItem value="custom">Custom Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Metrics</label>
          <div className="grid grid-cols-2 gap-2">
            {metrics[reportType].map((metric) => (
              <label key={metric} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMetrics([...selectedMetrics, metric]);
                    } else {
                      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span>{metric}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            className="flex-1"
          >
            Export as PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="flex-1"
          >
            Export as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}