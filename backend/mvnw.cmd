@ECHO OFF
SETLOCAL EnableExtensions EnableDelayedExpansion

SET "DIR=%~dp0"
SET "MAVEN_VERSION=3.9.6"
SET "MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
SET "MAVEN_ZIP=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%-bin.zip"
SET "MAVEN_HOME=%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%"

IF NOT EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
    IF NOT EXIST "%USERPROFILE%\.m2\wrapper\dists" (
        mkdir "%USERPROFILE%\.m2\wrapper\dists"
    )
    echo Downloading Apache Maven %MAVEN_VERSION%...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip', '%MAVEN_ZIP%'); Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DIR%' -Force; Remove-Item '%MAVEN_ZIP%'"
)

IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
) ELSE (
    echo Error: Failed to find or download Maven.
    exit /b 1
)
