import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('🛡️ Middleware ejecutándose para:', req.nextUrl.pathname)
  
  // Por ahora, vamos a deshabilitar la protección de rutas temporalmente
  // para que puedas acceder al dashboard y probar la funcionalidad
  
  // Redirigir desde la página principal al login
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  console.log('✅ Middleware completado')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}