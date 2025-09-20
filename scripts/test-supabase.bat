@echo off
echo 🏗️ CONFIGURANDO SUPABASE PARA MULTI-TENANCY
echo.

echo 🔍 Verificando tabla institutions...
curl -X GET "https://liqxrhrwiasewfvasems.supabase.co/rest/v1/institutions?select=*&limit=1" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTY5NjksImV4cCI6MjA3Mzc3Mjk2OX0.iAP60WkDkxftBLNIAcTWwFmNOsrsZDY2gH9sAGxe6Ss" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTY5NjksImV4cCI6MjA3Mzc3Mjk2OX0.iAP60WkDkxftBLNIAcTWwFmNOsrsZDY2gH9sAGxe6Ss"

echo.
echo 🏫 Creando institución de prueba...
curl -X POST "https://liqxrhrwiasewfvasems.supabase.co/rest/v1/institutions" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTY5NjksImV4cCI6MjA3Mzc3Mjk2OX0.iAP60WkDkxftBLNIAcTWwFmNOsrsZDY2gH9sAGxe6Ss" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTY5NjksImV4cCI6MjA3Mzc3Mjk2OX0.iAP60WkDkxftBLNIAcTWwFmNOsrsZDY2gH9sAGxe6Ss" -H "Content-Type: application/json" -d "{\"name\":\"Universidad Nacional\",\"email\":\"contacto@un.edu\",\"phone\":\"+54 11 1234-5678\",\"address\":\"Av. Principal 123, Ciudad, País\"}"

echo.
echo 📋 Listando todas las instituciones...
curl -X GET "https://liqxrhrwiasewfvasems.supabase.co/rest/v1/institutions?select=*" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTY5NjksImV4cCI6MjA3Mzc3Mjk2OX0.iAP60WkDkxftBLNIAcTWwFmNOsrsZDY2gH9sAGxe6Ss" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXhyaHJ3aWFzZXdmdmFzZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTY5NjksImV4cCI6MjA3Mzc3Mjk2OX0.iAP60WkDkxftBLNIAcTWwFmNOsrsZDY2gH9sAGxe6Ss"

echo.
echo ✅ Configuración completada
pause

