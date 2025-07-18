import { NextRequest, NextResponse } from 'next/server';

// Add debug logging
console.log('API route loaded');

export async function GET() {
  return NextResponse.json({ message: 'PDF parse API endpoint is working' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Check file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 25MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Processing PDF file:', file.name, 'Size:', file.size, 'bytes');

    // Dynamically import pdf-parse to avoid loading issues
    const pdfParse = await import('pdf-parse');
    
    // Parse PDF
    const data = await pdfParse.default(buffer);

    console.log('PDF parsed successfully, pages:', data.numpages);
    console.log('Extracted text length:', data.text.length);

    if (!data.text || data.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No readable text found in PDF. The PDF might be image-based, scanned, or encrypted.' },
        { status: 400 }
      );
    }

    // Clean up the extracted text
    const cleanedText = data.text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    return NextResponse.json({
      text: cleanedText,
      pages: data.numpages,
      info: data.info
    });

  } catch (error) {
    console.error('PDF parsing error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `PDF processing failed: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'PDF processing failed: Unknown error. The PDF might be corrupted, password-protected, or contain only images.' },
        { status: 500 }
      );
    }
  }
}