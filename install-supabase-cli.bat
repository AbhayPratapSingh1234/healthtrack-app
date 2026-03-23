@echo off
REM Download and install Supabase CLI for Windows (standalone)
echo Downloading Supabase CLI...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/supabase/cli/releases/latest/download/supabase_1.203.1_windows_amd64.zip' -OutFile 'supabase.zip'"
powershell -Command "Expand-Archive -Path 'supabase.zip' -DestinationPath '%USERPROFILE%\.supabase'"
powershell -Command "Move-Item -Path '%USERPROFILE%\.supabase\supabase_1.203.1_windows_amd64\supabase.exe' -Destination '$env:APPDATA\npm\supabase.cmd' -Force"
powershell -Command "Remove-Item 'supabase.zip' -Recurse; Remove-Item '%USERPROFILE%\.supabase' -Recurse"
echo Installation complete. Restart terminal and run: supabase --version
pause
