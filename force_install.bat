@echo off
echo Starting manual package installation...
cd frontend
call "C:\Program Files\nodejs\npm.cmd" install @tinymce/tinymce-react js-cookie @types/js-cookie --verbose
echo Installation finished with code %ERRORLEVEL%
dir node_modules\@tinymce /s /b
dir node_modules\js-cookie /s /b
