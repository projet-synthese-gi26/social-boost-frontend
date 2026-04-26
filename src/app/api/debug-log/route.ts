import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, data } = body;
    
    // Couleurs pour le terminal
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      ERROR: '\x1b[31m',   // Rouge
      SUCCESS: '\x1b[32m', // Vert
      WARNING: '\x1b[33m', // Jaune
      RESET: '\x1b[0m'     // Reset
    };
    
    const color = colors[type as keyof typeof colors] || colors.INFO;
    const timestamp = new Date().toISOString();
    
    // Affichage dans le terminal
    console.log('\n' + '='.repeat(80));
    console.log(`${color}[${type}]${colors.RESET} ${timestamp}`);
    console.log(`${color}Message:${colors.RESET} ${message}`);
    
    if (data) {
      console.log(`${color}Données:${colors.RESET}`);
      console.log(JSON.stringify(data, null, 2));
    }
    
    console.log('='.repeat(80) + '\n');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans debug-log API:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du log' },
      { status: 500 }
    );
  }
}