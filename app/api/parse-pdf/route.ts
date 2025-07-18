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

    try {
      console.log('Buffer size:', buffer.length);
      
      // Test if buffer is valid
      if (buffer.length === 0) {
        throw new Error('Empty PDF buffer');
      }
      
      // Check PDF header
      const header = buffer.subarray(0, 4).toString();
      console.log('PDF header:', header);
      
      if (!header.startsWith('%PDF')) {
        throw new Error('Invalid PDF file format - missing PDF header');
      }
      
      console.log('Trying pdf2text library...');
      
      try {
        // Try pdf2text first (simpler library)
        const pdf2text = await import('pdf2text');
        console.log('pdf2text imported successfully');
        
        const text = await pdf2text.default(buffer);
        
        console.log('PDF parsed successfully with pdf2text!');
        console.log('Text length:', text?.length || 0);
        console.log('First 100 chars:', text?.substring(0, 100) || 'No text');

        if (!text || text.trim().length === 0) {
          throw new Error('No text extracted from PDF');
        }

        // Clean up the extracted text
        const cleanedText = text
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\n\s*\n/g, '\n') // Remove empty lines
          .trim();

        return NextResponse.json({
          text: cleanedText,
          pages: 'unknown', // pdf2text doesn't provide page count
          info: { method: 'pdf2text' }
        });
        
      } catch (pdf2textError) {
        console.log('pdf2text failed, trying manual PDF parsing...');
        console.error('pdf2text error:', pdf2textError);
        
        // Fallback: Try to extract basic text manually
        // This is a very basic fallback that looks for readable text in the PDF
        const bufferStr = buffer.toString('latin1');
        
        // Look for text content in PDF (very basic approach)
        const textMatches = bufferStr.match(/\(([^)]+)\)/g);
        
        if (textMatches && textMatches.length > 0) {
          const extractedText = textMatches
            .map(match => match.slice(1, -1)) // Remove parentheses
            .filter(text => text.length > 3) // Filter out very short strings
            .join(' ');
          
          if (extractedText.trim().length > 50) {
            console.log('Basic text extraction successful');
            console.log('Extracted text length:', extractedText.length);
            
            return NextResponse.json({
              text: extractedText.trim(),
              pages: 'unknown',
              info: { method: 'basic-extraction' }
            });
          }
        }
        
        throw new Error('All PDF parsing methods failed');
      }
      
    } catch (pdfError) {
      console.error('PDF parsing specific error:', pdfError);
      throw pdfError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    console.error('General PDF processing error:', error);
    
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