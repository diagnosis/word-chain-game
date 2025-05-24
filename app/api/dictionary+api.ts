import { Platform } from 'react-native';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const word = url.searchParams.get('word');

    if (!word) {
      return new Response('Word parameter is required', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    if (!response.ok) {
      throw new Error('Word not found');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}