import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom'; // Import Link
import { API_BASE_URL } from '../config'; // Import API_BASE_URL
// Assuming you have a DatePicker component or will add one
// import { DatePicker } from '@/components/ui/date-picker'; 

interface Report {
  id: number;
  ship_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  draft_measurement: number;
  confidence_score: number;
  pdf_path: string;
  image_bytes: string; // Add this line
}

const Home: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>(''); // YYYY-MM-DD
  setLimit;
  totalReports;
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        skip: (page * limit).toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (startDate) params.append('start_date', startDate + 'T00:00:00Z'); // Assuming UTC start of day
      if (endDate) params.append('end_date', endDate + 'T23:59:59Z'); // Assuming UTC end of day

      const response = await fetch(`${API_BASE_URL}/reports?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReports(data);
      // Assuming the API returns total count in headers or a separate field
      // For now, we'll just assume data.length is the total for simplicity or you can adjust
      setTotalReports(data.length); // This needs to be updated if API provides total count
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, limit, search, startDate, endDate]); // Re-fetch when these dependencies change

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page on new search
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setPage(0);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setPage(0);
  };

  const handleDownloadPdf = (pdfPath: string) => {
    // Remove "reports/" prefix if it exists
    //static//tmp/reports/report_1222_20250912230400.pdf
    console.log(pdfPath);
    const cleanedPdfPath = pdfPath.startsWith('/temp/reports') ? pdfPath.substring('/temp/reports/'.length) : pdfPath;
    const fullPath = `${API_BASE_URL}/static/${cleanedPdfPath}`;
    window.open(fullPath, '_blank');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ship Draft Reports</h1>
        <Link to="/new-report">
          <Button className="flex items-center gap-2">
            + New
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex-grow">
          <Label htmlFor="search">Search by Ship ID</Label>
          <Input
            id="search"
            type="text"
            placeholder="Enter Ship ID"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>

      {loading && <p className="text-center">Loading reports...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && reports.length === 0 && <p className="col-span-full text-center">No reports found.</p>}
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.ship_id}</CardTitle>
              <CardDescription>Report ID: {report.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.image_bytes && ( // Conditionally render image if available
                <div className="mb-2">
                  <img
                    src={`data:image/png;base64,${report.image_bytes}`}
                    alt={`Ship ${report.ship_id}`}
                    className="w-full h-auto rounded-md object-cover"
                  />
                </div>
              )}
              <p><strong>Timestamp:</strong> {new Date(report.timestamp).toLocaleString()}</p>
              <p><strong>Location:</strong> Lat {report.latitude}, Lon {report.longitude}</p>
              <p><strong>Draft Measurement:</strong> {report.draft_measurement.toFixed(2)} meters</p>
              <p><strong>Confidence Score:</strong> {(report.confidence_score * 100).toFixed(2)}%</p>
              <Button onClick={() => handleDownloadPdf(report.pdf_path)} className="w-full">
                Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <Button onClick={() => setPage(prev => Math.max(0, prev - 1))} disabled={page === 0}>
          Previous
        </Button>
        <span className="self-center">Page {page + 1}</span>
        <Button onClick={() => setPage(prev => prev + 1)} disabled={reports.length < limit}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Home;
