'use client';

import { useState } from 'react';

export default function TestImagePage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testModalDirectly = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Test Modal API directly
      const modalUrl = process.env.NEXT_PUBLIC_MODAL_URL || 'https://karanjot-gaidu--sd-demo-modal-generate.modal.run';
      const url = new URL(modalUrl);
      url.searchParams.set('prompt', prompt);
      
      console.log('Testing Modal URL:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'image/jpeg',
        },
      });
      
      console.log('Modal response status:', response.status);
      console.log('Modal response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Modal API error: ${response.status} - ${errorText}`);
      }
      
      const imageBuffer = await response.arrayBuffer();
      console.log('Image buffer size:', imageBuffer.byteLength, 'bytes');
      
      // Convert to base64 for display
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      
      setResult({
        success: true,
        imageUrl: dataUrl,
        bufferSize: imageBuffer.byteLength,
        modalUrl: url.toString()
      });
      
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testOurAPI = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt
        }),
      });
      
      console.log('Our API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Our API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log('Our API response data:', data);
      
      setResult(data);
      
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testSupabase = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/test-supabase');
      
      console.log('Supabase test response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Supabase test error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log('Supabase test response data:', data);
      
      setResult(data);
      
    } catch (err) {
      console.error('Supabase test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Generation Test</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Test Prompt:</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a test prompt..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testModalDirectly}
              disabled={loading || !prompt}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg"
            >
              {loading ? 'Testing...' : 'Test Modal Directly'}
            </button>
            
            <button
              onClick={testOurAPI}
              disabled={loading || !prompt}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg"
            >
              {loading ? 'Testing...' : 'Test Our API'}
            </button>
            
            <button
              onClick={testSupabase}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg"
            >
              {loading ? 'Testing...' : 'Test Supabase'}
            </button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
              <h3 className="font-bold mb-2">Error:</h3>
              <pre className="text-sm">{error}</pre>
            </div>
          )}
          
          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h3 className="font-bold mb-2">Result:</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              </div>
              
              {result.imageUrl && (
                <div>
                  <h3 className="font-bold mb-2">Generated Image:</h3>
                  <img
                    src={result.imageUrl}
                    alt="Generated"
                    className="max-w-md border border-gray-700 rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 