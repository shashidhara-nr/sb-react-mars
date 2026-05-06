import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const cleanBackendUrl = (url: string): string => {
  return url
    .replace(/^https?:\/\//, '') 
    .replace(/\/bolapi\/?$/, ''); 
};

const BACKEND_HOST =  cleanBackendUrl(process.env.NEXT_PUBLIC_API_BASE_URL||'busonlinecitcva.standardbank.co.za') ;
const BACKEND_BASE_PATH = '/bolapi';


const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

async function handleRequest(request: NextRequest, params: { path: string[] }) {
  try {
    const pathArray = params.path || [];
    const pathString = pathArray.join('/');
    const cleanPath = pathString.startsWith('bolapi/') 
      ? pathString.substring('bolapi/'.length) 
      : pathString;
    const searchParams = request.nextUrl.search;
    const fullPath = `${BACKEND_BASE_PATH}/${cleanPath}${searchParams}`;

    const headers: any = {};
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    });

    // Explicitly extract and format cookies from Next.js request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
    }

    const options: any = {
      hostname: BACKEND_HOST,
      port: 443,
      path: fullPath,
      method: request.method,
      headers: headers,
      agent: httpsAgent,
    };

    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      body = await request.text();
      if (body) {
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }
    }

    const response = await makeHttpsRequest(options, body);

    const responseHeaders = new Headers({
      'Content-Type': response.contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    });

    // Handle Set-Cookie headers properly - can be multiple
    if (response.setCookies && response.setCookies.length > 0) {
      response.setCookies.forEach(cookie => {
        responseHeaders.append('Set-Cookie', cookie);
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ 
        error: error.message,
        code: error.code 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Make HTTPS request with custom agent
async function makeHttpsRequest(
  options: any,
  body?: string | null
): Promise<{ status: number; contentType: string; body: string; setCookies: string[] }> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const statusCode = res.statusCode || 200;
        resolve({
          status: statusCode,
          contentType: res.headers['content-type'] || 'application/json',
          body: data,
          setCookies: res.headers['set-cookie'] || [],
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
 