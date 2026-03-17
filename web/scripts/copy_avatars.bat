@echo off
if not exist public\imagenes\avatars mkdir public\imagenes\avatars
copy "C:\Users\karni\.gemini\antigravity\brain\6e69cc38-623b-4ce7-91b7-423b58f53dd9\avatar_artesano_1773717637808.png" public\imagenes\avatars\artesano.png /Y
copy "C:\Users\karni\.gemini\antigravity\brain\6e69cc38-623b-4ce7-91b7-423b58f53dd9\avatar_pro_1773717663589.png" public\imagenes\avatars\pro.png /Y
copy "C:\Users\karni\.gemini\antigravity\brain\6e69cc38-623b-4ce7-91b7-423b58f53dd9\avatar_expert_old_1773717687755.png" public\imagenes\avatars\expert.png /Y
echo ✅ Copia de avatares completada.
