// File: app/api/dashboard/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from "../../../../sdk/core/config";

async function proxyRequest(
  request: NextRequest,
  method: string,
  path: string
) {
  try {
    console.log(`Dashboard API proxy ${method} called with path:`, path);
    
    // Get query parameters from the original request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Build the target URL with query parameters
    const baseUrl = `${config.dashboard.url}/${path}`;
    const targetUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    console.log('Proxying to:', targetUrl);
    console.log('Query params:', Object.fromEntries(searchParams.entries()));

    // Prepare request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward important headers
    const headersToForward = [
      'authorization',
      'x-api-key',
      'user-agent',
      'accept',
      'accept-language',
      'cookie'
    ];

    headersToForward.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    });

    const requestInit: RequestInit = {
      method,
      headers,
    };

    // Handle request body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        // Check content type to handle different body types
        const contentType = request.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          const body = await request.json();
          console.log('Request body (JSON):', body);
          requestInit.body = JSON.stringify(body);
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          console.log('Request body (FormData):', Object.fromEntries(formData.entries()));
          requestInit.body = formData;
          // Remove Content-Type to let fetch set it with boundary for FormData
          delete headers['Content-Type'];
        } else if (contentType?.includes('text/')) {
          const textBody = await request.text();
          console.log('Request body (Text):', textBody);
          requestInit.body = textBody;
          headers['Content-Type'] = contentType;
        } else {
          // Handle other body types (binary, etc.)
          const arrayBuffer = await request.arrayBuffer();
          console.log('Request body (Binary):', arrayBuffer.byteLength, 'bytes');
          requestInit.body = arrayBuffer;
          if (contentType) {
            headers['Content-Type'] = contentType;
          }
        }
      } catch (error) {
        console.log('No body or failed to parse body:', error);
        // Continue without body
      }
    }
    
    // Make the proxied request
    const response = await fetch(targetUrl, requestInit);

    if (!response.ok) {
      console.error('Dashboard service error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      return NextResponse.json(
        { 
          error: `Dashboard service error: ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    // Handle different response types
    const responseContentType = response.headers.get('content-type');
    
    if (responseContentType?.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', data);
      return NextResponse.json(data);
    } else if (responseContentType?.includes('text/')) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType,
        },
      });
    } else {
      // Handle binary responses (files, images, etc.)
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType || 'application/octet-stream',
        },
      });
    }

  } catch (error) {
    console.error('Dashboard API proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to dashboard service', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, 'GET', path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, 'POST', path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, 'PUT', path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, 'DELETE', path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, 'PATCH', path);
}