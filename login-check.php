<?php
/**
 * OCHRANA CHRÁNĚNÝCH PROJEKTŮ
 * Tento skript kontroluje přihlášení uživatele před povolením přístupu k chráněným projektům
 */

// Spustit session pro správu přihlášení
session_start();

// Konfigurace hesel pro projekty
$projectPasswords = [
    'project3' => 'tools2024',
    'project5' => 'blackjack2024',
    'project6' => 'dropshop2024',
    'project11' => 'krypto2024',
    'project13' => 'secret2024'
];

// Získat požadovaný projekt a soubor
$requestedProject = $_GET['project'] ?? '';
$requestedFile = $_GET['file'] ?? '';

// Kontrola, zda je projekt chráněn
if (!isset($projectPasswords[$requestedProject])) {
    // Projekt není chráněn - povol přístup
    header("Location: /$requestedProject/$requestedFile");
    exit;
}

// Kontrola, zda je uživatel přihlášen k tomuto projektu
$projectAuthKey = $requestedProject . '_auth';
if (!isset($_SESSION[$projectAuthKey]) || $_SESSION[$projectAuthKey] !== true) {
    // Uživatel není přihlášen - přesměruj na přihlašovací stránku
    header("Location: /login-project.php?project=$requestedProject&redirect=" . urlencode("/$requestedProject/$requestedFile"));
    exit;
}

// Uživatel je přihlášen - povol přístup k souboru
$filePath = "./$requestedProject/$requestedFile";
if (file_exists($filePath)) {
    // Načíst a zobrazit soubor
    $content = file_get_contents($filePath);
    
    // Určit MIME typ
    $extension = pathinfo($requestedFile, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'htm' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'xml' => 'application/xml'
    ];
    
    $contentType = $mimeTypes[$extension] ?? 'text/plain';
    
    // Nastavit hlavičky
    header("Content-Type: $contentType; charset=UTF-8");
    header("Cache-Control: no-cache, no-store, must-revalidate");
    header("Pragma: no-cache");
    header("Expires: 0");
    
    // Zobrazit obsah
    echo $content;
} else {
    // Soubor neexistuje - 404 chyba
    http_response_code(404);
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>404 - Soubor nenalezen</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; font-size: 72px; margin-bottom: 20px; }
            .message { color: #7f8c8d; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class='error'>404</div>
        <div class='message'>Požadovaný soubor nebyl nalezen</div>
        <a href='/'>Zpět na hlavní stránku</a>
    </body>
    </html>";
}
?>
