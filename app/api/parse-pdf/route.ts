import { NextRequest, NextResponse } from 'next/server';

// Try pdf-text-reader first, fallback to basic extraction
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Try using pdf-text-reader library first
    const PdfReader = (await import('pdf-text-reader')).default;
    const reader = new PdfReader();
    const pages = await reader.read(buffer);
    
    let extractedText = '';
    for (const page of pages) {
      extractedText += page + '\n';
    }
    
    return extractedText.trim();
  } catch (error) {
    console.log('pdf-text-reader failed, falling back to basic extraction:', error);
    
    // Fallback to basic text extraction
    return extractBasicTextFromPDF(buffer);
  }
}

// Basic fallback text extraction
function extractBasicTextFromPDF(buffer: Buffer): string {
  try {
    const pdfContent = buffer.toString('latin1');
    
    if (!pdfContent.startsWith('%PDF-')) {
      throw new Error('Invalid PDF format');
    }
    
    // Look for simple text patterns - focus on readable content only
    let extractedText = '';
    
    // Extract text in parentheses (most common readable text format)
    const parenthesesPattern = /\(([^)]{10,})\)/g;
    let match;
    while ((match = parenthesesPattern.exec(pdfContent)) !== null) {
      const text = match[1]
        .replace(/\\[nrtbf]/g, ' ')
        .replace(/\\[0-9]{3}/g, '')
        .replace(/\\./g, '')
        .trim();
      
      // Only include text that looks like real sentences
      if (text.length > 10 && /[a-zA-Z].*[a-zA-Z]/.test(text) && text.includes(' ')) {
        extractedText += text + ' ';
      }
    }
    
    // If we didn't get much text, try a broader approach
    if (extractedText.length < 100) {
      // Look for sequences of readable words
      const wordPattern = /\b[A-Z][a-z]+(?:\s+[a-zA-Z]+){3,}\b/g;
      const sentences = pdfContent.match(wordPattern);
      if (sentences) {
        extractedText += sentences.join(' ') + ' ';
      }
    }
    
    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,;:!?'"()\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return extractedText;
  } catch (error) {
    console.error('Basic PDF extraction error:', error);
    throw new Error('Could not extract text from PDF');
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

    // Extract text using hybrid approach
    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: 'No readable text found in PDF. The PDF might be image-based, scanned, encrypted, or have a complex layout that requires specialized PDF parsing tools.' },
        { status: 400 }
      );
    }

    console.log('Successfully extracted text from PDF');
    console.log('Text length:', extractedText.length);

    return NextResponse.json({
      text: extractedText,
      pages: 'unknown',
      info: { 
        method: 'hybrid-pdf-reader',
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