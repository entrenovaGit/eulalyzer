import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      // Temporarily disable PDF support to focus on core functionality
      return Response.json({ 
        error: 'PDF support is temporarily disabled. Please convert your PDF to .txt or .docx format.' 
      }, { status: 400 });
    }

    return Response.json({ error: 'Unsupported file type for server-side extraction' }, { status: 400 });

  } catch (error) {
    console.error('File extraction error:', error);
    return Response.json({ 
      error: 'Failed to process file. Please try again.' 
    }, { status: 500 });
  }
}