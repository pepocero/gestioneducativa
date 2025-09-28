import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('🛡️ Middleware ejecutándose para:', req.nextUrl.pathname)
  
  // Por ahora, vamos a deshabilitar la protección de rutas temporalmente
  // para que puedas acceder al dashboard y probar la funcionalidad
  
  // La página principal (/) ahora muestra la landing page, no redirige al login
  // Solo redirigimos rutas protegidas si es necesario

  console.log('✅ Middleware completado')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}