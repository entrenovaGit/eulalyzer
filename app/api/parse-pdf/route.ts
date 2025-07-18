import { NextRequest, NextResponse } from 'next/server';

// Simple PDF text extraction without external libraries
function extractTextFromPDFBuffer(buffer: Buffer): string {
  try {
    console.log('Starting basic PDF text extraction...');
    
    // Convert buffer to latin1 string to preserve binary data
    const pdfContent = buffer.toString('latin1');
    
    // Check if it's a valid PDF
    if (!pdfContent.startsWith('%PDF-')) {
      throw new Error('Invalid PDF format');
    }
    
    console.log('Valid PDF detected, extracting text...');
    
    // Extract text using multiple patterns
    const textPatterns = [
      // Text in parentheses: (text content)
      /\(([^)]+)\)/g,
      // Text in square brackets: [text content]
      /\[([^\]]+)\]/g,
      // Text after BT (Begin Text) commands
      /BT\s*([^ET]*?)\s*ET/gs,
      // Text in angle brackets: <text content>
      /<([^>]+)>/g
    ];
    
    let extractedText = '';
    
    // Try each pattern
    for (const pattern of textPatterns) {
      const matches = pdfContent.match(pattern);
      if (matches) {
        const patternText = matches
          .map(match => {
            // Clean up the match
            let cleaned = match.replace(/^\(|\)$|^\[|\]$|^<|>$/g, '');
            // Remove PDF control characters
            cleaned = cleaned.replace(/\\[nrtb]/g, ' ');
            // Remove escape sequences
            cleaned = cleaned.replace(/\\[0-9]{3}/g, '');
            // Remove other escape sequences
            cleaned = cleaned.replace(/\\./g, '');
            return cleaned;
          })
          .filter(text => {
            // Filter out very short strings and PDF commands
            return text.length > 2 && 
                   !text.match(/^[0-9\s.]*$/) && // Not just numbers/spaces
                   !text.match(/^[A-Z]{1,3}$/) && // Not short uppercase commands
                   text.includes(' ') || text.length > 10; // Either has spaces or is long
          })
          .join(' ');
        
        if (patternText.length > extractedText.length) {
          extractedText = patternText;
        }
      }
    }
    
    console.log('Raw extracted text length:', extractedText.length);
    
    if (extractedText.length === 0) {
      // Try a more aggressive approach for simple PDFs
      const simpleTextMatches = pdfContent.match(/[a-zA-Z\s]{10,}/g);
      if (simpleTextMatches) {
        extractedText = simpleTextMatches
          .filter(text => text.trim().length > 10)
          .join(' ');
      }
    }
    
    // Clean up the extracted text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    console.log('Final cleaned text length:', cleanedText.length);
    console.log('First 200 chars:', cleanedText.substring(0, 200));
    
    return cleanedText;
    
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw error;
  }
}

export async function GET() {
  return NextResponse.json({ message: 'PDF parse API endpoint is working' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for PDF parsing');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
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

    console.log('Buffer created, size:', buffer.length);

    // Extract text using our custom function
    const extractedText = extractTextFromPDFBuffer(buffer);

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: 'No readable text found in PDF. The PDF might be image-based, scanned, encrypted, or have a complex layout that requires specialized PDF parsing tools.' },
        { status: 400 }
      );
    }

    console.log('Successfully extracted text from PDF');

    return NextResponse.json({
      text: extractedText,
      pages: 'unknown',
      info: { 
        method: 'regex-extraction',
        originalLength: buffer.length,
        extractedLength: extractedText.length
      }
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `PDF processing failed: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'PDF processing failed: Unknown error occurred during text extraction.' },
        { status: 500 }
      );
    }
  }
}