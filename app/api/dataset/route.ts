import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET handler to serve the dataset
export async function GET() {
  try {
    // Try multiple possible paths for the dataset
    const possiblePaths = [
      path.join(process.cwd(), '..', 'data', 'dataset.json'),
      path.join(process.cwd(), 'data', 'dataset.json'),
      path.join(process.cwd(), '..', '..', 'data', 'dataset.json'),
    ];

    let datasetPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        datasetPath = p;
        break;
      }
    }

    if (!datasetPath) {
      return NextResponse.json(
        { error: 'Dataset not found', searchedPaths: possiblePaths },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(datasetPath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading dataset:', error);
    return NextResponse.json(
      { error: 'Failed to load dataset', details: String(error) },
      { status: 500 }
    );
  }
}
