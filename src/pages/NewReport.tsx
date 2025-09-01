import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '../config'; // Import API_BASE_URL

const NewReport: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shipId, setShipId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [cameraId, setCameraId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    if (!image || !shipId || !timestamp || latitude === '' || longitude === '') {
      setMessage('Please fill all required fields and select an image.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    const metadata = {
      ship_id: shipId,
      timestamp: new Date(timestamp).toISOString(),
      latitude: latitude,
      longitude: longitude,
      camera_id: cameraId || undefined, // Only include if not empty
    };
    formData.append('metadata_json', JSON.stringify(metadata));

    try {
      const response = await fetch(`${API_BASE_URL}/measure`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMessage(`Report generated successfully! Report Path: ${result.report_path}`);
      setIsError(false);
      // Optionally clear form fields
      setImage(null);
      setImagePreview(null);
      setShipId('');
      setTimestamp('');
      setLatitude('');
      setLongitude('');
      setCameraId('');

    } catch (e: any) {
      setMessage(`Failed to generate report: ${e.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create New Ship Draft Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="image">Ship Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Image Preview" className="max-w-full h-auto rounded-md" />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="shipId">Ship ID</Label>
              <Input
                id="shipId"
                type="text"
                placeholder="Enter Ship ID"
                value={shipId}
                onChange={(e) => setShipId(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="timestamp">Timestamp</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 34.0522"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || '')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -118.2437"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || '')}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cameraId">Camera ID (Optional)</Label>
              <Input
                id="cameraId"
                type="text"
                placeholder="Enter Camera ID"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Generating Report...' : 'Generate Report'}
            </Button>

            {message && (
              <div className={`mt-4 p-3 rounded-md text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewReport;