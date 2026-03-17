@echo off
if not exist public\imagenes\barberias mkdir public\imagenes\barberias
copy "C:\Users\karni\.gemini\antigravity\brain\6e69cc38-623b-4ce7-91b7-423b58f53dd9\barber_premium_1773713472715.png" public\imagenes\barberias\premium.png /Y
copy "C:\Users\karni\.gemini\antigravity\brain\6e69cc38-623b-4ce7-91b7-423b58f53dd9\barber_urban_elegant_1773713492575.png" public\imagenes\barberias\urban.png /Y
echo ✅ Copia completada.
